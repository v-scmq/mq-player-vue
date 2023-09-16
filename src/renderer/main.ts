import { createApp } from 'vue';
import app from './App.vue';
import router from './router';

import control from './components';
import './assets/css/base.css';
import './assets/css/style.css';

createApp(app).use(control).use(router).mount('#app');
