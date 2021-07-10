import { join, resolve } from 'path';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process'
import { app, BrowserWindow } from 'electron';
import './router';
import './menu';
const isDev = process.env.NODE_ENV === 'development'
const WinURL = isDev
  ? `http://localhost:3000`
  : 'file://' + join(__dirname, '../../dist/render/index.html')

let mainWindow: BrowserWindow | null = null
let willQuitApp = false
let daemon: ChildProcessWithoutNullStreams;
const binPath = isDev ? resolve(__dirname, '../../dist/bin/') : resolve(__dirname, '../../dist/bin/')

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
  
  if (isDev) {
    // Open the DevTools.
    mainWindow.webContents.openDevTools()
  }
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
