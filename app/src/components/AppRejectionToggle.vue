<template>
  <div class="app-capture-toggle" :class="cssClass">
    <div class="capturing" @click="this.$emit('input', 'CAPTURING')">
      Capturing
    </div>
    <div class="reject" @click="this.$emit('input', 'REJECTING')">
      Reject
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
      return 'is-reject'
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
    .reject {
      background: grey;
    }
  }
  &.is-reject {
    .capturing {
      background: grey;
    }
    .reject {
      background: red;
    }
  }
}
</style>
