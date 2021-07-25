import { join, resolve } from 'path';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process'
import { app, ipcMain, BrowserWindow, Menu, MenuItem, shell, Tray, protocol } from 'electron';
import { RelapseClient } from '../grpc/relapse_grpc_pb'
import {
  CaptureDaySummary,
  DayRequest,
  DayResponse,
  ListenRequest,
  Settings,
  SettingsPlusOptions,
  SettingsPlusOptionsRequest
} from '../grpc/relapse_pb'
import { ClientReadableStream, credentials, ServiceError } from 'grpc';

// global vars
const isDev = process.env.NODE_ENV === 'development'
const WinURL = isDev
  ? `http://localhost:3000`
  : 'file://' + join(__dirname, '../../dist/render/index.html')

let mainWindow: BrowserWindow | null = null
let willQuitApp = false
let daemon: ChildProcessWithoutNullStreams;

const binPath = isDev ? resolve(__dirname, '../../dist/bin/') : resolve(__dirname, '../../dist/bin/')
const imagePath = isDev ? resolve(__dirname, '../../src/render/assets/') : resolve(__dirname, '../../dist/render/assets/')

let client: RelapseClient
let stream: ClientReadableStream<CaptureDaySummary> | null
let tray
let trayContextMenu

function createWindow () {
  mainWindow = new BrowserWindow({
    minWidth: 1140,
    minHeight: 700,
    width: 1240,
    height: 700,
    titleBarStyle: 'hidden',
    webPreferences: {
      contextIsolation: false,
      enableRemoteModule: false,
      webSecurity: true,
      nodeIntegration: true
    }
  })
  
  // and load the index.html of the app.
  mainWindow.loadURL(WinURL)
  mainWindow.on('close', function (event) {
    if (!willQuitApp) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })
  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    mainWindow = null
  })
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })
}

app.on('ready', () => {
  let capturePath = app.getPath('userData') + '/RelapseScreenshots/'
  let userDataPath = app.getPath('userData') + '/'
  console.log('bin: ', binPath)
  // console.log('imagePath: ', imagePath)
  console.log('capturePath: ', capturePath)
  console.log('userDataPath: ', userDataPath)

  daemon = spawn(binPath + '/daemon', [
    '--capture-path',
    capturePath,
    '--userdata-path',
    userDataPath
  ])
  daemon.stdout.setEncoding('utf8')
  daemon.stdout.on('data', function(data: string) {
    console.log('stdout: ' + data)
  })

  daemon.stderr.setEncoding('utf8')
  daemon.stderr.on('data', function(data: string) {
    if (data) {
      console.log(data)
      if (
        data.includes('running grpc on port') ||
        data.includes('address already in use')
      ) {
        console.log('starting client')
        // startClient()
        // getSettings().then((settings: SettingsPlusOptions.AsObject) => {
        //   let isEnabled = settings.settings!.isenabled
        //   createTrayAndMenusAndShortcuts(settings)
        //   toggleCaptures(isEnabled)
        // })
      }
    }
  })

  createWindow()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (!mainWindow) {
    createWindow()
  } else {
    mainWindow.show()
  }
})
app.on('before-quit', () => {
  willQuitApp = true
  if (daemon) {
    daemon.kill()
  }
})

if (isDev) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

