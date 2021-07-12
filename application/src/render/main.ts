import Icons from '@/components/Icons.vue'
import { createApp } from 'vue'
import App from './App.vue'

createApp(App)
  .component('ico', Icons)
  .mount('#app')
