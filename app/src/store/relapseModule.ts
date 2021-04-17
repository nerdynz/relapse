import { DayInfo } from '@/interfaces/dayInfo.interface'
import { RelapseSettings } from '@/interfaces/state.interface'
import { ipcRenderer } from 'electron'
import { Action, Module, Mutation, VuexModule } from 'vuex-class-modules'
// serverEvents.registerEvents(store)
// export default store
import { store } from './index'

@Module
class RelapseModule extends VuexModule {
  screenshotDaysDuration = 30
  screenshotCapturePath = ''
  isHelpShown = false

  settingsMessage = {
    msg: '',
    msgType: ''
  }

  day: DayInfo = {
    fullDate: '',
    files: [],
    skipToEnd: false
  }

  get currentDay () {
    return this.day
  }

  get settings (): any {
    return {
      screenshotDaysDuration: this.screenshotDaysDuration,
      capturePath: this.capturePath
    }
  }

  get capturePath () {
    return this.settings.screenshotCapturePath
  }

  @Mutation
  updateCapturePath (capturePath: string) {
    this.screenshotCapturePath = capturePath
  }

  // @Mutation
  // updateSettings(settings: RelapseSettings) {
  //   this = settings
  // }
  // @Mutation
  // updateSettingsMessage(msg: any) {
  //   state.settingsMessage = msg
  // }

  @Mutation
  setDay (day: DayInfo) {
    if (!day.files) {
      day.files = []
    }
    this.day = day
  }
  // @Mutation
  // addScreenshot(day) {
  //   // only change if day is the same
  //   if (day.fullDate === state.day.fullDate) {
  //     state.day = day
  //   }
  // }

  @Action
  loadSettings () {
    ipcRenderer.send('load-settings')
  }

  @Action
  saveSettings (settings: RelapseSettings) {
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
  changeDay (day: DayInfo) {
    this.setDay(day)
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
