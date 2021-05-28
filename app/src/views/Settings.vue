<template>
  <div class="settings">
    <div class="title-bar">
      <h4 class="title-top">Relapse Preferences</h4>
    </div>
    <div v-if="isLoaded" class="settings-content">
      <ico icon="home" />
      {{ appSettings }}
      <div class="form-field">
        <label>Screenshot Capture Path</label>
        <file-picker :value="path"></file-picker>
      </div>
      <div class="form-field">
        <label>Retain screenshots for </label>
        <numeric
          :min="10"
          :max="61"
          :value="appSettings.retainforxdays"
        ></numeric>
      </div>
    </div>
  </div>
</template>

<script>
// import FilePicker from './FilePicker'
import Numeric from '@/components/Numeric'
// import {mapGetters, mapActions} from 'vuex'
import { relapseModule } from '@/store/relapseModule'
import { Vue, Options } from 'vue-class-component'

@Options({
  components: {
    Numeric
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

  mounted () {
    relapseModule.loadSettings()
  }
}
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
  background: transparent;
  display: block;
  display: flex;
  flex-direction: column;

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

  h4.title-top {
    color: $light-theme-text-color;
    font-weight: bold;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    text-align: center;
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
