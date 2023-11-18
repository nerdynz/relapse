const log = require("electron-log");
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  MenuItem,
  protocol,
  shell,
  Tray
} from "electron";
import { ClientReadableStream, credentials, ServiceError } from "grpc";
import { join, resolve } from "path";
import { RelapseClient } from "../grpc/relapse_grpc_pb";
import {
  CaptureDaySummary,
  DayRequest,
  DayResponse,
  ListenRequest,
  Settings,
  SettingsPlusOptions,
  SettingsPlusOptionsRequest
} from "../grpc/relapse_pb";

log.transports.file.level = "silly";

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "1";

// global vars
const isDev = process.env.NODE_ENV === "development";
let mainWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;
let willQuitApp = false;
let daemon: ChildProcessWithoutNullStreams;

let iconPath = resolve(__dirname, "../icons/");
let binPath = resolve(__dirname, "../bin/");
if (!isDev) {
  binPath = binPath.replace("app.asar", "app.asar.unpacked");
  iconPath = iconPath.replace("app.asar", "app.asar.unpacked");
}

let client: RelapseClient;
let stream: ClientReadableStream<CaptureDaySummary> | null;
let tray;
let trayContextMenu;

function createSettingsWindow(isOpening = true) {
  settingsWindow = new BrowserWindow({
    minWidth: 500,
    minHeight: 400,
    width: 720,
    height: 540,
    titleBarStyle: "hiddenInset",
    vibrancy: "under-window",
    transparent: true,
    title: "settings",
    webPreferences: {
      nodeIntegration: false,
      preload: join(__dirname, "preload.js"),
    },
  });

  if (process.env.NODE_ENV === "development") {
    settingsWindow.loadURL("http://localhost:3000/#settings");
  } else {
    settingsWindow.loadFile("dist/render/index.html#/settings");
  }
  // and load the index.html of the app.
  settingsWindow.on("close", function (event) {
    if (!willQuitApp) {
      event.preventDefault();
      settingsWindow?.hide();
    }
  });
  // Emitted when the window is closed.
  settingsWindow.on("closed", function () {
    // settingsWindow = null;
  });

  if (isOpening) {
    settingsWindow.once("ready-to-show", () => {
      settingsWindow?.show();
    });
  }
  settingsWindow?.hide();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    minWidth: 1140,
    minHeight: 700,
    width: 1440,
    height: 900,
    titleBarStyle: "hiddenInset",
    vibrancy: "under-window",
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      preload: join(__dirname, "preload.js"),
    },
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:3000/");
  } else {
    mainWindow.loadFile("dist/render/index.html");
  }
  // and load the index.html of the app.
  mainWindow.on("close", function (event) {
    if (!willQuitApp) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });
  // Emitted when the window is closed.
  mainWindow.on("closed", function () {
    mainWindow = null;
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });
}

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (!mainWindow) {
    createWindow();
  } else {
    mainWindow.show();
  }
});

app.on("before-quit", () => {
  willQuitApp = true;
  if (daemon) {
    daemon.kill();
  }
});

if (isDev) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

