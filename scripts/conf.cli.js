// starfall-cli config
// https://github.com/cenfun/starfall-cli

const fs = require('fs');
const path = require('path');

module.exports = {

    build: {
        cssExtract: 'string',
        before: (item) => {

            if (item.production) {
                item.devtool = false;
            }

            // copy vine-ui, vue
            const list = [
                'node_modules/vine-ui/dist/vine-ui.js',
                'node_modules/vue/dist/vue.global.prod.js'
            ];

            const toDir = path.resolve('public/assets');

            list.forEach((file) => {
                const content = fs.readFileSync(path.resolve(file));
                fs.writeFileSync(path.resolve(toDir, path.basename(file)), content);
            });

            return 0;
        },
        after: () => {
            console.log('copy types ...');
            const src = path.resolve('src/turbogrid.d.ts');
            const dest = path.resolve('dist/turbogrid.d.ts');
            fs.copyFileSync(src, dest);
            console.log('copied to dist/turbogrid.d.ts');
            return 0;
        }
    },

    test: {
        coverageProvider: 'v8',
        coverageOptions: {
            // logging: 'debug'
            // reports: ['v8', ['html', {
            //     subdir: 'html'
            // }]]
        }
    }

};
