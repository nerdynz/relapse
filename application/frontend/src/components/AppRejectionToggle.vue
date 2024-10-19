<template>
  <toggle :model-value="val" on-label="Capture" off-label="Ignore" @input="changeToggle" />
</template>

<script lang="ts" setup>
import Toggle from '@vueform/toggle'
import { computed } from 'vue'
import { ApplicationInfo } from '../relapse.pb';

const emit = defineEmits<{
  (e: 'input', state: {app: ApplicationInfo, state: 'CAPTURING'| 'REJECTING' }): void
}>()

const props = defineProps<{
  app: ApplicationInfo
  rejections: string[]
}>()

const cssClass = computed(() => {
  if (props.rejections.includes(props.app.AppName)) {
    return "is-reject";
  }
  return "is-capturing";
})

const val = computed(() => {
  if (props.rejections.includes(props.app.AppName)) {
    return false
  }
  return true
})

function changeToggle() {
  if (val.value) {
    setReject()
  } else {
    setCapture()
  }
}

function setCapture() {
  emit('input', { app: props.app, state: "CAPTURING" });
}

function setReject() {
  emit('input', { app: props.app, state: "REJECTING" });
}
</script>

<style lang="scss">
.app-capture-toggle {
  display: flex;
  user-select: none;
  justify-content: center;
  padding: 0.25rem 0.5rem;

  .toggle-btn {
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: 60px;
    height: 1.4rem;
    // text-transform: uppercase;
    font-weight: 300;
    font-size: 10px;

    .icon {
      display: block;
    }

    box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.2);
    // &:hover {
    // }
  }

  .capturing {
    border-top-left-radius: $radius-small;
    border-bottom-left-radius: $radius-small;
  }

  .reject {
    border-top-right-radius: $radius-small;
    border-bottom-right-radius: $radius-small;
  }

  &.is-capturing {
    .capturing {
      background: $color-green;
    }

    .reject {
      background: $color-disable;
      color: $color-disable-text-color;
    }
  }

  &.is-reject {
    .capturing {
      background: $color-disable;
      color: $color-disable-text-color;
    }

    .reject {
      background: $color-red;
    }
  }
}
</style>
