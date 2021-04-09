<template>
  <div>
    <div class="numeric-input-wrapper">
      <input class="numeric-path" :value="numberVal" @change="newNumber" />
      <button class="number-btn number-up" @click="numberUp"><i class="fa fa-chevron-up"></i></button>
      <button class="number-btn number-down" @click="numberDown"><i class="fa fa-chevron-down"></i></button>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'numeric',
    computed: {
    },
    props: {
      value: Number,
      min: Number,
      max: Number
    },
    methods: {
      numberUp () {
        var newVal = this.numberVal + 1
        this.numberChanged(newVal)
      },
      numberDown () {
        var newVal = this.numberVal - 1
        this.numberChanged(newVal)
      },
      newNumber (ev) {
        var newVal = Number(ev.target.value)
        if (isNaN(newVal) || newVal < this.min || newVal > this.max) {
          ev.target.value = this.numberVal
        } else {
          this.numberChanged(newVal)
        }
      },
      numberChanged (val) {
        if (val > this.min && val < this.max) {
          this.numberVal = val
          this.$emit('input', val)
        }
      }
    },
    watch: {
      'value': function () {
        this.numberVal = this.value
      }
    },
    mounted: function () {
      this.numberVal = this.value
    },
    data: function () {
      return {
        numberVal: 0
      }
    }
  }
</script>

<style lang="scss">
  .numeric-input-wrapper {
    height: 30px;
    position: relative;
    
    .numeric-path {
      width: 70%;
      position: absolute;
      left: 0;
      top: 0;
      background-color: white;
      color: white;
      height: 29px;
      color: black;
      text-align: left;
      padding: 0 6px;
      line-height: 32px;
      outline: none;
      font-family: system, -apple-system, ".SFNSDisplay-Regular", "Helvetica Neue", Helvetica, "Segoe UI", sans-serif;
      font-size: 13px;
      border:none;
    }

    .number-btn {
      width: 30%;
      position: absolute;
      right: 0;
      height: 14px;
      font-size: 10px;
      cursor: pointer;

      .fa {
        display: block;
        margin-top: -2px;
        margin-left: 2px;
      }

      &.number-up {
        top: 0;

      }
      &.number-down {
        top: 15px;
      }
    }
  }
</style>
