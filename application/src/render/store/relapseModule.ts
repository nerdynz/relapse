import { ipcRenderer } from 'electron'
import { IpcRendererEvent } from 'electron/renderer'
import { Action, Module, Mutation, VuexModule } from 'vuex-class-modules'
import {
  DayResponse,
  Settings,
  SettingsOptions,
  SettingsPlusOptions
} from '../../grpc/relapse_pb'
// serverEvents.registerEvents(store)
// export default store
import { store } from './index'

@Module
class RelapseModule extends VuexModule {
  // screenshotDaysDuration = 30
  // screenshotCapturePath = ''

  isHelpShown = false
  
  day: DayResponse.AsObject | null = null
  
  settingOptions: SettingsOptions.AsObject | null = null
  settings: Settings.AsObject | null = null
  isPreferencesShowing = false
  
  get currentDate() {
    let date = new Date()
    if (this.currentDay) {
      console.log('this.currentDay.capturedaytimeseconds', this.currentDay.capturedaytimeseconds)
      let ms = this.currentDay.capturedaytimeseconds * 1000
      date = new Date(ms)
    }
    return date
  }

  get currentDay () {
    return this.day
  }

  get currentDaySummary () {
    return this.day?.summary
  }

  get appSettings () {
    if (this.settings) {
      return this.settings
    }
    return null
  }

  get settingsOptions () {
    if (this.settingOptions) {
      return this.settingOptions
    }
    return null
  }

  @Mutation
  setSettingsPlusOptions (settings: SettingsPlusOptions.AsObject) {
    this.settingOptions = settings.settingsoptions
      ? settings.settingsoptions
      : null
    this.settings = settings.settings ? settings.settings : null
  }

  @Mutation
  setSettings (settings: Settings.AsObject) {
    this.settings = settings || null
  }

  @Mutation
  togglePreferences (toggle?: boolean) {
    console.log('toogle', toggle)
    if (typeof toggle !== 'undefined') {
      this.isPreferencesShowing = toggle
    } else {
      this.isPreferencesShowing = !this.isPreferencesShowing
    }
  }
  // @Mutation
  // updateSettingsMessage(msg: any) {
  //   state.settingsMessage = msg
  // }

  // @Mutation
  // addScreenshot(day) {
  //   // only change if day is the same
  //   if (day.fullDate === state.day.fullDate) {
  //     state.day = day
  //   }
  // }
  @Action
  changePreferences (toggle: boolean) {
    this.togglePreferences(toggle)
  }

  @Action
  loadSettings () {
    ipcRenderer.send('load-settings')
  }

  @Action
  saveSettings (settings: Settings.AsObject) {
    ipcRenderer.send('change-settings', settings)
  }

  @Action
  closeSettings () {
    ipcRenderer.send('close-settings')
  }

  // @Action
  // updateSettings(settings) {
  //   commit(types.UPDATE_SETTINGS, settings)
  // }
  // @Action
  // updateSettingsMessage(msg) {
  //   commit(types.UPDATE_SETTINGS_MESSAGE, msg)
  //   setTimeout(() => {
  //     commit(types.UPDATE_SETTINGS_MESSAGE, '')
  //   }, 2000)
  // }

  @Action
  changeDay (day: DayResponse.AsObject) {
    this.setDay(day)
  }

  @Mutation
  setDay (day: DayResponse.AsObject) {
    this.day = day
  }

  // @Action
  // addScreenshot(day: DayInfo) {
  //   this.setDay(day)
  //   commit(types.ADD_SCREENSHOT, day)
  // }

  @Action
  loadDayFromServer ({ date, skipToEnd }: any) {
    // console.log("skip", skipToEnd);
    ipcRenderer.send('load-day', date, skipToEnd)
  }

  @Action
  openDialogBox () {
    ipcRenderer.send('open-dialog')
  }

  @Action
  openCapturePath () {
    ipcRenderer.send('open-capture-path')
  }

  // @Action
  // filePathChanged(filePath) {
  //   commit(types.UPDATE_CAPTURE_PATH, filePath)
  // }

  // @Action
  // checkLog() {
  //   ipcRenderer.send('show-log')
  // }
}
export const relapseModule = new RelapseModule({ store, name: 'relapse' })

ipcRenderer.on(
  'loaded-settings',
  (ev: IpcRendererEvent, settings: SettingsPlusOptions.AsObject) => {
    relapseModule.setSettingsPlusOptions(settings)
  }
)
ipcRenderer.on(
  'changed-settings',
  (ev: IpcRendererEvent, settings: Settings.AsObject) => {
    relapseModule.setSettings(settings)
  }
)
ipcRenderer.on(
  'loaded-day',
  (ev: IpcRendererEvent, day: DayResponse.AsObject) => {
    relapseModule.changeDay(day)
  }
)
ipcRenderer.on(
  'show-preferences',
  (ev: IpcRendererEvent, day: DayResponse.AsObject) => {
    relapseModule.togglePreferences()
  }
)

//   // console.log('server event hooks registered')
//   // day loaded event
//   // ipcRenderer.on('update-log', function (ev, log) {
//   //   // console.log('updat', log)
//   //   store.dispatch('updateLog', log)
//   // })
//   // ipcRenderer.on('loaded-settings', function (ev, settings) {
//   //   store.dispatch('updateSettings', settings)
//   // })
//   // ipcRenderer.on('changed-settings', function (ev, msg, settings) {
//   //   store.dispatch('updateSettings', settings)
//   //   if (typeof msg === 'object') {
//   //     store.dispatch('updateSettingsMessage', msg)
//   //   }
//   // })
//   // ipcRenderer.on('screenshot-created', function (ev, day) {
//   //   console.log(day)
//   //   if (day) {
//   //     store.dispatch('addScreenshot', day)
//   //   }
//   // })
//   // ipcRenderer.on('filepath-changed', function (ev, filepath) {
//   //   if (filepath) {
//   //     store.dispatch('filePathChanged', filepath)
//   //   }
//   // })
// }
