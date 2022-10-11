import Util from '../core/util';

export default {

    showColumnLine: function(columnItem) {
        if (!columnItem) {
            return;
        }
        this.$columnLineContainer.show();
        this.renderColumnLine(columnItem);
    },

    hideColumnLine: function() {
        if (this.previousColumnLineActive) {
            return;
        }
        this.$columnLineContainer.hide();
    },

    //blue color
    setColumnLineActive: function(active) {
        if (active === this.previousColumnLineActive) {
            return;
        }
        this.previousColumnLineActive = active;
        if (active) {
            this.$columnLineItem.addClass('tg-active');
        } else {
            this.$columnLineItem.removeClass('tg-active');
        }
    },

    //======================================================================================

    getColumnLineLeft: function(columnItem) {
        let left = columnItem.tg_left;
        if (!columnItem.tg_frozen) {
            left -= this.scrollLeft;
        }
        if (this.frozenInfo.right) {
            if (columnItem.tg_frozen) {
                left = columnItem.tg_left + this.paneWidthL;
            } else {
                left -= this.columnsWidthR;
            }
        }
        return left;
    },

    renderColumnLine: function(columnItem) {

        const headerNode = this.getHeaderItemNode(columnItem);
        const top = headerNode.offsetTop;

        const width = columnItem.tg_width;
        const left = this.getColumnLineLeft(columnItem);
        //console.log(left);

        this.$columnLineItemL.css({
            top: top,
            left: left
        });

        this.$columnLineItemR.css({
            top: top,
            left: left + width - 1
        });

        //hide handler
        if (this.frozenInfo.right) {
            //nothing to do, maybe need handle frozen right later
            return;
        }

        if (this.frozenInfo.columns && !columnItem.tg_frozen && left < this.paneWidthL) {
            //hide left line if has scroll left less than frozen left
            this.$columnLineItemL.hide();
        } else {
            this.$columnLineItemL.show();
        }


    },

    //======================================================================================
    //drag

    columnWidthDragStartHandler: function(e, d) {
        const columnItem = d.columnItem;
        this.$headerFrame.addClass('tg-column-dragging');
        this.setColumnLineActive(true);
        const node = this.getColumnHeaderNode(columnItem);
        d.tg_width = node.clientWidth;
    },

    columnWidthDragMoveHandler: function(e, d) {
        const columnItem = d.columnItem;
        let newWidth = d.tg_width + d.offsetX;
        newWidth = Util.clamp(newWidth, columnItem.minWidth, columnItem.maxWidth);
        if (columnItem.tg_width === newWidth) {
            return;
        }
        //width changed by user, force to update width
        columnItem.width = newWidth;
        this.updateViewColumnWidth(columnItem);
        this.renderColumnLine(columnItem);
    },

    columnWidthDragEndHandler: function(e, d) {
        if (!d.changed) {
            return;
        }
        this.$headerFrame.removeClass('tg-column-dragging');
        this.setColumnLineActive(false);

        if (e.target.className !== 'tg-column-resizing') {
            this.hideColumnLine();
        }

        this.onNextUpdated(() => {
            this.renderColumnLine(d.columnItem);
        });

        this.resize();

    },


    //======================================================================================
    //touch

    columnWidthTouchStartHandler: function(e, d) {
        Util.preventDefault(d.e);
        const columnItem = d.columnItem;
        this.showColumnLine(columnItem);
        this.setColumnLineActive(true);
        d.index = columnItem.tg_index;
        const node = this.getColumnHeaderNode(columnItem);
        d.width = node.clientWidth;
        //console.log("touch start", d);
    },

    columnWidthTouchMoveHandler: function(e, d) {
        Util.preventDefault(d.e);
        const columnItem = d.columnItem;
        let newWidth = d.width + d.offsetX;
        newWidth = Util.clamp(newWidth, columnItem.minWidth, columnItem.maxWidth);
        if (columnItem.tg_width === newWidth) {
            return;
        }
        //width changed by user, force to update width
        columnItem.width = newWidth;
        this.updateViewColumnWidth(columnItem);
        this.renderColumnLine(columnItem);
    },

    columnWidthTouchEndHandler: function(e, d) {
        Util.preventDefault(d.e);
        //console.log("touch end", d);
        this.setColumnLineActive(false);
        this.hideColumnLine();
        this.resize();
    }


};

