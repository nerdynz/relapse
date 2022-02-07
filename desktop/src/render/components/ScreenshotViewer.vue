<template>
  <div class="screenshot-viewer">
    <timeline
      :times="localTimes"
      :firstImageIndex="firstImageIndex"
      :lastImageIndex="lastImageIndex"
      :value="currentImageIndex"
      @minute-index-change="currentImageIndexChanged"
      :current-capture="currentCapture"
      :day="currentDate"
      @day-change="loadNewDay"
    />
    <settings v-if="settingsVisible" />
    <div v-show="!settingsVisible" class="screenshot-viewer">
      <zoom
        :value="currentZoomLevel"
        @input="zoomLevelChanged"
        @middle-clicked="redrawCanvas()"
      />
      <canvas ref="canvasEl" id="screenshot-viewer" width="1280" height="800" />
    </div>
  </div>
</template>

<script lang="ts">
import Timeline from '../components/Timeline.vue'
import Zoom from '../components/Zoom.vue'
import Settings from '../views/Settings.vue'
import { relapseModule } from '../store/relapseModule'
import { Vue, Options } from 'vue-class-component'
import { Watch } from 'vue-property-decorator'
import { CaptureSimple, DayInfo, DaySwap } from '../interfaces/dayInfo.interface'
import { fabric } from 'fabric'
import { IEvent } from 'fabric/fabric-impl'
// import { DayRequest } from '@/grpc/relapse_pb'
// import moment from 'moment'

let canvas: fabric.Canvas
let canvasX: number
let canvasY: number
let lastRenderedImg: fabric.Image

@Options({
  components: {
    Timeline,
    Zoom,
    Settings
  }
})
export default class ScreenshotViewer extends Vue {
  currentZoomLevel = 0.5
  currentImageIndex = 0
  firstTime = new Date()
  lastTime = new Date()
  localTimes: Array<CaptureSimple> = []
  firstImageIndex = 0
  lastImageIndex = 0

  get currentDate () {
    return relapseModule.currentDate;
  }

  get settingsVisible () {
    return relapseModule.isPreferencesShowing
  }

  get canvas (): HTMLCanvasElement {
    return this.$refs.canvasEl as HTMLCanvasElement
  }

  get ctx () {
    return this.canvas.getContext('2d')
  }

  get currentCapture () {
    return this.localTimes[this.currentImageIndex];
  }

  get filePath () {
    const file = this.currentCapture
    if (!file) return null
    if (!file.filepath) return null
    const filePath = file.filepath.split('app/dist')[1]
    if (filePath) return filePath
    return 'relapse-image:/' + file.filepath
  }

  get currentDay () {
    return relapseModule.currentDay
  }

  loadNewDay (val?: DaySwap) {
    let date = this.currentDate
    let skipToEnd = false
    if (val) {
      if (val.date) {
        date = val.date
      }
      if (val.skipToEnd) {
        skipToEnd = val.skipToEnd
      }
    }
    canvas.clear()
    relapseModule.loadDayFromServer({
      date: new Date(date),
      skipToEnd: skipToEnd
    })
  }

  next () {
    this.currentImageIndex++
  }

  prev () {
    this.currentImageIndex--
  }

  currentImageIndexChanged (val: any) {
    this.currentImageIndex = val
    if (this.filePath) {
      fabric.Image.fromURL(this.filePath, function (oImg) {
        oImg.left = 0
        oImg.top = 0
        oImg.selectable = false
        oImg.hoverCursor = '-webkit-grab'
        oImg.moveCursor = '-webkit-grabbing'
        canvas.add(oImg)
        canvas.remove(lastRenderedImg)
        lastRenderedImg = oImg
      })
    } else {
      canvas.remove(lastRenderedImg)
    }

    // if we are on the settings screen we dont need to load the canvas screen
    // if (!this.settingsVisible) {
    // relapseModule.changePreferences(false)
    // }
  }

  zoomLevelChanged (newZoom: number) {
    const canvasX = canvas.width! / 2
    const canvasY = canvas.height! / 3
    this.setCanvasZoomLevel(canvasX, canvasY, newZoom)
  }

  setCanvasZoomLevel (canvasX: number, canvasY: number, newZoom: number) {
    if (newZoom >= 0.09 && newZoom < 2.1) {
      this.currentZoomLevel = newZoom
      canvas.zoomToPoint(new fabric.Point(canvasX, canvasY), newZoom)
    }
  }

  redrawCanvas () {
    this.currentZoomLevel = 0.7
    canvas.selection = false
    canvas.defaultCursor = '-webkit-grab'
    canvas.absolutePan(new fabric.Point(-50, -60))
    canvas.setZoom(this.currentZoomLevel)
    canvas.setDimensions({
      width: window.innerWidth,
      height: window.innerHeight - 30
    })
  }

