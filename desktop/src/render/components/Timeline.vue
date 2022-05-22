<template>
  <div class="timeline" :style="timelineReadyStyle">
    <button class="side-btn prev-day" @click="prevDay" title="Previous Day">
      <ico icon="arrow-from-right" />
    </button>
    <div class="splitter" />
    <button
      class="side-btn prev-minute"
      @click="goleft(1)"
      @mousedown="prevSkipOn"
      @mouseup="prevSkipOff"
      title="Previous 30 Seconds"
    >
      <ico icon="angle-left" />
    </button>

    <div class="splitter" />
    <div class="picker">
      <datepicker
        :model-value="currentDayTime"
        input-format="d MMM yyyy h:mm:ss aa"
        @update:model-value="dayChanged"
      />
    </div>
    <div class="splitter" />
    <div class="canvas-bg" :style="timelineReadyStyle">
      <canvas
        ref="timelineCanvas"
        id="timeline-viewer"
        width="1280"
        height="40"
      ></canvas>
      <div
        v-for="(time, index) in timesWhereIsWholeHour"
        class="tick"
        :style="markerStyle(index)"
        :key="index"
      >
        &nbsp;
        <div class="tick-text">
          {{ formatDateSmall(time.date) }}
        </div>
      </div>
    </div>

    <div class="splitter" />
    <button class="side-btn" @click="today" title="Today">
      <ico icon="calendar-day" />
    </button>
    <div class="splitter" />
    <button
      class="side-btn next-30-sec"
      @click="goRight(1)"
      @mousedown="nextSkipOn"
      @mouseup="nextSkipOff"
      title="Next 30 Seconds"
    >
      <ico icon="angle-right" />
    </button>
    <div class="splitter" />
    <button class="side-btn next-day" @click="nextDay" title="Next Day">
      <ico icon="arrow-from-left" />
    </button>
  </div>
</template>

<script lang="ts">
import { CaptureSimple } from "@render/interfaces/dayInfo.interface";
import { format } from "date-fns";
import { fabric } from "fabric";
import { Options, Vue } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import Datepicker from "vue3-datepicker";

const timeColor = "#86DA9D";

@Options({
  components: {
    Datepicker,
  },
})
export default class Timeline extends Vue {
  @Prop()
  times!: Array<CaptureSimple>;

  @Prop()
  value!: number;

  @Prop()
  firstImageIndex!: number;

  @Prop()
  lastImageIndex!: number;

  @Prop()
  day!: Date;

  @Prop()
  currentCapture!: CaptureSimple;

  canvas!: fabric.Canvas;
  rect!: fabric.Rect;
  hoverRect!: fabric.Rect;

  isMouseDown = false;
  isReady = false;

  // bgColor = ''

  get currentDayTime() {
    if (this.currentCapture) {
      return this.currentCapture.date;
    }
    return new Date();
  }

  get timelineReadyStyle() {
    if (this.isReady) {
      return "opacity:1;";
    }
    return "opacity:1;";
  }

  // get bgColor() {
  //   let style = ''
  //   if (document && document.documentElement) {
  //     style = getComputedStyle(document.documentElement).getPropertyValue(
  //       '--theme-input-bg'
  //     )
  //   }
  //   return style
  // }

  get timesWhereIsWholeHour() {
    const wholeHours = this.times.filter((t: any) => {
      var actualDate = new Date(t.date);
      if (actualDate.getMinutes() === 0 && actualDate.getSeconds() === 0) {
        return true;
      }
      return false;
    });
    return wholeHours;
  }

  prevDay() {
    const newDate = new Date(this.day);
    newDate.setDate(this.day.getDate() - 1);
    this.dayChanged(newDate, true);
  }

  nextDay() {
    const newDate = new Date(this.day);
    newDate.setDate(this.day.getDate() + 1);
    this.dayChanged(newDate, false);
  }

  today() {
    const newDate = new Date();
    this.dayChanged(newDate, true);
  }

  dayChanged(date: Date, skipToEnd: boolean) {
    this.$emit("day-change", { date, skipToEnd });
  }

  prevSkip(inc = 1) {
    inc = -1 * inc;
    var newValue = this.value + inc;
    this.minuteChanged(newValue);
  }

  nextSkip(inc = 1) {
    var newValue = this.value + inc;
    this.minuteChanged(newValue);
  }

