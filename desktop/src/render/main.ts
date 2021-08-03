import Icons from '@render/components/Icons.vue'
import { createApp } from 'vue'
import App from './App.vue'
import {ipcPlugin} from './ipc';

createApp(App)
  .component('ico', Icons)
  .use(ipcPlugin)
  .mount('#app')