function createTrayAndMenusAndShortcuts(
  settings: SettingsPlusOptions.AsObject
) {
  let isEnabled = settings.settings!.isenabled;
  // let isEnabled = false

  let show = function () {
    if (!mainWindow) {
      createWindow();
    } else {
      mainWindow.show();
    }
  };

  let toggleCapture = function (val: MenuItem) {
    getSettings().then((settingsOptions: SettingsPlusOptions.AsObject) => {
      let setting = settingsOptions.settings!;
      setting.isenabled = val.checked;
      setSettings(setting);
      toggleCaptures(setting.isenabled);
    });
  };

  let quit = function () {
    app.quit();
  };

  let showPreferencesScreen = function () {
    if (settingsWindow === null || settingsWindow.isDestroyed()) {
      createSettingsWindow();
    } else {
      if (settingsWindow.isVisible()) {
        settingsWindow.hide();
      } else {
        settingsWindow.show();
      }
    }
  };

  let resetZoom = function () {
    if (mainWindow) {
      mainWindow.webContents.send("zoom-function", "reset");
    }
  };

  let zoomIn = function () {
    if (mainWindow) {
      mainWindow.webContents.send("zoom-function", "in");
    }
  };

  let zoomOut = function () {
    if (mainWindow) {
      mainWindow.webContents.send("zoom-function", "out");
    }
  };

  let today = function () {
    if (mainWindow) {
      mainWindow.webContents.send("day-function", "today");
    }
  };
  let nextDay = function () {
    if (mainWindow) {
      mainWindow.webContents.send("day-function", "nextDay");
    }
  };
  let prevDay = function () {
    if (mainWindow) {
      mainWindow.webContents.send("day-function", "prevDay");
    }
  };

  let launchWebsite = function () {
    shell.openExternal("http://relapse.nerdy.co.nz/");
  };
  // var launchWebsiteHelp = function () {
  //   shell.openExternal('http://relapse.nerdy.co.nz/help')
  // }
  let launchWebsiteFAQ = function () {
    shell.openExternal("http://relapse.nerdy.co.nz/faq");
  };
  let launchReport = function () {
    shell.openExternal("http://relapse.nerdy.co.nz/feedback");
  };
  let showTips = function () {
    // getSettings((err, settings) => {
    //   if (err) {
    //     log(err)
    //     return
    //   }
    //   settings.isHelpShown = true
    //   setSettings(settings, () => {
    //     if (mainWindow) { mainWindow.webContents.send('changed-settings', 'changed help shown', settings) }
    //   })
    // })
  };

  let goLeft = function () {
    if (mainWindow) {
      mainWindow.webContents.send("arrow-pressed", "left");
    }
  };

  let goRight = function () {
    if (mainWindow) {
      mainWindow.webContents.send("arrow-pressed", "right");
    }
  };

  let goLeft1Min = function () {
    if (mainWindow) {
      mainWindow.webContents.send("arrow-pressed", "left-1min");
    }
  };

  let goRight1Min = function () {
    if (mainWindow) {
      mainWindow.webContents.send("arrow-pressed", "right-1min");
    }
  };

  let showAboutScreen = function () {
    // if (aboutWindow) {
    //   aboutWindow.show()
    //   return // already open
    // }
    // aboutWindow = new BrowserWindow({
    //   title: 'About Relapse',
    //   width: 360,
    //   height: 300,
    //   backgroundColor: '#252830',
    //   // transparent: true,
    //   titleBarStyle: 'hiddenInset',
    //   webPreferences: {
    //     webSecurity: false
    //   }
    // })
    // aboutWindow.loadURL(winURL + '#/about')
    // aboutWindow.on('closed', () => {
    //   aboutWindow = null
    // })
  };

  let helpSubMenu: any[] = [
    // { label: 'Show Tips', type: 'normal', click: showTips },
    // { label: 'About', type: 'normal', click: showAboutScreen },
    { type: "separator" },
    // {label: 'Relapse Help', type: 'normal', click: launchWebsiteHelp},
    { label: "Website", type: "normal", click: launchWebsite },
    { label: "FAQ", type: "normal", click: launchWebsiteFAQ },
    {
      label: "Feedback / Report an Error",
      type: "normal",
      click: launchReport,
    },
  ];

  if (process.env.NODE_ENV === "development") {
    helpSubMenu = [
      // { label: 'Show Tips', type: 'normal', click: showTips },
      // { label: 'About', type: 'normal', click: showAboutScreen },
      { type: "separator" },
      // {label: 'Relapse Help', type: 'normal', click: launchWebsiteHelp},
      { label: "Website", type: "normal", click: launchWebsite },
      { label: "FAQ", type: "normal", click: launchWebsiteFAQ },
      {
        label: "Feedback / Report an Error",
        type: "normal",
        click: launchReport,
      },
      // @ts-ignore
      { role: "reload" },
      // @ts-ignore
      { role: "toggledevtools" },
    ];
  }

  const mainMenu = Menu.buildFromTemplate([
    {
      label: "Relapse",
      submenu: [
        {
          label: "Preferences",
          type: "normal",
          click: showPreferencesScreen,
          accelerator: "Command+,",
        },
        {
          label: "Quit",
          type: "normal",
          click: quit,
          accelerator: "Command+Q",
        },
      ],
    },
    {
      label: "Edit",
      submenu: [{ role: "copy" }, { role: "paste" }],
    },
    {
      label: "View",
      submenu: [
        {
          label: "Zoom In",
          type: "normal",
          click: zoomIn,
          accelerator: "Command+=",
        },
        {
          label: "Zoom Out",
          type: "normal",
          click: zoomOut,
          accelerator: "Command+-",
        },
        {
          label: "Reset Zoom",
          type: "normal",
          click: resetZoom,
          accelerator: "Command+0",
        },
      ],
    },
    {
      label: "Navigation",
      submenu: [
        {
          label: "Today",
          type: "normal",
          click: today,
          accelerator: "Command+T",
        },
        {
          label: "Next Day",
          type: "normal",
          click: nextDay,
          accelerator: "Command+Right",
        },
        {
          label: "Previous Day",
          type: "normal",
          click: prevDay,
          accelerator: "Command+Left",
        },
        { type: "separator" },
        {
          label: "Next 30 Seconds",
          type: "normal",
          click: goRight,
          accelerator: "Right",
        },
        {
          label: "Previous 30 Seconds",
          type: "normal",
          click: goLeft,
          accelerator: "Left",
        },
        { type: "separator" },
        {
          label: "Next Minute",
          type: "normal",
          click: goRight1Min,
          accelerator: "Shift+Right",
        },
        {
          label: "Previous Minute",
          type: "normal",
          click: goLeft1Min,
          accelerator: "Shift+Left",
        },
      ],
    },
    {
      label: "Window",
      submenu: [
        {
          label: "Show Window",
          type: "normal",
          click: show,
          accelerator: "Command+N",
        },
        { role: "minimize" },
        { role: "close" },
      ],
    },
    {
      label: "Help",
      // submenu: [
      //   {label: 'Relapse Help', type: 'normal', click: launchWebsiteHelp},
      //   {label: 'Website', type: 'normal', click: launchWebsite},
      //   {label: 'Feedback / Report an Error', type: 'normal', click: launchReport},
      //   {label: 'About', type: 'normal', click: showAboutScreen},
      //   {role: 'reload'},
      //   {role: 'toggledevtools'}
      // ]
      submenu: helpSubMenu,
    },
  ]);

  Menu.setApplicationMenu(mainMenu);

  tray = new Tray(iconPath + "/TrayIconTemplate@2x.png");
  tray.setPressedImage(iconPath + "/TrayIconTemplate@2x.png");
  trayContextMenu = Menu.buildFromTemplate([
    { label: "Show Window", type: "normal", click: show },
    { type: "separator" },
    {
      label: "Capturing Screen",
      type: "checkbox",
      checked: isEnabled,
      click: toggleCapture,
    },
    { type: "separator" },
    { label: "Quit", type: "normal", click: quit, accelerator: "Command+Q" },
  ]);

  // if (isDevelopment && !process.env.IS_TEST) {
  //   // Install Vue Devtools
  //   try {
  //     await installExtension(VUEJS_DEVTOOLS)
  //   } catch (e) {
  //     console.error('Vue Devtools failed to install:', e.toString())
  //   }
  // }

  tray.setContextMenu(trayContextMenu);
}

