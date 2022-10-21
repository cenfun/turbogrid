
import Util from '../core/util.js';

export default {

    initBindWindowResize: function() {
        // require unbind first
        this.unbindWindowResize();
        if (!this.options.bindWindowResize) {
            return;
        }
        this.windowResizeEvents = {
            resize: {
                handler: (e) => {
                    this.resize();
                }
            }
            // no options for resize
        };
        Util.bindEvents(this.windowResizeEvents, window);
    },

    unbindWindowResize: function() {
        Util.unbindEvents(this.windowResizeEvents);
    },

    // =============================================================================

    initBindContainerResize: function() {
        this.unbindContainerResize();
        if (!this.options.bindContainerResize || !this.holder) {
            return;
        }
        // failed in chrome v63
        if (typeof ResizeObserver === 'undefined') {
            return;
        }
        const isVisible = function(elem) {
            return Boolean(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
        };
        this.resizeObserver = new ResizeObserver((entries) => {
            // console.log(entries);
            if (!isVisible(this.holder)) {
                return;
            }

            this.resize();
        });
        this.resizeObserver.observe(this.holder);
    },

    unbindContainerResize: function() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
    }
};
