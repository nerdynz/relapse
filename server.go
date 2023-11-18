package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"image"
	"io/fs"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/adrg/xdg"
	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
	"github.com/nerdynz/relapse/proto"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type server struct {
	capturePath      string
	userDataPath     string
	settingsFilePath string
	db               *sqlx.DB
	settings         *proto.Settings
	capturer         *ScreenCapturer
}

func NewCaptureServer(db *sqlx.DB) *server {
	configFilePath, err := xdg.ConfigFile("relapse/relapse-settings.json")
	if err != nil {
		log.Fatal(err)
	}
	userDataPath := strings.TrimRight(configFilePath, "relapse-settings.json")

	// binPath := "./"
	// if _, err := os.Stat("screeninfo"); err == nil {
	// 	logrus.Info("screeninfo binary exists in the current directory")
	// } else {
	// 	s, err := osext.ExecutableFolder()
	// 	if err != nil {
	// 		logrus.Error("err", err)
	// 	}
	// 	binPath = s
	// }

	// logrus.Info("binPath => ", binPath)
	return &server{
		db:           db,
		capturePath:  userDataPath,
		userDataPath: userDataPath,
		capturer:     &ScreenCapturer{
			// binPath: binPath,
		},
		settingsFilePath: userDataPath + "relapse-settings.json",
	}
}

func (srv *server) GetSettings(ctx context.Context, req *proto.SettingsPlusOptionsRequest) (*proto.SettingsPlusOptions, error) {
	settings, err := srv.settingsFromFile()
	if err != nil {
		return nil, err
	}
	options := &proto.SettingsOptions{}

	tx, err := srv.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to begin sql tx %v", err)
	}
	defer tx.Commit()

	appInfos := make([]*proto.ApplicationInfo, 0)
	rows, err := tx.Query(`
	select app_name from app
	group by app_name
	`)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to select rows %v", err)
	}

	for rows.Next() {
		record := &proto.ApplicationInfo{}
		err := rows.Scan(&record.AppName)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "Failed to convert to *Capture %v", err)
		}
		appInfos = append(appInfos, record)
	}

	options.CapturedApplications = appInfos
	return &proto.SettingsPlusOptions{
		Settings:        settings,
		SettingsOptions: options,
	}, nil
}

func (srv *server) GetDaySummaries(ctx context.Context, req *proto.DaySummariesRequest) (*proto.DaySummaries, error) {
	tx, err := srv.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to begin sql tx %v", err)
	}
	defer tx.Commit()

	summaries := make([]*proto.CaptureDaySummary, 0)
	query := `
	SELECT 
	capture_day_time_seconds >> BROKEN,
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
		record := &proto.CaptureDaySummary{}
		err := rows.Scan(&record.Bod, &record.TotalCapturedTimeSeconds, &record.TotalCapturesForDay, &record.TotalCaptureSizeBytes, &record.IsPurged)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "Failed to convert to *CaptureDaySummary %v", err)
		}
		summaries = append(summaries, record)
	}
	return &proto.DaySummaries{
		DaySummaries: summaries,
	}, nil
}

func (srv *server) getDaySummary(captureDayTimeSeconds int64) (*proto.CaptureDaySummary, error) {
	ctx := context.Background()
	tx, err := srv.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to begin sql tx %v", err)
	}
	defer tx.Commit()

	summaries := make([]*proto.CaptureDaySummary, 0)
	rows, err := tx.Query(`select 
	capture_day_time_seconds  >> BROKEN,
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
		record := &proto.CaptureDaySummary{}
		err := rows.Scan(&record.Bod, &record.TotalCapturedTimeSeconds, &record.TotalCapturesForDay, &record.TotalCaptureSizeBytes, &record.IsPurged)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "Failed to convert to *Capture %v", err)
		}
		summaries = append(summaries, record)
	}

	if len(summaries) > 0 {
		return summaries[0], nil
	}
	// return nil, fmt.Errorf("No summary for capture day %d exists", captureDayTimeSeconds)
	return &proto.CaptureDaySummary{
		Bod: "BROKEN",
	}, nil
}

func (srv *server) SetSettings(ctx context.Context, settings *proto.Settings) (*proto.Settings, error) {
	err := srv.settingsToFile(settings)
	if err != nil {
		return nil, err
	}
	srv.settings = settings
	return settings, err
}

