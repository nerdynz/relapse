<template>
  <timeline v-if="currentDay" :current-image-index="currentImageIndex"
    @minute-index-change="(i: number) => currentImageIndex = i" :is-following="isFollowing"
    @toggle-follow="isFollowing = !isFollowing" />
  <div v-if="currentDay" class="day-summary">
    {{ currentDay.Summary }}
    <table class="day-summary-table" border="1">
      <tbody>
        <tr v-for="(capture, index) in realCaptures">
          <td>
            {{ capture.AppName }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <summary-footer />
</template>

<script lang="ts" setup>
import { useRelapseStore } from "../store/relapse";
import Timeline from '../components/Timeline.vue'
import { onMounted } from "vue";

import { storeToRefs } from "pinia";
// import { Capture } from "../relapse.pb";

const relapseStore = useRelapseStore();
const { currentDay, earliestCaptureIndex, latestCaptureIndex } = $(storeToRefs(relapseStore))

let currentImageIndex = $ref(-1)
let isFollowing = $ref(false)

const realCaptures = $computed(() => {
  if (currentDay) {
    return currentDay.Captures.filter((c) => {
      return c.IsReal
    })
  }
})

onMounted(async () => {
  await relapseStore.loadToday()
})

</script>
<style lang="scss">
.day-summary {
  color: $theme-text-color;
  height: 50vh;
  overflow-y: scroll;

  .day-summary-table {
    tbody {
      td {
        text-align: left;
      }
    }
  }
}
</style>