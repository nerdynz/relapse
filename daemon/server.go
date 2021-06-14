package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"image"
	"io/fs"
	"io/ioutil"
	"math"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/chai2010/webp"
	"github.com/jmoiron/sqlx"
	"github.com/kbinani/screenshot"
	_ "github.com/mattn/go-sqlite3"
	"github.com/nerdynz/relapse/daemon/relapse_proto"
	"github.com/nfnt/resize"
	"github.com/progrium/macdriver/core"
	"github.com/progrium/macdriver/objc"
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

var NSWorkspace_ = nsWorkspace{objc.Get("NSWorkspace")}

type nsWorkspace struct {
	objc.Object
}

func nsWorkspaceShared() nsWorkspace {
	return nsWorkspace{NSWorkspace_.Send("sharedWorkspace")}
}

func (ws nsWorkspace) ActiveApplication() core.NSDictionary {
	return core.NSDictionary{ws.Send("activeApplication")}
}

type captureServer struct {
	relapse_proto.UnsafeRelapseServer
	workspace        nsWorkspace // for capturing mac window information
	capturePath      string
	userDataPath     string
	settingsFilePath string
	db               *sqlx.DB
	settings         *relapse_proto.Settings
}

func NewCaptureServer(db *sqlx.DB) *captureServer {
	capturePath := viper.GetString("capture-path")
	if !strings.HasSuffix(capturePath, "/") {
		capturePath += "/"
	}
	userDataPath := viper.GetString("userdata-path")
	if !strings.HasSuffix(userDataPath, "/") {
		userDataPath += "/"
	}

	return &captureServer{
		db:               db,
		workspace:        nsWorkspaceShared(),
		capturePath:      capturePath,
		userDataPath:     userDataPath,
		settingsFilePath: userDataPath + "relapse-settings.json",
	}
}

func (cap *captureServer) GetSettings(ctx context.Context, req *relapse_proto.SettingsPlusOptionsRequest) (*relapse_proto.SettingsPlusOptions, error) {
	settings, err := cap.settingsFromFile()
	if err != nil {
		return nil, err
	}
	options := &relapse_proto.SettingsOptions{}

	tx, err := cap.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to begin sql tx %v", err)
	}
	defer tx.Commit()

	appInfos := make([]*relapse_proto.ApplicationInfo, 0)
	rows, err := tx.Query(`
	select app_name, app_path from capture
	group by app_name, app_path
	`)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to select rows %v", err)
	}

	for rows.Next() {
		record := &relapse_proto.ApplicationInfo{}
		err := rows.Scan(&record.AppName, &record.AppPath)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "Failed to convert to *Capture %v", err)
		}
		appInfos = append(appInfos, record)
	}

	options.CapturedApplications = appInfos

	return &relapse_proto.SettingsPlusOptions{
		Settings:        settings,
		SettingsOptions: options,
	}, nil
}

func (cap *captureServer) GetDaySummaries(ctx context.Context, req *relapse_proto.DaySummariesRequest) (*relapse_proto.DaySummaries, error) {
	tx, err := cap.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to begin sql tx %v", err)
	}
	defer tx.Commit()

	summaries := make([]*relapse_proto.CaptureDaySummary, 0)
	query := `
	SELECT 
	capture_day_time_seconds,
	total_captured_time_seconds,
	total_captures_for_day,
	case when total_capture_size_bytes is null then 0 else total_capture_size_bytes end as total_capture_size_bytes,
	is_purged
	FROM capture_day_summary 
	WHERE 1=1
`
	if !req.IncludeIsPurged {
		query += " AND is_purged = FALSE"
	}
	if req.CaptureDayTimeSecondsBefore > 0 {
		query += " AND capture_day_time_seconds <= " + strconv.FormatInt(req.CaptureDayTimeSecondsBefore, 10)
	}
	if req.CaptureDayTimeSecondsAfter > 0 {
		query += " AND capture_day_time_seconds >= " + strconv.FormatInt(req.CaptureDayTimeSecondsAfter, 10)
	}
	rows, err := tx.Query(query)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to select rows %v", err)
	}

	for rows.Next() {
		record := &relapse_proto.CaptureDaySummary{}
		err := rows.Scan(&record.CaptureDayTimeSeconds, &record.TotalCapturedTimeSeconds, &record.TotalCapturesForDay, &record.TotalCaptureSizeBytes, &record.IsPurged)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "Failed to convert to *CaptureDaySummary %v", err)
		}
		summaries = append(summaries, record)
	}
	return &relapse_proto.DaySummaries{
		DaySummaries: summaries,
	}, nil
}

