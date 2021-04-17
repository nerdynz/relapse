<template>
  <div class="timeline" :style="timelineReadyStyle">
    <div class="picker">
      <button class="side-btn prev-day" @click="prevDay">
        <fa-icon icon="caret-left" />
      </button>
      <datepicker
        :value="day"
        @selected="dayChanged"
        :highlighted="highlighted"
        @opened="datePickerOpened"
      ></datepicker>
      <button class="side-btn next-day" @click="nextDay">
        <fa-icon icon="caret-right" />
      </button>
    </div>
    <div class="canvas-bg" :style="timelineReadyStyle">
      <button
        class="side-btn prev-minute"
        @mousedown="prevMinute"
        @mouseup="prevMinuteOff"
      >
        <fa-icon icon="caret-left" />
      </button>
      <canvas
        ref="timelineCanvas"
        id="timeline-viewer"
        width="1280"
        height="40"
      ></canvas>
      <button
        class="side-btn next-minute"
        @mousedown="nextMinute"
        @mouseup="nextMinuteOff"
      >
        <fa-icon icon="caret-right" />
      </button>
      <div class="time">{{ currentTime() }}</div>
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
  </div>
</template>

<script lang="ts">
import { ipcRenderer } from 'electron'
import { Vue, Options } from 'vue-class-component'
import { Watch, Prop } from 'vue-property-decorator'

import { fabric } from 'fabric'
import dateFormat from 'dateformat'
import Datepicker from './DatePicker.vue'

const timeColor = '#1BC98E'

@Options({
  components: {
    Datepicker
  }
})
export default class Timeline extends Vue {
  @Prop()
  times!: any

  @Prop()
  value!: number

  @Prop()
  firstImageIndex!: number

  @Prop()
  lastImageIndex!: number

  @Prop()
  day!: Date

  canvas!: fabric.Canvas
  rect!: fabric.Rect
  hoverRect!: fabric.Rect

  isMouseDown = false
  minuteChangeIncrement = 0
  isReady = false
  highlighted = {
    dates: [new Date()]
  }

  get timelineReadyStyle () {
    console.log('ready', this.isReady)
    if (this.isReady) {
      return 'opacity:1;'
    }
    return 'opacity:0;'
  }

  get bgColor () {
    return '#F6F6F6'
  }

  get timesWhereIsWholeHour () {
    const wholeHours = this.times.filter((t: any) => {
      var actualDate = new Date(t.date)
      if (actualDate.getMinutes() === 0) {
        return true
      }
      return false
    })
    return wholeHours
  }

  datePickerOpened () {
    this.highlighted = {
      dates: [new Date()]
    }
  }

  prevDay () {
    const newDate = new Date(this.day)
    newDate.setDate(this.day.getDate() - 1)
    this.dayChanged(newDate, true)
  }

  nextDay () {
    const newDate = new Date(this.day)
    newDate.setDate(this.day.getDate() + 1)
    this.dayChanged(newDate, false)
  }

  today () {
    const newDate = new Date()
    this.dayChanged(newDate, true)
  }

  dayChanged (date: Date, skipToEnd: boolean) {
    this.canvas.clear()
    this.$emit('day-change', { date, skipToEnd })
  }

  prevMinute () {
    this.minuteChangeIncrement = -1
  }

  nextMinute () {
    this.minuteChangeIncrement = +1
  }

  prevMinuteOff () {
    this.minuteChangeIncrement = 0
  }

  nextMinuteOff () {
    this.minuteChangeIncrement = 0
  }

  minuteChanged (index: number) {
    this.moveMinuteLinePosition(index)
    this.$emit('minute-index-change', index)
  }

  moveMinuteLinePosition (index: number) {
    var xPos = this.getLinePoint(index)
    this.rect.set({ left: xPos })
    this.canvas.renderAll()
  }

  moveMinuteHoverLinePosition (index: number) {
    var xPos = this.getLinePoint(index)
    this.hoverRect.set({ left: xPos, height: 60 })
    this.canvas.renderAll()
  }

  hideMinuteHoverLine () {
    this.hoverRect.set({ height: 0 })
    this.canvas.renderAll()
  }

  markerStyle (index: number) {
    let percent = (index / (this.timesWhereIsWholeHour.length - 1)) * 100
    return `left: ${percent}%;`
  }

  isWholeHour (date: Date) {
    var actualDate = new Date(date)
    if (actualDate.getMinutes() === 0) {
      return true
    }

    return false
  }

