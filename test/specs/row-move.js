import { Grid, $ } from '../../src/index.js';

/* eslint-disable max-lines-per-function */
describe('Row move', function() {

    let container;
    let grid;

    const getData = function(tree) {
        const data = {
            'columns': [{
                'id': 'name',
                'name': 'Name'
            }, {
                'id': 'id',
                'name': 'Id'
            }],
            'rows': []
        };

        let i = 0;
        while (i < 10) {
            const row = {
                id: `${i}`,
                name: `Name ${i}`
            };
            if (tree && i === 3) {
                row.subs = [{
                    id: `${i}-1`,
                    name: `Name ${i}-1`
                }, {
                    id: `${i}-2`,
                    name: `Name ${i}-2`
                }, {
                    id: `${i}-3`,
                    name: `Name ${i}-3`
                }];
            }
            data.rows.push(row);
            i += 1;
        }

        return data;
    };
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

    const getRowsIds = function(g) {
        const rows = g.getViewRows();
        const ids = rows.map((row) => row.id);
        return ids.join(',');
    };

    it('Grid move flat rows, init', function(done) {
        grid.setOption({
            rowMoveCrossLevel: false,
            selectVisible: true
        });
        grid.setData(getData());
        grid.once('onFirstUpdated', function() {
            assert.equal(getRowsIds(grid), '0,1,2,3,4,5,6,7,8,9');
            done();
        });
        grid.render();
    });

    // move row list
    it('Grid move flat rows, single, moveRowsUp', function(done) {
        grid.once('onRowMoved', function(e, d) {
            assert.equal(d.length, 1);
            assert.equal(d[0].id, '8');
            assert.equal(getRowsIds(grid), '0,1,2,3,4,5,6,8,7,9');
            done();
        });
        grid.moveRowsUp('8');
    });

    it('Grid move flat rows, single, moveRowsDown', function(done) {
        grid.once('onRowMoved', function(e, d) {
            assert.equal(d.length, 1);
            assert.equal(d[0].id, '8');
            assert.equal(getRowsIds(grid), '0,1,2,3,4,5,6,7,8,9');
            done();
        });
        grid.moveRowsDown('8');
    });

    it('Grid move flat rows, single, moveRowsToTop', function(done) {
        grid.once('onRowMoved', function(e, d) {
            assert.equal(d.length, 1);
            assert.equal(d[0].id, '8');
            assert.equal(getRowsIds(grid), '8,0,1,2,3,4,5,6,7,9');
            done();
        });
        grid.moveRowsToTop('8');
    });

    it('Grid move flat rows, single, moveRowsToBottom', function(done) {
        grid.once('onRowMoved', function(e, d) {
            assert.equal(d.length, 1);
            assert.equal(d[0].id, '8');
            assert.equal(getRowsIds(grid), '0,1,2,3,4,5,6,7,9,8');
            done();
        });
        grid.moveRowsToBottom('8');
    });

    it('Grid move flat rows, single, moveRowsUp reset', function(done) {
        grid.once('onRowMoved', function(e, d) {
            assert.equal(d.length, 1);
            assert.equal(d[0].id, '8');
            assert.equal(getRowsIds(grid), '0,1,2,3,4,5,6,7,8,9');
            done();
        });
        grid.moveRowsUp('8');
    });

    // move selected
    it('Grid move flat rows, single, moveSelectedRowsUp', function(done) {
        grid.once('onRowMoved', function(e, d) {
            assert.equal(d.length, 1);
            assert.equal(d[0].id, '8');
            assert.equal(getRowsIds(grid), '0,1,2,3,4,5,6,8,7,9');
            done();
        });
        grid.setRowSelected('8');
        assert.equal(grid.getSelectedRow().id, '8');
        grid.moveSelectedRowsUp();
    });

    it('Grid move flat rows, single, moveSelectedRowsDown', function(done) {
        grid.once('onRowMoved', function(e, d) {
            assert.equal(d.length, 1);
            assert.equal(d[0].id, '8');
            assert.equal(getRowsIds(grid), '0,1,2,3,4,5,6,7,8,9');
            done();
        });
        grid.moveSelectedRowsDown();
    });

    it('Grid move flat rows, single, moveSelectedRowsToTop', function(done) {
        grid.once('onRowMoved', function(e, d) {
            assert.equal(d.length, 1);
            assert.equal(d[0].id, '8');
            assert.equal(getRowsIds(grid), '8,0,1,2,3,4,5,6,7,9');
            done();
        });
        grid.moveSelectedRowsToTop();
    });

    it('Grid move flat rows, single, moveSelectedRowsToBottom', function(done) {
        grid.once('onRowMoved', function(e, d) {
            assert.equal(d.length, 1);
            assert.equal(d[0].id, '8');
            assert.equal(getRowsIds(grid), '0,1,2,3,4,5,6,7,9,8');
            done();
        });
        grid.moveSelectedRowsToBottom();
    });

    it('Grid move flat rows, single, moveSelectedRowsUp reset', function(done) {
        grid.once('onRowMoved', function(e, d) {
            assert.equal(d.length, 1);
            assert.equal(d[0].id, '8');
            assert.equal(getRowsIds(grid), '0,1,2,3,4,5,6,7,8,9');
            done();
        });
        grid.moveSelectedRowsUp();
    });

    // move with offset
    it('Grid move flat rows, single, invalid moveRows', function() {
        let res = grid.moveRows();
        assert.equal(res, false);
        res = grid.moveRows('111');
        assert.equal(res, false);
        res = grid.moveRows('8', 0);
        assert.equal(res, false);
        res = grid.moveRows(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], -1);
        assert.equal(res, false);
    });

    // move multiple rows
    it('Grid move flat rows, multiple rows, up', function(done) {
        grid.once('onRowMoved', function(e, d) {
            assert.equal(d.length, 2);
            assert.equal(d[0].id, '3');
            assert.equal(d[1].id, '8');
            assert.equal(getRowsIds(grid), '0,1,3,8,2,4,5,6,7,9');
            done();
        });
        grid.moveRows(['3', '8'], -1);
    });

    it('Grid move flat rows, multiple rows, down', function(done) {
        grid.once('onRowMoved', function(e, d) {
            assert.equal(d.length, 2);
            assert.equal(d[0].id, '3');
            assert.equal(d[1].id, '8');
            assert.equal(getRowsIds(grid), '0,1,2,3,8,4,5,6,7,9');
            done();
        });
        grid.moveRows(['3', '8'], 1);
    });

    it('Grid move flat rows, multiple rows, down order', function(done) {
        grid.once('onRowMoved', function(e, d) {
            assert.equal(d.length, 2);
            assert.equal(d[0].id, '8');
            assert.equal(d[1].id, '7');
            assert.equal(getRowsIds(grid), '0,1,2,3,4,5,6,9,8,7');
            done();
        });
        grid.moveRows(['7', '8'], 1);
    });

    // move tree
    it('Grid move tree rows, init', function(done) {
        grid.setOption({
            rowMoveCrossLevel: true,
            selectVisible: true
        });
        grid.setData(getData(true));
        grid.once('onFirstUpdated', function() {
            assert.equal(getRowsIds(grid), '0,1,2,3,3-1,3-2,3-3,4,5,6,7,8,9');
            done();
        });
        grid.render();
    });

    it('Grid move tree rows, single, up', function(done) {
        grid.once('onRowMoved', function(e, d) {
            assert.equal(d.length, 1);
            assert.equal(d[0].id, '3-2');
            assert.equal(getRowsIds(grid), '0,1,2,3,3-2,3-1,3-3,4,5,6,7,8,9');
            done();
        });
        grid.moveRows(['3-2'], -1);
    });

    it('Grid move tree rows, single, down', function(done) {
        grid.once('onRowMoved', function(e, d) {
            assert.equal(d.length, 1);
            assert.equal(d[0].id, '3-2');
            assert.equal(getRowsIds(grid), '0,1,2,3,3-1,3-2,3-3,4,5,6,7,8,9');
            done();
        });
        grid.moveRows(['3-2'], 1);
    });

    it('Grid move tree rows, single, up -2', function(done) {
        grid.once('onRowMoved', function(e, d) {
            assert.equal(d.length, 1);
            assert.equal(d[0].id, '3-2');
            assert.equal(getRowsIds(grid), '0,1,2,3-2,3,3-1,3-3,4,5,6,7,8,9');
            done();
        });
        grid.moveRows(['3-2'], -2);
    });

    it('Grid move tree rows, single, down 2 jump subs', function(done) {
        grid.once('onRowMoved', function(e, d) {
            assert.equal(d.length, 1);
            assert.equal(d[0].id, '3-2');
            assert.equal(getRowsIds(grid), '0,1,2,3,3-1,3-3,4,3-2,5,6,7,8,9');
            done();
        });
        grid.moveRows(['3-2'], 2);
    });

    it('Grid move tree rows, single down parent', function(done) {
        grid.setOption({
            rowMoveCrossLevel: true,
            selectVisible: true
        });
        grid.setData(getData(true));
        grid.once('onFirstUpdated', function() {
            assert.equal(getRowsIds(grid), '0,1,2,3,3-1,3-2,3-3,4,5,6,7,8,9');
            grid.once('onRowMoved', function(e, d) {
                assert.equal(d.length, 1);
                assert.equal(d[0].id, '3-3');
                assert.equal(getRowsIds(grid), '0,1,2,3,3-1,3-2,4,3-3,5,6,7,8,9');
                done();
            });
            grid.moveRows(['3-3'], 1);
        });
        grid.render();
    });

    it('Grid move tree rows, multiple, same level, down', function(done) {
        grid.setOption({
            rowMoveCrossLevel: true,
            selectVisible: true
        });
        grid.setData(getData(true));
        grid.once('onFirstUpdated', function() {
            assert.equal(getRowsIds(grid), '0,1,2,3,3-1,3-2,3-3,4,5,6,7,8,9');
            grid.once('onRowMoved', function(e, d) {
                assert.equal(d.length, 2);
                assert.equal(d[0].id, '3-1');
                assert.equal(d[1].id, '3-3');
                assert.equal(getRowsIds(grid), '0,1,2,3,3-2,4,3-1,3-3,5,6,7,8,9');
                done();
            });
            grid.moveRows(['3-1', '3-3'], 1);
        });
        grid.render();
    });

    it('Grid move tree rows, multiple, diff level, down', function(done) {
        grid.setOption({
            rowMoveCrossLevel: true,
            selectVisible: true
        });
        grid.setData(getData(true));
        grid.once('onFirstUpdated', function() {
            assert.equal(getRowsIds(grid), '0,1,2,3,3-1,3-2,3-3,4,5,6,7,8,9');
            grid.once('onRowMoved', function(e, d) {
                assert.equal(d.length, 2);
                assert.equal(d[0].id, '2');
                assert.equal(d[1].id, '3-3');
                assert.equal(getRowsIds(grid), '0,1,3,3-1,3-2,4,2,3-3,5,6,7,8,9');
                done();
            });
            grid.moveRows(['2', '3-3'], 1);
        });
        grid.render();
    });

    it('Grid move tree rows, multiple, diff level, up', function(done) {
        grid.setOption({
            rowMoveCrossLevel: true,
            selectVisible: true
        });
        grid.setData(getData(true));
        grid.once('onFirstUpdated', function() {
            assert.equal(getRowsIds(grid), '0,1,2,3,3-1,3-2,3-3,4,5,6,7,8,9');
            grid.once('onRowMoved', function(e, d) {
                assert.equal(d.length, 2);
                assert.equal(d[0].id, '2');
                assert.equal(d[1].id, '3-3');
                assert.equal(getRowsIds(grid), '0,2,3-3,1,3,3-1,3-2,4,5,6,7,8,9');
                done();
            });
            grid.moveRows(['2', '3-3'], -1);
        });
        grid.render();
    });

});
