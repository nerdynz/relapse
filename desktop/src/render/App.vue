<template>
  <div
    class="main-body"
    :class="{ 'is-focused': isFocused, 'is-blurred': !isFocused }"
  >
    <div class="handlebar" @click="handleClick"></div>
    <!-- <help-view v-if="settings.isHelpShown"></help-view> -->
    <settings v-if="isSettingsView" />
    <screenshot-viewer v-else />
  </div>
</template>

<script lang="ts">
import ScreenshotViewer from "@render/components/ScreenshotViewer.vue";
import { Options, Vue } from "vue-class-component";
import Settings from "./views/Settings.vue";

@Options({
  components: {
    ScreenshotViewer,
    Settings,
  },
})
export default class App extends Vue {
  isFocused = true;
  clicks = 0;
  totalMinutesWorked = 0;

  get isSettingsView() {
    return window.location.hash === "#settings";
  }

  handleClick() {
    this.clicks++;
    if (this.clicks === 1) {
      setTimeout(() => {
        if (this.clicks === 1) {
          // this.singleClick()
        } else {
          // this.doubleClick()
          this.$ipc.send("maximize");
        }
        this.clicks = 0;
      }, 225);
    }
  }

  onWindowBlur() {
    this.isFocused = false;
  }

  onWindowFocus() {
    this.isFocused = true;
  }

  created() {
    this.$ipc.receive("window-blur", this.onWindowBlur);
    this.$ipc.receive("window-focus", this.onWindowFocus);
    console.log("document.title", document.title);
  }
}
</script>

<style lang="scss">
:root {
  --theme-titlebar-bg: hsl(0deg 0% 100% / 50%);
  --theme-unfocused-bg: #e6e6e6;
  --theme-unfocused-text-color: #acacac;
  --theme-lines-between-color: #b3b3b3;
  --theme-text-color: #515151;
  --theme-text-heading-color: #444444;
  --theme-text-subheading-color: #555555;
  --theme-input-active-bg: hsl(0deg 0% 85% / 98%);
  --theme-input-hover-bg: hsl(0deg 0% 85% / 98%);
  --theme-input-bg: hsl(0deg 0% 92% / 98%);
  // --theme-input-bg-transparency: hsl(0deg 0% 95% / 50%);
  --theme-input-row-odd: #ffffff;
  --theme-input-row-even: #f4f5f5;
}

@media (prefers-color-scheme: dark) {
  :root {
    --theme-titlebar-bg: hsl(0deg 0% 20% / 60%);
    --theme-unfocused-bg: #e6e6e6;
    --theme-unfocused-text-color: #acacac;
    --theme-lines-between-color: #403f3e;
    --theme-text-color: rgba(255, 255, 255, 0.87);
    --theme-text-heading-color: rgba(255, 255, 255, 0.74);
    --theme-text-subheading-color: rgba(255, 255, 255, 0.67);
    --theme-input-active-bg: hsl(0deg 0% 20% / 98%);
    --theme-input-hover-bg: hsl(0deg 0% 15% / 98%);
    --theme-input-bg: hsl(0deg 0% 10% / 98%);
    // --theme-input-bg-transparency: hsl(0deg 0% 10% / 50%);
    --theme-input-row-odd: #444;
    --theme-input-row-even: #666;
  }
}

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
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
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

#app {
  width: 100%;
  height: 100%;
}

.main-body {
  width: 100%;
  height: 100%;
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
    color: $theme-text-color;
  }

  &.is-blurred {
    .content,
    .handlebar {
      // background-color: $theme-unfocused-bg;
      color: $theme-unfocused-text-color;
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
  // box-shadow: 0 0 12px $theme-lines-between-color;
  z-index: 20;
}

.has-text-centered {
  text-align: center;
}
.pt-1 {
  padding-top: 4px;
}
</style>
