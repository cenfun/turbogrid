
import themeOptions from '../theme/theme-options.js';

export default {

    getAllThemes: function() {
        return Object.keys(themeOptions);
    },

    getThemeOptions: function(theme) {
        return themeOptions[theme];
    }

};
