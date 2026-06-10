import { getGridRows } from './utils/nav-data.js';

export const routes = [];

function addRoute(path, componentPath, meta) {
    // console.log(`Adding route: ${path} -> ${componentPath}`);
    routes.push({
        path,
        meta: meta || {},
        // @vite-ignore
        component: () => import(`./pages/${componentPath}.vue`)
    });
}

// Home
addRoute('/', 'getting-started', {
    title: 'Getting Started'
});

// API docs
addRoute('/api-doc', 'api-doc', {
    title: 'API Reference'
});
addRoute('/api-doc-zh', 'api-doc-zh', {
    title: 'API Reference (中文)'
});

// Generate routes from nav data
function walkNav(nodes) {
    nodes.forEach((node) => {
        if (node.id) {
            addRoute(`/${node.id}`, `${node.id}`, {
                title: node.name
            });
        }
        if (node.subs) {
            walkNav(node.subs);
        }
    });
}

walkNav(getGridRows());
