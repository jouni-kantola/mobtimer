import { createApp } from "vue";
import App from './App.vue'
import { init } from "./neutralino-api.js";

init();

createApp(App).mount('#app')
