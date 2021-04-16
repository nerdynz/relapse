<template>
  <div class="handlebar" @click="handleClick"></div>
  <!-- <help-view v-if="settings.isHelpShown"></help-view> -->
  <screenshot-viewer @minutes-calculated="minuteCalc"></screenshot-viewer>
  <div class="content">Hours worked: {{ totalHoursWorked }}</div>
</template>

<script>
import ScreenshotViewer from '@/components/ScreenshotViewer'
// import HelpView from './HelpView'
import { mapActions, mapGetters } from 'vuex'
import { ipcRenderer } from 'electron'

let clicks = 0
export default {
  name: 'main-app',
  components: {
    ScreenshotViewer,
    // HelpView
  },
  computed: {
    totalHoursWorked() {
      let hours = Math.floor(this.totalMinutesWorked / 60)
      let minutes = this.totalMinutesWorked % 60
      if (minutes < 10) {
        minutes = '0' + minutes
      }
      return `${hours}:${minutes}`
    },
    ...mapGetters(['settings']),
  },
  methods: {
    handleClick() {
      clicks++
      if (clicks === 1) {
        setTimeout(() => {
          if (clicks === 1) {
            // this.singleClick()
          } else {
            // this.doubleClick()
            ipcRenderer.send('maximize')
          }
          clicks = 0
        }, 250)
      }
    },
    ...mapActions(['loadSettings']),
    minuteCalc(mins) {
      this.totalMinutesWorked = mins
    },
  },
  created() {},
  mounted() {
    this.loadSettings()
  },
  data() {
    return {
      totalMinutesWorked: 0,
    }
  },
}
</script>