function createTrayAndMenusAndShortcuts(
  settings: SettingsPlusOptions.AsObject
) {
  let isEnabled = settings.settings!.isenabled
  // let isEnabled = false

  let show = function() {
    if (!mainWindow) {
      createWindow()
    } else {
      mainWindow.show()
    }
  }

  let toggleCapture = function(val: MenuItem) {
    getSettings().then((settingsOptions: SettingsPlusOptions.AsObject) => {
      let setting = settingsOptions.settings!
      setting.isenabled = val.checked
      setSettings(setting)
      toggleCaptures(setting.isenabled)
    })
  }

  let quit = function() {
    app.quit()
  }

  let resetZoom = function() {
    if (mainWindow) {
      mainWindow.webContents.send('zoom-function', 'reset')
    }
  }

  let zoomIn = function() {
    if (mainWindow) {
      mainWindow.webContents.send('zoom-function', 'in')
    }
  }

  let zoomOut = function() {
    if (mainWindow) {
      mainWindow.webContents.send('zoom-function', 'out')
    }
  }

  let today = function() {
    if (mainWindow) {
      mainWindow.webContents.send('day-function', 'today')
    }
  }
  let nextDay = function() {
    if (mainWindow) {
      mainWindow.webContents.send('day-function', 'nextDay')
    }
  }
  let prevDay = function() {
    if (mainWindow) {
      mainWindow.webContents.send('day-function', 'prevDay')
    }
  }

  let launchWebsite = function() {
    shell.openExternal('http://relapse.nerdy.co.nz/')
  }
  // var launchWebsiteHelp = function () {
  //   shell.openExternal('http://relapse.nerdy.co.nz/help')
  // }
  let launchWebsiteFAQ = function() {
    shell.openExternal('http://relapse.nerdy.co.nz/faq')
  }
  let launchReport = function() {
    shell.openExternal('http://relapse.nerdy.co.nz/feedback')
  }
  let showTips = function() {
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
  }

  let goLeft = function() {
    if (mainWindow) {
      mainWindow.webContents.send('arrow-pressed', 'left')
    }
  }

  let goRight = function() {
    if (mainWindow) {
      mainWindow.webContents.send('arrow-pressed', 'right')
    }
  }

  let showAboutScreen = function() {
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
  }

  let helpSubMenu: any[] = [
    { label: 'Show Tips', type: 'normal', click: showTips },
    { label: 'About', type: 'normal', click: showAboutScreen },
    { type: 'separator' },
    // {label: 'Relapse Help', type: 'normal', click: launchWebsiteHelp},
    { label: 'Website', type: 'normal', click: launchWebsite },
    { label: 'FAQ', type: 'normal', click: launchWebsiteFAQ },
    { label: 'Feedback / Report an Error', type: 'normal', click: launchReport }
  ]

  if (process.env.NODE_ENV === 'development') {
    helpSubMenu = [
      { label: 'Show Tips', type: 'normal', click: showTips },
      { label: 'About', type: 'normal', click: showAboutScreen },
      { type: 'separator' },
      // {label: 'Relapse Help', type: 'normal', click: launchWebsiteHelp},
      { label: 'Website', type: 'normal', click: launchWebsite },
      { label: 'FAQ', type: 'normal', click: launchWebsiteFAQ },
      {
        label: 'Feedback / Report an Error',
        type: 'normal',
        click: launchReport
      },
      // @ts-ignore
      { role: 'reload' },
      // @ts-ignore
      { role: 'toggledevtools' }
    ]
  }

  const mainMenu = Menu.buildFromTemplate([
    {
      label: 'Relapse',
      submenu: [
        {
          label: 'Preferences',
          type: 'normal',
          click: showPreferencesScreen,
          accelerator: 'Command+,'
        },
        { label: 'Quit', type: 'normal', click: quit, accelerator: 'Command+Q' }
      ]
    },
    {
      label: 'Edit',
      submenu: [{ role: 'copy' }, { role: 'paste' }]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Zoom In',
          type: 'normal',
          click: zoomIn,
          accelerator: 'Command+='
        },
        {
          label: 'Zoom Out',
          type: 'normal',
          click: zoomOut,
          accelerator: 'Command+-'
        },
        {
          label: 'Reset Zoom',
          type: 'normal',
          click: resetZoom,
          accelerator: 'Command+0'
        }
      ]
    },
    {
      label: 'Navigation',
      submenu: [
        {
          label: 'Today',
          type: 'normal',
          click: today,
          accelerator: 'Command+T'
        },
        {
          label: 'Next Day',
          type: 'normal',
          click: nextDay,
          accelerator: 'Command+Right'
        },
        {
          label: 'Prev Day',
          type: 'normal',
          click: prevDay,
          accelerator: 'Command+Left'
        },
        { type: 'separator' },
        {
          label: 'Next Minute',
          type: 'normal',
          click: goRight,
          accelerator: 'Right'
        },
        {
          label: 'Prev Minute',
          type: 'normal',
          click: goLeft,
          accelerator: 'Left'
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Show Window',
          type: 'normal',
          click: show,
          accelerator: 'Command+N'
        },
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      // submenu: [
      //   {label: 'Relapse Help', type: 'normal', click: launchWebsiteHelp},
      //   {label: 'Website', type: 'normal', click: launchWebsite},
      //   {label: 'Feedback / Report an Error', type: 'normal', click: launchReport},
      //   {label: 'About', type: 'normal', click: showAboutScreen},
      //   {role: 'reload'},
      //   {role: 'toggledevtools'}
      // ]
      submenu: helpSubMenu
    }
  ])

  Menu.setApplicationMenu(mainMenu)

  tray = new Tray(image('TrayIcon@2x.png'))
  tray.setPressedImage(image('TrayIcon@2x.png'))
  trayContextMenu = Menu.buildFromTemplate([
    { label: 'Show Window', type: 'normal', click: show },
    { type: 'separator' },
    {
      label: 'Capturing Screen',
      type: 'checkbox',
      checked: isEnabled,
      click: toggleCapture
    },
    { type: 'separator' },
    { label: 'Quit', type: 'normal', click: quit, accelerator: 'Command+Q' }
  ])

  // if (isDevelopment && !process.env.IS_TEST) {
  //   // Install Vue Devtools
  //   try {
  //     await installExtension(VUEJS_DEVTOOLS)
  //   } catch (e) {
  //     console.error('Vue Devtools failed to install:', e.toString())
  //   }
  // }

  tray.setContextMenu(trayContextMenu)
}

