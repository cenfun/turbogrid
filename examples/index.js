import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import App from './app.vue';
import { routes } from './router.js';
import { setCurrentSource } from './global.js';

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

router.afterEach((to) => {
    setCurrentSource({
        path: to.meta.sourcePath,
        loader: to.meta.sourceLoader
    });
});

const app = createApp(App);
app.use(router);
app.mount('#app');
