<template>
  <div class="timeline">
    <div ref="line" class="line">
      <span class='notch' v-for="(time, index) in times" :index="index" :style="notchStyle(time, index)">
        
      </span>
      <span class='time'>{{currentTime()}}</span>
      <span class="indicator" :style="indicatorStyle()"></span>
    </div>
  </div>
</template>

<script>
  import dateFormat from 'dateformat'
  
  export default {
    props: {
      times: Array,
      value: Number
    },
    computed: {
      timeArrLen: function () {
        return this.times.length <= 0 ? 0 : (this.times.length - 1)
      },
      smallestTime: function () {
        var smallestTime = this.times[0]
        if (smallestTime && smallestTime.date) {
          smallestTime = new Date(smallestTime.date)
        }
        return smallestTime
      },
      largestTime: function () {
        var largestTime = this.times[this.timeArrLen]
        if (largestTime && largestTime.date) {
          largestTime = new Date(largestTime.date)
        }
        return largestTime
      },
      lineClickerStyle: function () {
        if (this.isMouseDown) {
          return 'cursor: -webkit-grabbing;'
        }
        return 'cursor: pointer;'
      }
    },
    methods: {
      setValue (ev) {
        var notchEle = document.elementFromPoint(ev.clientX, ev.clientY)
        // var elements = document.elementsFromPoint(ev.clientX, ev.clientY)
        // console.log(elements)
        // for (var i = 0; i < elements.length; i++) {
        //   var ele = elements[i]
        //   // console.log(ele)
        //   // console.log(ele.className)
        //   if (ele.className === 'notch') {
        //     notchEle = ele
        //     break
        //   }
        // }
        console.log(notchEle)
        var index = notchEle.getAttribute('index')
        if (notchEle && index && index !== this.value) {
          this.$emit('input', Number(index))
        }
      },
      currentTime () {
        let currentTime = this.times[this.value]
        if (currentTime) {
          return this.formatDate(currentTime.date)
        }
        return ''
      },
      mousemove (ev) {
        if (this.isMouseDown) {
          this.setValue(ev)
        }
      },
      mousedown (ev) {
        this.isMouseDown = true
        this.setValue(ev)
      },
      mouseup (ev) {
        this.isMouseDown = false
        this.setValue(ev)
      },
      mouseout (ev) {
        // this.isMouseDown = false
      },
      formatDate (date) {
        if (date) {
          return dateFormat(date, 'h:MM:ss')
        }
        return ''
      },
      indicatorStyle () {
        let width = 'width: ' + (1 / this.times.length * 100) + '%;'
        let left = 'left: ' + this.value / this.times.length * 100 + '%;'
        return width + left
      },
      notchStyle (time, index) {
        if (!time) return ''
        let width = 'width: ' + (1 / this.times.length * 100) + '%;'
        let left = 'left: ' + index / this.times.length * 100 + '%;'
        let bgColor = 'background-color: ' + (time.isReal ? 'green' : 'grey') + ';'
        return width + left + bgColor
      }
    },
    watch: {

    },
    mounted: function () {
      let line = this.$refs.line

      line.addEventListener('mousemove', this.mousemove)
      line.addEventListener('mouseup', this.mouseup)
      line.addEventListener('mousedown', this.mousedown)
      line.addEventListener('mouseout', this.mouseout)
    },
    data: function () {
      return {
        isMouseDown: false
      }
    }
  }
</script>

<style lang="scss">
  .line{
    position: relative;
    height: 40px;

    .line-clicker-overlay{
      position: absolute;
      height:40px;
      width: 100%;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      cursor: pointer;
    }
    
    .time {
      position: absolute;
      top: 20px;
      left: 50%;
    }

    .notch{
      height: 40px;
      background-color:green;
      // position: absolute;
      display:inline-block;
    }

    .indicator{
      position: absolute;
      top: 0px;
      height: 40px;
      width: 1px;
      background-color: red;
    }
  }
</style>
