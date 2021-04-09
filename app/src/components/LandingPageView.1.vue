<template>
  <div>
    <screenshot-viewer @minutes-calculated='minuteCalc'></screenshot-viewer>
    <div class='content'>
      Hours worked: {{totalHoursWorked}}
    </div>
  </div>
</template>

<script>
  import ScreenshotViewer from './ScreenshotViewer'

  export default {
    name: 'landing-page',
    components: {
      ScreenshotViewer
    },
    computed: {
      totalHoursWorked () {
        let hours = Math.floor(this.totalMinutesWorked / 60)
        let minutes = this.totalMinutesWorked % 60
        return `${hours}:${minutes}`
      }
    },
    methods: {
      minuteCalc: function (mins) {
        this.totalMinutesWorked = mins
      }
    },
    data: function () {
      return {
        totalMinutesWorked: 0
      }
    }
  }
</script>

<style lang="scss">
  @import '../scss/variables';

  img {
    margin-top: -25px;
    width: 450px;
  }
  
  .content{
    width: 100%;
    background-color: $color-bg;
    height: 30px;
    position: fixed;
    left: 0;
    bottom: 0;
    text-align: right;
    line-height: 30px;
    padding: 0 10px;
    color: $color-light-grey;
  }
</style>