func (cap *captureServer) getDaySummary(captureDayTimeSeconds int64) (*relapse_proto.CaptureDaySummary, error) {
	ctx := context.Background()
	tx, err := cap.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to begin sql tx %v", err)
	}
	defer tx.Commit()

	summaries := make([]*relapse_proto.CaptureDaySummary, 0)
	rows, err := tx.Query(`select 
	capture_day_time_seconds,
	total_captured_time_seconds,
	total_captures_for_day,
	case when total_capture_size_bytes is null then 0 else total_capture_size_bytes end as total_capture_size_bytes,
	is_purged
	from capture_day_summary 
	where capture_day_time_seconds = :1`, captureDayTimeSeconds)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to select rows %v", err)
	}

	for rows.Next() {
		record := &relapse_proto.CaptureDaySummary{}
		err := rows.Scan(&record.CaptureDayTimeSeconds, &record.TotalCapturedTimeSeconds, &record.TotalCapturesForDay, &record.TotalCaptureSizeBytes, &record.IsPurged)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "Failed to convert to *Capture %v", err)
		}
		summaries = append(summaries, record)
	}

	if len(summaries) > 0 {
		return summaries[0], nil
	}
	// return nil, fmt.Errorf("No summary for capture day %d exists", captureDayTimeSeconds)
	return &relapse_proto.CaptureDaySummary{
		CaptureDayTimeSeconds: captureDayTimeSeconds,
	}, nil
}

func (cap *captureServer) SetSettings(ctx context.Context, req *relapse_proto.Settings) (*relapse_proto.Settings, error) {
	err := cap.settingsToFile(req)
	if err != nil {
		return nil, err
	}
	return req, err
}

func (cap *captureServer) ListenForCaptures(req *relapse_proto.ListenRequest, server relapse_proto.Relapse_ListenForCapturesServer) error {
	if req.IsPerformingInitialCapture {
		err := cap.captureScreen()
		logrus.Error(err)
	}

	ticker := time.NewTicker(time.Second * 30)
	for {
		select {
		case <-server.Context().Done():
			logrus.Warn("Stopping capture")
			return nil
		case <-ticker.C:
			err := cap.captureScreen()
			if err != nil {
				logrus.Error(err)
				continue
			}

			dayCap, err := cap.GetCapturesForADayFromDB(server.Context(), Bod(time.Now()).Unix())
			if err != nil {
				logrus.Error(err)
				continue
			}

			err = server.Send(dayCap)
			if err != nil {
				logrus.Error(err)
				continue
			}
		}
	}
}

func (cap *captureServer) DeleteCapturesForDay(ctx context.Context, req *relapse_proto.DeleteCapturesForDayRequest) (*relapse_proto.DeleteCapturesForDayResponse, error) {
	// retainForXDays := cap.CurrentSettings().RetainForXDays
	// daysAgo := time.Duration(retainForXDays*-1) * (time.Hour * 24)
	// timeAgo := Bod(time.Now().Add(daysAgo))
	// caps, err := srv.GetCapturesForADayFromDB(context.Background(), timeAgo.Unix())
	// if err != nil {
	// 	logrus.Error(err)
	// }

	capturePath := cap.capturePath
	// folderPath := timeAgo.Format("2006_Jan_02")
	resp := &relapse_proto.DeleteCapturesForDayResponse{
		CaptureDayTimeSeconds: req.CaptureDayTimeSeconds,
		Deletions:             make([]string, 0),
	}

	rows, err := cap.db.Query(`
select replace( fullpath, ('/' || filepath), '' ) as folder_path from capture
where 1=1
and is_purged = FALSE
and capture_day_time_seconds = :1
group by folder_path
		`, req.CaptureDayTimeSeconds)

	if err != nil {
		if sql.ErrNoRows == err {
			return resp, nil
		}
		return nil, fmt.Errorf("folder_path query failed %v", err)
	}

	var rowErr error
	for rows.Next() {
		deletePath := ""
		rowErr = rows.Scan(&deletePath)
		if err != nil {
			logrus.Errorf("DB trans begin failed: %v", err)
			continue
		}

		logrus.Info("deleting from path", capturePath, deletePath)
		if deletePath != "" {
			_, rowErr = os.Stat(capturePath + "" + deletePath)
			if os.IsNotExist(err) {
				logrus.Errorf("RemoveAll failed", err)
				continue
			}

			rowErr = os.RemoveAll(capturePath + "" + deletePath)
			if err != nil {
				logrus.Errorf("RemoveAll failed", err)
				continue
			}
		}
		resp.Deletions = append(resp.Deletions, deletePath)
	}

	if rowErr == nil {
		tx, err := cap.db.Beginx()
		if err != nil {
			return nil, fmt.Errorf("DB trans begin failed: %v", err)
		}
		_, err = tx.Exec("update capture set is_purged = TRUE where capture_day_time_seconds = :1", req.CaptureDayTimeSeconds)
		if err != nil {
			return nil, fmt.Errorf("capture purge flag update failed : %v", err)
		}
		err = tx.Commit()
		if err != nil {
			return nil, fmt.Errorf("DB trans commit failed: %v", err)
		}
	}

	return resp, nil
}

