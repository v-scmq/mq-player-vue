import {createApp} from "vue";
import app from "./App";
import router from "./router";

import control from "./components";
import "../assets/css/style.css";

import api from "./api";
import axios from "axios";
import db from './database';
import player from './player';

createApp(app)
    .use(control)
    .use(router)
    .use(api)
    .use(app => {
        app.config.globalProperties.$db = db;
        app.config.globalProperties.$player = player;
        app.config.globalProperties.$request = axios;
    }).mount('#app');