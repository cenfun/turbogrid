
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

    bindElementsResize: function(elements, callback) {
        // failed in chrome v63
        if (typeof ResizeObserver === 'undefined') {
            return;
        }
        const resizeObserver = new ResizeObserver((entries) => {
            // console.log(entries);
            callback.apply(this, entries);
        });
        elements.forEach((elem) => {
            resizeObserver.observe(elem);
        });
        return resizeObserver;
    },

    initBindContainerResize: function() {
        this.unbindContainerResize();
        if (!this.options.bindContainerResize || !this.holder) {
            return;
        }
        this.resizeObserver = this.bindElementsResize([this.holder], (entries) => {
            const isVisible = Boolean(this.holder.offsetWidth || this.holder.offsetHeight || this.holder.getClientRects().length);
            if (isVisible) {
                this.resize();
            }
        });
    },

    unbindContainerResize: function() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
    }
};
