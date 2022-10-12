import $ from '../core/query.js';
import E from '../core/event-types.js';
import Util from '../core/util.js';
import Motion from '../components/motion.js';

export default {

    //row drag handler
    rowDragStartHandler: function(e, d) {

        //console.log(e.type, d);
        const rowItem = d.rowItem;
        //console.log(row);
        if (!rowItem) {
            //console.log('no row item');
            return;
        }

        const dragNodes = this.getRowNodesByIndex(rowItem.tg_view_index);
        if (!dragNodes) {
            return;
        }
        d.dragCloneNodes = this.getRowDragCloneNodes(dragNodes);
        d.dropPlaceholder = this.getRowDropPlaceholder(dragNodes);

        //for clone row top
        d.dragStartTop = this.getRowTop(rowItem);
        d.dragRowHeight = this.getRowHeight(rowItem);

        d.dragStartScrollTop = this.scrollTop;
        d.dragMaxScrollTop = this.scrollPane.getMaxScrollTop();

        this.trigger(E.onRowDragged, {
            e,
            rowItem
        });
        if (this.isDefaultPrevented(e)) {
            return;
        }

        if (d.type === 'touch') {
            Util.preventDefault(d.e);
        }

        this.setRowState(rowItem, 'dragging');
        this.rowDropListHandler(d);
        this.updateDragCloneRowPosition(d);

    },

    rowDragMoveHandler: function(e, d) {
        if (d.type === 'touch') {
            Util.preventDefault(d.e);
        }

        this.updateDragCloneRowPosition(d);
        this.updateDragPlaceholderPosition(d);
        this.rowDragAutoScrollHandler(d);
    },

    rowDragEndHandler: function(e, d) {
        if (d.type === 'touch') {
            //clean touch anyway
            this.protectedItem = null;
            Util.preventDefault(d.e);
        }

        this.autoScrollStop();

        this.setRowState(d.rowItem, 'dragging', false);
        if (d.dragCloneNodes) {
            d.dragCloneNodes.remove();
            d.dragCloneNodes = null;
        }
        if (d.dropPlaceholder) {
            d.dropPlaceholder.remove();
            d.dropPlaceholder = null;
        }

        if (!d.changed) {
            return;
        }

        this.rowDropHandler(d);

    },

    //=======================================================================================

    updateDragCloneRowPosition: function(d) {
        const scrollOffset = this.scrollTop - d.dragStartScrollTop;
        const currentTop = d.dragStartTop + d.offsetY + scrollOffset;

        const cloneRowTop = currentTop - this.scrollTopOffset;
        //console.log('cloneRowTop', cloneRowTop, 'currentTop', currentTop);

        //out of viewport will be removed
        if (d.dragCloneNodes) {
            d.dragCloneNodes.css('top', cloneRowTop).show();
        }

        d.dragCurrentPosition = currentTop + d.dragRowHeight * 0.5;
    },

    getRowDragCloneNodes: function(dragNodes) {
        const dragCloneNodes = $();
        dragNodes.each(function(elem) {
            const node = $(elem);
            const nodeCopy = node.clone();
            nodeCopy.appendTo(node.parent());
            dragCloneNodes.add(nodeCopy);
        });
        dragCloneNodes.addClass('tg-clone').hide();
        return dragCloneNodes;
    },

    getRowDropPlaceholder: function(dragNodes) {
        const dropPlaceholder = $();
        dragNodes.each(function(elem) {
            const node = $(elem);
            const holder = $('<div/>').addClass('tg-row-placeholder').hide();
            const container = node.parent();
            //remove previous first
            container.find('.tg-row-placeholder').remove();
            holder.appendTo(container);
            dropPlaceholder.add(holder);
        });
        return dropPlaceholder;
    },

    //=======================================================================================

    updateDragPlaceholderPosition: function(d) {

        this.rowDropItemHandler(d);

        const dropItem = d.dropItem;
        if (!dropItem) {
            //console.log('no drop item');
            return;
        }

        //border fix
        let top = d.dropPosition - 1;
        if (d.dropBottom) {
            if (dropItem.tg_view_last) {
                top = d.dropPosition - 2;
            }
        } else {
            if (dropItem.tg_view_index - this.frozenInfo.rows === 0) {
                top = d.dropPosition;
            }
        }
        const placeholderTop = top - this.scrollTopOffset;

        //out of viewport will be removed
        if (d.dropPlaceholder) {
            d.dropPlaceholder.css('top', placeholderTop).show();
        }
        //console.log('placeholder', placeholderTop);

    },

    rowDragAutoScrollHandler: function(d) {

        const currentPos = d.dragCurrentPosition;

        const scrollTop = this.scrollTop;
        const scrollHeight = this.bodyHeight - this.frozenRowsHeight;
        const scrollBottom = scrollTop + scrollHeight;
        //console.log('scrollTop', scrollTop, 'dropPosition', dropPosition, 'scrollBottom', scrollBottom);

        const rowHeight = this.options.rowHeight;
        const moveAreaHeight = Math.min(rowHeight * 3, scrollHeight * 0.5);
        //console.log('moveAreaHeight', moveAreaHeight);

        //not enough area
        if (moveAreaHeight < rowHeight) {
            return;
        }

        //move up
        if (d.offsetY < 0) {
            if (currentPos < scrollTop + moveAreaHeight) {
                //console.log('auto scroll up');
                const posUp = currentPos - (scrollTop + moveAreaHeight);
                const offsetUp = this.getAutoScrollOffset(posUp, moveAreaHeight);
                this.autoScrollStart(offsetUp, d);
                return;
            }
            this.autoScrollStop();
            return;
        }

        //move down
        if (currentPos > scrollBottom - moveAreaHeight) {
            //console.log('auto scroll down');
            const posDown = currentPos - (scrollBottom - moveAreaHeight);
            const offsetDown = this.getAutoScrollOffset(posDown, moveAreaHeight);
            this.autoScrollStart(offsetDown, d);
            return;
        }
        this.autoScrollStop();

    },

    //=======================================================================================

    getAutoScrollOffset: function(pos, height) {
        return Math.floor(pos / height * 20);
    },

    autoScrollStop: function() {
        if (this.autoScrollMotion) {
            this.autoScrollMotion.destroy();
            this.autoScrollMotion = null;
        }
    },

    autoScrollStart: function(offset, d) {
        this.autoScrollStop();

        const dragMaxScrollTop = d.dragMaxScrollTop;

        this.autoScrollMotion = new Motion();
        this.autoScrollMotion.bind(Motion.EVENT.MOTION_MOVE, () => {

            const newTop = Util.clamp(this.scrollTop + offset, 0, dragMaxScrollTop);
            if (newTop === this.scrollTop) {
                this.autoScrollStop();
                return;
            }

            //console.log('scrollTop', newTop);

            this.setScrollTop(newTop);
            //update position
            this.updateDragCloneRowPosition(d);
            this.updateDragPlaceholderPosition(d);

        });
        this.autoScrollMotion.once(Motion.EVENT.MOTION_END, () => {
            this.autoScrollStart(offset, d);
        });
        this.autoScrollMotion.start({
            duration: 200
        });
    },


    //=======================================================================================

    rowDropListHandler: function(d) {
        const list = this.getRowDropList(d);
        //console.log(rows);
        if (!Util.isList(list)) {
            return;
        }
        const rowItem = d.rowItem;
        const drops = list.filter((item) => {

            if (item === rowItem) {
                return false;
            }

            //no frozen drag
            if (item.tg_frozen) {
                return false;
            }

            //filter children
            let parent = item.tg_parent;
            while (parent) {
                if (parent === rowItem) {
                    return false;
                }
                parent = parent.tg_parent;
            }

            return true;
        });

        if (!Util.isList(drops)) {
            return;
        }

        const dropList = [];
        drops.forEach((item) => {

            //for position, using data list top
            const rowTop = this.getRowTop(item);
            const rowHeight = this.getRowHeight(item);
            dropList.push({
                rowItem: item,
                position: rowTop
            });

            //-1 for less than next top, not equal next top
            dropList.push({
                rowItem: item,
                position: rowTop + rowHeight - 1,
                dropBottom: true
            });

        });

        d.dropList = dropList;
    },

    getRowDropList: function(d) {
        const crossLevel = this.options.rowDragCrossLevel;

        //default only parent subs
        if (!crossLevel) {
            return this.getRowParentSubs(d.rowItem);
        }

        //custom filter
        if (typeof crossLevel === 'function') {
            return crossLevel.call(this, d);
        }

        //all rows
        return this.viewRows;
    },

    rowDropItemHandler: function(d) {

        const dropList = d.dropList;
        if (!dropList) {
            //console.log('no drop list');
            return;
        }

        const currentPos = d.dragCurrentPosition;

        //find best position
        let distance = Number.MAX_VALUE;

        for (let i = 0, l = dropList.length; i < l; i++) {
            const item = dropList[i];
            const currentDis = Math.abs(currentPos - item.position);
            //console.log('dTop', dTop, item.rowItem.name);
            if (currentDis > distance) {
                break;
            }
            distance = currentDis;
            d.dropItem = item.rowItem;
            d.dropBottom = item.dropBottom;
            d.dropPosition = item.position;

        }

        //console.log(d.rowItem, d.dropItem, d.dropBottom, distance);

    },


    rowDragDropPositionHandler: function(rowItem, dropItem, dropBottom) {

        const dragFrom = this.getRowParentSubs(rowItem);
        const dragIndex = rowItem.tg_sub_index;

        let dropInto;
        let dropIndex;
        //add below group first
        if (this.isDropIntoGroupFirstChild(dropItem, dropBottom)) {
            dropInto = dropItem.subs;
            dropIndex = 0;
        } else {
            dropInto = this.getRowParentSubs(dropItem);
            dropIndex = dropItem.tg_sub_index;
            //if remove one before, fix one position
            if (dragFrom === dropInto && dragIndex < dropIndex) {
                dropIndex -= 1;
            }
            if (dropBottom) {
                dropIndex += 1;
            }
        }

        return this.updateDragDropPosition(dragFrom, dropInto, dragIndex, dropIndex, rowItem);

    },

    isDropIntoGroupFirstChild: function(dropItem, dropBottom) {
        if (!dropBottom) {
            return false;
        }
        if (!dropItem.tg_group) {
            return false;
        }
        if (this.isEmptyGroup(dropItem)) {
            //expend it
            dropItem.collapsed = false;
            return true;
        }
        if (!dropItem.collapsed) {
            return true;
        }
        return false;
    },

    updateDragDropPosition: function(dragFrom, dropInto, dragIndex, dropIndex, rowItem) {

        //console.log(dragIndex, dropIndex, dragFrom, dropInto);

        if (dragFrom === dropInto && dragIndex === dropIndex) {
            //console.log('drag drop no change');
            return;
        }

        //remove from drag subs
        dragFrom.splice(dragIndex, 1);

        //insert to drop subs
        dropInto.splice(dropIndex, 0, rowItem);

        return {
            rowItem,
            dragFrom,
            dragIndex,
            dropInto,
            dropIndex
        };
    },

    rowDropHandler: function(d) {

        const dropItem = d.dropItem;
        //no change
        if (!dropItem) {
            //console.log('no drop item');
            return;
        }

        const rowItem = d.rowItem;
        const dropBottom = d.dropBottom;

        //console.log('dropItem/dropBottom', dropItem.name, dropBottom);

        const droppedInfo = this.rowDragDropPositionHandler(rowItem, dropItem, dropBottom);
        if (!droppedInfo) {
            //console.log('no change');
            return;
        }

        //delete and add need init again
        this.initRowsHandler();

        //flush
        let minIndex = Math.min(rowItem.tg_view_index, dropItem.tg_view_index);
        if (minIndex) {
            //flush up row group line
            minIndex -= 1;
        }
        this.flushRowFrom(minIndex);

        //fresh data index
        this.removeSortColumn();

        this.onNextUpdated(() => {
            this.trigger(E.onRowDropped, droppedInfo);
        });

        this.render({
            type: 'rows',
            scrollRow: rowItem
        });

    }

};

