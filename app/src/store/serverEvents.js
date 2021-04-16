import { ipcRenderer } from 'electron'

export default {
  registerEvents: function (store) {
    // console.log('server event hooks registered')

    // day loaded event
    ipcRenderer.on('loaded-day', function (ev, { doc }) {
      console.log('doc', doc)
      store.dispatch('changeDay', doc)
    })

    ipcRenderer.on('update-log', function (ev, log) {
      // console.log('updat', log)
      store.dispatch('updateLog', log)
    })

    ipcRenderer.on('loaded-settings', function (ev, settings) {
      store.dispatch('updateSettings', settings)
    })

    ipcRenderer.on('changed-settings', function (ev, msg, settings) {
      store.dispatch('updateSettings', settings)
      if (typeof (msg) === 'object') {
        store.dispatch('updateSettingsMessage', msg)
      }
    })

    ipcRenderer.on('screenshot-created', function (ev, day) {
      console.log(day)
      if (day) {
        store.dispatch('addScreenshot', day)
      }
    })

    ipcRenderer.on('filepath-changed', function (ev, filepath) {
      if (filepath) {
        store.dispatch('filePathChanged', filepath)
      }
    })
  }
}