  skipChangeIncrement = 0;
  skipChangeMultipler = 0.1;
  skipDirection: "prev" | "next" | "" = "";

  prevSkipOn() {
    this.skipChangeIncrement = 1;
    this.skipDirection = "prev";
  }

  prevSkipOff() {
    this.skipChangeIncrement = 0;
    this.skipChangeMultipler = 0.1;
    this.skipDirection = "";
  }

  nextSkipOn() {
    this.skipChangeIncrement = 1;
    this.skipDirection = "next";
  }

  nextSkipOff() {
    this.skipChangeIncrement = 0;
    this.skipChangeMultipler = 0.1;
    this.skipDirection = "";
  }

  recurringMove() {
    let nextInc =
      this.skipChangeIncrement * Math.floor(this.skipChangeMultipler);
    if (this.skipDirection === "prev") this.prevSkip(nextInc);
    if (this.skipDirection === "next") this.nextSkip(nextInc);
    this.skipChangeMultipler += 0.1;
  }

  minuteChanged(index: number) {
    this.$emit("minute-index-change", index);
  }

  moveMinuteLinePosition(index: number) {
    var xPos = this.getLinePoint(index);
    this.rect.set({ left: xPos });
    this.canvas.renderAll();
  }

  moveMinuteHoverLinePosition(index: number) {
    var xPos = this.getLinePoint(index);
    this.hoverRect.set({ left: xPos, height: 60 });
    this.canvas.renderAll();
  }

  hideMinuteHoverLine() {
    this.hoverRect.set({ height: 0 });
    this.canvas.renderAll();
  }

  markerStyle(index: number) {
    let percent = (index / (this.timesWhereIsWholeHour.length - 1)) * 100;
    return `left: ${percent}%;`;
  }

  isWholeHour(date: Date) {
    var actualDate = new Date(date);
    if (actualDate.getMinutes() === 0) {
      return true;
    }

    return false;
  }

  getLinePoint(index: number) {
    var linePoint = 0;
    if (this.canvas && this.canvas.width) {
      return (this.canvas.width * ((index / this.times.length) * 100)) / 100;
    }
    return linePoint;
  }

  get currentTime() {
    let currentTime = this.times[this.value];
    if (currentTime) {
      return currentTime.date;
      // return dateFormat(currentTime.date, 'h:MM:ss TT')
    }
    return null;
  }

  mouseout() {
    // this.isMouseDown = false
  }

  formatDate(date: Date) {
    if (date) {
      return format(date, "h:MM:ss aa");
    }

    return "";
  }

  formatDateSmall(date: Date) {
    if (date) {
      return format(date, "haa");
    }
    return "";
  }

  redrawCanvas() {
    let bgColor = "";
    if (document && document.documentElement) {
      bgColor = getComputedStyle(document.documentElement).getPropertyValue(
        "--theme-input-bg"
      );
    }

    // 240 buttons, padding 40, datepicker 180, 7 splliters
    this.canvas.setDimensions({
      width: window.innerWidth - (200 + 40 + 220 + 7 * 1),
      height: 34,
    });
    // clear it
    this.canvas.clear();

    // recalc line widths to be used for indicator and time rectanges
    let lineWidth = 0;
    if (this.canvas && this.canvas.width) {
      lineWidth = (this.canvas.width * ((1 / this.times.length) * 100)) / 100;
    }

    // draw the times, one rect for each solid block of work (i.e. isReal) toggle between isReal and !isReal to create full rects
    var currentOnOffness = false;
    var lastRectIndex = 0;
    for (var i = 0; i < this.times.length; i++) {
      var time = this.times[i]; // eslint-disable-line no-unused-vars
      var left = this.getLinePoint(i);
      if (i === 0) {
        currentOnOffness = time.isReal;
        lastRectIndex = left;
      } else if (currentOnOffness !== time.isReal) {
        this.canvas.add(
          new fabric.Rect({
            width: left - lastRectIndex,
            height: 40,
            left: lastRectIndex,
            top: 0,
            stroke: !time.isReal ? timeColor : bgColor, // reversed because its not real
            fill: !time.isReal ? timeColor : bgColor, // reversed because its not real
            selectable: false,
          })
        );
        lastRectIndex = left;
        currentOnOffness = time.isReal;
      } else if (i === this.times.length - 1) {
        this.canvas.add(
          new fabric.Rect({
            width: left - lastRectIndex,
            height: 40,
            left: lastRectIndex,
            top: 0,
            stroke: time.isReal ? timeColor : bgColor, // this is the actualness :)
            fill: time.isReal ? timeColor : bgColor, // this is the actualness :)
            selectable: false,
          })
        );
      }
    }

    // draw the indicator for what time we are currently on
    this.rect = new fabric.Rect({
      width: lineWidth,
      height: 60,
      left: this.getLinePoint(this.value),
      top: 0,
      stroke: "#f2ae57",
      fill: "#f2ae57",
      selectable: false,
    });

    this.hoverRect = new fabric.Rect({
      width: lineWidth * 1,
      height: 0,
      left: this.getLinePoint(this.value),
      top: -1,
      stroke: "#F65C26",
      fill: "#F65C26",
      selectable: false,
    });
    this.canvas.add(this.rect);
    this.canvas.add(this.hoverRect);

    this.isReady = true;
  }

