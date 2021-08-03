<template>
  <a class="link" href="javascript:void()" @click="linkClicked">
    <slot>
      {{ href }}
    </slot>
  </a>
</template>

<script>
import {defineComponent} from 'vue'
export default defineComponent({
  props: {
    href: String
  },
  methods: {
    linkClicked () {
      this.$ipc.send('link-clicked', this.href)
    }
  },
  data: function () {
    return {}
  }
})
</script>