let settingsWindow: Electron.BrowserWindow | null

function showPreferencesScreen () {
  if (mainWindow) {
    mainWindow!.webContents.send('show-preferences')
  }
}

// function createScreenMonitor (capturePath) {
//   screenCap = new ScreenCapture({
//     capturePath: capturePath,
//     onCaptureCallback: function (err, doc) {
//       if (err) { log(err) }
//       if (mainWindow) {
//         log('sending-screenshot')
//         mainWindow.webContents.send('screenshot-created', doc)
//       }

//       if (lastDeletedDay == null || lastDeletedDayChangeIndex >= 60) { // every day, just scrub back the last 60, keeps things being missed :)
//         lastDeletedDay = moment() // reset and do it again, seems wasteful but who cares it takes two seconds and this thing is looping all day :)
//       } else {
//         lastDeletedDay = lastDeletedDay.add(-1, 'days')
//       }

//       deleteFilesForDay(lastDeletedDay.toDate())
//     }
//   }, db, log)

//   powerMonitor.on('suspend', () => {
//     screenCap.stop()
//   })

//   powerMonitor.on('resume', () => {
//     getSettings((err, settings) => {
//       if (err) {
//         log(err)
//         return
//       }
//       if (settings.isCapturing) {
//         screenCap.start()
//       }
//     })
//   })

//   getSettings((err, settings) => {
//     if (err) {
//       log(err)
//       return
//     }

//     // app has just started, so start capturing.
//     settings.isCapturing = true
//     settings.capturePath = forcedCapturePath // forced to use this atm

//     setSettings(settings, (err, settings) => {
//       if (err) {
//         log(err)
//         return
//       }

//       screenCap.start()
//     })
//   })
// }

let currentSelectedDateTime = new Date()

