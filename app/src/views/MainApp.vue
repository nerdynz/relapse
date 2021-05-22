<template>
  <div class="handlebar" @click="handleClick"></div>
  <button @click="goToSettings">hi</button>
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

  get settings () {
    return relapseModule.settings
  }

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

  created () {
    // console.log('server event hooks registered')

    // day loaded event
    ipcRenderer.on('loaded-day', function (ev, { doc }) {
      console.log('doc', doc)
      relapseModule.changeDay(doc)
      // store.dispatch('changeDay', doc)
    })

    // ipcRenderer.on('update-log', function (ev, log) {
    //   // console.log('updat', log)
    //   store.dispatch('updateLog', log)
    // })

    // ipcRenderer.on('loaded-settings', function (ev, settings) {
    //   store.dispatch('updateSettings', settings)
    // })

    // ipcRenderer.on('changed-settings', function (ev, msg, settings) {
    //   store.dispatch('updateSettings', settings)
    //   if (typeof msg === 'object') {
    //     store.dispatch('updateSettingsMessage', msg)
    //   }
    // })

    // ipcRenderer.on('screenshot-created', function (ev, day) {
    //   console.log(day)
    //   if (day) {
    //     store.dispatch('addScreenshot', day)
    //   }
    // })

    // ipcRenderer.on('filepath-changed', function (ev, filepath) {
    //   if (filepath) {
    //     store.dispatch('filePathChanged', filepath)
    //   }
    // })
  }
}
</script>
