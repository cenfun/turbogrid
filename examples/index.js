import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import App from './app.vue';
import { routes } from './router.js';

// Import turbogrid and make it globally available
import * as tg from '../src/index.js';
window.turbogrid = tg;

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

const app = createApp(App);
app.use(router);
app.mount('#app');
