import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';


const timestamp = (postfix) => {
    let ts = new Date(Date.now() - new Date().getTimezoneOffset() * 60 * 1000).toISOString().slice(2, 19);
    ts = ts.replace(/[-:]/g, '');
    ts = ts.replace('T', '-');
    if (postfix) {
        ts = `${ts}-${postfix}`;
    }
    return ts;
};

const getCommit = () => {
    const headPath = path.resolve('.git/HEAD');
    if (fs.existsSync(headPath)) {
        const rev = fs.readFileSync(headPath).toString().trim();
        if (rev.indexOf(':') === -1) {
            return rev.slice(0, 8);
        }
        const refPath = rev.split(':').pop().trim();
        return fs.readFileSync(`.git/${refPath}`).toString().trim().slice(0, 8);
    }
    return '';
};

const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf-8'));

const tag = {
    timestamp: timestamp(),
    commit: getCommit()
};


function buildEndPlugin() {
    return {
        name: 'build-end',
        closeBundle() {
            fs.copyFileSync(
                path.resolve(__dirname, 'src/turbogrid.d.ts'),
                path.resolve(__dirname, 'dist/turbogrid.d.ts')
            );
            console.log('copied types to dist/turbogrid.d.ts');
        }
    };
}


function devHtmlPlugin() {
    return {
        name: 'dev-html',
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                const url = req.url;
                if (!url.endsWith('.html') && url !== '/') {
                    return next();
                }

                const filename = url === '/' ? 'index.html' : url.slice(1);
                const filePath = path.resolve(__dirname, 'public', filename);

                if (!fs.existsSync(filePath)) {
                    return next();
                }

                let html = fs.readFileSync(filePath, 'utf-8');

                // Replace the production script with a dev module import
                // so Vite watches src/ and triggers HMR on file changes
                html = html.replace(
                    /<!--inject:start-->[\s\S]*?<!--inject:end-->/,
                    '<script type="module" src="/src/demo.js"></script>'
                );

                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.end(html);
            });
        }
    };
}


export default defineConfig(({ command }) => {

    if (command === 'serve') {
        return {
            root: '.',
            plugins: [devHtmlPlugin()],
            server: {
                open: '/index.html'
            }
        };
    }

    // Production build
    return {
        root: '.',
        plugins: [buildEndPlugin()],
        publicDir: false,
        define: {
            'window.TAG': JSON.stringify(Object.values(tag).join('-')),
            'window.VERSION': JSON.stringify(pkg.version)
        },
        build: {
            outDir: 'dist',
            lib: {
                entry: path.resolve(__dirname, 'src/index.js'),
                name: 'turbogrid',
                formats: ['umd', 'es'],
                fileName: (format) => (format === 'umd' ? 'turbogrid.js' : 'turbogrid.esm.js')
            },
            rollupOptions: {
                external: [],
                output: {
                    exports: 'named'
                }
            },
            sourcemap: false,
            cssCodeSplit: false,
            emptyOutDir: true
        }
    };
});
