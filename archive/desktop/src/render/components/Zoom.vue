<template>
  <div class="zoom">
    <div class="zoom-inner">
      <button class="side-btn zoom-down" @click="zoomDown">
        <ico icon="minus" size="small" />
      </button>
      <button class="zoom-text" @click="middleClicked">
        {{ currentZoom }}
      </button>
      <button class="side-btn zoom-up" @click="zoomUp">
        <ico icon="plus" size="small" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

@Options({})
export default class MainApp extends Vue {
  @Prop()
  value!: number

  get currentZoom() {
    return Math.round(this.value * 100) + '%'
  }

  middleClicked() {
    this.$emit('middle-clicked')
  }

  zoomDown() {
    this.zoomChanged(this.value - 0.05)
  }

  zoomUp() {
    this.zoomChanged(this.value + 0.05)
  }

  zoomChanged(zoomLevel: number) {
    this.$emit('input', zoomLevel)
  }

  mounted() {
    this.$ipc.receive('zoom-function', (type: 'in' | 'out' | 'reset') => {
      // console.log('zoom-function')
      if (type === 'in') {
        this.zoomUp()
      } else if (type === 'out') {
        this.zoomDown()
      } else if (type === 'reset') {
        this.middleClicked()
      }
    })
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
    position: absolute;
    background: $theme-input-bg;
    color: $theme-text-color;
    height: 34px;
    width: 44px;
    text-align: center;
    line-height: 34px;
    left: 30px;
    font-size: 15px;
    opacity: 0.8;
    cursor: pointer;
    border: none;
    outline: none !important;

    &:active,
    &:hover {
      background-color: $theme-input-hover-bg;
    }
  }

  .side-btn {
    opacity: 0.8;
    position: absolute;
    height: 34px;
    width: 30px;
    border: none;
    background: $theme-input-bg;
    color: $theme-text-color;
    top: 0;
    outline: none !important;
    cursor: pointer;
    padding-top: 2px;

    &.zoom-down {
      left: 0;
      border-right: 1px solid $theme-lines-between-color;
      border-top-left-radius: $radius;
      border-bottom-left-radius: $radius;
    }
    &.zoom-up {
      left: 74px;
      border-left: 1px solid $theme-lines-between-color;
      border-top-right-radius: $radius;
      border-bottom-right-radius: $radius;
    }

    &:hover,
    &:active {
      background-color: $theme-input-hover-bg;
    }
  }
}
</style>
