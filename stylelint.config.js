module.exports = {
    extends: ['stylelint-config-plus'],
    rules: {
        'at-rule-no-unknown': [true, {
            ignoreAtRules: [
                'use',
                'extend'
            ]
        }]
    }
};