func (cap *captureServer) GetCapturesForADay(ctx context.Context, req *relapse_proto.DayRequest) (*relapse_proto.DayResponse, error) {
	return cap.GetCapturesForADayFromDB(ctx, req.CaptureDayTimeSeconds)
}

func (cap *captureServer) GetCapturesForADayFromDB(ctx context.Context, captureDayTimeSeconds int64) (*relapse_proto.DayResponse, error) {
	if captureDayTimeSeconds <= 0 {
		return nil, status.Errorf(codes.InvalidArgument, "CaptureDayTimeSeconds is invalid")
	}
	tx, err := cap.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to begin sql tx %v", err)
	}
	defer tx.Commit()

	caps := make([]*relapse_proto.Capture, 0)
	rows, err := tx.Query(`select capture_id, app_name, app_path, filepath,fullpath, capture_time_seconds, capture_day_time_seconds, capture_size_bytes, is_purged from capture where capture_day_time_seconds = :1`, captureDayTimeSeconds)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to select rows %v", err)
	}

	for rows.Next() {
		record := &relapse_proto.Capture{}
		err := rows.Scan(&record.CaptureID, &record.AppName, &record.AppPath, &record.Filepath, &record.Fullpath, &record.CaptureTimeSeconds, &record.CaptureDayTimeSeconds, &record.CaptureSizeBytes, &record.IsPurged)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "Failed to convert to *Capture %v", err)
		}
		caps = append(caps, record)
	}

	sum, err := cap.getDaySummary(captureDayTimeSeconds)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed cap.getDaySummary %v", err)
	}
	return &relapse_proto.DayResponse{
		CaptureDayTimeSeconds: captureDayTimeSeconds,
		Captures:              caps,
		Summary:               sum,
	}, nil
}

func (cap *captureServer) captureScreen() error {
	now := time.Now()
	seconds := 0
	if now.Second() > 30 {
		seconds = 30
	}

	appname, appPath, err := cap.captureWindowTitle()
	if err != nil { // ignore this err
		return fmt.Errorf("Capture window title failed: %v", err)
	}

	// check if the app is not rejected
	isRejected := false
	for _, rejection := range cap.CurrentSettings().Rejections {
		if rejection == appname {
			isRejected = true
		}
		if rejection == appPath {
			isRejected = true
		}
	}

	if isRejected {
		return fmt.Errorf("Rejected app capture %s", appname)
	}

	captureTime := time.Date(now.Year(), now.Month(), now.Day(), now.Hour(), now.Minute(), seconds, 0, now.Location())
	logrus.Infof("Capturing at %s", captureTime.Format("Mon Jan 2 2006 15:04:05 -0700 MST "))

	filepath, fullPathIncFile, err := cap.captureImage(cap.capturePath, captureTime)
	if err != nil {
		return fmt.Errorf("Capture image failed: %v", err)
	}

	stat, err := os.Stat(fullPathIncFile)
	if err != nil {
		stat.Size()
	}

	capture := &relapse_proto.Capture{
		AppName:               appname,
		AppPath:               appPath,
		Filepath:              filepath,
		Fullpath:              fullPathIncFile,
		CaptureTimeSeconds:    captureTime.Unix(),
		CaptureDayTimeSeconds: time.Date(captureTime.Year(), captureTime.Month(), captureTime.Day(), 0, 0, 0, 0, captureTime.Location()).Unix(),
		CaptureSizeBytes:      stat.Size(),
		IsPurged:              false,
	}
	tx, err := cap.db.Beginx()
	if err != nil {
		return fmt.Errorf("DB trans begin failed: %v", err)
	}
	_, err = tx.NamedExec("INSERT INTO capture (app_name, app_path, filepath,fullpath, capture_time_seconds, capture_day_time_seconds, capture_size_bytes, is_purged) VALUES (:app_name,:app_path,:filepath, :fullpath,:capture_time_seconds,:capture_day_time_seconds, :capture_size_bytes, :is_purged)", capture)
	if err != nil {
		return fmt.Errorf("Capture db insert failed : %v", err)
	}
	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("DB trans commit failed: %v", err)
	}
	logrus.Infof("CaptureDayTimeSeconds_" + strconv.FormatInt(capture.CaptureDayTimeSeconds, 10))

	return nil
}

