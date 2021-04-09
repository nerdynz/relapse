// const Vue = require('vue/dist/vue.common')
import { library } from '@fortawesome/fontawesome-svg-core';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { createApp } from 'vue';
import { createRouter, createWebHistory } from "vue-router";
import App from './App.vue';
import About from './components/About';
import MainApp from './components/MainApp';
import Settings from './components/Settings';
import store from './vuex/store';

library.add(far)
library.add(fas)

const routes = [
  {
    path: '/',
    name: 'main-app',
    component:MainApp,
  },
  {
    path: '/about',
    name: 'about',
    component:About,
  },
  {
    path: '/settings',
    name: 'settings',
    component:Settings,
  },
];


const router = createRouter({
  history: createWebHistory(),
  routes: routes
});

createApp(App)
  .component('fa-icon', FontAwesomeIcon)
  .use(store)
  .use(router)
  .mount('#app')

