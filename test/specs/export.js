import { Grid, $ } from '../../src/index.js';
import Data from '../data/data.js';
describe('Export', function() {

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

    it('exportData() check rows and columns length should be same', function(done) {
        const data = Data.create();
        grid.setData(data);
        grid.setOption({
            frozenRow: 0
        });
        grid.once('onFirstUpdated', function() {
            const exportData = grid.exportData();

            // console.log("exportData.rows.length: " + exportData.rows.length);
            // console.log("data.rows.length: " + data.rows.length);
            assert.equal(exportData.rows.length, data.rows.length);

            // console.log("exportData.columns.length: " + exportData.columns.length);
            // console.log("data.columns.length: " + data.columns.length);
            // exported columns without "tg-cell-blank" so add 1
            assert.equal(exportData.columns.length, data.columns.length);

            done();
        });
        grid.render();
    });

    it('exportData() with exportable false', function(done) {
        const data = Data.create();
        // not for exportable false but true
        data.rows[2].exportable = false;
        data.rows[3].exportable = true;
        data.columns[2].exportable = false;
        data.columns[3].exportable = false;
        // for null
        data.rows[4] = null;
        grid.setDataSnapshot(data);
        grid.setOption({
            frozenRow: 0
        });
        grid.once('onFirstUpdated', function() {
            const exportData = grid.exportData();
            assert.equal(exportData.rows.length, data.rows.length - 1);
            // exported columns without "tg-cell-blank" so add 1
            assert.equal(exportData.columns.length, data.columns.length - 2);
            done();
        });
        grid.render();
    });

    it('exportData(keysSettings) tg_ true', function(done) {

        const exportData = grid.exportData({
            'tg_frozen': true
        });
        assert.equal(exportData.rows[0].tg_frozen, true);
        assert.equal(exportData.columns[0].minWidth, 120);
        done();

    });

    it('exportData(keysSettings) false', function(done) {

        const exportData = grid.exportData({
            'tg_frozen': true,
            'minWidth': false
        });
        assert.equal(exportData.rows[0].tg_frozen, true);
        assert.equal(typeof exportData.columns[0].minWidth, 'undefined');
        done();

    });

});
