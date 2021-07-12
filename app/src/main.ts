import Icons from '@/components/Icons.vue'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { store } from './store'

createApp(App)
  .component('ico', Icons)
  .use(store)
  .mount('#app')
