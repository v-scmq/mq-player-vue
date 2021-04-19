import Vue from 'vue';
import app from './App';
import router from './router';

import elementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import 'xe-utils';
import 'vxe-table/lib/style.css';
import vxeTable from "vxe-table";

import control from './components';
import '../assets/css/style.css';
import player from "./player";
import db from "./database";
import api from './api';
import axios from "axios";

Vue.prototype["$electron"] = window.require ? window.require('electron') : null;
Vue.prototype["$metadata"] = window.require ? window.require('music-metadata') : null;
Vue.prototype["$player"] = player;
Vue.prototype["$request"] = axios;
Vue.prototype["$db"] = db;

Vue.config.productionTip = false;
Vue.use(vxeTable);
Vue.use(elementUI);
Vue.use(control);
Vue.use(api);

new Vue({el: "#app", components: {app}, template: "<app/>", router});