  @Watch("times")
  onChangeTimes() {
    this.redrawCanvas();
  }

  @Watch("value")
  onChangeValue() {
    this.moveMinuteLinePosition(this.value);
  }

  goleft(inc = 1) {
    this.prevSkip(inc);
  }

  goRight(inc = 1) {
    this.nextSkip(inc);
  }

  lastKeyboardEvent = 0;
  eventDebounce = 100;

  arrowPressed(direction: string) {
    if (this.lastKeyboardEvent + this.eventDebounce < Number(+new Date())) {
      this.lastKeyboardEvent = Number(+new Date());
      if (direction === "left") {
        this.goleft();
      } else if (direction === "right") {
        this.goRight();
      } else if (direction === "left-1min") {
        this.goleft(2);
      } else if (direction === "right-1min") {
        this.goRight(2);
      }
    }
  }

  dayChanging(direction: string) {
    if (this.lastKeyboardEvent + this.eventDebounce < Number(+new Date())) {
      this.lastKeyboardEvent = Number(+new Date());
      if (direction === "prevDay") {
        this.prevDay();
      } else if (direction === "nextDay") {
        this.nextDay();
      } else {
        this.today();
      }
    }
  }

  created() {
    setTimeout(() => {
      this.redrawCanvas();
    }, 1);

    this.$ipc.receive("arrow-pressed", this.arrowPressed);
    this.$ipc.receive("day-function", this.dayChanging);
    this.interval = setInterval(this.recurringMove, 100);
  }

  destroyed() {
    clearInterval(this.interval);
  }

  interval = 0;

  mounted() {
    let panning = false;

    this.canvas = new fabric.Canvas("timeline-viewer");
    this.canvas.selection = false;
    this.canvas.setDimensions({ width: window.innerWidth - 40, height: 40 });

    window.addEventListener("resize", () => {
      this.redrawCanvas();
    });

    var calcCursorPos = (e: any) => {
      let canvasX = e.e.layerX;
      var clickPercent = canvasX / this.canvas.width!; // dont * by 100 because we need the decimal percent
      var val = Math.round(clickPercent * this.times.length);
      if (val >= this.times.length - 1) {
        val = this.times.length - 2;
      }
      if (val <= 0) {
        val = 0;
      }
      return val;
    };

    this.canvas.on("mouse:up", (e: any) => {
      this.minuteChanged(calcCursorPos(e));
      panning = false;
    });

    this.canvas.on("mouse:down", (e: any) => {
      this.minuteChanged(calcCursorPos(e));
      panning = true;
    });
    this.canvas.on("mouse:out", (e: any) => {
      this.hideMinuteHoverLine();
    });

    this.canvas.on("mouse:move", (e: any) => {
      if (e && e.e) {
        if (panning) {
          this.minuteChanged(calcCursorPos(e));
          // var units = 10
          // var delta = new fabric.Point(e.e.movementX, e.e.movementY)
        } else {
          this.moveMinuteHoverLinePosition(calcCursorPos(e));
        }
      }
    });
  }
}
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

  .play-btn {
    background: none; // $color-green;
    border: none;
    height: 34px;
    width: 36px;
    color: $theme-text-color;
    position: relative;
    border-radius: 6px;

    i {
      position: absolute;
      top: 8px;
      left: 14px;
      font-size: 20px;
    }
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
        top: 3px;
        -webkit-app-region: no-drag;
        -webkit-user-select: none;
        user-select: none;
      }
    }
  }
}
</style>
