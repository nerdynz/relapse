import { ipcRenderer } from 'electron'
import * as types from './mutation-types'

export const loadSettings = () => {
  ipcRenderer.send('load-settings')
}

export const saveSettings = (state, settings) => {
  ipcRenderer.send('change-settings', settings)
}

export const closeSettings = () => {
  ipcRenderer.send('close-settings')
}

export const updateSettings = ({ commit }, settings) => {
  commit(types.UPDATE_SETTINGS, settings)
}
export const updateSettingsMessage = ({ commit }, msg) => {
  commit(types.UPDATE_SETTINGS_MESSAGE, msg)
  setTimeout(() => {
    commit(types.UPDATE_SETTINGS_MESSAGE, '')
  }, 2000)
}

export const changeDay = ({ commit }, day) => {
  commit(types.CHANGE_DAY, day)
}

export const addScreenshot = ({ commit }, day) => {
  commit(types.ADD_SCREENSHOT, day)
}

export const loadDayFromServer = (state, {date, skipToEnd}) => {
  // console.log('skip', skipToEnd)
  ipcRenderer.send('load-day', date, skipToEnd)
}

export const openDialogBox = () => {
  ipcRenderer.send('open-dialog')
}
export const openCapturePath = () => {
  ipcRenderer.send('open-capture-path')
}

export const filePathChanged = ({ commit }, filePath) => {
  commit(types.UPDATE_CAPTURE_PATH, filePath)
}

export const updateLog = ({ commit }, log) => {
  commit(types.UPDATE_LOG, log)
}

export const checkLog = () => {
  ipcRenderer.send('show-log')
}
