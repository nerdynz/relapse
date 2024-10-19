package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"image"
	"image/png"
	"io/fs"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/adrg/xdg"
	"github.com/chai2010/webp"
	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
	"github.com/nerdynz/relapse/proto"
	"github.com/progrium/macdriver/macos/coreimage"
	"github.com/progrium/macdriver/macos/vision"
	"github.com/progrium/macdriver/objc"
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

func (srv *server) GetSettings() (*proto.SettingsPlusOptions, error) {
	settings, err := srv.settingsFromFile()
	if err != nil {
		return nil, err
	}
	options := &proto.SettingsOptions{}

	tx, err := srv.db.Begin()
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

func (srv *server) LoadDaySummaries(req *proto.DaySummariesRequest) (*proto.DaySummaries, error) {
	tx, err := srv.db.Begin()
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to begin sql tx %v", err)
	}
	defer tx.Commit()

	summaries := make([]*proto.CaptureDaySummary, 0)
	query := `
	with summary_by_day as (
		select bod, count(*) as total_captures_count, 
		sum(capture_size_bytes) as total_capture_size_bytes 
		from capture
		where bod >= :1 and bod <= :2
		group by bod
	)
	select *, (total_captures_count / 2) as total_captured_minutes from summary_by_day
	`
	rows, err := tx.Query(query, req.BodFrom, req.BodTo)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to select rows %v", err)
	}

	for rows.Next() {
		record := &proto.CaptureDaySummary{}
		err := rows.Scan(&record.Bod, &record.TotalCapturesCount, &record.TotalCaptureSizeBytes, &record.TotalCapturedMinutes)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "Failed to convert to *CaptureDaySummary %v", err)
		}
		summaries = append(summaries, record)
	}
	return &proto.DaySummaries{
		DaySummaries: summaries,
	}, nil
}

func (srv *server) SetSettings(settings *proto.Settings) (*proto.Settings, error) {
	err := srv.settingsToFile(settings)
	if err != nil {
		return nil, err
	}
	srv.settings = settings
	return settings, err
}

func (srv *server) DeleteCapturesForDay(req *proto.DeleteCapturesForDayRequest) (*proto.DeleteCapturesForDayResponse, error) {
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

func (srv *server) LoadCaptureOcr(req *proto.DateRequest) (*proto.OcrFull, error) {
	dt, err := time.Parse(time.RFC3339, req.Dt)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed time.Parse %v", err)
	}

	tx, err := srv.db.Begin()
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to begin sql tx %v", err)
	}
	defer tx.Commit()

	sql := `
	select 
	row_num,
	COALESCE(app_name, '') AS app_name,
	COALESCE(filepath, '') AS filepath,
	COALESCE(fullpath, '') AS fullpath,
	dt,
	bod,
	COALESCE(capture_size_bytes, - 1) AS capture_size_bytes,
	(capture.fullpath is not null) as is_real
	from capture
	WHERE capture.dt = :1
	order by dt desc
	limit 1;
	`

	capture := &proto.Capture{}
	rows, err := tx.Query(sql, dt.Format(time.RFC3339))
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to select rows %v", err)
	}
	for rows.Next() {
		err := rows.Scan(&capture.RowNum, &capture.AppName, &capture.Filepath, &capture.Fullpath, &capture.Dt, &capture.Bod, &capture.CaptureSizeBytes, &capture.IsReal)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "Failed to convert to *Capture %v", err)
		}
	}

	ocrFull := &proto.OcrFull{
		Meta: make([]*proto.OcrMeta, 0),
	}

	if capture.IsReal {
		objc.WithAutoreleasePool(func() {
			// filePath := "./20231128_122700.webp"
			// filePath := "./bla.png"
			file, err := os.Open(capture.Fullpath)
			if err != nil {
				log.Fatal(err)
			}
			defer file.Close()
			// Decode the WebP image
			img, err := webp.Decode(file)
			// img, err := png.Decode(file)
			if err != nil {
				log.Fatal(err)
			}

			var buf bytes.Buffer
			err = png.Encode(&buf, img)
			if err != nil {
				logrus.Fatal("bla 1")
			}

			req := vision.NewRecognizeTextRequest()
			req.SetRecognitionLevel(vision.RequestTextRecognitionLevelAccurate)

			cimg := coreimage.NewImage().InitWithData(buf.Bytes())

			strB := strings.Builder{}

			handler := vision.NewImageRequestHandler()
			handler.InitWithCIImageOptions(cimg, nil)
			if success := handler.PerformRequestsError([]vision.IRequest{req}, nil); success {
				for _, res := range req.Results() {
					obs := vision.RecognizedTextObservationFrom(res.Ptr())
					c := obs.TopCandidates(1)
					for _, txt := range c {
						strB.WriteString(txt.String())
						strB.WriteRune('\n')

						imgWidth := cimg.Extent().Size.Width
						imgHeight := cimg.Extent().Size.Height
						height := obs.BoundingBox().Size.Height * imgHeight
						width := obs.BoundingBox().Size.Width * imgWidth
						x := obs.BoundingBox().Origin.X * imgWidth
						// y := xxx.BoundingBox().Origin.Y * imgHeight
						y := imgHeight*(1-obs.BoundingBox().Origin.Y) - height

						meta := &proto.OcrMeta{
							X:          x,
							Y:          y,
							Height:     height,
							Width:      width,
							Confidence: float64(txt.Confidence()),
							Text:       txt.String(),
						}
						ocrFull.Meta = append(ocrFull.Meta, meta)
					}
					// w, h = bbox.size.width, bbox.size.height
					// x, y = bbox.origin.x, bbox.origin.y
				}
				// res.append((result.text(), result.confidence(), [x, y, w, h]))
			}
			ocrFull.FullText = strB.String()
		})
	}

	return ocrFull, nil
}

