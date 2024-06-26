import Util from '../core/util.js';

export default {

    showMask: function(styleMap) {
        if (!this.hasMask || styleMap) {
            const $mask = this.$container.find('.tg-mask');
            const node = $mask.get(0);
            if (styleMap && node) {
                const cssText = Util.styleMap(styleMap);
                if (cssText) {
                    node.style.cssText = cssText;
                }
            }

            $mask.show();
            this.hasMask = true;
        }
        return this;
    },

    hideMask: function() {
        if (this.hasMask) {
            this.$container.find('.tg-mask').hide();
            this.hasMask = false;
        }
        return this;
    }
};
