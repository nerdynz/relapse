<template>
  <div class="settings">
    <div v-if="isLoaded" class="settings-content">
      <h1 class="title">Settings</h1>
      <div class="form-field">
        <label>Retain Screenshots for Days</label>
        <numeric
          :min="6"
          :max="91"
          :value="appSettings.retainforxdays"
          @updated="updateRetainForX"
        />
      </div>
      <div class="form-field">
        <label> Active application capture rejection </label>
        <div class="app-exclusions">
          <table>
            <tr
              class=""
              v-for="app in options.capturedapplicationsList"
              :key="app.appname"
            >
              <td class="app-name">
                {{ app.appname }}
              </td>
              <td>
                <app-rejection-toggle
                  :app="app"
                  :rejections="appSettings.rejectionsList"
                  @input="
                    isCapturing => {
                      updateRejections(app, isCapturing)
                    }
                  "
                />
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// import FilePicker from './FilePicker'
import Numeric from '@/components/Numeric.vue'
import AppRejectionToggle from '@/components/AppRejectionToggle.vue'
import { ApplicationInfo } from '@/grpc/relapse_pb'
// import {mapGetters, mapActions} from 'vuex'
import { relapseModule } from '@/store/relapseModule'
import { Vue, Options } from 'vue-class-component'
import { clone, remove } from 'ramda'

@Options({
  components: {
    Numeric,
    AppRejectionToggle
  }
})
export default class Settings extends Vue {
  get isLoaded () {
    if (relapseModule.appSettings) {
      return true
    }
    return false
  }

  get appSettings () {
    return relapseModule.appSettings
  }

  get options () {
    return relapseModule.settingsOptions
  }

  mounted () {
    relapseModule.loadSettings()
  }

  updateRetainForX (val: number) {
    if (this.appSettings) {
      // let settings = { ...relapseModule.appSettings! }
      let settings = clone(relapseModule.appSettings!)
      settings.retainforxdays = val
      relapseModule.saveSettings(settings)
    }
  }

  updateRejections (
    app: ApplicationInfo.AsObject,
    captureState: 'CAPTURING' | 'REJECTING'
  ) {
    if (this.appSettings) {
      console.log('app', app)
      // let settings = { ...relapseModule.appSettings! }
      let settings = clone(relapseModule.appSettings!)
      console.log('settings', settings)
      if (!settings.rejectionsList) {
        settings.rejectionsList = []
      }
      let appNameIndex = settings.rejectionsList.indexOf(app.apppath)
      console.log('appNameIndex', appNameIndex, captureState)
      console.log('appNameIndex', appNameIndex)

      // this logic seems a little backwards because we are managing a list of rejections
      if (captureState === 'CAPTURING') {
        if (appNameIndex >= 0) {
          settings.rejectionsList = remove(
            appNameIndex,
            1,
            settings.rejectionsList
          )
        }
      } else {
        if (appNameIndex === -1) {
          settings.rejectionsList.push(app.apppath)
        }
      }
      console.log('settings.rejectionsList', settings.rejectionsList)
      relapseModule.saveSettings(settings)
    }
  }
}
</script>

<style lang="scss">
.app-exclusions {
  border: 1px solid $light-theme-lines-between-color;
  border-radius: $radius;
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  max-height: 60vh;
  table {
    width: 100%;
    border-collapse: collapse;

    td.app-name {
      width: 100%;
      padding: 0.75rem;
      color: $light-theme-text-color;
    }

    tr:nth-child(odd) {
      th,
      td {
        background: $light-theme-input-row-odd;
      }
    }
    tr:nth-child(even) {
      th,
      td {
        background: $light-theme-input-row-even;
      }
    }
  }
}

.settings {
  position: absolute;
  top: $handlebar-height;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
  min-width: 460px;
  background: transparent;
  display: block;
  display: flex;
  flex-direction: column;
  border-top: 1px solid $light-theme-lines-between-color;

  h1.title {
    color: $light-theme-text-color;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  label {
    display: block;
    color: $light-theme-text-color;
    font-weight: 600;
    margin-bottom: 0.5rem !important;
  }

  .title-bar {
    -webkit-app-region: drag;
    height: 85px;
    border-bottom: 1px solid $light-theme-lines-between-color;
  }
  .settings-content {
    padding: 30px;
    // background: $light-theme-bg;
    flex-grow: 2;
  }

  .msg {
    margin-bottom: 10px;
    font-size: 1$radius;

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
    width: 70px;
    border-top-left-radius: $radius;
    border-bottom-left-radius: $radius;

    .number-btn {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      width: 30%;
      background: $light-theme-input-bg;
      color: $color-light-grey;
      outline: none !important;
      border: none;

      &:hover {
        background: $light-theme-input-active-bg;
      }

      &.number-up {
        border-top-right-radius: $radius;
      }
      &.number-down {
        border-bottom-right-radius: $radius;
      }
    }
  }
}
</style>
