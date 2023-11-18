<template>
  <timeline v-if="currentDay" :current-image-index="currentImageIndex"
    @minute-index-change="(i: number) => currentImageIndex = i" :is-following="isFollowing"
    @toggle-follow="isFollowing = !isFollowing" />
  <screenshot-viewer :current-capture="currentCapture" />
</template>

<script lang="ts" setup>
import { useRelapseStore } from "../store/relapse";
import ScreenshotViewer from '../components/ScreenshotViewer.vue'
import Timeline from '../components/Timeline.vue'
import { onMounted } from "vue";
import { eventsOn } from "../helpers/events";

import { storeToRefs } from "pinia";
import { Capture } from "../relapse.pb";

const relapseStore = useRelapseStore();
const { currentDay, earliestCaptureIndex, latestCaptureIndex } = $(storeToRefs(relapseStore))

let currentImageIndex = $ref(-1)
let isFollowing = $ref(false)

const currentCapture = $computed(() => {
  if (currentDay && currentDay.Captures) {
    return currentDay.Captures[currentImageIndex]
  }
})

onMounted(async () => {
  await relapseStore.loadToday()
  if (currentImageIndex < 0) {
    currentImageIndex = earliestCaptureIndex || 0
  }

  eventsOn('screen-captured', async (day?: Capture) => {
    if (day && day.Bod === relapseStore.currentDay.Bod) {
      await relapseStore.loadDay(new Date(day.Bod))
      if (isFollowing) {
        currentImageIndex = latestCaptureIndex || currentImageIndex
      }
    }
  })
  relapseStore.loadSettings()
})

</script>