<template>
  <!-- <div class="app-capture-toggle" :class="cssClass">
    <div class="capturing toggle-btn" @click="setCapture">Capture</div>
    <div class="reject toggle-btn" @click="setReject">Reject</div>
  </div> -->
  <toggle :model-value="value" on-label="Capture" off-label="Ignore" @input="changeToggle"></toggle>
</template>

<script lang="ts">
import Toggle from '@vueform/toggle'

// import FilePicker from './FilePicker'
// import Numeric from '@render/components/Numeric'
// import {mapGetters, mapActions} from 'vuex'
// import { RelapseSettings } from '@/interfaces/state.interface';
import { Options, Vue } from "vue-class-component";
import { Prop } from "vue-property-decorator";
import { ApplicationInfo } from "../../grpc/relapse_pb";

@Options({
  components: {
    Toggle
    // Numeric
  },
})
export default class Settings extends Vue {
  @Prop({ required: true }) app!: ApplicationInfo.AsObject;
  @Prop({ required: true, default: [] }) rejections!: Array<string>;

  get cssClass() {
    if (this.rejections.includes(this.app.appname)) {
      return "is-reject";
    }
    return "is-capturing";
  }
  
  get value() {
    if (this.rejections.includes(this.app.appname)) {
      return false
    }
    return true
  }

  changeToggle() {
    if (this.value) {
      this.setReject()
    } else {
      this.setCapture()
    }
  }

  setCapture() {
    this.$emit("input", { app: this.app, state: "CAPTURING" });
  }

  setReject() {
    this.$emit("input", { app: this.app, state: "REJECTING" });
  }
}
</script>

<style lang="scss">
.app-capture-toggle {
  display: flex;
  user-select: none;
  justify-content: center;
  padding: 0.25rem 0.5rem;

  .toggle-btn {
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: 60px;
    height: 1.4rem;
    // text-transform: uppercase;
    font-weight: 300;
    font-size: 10px;
    .icon {
      display: block;
    }
    box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.2);
    // &:hover {
    // }
  }

  .capturing {
    border-top-left-radius: $radius-small;
    border-bottom-left-radius: $radius-small;
  }
  .reject {
    border-top-right-radius: $radius-small;
    border-bottom-right-radius: $radius-small;
  }

  &.is-capturing {
    .capturing {
      background: $color-green;
    }
    .reject {
      background: $color-disable;
      color: $color-disable-text-color;
    }
  }
  &.is-reject {
    .capturing {
      background: $color-disable;
      color: $color-disable-text-color;
    }
    .reject {
      background: $color-red;
    }
  }
}


</style>
