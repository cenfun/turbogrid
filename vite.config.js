import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
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


function inlineAssetsPlugin() {
    return {
        name: 'inline-assets',
        enforce: 'pre',
        load(id) {
            if (id.endsWith('.html?raw') || id.endsWith('.svg?raw')) {
                const filePath = id.replace('?raw', '');
                const content = fs.readFileSync(filePath, 'utf-8');
                return `export default ${JSON.stringify(content.replace(/\r?\n/g, ''))}`;
            }
        }
    };
}


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


function docsAssetsPlugin() {
    const sourceEntry = path.resolve(__dirname, 'src/index.js');
    const sourceFile = path.resolve(__dirname, 'dist/turbogrid.esm.js');
    const targetFile = path.resolve(__dirname, 'docs/assets/turbogrid.esm.js');
    return {
        name: 'docs-assets',
        enforce: 'pre',
        buildStart() {
            if (!fs.existsSync(sourceFile)) {
                this.error('dist/turbogrid.esm.js not found. Run "npm run build" before "npm run docs".');
            }
        },
        resolveId(source, importer) {
            if (!importer) {
                return;
            }
            const importerPath = importer.split('?')[0];
            const resolved = path.resolve(path.dirname(importerPath), source);
            if (resolved === sourceEntry) {
                return {
                    id: './turbogrid.esm.js',
                    external: true
                };
            }
        },
        closeBundle() {
            fs.copyFileSync(sourceFile, targetFile);
            console.log('copied dist/turbogrid.esm.js to docs/assets/turbogrid.esm.js');
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
            root: path.resolve(__dirname, 'scripts/test'),
            base: './',
            publicDir: false,
            define: {
                'window.TAG': JSON.stringify('test'),
                'window.VERSION': JSON.stringify('test')
            },
            build: {
                outDir: path.resolve(__dirname, '.temp/test'),
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
            plugins: [docsAssetsPlugin(), vue(), inlineAssetsPlugin()],
            build: {
                outDir: 'docs',
                emptyOutDir: true,
                sourcemap: false
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
            plugins: [vue(), inlineAssetsPlugin()],
            server: {
                open: '/'
            }
        };
    }

    // Production build (library)
    return {
        root: '.',
        plugins: [inlineAssetsPlugin(), buildEndPlugin()],
        publicDir: false,
        define,
        build: {
            outDir: 'dist',
            lib: {
                entry: path.resolve(__dirname, 'src/index.js'),
                name: 'turbogrid',
                formats: ['umd', 'es'],
                fileName: (format) => (format === 'umd' ? 'turbogrid.js' : 'turbogrid.esm.js')
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
