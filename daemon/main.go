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
	_ "github.com/mattn/go-sqlite3"
	"github.com/nerdynz/relapse/daemon/relapse_proto"
	"github.com/nfnt/resize"
	"github.com/progrium/macdriver/core"
	"github.com/progrium/macdriver/objc"
	"github.com/sirupsen/logrus"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
	"golang.org/x/net/http2"
	"google.golang.org/grpc"
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

	// lis, err := net.Listen("tcp", ":3333")
	// if err != nil {
	// 	log.Fatalln(err)
	// }

	srv := &server{}
	logrus.Infof("Capture started at %s", time.Now().Format("Mon Jan 2 2006 15:04:05 -0700 MST"))
	logrus.Infof("Capture filepath: %s", capturePath)
	// if err != nil {
	// 	logrus.Error("Failed to start capture", err)
	// 	return
	// }

	port := ":3333"
	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalln(err)
	}

	srv := NewServer()
	s := grpc.NewServer()
	relapse_proto.RegisterRelapseServer(s, srv)
	logrus.Info("running grpc on port ", port)
	if err := s.Serve(lis); err != nil {
		log.Fatalln(err)
	}
}

func startCapturing(server relapse_proto.Relapse_ListenForCapturesServer) error {
	err := doCapture()
	if err != nil {
		return err
	}

	ticker := time.NewTicker(time.Second * 30)
	for {
		select {
		case <-server.Context().Done():
			logrus.Warn("Stopping capture")
			return nil
		case <-ticker.C:
			err := doCapture()
			if err != nil {
				logrus.Error(err)
				continue
			}

			dayCap, err := getCapturesForADay(server.Context(), Bod(time.Now()).Unix())
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

	hSrv := &http.Server{Addr: ":3335", Handler: }
	log.Printf("Serving on https://0.0.0.0:3335")
	log.Fatal(hSrv.ListenAndServe())
	// n := negroni.New()
	// n.Use(c)
	// // n.UseHandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
	// // 	logrus.Info("hi")
	// // 	if wrappedGrpc.IsGrpcWebRequest(req) {
	// // 		wrappedGrpc.ServeHTTP(rw, req)
	// // 		return
	// // 	}
	// // 	// // Fall back to other servers.
	// // 	// http.DefaultServeMux.ServeHTTP(resp, req)
	// // })
	// n.UseHandler(h2c.NewHandler(handler, h2s))
	// n.Run(":3335")

func NewServer() *server {
	return &server{}
}

// func (streamer *CaptureStreamer) SendCapture(m Capture) {
// 	streamer.subscribers.Range(func(key, v interface{}) bool {
// 		sub, ok := v.(relapse_proto.Relapse_ListenForCapturesServer)
// 		if !ok {
// 			log.Printf("Failed to cast subscriber value: %T", v)
// 			return false
// 		}
// 		logrus.Info("sending something")
// 		err := sub.Send(&relapse_proto.DayResponse{
// 			CaptureDayTimeSeconds: Bod(time.Now()).Unix(),
// 		})
// 		logrus.Info("err", err)
// 		return true
// 	})
// }

func (srv *server) GetSettings(ctx context.Context, req *relapse_proto.SettingsRequest) (*relapse_proto.Settings, error) {
	return &relapse_proto.Settings{
		Settings: make([]*relapse_proto.Setting, 0),
	}, errors.New("Not implemented yet")
}

	// Start the server with TLS, since we are running HTTP/2 it must be
	// run with TLS.
	// Exactly how you would run an HTTP/1.1 server with TLS connection.
	// log.Fatal(hSrv.ListenAndServeTLS("server.crt", "server.key"))
}

func checkOrigin(origin string) bool {
	logrus.Info("origin")
	return true
}

func (srv *server) StartCapture(ctx context.Context, req *relapse_proto.StartRequest) (*relapse_proto.StartResponse, error) {
	// err := startCapturing()
	// if err != nil {
	// 	return nil, status.Errorf(codes.Internal, "Failed to do initial capture %v", err)
	// }
	return &relapse_proto.StartResponse{}, nil
}

func (srv *server) StopCapture(ctx context.Context, req *relapse_proto.StopRequest) (*relapse_proto.StopResponse, error) {
	stopChan <- true
	return &relapse_proto.StopResponse{}, nil
}

func (srv *server) ListenForCaptures(req *relapse_proto.ListenRequest, server relapse_proto.Relapse_ListenForCapturesServer) error {
	return startCapturing(server)
}

func (srv *server) GetCapturesForADay(ctx context.Context, req *relapse_proto.DayRequest) (*relapse_proto.DayResponse, error) {
	return getCapturesForADay(ctx, req.CaptureDayTimeSeconds)
}

func getCapturesForADay(ctx context.Context, captureDayTimeSeconds int64) (*relapse_proto.DayResponse, error) {
	if captureDayTimeSeconds <= 0 {
		return nil, status.Errorf(codes.InvalidArgument, "CaptureDayTimeSeconds is invalid")
	}
	tx, err := db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "Failed to begin sql tx %v", err)
	}
	defer tx.Commit()

	caps := make([]*relapse_proto.Capture, 0)
	rows, err := tx.Query(`select capture_id, app_name, app_path, filepath,fullpath, capture_time_seconds, capture_day_time_seconds from capture where capture_day_time_seconds = :1`, captureDayTimeSeconds)
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
		CaptureDayTimeSeconds: captureDayTimeSeconds,
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
			if strings.Contains(split[0], "NSApplicationPath") {
				appPath = split[1]
				appPath = strings.Split(appPath, ";")[0]
			}
		}
	}
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
	err = webp.Encode(file, newImage, &webp.Options{Lossless: false, Quality: 50, Exact: true})
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

func Bod(t time.Time) time.Time {
	year, month, day := t.Date()
	return time.Date(year, month, day, 0, 0, 0, 0, t.Location())
}
