<template>
  <footer class="footer-summary">
    {{ hhmmss }}
  </footer>
</template>

<script setup lang="ts">

import { Ref, computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRelapseStore } from "../store/relapse";
import { storeToRefs } from "pinia";
import { intervalToDuration,  minutesToMilliseconds,  minutesToSeconds } from "date-fns";
const relapseStore = useRelapseStore()
const isReady = ref(false);
const skipChangeIncrement = ref(0);

const { currentDaySummary } = $(storeToRefs(relapseStore))

const hhmmss = $computed(() => {
  if (currentDaySummary) {
    let interval: Interval = {start: 0, end: minutesToMilliseconds(currentDaySummary.TotalCapturedMinutes) * 1000 }
    let duration: Duration = intervalToDuration(interval)
    return `${duration.hours}:${duration.minutes}:${duration.seconds}`
  }
  return ''
})

const emit = defineEmits<{
  (e: "minute-index-change", index: number): void
  (e: "toggle-follow", isFollowing: boolean): void
}>()

const props = defineProps<{
  currentImageIndex?: number
  isFollowing?: boolean
}>()

onMounted(() => {
})

onUnmounted(() => {
})
</script>

<style lang="scss">
@import "../scss/variables";

footer.footer-summary {
  height: 20px;
  background-color: red;
  position: fixed;
  z-index: 2;
  width: 100vw;
  bottom: 0;
}
</style>
