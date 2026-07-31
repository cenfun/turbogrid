// https://eslint.org/docs/rules/

import plus from 'eslint-config-plus';
import vue from 'eslint-plugin-vue';

// https://eslint.org/docs/latest/use/configure/configuration-files
export default [
    {
        ignores: [
            'dist',
            'node_modules',
            '.temp'
        ],
        languageOptions: {
            globals: {
                delay: 'readonly',
                assert: 'readonly',
                page: 'readonly'
            }
        }
    },
    plus,
    ... vue.configs['flat/recommended'],
    {
        rules: {
            'max-len': 'off',
            'vue/no-v-html': 'off',
            'vue/multi-word-component-names': 'off',
            'vue/require-explicit-emits': 'error'
        }
    }
];
