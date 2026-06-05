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

const tag = {
    timestamp: timestamp(),
    commit: getCommit()
};

/**
 * Post-build hook: copy .d.ts and remove standalone CSS file.
 * CSS is inlined via `import ... from '...scss?inline'` in src/grid/create.js.
 */
function buildEndPlugin() {
    return {
        name: 'build-end',
        closeBundle() {
            fs.copyFileSync(
                path.resolve(__dirname, 'src/turbogrid.d.ts'),
                path.resolve(__dirname, 'dist/turbogrid.d.ts')
            );
            console.log('copied types to dist/turbogrid.d.ts');

            const cssFile = path.resolve(__dirname, 'dist/turbogrid.css');
            if (fs.existsSync(cssFile)) {
                fs.unlinkSync(cssFile);
                console.log('removed dist/turbogrid.css');
            }
        }
    };
}

export default defineConfig(({ command }) => {

    const plugins = [buildEndPlugin()];

    // Dev server
    if (command === 'serve') {
        return {
            root: 'public',
            plugins,
            server: {
                open: '/index.html',
                fs: {
                    allow: ['..']
                }
            }
        };
    }

    // Production build
    return {
        plugins,
        define: {
            'window.TAG': JSON.stringify(Object.values(tag).join('-'))
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
            sourcemap: true,
            minify: 'esbuild',
            cssCodeSplit: false
        }
    };
});