  getLinePoint (index: number) {
    // console.log(this.canvas.width, index, this.times.length)
    var linePoint = 0
    if (this.canvas && this.canvas.width) {
      return (this.canvas.width * ((index / this.times.length) * 100)) / 100
    }
    return linePoint
  }

  currentTime () {
    let currentTime = this.times[this.value]
    if (currentTime) {
      return this.formatDate(currentTime.date)
    }

    return ''
  }

  mouseout () {
    // this.isMouseDown = false
  }

  formatDate (date: Date) {
    if (date) {
      return dateFormat(date, 'h:MMTT')
    }

    return ''
  }

  formatDateSmall (date: Date) {
    if (date) {
      return dateFormat(date, 'hTT')
    }
    return ''
  }

  redrawCanvas () {
    this.canvas.setDimensions({ width: window.innerWidth - 330, height: 30 })
    // clear it
    this.canvas.clear()

    // recalc line widths to be used for indicator and time rectanges
    let lineWidth = 0
    if (this.canvas && this.canvas.width) {
      lineWidth = (this.canvas.width * ((1 / this.times.length) * 100)) / 100
    }

    // draw the times, one rect for each solid block of work (i.e. isReal) toggle between isReal and !isReal to create full rects
    var currentOnOffness = false
    var lastRectIndex = 0
    for (var i = 0; i < this.times.length; i++) {
      var time = this.times[i] // eslint-disable-line no-unused-vars
      var left = this.getLinePoint(i)
      if (i === 0) {
        currentOnOffness = time.isReal
        lastRectIndex = left
      } else if (currentOnOffness !== time.isReal) {
        // we have toggled so now we need to draw a new rect
        // DEBUG - ()
        // console.log('left', left)
        // console.log('lastrectindex', lastRectIndex)
        // console.log('lineWidth', lineWidth)
        // console.log('how wide should I be', (left - lastRectIndex))
        // END DEBUG
        this.canvas.add(
          new fabric.Rect({
            width: left - lastRectIndex,
            height: 40,
            left: lastRectIndex,
            top: 0,
            stroke: !time.isReal ? timeColor : this.bgColor, // reversed because its not real
            fill: !time.isReal ? timeColor : this.bgColor, // reversed because its not real
            selectable: false
          })
        )
        lastRectIndex = left
        currentOnOffness = time.isReal
      } else if (i === this.times.length - 1) {
        this.canvas.add(
          new fabric.Rect({
            width: left - lastRectIndex,
            height: 40,
            left: lastRectIndex,
            top: 0,
            stroke: time.isReal ? timeColor : this.bgColor, // this is the actualness :)
            fill: time.isReal ? timeColor : this.bgColor, // this is the actualness :)
            selectable: false
          })
        )
      }
    }

    console.log('this.value', this.value)

    // draw the indicator for what time we are currently on
    this.rect = new fabric.Rect({
      width: lineWidth,
      height: 60,
      left: this.getLinePoint(this.value),
      top: 0,
      stroke: '#F65C26',
      fill: '#F65C26',
      selectable: false
    })

    this.hoverRect = new fabric.Rect({
      width: lineWidth * 1,
      height: 60,
      left: this.getLinePoint(this.value),
      top: 0,
      stroke: '#71ff60',
      fill: '#71ff60',
      selectable: false
    })
    this.canvas.add(this.rect)
    this.canvas.add(this.hoverRect)

    this.isReady = true
  }

  @Watch('times')
  onChangeTimes () {
    this.redrawCanvas()
  }

  @Watch('minuteChangeIncrement')
  onChangeMinuteIncrement () {
    let callCountIncrement = 0
    let changeMinute = () => {
      if (this.minuteChangeIncrement !== 0) {
        // we have the mouse down
        var newValue = this.value + this.minuteChangeIncrement
        this.minuteChanged(newValue)
        callCountIncrement++
        if (callCountIncrement > 30) {
          setTimeout(changeMinute, 45)
        } else if (callCountIncrement > 20) {
          setTimeout(changeMinute, 75)
        } else if (callCountIncrement > 10) {
          setTimeout(changeMinute, 90)
        } else {
          setTimeout(changeMinute, 140)
        }
      }
    }
    changeMinute()
  }

  created () {
    setTimeout(() => {
      this.redrawCanvas()
    }, 1)
  }

