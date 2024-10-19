import { Events } from "@wailsio/runtime";
import emitter from "./events";

import Icons from "./src/components/Icons.vue";
import { createApp } from "vue";
import App from "./src/App.vue";
import { createPinia } from "pinia";

import { createRouter, createWebHashHistory } from "vue-router";

import { client } from "twirpscript";
client.baseURL = "http://localhost:5020";
const app = createApp(App);

import Home from "./src/views/Home.vue";
import DaySummary from "./src/views/DaySummary.vue";
import About from "./src/views/About.vue";
import Settings from "./src/views/Settings.vue";

// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
const routes = [
  { path: "/", component: Home },
  { path: "/summary", component: DaySummary },
  { path: "/about", component: About },
  { path: "/settings", component: Settings },
];

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHashHistory(),
  routes, // short for `routes: routes`
});

const pinia = createPinia();
app.use(router);
app.use(pinia);
app.component("ico", Icons);

app.mount("#app");

Events.On("screen-captured", (event) => {
    console.log('screen-captured', event)
    emitter.emit('screen-captured', event.data)
})
Events.On("zoom", (event) => emitter.emit("zoom", event.data))
Events.On("zoom", (event) => emitter.emit("zoom", event.data))
Events.On("zoom", (event) => emitter.emit("zoom", event.data))
Events.On("time-function", (event) => emitter.emit("time-function", event.data))
Events.On("time-function", (event) => emitter.emit("time-function", event.data))
Events.On("time-function", (event) => emitter.emit("time-function", event.data))
Events.On("time-function", (event) => emitter.emit("time-function", event.data))
Events.On("time-function", (event) => emitter.emit("time-function", event.data))
