import { Grid, $ } from '../../src/index.js';
import Data from '../data/data.js';
import { triggerTouch } from '../data/helper.js';

/* eslint-disable max-lines-per-function */

describe('Row drag', function() {

    let container;
    let grid;

    const data = Data.create();
    before(function() {
        container = $('<div/>').width(500).height(300).appendTo(document.body);
        grid = new Grid(container);
        // grid.bind('onRowDragged', (e, d) => {
        //     console.log('onRowDragged', d);
        // });
        // grid.bind('onRowDropped', (e, d) => {
        //     console.log('onRowDropped', d);
        // });
    });

    after(function() {
        grid.destroy();
        grid = null;
        container.remove();
        container = null;
    });

    it('Grid row drag 1 row height', async () => {
        grid.setOption({
            rowDragVisible: true,
            rowNumberVisible: true
        });

        grid.setData(data);
        grid.render();

        await delay();

        const fromIndex = 3;
        const rowHeight = grid.options.rowHeight;

        const rowItem = grid.getRowItem(fromIndex);
        assert.equal(rowItem.tg_index, fromIndex);

        const cellNode = grid.getCellNode(fromIndex, 0);
        assert(cellNode);

        const rect = cellNode.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        await page.mouse.move(x, y);
        await page.mouse.down();

        await page.mouse.move(x, y + 10);
        await page.mouse.move(x, y + rowHeight * 1.5);
        await page.mouse.up();

        await delay();

        assert.equal(rowItem.tg_index, fromIndex + 1);

    });

    it('Grid row drag 2 row height', async () => {

        const fromIndex = 3;
        const rowHeight = grid.options.rowHeight;

        const rowItem = grid.getRowItem(fromIndex);
        assert.equal(rowItem.tg_index, fromIndex);

        const cellNode = grid.getCellNode(fromIndex, 0);
        assert(cellNode);

        const rect = cellNode.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        await page.mouse.move(x, y);
        await page.mouse.down();

        await page.mouse.move(x, y + 10);
        await page.mouse.move(x, y + rowHeight * 2.5);
        await page.mouse.up();

        await delay();

        assert.equal(rowItem.tg_index, fromIndex + 2);

    });


    it('Grid row touch 1 row height', async () => {

        const fromIndex = 3;
        const rowHeight = grid.options.rowHeight;

        const rowItem = grid.getRowItem(fromIndex);
        assert.equal(rowItem.tg_index, fromIndex);

        const cellNode = grid.getCellNode(fromIndex, 0);
        assert(cellNode);

        const rect = cellNode.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        const node = cellNode.querySelector('.tg-row-drag-icon');

        triggerTouch(node, 'touchstart', x, y);
        await delay();
        triggerTouch(document.body, 'touchmove', x, y + 10);
        await delay();
        triggerTouch(document.body, 'touchmove', x, y + rowHeight * 1.5);
        await delay();
        triggerTouch(document.body, 'touchend', x, y + rowHeight * 1.5);

        await delay();

        assert.equal(rowItem.tg_index, fromIndex + 1);

    });

    it('Grid row touch auto scroll down', async () => {

        const fromIndex = 3;

        const rowItem = grid.getRowItem(fromIndex);
        assert.equal(rowItem.tg_index, fromIndex);

        const cellNode = grid.getCellNode(fromIndex, 0);
        assert(cellNode);

        const rect = cellNode.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        const node = cellNode.querySelector('.tg-row-drag-icon');

        triggerTouch(node, 'touchstart', x, y);
        await delay();
        triggerTouch(document.body, 'touchmove', x, y + 500);
        await delay();
        triggerTouch(document.body, 'touchend', x, y + 500);

        await delay();

        assert.equal(rowItem.tg_index, 11);

    });

    it('Grid row touch auto scroll up', async () => {

        const fromIndex = 11;

        const rowItem = grid.getRowItem(fromIndex);
        assert.equal(rowItem.tg_index, fromIndex);

        const cellNode = grid.getCellNode(fromIndex, 0);
        assert(cellNode);

        const rect = cellNode.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        const node = cellNode.querySelector('.tg-row-drag-icon');

        triggerTouch(node, 'touchstart', x, y);
        await delay();
        triggerTouch(document.body, 'touchmove', x, y - 500);
        await delay();
        triggerTouch(document.body, 'touchend', x, y - 500);

        await delay(200);

        assert.equal(rowItem.tg_index, 0);

    });

    it('Grid row drag helper branch: isDropIntoGroupFirstChild', function() {
        const oldIsEmptyGroup = grid.isEmptyGroup;

        assert.equal(grid.isDropIntoGroupFirstChild({
            tg_group: true
        }, false), false);

        assert.equal(grid.isDropIntoGroupFirstChild({
            tg_group: false
        }, true), false);

        const emptyGroup = {
            tg_group: true,
            collapsed: true,
            subs: []
        };
        grid.isEmptyGroup = () => true;
        assert.equal(grid.isDropIntoGroupFirstChild(emptyGroup, true), true);
        assert.equal(emptyGroup.collapsed, false);

        const expandedGroup = {
            tg_group: true,
            collapsed: false,
            subs: [{
                id: 1
            }]
        };
        grid.isEmptyGroup = () => false;
        assert.equal(grid.isDropIntoGroupFirstChild(expandedGroup, true), true);

        const collapsedGroup = {
            tg_group: true,
            collapsed: true,
            subs: [{
                id: 2
            }]
        };
        assert.equal(grid.isDropIntoGroupFirstChild(collapsedGroup, true), false);

        grid.isEmptyGroup = oldIsEmptyGroup;
    });

    it('Grid row drag helper branch: updateDragDropPosition/rowDragDropPositionHandler', function() {
        const a = {
            id: 'a'
        };
        const b = {
            id: 'b'
        };
        const c = {
            id: 'c'
        };

        const sameList = [a, b, c];
        const noChange = grid.updateDragDropPosition(sameList, sameList, 1, 1, b);
        assert.equal(typeof noChange, 'undefined');

        const moveInfo = grid.updateDragDropPosition(sameList, sameList, 0, 2, a);
        assert.equal(moveInfo.rowItem, a);
        assert.equal(sameList[0], b);
        assert.equal(sameList[1], c);
        assert.equal(sameList[2], a);

        const oldGetRowParentSubs = grid.getRowParentSubs;
        const oldIsDropIntoGroupFirstChild = grid.isDropIntoGroupFirstChild;

        const rowItem = {
            tg_sub_index: 0
        };
        const dragFrom = [rowItem, {
            id: 'x'
        }];
        const parentList = [{
            id: 'p0',
            tg_sub_index: 0
        }, {
            id: 'p1',
            tg_sub_index: 1
        }, {
            id: 'p2',
            tg_sub_index: 2
        }];

        grid.getRowParentSubs = (item) => {
            if (item === rowItem) {
                return dragFrom;
            }
            return parentList;
        };

        const groupDrop = {
            subs: [{
                id: 'g0'
            }],
            tg_sub_index: 0
        };
        grid.isDropIntoGroupFirstChild = () => true;
        const groupInfo = grid.rowDragDropPositionHandler(rowItem, groupDrop, true);
        assert.equal(groupInfo.dropInto, groupDrop.subs);
        assert.equal(groupInfo.dropIndex, 0);

        const rowA = {
            tg_sub_index: 0
        };
        const rowB = {
            tg_sub_index: 1
        };
        const rowC = {
            tg_sub_index: 2
        };
        const sameParent = [rowA, rowB, rowC];

        grid.getRowParentSubs = () => sameParent;
        grid.isDropIntoGroupFirstChild = () => false;
        const sameParentInfo = grid.rowDragDropPositionHandler(rowA, rowC, false);
        assert.equal(sameParentInfo.dropIndex, 1);

        const sameParentInfoBottom = grid.rowDragDropPositionHandler(rowA, rowC, true);
        assert.equal(sameParentInfoBottom.dropIndex, 2);

        grid.getRowParentSubs = oldGetRowParentSubs;
        grid.isDropIntoGroupFirstChild = oldIsDropIntoGroupFirstChild;
    });

});