func (srv *server) LoadCapturedDay(req *proto.DateRequest) (*proto.CapturedDay, error) {
	dt, err := time.Parse(time.RFC3339, req.Dt)
	if err != nil {
		return nil, err
	}
	tx, err := srv.db.Begin()
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to begin sql tx %v", err)
	}
	defer tx.Commit()

	sql := `
	select 
	row_num,
	COALESCE(app_name, '') AS app_name,
	COALESCE(filepath, '') AS filepath,
	COALESCE(fullpath, '') AS fullpath,
	dt,
	bod,
	COALESCE(capture_size_bytes, - 1) AS capture_size_bytes,
	(capture.fullpath is not null) as is_real
	from capture
	WHERE capture.bod = :1
	order by dt desc;
	`

	captures := make([]*proto.Capture, 0)
	rows, err := tx.Query(sql, dt.Format(time.RFC3339))
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to select rows %v", err)
	}

	dtF := dt.Format(time.RFC3339)
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
		err := rows.Scan(&record.RowNum, &record.AppName, &record.Filepath, &record.Fullpath, &record.Dt, &record.Bod, &record.CaptureSizeBytes, &record.IsReal)
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

	sum, err := srv.LoadDaySummaries(&proto.DaySummariesRequest{
		BodFrom: dt.Format(time.RFC3339),
		BodTo:   dt.Format(time.RFC3339),
	})
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed srv.getDaySummary %v", err)
	}
	if len(sum.DaySummaries) != 1 {
		return nil, status.Errorf(codes.Internal, "Failed srv.getDaySummary %v incorrect amount of days", err)
	}

	return &proto.CapturedDay{
		Bod:      dt.Format(time.RFC3339),
		Captures: caps,
		Summary:  sum.DaySummaries[0],
	}, nil
}

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
		AppName:          screenWindow.AppName,
		RowNum:           int32((captureTime.Unix() - bod.Unix()) / 30),
		Filepath:         filepath,
		Fullpath:         fullpath,
		Dt:               captureTime.Format(time.RFC3339),
		Bod:              bod.Format(time.RFC3339),
		CaptureSizeBytes: int32(stat.Size()),
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

	_, err = tx.NamedExec("INSERT INTO capture (row_num, app_name, filepath, fullpath, dt, bod, capture_size_bytes) VALUES (:row_num,:app_name,:filepath, :fullpath, :dt, :bod, :capture_size_bytes) ON CONFLICT (row_num,dt) do NOTHING", capture)
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

	fullPathIncFile, err := srv.capturer.SaveWebp(fullpath, fileName, img)
	if err != nil {
		return fileName, fullPathIncFile, captureTime, err
	}
	logrus.Infof("Capturing file %s at %s ", fullPathIncFile, captureTime.Format("Mon Jan 2 2006 15:04:05 -0700 MST "))

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
