import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const testRoot = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testRoot, '..');

export default defineConfig({
    root: testRoot,
    base: './',
    publicDir: false,
    define: {
        'window.TAG': JSON.stringify('test'),
        'window.VERSION': JSON.stringify('test')
    },
    build: {
        outDir: path.resolve(projectRoot, '.temp/test'),
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
});
