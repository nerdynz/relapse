<template>
  <div class="handlebar" @click="handleClick"></div>
  <!-- <help-view v-if="settings.isHelpShown"></help-view> -->
  <screenshot-viewer @minutes-calculated="minuteCalc"></screenshot-viewer>
  <div class="content">Hours worked: {{ totalHoursWorked }}</div>
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

  goToSettings () {
    this.$router.push({ name: 'Settings' })
  }

  get totalHoursWorked (): string {
    const hours = Math.floor(this.totalMinutesWorked / 60)
    const minutes = this.totalMinutesWorked % 60
    let minuteStr = '' + minutes
    if (minutes < 10) {
      minuteStr = '0' + minutes
    }
    return `${hours}:${minuteStr}`
  }

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

  minuteCalc (mins: number) {
    this.totalMinutesWorked = mins
  }

  // created () {}
}
</script>