app.on('ready', () => {
  let capturePath = app.getPath('userData') + '/RelapseScreenshots/'
  let userDataPath = app.getPath('userData') + '/'
  console.log('bin: ', binPath)
  console.log('imagePath: ', imagePath)
  console.log('capturePath: ', capturePath)
  console.log('userDataPath: ', userDataPath)

  let child = spawn(binPath + '/daemon', [
    '--capture-path',
    capturePath,
    '--userdata-path',
    userDataPath
  ])
  child.stdout.setEncoding('utf8')
  child.stdout.on('data', function(data: string) {
    console.log('stdout: ' + data)
  })

  child.stderr.setEncoding('utf8')
  child.stderr.on('data', function(data: string) {
    if (data) {
      console.log(data)
      if (
        data.includes('running grpc on port') ||
        data.includes('address already in use')
      ) {
        console.log('starting client')
        startClient()
        getSettings().then((settings: SettingsPlusOptions.AsObject) => {
          let isEnabled = settings.settings!.isenabled
          createTrayAndMenusAndShortcuts(settings)
          toggleCaptures(isEnabled)
        })
      }
    }
  })

  const protocolName = 'relapse-image'
  protocol.registerFileProtocol(protocolName, (request, callback) => {
    const url = request.url.replace(`${protocolName}://`, '')
    try {
      return callback(decodeURIComponent(url))
    } catch (error) {
      // Handle the error as needed
      console.error(error)
    }
  })

  // let relapse_proto = grpc.loadPackageDefinition(packageDefinition).relapse_proto

  // createTrayAndMenusAndShortcuts()
  // communication with app. think of this as the router
  ipcMain.on('maximize', () => {
    if (mainWindow) {
      mainWindow.maximize()
    }
  })
  // ipcMain.on('open-capture-path', () => {
  //   log(`open ${forcedCapturePath}/RelapseScreenshots`)
  //   worker.exec(`open ${forcedCapturePath}/RelapseScreenshots`)
  //   // electron.shell.showItemInFolder(app.getPath('appData') + '/RelapseScreenshots') // TEMP capturepath stuffs
  // })
  ipcMain.on('load-day', (event, date, skipToEnd) => {
    loadDay(date, skipToEnd)
  })

  ipcMain.on('load-settings', event => {
    client.getSettings(
      new SettingsPlusOptionsRequest(),
      (err: Error | null, response: SettingsPlusOptions) => {
        if (err != null) {
          console.error(err)
        }
        event.sender.send('loaded-settings', response.toObject())
      }
    )
  })

  ipcMain.on('link-clicked', (event, link) => {
    shell.openExternal(link)
  })

  ipcMain.on('close-settings', event => {
    if (settingsWindow) {
      settingsWindow.close()
    }
  })

  ipcMain.on('change-settings', (event, settings: Settings.AsObject) => {
    setSettings(settings).then((response: Settings.AsObject) => {
      event.sender.send('changed-settings', response)
    })
  })

  // ipcMain.on('open-dialog', (event) => {
  //   dialog.showOpenDialog({ properties: ['openDirectory'] }).then((result) => {
  //     if (result && result.length > 0) {
  //       event.sender.send('filepath-changed', result[0])
  //     }
  //   })
  // })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

function image(imageName: string) {
  return imagePath + '/' + imageName
}

function startClient() {
  client = new RelapseClient('localhost:3333', credentials.createInsecure())
}

function toggleCaptures (isEnabled: boolean) {
  if (isEnabled) {
    if (stream) {
      console.log('resuming stream')
      stream.resume()
    } else {
      stream = client.listenForCaptures(new ListenRequest())
      console.log('creating stream')
      stream.on('data', (resp: DayResponse) => {
        if (resp.getCapturedaytimeseconds() === startOfDayAsSeconds(currentSelectedDateTime)) {
          console.log('updating app')
          sendDayInfoToApp(resp, currentSelectedDateTime, false)
        } else {
          console.log(
            'wrong day to update',
            resp.getCapturedaytimeseconds(),
            startOfDayAsSeconds(currentSelectedDateTime)
          )
        }
      })
      stream.on('error', (err) => {
        console.log('stream error' + err)
      })
    }
  } else {
    if (stream) {
      console.log('pausing stream')
      // might not be defined yet
      stream.cancel()
      stream = null
    } else {
      console.log('stream not enabled yet')
    }
  }
}

function loadDay(date: Date, skipToEnd: boolean) {
  currentSelectedDateTime = date
  let dayReq = new DayRequest()
  dayReq.setCapturedaytimeseconds(
    startOfDayAsSeconds(date)
  )

  client.getCapturesForADay(
    dayReq,
    (err: ServiceError | null, resp?: DayResponse) => {
      if (err) {
        console.error(err)
      }
      if (resp) {
        sendDayInfoToApp(resp, date, skipToEnd)
      }
    }
  )
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
    mainWindow.webContents.send('loaded-day', resp.toObject())
  }
}

function getSettings(): Promise<SettingsPlusOptions.AsObject> {
  return new Promise((resolve, reject) => {
    let req = new SettingsPlusOptionsRequest()
    client.getSettings(
      req,
      (err: Error | null, response: SettingsPlusOptions) => {
        if (err != null) {
          console.log('error')
          reject(err)
        }
        console.log('loaded settings')
        resolve(response.toObject())
      }
    )
  })
}

function setSettings(settings: Settings.AsObject): Promise<Settings.AsObject> {
  return new Promise((resolve, reject) => {
    let req = new Settings()
    req.setIsenabled(settings.isenabled)
    req.setRejectionsList(settings.rejectionsList)
    req.setRetainforxdays(settings.retainforxdays)
    client.setSettings(req, (err: Error | null, response: Settings) => {
      if (err != null) {
        console.log('error')
        reject(err)
      }
      console.log('saved settings')
      resolve(response.toObject())
    })
  })
}

function startOfDayAsSeconds(date: Date) {
  let bod = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
  return Math.floor(bod.valueOf() / 1000)
}