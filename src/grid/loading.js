import Util from '../core/util.js';
import $ from '../core/query.js';

export default {

    setDefaultLoading: function($defaultLoading, options = {}) {
        if (!$defaultLoading) {
            return;
        }

        const loadingStyle = $defaultLoading.style;

        if (options.size) {
            loadingStyle.width = options.size;
            loadingStyle.height = options.size;
        }
        if (options.color) {
            loadingStyle.color = options.color;
        }

        if (!options.size && !options.color) {
            $defaultLoading.removeAttribute('style');
        }

        if (options.fast) {
            $defaultLoading.classList.add('tg-loading-fast');
        } else {
            $defaultLoading.classList.remove('tg-loading-fast');
        }

    },

    getDefaultLoading: function(options) {
        this.setDefaultLoading(this.$defaultLoading, options);
        return this.$defaultLoading;
    },

    getLoadingHolder: function() {
        if (this.$container) {
            return this.$container.find('.tg-loading');
        }
        return $();
    },

    setLoading: function($elem) {
        if (!this.$container) {
            return this;
        }

        // keep default loading
        if (!this.$defaultLoading) {
            this.$defaultLoading = this.$container.find('.tg-loading-default').get(0);
        }

        const holder = this.getLoadingHolder().get(0);

        if (typeof $elem === 'function') {
            $elem = $elem.call(this, holder);
        }

        if (Util.isObject($elem)) {
            $elem = this.getDefaultLoading($elem);
        }

        if (!$elem) {
            $elem = this.getDefaultLoading();
        }

        this.renderNodeContent(holder, $elem);

        return this;
    },

    showLoading: function() {
        this.getLoadingHolder().show();
        return this;
    },

    hideLoading: function() {
        this.getLoadingHolder().hide();
        return this;
    }
};
