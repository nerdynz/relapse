<template>
  <div>
    <div class="about">
      <div class="block">
        <div>
          <img class="icon" src="assets/timesheet.png" alt="" />
        </div>
        <h1>Relapse</h1>
        <h2>
          Created by
          <external-link href="https://twitter.com/jaybeecave">
            @jaybeecave
          </external-link>
        </h2>
        <h3>
          Lead Developer @
          <br />
          NERDY -
          <external-link href="http://nerdy.co.nz"></external-link>
        </h3>
        <button v-if="log && isJosh" class="btn save-btn" @click="checkLog">
          Refresh Logs
        </button>
        <div v-if="log && isJosh" class="logs">
          <div v-for="(item, index) in log" :key="index">
            {{ item }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ExternalLink from '@/components/ExternalLink'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'about',
  components: {
    ExternalLink
  },
  computed: {
    isJosh() {
      console.log(this.log[0])
      if (this.log && this.log[0]) {
        return this.log[0].indexOf('Users/jaybeecave') > 0
      }
      return true
    },
    ...mapGetters(['log'])
  },
  methods: {
    ...mapActions(['checkLog'])
  },
  data: function () {
    return {}
  },
  mounted() {
    this.checkLog()
  }
}
</script>

<style lang="scss">
img {
  margin-top: -25px;
  width: 450px;
}

.about {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
  color: $color-light-grey;
  background: $color-bg;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-app-region: drag;

  .icon {
    width: 25%;
    height: 25%;
  }

  .block {
    display: block;
    width: 100%;
    text-align: center;
    margin-top: 40px;
  }

  h1 {
    font-weight: 300;
    color: $color-white;
    margin: 10px;
  }

  h2 {
    font-weight: 300;
    color: $color-white;
    margin: 10px;
  }

  h3 {
    font-weight: 300;
    color: $color-white;
    margin: 10px;
  }

  h4 {
    font-weight: 300;
    color: $color-white;
    margin: 10px;
  }

  h5 {
    font-weight: 300;
    color: $color-white;
    margin: 10px;
  }

  .link {
    color: $color-blue;
  }
}

.logs {
  width: 100%;
  height: 300px;
  overflow-y: scroll;
}
</style>
