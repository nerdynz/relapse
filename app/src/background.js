// const electron = require('electron')
import { app, BrowserWindow, dialog, ipcMain, Menu, protocol, shell, Tray } from 'electron';
const {spawn} = require('child_process');
// const BrowserWindow = electron.BrowserWindow
// const dialog = electron.dialog
// const ipcMain = electron.ipcMain
// const Menu = electron.Menu
// const shell = electron.shell
// const Tray = electron.Tray
const path = require('path') 
const moment = require('moment')
const PROTO_PATH = path.resolve(__dirname, '../src/') + '/relapse.proto';

const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

let packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });


let mainLog = []

let mainWindow
let aboutWindow
let settingsWindow
let tray

const binPath = path.resolve(__dirname, '../src/bin/')
const imagePath = path.resolve(__dirname, '../src/assets/')
const winURL = `http://localhost:8080`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    title: 'Relapse',
    height: 900,
    width: 1440,
    // backgroundColor: '#252830',
    // icon: image('Timesheet.png'),
    // transparent: true,
    titleBarStyle: 'hiddenInset',
    vibrancy: 'appearance-based',
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true
    }
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('focus', () => {
    mainWindow.webContents.send("window-focus")
  })

  mainWindow.on('blur', () => {
    mainWindow.webContents.send("window-blur")
  })

  log('mainWindow opened')
}

let trayContextMenu

