import E from '../core/event-types.js';
import Util from '../core/util.js';

export default {

    resize: function() {
        // starts with "async" for cancel all together
        if (!this.asyncResize) {
            this.asyncResize = Util.throttle(this.resizeSync, 100);
        }
        this.asyncResize.apply(this, arguments);
        return this;
    },

    // holder
    // container
    // header/body
    // pane
    // scrollPane
    // css rules
    resizeSync: function() {

        if (!this.headerCreated) {
            return this;
        }

        // console.log('resize');

        this.resizeHolderHandler.apply(this, arguments);

        // do not check if render not complete,
        if (this.firstUpdated && this.isHolderInvisible()) {
            // console.log('holder size 0, ignore resize');
            return this;
        }

        this.render('resize');

        return this;
    },

    resizeHolderHandler(w, h) {
        if (arguments.length === 0) {
            return;
        }
        if (arguments.length === 1) {
            if (w && typeof w === 'object') {
                this.$holder.css(w);
                return;
            }
            this.$holder.css({
                width: w
            });
            return;
        }
        this.$holder.css({
            width: w,
            height: h
        });
    },

    isHolderInvisible() {
        const hw = this.$holder.width();
        const hh = this.$holder.height();
        if (hw && hh) {
            return false;
        }
        return true;
    },


    // ===================================================================================

    resizeHandler: function() {
        // update global container size
        this.containerWidth = this.$container.width();
        this.containerHeight = this.$container.height();
        // same width
        this.headerWidth = this.containerWidth;
        this.bodyWidth = this.containerWidth;

        // reset column width and update width for both header and body size
        this.updateTotalColumnsWidth();

        // then update DOM size
        this.resizeHeaderHandler();
        this.resizeBodyHandler();

    },

    // ===================================================================================

    layoutEventHandler: function() {
        const previousLayout = this.previousLayout || {};
        const layout = {
            headerWidth: this.headerWidth,
            headerHeight: this.headerHeight,
            bodyWidth: this.bodyWidth,
            bodyHeight: this.bodyHeight,
            scrollbarWidth: this.getScrollbarWidth(),
            scrollbarHeight: this.getScrollbarHeight()
        };

        if (Object.values(layout).join('') === Object.values(previousLayout).join('')) {
            return;
        }

        this.previousLayout = layout;
        this.trigger(E.onLayout, Util.merge({
            previous: previousLayout
        }, layout));

    },

    resizeEventHandler: function() {
        const previousSize = this.previousSize || {};
        const size = {
            width: this.containerWidth,
            height: this.containerHeight
        };

        if (Object.values(size).join('') === Object.values(previousSize).join('')) {
            return;
        }

        this.previousSize = size;
        this.trigger(E.onResize, Util.merge({
            previous: previousSize
        }, size));

    },

    // ==========================================================================================
    // only height need update, width is same as container always
    resizeHeaderHandler: function() {

        this.initHeaderLayerHeight();

        // fix auto height before first using
        const o = this.options;
        // auto close autoHeight when rows length > 5000
        if (o.autoHeight && this.viewRows.length > 5000) {
            o.autoHeight = false;
        }

        // update height
        this.headerHeight = 0;
        // require a valid container height
        if (o.headerVisible && (this.containerHeight > 0 || o.autoHeight)) {
            this.updateHeaderTableHeight();
        }

        // update width/height
        this.$headerFrame.css({
            width: this.headerWidth,
            height: this.headerHeight
        });

    },

    updateHeaderTableHeight: function() {

        let totalLayerHeight = 0;
        Object.keys(this.headerLayerHeight).forEach((k) => {
            totalLayerHeight += this.headerLayerHeight[k];
        });

        const TL = this.$headerL.find('.tg-header-table');
        const TR = this.$headerR.find('.tg-header-table');

        TL.css({
            height: totalLayerHeight
        });
        TR.css({
            height: totalLayerHeight
        });

        this.headerHeight = totalLayerHeight;
    },

    // =======================================================================================

    // update pane height for all rows
    // for collapse and expand too
    resizeBodyHandler: function() {

        // update 3 state: h/v scrollbar and hide scrollPane
        this.updateScrollState();

        // update body size
        // body height depends on header height and auto height
        this.bodyHeight = this.containerHeight - this.headerHeight;
        this.$bodyFrame.css({
            width: this.bodyWidth,
            height: this.bodyHeight
        });

        // update pane size
        this.updatePaneWidth();
        this.updatePaneHeight();

        // update width first
        this.updateCanvasWidth();
        // then update height
        this.updateCanvasHeight();

        // update scrollPane
        this.updateScrollPane();

        this.updateCssRules();

    },

    // =======================================================================================

    updatePaneWidth: function() {

        // no frozen pane
        let paneWidthL = this.bodyWidth;
        let paneWidthR = 0;

        // has frozen pane
        if (this.frozenInfo.columns) {

            const scrollbarW = this.getScrollbarWidth();
            if (this.frozenInfo.right) {
                paneWidthR = this.columnsWidthR + scrollbarW;
                paneWidthL = this.bodyWidth - paneWidthR;
            } else {
                paneWidthL = this.columnsWidthL;
                paneWidthR = this.bodyWidth - paneWidthL;
            }

            if (this.scrollPaneHidden) {
                if (this.frozenInfo.right) {
                    if (paneWidthL <= 0) {
                        paneWidthL = 0;
                    }
                    paneWidthR = Math.max(0, this.bodyWidth - paneWidthL);
                } else {
                    if (paneWidthR < scrollbarW) {
                        paneWidthR = scrollbarW;
                    }
                    paneWidthL = Math.max(0, this.bodyWidth - paneWidthR);
                }
            }
        }

        this.paneWidthL = paneWidthL;
        this.paneWidthR = paneWidthR;

        // console.log("paneWidthL: " + paneWidthL, "paneWidthR: " + paneWidthR);

        this.$paneHL.css({
            left: 0,
            width: this.paneWidthL
        });
        this.$paneHR.css({
            left: this.paneWidthL,
            width: this.paneWidthR
        });

        this.$paneTL.css({
            left: 0,
            width: this.paneWidthL
        });
        this.$paneTR.css({
            left: this.paneWidthL,
            width: this.paneWidthR
        });

        this.$paneBL.css({
            left: 0,
            width: this.paneWidthL
        });
        this.$paneBR.css({
            left: this.paneWidthL,
            width: this.paneWidthR
        });

    },

    // =======================================================================================

    updatePaneHeight: function() {

        let paneHeightT = this.bodyHeight;
        let paneHeightB = 0;

        if (this.frozenInfo.rows) {
            if (this.frozenInfo.bottom) {
                const scrollbarH = this.getScrollbarHeight();
                paneHeightT = this.bodyHeight - this.frozenRowsHeight - scrollbarH;
                paneHeightB = this.frozenRowsHeight + scrollbarH;
            } else {
                paneHeightT = this.frozenRowsHeight;
                paneHeightB = this.bodyHeight - this.frozenRowsHeight;
            }
        }

        this.paneHeightT = paneHeightT;
        this.paneHeightB = paneHeightB;

        // resize pane
        this.$paneTL.css({
            top: 0,
            height: this.paneHeightT
        });
        this.$paneTR.css({
            top: 0,
            height: this.paneHeightT
        });
        this.$paneBL.css({
            top: this.paneHeightT,
            height: this.paneHeightB
        });
        this.$paneBR.css({
            top: this.paneHeightT,
            height: this.paneHeightB
        });

    },

    // =======================================================================================

    updateCanvasWidth: function() {

        // new width
        const bodyWidthL = this.columnsWidthL;
        const bodyWidthR = this.columnsWidthR;

        this.bodyWidthChanged = false;
        if (bodyWidthL !== this.bodyWidthL || bodyWidthR !== this.bodyWidthR) {
            this.bodyWidthL = bodyWidthL;
            this.bodyWidthR = bodyWidthR;
            this.bodyWidthChanged = true;
            this.cssRulesInvalid = true;
        }

        // console.log("bodyWidthL: " + this.bodyWidthL, "bodyWidthR: " + this.bodyWidthR);

        // scrollStateChanged to fix frozen row right blank
        if (this.bodyWidthChanged || this.scrollStateChanged) {
            this.updateHeaderCanvasWidth();
            this.updateBodyCanvasWidth();
        }

    },

    updateCanvasHeight: function() {

        // new height
        let bodyHeightT;
        let bodyHeightB;

        if (this.frozenInfo.rows) {
            if (this.frozenInfo.bottom) {
                bodyHeightT = this.scrollRowsHeight;
                bodyHeightB = this.frozenRowsHeight;
            } else {
                bodyHeightT = this.frozenRowsHeight;
                bodyHeightB = this.scrollRowsHeight;
            }
        } else {
            bodyHeightT = this.totalRowsHeight;
            bodyHeightB = 0;
        }

        this.bodyHeightT = bodyHeightT;
        this.bodyHeightB = bodyHeightB;

        this.updateBodyCanvasHeight();

    },

    // =======================================================================================

    updateHeaderCanvasWidth: function() {
        const l = this.maxLimitSize(this.bodyWidthL);
        const r = this.maxLimitSize(this.bodyWidthR);
        // always add scroll bar width
        this.$headerL.width(l);
        this.$headerR.width(r);
    },

    updateBodyCanvasWidth: function() {
        const l = this.maxLimitSize(this.bodyWidthL);
        const r = this.maxLimitSize(this.bodyWidthR);
        this.$bodyTL.width(l);
        this.$bodyBL.width(l);
        this.$bodyTR.width(r);
        this.$bodyBR.width(r);
    },

    updateBodyCanvasHeight: function() {
        const t = this.maxLimitSize(this.bodyHeightT);
        const b = this.maxLimitSize(this.bodyHeightB);
        this.$bodyTL.height(t);
        this.$bodyTR.height(t);
        this.$bodyBL.height(b);
        this.$bodyBR.height(b);
    },

    maxLimitSize: function(size) {
        // Browser Max size limitation
        // IE 1,533,917px
        // Chrome 33,554,428px
        // Firefox 17,895,000px
        const maxSize = 1533000;
        // max height fixing, IE will be blank if height is great than max size
        size = Math.min(size, maxSize);
        return size;
    }

};

