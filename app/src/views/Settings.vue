<template>
  <div class="settings">
    <!-- <div class='settings'>
      <h1>Preferences</h1>
      <div class="form-field">
        <label>Screenshot Capture Path</label>
        <file-picker :value="path"></file-picker>
      </div>
      <div class="form-field">
        <label>Delete screenshots older than X days</label>
        <numeric :min='0' :max='61' v-model="screenshotDuration"></numeric>
      </div>
      <div :class="'msg '+settingsMessage.msgType+'-msg'" >
        {{settingsMessage.msg}}
      </div>
      <div class="form-field">
        <button class="btn save-btn" @click="doSave">Save</button>
        <button class="btn cancel-btn" @click="doCancel">Cancel</button>
      </div>
    </div> -->
  </div>
</template>

<script>
// import FilePicker from './FilePicker'
// import Numeric from './Numeric'
// import {mapGetters, mapActions} from 'vuex'
import { Vue, Options } from 'vue-class-component'

@Options({
  components: {}
})
export default class Settings extends Vue {}

//   computed: {
//     ...mapGetters([
//       'settings',
//       'settingsMessage',
//       'capturePath'
//     ])
//   },
//   watch: {
//     'capturePath': function () {
//       console.log('happening')
//       this.path = this.capturePath
//     },
//     'settings': function () {
//       if (this.settings.screenshotDaysDuration) {
//         this.screenshotDuration = this.settings.screenshotDaysDuration
//       }
//     }
//   },
//   methods: {
//     ...mapActions([
//       'loadSettings',
//       'saveSettings',
//       'closeSettings'
//     ]),
//     doSave () {
//       console.log('duration', this.screenshotDuration)
//       console.log('this.path', this.path)
//       let newSettings = {
//         capturePath: this.path,
//         screenshotDaysDuration: this.screenshotDuration
//       }
//       this.saveSettings(newSettings)
//     },
//     doCancel () {
//       this.closeSettings()
//       // this.saveSettings({
//       //   capturePath: this.capturePath,
//       //   screenshotDaysDuration: this.screenshotDaysDuration
//       // })
//     }
//   },
//   mounted: function () {
//     this.loadSettings()
//   },
//   data: function () {
//     return {
//       path: 'no path selected',
//       screenshotDuration: 30
//     }
//   }
// }
</script>

<style lang="scss">
@import '../scss/variables';

img {
  margin-top: -25px;
  width: 450px;
}

.settings {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
  min-width: 460px;
  color: $color-light-grey;
  background: $color-bg;
  display: block;
  padding: 40px;
  -webkit-app-region: drag;

  .msg {
    margin-bottom: 10px;
    font-size: 16px;

    &.error-msg {
      color: $color-red;
    }
    &.ok-msg {
      color: $color-green;
    }
  }

  .file-input-wrapper {
    -webkit-app-region: no-drag;

    .change-path-button {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      width: 30%;
      background: $light-theme-input-bg;
      color: $color-light-grey;
      outline: none !important;

      &:hover {
        background: $color-med-bg;
      }
      &:active {
        background-color: $color-blue;
      }
    }
  }

  .block {
    text-align: left;
  }

  .form-field {
    margin-bottom: 12px;
    -webkit-app-region: no-drag;
  }

  .numeric-input-wrapper {
    -webkit-app-region: no-drag;
    * {
      -webkit-app-region: no-drag;
    }

    width: 100px;
    .number-btn {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      width: 30%;
      background: $light-theme-input-bg;
      color: $color-light-grey;
      outline: none !important;
      border: none;

      &:hover {
        background: $color-med-bg;
      }
      &:active {
        background-color: $color-blue;
      }

      &.number-up {
        border-top-right-radius: 6px;
      }
      &.number-down {
        border-bottom-right-radius: 6px;
      }
    }
  }

  h1 {
    font-weight: normal;
    color: $color-white;
    margin: 10px 0;
  }

  h3 {
    font-weight: normal;
    color: $color-white;
    margin: 10px;
  }

  h4 {
    font-weight: normal;
    color: $color-white;
    margin: 10px;
  }

  label {
    margin-bottom: 6px;
    display: block;
  }
}

.icon {
  width: 25%;
  height: 25%;
}

#fileUrl {
}
</style>
