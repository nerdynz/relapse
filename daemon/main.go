package main

import (
	"context"
	"errors"
	"fmt"
	"image"
	"image/jpeg"
	"log"
	"math"
	"net"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/kbinani/screenshot"
	_ "github.com/mattn/go-sqlite3"
	"github.com/nerdynz/relapse/daemon/relapse_proto"
	"github.com/nfnt/resize"
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
	window_title						TEXT DEFAULT '',
	filepath								TEXT DEFAULT '',
	fullpath								TEXT DEFAULT '',
	capture_time_seconds			INTEGER,
	capture_day_time_seconds	INTEGER
);
`

var capturePath string
var db *sqlx.DB
var stopChan chan bool

func main() {
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
	databaseFilePath := userDataPath + "relapse.db"

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

	lis, err := net.Listen("tcp", ":3333")
	if err != nil {
		log.Fatalln(err)
	}

	srv := &server{}
	s := grpc.NewServer()
	relapse_proto.RegisterRelapseServer(s, srv)
	logrus.Info("running grpc")

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
	rows, err := tx.Query(`select capture_id, app_name, window_title, filepath,fullpath, capture_time_seconds, capture_day_time_seconds from capture where capture_day_time_seconds = :1`, req.CaptureDayTimeSeconds)
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
	WindowTitle           string `db:"window_title"`
	Filepath              string `db:"filepath"`
	Fullpath              string `db:"fullpath"`
	CaptureTimeSeconds    int64  `db:"capture_time_seconds"`
	CaptureDayTimeSeconds int64  `db:"capture_day_time_seconds"`
}

func captureWindowTitle() (appname string, windowTitle string, err error) {
	cmd := exec.Command("/usr/bin/osascript", "-e", `

	global frontApp, frontAppName, windowTitle

	set windowTitle to ""
	tell application "System Events"
			set frontApp to first application process whose frontmost is true
			set frontAppName to name of frontApp
			tell process frontAppName
					tell (1st window whose value of attribute "AXMain" is true)
							set windowTitle to value of attribute "AXTitle"
					end tell
			end tell
	end tell

	return {frontAppName, windowTitle}
	
	`)
	b, err := cmd.Output()
	if err != nil {
		return "", "", fmt.Errorf("Unable to call osascript to get window title err: %v", err)
	}
	str := string(b)
	spl := strings.Split(str, ",")

	if len(spl) == 2 {
		return strings.Trim(spl[0], " "), strings.Trim(spl[1], " "), nil
	} else if len(spl) == 1 {
		return strings.Trim(spl[0], " "), "", nil
	}
	return "", "", errors.New("Unable to get the app information")
}

func captureImage(capturePath string, captureTime time.Time) (string, string, error) {
	fullpath := filepath.Join(capturePath, "/"+captureTime.Format("2006_Jan_02")+"/")
	fileName := fmt.Sprintf("%s.jpg", captureTime.Format("20060102_150405"))
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
	err = jpeg.Encode(file, newImage, &jpeg.Options{
		Quality: 30,
	})
	if err != nil {
		return fileName, fullPathIncFile, err
	}
	return fileName, fullPathIncFile, nil
}

func doCapture() error {
	if !strings.HasSuffix(capturePath, "/") {
		capturePath += "/"
	}
	captureTime := time.Now()
	logrus.Infof("Capturing at %s", captureTime.Format("Mon Jan 2 2006 15:04:05 -0700 MST "))

	filepath, fullPathIncFile, err := captureImage(capturePath, captureTime)
	if err != nil {
		return fmt.Errorf("Capture image failed: %v", err)
	}
	appname, windowTitle, err := captureWindowTitle()
	// if err != nil { // ignore this err
	// 	return fmt.Errorf("Capture window title failed: %v", err)
	// }

	cap := &Capture{
		AppName:               appname,
		WindowTitle:           windowTitle,
		Filepath:              filepath,
		Fullpath:              fullPathIncFile,
		CaptureTimeSeconds:    captureTime.Unix(),
		CaptureDayTimeSeconds: time.Date(captureTime.Year(), captureTime.Month(), captureTime.Day(), 0, 0, 0, 0, captureTime.Location()).Unix(),
	}
	tx, err := db.Beginx()
	if err != nil {
		return fmt.Errorf("DB trans begin failed: %v", err)

	}
	_, err = tx.NamedExec("INSERT INTO capture (app_name, window_title, filepath,fullpath, capture_time_seconds, capture_day_time_seconds) VALUES (:app_name,:window_title,:filepath, :fullpath,:capture_time_seconds,:capture_day_time_seconds)", cap)
	if err != nil {
		return fmt.Errorf("Capture db insert failed : %v", err)
	}
	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("DB trans commit failed: %v", err)
	}
	return nil
}