  updateLocalTimes () {
    let localTimes = []
    let dateHolder = new Date(this.currentDate)
    // to be fkn sure....
    dateHolder.setHours(0)
    dateHolder.setMinutes(0)
    dateHolder.setSeconds(0)
    dateHolder.setMilliseconds(0)

    let i = 0
    if (this.currentDay && this.currentDay.capturesList) {
      this.firstImageIndex = 0
      this.lastImageIndex = 0

      // loop all the minutes of a given day
      for (let minute = 0; minute < 1441; minute++) {
        for (let second = 0; second < 60; second = second + 30) {
          let filepath
          let isReal = false

          // consistant date for current itteration i.e. i(itteration)Date
          let iDate = new Date(dateHolder)
          iDate.setMinutes(minute)
          iDate.setSeconds(second)
          iDate.setMilliseconds(0)

          // loop all the files and check if any belong to this minute
          for (let j = 0; j < this.currentDay.capturesList.length; j++) {
            let file = this.currentDay.capturesList[j]
            let ms = Number(file.capturetimeseconds) * 1000
            // make those suckers consistant
            let fileDate = new Date(ms)
            // fileDate.setSeconds(second)
            fileDate.setMilliseconds(0)

            if (+iDate === +fileDate) {
              // WE ARE A REAL NUM
              if (this.firstImageIndex === 0) {
                this.firstImageIndex = i
              }
              this.lastImageIndex = i // always update this because we dont get into this piece of logic unless its real
              if (this.currentImageIndex === 0) {
                // if (this.currentImageIndex === 0 || this.currentDay.skipToEnd) {
                this.currentImageIndex = i
              }
              isReal = true
              filepath = file.fullpath
              break
            }
          }

          localTimes.push({
            date: iDate,
            isReal: isReal,
            filepath: filepath
          })
          i++
        }
      }
    } else {
      // same but slightly more performant then 1440 if checks
      for (let i = 0; i < 1441; i++) {
        for (let second = 0; second < 60; second = second + 30) {
          let date = new Date(dateHolder)
          date.setMinutes(i)
          date.setSeconds(second)
          localTimes.push({
            date: date,
            isReal: false
          })
        }
      }
    }
    // @ts-ignore
    this.localTimes = localTimes
    // return localTimes
  }

  @Watch('currentDay')
  onChangeCurrentDay () {
    setTimeout(() => {
      this.updateLocalTimes()
      this.currentImageIndexChanged(this.currentImageIndex)
    }, 10)
  }

  lastEventDate = 0
  onMouseWheel (e: WheelEvent) {
    let wheelDelta = -e.deltaY || -e.detail
    let eventDebounce = 50
    let incAmount = 0.05
    if (wheelDelta < -100 || wheelDelta > 100) {
      eventDebounce = 10 // likely its a mouse...
      incAmount = 0.05
    }

    if (this.lastEventDate + eventDebounce < Number(+new Date())) {
      this.lastEventDate = Number(+new Date())
      var delta = Math.max(-1, Math.min(1, wheelDelta))

      let newZoom = this.currentZoomLevel + delta * incAmount
      // round it to 1 decimal place
      newZoom = Math.round(newZoom * 100)
      newZoom = newZoom / 100

      this.setCanvasZoomLevel(canvasX, canvasY, newZoom)
    }
  }

  setCanvasDimensions () {
    canvas.setDimensions({
      width: window.innerWidth,
      height: window.innerHeight - 30
    })
  }

  mounted () {
    let panning = false
    canvas = new fabric.Canvas('screenshot-viewer')
    canvas.selection = false
    // canvas.defaultCursor = '-webkit-grab'
    canvas.absolutePan(new fabric.Point(-50, -50))

    canvas.on('mouse:up', (e: IEvent) => {
      canvas.defaultCursor = '-webkit-grab'
      if (e.target) {
        e.target!.hoverCursor = '-webkit-grab'
      }
      panning = false
    })

    canvas.on('mouse:down', (e: IEvent) => {
      canvas.defaultCursor = '-webkit-grabbing'
      if (e.target) {
        e.target!.hoverCursor = '-webkit-grabbing'
      }
      panning = true
    })

    canvas.on('mouse:move', (e: IEvent) => {
      let event = e.e as any
      canvasX = event.layerX
      canvasY = event.layerY
      if (panning && e && event) {
        // var units = 10
        var delta = new fabric.Point(event.movementX, event.movementY)
        canvas.relativePan(delta)
      }
    })

    window.addEventListener('resize', this.setCanvasDimensions)

    // mousewheel & trackpad zoom
    // @ts-ignore
    document.addEventListener('mousewheel', this.onMouseWheel, false)
    this.updateLocalTimes()
    this.loadNewDay()
    this.redrawCanvas()
  }
}
</script>

<style>
img {
  margin-top: -25px;
  width: 450px;
}

.screenshot-viewer {
  position: relative;
  background-color: black;
}

.zoom {
  position: absolute;
  top: 20px;
  right: 20px;
}
</style>
