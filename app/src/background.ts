// const electron = require('electron')
import { DayInfo } from '@/interfaces/dayInfo.interface'
import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  protocol,
  shell,
  Tray
} from 'electron'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { ClientReadableStream, credentials, ServiceError } from 'grpc'
import moment from 'moment'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import { RelapseClient } from './grpc/relapse_grpc_pb'
import { DayRequest, DayResponse, ListenRequest } from './grpc/relapse_pb'
import { spawn } from 'child_process'
import path from 'path'
const isDevelopment = process.env.NODE_ENV !== 'production'
// const { spawn } = require('child_process')
// const BrowserWindow = electron.BrowserWindow
// const dialog = electron.dialog
// const ipcMain = electron.ipcMain
// const Menu = electron.Menu
// const shell = electron.shell
// const Tray = electron.Tray
// const path = require('path')
// const moment = require('moment')

const binPath = path.resolve(__dirname, '../src/bin/')
const imagePath = path.resolve(__dirname, '../src/assets/')
const winURL = 'http://localhost:8080'

// const PROTO_PATH = path.resolve(__dirname, '../src/') + '/relapse.proto'
// const protoLoader = require('@grpc/proto-loader')
// let packageDefinition = protoLoader.loadSync(PROTO_PATH, {
//   keepCase: true,
//   longs: String,
//   enums: String,
//   defaults: true,
//   oneofs: true
// })

let mainWindow: Electron.BrowserWindow | null
let aboutWindow: Electron.BrowserWindow | null
let settingsWindow: Electron.BrowserWindow | null
let client: RelapseClient
let tray
let trayContextMenu

async function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: 'Relapse',
    height: 900,
    width: 1440,
    // backgroundColor: '#252830',
    icon: image('Relapse.icns'),
    // transparent: true,
    titleBarStyle: 'hiddenInset',
    vibrancy: 'appearance-based',
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    // if (!process.env.IS_TEST) mainWindow.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    mainWindow.loadURL('app://./index.html')
  }

  mainWindow.loadURL(winURL)
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  mainWindow.on('focus', () => {
    mainWindow!.webContents.send('window-focus')
  })
  mainWindow.on('blur', () => {
    mainWindow!.webContents.send('window-blur')
  })
}

