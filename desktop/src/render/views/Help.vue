<template>
  <div class="help-view">
    <div class="scroller">
      <div>
        <img class="icon" src="assets/long.png" alt="" />
      </div>
      <div>
        <h2>A couple of tips before you get started</h2>
      </div>
      <div class="flex-boxes">
        <div class="box left-box">
          <h3>Make Relapse Start Automatically at Login</h3>
          <p>Dont forget to set Relapse to open at login</p>
          <p>
            Just [right click] or [control click] the dock icon and set the
            <br />
            <b>Open at Login</b>
            checkbox under options
          </p>
          <img src="assets/OpenAtLogin.png" alt="" />
        </div>
        <div class="box right-box">
          <h3>Screenshots clean up after 30 days</h3>
          <p>
            This is to stop Relapse filling up your disk space with old
            Screenshots
          </p>
          <p>You can change this under preferences</p>
          <img style="margin-top:10px;" src="assets/Prefs.png" alt="" />
        </div>
      </div>
    </div>
    <div class="fixed-bottom">
      <button @click="start" class="btn save-btn">Get Started</button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import _ from 'underscore'

export default {
  name: 'help-view',
  components: {},
  computed: {
    ...mapGetters(['settings'])
  },
  methods: {
    ...mapActions(['saveSettings']),
    start() {
      let settings = _.clone(this.settings)
      settings.isHelpShown = false
      this.saveSettings(settings)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../scss/variables';

.help-view {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 50px;
  left: 0;
  right: 0;
  bottom: 0;
  background: #252830;
  text-align: center;
  overflow-y: auto;
  font-weight: 300;

  img {
    max-width: 100%;
  }

  .fixed-bottom {
    width: 100%;
    height: 60px;
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 30;
    background: #252830;

    .save-btn {
      max-width: 200px;
    }
  }

  .scroller {
    padding: 50px;
  }

  .flex-boxes {
    display: flex;

    .box {
      width: 50%;
      margin-top: 40px;
      margin-bottom: 70px;
      min-height: 300px;
      padding: 20px;
      padding-top: 10px;
    }

    .right-box {
      border-left: 1px solid $color-light-grey;
    }
  }

  h1 {
    color: $color-white;
    font-size: 30px;
    margin-top: 10px;
    font-weight: 400;
  }

  h2 {
    color: $color-white;
    font-size: 40px;
    text-align: center;
    font-weight: 300;
    margin-top: 10px;
  }

  h3 {
    color: $color-white;
    font-size: 32px;
    text-align: center;
    font-weight: 400;
    color: $color-green;
  }

  p {
    font-size: 17px;
    color: $color-white;
    margin-top: 16px;
  }
}
</style>
