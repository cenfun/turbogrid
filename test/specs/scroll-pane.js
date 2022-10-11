import { Grid, $ } from '../../src/index.js';
describe('ScrollPane', function() {

    let container;
    let grid;
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

    const colWidth = 100;

    const getData = function() {
        const totalColumns = 4;
        const totalRows = 13;

        const columns = [];
        const appendColumns = function(parent) {
            for (let i = 0; i < totalColumns; i++) {
                const column = {
                    id: `c${i}`,
                    name: `C ${i}`,
                    width: colWidth
                };
                columns.push(column);
            }
        };
        appendColumns(columns);

        const rows = [];
        const appendRows = function(parent) {
            for (let i = 0; i < totalRows; i++) {
                const row = {
                    name: `R ${i}`
                };
                rows.push(row);
            }
        };
        appendRows(rows);

        return {
            columns: columns,
            rows: rows
        };
    };

    //container: 500 x 500
    //width = 100 * 4 = 400
    //headerHeight: 49

    const getScrollState = function(g) {
        const hhs = g.hasHScroll;
        const hvs = g.hasVScroll;
        const hsp = g.scrollPaneHidden;
        const state = {
            hhs: hhs,
            hvs: hvs,
            hsp: hsp
        };
        console.log(`hasHScroll:${state.hhs}`, `hasVScroll:${state.hvs}`, `scrollPaneHidden:${state.hsp}`);
        return state;
    };

    const getScrollSize = function() {
        let size = '';
        size += container.find('.tg-pane-top-left').find('.tg-scrollbar-h').length;
        size += ',';
        size += container.find('.tg-pane-top-left').find('.tg-scrollbar-v').length;
        size += ',';
        size += container.find('.tg-pane-top-right').find('.tg-scrollbar-h').length;
        size += ',';
        size += container.find('.tg-pane-top-right').find('.tg-scrollbar-v').length;
        size += ',';
        size += container.find('.tg-pane-bottom-left').find('.tg-scrollbar-h').length;
        size += ',';
        size += container.find('.tg-pane-bottom-left').find('.tg-scrollbar-v').length;
        size += ',';
        size += container.find('.tg-pane-bottom-right').find('.tg-scrollbar-h').length;
        size += ',';
        size += container.find('.tg-pane-bottom-right').find('.tg-scrollbar-v').length;
        console.log('tlh,tlv,trh,trv,blh,blv,brh,brv', size);
        return size;
    };

    it('Grid scrollPane without frozen', function(done) {
        container.width(500).height(500);
        grid.setOption({});
        grid.setData(getData());
        grid.once('onFirstUpdated', function() {
            const hh = grid.headerHeight;
            console.log('headerHeight', hh);
            const state = getScrollState(grid);
            assert.equal(state.hhs, false);
            assert.equal(state.hvs, false);
            assert.equal(state.hsp, false);


            assert.equal(grid.getScrollPaneWidth(), 500);
            assert.equal(grid.getScrollPaneHeight(), 500 - hh);


            const size = getScrollSize();
            assert.equal(size, '0,0,0,0,0,0,0,0');

            done();
        });
        grid.render();
    });

    it('Grid scrollPane without frozen resize', function(done) {
        container.width(300).height(300);
        grid.once('onUpdated', function() {
            const state = getScrollState(grid);
            assert.equal(state.hhs, true);
            assert.equal(state.hvs, true);
            assert.equal(state.hsp, false);

            const size = getScrollSize();
            assert.equal(size, '1,1,0,0,0,0,0,0');

            done();
        });
        grid.resize();
    });

    it('Grid scrollPane with frozen', function(done) {
        container.width(500).height(500);
        grid.setOption({
            frozenColumn: 0,
            frozenRow: 1
        });
        grid.setData(getData());
        grid.once('onFirstUpdated', function() {
            const hh = grid.headerHeight;
            console.log('headerHeight', hh);
            const state = getScrollState(grid);
            assert.equal(state.hhs, false);
            assert.equal(state.hvs, false);
            assert.equal(state.hsp, false);

            const size = getScrollSize();
            assert.equal(size, '0,0,0,0,0,0,0,0');

            done();
        });
        grid.render();
    });

    it('Grid scrollPane with frozen resize', function(done) {
        container.width(300).height(300);
        grid.once('onUpdated', function() {
            const state = getScrollState(grid);
            assert.equal(state.hhs, true);
            assert.equal(state.hvs, true);
            assert.equal(state.hsp, false);

            const size = getScrollSize();
            assert.equal(size, '0,0,0,0,0,0,1,1');

            done();
        });
        grid.resize();
    });

    it('Grid scrollPane with frozen resize to scrollPaneHidden', function(done) {
        //mini width 30
        const spmw = grid.option.scrollPaneMinWidth;
        container.width(100 + spmw - 1).height(300);
        grid.once('onUpdated', function() {
            const state = getScrollState(grid);
            assert.equal(state.hhs, false);
            assert.equal(state.hvs, true);
            assert.equal(state.hsp, true);

            const size = getScrollSize();
            assert.equal(size, '0,0,0,0,0,0,1,1');

            done();
        });
        grid.resize();
    });

    it('Grid scrollPane with frozen resize to scrollPaneHidden and show frozen scroll', function(done) {
        container.width(99).height(300);
        grid.once('onUpdated', function() {
            const state = getScrollState(grid);
            assert.equal(state.hhs, true);
            assert.equal(state.hvs, true);
            assert.equal(state.hsp, true);

            const size = getScrollSize();
            assert.equal(size, '0,0,0,0,1,0,0,1');

            done();
        });
        grid.resize();
    });

    it('Grid scrollPane with frozen resize to scrollPaneHidden and show frozen scroll, no v scroll', function(done) {
        const hh = grid.headerHeight;

        const height = grid.option.rowHeight * 13;
        container.width(99).height(height + 15 + hh);
        grid.once('onUpdated', function() {
            const state = getScrollState(grid);
            assert.equal(state.hhs, true);
            assert.equal(state.hvs, false);
            assert.equal(state.hsp, true);

            const size = getScrollSize();
            assert.equal(size, '0,0,0,0,1,0,0,0');

            done();
        });
        grid.resize();
    });

});
