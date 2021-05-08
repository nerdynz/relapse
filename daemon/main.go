package main

import (
	"context"
	"errors"
	"fmt"
	"image"
	"log"
	"math"
	"net"
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
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

const schema = `
CREATE TABLE IF NOT EXISTS capture (
	capture_id							INTEGER PRIMARY KEY,
	app_name								TEXT DEFAULT '',
	app_path								TEXT DEFAULT '',
	filepath								TEXT DEFAULT '',
	fullpath								TEXT DEFAULT '',
	capture_time_seconds			INTEGER,
	capture_day_time_seconds	INTEGER
);
`

var NSWorkspace_ = NSWorkspace{objc.Get("NSWorkspace")}

var capturePath string
var db *sqlx.DB
var stopChan chan bool
var workspace NSWorkspace

func main() {
	workspace = NSWorkspaceShared()

	viper.SetDefault("capture-path", "./")
	viper.SetDefault("userdata-path", "./")

	pflag.String("capture-path", viper.GetString("capture-path"), "path for database and captures")
	pflag.String("userdata-path", viper.GetString("userdata-path"), "path for database and captures")
	pflag.Parse()

	if err := viper.BindPFlag("capture-path", pflag.Lookup("capture-path")); err != nil {
		logrus.Errorf("Failed to setup binary flag capture-path: %v", err)
		return
	}
	if err := viper.BindPFlag("userdata-path", pflag.Lookup("userdata-path")); err != nil {
		logrus.Errorf("Failed to setup binary flag userdata-path: %v", err)
		return
	}

	capturePath = viper.GetString("capture-path")
	if capturePath == "" {
		capturePath = "./"
	}
	userDataPath := viper.GetString("userdata-path")
	databaseFilePath := userDataPath + "relapse-captures.db"

	var err error
	db, err = sqlx.Connect("sqlite3", databaseFilePath)
	if err != nil {
		logrus.Error("Failed to connect to database", err)
		return
	}
	_, err = db.Exec(schema)
	if err != nil {
		logrus.Error("Failed to create schema", err)
		return
	}
	defer db.Close()

	logrus.Infof("Capture started at %s", time.Now().Format("Mon Jan 2 2006 15:04:05 -0700 MST"))
	logrus.Infof("Capture filepath: %s", capturePath)
	err = startCapturing()
	if err != nil {
		logrus.Error("Failed to start capture", err)
		return
	}

	port := ":3333"

	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalln(err)
	}

	srv := &server{}
	s := grpc.NewServer()
	relapse_proto.RegisterRelapseServer(s, srv)
	logrus.Info("running grpc on port ", port)
	if err := s.Serve(lis); err != nil {
		log.Fatalln(err)
	}
}

func startCapturing() error {

	stopChan = make(chan bool)
	err := doCapture()
	if err != nil {
		logrus.Error(err)
		return err
	}

	go func() {
		for time.Now().Second() != 59 && time.Now().Second() != 29 {
			time.Sleep(time.Second)
		}
		ticker := time.NewTicker(time.Second * 30)

		for {
			select {
			case <-stopChan:
				logrus.Warn("Stopping capture")
				return
			case <-ticker.C:
				err := doCapture()
				if err != nil {
					logrus.Error(err)
					continue
				}
			}
		}
	}()
	return nil
}

type server struct {
	relapse_proto.UnsafeRelapseServer
}

func (srv *server) GetSettings(ctx context.Context, req *relapse_proto.SettingsRequest) (*relapse_proto.Settings, error) {
	return &relapse_proto.Settings{
		Settings: make([]*relapse_proto.Setting, 0),
	}, errors.New("Not implemented yet")
}

func (srv *server) GetSetting(ctx context.Context, req *relapse_proto.Setting) (*relapse_proto.Setting, error) {
	return &relapse_proto.Setting{}, errors.New("Not implemented yet")
}

func (srv *server) SetSetting(ctx context.Context, req *relapse_proto.Setting) (*relapse_proto.Setting, error) {
	return req, errors.New("Not implemented yet")
}

func (srv *server) StartCapture(ctx context.Context, req *relapse_proto.StartRequest) (*relapse_proto.StartResponse, error) {
	err := startCapturing()
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to do initial capture %v", err)
	}
	return &relapse_proto.StartResponse{}, nil
}

func (srv *server) StopCapture(ctx context.Context, req *relapse_proto.StopRequest) (*relapse_proto.StopResponse, error) {
	stopChan <- true
	return &relapse_proto.StopResponse{}, nil
}

func (srv *server) GetCapturesForADay(ctx context.Context, req *relapse_proto.DayRequest) (*relapse_proto.DayResponse, error) {
	if req.CaptureDayTimeSeconds <= 0 {
		return nil, status.Errorf(codes.InvalidArgument, "CaptureDayTimeSeconds is invalid")
	}
	tx, err := db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to begin sql tx %v", err)
	}

	caps := make([]*relapse_proto.Capture, 0)
	rows, err := tx.Query(`select capture_id, app_name, app_path, filepath,fullpath, capture_time_seconds, capture_day_time_seconds from capture where capture_day_time_seconds = :1`, req.CaptureDayTimeSeconds)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to select rows %v", err)
	}

	for rows.Next() {
		record := &relapse_proto.Capture{}
		err := rows.Scan(&record.CaptureID, &record.AppName, &record.WindowTitle, &record.Filepath, &record.Fullpath, &record.CaptureTimeSeconds, &record.CaptureDayTimeSeconds)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "Failed to convert to *Capture %v", err)
		}
		caps = append(caps, record)
	}

	return &relapse_proto.DayResponse{
		CaptureDayTimeSeconds: req.CaptureDayTimeSeconds,
		Captures:              caps,
	}, nil
}