let currentSelectedDateTime = new Date();

app.on("ready", () => {

  let capturePath = app.getPath("userData") + "/RelapseScreenshots/";
  let userDataPath = app.getPath("userData") + "/";
  log.debug("iconPath: ", iconPath);
  log.debug("binPath: ", binPath);
  log.debug("capturePath: ", capturePath);
  log.debug("userDataPath: ", userDataPath);

  let child = spawn(binPath + "/daemon", [
    "--capture-path",
    capturePath,
    "--userdata-path",
    userDataPath,
    "--bin-path",
    binPath,
  ]);
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", function (data: string) {
    logFromGolangLogrus(data);
  });

  child.stderr.setEncoding("utf8");
  child.stderr.on("data", function (data: string) {
    if (data) {
      logFromGolangLogrus(data);
      if (
        data.includes("running grpc on port") ||
        data.includes("address already in use")
      ) {
        log.info("starting client");
        startClient();
        getSettings().then((settings: SettingsPlusOptions.AsObject) => {
          let isEnabled = settings.settings!.isenabled;
          createTrayAndMenusAndShortcuts(settings);
          toggleCaptures(isEnabled);
          createSettingsWindow(false);
        });
      }
    }
  });

  const protocolName = "relapse-image";
  protocol.registerFileProtocol(protocolName, (request, callback) => {
    const url = request.url.replace(`${protocolName}://`, "");
    try {
      return callback(decodeURIComponent(url));
    } catch (error) {
      // Handle the error as needed
      console.error(error);
    }
  });

  ipcMain.on("maximize", () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on("load-day", (event, date, skipToEnd) => {
    loadDay(date, skipToEnd);
  });

  ipcMain.on("load-settings", (event) => {
    client.getSettings(
      new SettingsPlusOptionsRequest(),
      (err: Error | null, response: SettingsPlusOptions) => {
        if (err != null) {
          console.error(err);
        }
        event.sender.send("loaded-settings", response.toObject());
      }
    );
  });

  ipcMain.on("link-clicked", (event, link) => {
    shell.openExternal(link);
  });

  ipcMain.on("change-settings", (event, settings: Settings.AsObject) => {
    setSettings(settings).then((response: Settings.AsObject) => {
      event.sender.send("changed-settings", response);
    });
  });

  // ipcMain.on('open-dialog', (event) => {
  //   dialog.showOpenDialog({ properties: ['openDirectory'] }).then((result) => {
  //     if (result && result.length > 0) {
  //       event.sender.send('filepath-changed', result[0])
  //     }
  //   })
  // })
  createWindow();
});

function startClient() {
  client = new RelapseClient("localhost:3333", credentials.createInsecure());
}

