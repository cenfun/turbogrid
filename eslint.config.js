// https://eslint.org/docs/rules/

import plus from 'eslint-config-plus';
import html from 'eslint-plugin-html';
import pluginVue from 'eslint-plugin-vue';

// https://eslint.org/docs/latest/use/configure/configuration-files
export default [
    {
        ignores: [
            'dist/',
            '.temp/',
            'public/assets/*.js',
            'public/data/*.js'
        ]
    },
    {
        languageOptions: {
            globals: {
                delay: false,
                assert: false,
                page: false
            }
        }
    },
    {
        files: ['**/*.html'],
        plugins: {
            html
        }
    },
    {
        files: ['examples/**/*.vue', 'examples/**/*.js'],

        plugins: {
            vue: pluginVue
        },
        rules: {
            'vue/multi-word-component-names': 'off',
            'no-unused-vars': ['warn', {
                argsIgnorePattern: '^_'
            }],
            'complexity': ['warn', 15],
            'max-lines-per-function': ['off'],
            'no-inline-comments': 'off'
        }
    },
    plus
];
