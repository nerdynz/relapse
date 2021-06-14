<template>
  <div class="app-capture-toggle" :class="cssClass">
    <div class="capturing">
      Capturing
    </div>
    <div class="disabled">
      Disabled
    </div>
  </div>
</template>

<script lang="ts">
// import FilePicker from './FilePicker'
// import Numeric from '@/components/Numeric'
// import {mapGetters, mapActions} from 'vuex'
// import { RelapseSettings } from '@/interfaces/state.interface';
import { ApplicationInfo } from '@/grpc/relapse_pb'
import { Vue, Options } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

@Options({
  components: {
    // Numeric
  }
})
export default class Settings extends Vue {
  @Prop({ required: true }) app!: ApplicationInfo.AsObject
  @Prop({ required: true, default: [] }) rejections!: Array<string>

  get cssClass() {
    if (this.rejections.includes(this.app.apppath)) {
      return 'is-disabled'
    }
    return 'is-capturing'
  }
}
</script>

<style lang="scss">
.app-capture-toggle {
  display: flex;
  user-select: none;
  &.is-capturing {
    .capturing {
      background: green;
    }
    .disabled {
      background: grey;
    }
  }
  &.is-disabled {
    .capturing {
      background: grey;
    }
    .disabled {
      background: red;
    }
  }
}
</style>
