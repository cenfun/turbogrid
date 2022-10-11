import { Grid, $ } from '../../src/index.js';

describe('Render viewport', function() {

    let container;
    let grid;
    before(function() {
        container = $('<div/>').width(500).height(500).appendTo(document.body);
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
        const totalColumns = 100;
        const totalRows = 1000;

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


    it('Grid render viewport without frozen', function(done) {

        grid.setOption({});
        grid.setData(getData());
        grid.once('onFirstUpdated', function() {

            const viewport = this.getViewport();
            const hh = this.headerHeight;

            //20 is distance for scroll render cache
            const distance = 20;

            //from 0
            const rowLen = Math.ceil((500 - hh + distance) / this.option.rowHeight);
            assert.equal(viewport.rows.length, rowLen);

            const colLen = Math.ceil((500 + distance) / colWidth);
            assert.equal(viewport.columns.length, colLen);

            done();
        });
        grid.render();

    });

    it('Grid render viewport without frozen scroll to 10, 10', function(done) {

        grid.once('onUpdated', function() {

            const viewport = this.getViewport();
            const hh = this.headerHeight;

            //20 is distance for scroll render cache
            const distance = 20;

            //not from 0
            const rowLen = Math.ceil((distance + 500 - hh + distance) / this.option.rowHeight);
            assert.equal(viewport.rows.length, rowLen);

            //both left and right have distance so plus 1
            const colLen = Math.ceil((distance + 500 + distance) / colWidth) + 1;
            assert.equal(viewport.columns.length, colLen);

            done();
        });

        grid.scrollToCell(10, 10);


    });

    it('Grid render viewport with frozen', function(done) {

        grid.setOption({
            frozenColumn: 0,
            frozenRow: 1
        });
        grid.setData(getData());
        grid.once('onFirstUpdated', function() {

            const viewport = this.getViewport();
            const hh = this.headerHeight;

            //20 is distance for scroll render cache
            const distance = 20;

            const rowLen = Math.ceil((500 - hh + distance) / this.option.rowHeight);
            assert.equal(viewport.rows.length, rowLen);

            const colLen = Math.ceil((500 + distance) / colWidth);
            assert.equal(viewport.columns.length, colLen);

            done();
        });
        grid.render();

    });

    it('Grid render viewport with frozen scroll to 10, 10', function(done) {

        grid.once('onUpdated', function() {

            const viewport = this.getViewport();
            const hh = this.headerHeight;

            //20 is distance for scroll render cache
            const distance = 20;

            //not from 0
            const rowLen = Math.ceil((distance + 500 - hh + distance) / this.option.rowHeight);
            assert.equal(viewport.rows.length, rowLen);

            //both left and right have distance so plus 1
            const colLen = Math.ceil((distance + 500 + distance) / colWidth) + 1;
            assert.equal(viewport.columns.length, colLen);

            done();
        });

        grid.scrollToCell(10, 10);

    });


});
