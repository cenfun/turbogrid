import Util from '../core/util.js';
import $ from '../core/query.js';

export default {

    setDefaultLoading: function(defaultLoading, option = {}) {
        if (!defaultLoading) {
            return;
        }

        const loadingStyle = defaultLoading.style;

        if (option.size) {
            loadingStyle.width = option.size;
            loadingStyle.height = option.size;
        }
        if (option.color) {
            loadingStyle.color = option.color;
        }

        if (!option.size && !option.color) {
            defaultLoading.removeAttribute('style');
        }

        if (option.fast) {
            defaultLoading.classList.add('tg-loading-fast');
        } else {
            defaultLoading.classList.remove('tg-loading-fast');
        }

    },

    getDefaultLoading: function(option) {
        if (!this.defaultLoading) {
            this.defaultLoading = this.$container.find('.tg-loading-default').get(0);
        }
        this.setDefaultLoading(this.defaultLoading, option);
        return this.defaultLoading;
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
