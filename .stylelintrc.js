module.exports = {
    extends: ["stylelint-config-recommended", "stylelint-config-standard"],
    overrides: [{
        customSyntax: "postcss-scss",
        files: ["**/*.scss"]
    }, {
        customSyntax: "postcss-html",
        files: ["*.html", "**/*.html"]
    }],
    rules: {
        "at-rule-no-unknown": null,
        "font-family-no-missing-generic-family-keyword": null,
        "indentation": 4
    }
};