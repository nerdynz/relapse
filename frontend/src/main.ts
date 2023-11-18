import Icons from './components/Icons.vue'
import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";

import {createRouter, createWebHashHistory} from 'vue-router'

import { client } from "twirpscript";
client.baseURL = "http://localhost:5020";
const app = createApp(App);


import Home from './views/Home.vue'
import About from './views/About.vue'
import Settings from './views/Settings.vue'

// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/settings', component: Settings },
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHashHistory(),
  routes, // short for `routes: routes`
})


const pinia = createPinia();
app.use(router);
app.use(pinia);
app.component('ico', Icons)

app.mount("#app");
