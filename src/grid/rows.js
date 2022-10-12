import $ from '../core/query.js';
import Util from '../core/util.js';

export default {

    getRowItem: function(context) {
        if (Util.isNum(context)) {
            if (context < 0) {
                context = this.rowsInfo.length + context;
            }
            return this.rowsInfo.indexCache[context];
        }
        if (!context) {
            return;
        }
        if (Util.isNum(context.tg_index)) {
            return context;
        }
        return this.getRowItemById(context.id || context);
    },

    getRowItemById: function(id) {
        return this.getRowItemBy('id', id);
    },

    getRowItemBy: function(key, value) {
        if (typeof value === 'undefined') {
            return;
        }
        return this.rowsInfo.indexCache.find((item) => item[key] === value);
    },

    getRowsLength: function(total) {
        if (total) {
            return this.rowsInfo.length;
        }
        return this.viewRows.length;
    },

    getViewRowItem: function(rowIndex) {
        return this.viewRows[rowIndex];
    },

    //==========================================================================

    getPreRenderRowInfo: function(rows) {
        const info = {
            rows: [],
            rowNotFound: false,
            benchmark: 0
        };
        if (!rows.length) {
            if (this.getRowsLength() === 0) {
                info.rowNotFound = true;
            }
            return info;
        }
        const benchmarks = [];
        const fr = this.frozenInfo.row;

        rows.forEach((row) => {
            if (this.getRowCache(row)) {
                if (row > fr) {
                    benchmarks.push(row);
                }
                return;
            }
            info.rows.push(row);
        });
        if (benchmarks.length) {
            info.benchmark = Math.min.apply(Math, benchmarks);
        }

        info.rows.sort(function(a, b) {
            if (a < info.benchmark && b < info.benchmark) {
                return b - a;
            }
            return a - b;
        });

        return info;
    },

    rowNotFoundHandler: function(info) {
        let rowNotFound = this.options.rowNotFound;
        if (!rowNotFound) {
            this.hidePaneMessage();
            return;
        }
        if (typeof rowNotFound === 'function') {
            rowNotFound = rowNotFound.call(this, info);
        }
        if (info.rowNotFound) {
            this.showPaneMessage(rowNotFound);
        } else {
            this.hidePaneMessage();
        }
    },

    showPaneMessage: function(message) {
        this.$bodyFrame.addClass('tg-row-not-found');
        const $elem = this.$bodyFrame.find('.tg-body-message').show();
        this.renderNodeContent($elem.get(0), message);
        this.paneMessageVisible = true;
    },

    hidePaneMessage: function() {
        if (this.paneMessageVisible) {
            this.$bodyFrame.removeClass('tg-row-not-found');
            this.$bodyFrame.find('.tg-body-message').hide();
            this.paneMessageVisible = false;
        }
    },

    renderRows: function(rows) {

        const info = this.getPreRenderRowInfo(rows);
        this.rowNotFoundHandler(info);
        if (info.rowNotFound || !info.rows.length) {
            return;
        }

        //benchmark for prepend or append

        //console.log(info);
        info.rows.forEach((row) => {

            this.renderRowNodes(row, info.benchmark);

        });

    },

    createRowNode: function(row, rowItem, className, cssText, rowTop, rowHeight) {
        const rowNode = document.createElement('div');
        //for event position
        rowNode.setAttribute('row', row);
        rowNode.className = className;
        if (cssText) {
            rowNode.style.cssText = cssText;
        }
        rowNode.style.top = `${rowTop}px`;
        if (rowHeight !== this.options.rowHeight) {
            rowNode.style.height = `${rowHeight}px`;
            rowNode.style.lineHeight = `${rowHeight}px`;
        }

        this.setNodeDataCache(rowNode, {
            row,
            rowItem,
            rowNode
        });

        return rowNode;
    },

    appendRowNode: function($body, rowNode, row, benchmark) {
        if (row < benchmark) {
            $body.prepend(rowNode);
        } else {
            $body.append(rowNode);
        }
    },

    renderRowNodes: function(row, benchmark) {

        //from view list
        const rowItem = this.getViewRowItem(row);
        if (!rowItem) {
            return;
        }

        let rowNodes = $();

        const vPos = this.getRowVPos(row);
        const className = this.getRowClass(rowItem);
        const cssText = Util.styleMap(rowItem.styleMap);
        const rowTop = this.getViewRowTop(rowItem);
        const rowHeight = this.getRowHeight(rowItem);

        //left
        const rowNodeL = this.createRowNode(row, rowItem, className, cssText, rowTop, rowHeight);
        const $bodyL = this.getRowCanvas(vPos, 'left');
        this.appendRowNode($bodyL, rowNodeL, row, benchmark);
        rowNodes = rowNodes.add(rowNodeL);

        //right
        if (this.frozenInfo.columns) {
            const rowNodeR = this.createRowNode(row, rowItem, className, cssText, rowTop, rowHeight);
            const $bodyR = this.getRowCanvas(vPos, 'right');
            this.appendRowNode($bodyR, rowNodeR, row, benchmark);
            rowNodes = rowNodes.add(rowNodeR);
        }

        this.setRowCache(row, rowNodes);

    },

    //==========================================================================
    isGroupLine: function(rowItem) {
        return rowItem && rowItem.tg_group_line && rowItem.tg_view_index !== this.frozenInfo.row;
    },

    isNoneLine: function(row) {

        const isBottom = this.frozenInfo.bottom;

        //last row
        if (row === this.viewRows.length - 1 && this.hasVScroll) {
            if (isBottom || !this.hasHScroll) {
                return true;
            }
        }

        //frozen last row
        if (row === this.frozenInfo.row && isBottom && !this.hasHScroll) {
            return true;
        }

        return false;
    },

    isTopLine: function(row) {
        if (row === 0 && this.frozenInfo.bottom) {
            return true;
        }
        return false;
    },

    getRowClass: function(rowItem) {

        const row = rowItem.tg_view_index;

        const list = ['tg-row'];

        const odd = row % 2 === 1;

        list.push({
            //odd/even line, can NOT use :nth-child(even/odd), because not all rows are rendered
            'tg-odd': odd,
            'tg-even': !odd,

            //list index first and last
            'tg-list-first': rowItem.tg_list_index === 0,
            'tg-list-last': rowItem.tg_list_last,

            //group line
            'tg-group-line': this.isGroupLine(rowItem),
            'tg-none-line': this.isNoneLine(row),
            'tg-top-line': this.isTopLine(row),

            'tg-group': rowItem.tg_group,
            'tg-selected': rowItem.selected

        });

        //custom type class name
        if (rowItem.type) {
            list.push(`tg-${rowItem.type}`);
        }

        //row state from user (not include selected)
        const rowState = rowItem.tg_state_names;
        if (rowState) {
            rowState.forEach(function(state) {
                if (rowItem[state]) {
                    list.push(`tg-${state}`);
                }
            });
        }

        //custom class name
        list.push(Util.classMap(rowItem.classMap));

        return Util.classMap(list);
    },

    getRowHeight: function(rowItem) {
        if (rowItem && Util.isNum(rowItem.tg_height)) {
            return rowItem.tg_height;
        }
        return this.options.rowHeight;
    },

    getRowsHeight: function() {
        let h = 0;
        const l = this.getRowsLength();
        for (let i = 0; i < l; i++) {
            h += this.getRowHeight(this.viewRows[i]);
        }
        return h;
    },

    getFrozenRowsHeight: function() {
        let h = 0;
        const l = this.frozenInfo.rows;
        for (let i = 0; i < l; i++) {
            h += this.getRowHeight(this.viewRows[i]);
        }
        return h;
    },

    //init tg_top from the beginning

    //with scroll top offset
    getViewRowTop: function(rowItem) {
        let top = rowItem.tg_top;
        const row = rowItem.tg_view_index;
        if (this.frozenInfo.rows) {
            if (row > this.frozenInfo.row) {
                top -= this.frozenRowsHeight;
            } else {
                //frozen row no scroll top offset
                return top;
            }
        }
        //update scroll top offset
        top -= this.scrollTopOffset;
        return top;
    },

    getRowTop: function(rowItem) {
        let top = rowItem.tg_top;
        if (rowItem.tg_frozen) {
            return top;
        }
        top -= this.frozenRowsHeight;
        return top;
    },

    getRowVPos: function(row) {
        const isBottom = this.frozenInfo.bottom;
        const fc = this.frozenInfo.row;
        let vPos = 'top';
        //frozen rows
        if (this.frozenInfo.rows) {
            //frozen
            if (row <= fc) {
                if (isBottom) {
                    vPos = 'bottom';
                }
            } else {
                if (!isBottom) {
                    vPos = 'bottom';
                }
            }
        }
        return vPos;
    },

    getRowCanvas: function(vPos, hPos) {
        if (vPos === 'top') {
            if (hPos === 'left') {
                return this.$bodyTL;
            }
            return this.$bodyTR;
        }
        if (hPos === 'left') {
            return this.$bodyBL;
        }
        return this.$bodyBR;
    }

};
