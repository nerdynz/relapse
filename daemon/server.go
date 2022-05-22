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
	"os/exec"
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
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type captureServer struct {
	relapse_proto.UnsafeRelapseServer
	capturePath      string
	userDataPath     string
	binPath          string
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
	binPath := viper.GetString("bin-path")
	if !strings.HasSuffix(binPath, "/") {
		binPath += "/"
	}

	return &captureServer{
		db:               db,
		capturePath:      capturePath,
		userDataPath:     userDataPath,
		binPath:          binPath,
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
	select app_name from app
	group by app_name
	`)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to select rows %v", err)
	}

	for rows.Next() {
		record := &relapse_proto.ApplicationInfo{}
		err := rows.Scan(&record.AppName)
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
				logrus.Errorf("RemoveAll failed %v", err)
				continue
			}

			rowErr = os.RemoveAll(capturePath + "" + deletePath)
			if err != nil {
				logrus.Errorf("RemoveAll failed  %v", err)
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
	screenWindows, err := cap.getScreenInfo()
	if err != nil { // ignore this err
		return fmt.Errorf("Capture window title failed: %v", err)
	}
	if len(screenWindows) == 0 { // ignore this err
		return fmt.Errorf("No screen info captured: %v", err)
	}
	screenWindow := screenWindows[0]

	screens := getScreens()

	// logrus.Info("SCR", screenWindow)

	// // check if the app is not rejected
	// isRejected := false
	// for _, rejection := range cap.CurrentSettings().Rejections {
	// 	if rejection == screenWindow.AppName {
	// 		isRejected = true
	// 	}
	// 	// if rejection == appPath {
	// 	// 	isRejected = true
	// 	// }
	// }

	// if isRejected {
	// 	return fmt.Errorf("Rejected app capture %s", screenWindow.AppName)
	// }

	img, bounds, err := cap.captureImage()
	if err != nil {
		return fmt.Errorf("Capture image failed: %v", err)
	}

	// manage rejections
	gp := NewGlimpsePool(img, screens)
	for _, sw := range screenWindows {
		str := strconv.Itoa(int(sw.Layer))
		str = str + "00"
		layer, _ := strconv.Atoi(str)
		gp.AddFromRect(sw.AppName, layer, sw.Bounds.ToRectangle())
	}

	logrus.Info("cap.CurrentSettings().Rejections", cap.CurrentSettings().Rejections)

	gp.GreyOutFromLabels(cap.CurrentSettings().Rejections)

	// img = gp.Image() // its by reference

	filepath, fullPathIncFile, captureTime, err := cap.saveImage(img, bounds)
	if err != nil {
		return fmt.Errorf("Save image failed: %v", err)
	}

	stat, err := os.Stat(fullPathIncFile)
	if err != nil {
		return err
	}
	// cap.saveImage(capturePath string, captureTime time.Time, img *image.RGBA, bounds image.Rectangle)

	capture := &relapse_proto.Capture{
		AppName: screenWindow.AppName,
		// AppPath:               appPath,
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

	for _, screenWindow := range screenWindows {
		_, err = tx.NamedExec("INSERT INTO app (app_name) VALUES (:app_name) ON CONFLICT (app_name) do NOTHING", screenWindow)
		if err != nil {
			return fmt.Errorf("app db insert failed : %v", err)
		}
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

func (cap *captureServer) getScreenInfo() ([]*ScreenWindow, error) {
	out, err := exec.Command(cap.binPath + "/screeninfo").Output()
	if err != nil {
		return nil, err
	}
	windows := make([]*ScreenWindow, 0)
	err = json.Unmarshal(out, &windows)
	if err != nil {
		return nil, err
	}

	// minX, minY, maxX, maxY := getScreenBounds()

	// screen := image.Rectangle{
	// 	Min: image.Point{
	// 		X: minX,
	// 		Y: minY,
	// 	},
	// 	Max: image.Point{
	// 		X: maxX,
	// 		Y: maxY,
	// 	},
	// }

	// img := image.NewRGBA(screen)
	// r := NewImageRenderer(img)
	// rect := windows[0].Bounds.ToRectangle()
	// r.Rectangle(rect)

	// if err = r.Write(cap.capturePath + "test.png"); err != nil {
	// 	logrus.Error("bugger: ", err.Error())
	// }

	// need to create a bunch of rectangles that relate to the window. [SCREEN 1200x1200 [SPOTIFY 300x600] [CHROME 600x600] [SPOTIFY 300x600]]
	// for _, win := range windows {
	// 	win.Bounds.ToRect()
	// }

	return windows, nil
}

func (cap *captureServer) captureImage() (*image.RGBA, image.Rectangle, error) {
	minX, minY, maxX, maxY := getScreenBounds()
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

	img, err := screenshot.CaptureRect(bounds)
	if err != nil {
		return nil, bounds, err
	}
	return img, bounds, nil
}

func (cap *captureServer) saveImage(img *image.RGBA, bounds image.Rectangle) (string, string, time.Time, error) {
	now := time.Now()
	seconds := 0
	if now.Second() > 30 {
		seconds = 30
	}

	captureTime := time.Date(now.Year(), now.Month(), now.Day(), now.Hour(), now.Minute(), seconds, 0, now.Location())
	logrus.Infof("Capturing at %s", captureTime.Format("Mon Jan 2 2006 15:04:05 -0700 MST "))

	fullpath := filepath.Join(cap.capturePath, "/"+captureTime.Format("2006_Jan_02")+"/")
	fileName := fmt.Sprintf("%s.webp", captureTime.Format("20060102_150405"))
	fullPathIncFile := filepath.Join(fullpath, "/", fileName)

	err := os.MkdirAll(fullpath, os.ModePerm)
	if err != nil {
		return fileName, fullPathIncFile, captureTime, err
	}
	totalWidth := uint(math.Round(math.Abs(float64(bounds.Min.X)) + math.Abs(float64(bounds.Max.X))*0.8))

	newImage := resize.Resize(totalWidth, 0, img, resize.Lanczos3)
	file, err := os.Create(fullPathIncFile)
	if err != nil {
		return fileName, fullPathIncFile, captureTime, err
	}
	defer file.Close()
	// Encode lossless webp
	err = webp.Encode(file, newImage, &webp.Options{Lossless: false, Quality: 40, Exact: true})
	if err != nil {
		return fileName, fullPathIncFile, captureTime, err
	}

	return fileName, fullPathIncFile, captureTime, nil
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

	logrus.Info("settingsFilePath", path)
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
