import { getGridRows } from './utils/nav-data.js';

export const routes = [];

function addRoute(path, componentPath, meta) {
    routes.push({
        path,
        meta: meta || {},
        // @vite-ignore
        component: () => import(`./${componentPath}`)
    });
}

// Home
addRoute('/', 'pages/getting-started.vue', {
    title: 'Getting Started'
});

// API docs
addRoute('/api', 'pages/api-doc.vue', {
    title: 'API Reference'
});
addRoute('/api-zh', 'pages/api-doc-zh.vue', {
    title: 'API Reference (中文)'
});

// Generate routes from nav data
function walkNav(nodes) {
    nodes.forEach((node) => {
        if (node.id) {
            addRoute(`/${node.id}`, `pages/${node.id}.vue`, {
                title: node.name
            });
        }
        if (node.subs) {
            walkNav(node.subs);
        }
    });
}

walkNav(getGridRows());
