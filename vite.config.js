import fs from 'fs';
import path from 'path';
import vue from '@vitejs/plugin-vue';
import EC from 'eight-colors';

import cssInjectedByJs from 'vite-plugin-css-injected-by-js';
import { visualizer } from 'rollup-plugin-visualizer';

import { defineConfig } from 'vite';

// Replace with your library id
const ID = 'turbogrid';

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


function testSpecsPlugin() {
    const virtualModuleId = 'virtual:test-specs';
    const resolvedVirtualModuleId = `\0${virtualModuleId}`;
    const virtualSpecPrefix = 'virtual:test-spec-file:';
    const specsPath = path.resolve(import.meta.dirname, 'test/specs');
    return {
        name: 'test-specs',
        resolveId(id) {
            if (id === virtualModuleId) {
                return resolvedVirtualModuleId;
            }
            if (id.startsWith(virtualSpecPrefix)) {
                return path.resolve(specsPath, id.slice(virtualSpecPrefix.length));
            }
        },
        load(id) {
            if (id !== resolvedVirtualModuleId) {
                return;
            }
            const files = fs.readdirSync(specsPath).filter((file) => file.endsWith('.js')).sort();
            const filters = (process.env.TEST_SPEC_FILTER || '').split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
            const selectedFiles = filters.length ? files.filter((file) => filters.some((keyword) => file.toLowerCase().includes(keyword))) : files;
            if (!selectedFiles.length) {
                this.error(`No test spec files matched: ${filters.join(',')}`);
            }
            console.log(EC.magenta(`Test specs: ${selectedFiles.length}/${files.length}`));
            if (filters.length) {
                console.log(EC.magenta(`Matched spec files (${filters.join(', ')}):`));
                selectedFiles.forEach((file) => {
                    console.log(EC.cyan(`  test/specs/${file}`));
                });
            }
            const entries = selectedFiles.map((file) => {
                return `${JSON.stringify(`test/specs/${file}`)}: () => import(${JSON.stringify(`${virtualSpecPrefix}${file}`)})`;
            });
            return `export default {${entries.join(',')}};`;
        }
    };
}


function buildEndPlugin() {
    return {
        name: 'build-end',
        closeBundle() {
            fs.copyFileSync(
                path.resolve(import.meta.dirname, `src/${ID}.d.ts`),
                path.resolve(import.meta.dirname, `dist/${ID}.d.ts`)
            );
            console.log(`copied types to dist/${ID}.d.ts`);
        }
    };
}

export default defineConfig(({ command, mode }) => {

    const define = {
        'window.TAG': JSON.stringify(Object.values(tag).join('-')),
        'window.VERSION': JSON.stringify(pkg.version)
    };

    if (mode === 'test') {
        return {
            root: path.resolve(import.meta.dirname, 'test'),
            base: './',
            publicDir: false,
            define,
            plugins: [testSpecsPlugin()],
            optimizeDeps: {
                // This is a Vite virtual module, not an npm dependency.
                exclude: ['virtual:test-specs']
            },
            build: {
                outDir: path.resolve(import.meta.dirname, '.temp/test'),
                emptyOutDir: true,
                sourcemap: true,
                minify: false,
                cssMinify: false,
                rolldownOptions: {
                    treeshake: false
                }
            },
            preview: {
                host: '127.0.0.1',
                port: 4173,
                strictPort: false,
                open: false
            }
        };
    }

    if (mode === 'docs') {
        return {
            root: '.',
            base: './',
            publicDir: false,
            define,
            plugins: [vue(), visualizer({
                filename: '.temp/build-stats.html'
            })],
            build: {
                outDir: 'docs',
                emptyOutDir: true,
                sourcemap: false,
                rolldownOptions: {
                    output: {
                        manualChunks(id) {
                            if (id.includes('/examples/pages/')) {
                                return;
                            }
                            const chunks = {
                                'src': ID,
                                'vue': 'vue',
                                'node_modules': 'vendor'
                            };
                            for (const key in chunks) {
                                if (id.includes(key)) {
                                    return chunks[key];
                                }
                            }
                        }
                    }
                }
            },
            preview: {
                host: '127.0.0.1',
                port: 4173,
                strictPort: false,
                open: true
            }
        };
    }

    if (command === 'serve') {
        return {
            root: '.',
            publicDir: 'public',
            define,
            plugins: [vue()],
            optimizeDeps: {
                // virtual:test-specs is only resolved by the test-specs plugin in test mode,
                // but the dev server dependency scanner also crawls test/index.html.
                exclude: ['virtual:test-specs']
            },
            server: {
                open: '/'
            }
        };
    }

    // Production build (library)
    return {
        root: '.',
        plugins: [
            // vue(),
            cssInjectedByJs(),
            buildEndPlugin()
        ],
        publicDir: false,
        define,
        build: {
            outDir: 'dist',
            lib: {
                entry: path.resolve(import.meta.dirname, 'src/index.js'),
                name: ID,
                formats: ['umd', 'es'],
                fileName: (format) => (format === 'umd' ? `${ID}.js` : `${ID}.esm.js`)
            },
            rolldownOptions: {
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
