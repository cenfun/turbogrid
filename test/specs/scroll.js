import { Grid, $ } from '../../src/index.js';
import Data from '../data/data.js';
/* eslint-disable max-lines-per-function */
describe('Scroll', function() {
    let container;
    let grid;

    const data = Data.create();
    before(function() {
        container = $('<div/>').width(500).height(200).appendTo(document.body);
        grid = new Grid(container);
    });
    after(function() {
        grid.destroy();
        grid = null;
        container.remove();
        container = null;
    });

    it('Grid scroll init', function(done) {
        grid.setOption({});
        grid.setData(data);
        grid.once('onFirstUpdated', function() {
            const st = grid.scrollTop;
            assert.equal(st, 0);
            done();
        });
        grid.render();
    });

    it('Grid scroll to row', function(done) {
        grid.once('onUpdated', function() {

            const st = grid.scrollTop;

            const rowItem = grid.getRowItem('row2');
            const rowTop = grid.options.rowHeight * rowItem.tg_index;

            assert.equal(st, rowTop);

            done();
        });

        grid.scrollToRow('row2');
    });

    it('Grid scroll to row first', function(done) {
        grid.once('onUpdated', function() {

            const st = grid.scrollTop;

            assert.equal(st, 0);

            done();
        });

        grid.scrollToFirstRow();
    });

    it('Grid scroll to row last', function(done) {
        grid.once('onUpdated', function() {

            const st = grid.scrollTop;

            const rowItem = grid.getRowItem(-1);
            const rowTop = grid.options.rowHeight * rowItem.tg_index;

            assert.ok(st < rowTop);

            done();
        });

        grid.scrollToLastRow();
    });

    it('Grid scroll to column', function(done) {

        grid.once('onUpdated', function() {

            const sl = grid.scrollLeft;

            const columnItem = grid.getColumnItem('value');

            assert.equal(sl, columnItem.tg_left);

            done();
        });

        grid.scrollToColumn('value');

    });

    it('Grid scroll to column first', function(done) {

        grid.once('onUpdated', function() {

            const sl = grid.scrollLeft;

            assert.equal(sl, 0);

            done();
        });

        grid.scrollToFirstColumn();

    });

    it('Grid scroll to column last', async () => {

        grid.scrollToLastColumn();
        await delay();

        const sl = grid.scrollLeft;
        const columnItem = grid.blankColumn;
        assert.ok(sl < columnItem.tg_left);

    });

    it('Grid scroll to column last and end', function(done) {

        grid.once('onUpdated', function() {

            const sl = grid.scrollLeft;

            const columnItem = grid.blankColumn;

            assert.ok(sl < columnItem.tg_left);

            done();
        });

        grid.scrollToLastColumn(true);

    });

    it('Grid scroll to cell', function(done) {

        grid.once('onUpdated', function() {

            const sl = grid.scrollLeft;
            const st = grid.scrollTop;

            assert.equal(sl, 0);
            assert.equal(st, 0);

            done();
        });

        grid.scrollToCell(0, 0);

    });


    it('Grid scroll row into view', function(done) {

        grid.once('onUpdated', function() {
            const st = grid.scrollTop;

            const rowItem = grid.getRowItem('row3');
            const rowTop = grid.options.rowHeight * rowItem.tg_index;

            const svh = grid.getScrollViewHeight();

            assert.equal(st, rowTop - svh + grid.options.rowHeight);

            done();
        });

        grid.scrollRowIntoView('row3');

    });

    it('Grid scroll column into view', function(done) {

        grid.once('onUpdated', function() {
            const sl = grid.scrollLeft;

            const columnItem = grid.getColumnItem('c1');

            const svw = grid.getScrollViewWidth();

            assert.equal(sl, columnItem.tg_left - svw + columnItem.tg_width);

            done();
        });

        grid.scrollColumnIntoView('c1');

    });

    it('Grid scroll cell into view', function(done) {

        grid.once('onUpdated', function() {
            const sl = grid.scrollLeft;
            const st = grid.scrollTop;

            assert.equal(sl, 0);
            assert.equal(st, 0);

            done();
        });

        grid.scrollCellIntoView(0, 0);

    });


    it('Grid scroll to cell', async () => {

        grid.scrollToCell(5, 'number');

        await delay();

        const sl = grid.scrollLeft;
        const st = grid.scrollTop;
        const rh = grid.options.rowHeight;
        assert.equal(sl, 300 + 81);
        assert.equal(st, 5 * rh);

    });

    it('Grid change container and keep scroll position and css rule should works too', async () => {

        container.appendTo(document.body);
        grid.resize();

        await delay();

        const sl = grid.scrollLeft;
        const st = grid.scrollTop;
        const rh = grid.options.rowHeight;
        assert.equal(sl, 300 + 81);
        assert.equal(st, 5 * rh);

        assert.equal(container.find('.tg-body-top-left').css('left'), '-381px');
        assert.equal(container.find('.tg-body-top-left').css('top'), `-${5 * rh}px`);

        //check css rule
        const cell = grid.getCellNode(6, 'c2');
        assert.equal(cell.innerHTML, '—');
        const w = window.getComputedStyle(cell).width;
        assert.equal(w, '81px');
        const l = window.getComputedStyle(cell).left;
        assert.equal(l, '705px');


    });


    it('Grid setScrollLeft', function(done) {

        grid.once('onUpdated', function() {
            assert.equal(grid.scrollLeft, 10);
            grid.setScrollLeft(10);
            assert.equal(grid.scrollLeft, 10);
            done();
        });

        grid.setScrollLeft(10);

    });

    it('Grid setScrollTop', function(done) {

        grid.once('onUpdated', function() {
            assert.equal(grid.scrollTop, 10);
            grid.setScrollTop(10);
            assert.equal(grid.scrollTop, 10);
            done();
        });

        grid.setScrollTop(10);

    });

    it('Grid setScroll', function(done) {

        grid.once('onUpdated', function() {
            assert.equal(grid.scrollLeft, 10);
            assert.equal(grid.scrollTop, 20);
            grid.setScroll(10, 20);
            assert.equal(grid.scrollLeft, 10);
            assert.equal(grid.scrollTop, 20);
            done();
        });

        grid.setScroll(10, 20);

    });

});