  mounted () {
    let panning = false

    this.canvas = new fabric.Canvas('timeline-viewer')
    this.canvas.selection = false
    this.canvas.setDimensions({ width: window.innerWidth - 40, height: 40 })

    window.addEventListener('resize', () => {
      this.redrawCanvas()
    })

    var calcCursorPos = (e: any) => {
      let canvasX = e.e.layerX
      var clickPercent = canvasX / this.canvas.width! // dont * by 100 because we need the decimal percent
      var val = Math.round(clickPercent * this.times.length)
      if (val >= this.times.length - 1) {
        val = this.times.length - 2
      }
      if (val <= 0) {
        val = 0
      }
      return val
    }

    this.canvas.on('mouse:up', e => {
      this.minuteChanged(calcCursorPos(e))
      panning = false
    })

    this.canvas.on('mouse:down', e => {
      this.minuteChanged(calcCursorPos(e))
      panning = true
    })
    this.canvas.on('mouse:out', e => {
      console.log('mouse went in')
      this.hideMinuteHoverLine()
    })

    this.canvas.on('mouse:move', e => {
      if (e && e.e) {
        if (panning) {
          this.minuteChanged(calcCursorPos(e))
          // var units = 10
          // var delta = new fabric.Point(e.e.movementX, e.e.movementY)
        } else {
          this.moveMinuteHoverLinePosition(calcCursorPos(e))
        }
      }
    })

    let lastKeyboardEvent = 0
    let eventDebounce = 100

    var goleft = () => {
      this.prevMinute()
      this.$nextTick(() => {
        // DOM updated
        this.prevMinuteOff()
      })
    }

    var goRight = () => {
      this.nextMinute()
      this.$nextTick(() => {
        // DOM updated
        this.nextMinuteOff()
      })
    }

    ipcRenderer.on('arrow-pressed', (ev, direction) => {
      if (lastKeyboardEvent + eventDebounce < Number(+new Date())) {
        lastKeyboardEvent = Number(+new Date())
        if (direction === 'left') {
          goleft()
        } else if (direction === 'right') {
          goRight()
        }
      }
    })
    ipcRenderer.on('day-function', (ev, direction) => {
      if (lastKeyboardEvent + eventDebounce < Number(+new Date())) {
        lastKeyboardEvent = Number(+new Date())
        if (direction === 'prevDay') {
          this.prevDay()
        } else if (direction === 'nextDay') {
          this.nextDay()
        } else {
          this.today()
        }
      }
    })
  }
}
</script>

<style lang="scss">
@import '../scss/variables';
.timeline {
  opacity: 0;
  width: 100%;
  position: fixed;
  top: 36px;
  left: 0;
  background: $handlebar-color;
  z-index: 5000;
  -webkit-app-region: no-drag;

  .side-btn {
    cursor: pointer;
    position: absolute;
    height: 30px;
    width: 25px;
    border: none;
    background: $light-theme-input-bg-transparency;
    color: $light-theme-text-color;
    top: 0;
    outline: none !important;
    font-size: 16px;
    text-align: center;

    &:hover,
    &:active {
      background-color: $light-theme-input-active-bg;
    }
  }

  .play-btn {
    background: none; // $color-green;
    border: none;
    height: 30px;
    width: 36px;
    color: $light-theme-text-color;
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
    position: absolute;
    top: 2px;
    left: 20px;
    -webkit-app-region: no-drag;

    .side-btn {
      &.next-day {
        // border-left: 1px solid $light-theme-lines-between-color;
        left: 135px;
        top: 0;
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
      }

      &.prev-day {
        left: 0;
        // border-right: 1px solid $light-theme-lines-between-color;
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
      }
    }

    .datepicker {
      position: absolute;
      left: 25px;

      input[type='text'] {
        text-align: center;
        font-size: 15px;
        height: 30px;
        background: $light-theme-input-bg;
        border: none;
        font-weight: normal;
        color: $light-theme-text-color;
        width: 110px;
        cursor: pointer;
        -webkit-user-select: none;
        user-select: none;
        outline: none !important;

        &:hover,
        &:active,
        &.active {
          background: $light-theme-input-active-bg;
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
    position: absolute;
    right: 110px;
    top: 2px;
    height: 30px;
    background-color: $light-theme-input-bg-transparency;

    .side-btn {
      &.next-minute {
        // border-left: 1px solid $light-theme-lines-between-color;
        right: -25px;
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
      }

      &.prev-minute {
        left: -25px;
        // border-right: 1px solid $light-theme-lines-between-color;
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
      }
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
    color: $light-theme-text-color;

    .tick {
      font-size: 9px;
      color: $light-theme-text-color;

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