function createTrayAndMenusAndShortcuts () {
  let show = function () {
    if (!mainWindow) {
      createWindow()
    } else {
      mainWindow.show()
    }
  }

  let toggleCapture = function () {
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

  let quit = function () {
    app.quit()
  }

  let resetZoom = function () {
    if (mainWindow) { mainWindow.webContents.send('zoom-function', 'reset') }
  }

  let zoomIn = function () {
    if (mainWindow) { mainWindow.webContents.send('zoom-function', 'in') }
  }

  let zoomOut = function () {
    if (mainWindow) { mainWindow.webContents.send('zoom-function', 'out') }
  }

  let today = function () {
    if (mainWindow) { mainWindow.webContents.send('day-function', 'today') }
  }
  let nextDay = function () {
    if (mainWindow) { mainWindow.webContents.send('day-function', 'nextDay') }
  }
  let prevDay = function () {
    if (mainWindow) { mainWindow.webContents.send('day-function', 'prevDay') }
  }

  let launchWebsite = function () {
    shell.openExternal('http://relapse.nerdy.co.nz/')
  }
  // var launchWebsiteHelp = function () {
  //   shell.openExternal('http://relapse.nerdy.co.nz/help')
  // }
  let launchWebsiteFAQ = function () {
    shell.openExternal('http://relapse.nerdy.co.nz/faq')
  }
  let launchReport = function () {
    shell.openExternal('http://relapse.nerdy.co.nz/feedback')
  }
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
  }

  let goLeft = function () {
    if (mainWindow) { mainWindow.webContents.send('arrow-pressed', 'left') }
  }

  let goRight = function () {
    if (mainWindow) { mainWindow.webContents.send('arrow-pressed', 'right') }
  }

  let showAboutScreen = function () {
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
      titleBarStyle: 'hidden-inset',
      webPreferences: {
        webSecurity: false
      }
    })

    aboutWindow.loadURL(winURL + '#/about')
    aboutWindow.on('closed', () => {
      aboutWindow = null
    })
  }

  function showPreferencesScreen () {
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
      titleBarStyle: 'hidden-inset',
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

  let  sub = [
    { label: 'Show Tips', type: 'normal', click: showTips },
    { label: 'About', type: 'normal', click: showAboutScreen },
    { type: 'separator' },
    // {label: 'Relapse Help', type: 'normal', click: launchWebsiteHelp},
    { label: 'Website', type: 'normal', click: launchWebsite },
    { label: 'FAQ', type: 'normal', click: launchWebsiteFAQ },
    { label: 'Feedback / Report an Error', type: 'normal', click: launchReport }
  ]
  if (process.env.NODE_ENV === 'development') {
    sub = [
      { label: 'Show Tips', type: 'normal', click: showTips },
      { label: 'About', type: 'normal', click: showAboutScreen },
      { type: 'separator' },
      // {label: 'Relapse Help', type: 'normal', click: launchWebsiteHelp},
      { label: 'Website', type: 'normal', click: launchWebsite },
      { label: 'FAQ', type: 'normal', click: launchWebsiteFAQ },
      { label: 'Feedback / Report an Error', type: 'normal', click: launchReport },
      { role: 'reload' },
      { role: 'toggledevtools' }
    ]
  }
    
    const mainMenu = Menu.buildFromTemplate([
    {
      label: 'Relapse',
      submenu: [
        { label: 'Preferences', type: 'normal', click: showPreferencesScreen, accelerator: 'Command+,' },
        { label: 'Quit', type: 'normal', click: quit, accelerator: 'Command+Q' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Zoom In', type: 'normal', click: zoomIn, accelerator: 'Command+=' },
        { label: 'Zoom Out', type: 'normal', click: zoomOut, accelerator: 'Command+-' },
        { label: 'Reset Zoom', type: 'normal', click: resetZoom, accelerator: 'Command+0' }
      ]
    },
    {
      label: 'Navigation',
      submenu: [
        { label: 'Today', type: 'normal', click: today, accelerator: 'Command+T' },
        { label: 'Next Day', type: 'normal', click: nextDay, accelerator: 'Command+Right' },
        { label: 'Prev Day', type: 'normal', click: prevDay, accelerator: 'Command+Left' },
        { type: 'separator' },
        { label: 'Next Minute', type: 'normal', click: goRight, accelerator: 'Right' },
        { label: 'Prev Minute', type: 'normal', click: goLeft, accelerator: 'Left' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { label: 'Show Window', type: 'normal', click: show, accelerator: 'Command+N' },
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
      submenu: sub
    }
  ])

  Menu.setApplicationMenu(mainMenu)

  tray = new Tray(image('Rewind.png'))
  tray.setPressedImage(image('Rewind.png'))
  trayContextMenu = Menu.buildFromTemplate([
    { label: 'Show Window', type: 'normal', click: show },
    { type: 'separator' },
    { label: 'Capturing Screen', type: 'checkbox', checked: true, click: toggleCapture },
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

app.on('ready', () => {
  const protocolName = 'relapse-image'
  protocol.registerFileProtocol(protocolName, (request, callback) => {
    const url = request.url.replace(`${protocolName}://`, '')
    try {
      return callback(decodeURIComponent(url))
    }
    catch (error) {
      // Handle the error as needed
      console.error(error)
    }
  })

  let relapse_proto = grpc.loadPackageDefinition(packageDefinition).relapse_proto;

  let capturePath = app.getPath('documents') + '/RelapseScreenshots/'
  let userDataPath = app.getPath('userData') + "/"
  console.log('bin: ', binPath + '/relapse-daemon')
  console.log('capturePath: ', capturePath)
  console.log('userDataPath: ', userDataPath)

  let child = spawn(binPath + '/relapse-daemon', ['--capture-path', capturePath, '--userdata-path', userDataPath])
  
  // console.log('cp: ', child)
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', function(data) {
      //Here is where the output goes
      console.log('stdout: ' + data);
  });
  
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', function(data) {
      //Here is where the error output goes
      console.log('stderr: ' + data);
  });

  let client = new relapse_proto.Relapse('localhost:3333', grpc.credentials.createInsecure());
  console.log(client)


  createWindow()
  createTrayAndMenusAndShortcuts()

  // communication with app. think of this as the router
  ipcMain.on('maximize', () => {
    mainWindow.maximize()
  })
  // ipcMain.on('open-capture-path', () => {
  //   log(`open ${forcedCapturePath}/RelapseScreenshots`)
  //   worker.exec(`open ${forcedCapturePath}/RelapseScreenshots`)
  //   // electron.shell.showItemInFolder(app.getPath('appData') + '/RelapseScreenshots') // TEMP capturepath stuffs
  // })
  ipcMain.on('load-day', (event, date, skipToEnd) => {
    var mDate = moment(date)
    let doc = {}
    // wierd date format... give me something to work with easily..
    doc.fullDate = moment(date).format('DD-MMM-YYYY')
    doc.skipToEnd = skipToEnd
    client.GetCapturesForADay({
      CaptureDayTimeSeconds: mDate.startOf('day').unix()
    }, (err, resp) => {
      if (err) {
        console.error(err)
      }
      if (resp && resp.Captures) {
        doc.files = resp.Captures
        console.log(resp.Captures)
      }
      event.sender.send('loaded-day', {
        doc
      })
    })
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

  ipcMain.on('show-log', (event) => {
    event.sender.send('update-log', mainLog)
  })

  ipcMain.on('close-settings', (event) => {
    settingsWindow.close()
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

  ipcMain.on('open-dialog', (event) => {
    let result = dialog.showOpenDialog({ properties: ['openDirectory'] })
    if (result && result.length > 0) {
      event.sender.send('filepath-changed', result[0])
    }
  })
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

function image (imageName) {
  console.log('imagePath', imagePath)
  return imagePath + '/' + imageName
}

// function getSettings (callback) {
//   db.findOne({
//     settings: 'all'
//   }, (err, settings) => {
//     // handle any errors
//     if (err) {
//       callback(err, null)
//       return
//     }

//     if (settings == null) {
//       // insert the day as well as its files
//       let newSettings = {
//         settings: 'all',
//         capturePath: forcedCapturePath,
//         screenshotDaysDuration: 30,
//         isCapturing: true,
//         isHelpShown: true
//       }
//       db.insert(newSettings, (err, updatedSettings) => {
//         if (err) {
//           callback(err, null)
//           return
//         }
//         callback(null, updatedSettings)
//       })
//     } else {
//       callback(null, settings)
//     }
//   })
// }

// function setSettings (newSettings, callback) {
//   db.findOne({
//     settings: 'all'
//   }, (err, oldSettings) => {
//     // handle any errors
//     if (err) {
//       callback(err, null)
//       return
//     }
//     if (!oldSettings) {
//       callback('cannot find settings.....', null)
//       return
//     }

//     log('old', oldSettings)
//     log('new', newSettings)

//     // == capturePath
//     // __________________________________________________________________
//     if (oldSettings.capturePath !== newSettings.capturePath) {
//       mkdirp(newSettings.capturePath + '/test', (err) => {
//         if (err) {
//           callback(err, oldSettings)
//           return
//         }

//         rimraf(newSettings.capturePath + '/test', (err) => {
//           if (err) {
//             callback(err, oldSettings)
//             return
//           }

//           db.update({ settings: 'all' }, { $set: { capturePath: newSettings.capturePath } }, {}, (err, numUpdated) => {
//             if (err) {
//               callback(err, oldSettings)
//               return
//             }
//             screenCap.setCapturePath(newSettings.capturePath)
//             setSettings(newSettings, callback) // recursively call to make sure we get all the posible settings without getting into super cb hell.
//           })
//         })
//       })
//     }

//     // == screenshotDaysDuration
//     // __________________________________________________________________
//     if (oldSettings.screenshotDaysDuration !== newSettings.screenshotDaysDuration) {
//       db.update({ settings: 'all' }, { $set: { screenshotDaysDuration: newSettings.screenshotDaysDuration } }, {}, (err, numUpdated) => {
//         if (err) {
//           callback(err, oldSettings)
//         }
//       })
//       setSettings(newSettings, callback) // recursively call to make sure we get all the posible settings
//     }

//     if (oldSettings.isCapturing !== newSettings.isCapturing && typeof (newSettings.isCapturing) !== 'undefined') {
//       db.update({ settings: 'all' }, { $set: { isCapturing: newSettings.isCapturing } }, {}, (err, numUpdated) => {
//         if (err) {
//           callback(err, oldSettings)
//         }
//       })
//       setSettings(newSettings, callback) // recursively call to make sure we get all the posible settings
//     }

//     if (oldSettings.isHelpShown !== newSettings.isHelpShown && typeof (newSettings.isHelpShown) !== 'undefined') {
//       db.update({ settings: 'all' }, { $set: { isHelpShown: newSettings.isHelpShown } }, {}, (err, numUpdated) => {
//         if (err) {
//           callback(err, oldSettings)
//         }
//       })
//       setSettings(newSettings, callback) // recursively call to make sure we get all the posible settings
//     }

//     // we are finally done!!
//     callback(null, oldSettings)
//   })
// }

// function deleteFilesForDay (date) {
//   getSettings((err, settings) => {
//     if (err) {
//       log('error in delete from getting settings', err)
//       return
//     }
//     let duration = settings.screenshotDaysDuration
//     if (typeof (duration) === 'undefined') {
//       duration = 30
//     }
//     log('duration', duration)
//     date = moment(date).subtract(duration, 'days')
//     log('deleting entries for ', date.format('DD-MM-YYYY'))
//     db.findOne({
//       day: date.format('YY-DDD')
//     }, (err, doc) => {
//       if (err) {
//         log('error no doc to be found most likely', err)
//         return
//       }
//       let filepaths = []

//       if (doc && doc.files) {
//         for (let i = 0; i < doc.files.length; i++) {
//           let screenshot = doc.files[i]
//           let parts = screenshot.filepath.split('/')
//           parts[parts.length - 1] = '' // set last part to be empty
//           let filepath = parts.join('/')
//           let isInFilePaths = false
//           for (let j = 0; j < filepaths.length; j++) {
//             let existingFilepath = filepaths[j]
//             if (filepath === existingFilepath) {
//               isInFilePaths = true
//               break
//             }
//           }

//           if (!isInFilePaths) {
//             filepaths.push(filepath)
//           }
//         }
//       }

//       log('deleting filepaths', filepaths)
//       filepaths.forEach((path, index) => {
//         if (path.indexOf('RelapseScreenshots') === -1) {
//           log("trying to delete a folder that shouldn't be deleted")
//           return
//         }
//         rimraf(path, (err) => {
//           log(err)
//         })
//       })
//     })

//     // finally remove the entries themselves
//     db.remove({
//       day: date.format('YY-DDD')
//     }, {}, function (err, numRemoved) {
//       log('removing entries', err, numRemoved)
//       // numRemoved = 1
//     })
//   })
// }

function log (a, b, c, d, e, f, g, h, i) {
  let msg = a
  if (b) { msg += ', ' + JSON.stringify(b) }
  if (c) { msg += ', ' + JSON.stringify(c) }
  if (d) { msg += ', ' + JSON.stringify(d) }
  if (e) { msg += ', ' + JSON.stringify(e) }
  if (f) { msg += ', ' + JSON.stringify(f) }
  if (g) { msg += ', ' + JSON.stringify(g) }
  if (h) { msg += ', ' + JSON.stringify(h) }
  if (i) { msg += ', ' + JSON.stringify(i) }
  if (mainLog.length > 100) {
    mainLog.splice(0, 1)
  }
  mainLog.push(msg)

  if (process.env.NODE_ENV === 'development') {
    console.log(msg)
  }
}


