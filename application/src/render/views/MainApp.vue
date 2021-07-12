<template>
  <div class="handlebar" @click="handleClick"></div>
  <!-- <help-view v-if="settings.isHelpShown"></help-view> -->
  <screenshot-viewer />
</template>

<script lang="ts">
import ScreenshotViewer from '@/components/ScreenshotViewer.vue'
import { relapseModule } from '@/store/relapseModule'

import { ipcRenderer } from 'electron'
import { Vue, Options } from 'vue-class-component'

@Options({
  components: {
    ScreenshotViewer
  }
})
export default class MainApp extends Vue {
  clicks = 0
  totalMinutesWorked = 0

  handleClick () {
    this.clicks++
    if (this.clicks === 1) {
      setTimeout(() => {
        if (this.clicks === 1) {
          // this.singleClick()
        } else {
          // this.doubleClick()
          ipcRenderer.send('maximize')
        }
        this.clicks = 0
      }, 250)
    }
  }
}
</script>
