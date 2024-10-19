package main

import (
	"embed"
	"io"
	"log"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/adrg/xdg"
	"github.com/go-co-op/gocron"
	"github.com/jmoiron/sqlx"
	sloglogrus "github.com/samber/slog-logrus"
	"gopkg.in/natefinch/lumberjack.v2"

	"github.com/sirupsen/logrus"
	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/plugins/experimental/single_instance"
	"github.com/wailsapp/wails/v3/plugins/experimental/start_at_login"

	_ "modernc.org/sqlite"
)

//go:embed frontend/dist
var assets embed.FS
var vwSetting *application.WebviewWindow
var app *application.App

func main() {
	relapse := NewApp()
	relapse.Scheduler.Every(30).Seconds().Do(func() {
		s, err := relapse.Capture.GetSettings()
		if err == nil && s.Settings.IsEnabled {
			cap, err := relapse.Capture.CaptureScreens()
			if err != nil {
				logrus.Error(err)
			}
			logrus.Info("capturing")
			Publish("screen-captured", cap)
		}

	})
	go relapse.Start()

	iconB, err := assets.ReadFile("frontend/dist/appicon.png")
	if err != nil {
		logrus.Fatal("load icon", err)
	}

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
	dir := filepath.Join(xdg.ConfigHome + "/relapse")

	// Create a file server handler
	fs := http.FileServer(http.Dir(dir))

	mux := http.NewServeMux()
	mux.Handle("/", application.AssetFileServerFS(assets))
	mux.Handle("/capture/", http.StripPrefix("/capture", fs))

	app = application.New(application.Options{
		Name:        "Relapse",
		Description: "Keeping track of your day just became a cinch",
		Icon:        iconB,
		Services: []application.Service{
			application.NewService(NewCaptureServer(relapse.db)),
		},
		Plugins: map[string]application.Plugin{
			"start_at_login": start_at_login.NewPlugin(start_at_login.Config{}),
			"single_instance": single_instance.NewPlugin(&single_instance.Config{
				// When true, the original app will be activated when a second instance is launched
				ActivateAppOnSubsequentLaunch: true,
			}),
		},
		Assets: application.AssetOptions{
			Handler: mux,
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: false,
		},
		ShouldQuit: func() bool {
			relapse.Stop()
			return true
		},
	})

	quitFunc := func() {
		app.Quit()
	}

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

	appMenu.Add("Quit").SetAccelerator("cmdorctrl+q").OnClick(func(ctx *application.Context) {
		quitFunc()
	})

	s, err := relapse.Capture.GetSettings()
	if err != nil {
		logrus.Fatal("GetSettings", err)
	}

	fileMenu := menu.AddSubmenu("File")
	fileMenu.AddCheckbox("Capturing", s.Settings.IsEnabled).OnClick(func(ctx *application.Context) {
		settings, err := relapse.Capture.GetSettings()
		if err != nil {
			return
		}
		settings.Settings.IsEnabled = ctx.IsChecked()
		_, err = relapse.Capture.SetSettings(settings.Settings)
		if err != nil {
			return
		}
	})
	fileMenu.AddSeparator()
	// fileMenu.AddRole(application.Close)

	fileMenu.Add("Show").OnClick(func(ctx *application.Context) {
		createOrShowMainWindow(app)
	})

	fileMenu.AddRole(application.Close)

	// fileMenu.Add("Close").SetAccelerator("cmdorctrl+w").OnClick(func(ctx *application.Context) {
	// 	windowName := "MainWindow"
	// 	vw := app.GetWindowByName(windowName)
	// 	if vw != nil {
	// 		vw.Close()
	// 		return
	// 	}
	// })

	// if runtime.GOOS == "darwin" {
	// 	menu.AddRole(application.EditMenu)
	// 	menu.AddRole(application.ViewMenu)
	// }

	viewMenu := menu.AddSubmenu("View")
	viewMenu.Add("Zoom In").SetAccelerator("cmdorctrl+=").OnClick(func(ctx *application.Context) {
		Publish("zoom", "in")
	})
	viewMenu.Add("Zoom Out").SetAccelerator("cmdorctrl+-").OnClick(func(ctx *application.Context) {
		Publish("zoom", "out")
	})
	viewMenu.Add("Reset Zoom").SetAccelerator("cmdorctrl+0").OnClick(func(ctx *application.Context) {
		Publish("zoom", "reset")
	})

	navigationMenu := menu.AddSubmenu("Navigation")
	navigationMenu.Add("Today").SetAccelerator("cmdorctrl+t").OnClick(func(ctx *application.Context) {
		Publish("time-function", "today")
	})
	navigationMenu.Add("Previous Day").SetAccelerator("up").OnClick(func(ctx *application.Context) {
		Publish("time-function", "prevDay")
	})
	navigationMenu.Add("Next Day").SetAccelerator("down").OnClick(func(ctx *application.Context) {
		Publish("time-function", "nextDay")
	})
	navigationMenu.AddSeparator()
	navigationMenu.Add("Prev 30 Seconds").SetAccelerator("left").OnClick(func(ctx *application.Context) {
		Publish("time-function", "left")
	})
	navigationMenu.Add("Next 30 Seconds").SetAccelerator("right").OnClick(func(ctx *application.Context) {
		Publish("time-function", "right")
	})
	helpMenu := menu.AddSubmenu("Help")

	helpMenu.Add("Website").OnClick(func(ctx *application.Context) {})
	helpMenu.Add("FAQ").OnClick(func(ctx *application.Context) {})
	helpMenu.Add("Bug Report").OnClick(func(ctx *application.Context) {})

	app.SetMenu(menu)

	trayMenu := app.NewMenu()
	trayMenu.AddCheckbox("Capturing", s.Settings.IsEnabled).OnClick(func(ctx *application.Context) {
		settings, err := relapse.Capture.GetSettings()
		if err != nil {
			return
		}
		settings.Settings.IsEnabled = ctx.IsChecked()
		_, err = relapse.Capture.SetSettings(settings.Settings)
		if err != nil {
			return
		}
	})
	trayMenu.AddSeparator()
	trayMenu.Add("Show").OnClick(func(ctx *application.Context) {
		createOrShowMainWindow(app)
	})
	trayMenu.Add("Quit").SetAccelerator("cmdorctrl+q").OnClick(func(ctx *application.Context) {
		quitFunc()
	})

	tray := app.NewSystemTray()
	tray.SetMenu(trayMenu)

	rewindblack, err := assets.ReadFile("frontend/dist/rewind-black.png")
	if err != nil {
		logrus.Fatal("load systray rewind-white", err)
	}
	tray.SetIcon(rewindblack)

	rewindwhite, err := assets.ReadFile("frontend/dist/rewind-white.png")
	if err != nil {
		logrus.Fatal("load systray rewind-white", err)
	}
	tray.SetDarkModeIcon(rewindwhite)
	tray.SetIcon(rewindblack)

	if err := app.Run(); err != nil {
		logrus.Fatal(err)
	}
}

type App struct {
	Capture   *server
	Scheduler *gocron.Scheduler

	db     *sqlx.DB
	logger *slog.Logger
}

func Publish(eventType string, data interface{}) {
	logrus.Infof("publishing %s %v", eventType, data)
	app.Events.Emit(&application.WailsEvent{
		Name: eventType,
		Data: data,
	})
}

func (app *App) Start() {
	// srv.ListenAndServe()
	app.Scheduler.StartAsync()
}

func (app *App) Stop() {
	app.Scheduler.Stop()
	if err := app.db.Close(); err != nil {
		logrus.Error("db close", err)
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

	app := &App{
		Scheduler: sch,
		Capture:   relSrv,
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
		DevToolsEnabled: false,
		URL:             "/",
		Width:           1240,
		Height:          900,
	})
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
