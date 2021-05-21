<template>
  <a class="link" href="javascript:void()" @click="linkClicked">
    <slot>
      {{ href }}
    </slot>
  </a>
</template>

<script>
import { ipcRenderer } from 'electron'
export default {
  props: {
    href: String
  },
  methods: {
    linkClicked () {
      ipcRenderer.send('link-clicked', this.href)
    }
  },
  data: function () {
    return {}
  }
}
</script>
