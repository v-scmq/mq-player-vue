import {createApp} from "vue";
import app from "./App";
import router from "./router";

import control from "./components";
import "../assets/css/style.css";

createApp(app).use(control).use(router).mount('#app');