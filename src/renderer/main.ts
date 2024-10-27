import { createApp } from 'vue';
import app from './App.vue';
import router from './router';

import '@/electron';
import '@/styles/base.css';
import '@/styles/style.css';

createApp(app).use(router).mount('#app');