func (cap *captureServer) captureWindowTitle() (appname string, appPath string, err error) {
	appname = ""
	appPath = ""
	res := cap.workspace.ActiveApplication()
	for _, v := range strings.Split(res.String(), "\n") {
		if strings.Contains(v, " = ") {
			split := strings.Split(v, " = ")
			if strings.Contains(split[0], "NSApplicationName") {
				appname = split[1]
				appname = strings.Split(appname, ";")[0]
			}
			if strings.Contains(split[0], "NSApplicationPath") {
				appPath = split[1]
				appPath = strings.Split(appPath, ";")[0]
			}
		}
	}

	appname = strings.TrimLeft(appname, "\"")
	appname = strings.TrimRight(appname, "\"")
	appPath = strings.TrimLeft(appPath, "\"")
	appPath = strings.TrimRight(appPath, "\"")
	return appname, appPath, nil
}

func (cap *captureServer) captureImage(capturePath string, captureTime time.Time) (string, string, error) {
	fullpath := filepath.Join(capturePath, "/"+captureTime.Format("2006_Jan_02")+"/")
	fileName := fmt.Sprintf("%s.webp", captureTime.Format("20060102_150405"))
	fullPathIncFile := filepath.Join(fullpath, "/", fileName)

	err := os.MkdirAll(fullpath, os.ModePerm)
	if err != nil {
		return fileName, fullPathIncFile, err
	}

	n := screenshot.NumActiveDisplays()
	minX, minY, maxX, maxY := 0, 0, 0, 0
	for i := 0; i < n; i++ {
		bounds := screenshot.GetDisplayBounds(i)
		if i == 0 {
			minX = bounds.Min.X
			maxX = bounds.Max.X
			minY = bounds.Min.Y
			maxY = bounds.Max.Y
			continue
		}

		if bounds.Min.X < minX {
			minX = bounds.Min.X
		}
		if bounds.Max.X > maxX {
			maxX = bounds.Max.X
		}
		if bounds.Min.Y < minY {
			minY = bounds.Min.Y
		}
		if bounds.Max.Y > maxY {
			maxY = bounds.Max.Y
		}
	}

	bounds := image.Rectangle{
		Min: image.Point{
			X: minX,
			Y: minY,
		},
		Max: image.Point{
			X: maxX,
			Y: maxY,
		},
	}

	totalWidth := uint(math.Round(math.Abs(float64(minX)) + math.Abs(float64(maxX))*0.8))
	img, err := screenshot.CaptureRect(bounds)
	if err != nil {
		return fileName, fullPathIncFile, err
	}
	newImage := resize.Resize(totalWidth, 0, img, resize.Lanczos3)
	file, err := os.Create(fullPathIncFile)
	if err != nil {
		return fileName, fullPathIncFile, err
	}
	defer file.Close()
	// Encode lossless webp
	err = webp.Encode(file, newImage, &webp.Options{Lossless: false, Quality: 50, Exact: true})
	if err != nil {
		return fileName, fullPathIncFile, err
	}

	return fileName, fullPathIncFile, nil
}

type Details struct {
	NSApplicationName              string
	NSApplicationPath              string
	NSApplicationProcessIdentifier int64
}

func Bod(t time.Time) time.Time {
	year, month, day := t.Date()
	return time.Date(year, month, day, 0, 0, 0, 0, t.Location())
}

func (cap *captureServer) settingsToFile(settings *relapse_proto.Settings) error {
	path := cap.settingsFilePath
	b, err := json.Marshal(settings)
	if err != nil {
		return err
	}
	err = ioutil.WriteFile(path, b, fs.ModePerm)
	if err != nil {
		return err
	}
	return nil
}

func (cap *captureServer) CurrentSettings() *relapse_proto.Settings {
	if cap.settings == nil {
		settings, err := cap.settingsFromFile()
		if err != nil {
			return &relapse_proto.Settings{
				IsEnabled:  true,
				Rejections: make([]string, 0),
			}
		}
		cap.settings = settings
	}
	return cap.settings
}

func (cap *captureServer) settingsFromFile() (*relapse_proto.Settings, error) {
	path := cap.settingsFilePath

	_, err := os.Stat(path)
	if os.IsNotExist(err) {
		cap.settingsToFile(&relapse_proto.Settings{ // default settings
			IsEnabled:      true,
			Rejections:     make([]string, 0),
			RetainForXDays: 30,
		})
	}

	b, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}

	settings := &relapse_proto.Settings{}
	err = json.Unmarshal(b, settings)
	if err != nil {
		return nil, err
	}

	return settings, nil
}
