<template>
  <div class="zoom">
    <div class="zoom-inner">
      <button class="side-btn zoom-down" @click="zoomDown"><fa-icon style="fas" icon="minus" /></button>
      <button class="zoom-text" @click="middleClicked">{{currentZoom}}</button>
      <button class="side-btn zoom-up" @click="zoomUp" ><fa-icon style="fas" icon="plus" /></button>
    </div>
  </div>
</template>

<script>
  import {ipcRenderer} from 'electron'

  export default {
    props: {
      value: Number
    },
    components: {
    },
    computed: {
      currentZoom: function () {
        let zoom = this.value
        return Math.round(zoom * 100) + '%'
      }
    },
    methods: {
      middleClicked () {
        this.$emit('middle-clicked')
      },
      zoomDown () {
        let newZoom = this.value - 0.05
        this.zoomChanged(newZoom)
      },
      zoomUp () {
        let newZoom = this.value + 0.05
        this.zoomChanged(newZoom)
      },
      zoomChanged (zoomLevel) {
        this.$emit('input', zoomLevel)
      }
    },
    watch: {
    },
    mounted: function () {
      let self = this
      ipcRenderer.on('zoom-function', function (ev, type) {
        // console.log('zoom-function')
        if (type === 'in') {
          self.zoomUp()
        } else if (type === 'out') {
          self.zoomDown()
        } else if (type === 'reset') {
          self.middleClicked()
        }
      })
    },
    data: function () {
      return {
      }
    }
  }
</script>

<style lang="scss">
  @import '../scss/variables';

  .zoom-inner {
    position: relative;
    z-index: 600;
    width: 100px;

    .zoom-text {
      position:absolute;
      background: $light-theme-input-bg;
      color: $light-theme-text-color;
      height: 30px;
      width: 40px;
      text-align:center;
      line-height: 30px;
      left: 30px;
      font-size: 15px;
      opacity: 0.8;
      cursor: pointer;
      border:none;
      outline: none !important;
      
      &:active,
      &:hover {
        background-color: $light-theme-input-active-bg;
      }
    }

    .side-btn {
      opacity: 0.8;
      position: absolute;
      height: 30px;
      width: 30px;
      border: none;
      background: $light-theme-input-bg;
      color: $light-theme-text-color;
      top: 0;
      outline: none !important;
      font-size: 14px;
      cursor: pointer;
      

      &.zoom-down {
        left: 0;
        border-right: 1px solid $light-theme-lines-between-color;
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
      }
      &.zoom-up {
        left: 70px;
        border-left: 1px solid $light-theme-lines-between-color;
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
      }

      &:hover,
      &:active {
        background-color: $light-theme-input-active-bg;
      }

    }
  }

</style>
