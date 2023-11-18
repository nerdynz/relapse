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

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { eventsOn } from '../helpers/events';

const emit = defineEmits<{
  (e: 'input', zoomLevel: number): void
  (e: 'middle-clicked'): void
}>()

const props = defineProps<{
  value: number
}>()

const currentZoom = computed(() => {
  return Math.round(props.value * 100) + '%'
})

function middleClicked() {
  emit('middle-clicked')
}

function zoomDown() {
  zoomChanged(props.value - 0.05)
}

function zoomUp() {
  zoomChanged(props.value + 0.05)
}

function zoomChanged(zoomLevel: number) {
  emit('input', zoomLevel)
}

onMounted(() =>  {
  eventsOn('zoom-function', (type: 'in' | 'out' | 'reset') => {
    if (type === 'in') {
      zoomUp()
    } else if (type === 'out') {
      zoomDown()
    } else if (type === 'reset') {
      middleClicked()
    }
  })
})
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
