// https://eslint.org/docs/rules/

import plus from 'eslint-config-plus';
import html from 'eslint-plugin-html';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';

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
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module'
            },
            globals: {
                window: false,
                document: false,
                setTimeout: false,
                clearTimeout: false,
                localStorage: false,
                URLSearchParams: false,
                console: false,
                Prism: false,
                Event: false,
                HTMLElement: false,
                customElements: false,
                KeyboardEvent: false,
                MouseEvent: false,
                TouchEvent: false,
                WheelEvent: false,
                requestAnimationFrame: false,
                cancelAnimationFrame: false,
                fetch: false,
                IntersectionObserver: false,
                ResizeObserver: false,
                CustomEvent: false
            }
        },
        plugins: {
            vue: pluginVue
        },
        rules: {
            'vue/multi-word-component-names': 'off',
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'complexity': ['warn', 15],
            'max-lines-per-function': ['off'],
            'no-inline-comments': 'off'
        }
    },
    plus
];
