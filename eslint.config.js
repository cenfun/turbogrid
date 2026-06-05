// https://eslint.org/docs/rules/

import plus from 'eslint-config-plus';
import html from 'eslint-plugin-html';

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
    plus
];
