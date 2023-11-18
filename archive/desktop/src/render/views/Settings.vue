<template>
  <div class="settings">
    <div class="title-bar">
      <h4 class="title is-4 has-text-centered pt-1">Settings</h4>
    </div>
    <div v-if="isLoaded && appSettings && options" class="settings-content">
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
                  @input="updateRejections"
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
import AppRejectionToggle from "@render/components/AppRejectionToggle.vue";
import Numeric from "@render/components/Numeric.vue";
// import {mapGetters, mapActions} from 'vuex'
import { relapseModule } from "@render/store/relapseModule";
import { clone, remove } from "ramda";
import { Options, Vue } from "vue-class-component";
import { ApplicationInfo } from "../../grpc/relapse_pb";



@Options({
  components: {
    Numeric,
    AppRejectionToggle,
  },
})
export default class Settings extends Vue {
  get isLoaded() {
    if (relapseModule.appSettings) {
      return true;
    }
    return false;
  }

  get appSettings() {
    return relapseModule.appSettings;
  }

  get options() {
    return relapseModule.settingsOptions;
  }

  mounted() {
    relapseModule.loadSettings();
  }

  updateRetainForX(val: number) {
    if (this.appSettings) {
      // let settings = { ...relapseModule.appSettings! }
      let settings = clone(relapseModule.appSettings!);
      settings.retainforxdays = val;
      relapseModule.saveSettings(settings);
    }
  }

  updateRejections({
    app,
    state,
  }: {
    app: ApplicationInfo.AsObject;
    state: "CAPTURING" | "REJECTING";
  }) {
    if (this.appSettings) {
      // let settings = { ...relapseModule.appSettings! }
      let settings = clone(relapseModule.appSettings!);
      if (!settings.rejectionsList) {
        settings.rejectionsList = [];
      }
      let appNameIndex = settings.rejectionsList.indexOf(app.appname);

      // this logic seems a little backwards because we are managing a list of rejections
      if (state === "CAPTURING") {
        if (appNameIndex >= 0) {
          settings.rejectionsList = remove(
            appNameIndex,
            1,
            settings.rejectionsList
          );
        }
      } else {
        if (appNameIndex === -1) {
          settings.rejectionsList.push(app.appname);
        }
      }
      relapseModule.saveSettings(settings);
    }
  }
}
</script>

<style src="@vueform/toggle/themes/default.css"></style>

<style lang="scss">
:root {
  --toggle-width: 4.35rem;
  --toggle-bg-on: #48C75B;
  --toggle-border-on: #48C75B;
  --toggle-text-on: #fff;
  --toggle-bg-off: #FE6D46;
  --toggle-border-off: #FE6D46;
  --toggle-text-off: #fff;
}

.app-exclusions {
  border: 1px solid $theme-lines-between-color;
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
      color: $theme-text-color;
    }

    tr:nth-child(odd) {
      th,
      td {
        background: $theme-input-row-odd;
      }
    }
    tr:nth-child(even) {
      th,
      td {
        background: $theme-input-row-even;
      }
    }
  }
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
  display: block;
  display: flex;
  flex-direction: column;

  h1.title {
    color: $theme-text-heading-color;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  label {
    display: block;
    color: $theme-text-subheading-color;
    font-weight: 600;
    margin-bottom: 0.5rem !important;
  }

  .title-bar {
    -webkit-app-region: drag;
    height: 85px;
    border-bottom: 1px solid $theme-lines-between-color;
    background-color: $theme-titlebar-bg;
    color: $theme-text-heading-color;
  }

  .settings-content {
    padding: 30px;
    // background: $theme-bg;
    flex-grow: 2;
  }

  .msg {
    margin-bottom: 10px;
    font-size: 1;

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
      background: $theme-input-bg;
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
      background: $theme-input-bg;
      color: $color-light-grey;
      outline: none !important;
      border: none;

      &:hover {
        background: $theme-input-hover-bg;
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
