import { getExampleList } from './global.js';

export const routes = [];

const pages = import.meta.glob('./pages/*.vue');
// Documentation pages do not render a source button, so their raw SFC source is excluded.
const pageSources = import.meta.glob([
    './pages/*.vue',
    '!./pages/api-doc*.vue'
], {
    query: '?raw',
    import: 'default'
});

function addRoute(path, componentPath, meta) {
    // console.log(`Adding route: ${path} -> ${componentPath}`);
    const pagePath = `./pages/${componentPath}.vue`;
    const component = pages[pagePath];
    const sourceLoader = pageSources[pagePath];
    if (!component) {
        throw new Error(`Example page not found: ${pagePath}`);
    }
    const routeMeta = {
        ... meta
    };
    if (sourceLoader) {
        routeMeta.sourcePath = pagePath;
        routeMeta.sourceLoader = sourceLoader;
    }
    routes.push({
        path,
        meta: routeMeta,
        component
    });
}

// Home
addRoute('/', 'api-doc', {
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

walkNav(getExampleList());
