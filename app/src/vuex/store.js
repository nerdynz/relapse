import { createStore } from "vuex"
import * as actions from './actions'
import * as getters from './getters'
import * as types from './mutation-types'
import serverEvents from './serverEvents'

const store = new createStore({
  state () {
    return {
      settings: {
        screenshotDaysDuration: 30,
        capturePath: ''
      },
      settingsMessage: {
        msg: '',
        msgType: ''
      },
      day: {
        files: [],
        fullDate: null,
        skipToEnd: false
      },
      log: [],
      isHelpShown: false
    }
  },
  mutations: {
    [types.UPDATE_CAPTURE_PATH] (state, capturePath) {
      state.settings.capturePath = capturePath
    },
    [types.UPDATE_SETTINGS] (state, settings) {
      state.settings = settings
    },
    [types.UPDATE_SETTINGS_MESSAGE] (state, msg) {
      state.settingsMessage = msg
    },
    [types.CHANGE_DAY] (state, day) {
      state.day = day
      if (!state.day.files) {
        state.day.files = []
      }
      console.log('todays files', state.day.files)
    },
    [types.ADD_SCREENSHOT] (state, day) {
      // only change if day is the same
      if (day.fullDate === state.day.fullDate) {
        state.day = day
      }
    },
    [types.UPDATE_LOG] (state, log) {
      state.log = log
    }
  },
  actions,
  getters,
})


serverEvents.registerEvents(store)

export default store