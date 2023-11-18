import Icons from '@render/components/Icons.vue'
import { createApp } from 'vue'
import App from './App.vue'
import {ipcPlugin} from './ipc';

createApp(App)
  .component('ico', Icons)
  .use(ipcPlugin)
  .mount('#app')


import { createWebHashHistory, createRouter } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'main',
      component: App
    },
    {
      path: '/settings',
      name: 'Settings',
      component: App
    }  
  ]
})
export default router