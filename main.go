package main

import (
	"context"
	"embed"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"time"

	"github.com/adrg/xdg"
	"github.com/go-co-op/gocron"
	"github.com/jmoiron/sqlx"
	"github.com/nerdynz/relapse/proto"
	"github.com/r3labs/sse"
	"github.com/rs/cors"
	sloglogrus "github.com/samber/slog-logrus"
	"gopkg.in/natefinch/lumberjack.v2"

	"github.com/sirupsen/logrus"
	"github.com/wailsapp/wails/v3/pkg/application"
	"golang.design/x/clipboard"
	_ "modernc.org/sqlite"
)

//go:embed frontend/dist
var assets embed.FS
var vwSetting *application.WebviewWindow
var app *application.App

func main() {
	relapse := NewApp()

	err := clipboard.Init()
	if err != nil {
		logrus.Errorf("clipboard %v", err)
	}

	relapse.Scheduler.Every(30).Seconds().Do(func() {
		logrus.Info("capturing")
		cap, err := relapse.Capture.CaptureScreens()
		if err != nil {
			logrus.Error(err)
		}

		relapse.Publish("screen-captured", cap)
	})

	// relapse.Scheduler.Every(3).Hour().Do(func() {
	// 	// settings := app.CurrentSettings()
	// 	retainForXDays := 30
	// 	daysAgo := time.Duration(retainForXDays*-1) * (time.Hour * 24)
	// 	timeAgo := Bod(time.Now().Add(daysAgo))
	// 	summary, err := app.LoadCapturedDay(timeAgo.Unix())
	// 	if err != nil {
	// 		logrus.Errorf("GetDaySummaries: %v", err)
	// 	}
	// 	for _, daySummary := range summary.Captures {
	// 		dayDateTime := time.Unix(daySummary.CaptureDayTimeSeconds, 0)
	// 		resp, err := relapse.Capture.DeleteCapturesForDay(dayDateTime.Unix())
	// 		if err != nil {
	// 			logrus.Errorf("DeleteCapturesForDay: task to delete failed %v", err)
	// 		}
	// 		logrus.Infof("Deleted Files for day %s: %v", dayDateTime.Format("02-Jan-2006"), resp.Deletions)
	// 	}
	// })
	go relapse.Start()

	b, err := assets.ReadFile("frontend/dist/appicon.png")
	if err != nil {
		logrus.Fatal("load icon", err)
	}

	app = application.New(application.Options{
		Name:        "Relapse",
		Description: "A demo of using raw HTML & CSS",
		Logger:      relapse.logger,
		Assets: application.AssetOptions{
			FS: assets,
			// Handler: mux,
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: false,
		},
		Icon: b,
	})

	// Create window

	createOrShowMainWindow(app)

	menu := app.NewMenu()

	appMenu := menu.AddSubmenu("Relapse")
	appMenu.AddRole(application.About)
	appMenu.AddSeparator()
	appMenu.Add("Settings...").SetAccelerator("cmdorctrl+,").OnClick(func(ctx *application.Context) {
		createOrShowSettingsWindow(app)
	})
	appMenu.AddSeparator()
	appMenu.AddRole(application.ServicesMenu)
	appMenu.AddSeparator()
	appMenu.AddRole(application.Hide)
	appMenu.AddRole(application.HideOthers)
	appMenu.AddRole(application.UnHide)
	appMenu.AddSeparator()
	// appMenu.AddRole(application.Quit)
	// menu.AddRole(application.AppMenu)

	quitFunc := func(ctx *application.Context) {
		vw := app.GetWindowByName("MainWindow")
		if vw != nil {
			vw.Destroy()
		}
		relapse.Stop()
		// app.Quit()
	}

	appMenu.Add("Quit").SetAccelerator("cmdorctrl+q").OnClick(quitFunc)

	menu.AddRole(application.FileMenu)
	if runtime.GOOS == "darwin" {
		menu.AddRole(application.EditMenu)
		menu.AddRole(application.ViewMenu)
	}

	viewMenu := menu.AddSubmenu("View")
	viewMenu.Add("Zoom In").SetAccelerator("cmdorctrl+=").OnClick(func(ctx *application.Context) {
		relapse.Publish("zoom-function", "in")
	})
	viewMenu.Add("Zoom Out").SetAccelerator("cmdorctrl+-").OnClick(func(ctx *application.Context) {
		relapse.Publish("zoom-function", "out")
	})
	viewMenu.Add("Reset Zoom").SetAccelerator("cmdorctrl+0").OnClick(func(ctx *application.Context) {
		relapse.Publish("zoom-function", "reset")
	})

	navigationMenu := menu.AddSubmenu("Navigation")
	navigationMenu.Add("Today").SetAccelerator("cmdorctrl+t").OnClick(func(ctx *application.Context) {
		relapse.Publish("time-function", "today")
	})
	navigationMenu.Add("Previous Day").SetAccelerator("up").OnClick(func(ctx *application.Context) {
		relapse.Publish("time-function", "prevDay")
	})
	navigationMenu.Add("Next Day").SetAccelerator("down").OnClick(func(ctx *application.Context) {
		relapse.Publish("time-function", "nextDay")
	})
	navigationMenu.AddSeparator()
	navigationMenu.Add("Prev 30 Seconds").SetAccelerator("left").OnClick(func(ctx *application.Context) {
		relapse.Publish("time-function", "left")
	})
	navigationMenu.Add("Next 30 Seconds").SetAccelerator("right").OnClick(func(ctx *application.Context) {
		relapse.Publish("time-function", "right")
	})
	helpMenu := menu.AddSubmenu("Help")

	helpMenu.Add("Website").OnClick(func(ctx *application.Context) {})
	helpMenu.Add("FAQ").OnClick(func(ctx *application.Context) {})
	helpMenu.Add("Bug Report").OnClick(func(ctx *application.Context) {})

	app.SetMenu(menu)

	trayMenu := app.NewMenu()
	trayMenu.Add("Show").OnClick(func(ctx *application.Context) {
		createOrShowMainWindow(app)
	})
	trayMenu.Add("Quit").SetAccelerator("cmdorctrl+q").OnClick(quitFunc)

	tray := app.NewSystemTray()
	tray.SetMenu(trayMenu)

	b, err = assets.ReadFile("frontend/dist/rewind2.png")
	if err != nil {
		logrus.Fatal("load systray", err)
	}
	tray.SetIcon(b)

	if err := app.Run(); err != nil {
		logrus.Fatal(err)
	}
}

