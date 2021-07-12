<template>
  <div
    class="main-body"
    :class="{ 'is-focused': isFocused, 'is-blurred': !isFocused }"
  >
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { RouterView } from 'vue-router'
import { ipcRenderer } from 'electron'
import { Vue, Options } from 'vue-class-component'
@Options({
  components: {
    RouterView
  }
})
export default class App extends Vue {
  isFocused = true

  onWindowBlur () {
    this.isFocused = false
  }

  onWindowFocus () {
    this.isFocused = true
  }

  created () {
    ipcRenderer.on('window-blur', this.onWindowBlur)
    ipcRenderer.on('window-focus', this.onWindowFocus)
  }
}
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
}

html {
  height: 100%;
}

body {
  height: 100%;
  display: flex;
  padding-top: $handlebar-height;
  // background-color: black;
  overflow-x: hidden;
  overflow-y: hidden;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  font-size: 13px;
  // background-color: var(--blue);
  @media (prefers-color-scheme: dark) {
    // background-color: var(--red);
  }
}

html {
  box-sizing: border-box;
}
*,
*:before,
*:after {
  box-sizing: inherit;
}

.btn,
.change-path-button {
  -webkit-app-region: no-drag;
  padding: 0 10px;
  font-size: 15px;
  height: 30px;
  border: none;
  border-radius: 6px;
  width: 45%;
  line-height: 30px;
  color: $color-white;
  -webkit-app-region: no-drag;
  outline: none !important;
  cursor: pointer;

  &.save-btn {
    background-color: $color-green;

    &:hover {
      background-color: $color-dark-green;
    }

    &:active {
      background-color: $color-light-green;
    }
  }

  &.cancel-btn {
    margin-left: 9%;
    background-color: $color-red;

    &:hover {
      background-color: $color-dark-red;
    }

    &:active {
      background-color: $color-light-red;
    }
  }
}

.main-body {
  .content {
    width: 100%;
    height: 30px;
    position: fixed;
    left: 0;
    bottom: 0;
    text-align: right;
    line-height: 30px;
    padding: 0 10px;
  }

  // window styling based on dark, light themes
  .content,
  .handlebar {
    // background-color: $light-theme-bg;
    color: $light-theme-text-color;
  }

  &.is-blurred {
    .content,
    .handlebar {
      // background-color: $light-theme-unfocused-bg;
      color: $light-theme-unfocused-text-color;
    }
  }
}

.handlebar {
  width: 100%;
  height: $handlebar-height;
  // background-color: $inactive-bg;
  // @media (prefers-color-scheme: dark) {
  //   background-color: $dark-bg;
  // }
  -webkit-app-region: drag;
  position: fixed;
  top: 0;
  left: 0;
}
</style>
