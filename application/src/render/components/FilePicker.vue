<template>
  <div>
    <div class="file-input-wrapper">
      <input class="file-path" readonly="readonly" disabled="disabled" v-model="localPath" />
      <button class="change-path-button" @click="changePath">Open Path</button>
    </div>
  </div>
</template>

<script>
  import {mapGetters, mapActions} from 'vuex'

  export default {
    name: 'file-picker',
    computed: {
      ...mapGetters([
        'capturePath'
      ])
    },
    props: {
      value: String
    },
    methods: {
      ...mapActions([
        // 'openDialogBox',
        'openCapturePath'
      ]),
      changePath (ev) {
        console.log(ev)
        // let input = this.$refs.fileURL
        // input.click()
        this.openCapturePath()
      }
    },
    watch: {
      'capturePath': function () {
        this.localPath = this.capturePath
        // this.$emit('input', capturePath)
      }
    },
    mounted: function () {
      this.localPath = this.capturePath
      // this.$refs.fileURL.addEventListener('change', this.folderChanged)
    },
    data: function () {
      return {
        localPath: 'no path selected'
      }
    }
  }
</script>

<style lang="scss">
  .file-input-wrapper {
    height: 30px;
    position: relative;
    
    .file-path {
      width: 75%;
      position: absolute;
      left: 0;
      top: 0;
      background-color: white;
      color: white;
      height: 30px;
      color: black;
      text-align: left;
      padding: 0 6px;
      line-height: 32px;
    }

    .change-path-button {
      width: 25%;
      height: 30px;
      position: absolute;
      right: 0;
    }
  }
</style>
