
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

    createResizeObserver: function(callback) {
        // failed in chrome v63
        /* v8 ignore start */
        if (typeof ResizeObserver === 'undefined') {
            console.error('ERROR: This browser does not support ResizeObserver');
            return {
                observe: () => {},
                unobserve: () => {},
                disconnect: () => {}
            };
        }

        /* v8 ignore stop */

        const resizeObserver = new ResizeObserver((entries) => {
            callback.call(this, entries);
        });
        return resizeObserver;
    },

    initBindContainerResize: function() {
        this.unbindContainerResize();
        if (!this.options.bindContainerResize || !this.holder) {
            return;
        }
        this.resizeObserver = this.createResizeObserver((entries) => {
            const isVisible = Boolean(this.holder.offsetWidth || this.holder.offsetHeight || this.holder.getClientRects().length);
            if (isVisible) {
                this.resize();
            }
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
