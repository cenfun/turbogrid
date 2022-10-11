
import themeOptions from '../theme/theme-options.js';

export default {

    getAllThemes: function() {
        return Object.keys(themeOptions);
    },

    getThemeOptions: function(theme) {
        if (!theme || theme === 'default') {
            return;
        }
        return themeOptions[theme];
    }

};
