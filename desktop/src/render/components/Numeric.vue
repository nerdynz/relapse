<template>
  <div>
    <div class="numeric-input-wrapper">
      <input
        class="numeric-input"
        :value="value"
        @input="numberChanged"
        @blur="blurred"
      />
      <button class="number-btn number-up" @click="numberUp">
        <ico icon="angle-up" size="small" />
      </button>
      <button class="number-btn number-down" @click="numberDown">
        <ico icon="angle-down" size="small" />
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "numeric",
  computed: {},
  props: {
    value: {
      type: Number,
      required: true,
    },
    min: Number,
    max: Number,
  },
  methods: {
    numberUp() {
      var newVal = this.value + 1;
      this.numberChanged(newVal);
    },
    numberDown() {
      var newVal = this.value - 1;
      this.numberChanged(newVal);
    },
    numberChanged(val) {
      let ev;
      if (typeof val === "number") {
        // its good
      } else {
        ev = val;
        val = val.target.value;
      }
      if (val > this.min && val < this.max) {
        this.$emit("updated", val);
      }
    },
    blurred() {
      this.$forceUpdate();
    },
  },
};
</script>

<style lang="scss">
.numeric-input-wrapper {
  height: 30px;
  position: relative;

  .numeric-input {
    width: 70%;
    position: absolute;
    left: 0;
    top: 0;
    background-color: $theme-input-bg;
    color: $theme-text-color;
    height: 32px;
    text-align: left;
    padding: 0 6px;
    line-height: 32px;
    outline: none;
    font-family: $font-family-default;
    font-size: 13px;
    border: none;
    border-top-left-radius: $radius;
    border-bottom-left-radius: $radius;
    &:hover {
      // background-color: $theme-input-hover-bg;
    }
  }

  .number-btn {
    width: 30%;
    position: absolute;
    right: 0;
    height: 16px;
    font-size: 10px;
    cursor: pointer;
    &:hover {
      background-color: $theme-input-hover-bg;
    }
    .icon {
      display: block;
      margin-top: -1px;
      margin-left: auto;
      margin-right: auto;
      color: $theme-text-color;
    }

    &.number-up {
      top: 0;
    }
    &.number-down {
      top: 16px;
    }
  }
}
</style>
