// https://eslint.org/docs/rules/
module.exports = {
    'root': true,
    // system globals
    'env': {
        'node': true,
        'browser': true,
        'amd': true,
        'commonjs': true,
        'es6': true,
        'mocha': true
    },
    // other globals
    'globals': {
        'assert': true,
        'delay': true,
        'page': true
    },

    'plugins': [
        'sonarjs',
        'html'
    ],

    'extends': [
        'plus',
        'plugin:sonarjs/recommended'
    ],

    'parserOptions': {
        'ecmaVersion': 'latest',
        'sourceType': 'module'
    },

    'rules': {
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
        'no-prototype-builtins': 'warn',
        'sonarjs/cognitive-complexity': 'off',
        'sonarjs/no-collapsible-if': 'off',
        'sonarjs/no-duplicate-string': 'off',
        'sonarjs/no-identical-functions': 'off',
        'sonarjs/no-nested-template-literals': 'warn',
        'sonarjs/prefer-single-boolean-return': 'off'
    }
};