func (srv *server) DeleteCapturesForDay(ctx context.Context, req *proto.DeleteCapturesForDayRequest) (*proto.DeleteCapturesForDayResponse, error) {
	// retainForXDays := srv.CurrentSettings().RetainForXDays
	// daysAgo := time.Duration(retainForXDays*-1) * (time.Hour * 24)
	// timeAgo := Bod(time.Now().Add(daysAgo))
	// caps, err := srv.GetCapturesForADayFromDB(context.Background(), timeAgo.Unix())
	// if err != nil {
	// 	logrus.Error(err)
	// }

	capturePath := srv.capturePath
	resp := &proto.DeleteCapturesForDayResponse{
		CaptureDayTimeSeconds: req.CaptureDayTimeSeconds,
		Deletions:             make([]string, 0),
	}

	rows, err := srv.db.Query(`
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
		tx, err := srv.db.Beginx()
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

func (srv *server) LoadCapturedDay(ctx context.Context, req *proto.DayRequest) (*proto.CapturedDay, error) {
	dt, err := time.Parse(time.RFC3339, req.Dt)
	if err != nil {
		logrus.Info("errrr ", err)
		return nil, err
	}
	logrus.Info("DATE YOU CARE ABOUT ", dt.Format(time.Stamp), " -> ", dt.Unix())
	tx, err := srv.db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to begin sql tx %v", err)
	}
	defer tx.Commit()

	sql := `
	WITH RECURSIVE seconds_cte AS (
		SELECT
			0 AS second,
			DATETIME(:1) as dt,
			1 AS row_num
		UNION ALL
		SELECT
			second + 30,
			DATETIME(dt, '+30 seconds'),
			row_num + 1
		FROM
			seconds_cte
		WHERE
			second + 30 < 86400
	),
	seconds_with_date AS (
		SELECT
			*,
			strftime('%Y-%m-%dT%H:%M:%S', DATETIME(dt, 'localtime')) || PRINTF('%+.2d:%.2d', ROUND((JULIANDAY('now', 'localtime') - JULIANDAY('now')) * 24)) as dt_tz
		FROM
			seconds_cte
	)
	SELECT
		row_num as capture_id, 
		COALESCE(app_name, '') AS app_name,
		COALESCE(app_path, '') AS app_path,
		COALESCE(filepath, '') AS filepath,
		COALESCE(fullpath, '') AS fullpath,
		seconds_with_date.dt_tz,
		:1 as bod,
		COALESCE(capture_size_bytes, - 1) AS capture_size_bytes,
		COALESCE(is_purged, FALSE) AS is_purged,
		(capture.fullpath is not null) as is_real
	FROM
		seconds_with_date
		JOIN capture ON seconds_with_date.dt = DATETIME(capture.dt)
	WHERE capture.bod = :1
	`

	sql = `
	select 
	row_num,
	COALESCE(app_name, '') AS app_name,
	COALESCE(app_path, '') AS app_path,
	COALESCE(filepath, '') AS filepath,
	COALESCE(fullpath, '') AS fullpath,
	dt,
	bod,
	COALESCE(capture_size_bytes, - 1) AS capture_size_bytes,
	COALESCE(is_purged, FALSE) AS is_purged,
	(capture.fullpath is not null) as is_real
	from capture
	WHERE capture.bod = :1
	order by dt desc;
	`

	captures := make([]*proto.Capture, 0)
	rows, err := tx.QueryContext(ctx, sql, dt.Format(time.RFC3339))
	if err != nil {
		logrus.Errorf("errxxx %s", err.Error())
		return nil, status.Errorf(codes.Internal, "Failed to select rows %v", err)
	}

	dtF := dt.Format(time.RFC3339)
	logrus.Info("date sql -> ", dtF)
	caps := make([]*proto.Capture, 0)
	for i := 0; i <= 86400/30; i++ { // 30 second increments
		// fmt.Println(i)
		record := &proto.Capture{}
		record.Bod = dtF
		record.Dt = dt.Add(time.Duration(i) * 30 * time.Second).Format(time.RFC3339)
		record.IsReal = false
		caps = append(caps, record)
	}

	totalRowCount := 0
	actualRowCount := 0
	for rows.Next() {
		record := &proto.Capture{}
		record.IsReal = true
		err := rows.Scan(&record.RowNum, &record.AppName, &record.AppPath, &record.Filepath, &record.Fullpath, &record.Dt, &record.Bod, &record.CaptureSizeBytes, &record.IsPurged, &record.IsReal)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "Failed to convert to *Capture %v", err)
		}
		if len(record.Filepath) > 0 {
			actualRowCount++
		}
		totalRowCount++
		captures = append(captures, record)
		caps[int(record.RowNum)] = record
	}

	// sum, err := srv.getDaySummary(captureDayTimeSeconds)
	// if err != nil {
	// 	return nil, status.Errorf(codes.Internal, "Failed srv.getDaySummary %v", err)
	// }
	logrus.Info("actualRowCount", actualRowCount)
	logrus.Info("totalRowCount", totalRowCount)

	return &proto.CapturedDay{
		Bod:      dt.Format(time.RFC3339),
		Captures: caps,
		// Summary:               sum,
	}, nil

	// return srv.GetCapturesForADayFromDB(ctx, req.CaptureDayTimeSeconds)
}

// func (cap *captureServer) GetCapturesForADayFromDB(ctx context.Context, captureDayTimeSeconds int64) (*proto.CapturedDay, error) {
// 	if captureDayTimeSeconds <= 0 {
// 		return nil, status.Errorf(codes.InvalidArgument, "CaptureDayTimeSeconds is invalid")
// 	}
// 	tx, err := srv.db.BeginTxx(ctx, nil)
// 	if err != nil {
// 		return nil, status.Errorf(codes.Internal, "Failed to begin sql tx %v", err)
// 	}
// 	defer tx.Commit()

// 	caps := make([]*proto.Capture, 0)
// 	rows, err := tx.Query(`select capture_id, app_name, app_path, filepath,fullpath, capture_time_seconds, capture_day_time_seconds, capture_size_bytes, is_purged from capture where capture_day_time_seconds = :1`, captureDayTimeSeconds)
// 	if err != nil {
// 		return nil, status.Errorf(codes.Internal, "Failed to select rows %v", err)
// 	}

// 	for rows.Next() {
// 		record := &proto.Capture{}
// 		err := rows.Scan(&record.CaptureID, &record.AppName, &record.AppPath, &record.Filepath, &record.Fullpath, &record.CaptureTimeSeconds, &record.CaptureDayTimeSeconds, &record.CaptureSizeBytes, &record.IsPurged)
// 		if err != nil {
// 			return nil, status.Errorf(codes.Internal, "Failed to convert to *Capture %v", err)
// 		}
// 		caps = append(caps, record)
// 	}

// 	sum, err := srv.getDaySummary(captureDayTimeSeconds)
// 	if err != nil {
// 		return nil, status.Errorf(codes.Internal, "Failed srv.getDaySummary %v", err)
// 	}
// 	return &proto.CapturedDay{
// 		CaptureDayTimeSeconds: captureDayTimeSeconds,
// 		Captures:              caps,
// 		Summary:               sum,
// 	}, nil
// }

type FullDump struct {
	ImagePath        string            `json:"imagePath"`
	ScreenWindowsRaw string            `json:"screenWindowsRaw"`
	Screens          []image.Rectangle `json:"screens"`
}

func (srv *server) CaptureScreens() (*proto.Capture, error) {
	if _, err := srv.CurrentSettings(); err != nil {
		return nil, err
	}
	screenWindows, err := srv.capturer.GetScreenInfo()
	if err != nil { // ignore this err
		dir, _ := os.Getwd()
		ex, innerErr := os.Executable()
		if innerErr != nil {
			return nil, fmt.Errorf("Capture window title inner err os.Executable: %v [dir %s]", err, dir)
		}
		exPath := filepath.Dir(ex)
		return nil, fmt.Errorf("Capture window title failed: %v [dir %s][exPath %s]", err, dir, exPath)
	}
	if len(screenWindows) == 0 { // ignore this err
		return nil, fmt.Errorf("No screen info captured: %v", err)
	}
	screenWindow := screenWindows[0]

	screens := getScreens()

	img, err := srv.capturer.CaptureImage()
	if err != nil {
		return nil, fmt.Errorf("Capture image failed: %v", err)
	}

	// manage rejections
	gp := NewGlimpsePool(img, screens)
	for _, sw := range screenWindows {
		str := strconv.Itoa(int(sw.Layer))
		str = str + "00"
		layer, err := strconv.Atoi(str)
		if err != nil {
			return nil, err
		}
		gp.AddFromRect(sw.AppName, layer, sw.Bounds.ToRectangle())
	}

	gp.GreyOutFromLabels(srv.settings.Rejections)

	filepath, fullpath, captureTime, err := srv.saveImage(img)
	if err != nil {
		return nil, fmt.Errorf("Save image failed: %v", err)
	}

	// if srv.settings.IsDumping {
	// 	srv.capturer.SaveDump(strings.Replace(fullpath, "webp", "json", 1), fullpath, out, screens, srv.settings.Rejections)
	// }

	stat, err := os.Stat(fullpath)
	if err != nil {
		return nil, err
	}
	// srv.saveImage(capturePath string, captureTime time.Time, img *image.RGBA, bounds image.Rectangle)
	bod := bod(time.Now())
	logrus.Info("ct", captureTime.Unix(), " bod", bod.Unix())

	capture := &proto.Capture{
		AppName: screenWindow.AppName,
		RowNum:  (captureTime.Unix() - bod.Unix()) / 30,
		// AppPath:               appPath,
		Filepath:         filepath,
		Fullpath:         fullpath,
		Dt:               captureTime.Format(time.RFC3339),
		Bod:              bod.Format(time.RFC3339),
		CaptureSizeBytes: stat.Size(),
		IsPurged:         false,
	}

	tx, err := srv.db.Beginx()
	if err != nil {
		return nil, fmt.Errorf("DB trans begin failed: %v", err)
	}

	for _, screenWindow := range screenWindows {
		_, err = tx.NamedExec("INSERT INTO app (app_name) VALUES (:app_name) ON CONFLICT (app_name) do NOTHING", screenWindow)
		if err != nil {
			return nil, fmt.Errorf("app db insert failed : %v", err)
		}
	}

	_, err = tx.NamedExec("INSERT INTO capture (row_num, app_name, app_path, filepath, fullpath, dt, bod, capture_size_bytes, is_purged) VALUES (:row_num,:app_name,:app_path,:filepath, :fullpath, :dt, :bod, :capture_size_bytes, :is_purged) ON CONFLICT (row_num,dt) do NOTHING", capture)
	if err != nil {
		logrus.Errorf("Capture db insert failed: %v", err)
		return nil, fmt.Errorf("Capture db insert failed : %v", err)
	}
	err = tx.Commit()
	if err != nil {
		return nil, fmt.Errorf("DB trans commit failed: %v", err)
	}
	logrus.Infof("CaptureDayTimeSeconds_" + capture.Dt)

	return capture, nil
}

func (srv *server) saveImage(img *image.RGBA) (string, string, time.Time, error) {
	now := time.Now()
	seconds := 0
	if now.Second() > 30 {
		seconds = 30
	}

	localLoc, err := time.LoadLocation("Local")
	if err != nil {
		return "", "", time.Time{}, err
	}

	captureTime := time.Date(now.Year(), now.Month(), now.Day(), now.Hour(), now.Minute(), seconds, 0, localLoc)
	fullpath := filepath.Join(srv.capturePath, "/"+captureTime.Format("2006_Jan_02")+"/")
	fileName := fmt.Sprintf("%s.webp", captureTime.Format("20060102_150405"))

	logrus.Infof("Capturing at %s", captureTime.Format("Mon Jan 2 2006 15:04:05 -0700 MST "))
	fullPathIncFile, err := srv.capturer.SaveWebp(fullpath, fileName, img)
	if err != nil {
		return fileName, fullPathIncFile, captureTime, err
	}

	return fileName, fullPathIncFile, captureTime, nil
}

func bod(t time.Time) time.Time {
	year, month, day := t.Date()
	return time.Date(year, month, day, 0, 0, 0, 0, t.Location())
}

func (srv *server) settingsToFile(settings *proto.Settings) error {
	path := srv.settingsFilePath
	b, err := json.Marshal(settings)
	if err != nil {
		return err
	}
	err = os.WriteFile(path, b, fs.ModePerm)
	if err != nil {
		return err
	}
	return nil
}

func (srv *server) CurrentSettings() (*proto.Settings, error) {
	if srv.settings == nil {
		settings, err := srv.settingsFromFile()
		if err != nil {
			return nil, err
		}
		srv.settings = settings
	}
	return srv.settings, nil
}

func (srv *server) settingsFromFile() (*proto.Settings, error) {
	path := srv.settingsFilePath

	logrus.Info("settingsFilePath", path)
	_, err := os.Stat(path)
	if os.IsNotExist(err) {
		srv.settingsToFile(&proto.Settings{ // default settings
			IsEnabled:      true,
			Rejections:     make([]string, 0),
			RetainForXDays: 30,
		})
	}

	b, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}

	settings := &proto.Settings{}
	err = json.Unmarshal(b, settings)
	if err != nil {
		return nil, err
	}

	return settings, nil
}