function toggleCaptures(isEnabled: boolean) {
  if (isEnabled) {
    if (stream) {
      log.info("resuming stream");
      stream.resume();
    } else {
      stream = client.listenForCaptures(new ListenRequest());
      log.info("creating stream");
      stream.on("data", (resp: DayResponse) => {
        if (
          resp.getCapturedaytimeseconds() ===
          startOfDayAsSeconds(currentSelectedDateTime)
        ) {
          sendDayInfoToApp(resp, currentSelectedDateTime, false);
        } else {
          log.info(
            "wrong day to update",
            resp.getCapturedaytimeseconds(),
            startOfDayAsSeconds(currentSelectedDateTime)
          );
        }
      });
      stream.on("error", (err) => {
        log.info("stream error" + err);
      });
    }
  } else {
    if (stream) {
      log.info("pausing stream");
      // might not be defined yet
      stream.cancel();
      stream = null;
    } else {
      log.info("stream not enabled yet");
    }
  }
}

function loadDay(date: Date, skipToEnd: boolean) {
  currentSelectedDateTime = date;
  let dayReq = new DayRequest();
  dayReq.setCapturedaytimeseconds(startOfDayAsSeconds(date));

  client.getCapturesForADay(
    dayReq,
    (err: ServiceError | null, resp?: DayResponse) => {
      if (err) {
        console.error(err);
      } else if (resp) {
        sendDayInfoToApp(resp, date, skipToEnd);
      } else {
        log.silly("nothing happened?");
      }
    }
  );
}

function sendDayInfoToApp(resp: DayResponse, date: Date, skipToEnd: boolean) {
  // let dayInfo: DayInfo = {
  //   fullDate: moment(date).format('DD-MMM-YYYY'),
  //   skipToEnd: skipToEnd
  // }

  // let captures = resp.getCapturesList()
  // if (captures) {
  //   dayInfo.files = captures.map(cap => {
  //     return cap.toObject(false)
  //   })
  // }
  if (mainWindow) {
    mainWindow.webContents.send("loaded-day", resp.toObject());
  }
}

function getSettings(): Promise<SettingsPlusOptions.AsObject> {
  return new Promise((resolve, reject) => {
    let req = new SettingsPlusOptionsRequest();
    client.getSettings(
      req,
      (err: Error | null, response: SettingsPlusOptions) => {
        if (err != null) {
          log.info("error");
          reject(err);
        }
        log.info("loaded settings");
        resolve(response.toObject());
      }
    );
  });
}

function setSettings(settings: Settings.AsObject): Promise<Settings.AsObject> {
  return new Promise((resolve, reject) => {
    let req = new Settings();
    req.setIsenabled(settings.isenabled);
    req.setRejectionsList(settings.rejectionsList);
    req.setRetainforxdays(settings.retainforxdays);
    client.setSettings(req, (err: Error | null, response: Settings) => {
      if (err != null) {
        log.info("error");
        reject(err);
      }
      log.info("saved settings");
      resolve(response.toObject());
    });
  });
}

function startOfDayAsSeconds(date: Date) {
  let bod = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0
  );
  return Math.floor(bod.valueOf() / 1000);
}

interface LogInfo {
  level: "Info" | "Warning" | "Error" | "Debug" | "Silly";
  message: String;
}

function logFromGolangLogrus(rawLog: string): void {
  let cleanLog = parseFromGolangLogrus(rawLog);
  if (cleanLog.level === "Silly") {
    log.silly(cleanLog.message);
  } else if (cleanLog.level === "Debug") {
    log.debug(cleanLog.message);
  } else if (cleanLog.level === "Error") {
    log.error(cleanLog.message);
  } else if (cleanLog.level === "Warning") {
    log.warn(cleanLog.message);
  } else if (cleanLog.level === "Info") {
    log.info(cleanLog.message);
  }
}

function parseFromGolangLogrus(rawLog: string): LogInfo {
  let result: LogInfo = {
    level: "Silly",
    message: rawLog,
  };
  if (rawLog.includes("level=") && rawLog.includes("msg=")) {
    let split = rawLog.split("level=");
    if (split.length > 1) {
      split = split[1].split("msg=");
      let level = split[0];
      if (level.toLowerCase().includes("warn")) {
        result.level = "Warning";
      } else if (level.toLowerCase().includes("err")) {
        result.level = "Error";
      } else if (level.toLowerCase().includes("info")) {
        result.level = "Info";
      } else if (level.toLowerCase().includes("debug")) {
        result.level = "Debug";
      }
      let message = split[1];
      message = message.trim();
      if (message.indexOf(`"`) === 0) {
        message.substring(1);
      }
      if (message.lastIndexOf(`"`) === message.length - 1) {
        message.substring(0, message.length - 1);
      }
      result.message = message;
    }
  }

  return result;
}
