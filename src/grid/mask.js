import Util from '../core/util.js';

export default {

    showMask: function(styleMap) {

        const $mask = this.$container.find('.tg-mask');
        const node = $mask.get(0);
        if (styleMap && node) {
            const cssText = Util.styleMap(styleMap);
            if (cssText) {
                node.style.cssText = cssText;
            }
        }

        $mask.show();

        return this;
    },

    hideMask: function() {
        this.$container.find('.tg-mask').hide();
        return this;
    }
};
