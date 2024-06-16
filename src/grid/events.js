import $ from '../core/query.js';
import Util from '../core/util.js';
import E, { Types } from '../core/event-types.js';
import Drag from '../components/drag.js';
import Touch from '../components/touch.js';

export default {

    getAllEvents: function() {
        return [].concat(Types);
    },

    bindEvents: function() {

        this.unbindEvents();

        this.containerEvents = {

            mousedown: {
                handler: (e) => {
                    this.containerMouseDownHandler(e);
                },
                options: true
            },

            mousemove: {
                handler: (e) => {
                    this.containerMouseMoveHandler(e);
                },
                options: true
            },
            mouseover: {
                handler: (e) => {
                    this.containerMouseOverOutHandler(e, true);
                },
                options: true
            },
            mouseout: {
                handler: (e) => {
                    this.containerMouseOverOutHandler(e, false);
                },
                options: true
            },
            mouseenter: {
                handler: (e) => {
                    this.containerMouseEnterLeaveHandler(e, true);
                },
                options: true
            },
            mouseleave: {
                handler: (e) => {
                    this.containerMouseEnterLeaveHandler(e, false);
                },
                options: true
            },

            touchstart: {
                handler: (e) => {
                    this.containerTouchStartHandler(e);
                },
                options: {
                    passive: false
                }
            },

            touchmove: {
                handler: (e) => {
                    this.containerTouchMoveHandler(e);
                },
                options: {
                    passive: false
                }
            },

            touchend: {
                handler: (e) => {
                    this.containerTouchEndHandler(e);
                },
                options: {
                    passive: false
                }
            },

            touchcancel: {
                handler: (e) => {
                    this.containerTouchCancelHandler(e);
                },
                options: {
                    passive: false
                }
            },

            wheel: {
                handler: (e) => {
                    this.containerWheelHandler(e);
                },
                options: {
                    passive: false
                }
            },

            click: {
                handler: (e) => {
                    this.containerClickHandler(e);
                },
                options: true
            },

            dblclick: {
                handler: (e) => {
                    this.containerDblClickHandler(e);
                },
                options: true
            },

            contextmenu: {
                handler: (e) => {
                    this.containerContextMenuHandler(e);
                },
                options: true
            },

            selectstart: {
                handler: (e) => {
                    this.containerSelectStartHandler(e);
                },
                options: true
            },

            keydown: {
                handler: (e) => {
                    this.containerKeyDownHandler(e);
                },
                options: true
            }

        };

        Util.bindEvents(this.containerEvents, this.container);

        // ==============================================================

        // column drag events
        this.columnWidthDrag = new Drag();
        this.columnWidthDrag.bind(Drag.EVENT.DRAG_START, (e, d) => {
            this.columnWidthDragStartHandler(e, d);
        }).bind(Drag.EVENT.DRAG_MOVE, (e, d) => {
            this.columnWidthDragMoveHandler(e, d);
        }).bind(Drag.EVENT.DRAG_END, (e, d) => {
            this.columnWidthDragEndHandler(e, d);
        });

        // column width touch
        this.columnWidthTouch = new Touch();
        this.columnWidthTouch.bind(Touch.EVENT.TOUCH_START, (e, d) => {
            this.columnWidthTouchStartHandler(e, d);
        }).bind(Touch.EVENT.TOUCH_MOVE, (e, d) => {
            this.columnWidthTouchMoveHandler(e, d);
        }).bind(Touch.EVENT.TOUCH_END, (e, d) => {
            this.columnWidthTouchEndHandler(e, d);
        });

        // row drag events
        this.rowDrag = new Drag();
        this.rowDrag.bind(Drag.EVENT.DRAG_START, (e, d) => {
            this.rowDragStartHandler(e, d);
        }).bind(Drag.EVENT.DRAG_MOVE, (e, d) => {
            this.rowDragMoveHandler(e, d);
        }).bind(Drag.EVENT.DRAG_END, (e, d) => {
            this.rowDragEndHandler(e, d);
        });

        this.rowTouch = new Touch();
        this.rowTouch.bind(Touch.EVENT.TOUCH_START, (e, d) => {
            this.rowDragStartHandler(e, d);
        }).bind(Touch.EVENT.TOUCH_MOVE, (e, d) => {
            this.rowDragMoveHandler(e, d);
        }).bind(Touch.EVENT.TOUCH_END, (e, d) => {
            this.rowDragEndHandler(e, d);
        });

        // scroll touch events
        this.scrollTouch = new Touch();
        this.scrollTouch.bind(Touch.EVENT.TOUCH_START, (e, d) => {
            this.scrollTouchStartHandler(e, d);
        }).bind(Touch.EVENT.TOUCH_MOVE, (e, d) => {
            this.scrollTouchMoveHandler(e, d);
        }).bind(Touch.EVENT.TOUCH_END, (e, d) => {
            this.scrollTouchEndHandler(e, d);
        }).bind(Touch.EVENT.TOUCH_INERTIA, (e, d) => {
            this.scrollTouchInertiaHandler(e, d);
        });

    },

    // =============================================================================================
    // event api

    // check native event
    isDefaultPrevented: function(d) {

        if (d) {
            if (d.defaultPrevented) {
                return true;
            }

            if (d.e && d.e.defaultPrevented) {
                return true;
            }

        }

        return false;
    },

    getEventClosestNode: function(target, className) {
        if (!target || target === this.container) {
            return;
        }
        if (target.classList.contains(className)) {
            return target;
        }
        return this.getEventClosestNode(target.parentNode, className);
    },

    getEventClosestData: function(target) {
        if (!target || target === this.container) {
            return;
        }
        const d = this.getNodeDataCache(target);
        if (!d) {
            return this.getEventClosestData(target.parentNode);
        }
        return d;
    },

    getEventData: function(e) {
        const d = this.getEventClosestData(e.target);
        if (d) {
            d.e = e;
            return d;
        }
    },

    getWheelDelta: function(e, lineHeight, pageHeight) {

        // New wheel delta (wheel event)
        let deltaX = e.deltaX;
        let deltaY = e.deltaY;


        // wheelDeltaX/wheelDeltaY is old property
        if (!Util.isNum(deltaX)) {
            deltaX = Util.toNum(e.wheelDeltaX);
        }

        if (!Util.isNum(deltaY)) {
            deltaY = Util.toNum(e.wheelDeltaY || e.wheelDelta);
        }

        // deltaMode fixing to px
        // 0 is by pixel, nothing to do
        // 1 is by line
        // 2 is by page
        if (e.deltaMode === 1) {
            deltaY *= lineHeight;
            deltaX *= lineHeight;
        } else if (e.deltaMode === 2) {
            deltaY *= pageHeight;
            deltaX *= pageHeight;
        }

        return {
            deltaX: deltaX,
            deltaY: deltaY
        };
    },

    // ======================================================================================

    columnResizingMouseDownHandler: function(e) {
        const d = this.getEventData(e);
        if (!d) {
            return;
        }
        this.columnWidthDrag.start(e, {
            columnItem: d.columnItem
        });
    },

    columnResizingTouchStartHandler: function(e) {
        const d = this.getEventData(e);
        if (!d) {
            return;
        }
        this.columnWidthTouch.start(e, {
            columnItem: d.columnItem
        });
    },

    columnResizingMouseEnterLeaveHandler: function(e, enter) {
        const d = this.getEventData(e);
        if (!d) {
            return;
        }
        if (enter) {
            this.showColumnLine(d.columnItem);
        } else {
            this.hideColumnLine();
        }
    },

    rowDragMouseDownHandler: function(e) {
        const d = this.getEventData(e);
        if (!d) {
            return;
        }
        this.rowDrag.start(e, {
            rowItem: d.rowItem
        });
    },

    rowDragTouchStartHandler: function(e) {
        const d = this.getEventData(e);

        // required touch row
        if (!d) {
            return;
        }

        this.protectedItem = d;

        this.rowTouch.start(e, {
            rowItem: d.rowItem
        });
    },

    // ======================================================================================

    scrollPaneTouchStartHandler: function(e) {
        // just for touch scroll pane, separate with header touchstart
        if (!this.hasHScroll && !this.hasVScroll) {
            // console.log('no need touch scroll');
            return;
        }

        // keep touched row and column for viewport
        // do NOT remove touching element, otherwise will NOT dispatch touchmove and touchend events
        const d = this.getEventData(e);

        // not required, can touch header scroll
        // if (!d) {
        //     return;
        // }

        this.protectedItem = d;

        // require in pane because body maybe not full height
        this.scrollTouch.start(e, {
            inertia: true
        });
    },

    // ======================================================================================

    sortHandler: function(e, d) {

        const columnItem = d.columnItem;
        if (!this.isColumnSortable(columnItem)) {
            return;
        }

        // is on name or sort place holder
        const $columnName = this.getEventClosestNode(e.target, 'tg-column-name');
        const $columnSort = this.getEventClosestNode(e.target, 'tg-column-sort');
        if (!$columnName && !$columnSort) {
            return;
        }

        this.trigger(E.onSort, d);
        if (this.isDefaultPrevented(d)) {
            return;
        }

        this.setSortColumn(columnItem);

    },

    selectIconAllClickHandler: function(node) {
        const $electIconAll = $(node);
        // toggle selected state
        let selected = false;
        if ($electIconAll.hasClass('tg-selected') || $electIconAll.hasClass('tg-mixed')) {
            selected = true;
        }
        selected = !selected;
        this.selectAll(selected);
    },

    // ======================================================================================

    cellEnterLeaveHandler: function(e, hover) {
        const d = this.getEventData(e);
        if (!d) {
            return;
        }
        if (hover) {
            this.trigger(E.onCellMouseEnter, d);
        } else {
            this.trigger(E.onCellMouseLeave, d);
        }

    },

    rowEnterLeaveHandler: function(e, enter) {
        const d = this.getEventData(e);
        // console.log('row enter leave', enter, d);
        if (!d) {
            return;
        }
        if (enter) {
            this.trigger(E.onRowMouseEnter, d);
        } else {
            this.trigger(E.onRowMouseLeave, d);
        }
        if (this.isDefaultPrevented(d)) {
            return;
        }
        // row class handler
        this.renderRowHover(d.rowItem, enter);

        return this;
    },

    // =============================================================================================
    // container handlers

    containerMouseDownHandler: function(e) {

        const $columnResizing = this.getEventClosestNode(e.target, 'tg-column-resizing');
        if ($columnResizing) {
            this.columnResizingMouseDownHandler(e);
            return;
        }

        if (this.options.rowDragVisible) {
            const $rowDragIcon = this.getEventClosestNode(e.target, 'tg-row-drag-icon');
            if ($rowDragIcon) {
                this.rowDragMouseDownHandler(e);
            }
        }
    },

    containerMouseMoveHandler: function(e) {
        this.scrollbarFadeInOutHandler(e, true);
    },

    containerMouseOverOutHandler: function(e, over) {
        const $cell = this.getEventClosestNode(e.target, 'tg-cell');
        const $headerItem = this.getEventClosestNode(e.target, 'tg-header-item');

        if ($cell || $headerItem) {

            const d = this.getEventData(e);
            if (!d) {
                return;
            }
            if (over) {
                this.trigger(E.onMouseOver, d);
            } else {
                this.trigger(E.onMouseOut, d);
            }

        }

    },

    containerMouseEnterLeaveHandler: function(e, enter) {

        this.scrollbarFadeInOutHandler(e, enter);

        const $columnResizing = $(e.target).hasClass('tg-column-resizing');
        if ($columnResizing) {
            this.columnResizingMouseEnterLeaveHandler(e, enter);
            return;
        }

        const $cell = $(e.target).hasClass('tg-cell');
        if ($cell) {
            // console.log(e.type, 'cell');
            this.cellEnterLeaveHandler(e, enter);
            return;
        }

        const $row = $(e.target).hasClass('tg-row');
        if ($row) {
            // console.log(e.type, 'row');
            this.rowEnterLeaveHandler(e, enter);
        }

    },

    containerTouchStartHandler: function(e) {
        // stop motion if have
        this.scrollTouch.motionStop();

        const $columnResizing = this.getEventClosestNode(e.target, 'tg-column-resizing');
        if ($columnResizing) {
            this.columnResizingTouchStartHandler(e);
            return;
        }

        if (this.options.rowDragVisible) {
            const $rowDragIcon = this.getEventClosestNode(e.target, 'tg-row-drag-icon');
            if ($rowDragIcon) {
                this.rowDragTouchStartHandler(e);
                return;
            }
        }

        const d = this.getEventData(e);
        if (d) {
            this.trigger(E.onTouchStart, d);
            if (this.isDefaultPrevented(d)) {
                return;
            }
        }

        // default scroll event
        this.scrollPaneTouchStartHandler(e);

    },

    containerTouchMoveHandler: function(e) {
        const d = this.getEventData(e);
        if (d) {
            this.trigger(E.onTouchMove, d);
        }
    },

    containerTouchEndHandler: function(e) {
        const d = this.getEventData(e);
        if (d) {
            this.trigger(E.onTouchEnd, d);
        }
    },

    containerTouchCancelHandler: function(e) {
        this.trigger(E.onTouchEnd, {
            e
        });
    },

    containerWheelHandler: function(e) {

        // stop wheel if has mask
        if (this.hasMask) {
            return;
        }

        // init mouse wheel data
        const lineHeight = this.getRowHeight();
        const pageHeight = this.bodyHeight;
        const wd = this.getWheelDelta(e, lineHeight, pageHeight);

        // e.deltaMode = 0;
        // console.log('delta', wd);
        const d = {
            e: e,
            deltaX: wd.deltaX,
            deltaY: wd.deltaY,
            delta: wd
        };
        this.trigger(E.onMouseWheel, d);
        if (this.isDefaultPrevented(d)) {
            return;
        }

        let handledFrozen = false;
        if (this.scrollPaneHidden) {
            handledFrozen = this.scrollPaneFrozen.setOffsetH(wd.deltaX);
            wd.deltaX = 0;
        }

        const handled = this.scrollPane.mouseWheelHandler(wd);
        if (handled || handledFrozen) {
            // require to prevent default for MAC OS
            // it's very different default handler between windows and Mac
            Util.preventDefault(e);
        }

    },

    containerClickHandler: function(e) {

        // tree icon all
        const $treeIconAll = this.getEventClosestNode(e.target, 'tg-tree-icon-all');
        if ($treeIconAll) {
            this.toggleAllRows();
            return;
        }

        // select icon all
        const $electIconAll = this.getEventClosestNode(e.target, 'tg-select-icon-all');
        if ($electIconAll) {
            this.selectIconAllClickHandler($electIconAll);
            return;
        }

        const d = this.getEventData(e);
        if (!d) {
            return;
        }

        const $headerItem = this.getEventClosestNode(e.target, 'tg-header-item');
        if ($headerItem) {
            this.trigger(E.onClick, d);
            if (this.isDefaultPrevented(d)) {
                return;
            }
            this.sortHandler(e, d);
            return;
        }

        // tree icon
        const $treeIcon = this.getEventClosestNode(e.target, 'tg-tree-icon');
        if ($treeIcon) {
            this.toggleRow(d.rowItem);
            return;
        }

        // select icon
        const $electIcon = this.getEventClosestNode(e.target, 'tg-select-icon');
        if ($electIcon) {
            this.setRowSelected(d.rowItem, e);
            return;
        }

        this.trigger(E.onClick, d);

    },


    containerDblClickHandler: function(e) {
        const d = this.getEventData(e) || {
            e
        };
        this.trigger(E.onDblClick, d);
    },

    containerContextMenuHandler: function(e) {
        const d = this.getEventData(e) || {
            e
        };
        this.trigger(E.onContextMenu, d);
    },

    // selectstart only when css user-select: none;
    containerSelectStartHandler: function(e) {
        if (this.options.textSelectable) {
            return;
        }
        const selectable = $(e.target).is('input,textarea,code');
        if (selectable) {
            return;
        }
        Util.preventDefault(e);
    },

    containerKeyDownHandler: function(e) {

        // console.log('onKeyDown', this.id, e.keyCode);
        if (this.hasMask) {
            return;
        }
        const d = {
            e: e
        };
        this.trigger(E.onKeyDown, d);
        if (this.isDefaultPrevented(d)) {
            return;
        }

        const keyCode = e.keyCode;
        // console.log(keyCode);
        // 9: tab
        // 13: enter
        // 27: esc
        // 33,34: page up,page down
        // 35,36: end,home
        // 37,38,39,40: left,up,right,down
        const keyCodeList = {
            '9': this.keyTabHandler,
            '13': this.keyEnterHandler,
            '27': this.keyEscHandler,

            '33': this.keyPageUpHandler,
            '34': this.keyPageDownHandler,
            '35': this.keyEndHandler,
            '36': this.keyHomeHandler,

            '37': this.keyLeftHandler,
            '38': this.keyUpHandler,
            '39': this.keyRightHandler,
            '40': this.keyDownHandler
        };

        const handler = keyCodeList[keyCode];
        if (!handler) {
            return;
        }

        const handled = handler.call(this, e);
        if (handled) {
            Util.preventDefault(e);
        }
    },

    // =============================================================================================

    unbindEvents: function() {

        Util.unbindEvents(this.containerEvents);
        this.containerEvents = null;

        if (this.columnWidthDrag) {
            this.columnWidthDrag.destroy();
            this.columnWidthDrag = null;
        }

        if (this.columnWidthTouch) {
            this.columnWidthTouch.destroy();
            this.columnWidthTouch = null;
        }

        if (this.rowDrag) {
            this.rowDrag.destroy();
            this.rowDrag = null;
        }

        if (this.rowTouch) {
            this.rowTouch.destroy();
            this.rowTouch = null;
        }

        if (this.scrollTouch) {
            this.scrollTouch.destroy();
            this.scrollTouch = null;
        }

        // for all touch
        this.protectedItem = null;

    }


};