app.setLoginItemSettings({
  openAtLogin: true
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
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

function createTrayAndMenusAndShortcuts() {
  let show = function() {
    if (!mainWindow) {
      createWindow()
    } else {
      mainWindow.show()
    }
  }

  let toggleCapture = function() {
    // getSettings((err, settings) => {
    //   if (err) {
    //     log(err)
    //     return
    //   }
    //   if (!settings.isCapturing) {
    //     settings.isCapturing = true
    //     setSettings(settings, (err, settings) => {
    //       if (err) {
    //         log(err)
    //         return
    //       }
    //       screenCap.start()
    //     })
    //   } else {
    //     settings.isCapturing = false
    //     setSettings(settings, (err, settings) => {
    //       if (err) {
    //         log(err)
    //         return
    //       }
    //       screenCap.stop()
    //     })
    //   }
    // })
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
    if (aboutWindow) {
      aboutWindow.show()
      return // already open
    }
    aboutWindow = new BrowserWindow({
      title: 'About Relapse',
      width: 360,
      height: 300,
      backgroundColor: '#252830',
      // transparent: true,
      titleBarStyle: 'hiddenInset',
      webPreferences: {
        webSecurity: false
      }
    })

    aboutWindow.loadURL(winURL + '#/about')
    aboutWindow.on('closed', () => {
      aboutWindow = null
    })
  }

  function showPreferencesScreen() {
    if (settingsWindow) {
      settingsWindow.show()
      return // already open
    }

    settingsWindow = new BrowserWindow({
      title: 'Relapse Preferences',
      width: 460,
      height: 360,
      backgroundColor: '#252830',
      // transparent: true,
      titleBarStyle: 'hiddenInset',
      webPreferences: {
        webSecurity: false
      }
    })

    settingsWindow.loadURL(winURL + '#/settings')
    settingsWindow.on('closed', () => {
      if (settingsWindow) {
        settingsWindow = null
      }
    })
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
      checked: true,
      click: toggleCapture
    },
    { type: 'separator' },
    { label: 'Quit', type: 'normal', click: quit, accelerator: 'Command+Q' }
  ])

  tray.setContextMenu(trayContextMenu)
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

  let capturePath = app.getPath('documents') + '/RelapseScreenshots/'
  let userDataPath = app.getPath('userData') + '/'
  // console.log('bin: ', binPath + '/daemon')
  console.log('capturePath: ', capturePath)
  console.log('userDataPath: ', userDataPath)

  // let child = spawn(binPath + '/daemon', [
  //   '--capture-path',
  //   capturePath,
  //   '--userdata-path',
  //   userDataPath
  // ])
  // child.stdout.setEncoding('utf8')
  // child.stdout.on('data', function (data: string) {
  //   console.log('stdout: ' + data)
  // })

  // child.stderr.setEncoding('utf8')
  // child.stderr.on('data', function (data: string) {
  //   if (data.startsWith('CaptureDayTimeSeconds_')) {
  //     let startOfDay = moment(currentSelectedDateTime)
  //       .startOf('day')
  //       .unix()

  //     console.log(data, ' compared to ', startOfDay)
  //     let startOfDayFromDaemon = data.split('CaptureDayTimeSeconds_')[0]
  //     if (Number(startOfDayFromDaemon) === startOfDay) {
  //       console.log('WOOOTOTOTOTOOTOT')
  //     }
  //   }
  //   console.log('stderr: ' + data)
  // })

  client = new RelapseClient('localhost:3333', credentials.createInsecure())

  let stream = client.listenForCaptures(new ListenRequest())
  stream.on('data', (resp: DayResponse) => {
    let startOfDay = moment(currentSelectedDateTime).startOf('day')
    if (resp.getCapturedaytimeseconds() === startOfDay.unix()) {
      console.log('updating app')
      sendDayInfoToApp(resp, currentSelectedDateTime, false)
    } else {
      console.log('wrong day to update', resp.getCapturedaytimeseconds(), startOfDay.unix())
    }
  })



  createTrayAndMenusAndShortcuts()

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

  // ipcMain.on('load-settings', (event) => {
  //   log('settings....')
  //   getSettings((err, settings) => {
  //     if (err) { console.error(err) }
  //     event.sender.send('loaded-settings', settings)
  //   })
  // })

  ipcMain.on('link-clicked', (event, link) => {
    shell.openExternal(link)
  })

  ipcMain.on('close-settings', event => {
    if (settingsWindow) {
      settingsWindow.close()
    }
  })

  // ipcMain.on('change-settings', (event, settings) => {
  //   setSettings(settings, (err, settings) => {
  //     let msg = {
  //       msgType: '',
  //       msg: ''
  //     }
  //     if (err) {
  //       log(err)
  //       if (err.code === 'EACCES') {
  //         msg = {
  //           msgType: 'error',
  //           msg: 'Invalid path. Please try selecting a new one.'
  //         }
  //       }
  //     } else {
  //       msg.msg = 'Preferences succesfully updated!'
  //       msg.msgType = 'ok'
  //     }
  //     event.sender.send('changed-settings', msg, settings)
  //   })
  // })

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

function loadDay(date: Date, skipToEnd: boolean) {
  currentSelectedDateTime = date
  let dayReq = new DayRequest()
  dayReq.setCapturedaytimeseconds(
    moment(date)
      .startOf('day')
      .unix()
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
  let dayInfo: DayInfo = {
    fullDate: moment(date).format('DD-MMM-YYYY'),
    skipToEnd: skipToEnd
  }
  let captures = resp.getCapturesList()
  if (captures) {
    dayInfo.files = captures.map(cap => {
      return cap.toObject(false)
    })
  }
  if (mainWindow) {
    mainWindow.webContents.send('loaded-day', {
      doc: dayInfo
    })
  }
}
