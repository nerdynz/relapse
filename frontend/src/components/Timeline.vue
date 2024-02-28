<template>
  <div class="timeline" :style="timelineReadyStyle">
    <button class="side-btn prev-day" @click="prevDay" title="Previous Day">
      <ico icon="arrow-from-right" />
    </button>
    <div class="splitter" />
    <button class="side-btn prev-minute" @click="goleft(1)" @mousedown="prevSkipOn" @mouseup="prevSkipOff"
      title="Previous 30 Seconds">
      <ico icon="angle-left" />
    </button>
    <div class="splitter" />
    <button class="side-btn prev-minute" @click="toggleFollow" title="Follow Captures" :class="{'toggle-follow-on': isFollowing}">
      <ico icon="repeat-square-icon"  />
    </button>
    <div class="splitter" />

    <div class="canvas-bg" :style="timelineReadyStyle">
      <canvas ref="timelineCanvas" id="timeline-viewer" width="1280" height="40" />
      <div v-for="(time, index) in timesWhereIsWholeHour" class="tick" :style="markerStyle(index)" :key="index">
        &nbsp;
        <div class="tick-text">
          {{ formatDateSmall(time.Dt) }}
        </div>
      </div>
    </div>
    <div class="splitter" />
    <div class="picker" :key="currentCaptureDate?.toISOString()">
      <datepicker :model-value="currentCaptureDate" input-format="d MMM yyyy h:mm:ss aa"
        @update:model-value="dayChanged" />
    </div>
    <div class="splitter" />
    <button class="side-btn next-30-sec" @click="goRight(1)" @mousedown="nextSkipOn" @mouseup="nextSkipOff"
      title="Next 30 Seconds">
      <ico icon="angle-right" />
    </button>
    <div class="splitter" />
    <button class="side-btn next-day" @click="nextDay" title="Next Day">
      <ico icon="arrow-from-left" />
    </button>

    <div class="tick hours-total">
      <div class="tick-text">
        <ico icon="clock" class="is-small-icon" />
        <div>{{ hoursTotal }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
function calculateCursorPosition(e: any, width: number, numberTicks: number) {
  let canvasX = e.e.layerX;
  let tickPercentage = canvasX / width;
  let val = Math.round(tickPercentage * numberTicks);
  if (val >= numberTicks - 1) {
    val = numberTicks - 2;
  }
  if (val <= 0) {
    val = 0;
  }
  return val;
};

</script>

<script setup lang="ts">

import { Ref, computed, onMounted, onUnmounted, ref, watch } from "vue";
import { Canvas, Rect } from "fabric";
import { useRelapseStore } from "../store/relapse";
import { eventsOn } from "../helpers/events";
import Datepicker from "vue3-datepicker";
import {  fromIsoDate } from "../helpers/dates";
import { addDays, format, subDays } from 'date-fns';
import { Capture, CapturedDay } from '../relapse.pb';

const timeColor = "#86DA9D";
const relapseStore = useRelapseStore()

let canvas: Canvas | null = null;

let rect!: Rect;
let hoverRect!: Rect;

const isReady = ref(false);
const skipChangeIncrement = ref(0);
const skipChangeMultipler = ref(0.1);
const skipDirection: Ref<"prev" | "next" | ""> = ref("");

interface DayChange {
  date: Date,
  skipToEnd: boolean
}

function toggleFollow() {
  emit('toggle-follow', !props.isFollowing)
}

const emit = defineEmits<{
  (e: "day-change", value: DayChange): void
  (e: "minute-index-change", index: number): void
  (e: "toggle-follow", isFollowing: boolean): void
}>()

const props = defineProps<{
  currentImageIndex: number
  isFollowing: boolean
}>()

const times: Array<Capture> = $computed(() => {
  return relapseStore.currentDay?.Captures || []
})

const currentDay: CapturedDay | null = $computed(() => {
  return relapseStore.currentDay
})

watch($$(currentDay), () => {
  redrawCanvas()
})

watch(() => props.currentImageIndex, () => {
  redrawCanvas()
})

const currentCapture = $computed(() => {
  if (relapseStore.currentDay && relapseStore.currentDay.Captures) {
    return relapseStore.currentDay.Captures[props.currentImageIndex]
  }
})

const currentCaptureDate = $computed(() => {
  if (currentCapture && currentCapture!.Dt) {
    return fromIsoDate(currentCapture!.Dt)
  }
})

// const currentTime = computed(() => {
//   let currentTime = times.value[props.currentImageIndex];
//   if (currentTime) {
//     return currentTime.date;
//     // return dateFormat(currentTime.date, 'h:MM:ss TT')
//   }
//   return null;
// })

const timelineReadyStyle = computed(() => {
  if (isReady.value) {
    return "opacity:1;";
  }
  return "opacity:0;";
})

const hoursTotal = computed(() => {
  // if (props.summary) {
  //   const seconds = Number(props.summary.totalCapturedTimeSeconds);
  //   const duration = intervalToDuration({ start: 0, end: seconds * 1000 });
  //   // { minutes: 30, seconds: 7 }

  //   const zeroPad = (num: any) => String(num).padStart(2, "0");

  //   const formatted = `${duration.hours}h ${zeroPad(duration.minutes)}m`;

  //   return formatted;
  // }
  return 0;
})

const timesWhereIsWholeHour = computed(() => {
  const wholeHours = times.filter((t: Capture) => {
    let actualDate = new Date((t.Dt!));
    // console.log('actualDate', actualDate, t.captureDayTimeSeconds!)
    if (actualDate.getMinutes() === 0 && actualDate.getSeconds() === 0) {
      return true;
    }
    return false;
  });
  return [...wholeHours];
})

function prevDay() {
  const newDate = subDays(currentCaptureDate!, 1)
  relapseStore.loadDay(newDate)
}

function nextDay() {
  const newDate = addDays(currentCaptureDate!, 1)
  relapseStore.loadDay(newDate)
}

function today() {
  relapseStore.loadToday()
}

function dayChanged(date?: Date | null): any {
  if (date) {
    relapseStore.loadDay(date)
  }
}

function prevSkip(inc = 1) {
  inc = -1 * inc;
  var newValue = props.currentImageIndex + inc;
  minuteChanged(newValue);
}

function nextSkip(inc = 1) {
  var newValue = props.currentImageIndex + inc;
  minuteChanged(newValue);
}

function prevSkipOn() {
  skipChangeIncrement.value = 1;
  skipDirection.value = "prev";
}

function prevSkipOff() {
  skipChangeIncrement.value = 0;
  skipChangeMultipler.value = 0.1;
  skipDirection.value = "";
}

function nextSkipOn() {
  skipChangeIncrement.value = 1;
  skipDirection.value = "next";
}

function nextSkipOff() {
  skipChangeIncrement.value = 0;
  skipChangeMultipler.value = 0.1;
  skipDirection.value = "";
}

function recurringMove() {
  let nextInc = skipChangeIncrement.value * Math.floor(skipChangeMultipler.value);
  if (skipDirection.value === "prev") prevSkip(nextInc);
  if (skipDirection.value === "next") nextSkip(nextInc);
  skipChangeMultipler.value += 0.1;
}

function minuteChanged(index: number) {
  emit('minute-index-change', index)
  moveMinuteLinePosition(index)
}

function moveMinuteLinePosition(index: number) {
  console.log('moveMinuteLinePosition happend')
  var xPos = getLinePoint(index);
  rect.set({ left: xPos });
  canvas!.renderAll();
}

function moveMinuteHoverLinePosition(index: number) {
  var xPos = getLinePoint(index);
  hoverRect.set({ left: xPos, height: 60 });
  canvas!.renderAll();
}

function hideMinuteHoverLine() {
  hoverRect.set({ height: 0 });
  canvas!.renderAll();
}

function markerStyle(index: number) {
  let percent = (index / (timesWhereIsWholeHour.value.length - 1)) * 100;
  return `left: ${percent}%;`;
}

function getLinePoint(index: number) {
  var linePoint = 0;
  if (canvas && canvas.width) {
    return (canvas.width * ((index / times.length) * 100)) / 100;
  }
  return linePoint;
}

function formatDateSmall(dt?: string) {
  if (dt) {
    let date = fromIsoDate(dt)
    if (date) {
      return format(date, "haa");
    }
  }
  return "";
}

function redrawCanvas() {
  console.log(('redrawingcanvas'))
  if (!canvas) canvas = new Canvas("timeline-viewer");
  let bgColor = "";
  if (document && document.documentElement) {
    bgColor = getComputedStyle(document.documentElement).getPropertyValue(
      "--theme-input-bg"
    );
  }

  // 240 buttons, padding 40, datepicker 180, 7 splliters
  canvas.setDimensions({
    width: window.innerWidth - (200 + 220 + 7 * 1),
    height: 34,
  });
  // clear it
  canvas.clear();

  // recalc line widths to be used for indicator and time rectanges
  let lineWidth = 0;
  if (canvas && canvas.width) {
    lineWidth = (canvas.width * ((1 / times.length) * 100)) / 100;
  }

  // draw the times, one rect for each solid block of work (i.e. isReal) toggle between isReal and !isReal to create full rects
  let currentOnOffness: boolean | undefined = false;
  let lastRectIndex = 0;
  for (let i = 0; i < times.length; i++) {
    let time = times[i];
    let left = getLinePoint(i);
    if (i === 0) {
      currentOnOffness = time.IsReal;
      lastRectIndex = left;
    } else if (currentOnOffness !== time.IsReal) {
      canvas.add(
        new Rect({
          width: left - lastRectIndex,
          height: 40,
          left: lastRectIndex,
          top: 0,
          stroke: !time.IsReal ? timeColor : bgColor, // reversed because its not real
          fill: !time.IsReal ? timeColor : bgColor, // reversed because its not real
          selectable: false,
        })
      );
      lastRectIndex = left;
      currentOnOffness = time.IsReal;
    } else if (i === times.length - 1) {
      canvas.add(
        new Rect({
          width: left - lastRectIndex,
          height: 40,
          left: lastRectIndex,
          top: 0,
          stroke: time.IsReal ? timeColor : bgColor, // this is the actualness :)
          fill: time.IsReal ? timeColor : bgColor, // this is the actualness :)
          selectable: false,
        })
      );
    }
  }

  // draw the indicator for what time we are currently on
  rect = new Rect({
    width: lineWidth,
    height: 60,
    left: getLinePoint(props.currentImageIndex),
    top: 0,
    stroke: "#f2ae57",
    fill: "#f2ae57",
    selectable: false,
  });

  hoverRect = new Rect({
    width: lineWidth * 1,
    height: 0,
    left: getLinePoint(props.currentImageIndex),
    top: -1,
    stroke: "#F65C26",
    fill: "#F65C26",
    selectable: false,
  });

  canvas.add(rect);
  canvas.add(hoverRect);

  isReady.value = true;
}
function goleft(inc = 1) {
  prevSkip(inc);
}

function goRight(inc = 1) {
  nextSkip(inc);
}

const lastKeyboardEvent = ref(0);
const eventDebounce = ref(100);

function dayChanging(timeEvent: any) {
  // if (lastKeyboardEvent.value + eventDebounce.value < Number(+new Date())) {
  // lastKeyboardEvent.value = Number(+new Date());
  if (timeEvent === "prevDay") {
    prevDay();
  } else if (timeEvent === "nextDay") {
    nextDay();
  } else if (timeEvent === "today") {
    today();
  }

  // lastKeyboardEvent.value = Number(+new Date());
  if (timeEvent === "left") {
    goleft();
  } else if (timeEvent === "right") {
    goRight();
  } else if (timeEvent === "left-1min") {
    goleft(2);
  } else if (timeEvent === "right-1min") {
    goRight(2);
  }
  // }
}

let interval: number;

function onSchemeChange(event: any) {
  const newColorScheme = event.matches ? "dark" : "light";
  isReady.value = false;
  redrawCanvas();
}

onMounted(() => {
  let panning = false;

  if (!canvas) canvas = new Canvas("timeline-viewer");
  canvas.selection = false;
  canvas.setDimensions({ width: window.innerWidth - 40, height: 40 });

  redrawCanvas();

  // $ipc.receive("arrow-pressed", arrowPressed);
  eventsOn("time-function", (ev) => {
    console.log('ev', ev)
    dayChanging(ev)
  });
  // interval = setInterval(recurringMove, 100);

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", onSchemeChange);

  window.addEventListener("resize", redrawCanvas);

  canvas!.on("mouse:up", (e: any) => {
    minuteChanged(calculateCursorPosition(e, canvas!.width!, times.length));
    panning = false;
  });

  canvas!.on("mouse:down", (e: any) => {
    minuteChanged(calculateCursorPosition(e, canvas!.width!, times.length));
    panning = true;
  });
  canvas!.on("mouse:out", (e: any) => {
    hideMinuteHoverLine();
  });

  canvas!.on("mouse:move", (e: any) => {
    if (e && e.e) {
      if (panning) {
        minuteChanged(calculateCursorPosition(e, canvas!.width!, times.length));
        // var units = 10
        // var delta = new fabric.Point(e.e.movementX, e.e.movementY)
      } else {
        moveMinuteHoverLinePosition(calculateCursorPosition(e, canvas!.width!, times.length));
      }
    }
  });
})

onUnmounted(() => {
  clearInterval(interval);

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .removeEventListener("change", onSchemeChange);

  window.removeEventListener("resize", redrawCanvas);
})
</script>

<style lang="scss">
@import "../scss/variables";

.timeline {
  opacity: 0;
  width: 100%;
  position: fixed;
  top: 34px;
  left: 0;
  padding: 0 20px;
  z-index: 5000;
  -webkit-app-region: no-drag;
  display: flex;

  .splitter {
    height: 22px;
    margin: 7px 0;
    width: 1px;
    // background-color: $theme-lines-between-color;
  }

  .side-btn {
    cursor: pointer;
    height: 34px;
    width: 40px;
    display: flex;

    .icon {
      height: 34px;
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        height: 16px;
        width: 16px;
      }
    }

    border: none;
    background-color: $theme-input-bg;
    // border-right: 1px solid $theme-lines-between-color;
    color: $theme-text-color;
    top: 0;
    outline: none !important;
    font-size: 16px;
    text-align: center;

    &:hover,
    &:active {
      background-color: $theme-input-hover-bg;
    }

    &.next-30-sec {
      // border-left: 1px solid $theme-lines-between-color;
      // border-top-right-radius: $standard-border-radius;
      // border-bottom-right-radius: $standard-border-radius;
    }

    &.next-day {
      border-top-right-radius: $standard-border-radius;
      border-bottom-right-radius: $standard-border-radius;
      border-right: none;
    }

    &.prev-day {
      border-top-left-radius: $standard-border-radius;
      border-bottom-left-radius: $standard-border-radius;
    }
  }

  .toggle-follow-on {
    background-color: greenyellow;
    color: green;
  }

  .picker {
    -webkit-app-region: no-drag;
    width: 220px;

    .side-btn {
      &.next-day {
        border-left: 1px solid $theme-lines-between-color;
        left: 135px;
        top: 0;
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
      }

      &.prev-day {
        left: 0;
        border-right: 1px solid $theme-lines-between-color;
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
      }
    }

    .v3dp__heading {
      color: $theme-text-heading-color;

      .v3dp__heading__center[data-v-2e128338]:hover,
      .v3dp__heading__button[data-v-2e128338]:not(:disabled):hover {
        background: $theme-input-hover-bg;
      }
    }

    .v3dp__subheading {
      color: $theme-text-subheading-color;
    }

    .v3dp__datepicker {
      width: 100%;

      input[type="text"] {
        text-align: center;
        font-size: 15px;
        height: 34px;
        background: $theme-input-bg;
        border: none;
        font-weight: normal;
        color: $theme-text-color;
        width: 100%;
        cursor: pointer;
        -webkit-user-select: none;
        user-select: none;
        outline: none !important;
      }

      &:hover {
        input[type="text"] {
          background: $theme-input-hover-bg;
        }
      }
    }

    .v3dp__divider {
      display: none;
    }

    .v3dp__popout {
      width: 320px;
      background-color: $theme-input-bg;

      .v3dp__elements button {
        font-size: 1rem;
        color: $theme-text-color;
        padding: 0;

        span {
          line-height: 2.6rem;
          height: 2.6rem;
        }

        &:disabled {
          color: $theme-unfocused-text-color;
        }

        &.selected span {
          background-color: $theme-input-active-bg;
          color: $theme-text-color;
        }

        &:not(:disabled):hover span {
          background-color: $theme-input-hover-bg;
          color: $theme-text-color;
        }
      }
    }
  }

  canvas {
    -webkit-app-region: no-drag;
    cursor: none !important;
  }

  .canvas-bg {
    opacity: 0;
    -webkit-app-region: no-drag;
    position: relative;
    height: 34px;
    // border-left: 1px solid $theme-lines-between-color;
  }

  .time {
    position: absolute;
    top: 7px;
    right: -99px;
    pointer-events: none;
    z-index: 500;
    font-size: 16px;
    -webkit-user-select: none;
  }

  user-select: none;
  color: $theme-text-color;

  .tick {
    &.hours-total {
      position: absolute;
      right: 80px;
      width: 60px;
      bottom: 2px;

      .tick-text {
        display: flex;
        align-items: center;

        .is-small-icon {
          margin-right: 3px;
          width: 11px;
          height: 11px;

          svg {
            width: 11px;
            height: 11px;
          }
        }
      }
    }

    font-size: 9px;
    color: $theme-text-color;

    font-weight: 300;
    position: absolute;
    -webkit-app-region: no-drag;
    -webkit-user-select: none;
    user-select: none;

    @media (max-width: 1020px) {
      &:nth-child(even) {
        display: none;
      }
    }

    @media (max-width: 800px) {
      display: none;

      &:nth-child(even) {
        display: none;
      }

      &:nth-child(4n + 1) {
        display: block;
      }
    }

    @media (max-width: 680px) {
      display: none;

      &:nth-child(even) {
        display: none;
      }

      &:nth-child(4n + 1) {
        display: none;
      }

      &:nth-child(6n-1) {
        display: block;
      }
    }

    @media (max-width: 480px) {
      display: none;

      &:nth-child(even) {
        display: none;
      }

      &:nth-child(12n-1) {
        display: none !important;
      }
    }

    .tick-text {
      position: absolute;
      left: -10px;
      top: 2px;
      -webkit-app-region: no-drag;
      -webkit-user-select: none;
      user-select: none;
    }
  }
}
</style>
