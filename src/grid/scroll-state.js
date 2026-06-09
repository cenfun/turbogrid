import E from '../core/event-types.js';
import Util from '../core/util.js';

export default {

    // update all scroll bar state first
    // h scroll depends on blank column
    // v scroll depends on rows num
    updateScrollState: function() {

        // global info, reset blank column
        this.updateGlobalScrollInfo();

        // update scroll state
        this.updateHScrollState();
        this.updateVScrollState();

        // h scroll fix again if has v scroll
        this.updateBlankColumnWidth();

        this.scrollStateChanged = false;

        if (this.previousHasHScroll !== this.hasHScroll || this.previousHasVScroll !== this.hasVScroll) {
            this.scrollStateChanged = true;

            this.previousHasHScroll = this.hasHScroll;
            this.previousHasVScroll = this.hasVScroll;

            this.trigger(E.onScrollStateChanged, {
                hasHScroll: this.hasHScroll,
                hasVScroll: this.hasVScroll
            });

        }

        // console.log("scrollStateChanged", this.scrollStateChanged);

        // all for update those 3 state
        // console.log("hasHScroll: " + this.hasHScroll, "hasVScroll: " + this.hasVScroll, "scrollPaneHidden: " + this.scrollPaneHidden);

    },

    // =======================================================================================

    updateGlobalScrollInfo: function() {

        // all rows height
        this.totalRowsLength = this.getRowsLength();
        this.totalRowsHeight = this.getRowsHeight();
        this.frozenRowsHeight = this.getFrozenRowsHeight();

        // scroll rows height, require frozenRowsHeight on init pane
        this.scrollRowsHeight = this.totalRowsHeight - this.frozenRowsHeight;

        // zero height fixing
        this.totalRowsHeight = Math.max(this.totalRowsHeight, 1);
        this.scrollRowsHeight = Math.max(this.scrollRowsHeight, 1);

        // clean if outside of the data
        this.flushRowFrom(this.totalRowsLength);

    },

    // =======================================================================================

    updateHScrollState: function() {
        // h scroll state (include left frozen scroll)
        this.hasHScroll = true;

        this.updateScrollPaneHiddenState();
        this.updateHScrollByScrollPaneHidden();

        if (this.scrollPaneHidden) {
            return;
        }

        // console.log("containerWidth: " + this.containerWidth, "columnsWidth: " + this.columnsWidth);

        const blankColumnWidth = this.containerWidth - this.columnsWidth;

        // console.log("blankColumnWidth: " + blankColumnWidth, "blankColumn.tg_width: " + this.blankColumn.tg_width);

        if (blankColumnWidth >= 0) {
            this.hasHScroll = false;
        }

    },

    getScrollPaneCurrentWidth: function() {
        if (this.frozenInfo.right) {
            return this.bodyWidth - this.columnsWidthR;
        }
        return this.bodyWidth - this.columnsWidthL;
    },

    updateHScrollByScrollPaneHidden: function() {
        if (this.scrollPaneHidden) {
            this.hasHScroll = false;
            const scrollPaneWidth = this.getScrollPaneCurrentWidth();
            const scrollbarW = this.getScrollbarWidth();
            if (scrollPaneWidth < scrollbarW) {
                // has left h scroll
                this.hasHScroll = true;
            }
        }
    },

    updateScrollPaneHiddenState: function() {

        this.scrollPaneHidden = false;

        if (this.frozenInfo.columns) {
            // has frozen pane
            const scrollPaneWidth = this.getScrollPaneCurrentWidth();
            const scrollPaneMinWidth = this.getScrollPaneMinWidth();
            // console.log("scrollPaneWidth:" + scrollPaneWidth, "scrollPaneMinWidth: " + scrollPaneMinWidth);
            if (scrollPaneWidth < scrollPaneMinWidth) {
                // hide right scrollPane
                this.scrollPaneHidden = true;
            }
        }

        // update header columns visibility
        this.updateScrollHeaderVisibility();

    },

    updateScrollHeaderVisibility: function() {
        if (this.previousHasScrollHeader === this.scrollPaneHidden) {
            return;
        }
        this.previousHasScrollHeader = this.scrollPaneHidden;

        // update visibility for right header pane
        let headerScrollPane = this.$headerR.get(0);
        if (this.frozenInfo.right) {
            headerScrollPane = this.$headerL.get(0);
        }
        if (this.scrollPaneHidden) {
            headerScrollPane.style.visibility = 'hidden';
        } else {
            headerScrollPane.style.visibility = '';
        }

        // update hidden columns
        this.updateScrollPaneColumnsHidden(this.scrollPaneHidden);

        // always changed if hide/show scroll header
        this.cssRulesInvalid = true;

    },

    // update for setting display to none in css rule
    updateScrollPaneColumnsHidden: function(hidden) {
        const fcs = this.frozenInfo.columns;
        // use all columns for group columns too
        const columns = this.viewAllColumns;
        for (let i = fcs, l = columns.length - 1; i < l; i++) {
            const column = columns[i];
            column.tg_filtered = hidden;
        }
    },

    getScrollPaneMinWidth: function() {
        let scrollPaneMinWidth = this.options.scrollPaneMinWidth;
        if (!Util.isNum(scrollPaneMinWidth) || scrollPaneMinWidth < 0) {
            scrollPaneMinWidth = this.scrollbarSizeV;
        }
        return scrollPaneMinWidth;
    },

    // =======================================================================================

    updateAutoHeight: function() {
        if (!this.options.autoHeight) {
            return;
        }

        // console.log('updateAutoHeight', this.bodyMessageHeight);

        const scrollbarH = this.getScrollbarHeight();
        this.containerHeight = this.headerHeight + this.totalRowsHeight + this.bodyMessageHeight + scrollbarH;
        this.$holder.height(this.containerHeight);

        this.updateBodySize();
    },

    updateVScrollState: function() {
        // v scroll state
        this.hasVScroll = true;


        if (this.options.autoHeight) {
            this.hasVScroll = false;

            // update container height again
            this.updateAutoHeight();

        } else {

            const scrollbarH = this.getScrollbarHeight();
            const tempBodyHeight = this.containerHeight - this.headerHeight - scrollbarH;
            if (tempBodyHeight >= this.totalRowsHeight) {
                this.hasVScroll = false;
            }

        }

    },

    // eslint-disable-next-line complexity
    updateBlankColumnWidth: function() {

        // Note: snapshot restore is done in resizeHandler() before this runs

        let blankColumnWidth = this.containerWidth - this.columnsWidth;
        // when has v scrollbar
        if (this.hasVScroll && !this.hasHScroll && !this.options.scrollbarFade) {
            blankColumnWidth -= this.scrollbarSizeV;
        }

        if (this.scrollPaneHidden) {
            blankColumnWidth = 0;
        }

        // console.log(blankColumnWidth);

        // fix h scroll state again, and fix columns width
        if (!this.hasHScroll) {

            if (blankColumnWidth >= 0) {

                // ===== autoColumnWidth: distribute remaining space to all view columns =====
                if (this.options.autoColumnWidth && blankColumnWidth > 0) {
                    this.distributeExtraColumnWidth();
                    return;
                }
                // ==========================================================================

                // no h scroll, has blank or blank = 0
                if (this.frozenInfo.columns) {

                    if (this.frozenInfo.right) {
                        this.columnsWidthL += blankColumnWidth;
                    } else {
                        this.columnsWidthR += blankColumnWidth;
                    }

                } else {
                    this.columnsWidthL += blankColumnWidth;
                }
                this.blankColumn.tg_width = blankColumnWidth;

            } else {
                // has h scroll, fix state again
                this.hasHScroll = true;
            }

        }

        // console.log("columnsWidthL: " + this.columnsWidthL, "columnsWidthR: " + this.columnsWidthR);

    },

    // =======================================================================================
    // autoColumnWidth: distribute extra space to all view columns

    distributeExtraColumnWidth: function() {

        this.autoColumnWidthDistributed = false;

        const columns = this.viewColumns;
        // blankColumn is always the last item in viewColumns
        const normalColumns = columns.slice(0, -1);

        if (!normalColumns.length) {
            return;
        }

        // Columns are already reset to base widths by resizeHandler() before this call
        // Calculate available extra space
        let extra = this.containerWidth - this.columnsWidth;
        if (this.hasVScroll && !this.hasHScroll && !this.options.scrollbarFade) {
            extra -= this.scrollbarSizeV;
        }

        // No extra space to distribute
        if (extra <= 0) {
            return;
        }

        // Gather auto-sized columns (those without explicit width)
        const autoColumns = [];
        let totalWeight = 0;
        normalColumns.forEach(function(col) {
            if (!Util.isSize(col.width)) {
                autoColumns.push(col);
                totalWeight += (col.widthWeight || 1);
            }
        });

        // No auto-sized columns: fall back to blankColumn
        if (!autoColumns.length || totalWeight <= 0) {
            this.assignExtraToBlankColumn(extra);
            this.updateAllColumnHeadersSize();
            return;
        }

        // Distribute proportionally by weight, using Math.floor
        let distributed = 0;
        const results = autoColumns.map(function(col) {
            const weight = col.widthWeight || 1;
            const e = Math.floor(extra * weight / totalWeight);
            distributed += e;
            return {
                column: col,
                extra: e
            };
        });

        // Remainder (floor rounding) goes to the last auto-sized column
        const remaining = extra - distributed;
        results[results.length - 1].extra += remaining;

        // Apply new widths with min/max clamp and track actual distributed amount
        let totalAdded = 0;
        results.forEach(function(r) {
            const base = r.column.tg_width;
            let w = base + r.extra;
            w = Util.clamp(w, r.column.minWidth, r.column.maxWidth);
            totalAdded += w - base;
            r.column.tg_width = w;
        });

        // Recalculate columnsWidthL / columnsWidthR / columnsWidth and tg_left
        this.updateTotalColumnsWidth();

        // Any space undristributed due to min/max clamping goes to the blank column
        const leftover = extra - totalAdded;
        this.assignExtraToBlankColumn(leftover);

        // Sync header sizes (resizeHeaderHandler already ran, so header cache is stale)
        this.updateAllColumnHeadersSize();
        this.updateHeaderLayerHeight();
        this.updateHeaderTableHeight();
        this.$headerFrame.css({
            width: this.headerWidth,
            height: this.headerHeight
        });

        // blankColumn.tg_width stays 0 (already done by updateTotalColumnsWidth)

        this.autoColumnWidthDistributed = true;

    },

    // Assign remaining space to the blank column (fallback when no auto-sized columns)
    assignExtraToBlankColumn: function(extra) {
        this.blankColumn.tg_width = extra;
        if (this.frozenInfo.columns) {
            if (this.frozenInfo.right) {
                this.columnsWidthL += extra;
            } else {
                this.columnsWidthR += extra;
            }
        } else {
            this.columnsWidthL += extra;
        }
    }

};

