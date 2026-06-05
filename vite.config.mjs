import { defineConfig } from 'vite';
import { resolve } from 'path';
import {
    copyFileSync, unlinkSync, existsSync
} from 'fs';

/**
 * Post-build hook: copy .d.ts and remove standalone CSS file.
 * CSS is inlined via `import ... from '...scss?inline'` in src/grid/create.js.
 */
function buildEndPlugin() {
    return {
        name: 'build-end',
        closeBundle() {
            copyFileSync(
                resolve(__dirname, 'src/turbogrid.d.ts'),
                resolve(__dirname, 'dist/turbogrid.d.ts')
            );
            console.log('copied types to dist/turbogrid.d.ts');

            const cssFile = resolve(__dirname, 'dist/turbogrid.css');
            if (existsSync(cssFile)) {
                unlinkSync(cssFile);
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
        build: {
            outDir: 'dist',
            lib: {
                entry: resolve(__dirname, 'src/index.js'),
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
