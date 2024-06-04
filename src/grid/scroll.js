import E from '../core/event-types.js';
import Util from '../core/util.js';
import CONST from '../core/const.js';

export default {

    // =============================================================================
    // scroll to row/column/cell

    scrollToRow: function(row) {
        const rowItem = this.getRowItem(row);
        this.scrollToItem(rowItem, null);
        return this;
    },

    scrollToColumn: function(column) {
        const columnItem = this.getColumnItem(column);
        this.scrollToItem(null, columnItem);
        return this;
    },

    scrollToCell: function(row, column) {
        const rowItem = this.getRowItem(row);
        const columnItem = this.getColumnItem(column);
        this.scrollToItem(rowItem, columnItem);
        return this;
    },

    // =============================================================================
    scrollToFirstRow: function() {
        this.setScrollTop(0);
        return this;
    },

    scrollToLastRow: function() {
        const rows = this.getViewRows();
        const lastRow = rows[rows.length - 1];
        const rowPosition = this.getScrollRowPosition(lastRow);
        if (!Util.isNum(rowPosition)) {
            return;
        }
        this.setScrollTop(rowPosition);
        return this;
    },

    scrollToFirstColumn: function() {
        this.setScrollLeft(0);
        return this;
    },

    scrollToLastColumn: function(end) {
        const columns = this.getViewColumns();
        // last column is blank
        let lastColumn = columns[columns.length - 2];
        if (end) {
            lastColumn = columns[columns.length - 1];
        }
        const columnPosition = this.getScrollColumnPosition(lastColumn);
        if (!Util.isNum(columnPosition)) {
            return;
        }
        this.setScrollLeft(columnPosition);
        return this;
    },

    // =============================================================================
    // scroll row/column/cell into view

    scrollRowIntoView: function(row) {
        const rowItem = this.getRowItem(row);
        this.scrollItemIntoView(rowItem, null);
        return this;
    },

    scrollColumnIntoView: function(column) {
        const columnItem = this.getColumnItem(column);
        this.scrollItemIntoView(null, columnItem);
        return this;
    },

    scrollCellIntoView: function(row, column) {
        const rowItem = this.getRowItem(row);
        const columnItem = this.getColumnItem(column);
        this.scrollItemIntoView(rowItem, columnItem);
        return this;
    },

    // scroll public API

    // ========================================================================================
    // set scroll by position

    setScroll: function(x, y) {
        if (x === this.scrollLeft && y === this.scrollTop) {
            return this;
        }
        this.scrollLeft = x;
        this.scrollTop = y;
        this.scrollHandler();
        return this;
    },

    setScrollLeft: function(x) {
        if (x === this.scrollLeft) {
            return this;
        }
        this.scrollLeft = x;
        this.scrollHandler();
        return this;
    },

    setScrollTop: function(y) {
        if (y === this.scrollTop) {
            return this;
        }
        this.scrollTop = y;
        this.scrollHandler();
        return this;
    },

    // ========================================================================================
    // get scroll position

    getScrollRowPosition: function(rowItem) {
        if (!rowItem) {
            return;
        }

        let row = rowItem.tg_view_index;
        row -= this.frozenInfo.rows;

        if (row >= 0) {
            return this.getRowTop(rowItem);
        }
    },

    getScrollColumnPosition: function(columnItem) {
        if (!columnItem) {
            return;
        }
        let x = columnItem.tg_left;
        if (this.frozenInfo.columns) {
            x -= this.bodyWidthL;
        }
        // console.log(columnItem);
        if (x >= 0) {
            return x;
        }
    },

    // ========================================================================================
    // scroll to item

    scrollToItem: function(rowItem, columnItem) {
        this.scrollToChanged = false;
        this.scrollToRowHandler(rowItem);
        this.scrollToColumnHandler(columnItem);
        if (!this.scrollToChanged) {
            return this;
        }
        this.scrollHandler();
        return this;
    },

    scrollToRowHandler: function(rowItem) {
        if (!rowItem) {
            return;
        }
        const rowPosition = this.getScrollRowPosition(rowItem);
        if (!Util.isNum(rowPosition)) {
            return;
        }
        if (rowPosition === this.scrollTop) {
            return;
        }
        this.scrollTop = rowPosition;
        this.scrollToChanged = true;
    },

    scrollToColumnHandler: function(columnItem) {
        if (!columnItem) {
            return;
        }
        const columnPosition = this.getScrollColumnPosition(columnItem);
        if (!Util.isNum(columnPosition)) {
            return;
        }
        if (columnPosition === this.scrollLeft) {
            return;
        }
        this.scrollLeft = columnPosition;
        this.scrollToChanged = true;
    },

    // ========================================================================================
    // scroll item into view

    scrollItemIntoView: function(rowItem, columnItem) {
        this.scrollIntoViewChanged = false;
        this.scrollRowIntoViewHandler(rowItem);
        this.scrollColumnIntoViewHandler(columnItem);
        if (!this.scrollIntoViewChanged) {
            return this;
        }
        this.scrollHandler();
        return this;
    },

    scrollRowIntoViewHandler: function(rowItem) {
        if (!rowItem) {
            return;
        }
        const rowPosition = this.getScrollRowPosition(rowItem);
        if (!Util.isNum(rowPosition)) {
            return;
        }

        // top in view
        if (rowPosition < this.scrollTop) {
            this.scrollTop = rowPosition;
            this.scrollIntoViewChanged = true;
            return;
        }

        // bottom in view
        const h = this.getRowHeight(rowItem);
        const scrollViewHeight = this.getScrollViewHeight();

        if (rowPosition + h > this.scrollTop + scrollViewHeight) {
            const top = rowPosition - (scrollViewHeight - h);
            this.scrollTop = top;
            this.scrollIntoViewChanged = true;
        }

    },

    scrollColumnIntoViewHandler: function(columnItem) {
        if (!columnItem) {
            return;
        }
        const columnPosition = this.getScrollColumnPosition(columnItem);
        if (!Util.isNum(columnPosition)) {
            return;
        }

        // left in view
        if (columnPosition < this.scrollLeft) {
            this.scrollLeft = columnPosition;
            this.scrollIntoViewChanged = true;
            return;
        }

        // right in view
        const columnWidth = columnItem.tg_width;
        const scrollViewWidth = this.getScrollViewWidth();
        if (columnPosition + columnWidth > this.scrollLeft + scrollViewWidth) {
            const left = columnPosition - (scrollViewWidth - columnWidth);
            this.scrollLeft = left;
            this.scrollIntoViewChanged = true;
        }

    },

    // render viewport position on init
    scrollOnInit: function() {

        const {
            scrollLeft, scrollTop, scrollColumn, scrollRow
        } = this.renderSettings;

        // console.log(scrollRow, scrollColumn);
        this.scrollIntoViewChanged = false;

        if (Number.isInteger(scrollLeft) && scrollLeft !== this.scrollLeft) {
            this.scrollLeft = scrollLeft;
            this.scrollIntoViewChanged = true;
        }
        if (Number.isInteger(scrollTop) && scrollTop !== this.scrollTop) {
            this.scrollTop = scrollTop;
            this.scrollIntoViewChanged = true;
        }

        // for add/delete columns/rows auto scroll to
        if (scrollColumn) {
            this.scrollColumnIntoViewHandler(scrollColumn);
        }
        if (scrollRow) {
            this.scrollRowIntoViewHandler(scrollRow);
        }

        if (this.scrollIntoViewChanged) {
            this.scrollPane.setPosition(this.scrollLeft, this.scrollTop);
        }
    },

    // ========================================================================================
    // scroll handler by scrollLeft and scrollTop

    scrollHandler: function() {
        // sets new position with team sync
        this.scrollPane.setPosition(this.scrollLeft, this.scrollTop);
        this.scrollRenderHandler();
    },

    scrollRenderHandler: function() {

        if (this.previousScrollLeft === this.scrollLeft && this.previousScrollTop === this.scrollTop) {
            return;
        }
        this.previousScrollLeft = this.scrollLeft;
        this.previousScrollTop = this.scrollTop;

        this.onNextUpdated(() => {
            // show fade scrollbar when scrolling
            this.updateScrollPaneFade(true);

            this.trigger(E.onScroll, {
                scrollLeft: this.scrollLeft,
                scrollTop: this.scrollTop
            });
        });

        // scroll render
        this.render();

    },

    // ====================================================================================
    // scroll touch

    scrollTouchStartHandler: function(e, d) {
        // hide column line when starting touch scroll
        this.hideColumnLine();
        // start position
        this.scrollTouchLeft = this.getScrollLeft();
        this.scrollTouchTop = this.getScrollTop();

        this.scrollMaxTouchLeft = this.getMaxScrollLeft();
        this.scrollMaxTouchTop = this.getMaxScrollTop();

    },

    getTouchOrientation: function(d) {
        if (d.orientation) {
            return d.orientation;
        }

        if ([CONST.LEFT, CONST.RIGHT].includes(d.direction)) {
            if (!d.orientation) {
                d.orientation = 'Y';
            }
            return d.orientation;
        }

        if ([CONST.UP, CONST.DOWN].includes(d.direction)) {
            if (!d.orientation) {
                d.orientation = 'X';
            }
            return d.orientation;
        }
    },

    scrollTouchMoveHandler: function(e, d) {

        // multiple touches not move
        if (d.touchLength > 1) {
            // console.log('multiple touches');
            return;
        }

        let ox = d.offsetX;
        let oy = d.offsetY;

        const orientation = this.getTouchOrientation(d);
        if (orientation === 'X') {
            // console.log('stabilize x');
            ox = 0;
        } else if (orientation === 'Y') {
            // console.log('stabilize y');
            oy = 0;
        }


        let tsl = this.scrollTouchLeft - ox;
        let tst = this.scrollTouchTop - oy;

        // clamp range
        tsl = Util.clamp(tsl, 0, this.scrollMaxTouchLeft);
        tst = Util.clamp(tst, 0, this.scrollMaxTouchTop);

        let handledFrozen = false;
        if (this.scrollPaneHidden) {
            handledFrozen = this.scrollPaneFrozen.setOffsetH(-d.moveX);
            tsl = 0;
        }

        const cl = this.getScrollLeft();
        const ct = this.getScrollTop();
        // console.log('scroll position', pl, pt, 'new:', tsl, tst);
        // not same means moving, need stop default scroll
        if (tsl !== cl || tst !== ct || handledFrozen) {

            Util.preventDefault(d.e);
            // console.log('x', tsl, 'y', tst);
            this.setScroll(tsl, tst);
        }

    },

    scrollTouchEndHandler: function() {
        this.protectedItem = null;
    },

    scrollTouchInertiaHandler: function(e, d) {
        const cl = this.getScrollLeft();
        const ct = this.getScrollTop();
        const tsl = cl - d.touchInertiaX;
        const tst = ct - d.touchInertiaY;
        this.setScroll(tsl, tst);
    },

    // ====================================================================================

    getScrollViewWidth: function() {
        let scrollViewWidth = this.getScrollPaneWidth();
        if (!this.frozenInfo.right) {
            scrollViewWidth -= this.getScrollbarWidth();
        }
        return scrollViewWidth;
    },

    getScrollViewHeight: function() {
        let scrollViewHeight = this.getScrollPaneHeight();
        if (!this.frozenInfo.bottom) {
            scrollViewHeight -= this.getScrollbarHeight();
        }
        return scrollViewHeight;
    },

    getScrollPaneWidth: function() {
        return this.scrollPane.width();
    },

    getScrollPaneHeight: function() {
        return this.scrollPane.height();
    },

    getScrollbarWidth: function() {
        if (this.hasVScroll && !this.options.scrollbarFade) {
            return this.scrollbarSizeV;
        }
        return 0;
    },

    getScrollbarHeight: function() {
        if (this.hasHScroll && !this.options.scrollbarFade) {
            return this.scrollbarSizeH;
        }
        return 0;
    },

    getScrollLeft: function() {
        return this.scrollPane.getScrollLeft();
    },

    getScrollTop: function() {
        return this.scrollPane.getScrollTop();
    },

    getMaxScrollLeft: function() {
        return this.scrollPane.getMaxScrollLeft();
    },

    getMaxScrollTop: function() {
        return this.scrollPane.getMaxScrollTop();
    }

};
