<template>
  <timeline
    v-if="currentDay"
    :current-day="currentDay"
    :current-image-index="currentImageIndex"
    :is-following="isFollowing"
    @minute-index-change="(i: number) => currentImageI = i"
    @toggle-follow="isFollowing = !isFollowing"
  />
  <screenshot-viewer :current-capture="currentCapture" />
</template>

<script lang="ts" setup>
import { useRelapseStore } from '../store/relapse'
import ScreenshotViewer from '../components/ScreenshotViewer.vue'
import Timeline from '../components/Timeline.vue'
import Emmiter from '../../events'

// import { eventsOn } from '../helpers/events'

import { storeToRefs } from 'pinia'
import { Capture } from '../../bindings/github.com/nerdynz/relapse/proto/models'

const relapseStore = useRelapseStore()
const { currentDay, earliestCaptureIndex, latestCaptureIndex } = $(
  storeToRefs(relapseStore)
)

let currentImageI = $ref(-1)
const currentImageIndex = $computed(() => {
  return currentImageI >= 0 ? currentImageI : (earliestCaptureIndex + 1)
})
const currentCapture = $computed(() => {
  if (currentDay && currentDay.Captures) {
    return currentDay.Captures[currentImageIndex]
  }
})

let isFollowing = $ref(false)

await relapseStore.loadToday()
await relapseStore.loadSettings()

// @ts-expect-error
Emmiter.on('screen-captured', (day: Capture) => {
  if (day && day.Bod === relapseStore.currentDay?.Bod) {
    if (isFollowing) {
      currentImageI = latestCaptureIndex || currentImageIndex
    }
  }
  if (day.Bod) {
    relapseStore.loadDay(new Date(currentDay!.Bod!))
  }
})
</script>