type App struct {
	Capture   *server
	Events    *sse.Server
	Scheduler *gocron.Scheduler

	srv    *http.Server
	db     *sqlx.DB
	logger *slog.Logger
}

func (app *App) Publish(msgType string, data interface{}) {
	b, err := json.Marshal(struct {
		MessageType string      `json:"messageType"`
		Data        interface{} `json:"data"`
	}{
		msgType,
		data,
	})
	if err != nil {
		logrus.Error(err)
	}

	event := &sse.Event{
		Data: b,
	}
	app.Events.Publish("messages", event)
}

func (app *App) Start() {
	// srv.ListenAndServe()
	logrus.Info("serv up")
	app.Scheduler.StartAsync()

	// if app.mux == nil {
	// 	logrus.Fatal("mux is nil")
	// }
	// Do the wrapping, and serve it:
	err := app.srv.ListenAndServe()
	if err != nil {
		logrus.Error("ListenAndServe", err)
	}
}

func (app *App) Stop() {
	app.Scheduler.Stop()
	if err := app.db.Close(); err != nil {
		logrus.Error("db close", err)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()
	if err := app.srv.Shutdown(ctx); err != nil {
		log.Fatalf("everything should be dead...%v", err)
	}
}

func NewApp() *App {
	logFilePath, err := xdg.ConfigFile("relapse/relapse-log.log")
	if err != nil {
		log.Fatal(err)
	}

	lumberjackLogger := &lumberjack.Logger{
		// Log file abbsolute path, os agnostic
		Filename:   filepath.ToSlash(logFilePath),
		MaxSize:    5, // MB
		MaxBackups: 10,
		MaxAge:     30,   // days
		Compress:   true, // disabled by default
	}

	// Fork writing into two outputs
	multiWriter := io.MultiWriter(os.Stderr, lumberjackLogger)

	logFormatter := new(logrus.TextFormatter)
	logFormatter.TimestampFormat = time.RFC1123Z // or RFC3339
	logFormatter.FullTimestamp = true

	logrus.SetFormatter(logFormatter)
	logrus.SetLevel(logrus.InfoLevel)
	logrus.SetOutput(multiWriter)

	logger := slog.New(sloglogrus.Option{Level: slog.LevelDebug, Logger: logrus.StandardLogger()}.NewLogrusHandler())

	// logger = logger.
	// 	With("environment", "dev").
	// 	With("release", "v1.0.0")

	slog.SetDefault(logger)

	databaseFilePath, err := xdg.ConfigFile("relapse/relapse.db")
	if err != nil {
		log.Fatal(err)
	}

	db, err := sqlx.Connect("sqlite3", databaseFilePath)
	if err != nil {
		logrus.Error("Failed to connect to database", err)
	}

	_, err = db.Exec(`
	CREATE TABLE IF NOT EXISTS capture (
		row_num							INTEGER,
		app_name								TEXT DEFAULT '',
		app_path								TEXT DEFAULT '',
		filepath								TEXT DEFAULT '',
		fullpath								TEXT DEFAULT '',
		capture_size_bytes 			INTEGER,
		is_purged 							BOOLEAN,
		dt											DATETIME,
		bod											DATETIME,
		PRIMARY KEY (dt, row_num)
	);
	`)
	if err != nil {
		logrus.Error("Failed to create schema", err)
	}
	_, err = db.Exec(`
	CREATE INDEX IF NOT EXISTS "bod_index" ON "capture" ("bod");
	`)
	if err != nil {
		logrus.Error("Failed to create schema", err)
	}

	_, err = db.Exec(`
	CREATE TABLE IF NOT EXISTS app (
		app_name								TEXT DEFAULT '',
		unique(app_name)
	);
		`)
	if err != nil {
		logrus.Error("Failed to create schema", err)
	}

	relSrv := NewCaptureServer(db)

	sch := gocron.NewScheduler(time.Now().Local().Location())

	sseSrv := sse.New()
	sseSrv.AutoReplay = false
	// sseSrv.EncodeBase64 = true
	sseSrv.CreateStream("messages")

	twirpHandler := proto.NewRelapseServer(relSrv)

	mux := http.NewServeMux()

	mux.Handle(twirpHandler.PathPrefix(), twirpHandler)
	mux.HandleFunc("/events", sseSrv.HTTPHandler)
	mux.HandleFunc("/trigger", func(w http.ResponseWriter, req *http.Request) {

		params := req.URL.Query()

		windowName := params.Get("window")
		if windowName == "" {
			windowName = "MainWindow"
		}
		event := params.Get("event")
		switch event {
		case "maximise":
			vw := app.GetWindowByName(windowName)
			if vw != nil {
				vw.Maximise()
			}
		case "copy":
			b, err := io.ReadAll(req.Body)
			if err != nil {
				logrus.Error("errr", err)
			}
			clipboard.Write(clipboard.FmtText, b)
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
		return
	})

	// images
	mux.HandleFunc("/capture", func(res http.ResponseWriter, req *http.Request) {
		imgPath := req.URL.Query().Get("path")
		logrus.Info("imgPath -> ", imgPath)
		fileData, err := os.ReadFile(imgPath)
		if err != nil {
			res.WriteHeader(http.StatusBadRequest)
			res.Write([]byte(fmt.Sprintf("Could not load file %s %v", imgPath, err)))
		}

		res.Write(fileData)
	})

	srv := http.Server{Addr: ":5020"}
	// Make a CORS wrapper:
	corsWrapper := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:5173", "http://127.0.0.1:5173", "wails://wails"},
		AllowedMethods: []string{"POST", "GET"},
		AllowedHeaders: []string{"Content-Type"},
	})

	srv.Handler = corsWrapper.Handler(mux)
	app := &App{
		Events:    sseSrv,
		Scheduler: sch,
		Capture:   relSrv,
		srv:       &srv,
		db:        db,
		logger:    logger,
	}

	return app
}

