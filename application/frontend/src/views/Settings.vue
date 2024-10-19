<template>
  <div class="settings">
    <div class="title-bar">
      <h4 class="title is-4 has-text-centered pt-1">Settings</h4>
    </div>
    <div v-if="isLoaded && appSettings && options" class="settings-content">
      <div class="form-field">
        <label>Retain Screenshots for Days</label>
        <numeric :min="6" :max="91" :value="appSettings.RetainForXDays" @updated="updateRetainForX" />
      </div>
      <div class="form-field">
        <label> Active application capture rejection </label>
        <div class="app-exclusions">
          <table>
            <tr class="" v-for="app in options.CapturedApplications" :key="app.AppName">
              <td class="app-name">
                {{ app.AppName }}
              </td>
              <td class="app-toggle">
                <app-rejection-toggle :app="app" :rejections="rejections" @input="updateRejections" />
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import AppRejectionToggle from "../components/AppRejectionToggle.vue";
import Numeric from "../components/Numeric.vue";
import { useRelapseStore } from "../store/relapse";
import { clone, remove } from "ramda";
import { computed, onMounted } from "vue";
import { ApplicationInfo } from "../relapse.pb"

const relapseModule = useRelapseStore()

// @Options({
//   components: {
//     Numeric,
//     AppRejectionToggle,
//   },
// })

const isLoaded = computed(() => {
  if (relapseModule.appSettings) {
    return true;
  }
  return false;
})

const appSettings = computed(() => {
  return relapseModule.appSettings?.Settings;
})

const rejections = computed(() => {
  return relapseModule.appSettings?.Settings.Rejections || [];
})

const options = computed(() => {
  return relapseModule.appSettings?.SettingsOptions;
})

onMounted(() => {
  relapseModule.loadSettings();
})

function updateRetainForX(val: number) {
  if (appSettings.value) {
    // let settings = { ...relapseModule.appSettings! }
    let settings = relapseModule.appSettings!.Settings
    settings.RetainForXDays = val;
    // relapseModule.saveSettings(settings);
  }
}

function updateRejections({
  app,
  state,
}: {
  app: ApplicationInfo;
  state: "CAPTURING" | "REJECTING";
}) {

  console.log(app, state)

  if (appSettings.value) {
    // let settings = { ...relapseModule.appSettings! }
    let settings = clone(relapseModule.appSettings!.Settings);
    if (!settings.Rejections) {
      settings.Rejections = [];
    }
    let appNameIndex = settings.Rejections.indexOf(app.AppName);
    console.log(('appNameIndex'), settings.Rejections, app.AppName, appNameIndex)

    // this logic seems a little backwards because we are managing a list of rejections
    if (state === "CAPTURING") {
      if (appNameIndex >= 0) {
        settings.Rejections = remove(
          appNameIndex,
          1,
          settings.Rejections
        );
      }
    } else {
      if (appNameIndex === -1) {
        settings.Rejections.push(app.AppName);
      }
    }
    relapseModule.saveSettings(settings);
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
  color: red;
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
    td.app-toggle{
      padding: 0 0.75rem;
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
    text-align: left;
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
