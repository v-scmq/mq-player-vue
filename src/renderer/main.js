import Vue from "vue";
import app from "./App";
import router from "./router";

import control from "./components";
import "../assets/css/style.css";
import player from "./player";
import db from "./database";
import api from "./api";
import axios from "axios";

// 已在以下文件修改了导入库的逻辑(require => (window.require || require)("lib-name")
// %project_home%\node_modules\strtok3\lib\FsPromise.js
// %project_home%\node_modules\music-metadata\lib\common\RandomFileReader.js
import * as mm from "music-metadata";

// 确保引入库不会出现错误
let $require$ = window.require || require || (() => null);

Vue.prototype["$electron"] = $require$("electron");
Vue.prototype["$fs"] = $require$("fs");
Vue.prototype["$metadata"] = mm;
Vue.prototype["$player"] = player;
Vue.prototype["$request"] = axios;
Vue.prototype["$db"] = db;
$require$ = null;

Vue.config.productionTip = false;
Vue.use(control);
Vue.use(api);

new Vue({el: "#app", components: {app}, template: "<app/>", router});