func createOrShowMainWindow(app *application.App) {
	windowName := "MainWindow"
	vw := app.GetWindowByName(windowName)
	if vw != nil {
		vw.Show()
		vw.Focus()
		return
	}
	vw = app.NewWebviewWindowWithOptions(application.WebviewWindowOptions{
		Name:  windowName,
		Title: "Relapse",
		CSS:   `body { background-color: rgba(255, 255, 255, 0); } .main { color: white; margin: 20%; }`,

		Mac: application.MacWindow{

			InvisibleTitleBarHeight: 34,
			Backdrop:                application.MacBackdropTranslucent,
			TitleBar:                application.MacTitleBarHiddenInset,
		},
		DevToolsEnabled: true,
		URL:             "/",
	})
	vw.Focus()
}

func createOrShowSettingsWindow(app *application.App) {
	windowName := "SettingsWindow"
	vw := app.GetWindowByName(windowName)
	if vw != nil {
		vw.Show()
		vw.Focus()
		return
	}
	vw = app.NewWebviewWindowWithOptions(application.WebviewWindowOptions{
		Name:  windowName,
		Title: "Settings",
		CSS:   `body { background-color: rgba(255, 255, 255, 0); } .main { color: white; margin: 20%; }`,
		Mac: application.MacWindow{
			InvisibleTitleBarHeight: 34,
			Backdrop:                application.MacBackdropTranslucent,
			TitleBar:                application.MacTitleBarHiddenInset,
		},
		DevToolsEnabled: true,
		URL:             "/#/settings",
	})
	vw.Focus()
}
