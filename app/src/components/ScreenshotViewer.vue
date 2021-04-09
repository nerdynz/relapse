<template>
  <div class="screenshot-viewer">
    <timeline :times="localTimes" :firstImageIndex="firstImageIndex" :lastImageIndex="lastImageIndex" :value="currentImageIndex" @minute-index-change="currentImageIndexChanged" :day="currentDate" @day-change='loadNewDay' />
    <zoom :value="currentZoomLevel" @input="zoomLevelChanged" @middle-clicked="redrawCanvas"></zoom>
    <canvas ref="canvasEl" id="screenshot-viewer" width="1280" height="800">
    </canvas>
  </div>
</template>

<script>
  import timeline from './Timeline'
  import zoom from './Zoom'
  // import dateFormat from 'dateformat'
  import {mapGetters, mapActions} from 'vuex'
  import {fabric} from 'fabric-webpack'

  let canvas
  let canvasX
  let canvasY
  let lastRenderedImg
  export default {
    components: {
      timeline,
      zoom
    },
    name: 'screenshot-viewer',
    computed: {
      canvas () {
        return this.$refs.canvasEl
      },
      ctx () {
        return this.$refs.canvasEl.getContext('2d')
      },
      ...mapGetters([
        'currentDay'
      ]),
      filePath () {
        let file = this.localTimes[this.currentImageIndex]
        // console.log(file)
        if (!file) return null
        if (!file.filepath) return null
        let filePath = file.filepath.split('app/dist')[1]
        if (filePath) return filePath
        // console.log('filepath', file.filepath)
        return 'relapse-image:/' + file.filepath
      }
    },
    methods: {
      ...mapActions([
        'loadDayFromServer'
      ]),
      loadNewDay (val) {
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
        this.loadDayFromServer({
          date: new Date(date),
          skipToEnd: skipToEnd
        })
      },
      next () {
        this.currentImageIndex++
      },
      prev () {
        this.currentImageIndex--
      },
      currentImageIndexChanged (val) {
        this.currentImageIndex = val
        if (this.filePath) {
          fabric.Image.fromURL(this.filePath, function (oImg) {
            oImg.left = 0
            oImg.top = 0
            oImg.selectable = false
            canvas.add(oImg)
            canvas.remove(lastRenderedImg)
            lastRenderedImg = oImg
          })
        } else {
          canvas.remove(lastRenderedImg)
        }
      },
      zoomLevelChanged (newZoom) {
        let canvasX = canvas.width / 2
        let canvasY = (canvas.height / 3)
        this.setCanvasZoomLevel(canvasX, canvasY, newZoom)
      },
      setCanvasZoomLevel (canvasX, canvasY, newZoom) {
        if (newZoom >= 0.09 && newZoom < 2.1) {
          this.currentZoomLevel = newZoom
          canvas.zoomToPoint(new fabric.Point(canvasX, canvasY), newZoom)
        }
      },
      redrawCanvas () {
        this.currentZoomLevel = 0.7
        canvas.setZoom(this.currentZoomLevel)
        canvas.selection = false
        canvas.defaultCursor = '-webkit-grab'
        canvas.absolutePan(new fabric.Point(-50, -60))
        canvas.setDimensions({width: window.innerWidth, height: window.innerHeight - 30})
      },
      updateLocalTimes () {
        // var worker = new Worker('../timelineWorker.js')
        // worker.onmessage = function (e) {
        //   console.log('Message received from worker')
        // }
        // worker.postMessage(['first.value', 'second.value'])
        // console.log(worker)
        let localTimes = []
        let dateHolder = new Date(this.currentDate)
        // to be fkn sure....
        dateHolder.setHours(0)
        dateHolder.setMinutes(0)
        dateHolder.setSeconds(0)
        dateHolder.setMilliseconds(0)
        let totalMinutesWorked = 0

        if (this.currentDay && this.currentDay.files) {
          console.log('is this a thing that is happening', this.currentDay.files)
          this.firstImageIndex = 0
          this.lastImageIndex = 0

          // loop all the minutes of a given day
          for (let i = 0; i < 1441; i++) {
            let filepath
            let isReal = false

            // consistant date for current itteration i.e. i(itteration)Date
            let iDate = new Date(dateHolder)
            iDate.setMinutes(i)

            // loop all the files and check if any belong to this minute
            for (let j = 0; j < this.currentDay.files.length; j++) {
              let file = this.currentDay.files[j]

              let ms = Number(file.CaptureTimeSeconds) * 1000
              // make those suckers consistant
              let fileDate = new Date(ms)
              fileDate.setSeconds(0)
              fileDate.setMilliseconds(0)
              // console.log('ffff ->', file.CaptureID + "_CAPTURE", fileDate, " comparison", iDate, fileDate)

              if ((+iDate) === (+fileDate)) { // WE ARE A REAL NUM
                // console.log('yep we have some')
                if (this.firstImageIndex === 0) {
                  this.firstImageIndex = i
                }
                this.lastImageIndex = i // always update this because we dont get into this piece of logic unless its real
                if (this.currentImageIndex === 0 || this.currentDay.skipToEnd) {
                  this.currentImageIndex = i
                }
                isReal = true
                filepath = file.Fullpath
                totalMinutesWorked++
                break
              }
            }

            localTimes.push({
              date: iDate,
              isReal: isReal,
              filepath: filepath
            })
          }
        } else {
          // same but slightly more performant then 1440 if checks
          for (let i = 0; i < 1441; i++) {
            let date = new Date(dateHolder)
            date.setMinutes(i)
            localTimes.push({
              date: date,
              isReal: false
            })
          }
        }
        this.localTimes = localTimes
        this.$emit('minutes-calculated', totalMinutesWorked)
        console.log('localTimes -> ', localTimes)
      }
    },
    watch: {
      'currentDay': function () {
        // this.currentImageIndex = 0
        this.currentDate = this.currentDay.fullDate ? new Date(this.currentDay.fullDate) : new Date()
        setTimeout(() => {
          console.log('current 2')
          this.updateLocalTimes()
        }, 10)
      }
    },
    mounted () {
      let self = this
      let panning = false

      canvas = new fabric.Canvas('screenshot-viewer')
      canvas.on('mouse:up', function () {
        canvas.defaultCursor = '-webkit-grab'
        panning = false
      })

      canvas.on('mouse:down', function () {
        canvas.defaultCursor = '-webkit-grabbing'
        panning = true
      })

      canvas.on('mouse:move', function (e) {
        canvasX = e.e.layerX
        canvasY = e.e.layerY
        // console.log(e.e)

        if (panning && e && e.e) {
          // var units = 10
          var delta = new fabric.Point(e.e.movementX, e.e.movementY)
          canvas.relativePan(delta)
        }
      })

      window.addEventListener('resize', function () {
        canvas.setDimensions({width: window.innerWidth, height: window.innerHeight - 30})
      })

      // mousewheel & trackpad zoom
      let lastEventDate = 0
      document.addEventListener('mousewheel', function (e) {
        let wheelDelta = (e.wheelDelta || -e.deltaY || -e.detail)
        let eventDebounce = 50
        let incAmount = 0.05
        if (wheelDelta < -100 || wheelDelta > 100) {
          eventDebounce = 10  // likely its a mouse...
          incAmount = 0.05
        }

        if ((lastEventDate + eventDebounce) < Number(+new Date())) {
          lastEventDate = Number((+new Date()))
          var delta = Math.max(-1, Math.min(1, wheelDelta))

          let newZoom = self.currentZoomLevel + (delta * incAmount)
          // round it to 1 decimal place
          newZoom = Math.round(newZoom * 100)
          newZoom = newZoom / 100

          self.setCanvasZoomLevel(canvasX, canvasY, newZoom)
        }
      }, false)

      this.redrawCanvas()
      this.loadNewDay()
    },
    data () {
      return {
        currentZoomLevel: 0.5,
        currentImageIndex: 0,
        currentDate: new Date(),
        firstTime: new Date(),
        lastTime: new Date(),
        localTimes: [],
        firstImageIndex: 0,
        lastImageIndex: 0
      }
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
