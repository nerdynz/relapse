<template>
  <div class="zoom">
    <slot name="left" />

    <button class="side-btn zoom-down is-left" @click="zoomDown">
      <ico icon="minus" size="small" />
    </button>
    <button class="zoom-btn" @click="middleClicked">
      {{ currentZoom }}
    </button>
    <button class="side-btn zoom-up is-right" @click="zoomUp">
      <ico icon="plus" size="small" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import emitter from '../../events'

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

onMounted(() => {
  console.log('zoom-function mounted')
  emitter.on('zoom', (type: 'in' | 'out' | 'reset') => {
    console.log('z', type)
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

.zoom {
  position: relative;
  z-index: 600;
  display: flex;

  .gap-right {
    margin-right: 5px;
  }

  .zoom-btn,
  .side-btn {
    background: $theme-input-bg;
    color: $theme-text-color;
    height: 34px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .zoom-btn {
    padding: 0 5px;
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
    border: none;
    top: 0;
    outline: none !important;
    cursor: pointer;
    padding: 0 5px;

    &.is-left {
      border-right: 1px solid $theme-lines-between-color;
      border-top-left-radius: $radius;
      border-bottom-left-radius: $radius;
    }

    &.is-right {
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