type Capture struct {
	CaptureID             int64  `db:"capture_id"`
	AppName               string `db:"app_name"`
	AppPath               string `db:"app_path"`
	Filepath              string `db:"filepath"`
	Fullpath              string `db:"fullpath"`
	CaptureTimeSeconds    int64  `db:"capture_time_seconds"`
	CaptureDayTimeSeconds int64  `db:"capture_day_time_seconds"`
}

func captureWindowTitle() (appname string, appPath string, err error) {
	appname = ""
	appPath = ""
	// cmd := exec.Command("/usr/bin/osascript", "-e", `

	// global frontApp, frontAppName, windowTitle

	// set windowTitle to ""
	// tell application "System Events"
	// 		set frontApp to first application process whose frontmost is true
	// 		set frontAppName to name of frontApp
	// 		tell process frontAppName
	// 				tell (1st window whose value of attribute "AXMain" is true)
	// 						set windowTitle to value of attribute "AXTitle"
	// 				end tell
	// 		end tell
	// end tell

	// return {frontAppName, windowTitle}

	// `)
	// b, err := cmd.Output()
	// if err != nil {
	// 	return "", "", fmt.Errorf("Unable to call osascript to get window title err: %v", err)
	// }
	// str := string(b)
	// spl := strings.Split(str, ",")

	// if len(spl) == 2 {
	// 	return strings.Trim(spl[0], " "), strings.Trim(spl[1], " "), nil
	// } else if len(spl) == 1 {
	// 	return strings.Trim(spl[0], " "), "", nil
	// }

	res := workspace.ActiveApplication()
	for _, v := range strings.Split(res.String(), "\n") {
		if strings.Contains(v, " = ") {
			split := strings.Split(v, " = ")
			if strings.Contains(split[0], "NSApplicationName") {
				appname = split[1]
				appname = strings.Split(appname, ";")[0]
			}
			logrus.Info(split)
			if strings.Contains(split[0], "NSApplicationPath") {
				appPath = split[1]
				appPath = strings.Split(appPath, ";")[0]
			}
			logrus.Info(split)
		}
	}
	logrus.Info("appname", appname, " appPath ", appPath)
	return appname, appPath, errors.New("Unable to get the app information")
}

func captureImage(capturePath string, captureTime time.Time) (string, string, error) {
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
	err = webp.Encode(file, newImage, &webp.Options{Lossless: false, Quality: 50})
	if err != nil {
		return fileName, fullPathIncFile, err
	}

	// err = jpeg.Encode(file, newImage, &jpeg.Options{
	// 	Quality: 30,
	// })
	// if err != nil {
	// 	return fileName, fullPathIncFile, err
	// }
	return fileName, fullPathIncFile, nil
}

func doCapture() error {
	if !strings.HasSuffix(capturePath, "/") {
		capturePath += "/"
	}
	now := time.Now()
	// seconds := 0
	// if now.Second() > 30 {
	// 	seconds := 30
	// }
	captureTime := time.Date(now.Year(), now.Month(), now.Day(), now.Hour(), now.Minute(), now.Second(), 0, now.Location())
	logrus.Infof("Capturing at %s", captureTime.Format("Mon Jan 2 2006 15:04:05 -0700 MST "))

	filepath, fullPathIncFile, err := captureImage(capturePath, captureTime)
	if err != nil {
		return fmt.Errorf("Capture image failed: %v", err)
	}
	appname, appPath, err := captureWindowTitle()
	// if err != nil { // ignore this err
	// 	return fmt.Errorf("Capture window title failed: %v", err)
	// }

	cap := &Capture{
		AppName:               appname,
		AppPath:               appPath,
		Filepath:              filepath,
		Fullpath:              fullPathIncFile,
		CaptureTimeSeconds:    captureTime.Unix(),
		CaptureDayTimeSeconds: time.Date(captureTime.Year(), captureTime.Month(), captureTime.Day(), 0, 0, 0, 0, captureTime.Location()).Unix(),
	}
	tx, err := db.Beginx()
	if err != nil {
		return fmt.Errorf("DB trans begin failed: %v", err)

	}
	_, err = tx.NamedExec("INSERT INTO capture (app_name, app_path, filepath,fullpath, capture_time_seconds, capture_day_time_seconds) VALUES (:app_name,:app_path,:filepath, :fullpath,:capture_time_seconds,:capture_day_time_seconds)", cap)
	if err != nil {
		return fmt.Errorf("Capture db insert failed : %v", err)
	}
	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("DB trans commit failed: %v", err)
	}
	logrus.Infof("CaptureDayTimeSeconds_" + strconv.FormatInt(cap.CaptureDayTimeSeconds, 10))
	return nil
}

type NSWorkspace struct {
	objc.Object
}

func NSWorkspaceShared() NSWorkspace {
	return NSWorkspace{NSWorkspace_.Send("sharedWorkspace")}
}

func (ws NSWorkspace) ActiveApplication() core.NSDictionary {
	return core.NSDictionary{ws.Send("activeApplication")}
}

type Details struct {
	NSApplicationName              string
	NSApplicationPath              string
	NSApplicationProcessIdentifier int64
}
