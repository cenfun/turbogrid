import {
    Grid, $, CONST
} from '../../src/index.js';
import Data from '../data/data.js';
import { createContainer } from '../data/helper.js';

/* eslint-disable max-lines-per-function */
describe('Grid', function() {

    let container;
    let grid;

    const data = Data.create();
    before(function() {
        container = createContainer('500px', '200px');
        grid = new Grid(container);
    });
    after(function() {
        // console.log('after');
        grid.destroy();
        grid = null;
        container.remove();
        container = null;
    });

    it('Grid is true', function() {
        assert.ok(grid);
        assert.equal(grid.toString(), '[object Grid]');
    });

    it('Grid getAllThemes/getThemeOptions', function() {
        const allThemes = grid.getAllThemes();
        assert.equal(allThemes.length, 3);

        const themeOptions = grid.getThemeOptions('lightblue');

        assert.equal(themeOptions.rowHeight, 35);
        assert.equal(themeOptions.scrollbarSize, 10);
        assert.equal(themeOptions.scrollbarRound, true);
    });

    it('Grid mask', function() {
        grid.showMask();
        assert.equal(container.querySelector('.tg-mask').style.display, 'block');
        grid.hideMask();
        assert.equal(container.querySelector('.tg-mask').style.display, 'none');

        grid.showMask({
            opacity: 0.5
        });
        assert.equal(container.querySelector('.tg-mask').style.display, 'block');
        assert.equal(container.querySelector('.tg-mask').style.opacity, '0.5');
        grid.hideMask();
        assert.equal(container.querySelector('.tg-mask').style.display, 'none');
    });

    it('Grid loading', function() {
        grid.showLoading();
        assert.equal(container.querySelector('.tg-loading').style.display, 'block');
        grid.hideLoading();
        assert.equal(container.querySelector('.tg-loading').style.display, 'none');

        grid.setLoading();

        grid.setLoading('Loading ...');
        assert.equal(container.querySelector('.tg-loading').innerHTML, 'Loading ...');

        grid.setLoading(document.createElement('span'));
        assert.equal(container.querySelector('.tg-loading').innerHTML, '<span></span>');

        grid.setLoading(function() {
            return 'function loading';
        });
        assert.equal(container.querySelector('.tg-loading').innerHTML, 'function loading');

        grid.setLoading();
        const $defaultLoading = container.querySelector('.tg-loading').querySelector('.tg-loading-default');
        assert($defaultLoading);

        grid.setLoading({
            size: '50px',
            color: 'green',
            fast: true
        });

        assert.equal($defaultLoading.style.width, '50px');
        assert.equal($defaultLoading.style.height, '50px');
        assert.equal($defaultLoading.style.color, 'green');
        assert.equal($defaultLoading.classList.contains('tg-loading-fast'), true);

        grid.setLoading();
        assert.equal($defaultLoading.getAttribute('style'), '');
        assert.equal($defaultLoading.classList.contains('tg-loading-fast'), false);

        grid.showLoading();
        grid.hideLoading();
        grid.render();

        grid.destroy();
        grid.destroy();
        grid.resize();

        // after destroy call api without error

    });

    it('Grid onNextUpdated', function(done) {
        grid = new Grid(container);
        grid.setData(data);
        grid.onNextUpdated();
        grid.onNextUpdated(function() {
            assert.equal(this.getData().columns, data.columns, 'getData columns');
            assert.equal(this.getData().rows, data.rows, 'getData rows');

            assert(this.getRows(), 'getRows');
            assert(this.getColumns(), 'getColumns');
            assert(!this.getColumnItemById(), 'getColumnItemById');
            assert(!this.getRowItemById(), 'getRowItemById');

            done();
        });
        grid.render();
    });

    it('Grid getRowItem', function() {
        let r = grid.getRowItem(-1);
        assert.equal(r.name, '(sortFixed: top)');
        r = grid.getRowItem(-2);
        assert.equal(r.name, '(sortFixed: true)');
        r = grid.getRowItem(-3);
        assert.equal(r.id, 'blank');
    });

    it('Grid getColumnItem', function() {
        // -1 is tg-column-blank
        let c = grid.getColumnItem(-2);
        assert.equal(c.id, 'c5');
        c = grid.getColumnItem(-3);
        assert.equal(c.id, 'c4');
    });

    it('Grid getRowItem/getColumnItem with context object and invalid context', function() {
        const rowItem = grid.getRowItem(0);
        const columnItem = grid.getColumnItem(0);

        const rowContext = {
            tg_index: rowItem.tg_index
        };
        const columnContext = {
            tg_index: columnItem.tg_index
        };

        assert.equal(grid.getRowItem(rowContext), rowContext);
        assert.equal(grid.getColumnItem(columnContext), columnContext);

        assert.equal(typeof grid.getRowItem(), 'undefined');
        assert.equal(typeof grid.getColumnItem(), 'undefined');
    });

    it('Grid getRowItemById/getColumnItemById', function() {
        const row = grid.getRowItemById('row1');
        assert.equal(row.id, 'row1');

        const column = grid.getColumnItemById('name');
        assert.equal(column.id, 'name');
    });

    it('Grid getColumnsLength/getViewRowItem/getViewColumnItem', function() {
        const visibleLen = grid.getColumnsLength();
        const totalLen = grid.getColumnsLength(true);

        assert(totalLen >= visibleLen);

        const viewRowItem = grid.getViewRowItem(0);
        assert(viewRowItem);
        assert.equal(viewRowItem.tg_view_index, 0);

        const viewColumnItem = grid.getViewColumnItem(0);
        assert(viewColumnItem);
        assert.equal(viewColumnItem.tg_view_index, 0);
    });

    it('Grid getColumnsLength visible vs total after hide/show column', async () => {
        const localContainer = createContainer('500px', '200px');
        const localGrid = new Grid(localContainer);
        const localData = Data.create();
        localGrid.setData(localData);
        localGrid.render();

        await delay();

        const beforeVisibleLen = localGrid.getColumnsLength();
        localGrid.hideColumn('name');
        await delay();

        const hiddenVisibleLen = localGrid.getColumnsLength();
        const totalLen = localGrid.getColumnsLength(true);
        assert(totalLen > hiddenVisibleLen);
        assert(hiddenVisibleLen < beforeVisibleLen);

        localGrid.showColumn('name');
        await delay();
        const afterShowVisibleLen = localGrid.getColumnsLength();
        assert(afterShowVisibleLen > hiddenVisibleLen);
        assert(totalLen >= afterShowVisibleLen);

        localGrid.destroy();
        localContainer.remove();
    });

    it('Grid getViewRowItem/getViewColumnItem out of range', function() {
        const vr = grid.getViewRowItem(99999);
        const vc = grid.getViewColumnItem(99999);
        assert.equal(typeof vr, 'undefined');
        assert.equal(typeof vc, 'undefined');
    });

    it('Grid getRowItemBy/getColumnItemBy invalid value', function() {
        const rowByName = grid.getRowItemBy('name', 'Name1');
        assert.equal(rowByName.id, 'row1');

        const colByName = grid.getColumnItemBy('name', 'Name');
        assert.equal(colByName.id, 'name');

        assert.equal(typeof grid.getRowItemBy('id', null), 'undefined');
        assert.equal(typeof grid.getColumnItemBy('id', null), 'undefined');
    });

    it('Grid setRowState', function() {
        const rowItem = grid.getRowItem('row1');
        assert(rowItem);

        grid.setRowState('row1', 'warning', true);
        const rowNode = container.querySelector(`.tg-row[row='${rowItem.tg_view_index}']`);
        assert.equal(rowNode.classList.contains('tg-warning'), true);

        grid.setRowState('row1', 'warning', false);
        assert.equal(rowNode.classList.contains('tg-warning'), false);
    });

    it('Grid setRowState invalid row', function() {
        const res = grid.setRowState('row_not_exists', 'warning', true);
        assert.equal(res, grid);
    });

    it('Grid isColumnSortable/isColumnResizable branches', function() {
        const normalColumn = grid.getColumnItem('name');
        assert.equal(grid.isColumnSortable(normalColumn), true);
        assert.equal(grid.isColumnResizable(normalColumn), true);

        const groupColumn = grid.getColumnItem('subs');
        assert.equal(grid.isColumnSortable(groupColumn), false);
        assert.equal(grid.isColumnResizable(groupColumn), false);

        assert.equal(grid.isColumnSortable(null), false);
        assert.equal(grid.isColumnResizable(null), false);

        assert.equal(grid.isColumnSortable({}), false);
        assert.equal(grid.isColumnResizable({
            resizable: false
        }), false);
    });

    it('Grid setDataSnapshot clean tg_ props and convert number', function() {
        const snapshotData = Data.create();
        snapshotData.rows[0].tg_custom = 'tg';
        snapshotData.columns[2].subs[0].tg_custom = 'tg';
        snapshotData.rows[0].number = '123';

        grid.setDataSnapshot(snapshotData);

        const d = grid.getData();
        assert.equal(typeof d.rows[0].tg_custom, 'undefined');
        assert.equal(typeof d.columns[2].subs[0].tg_custom, 'undefined');
        assert.equal(d.rows[0].number, 123);
    });

    it('Grid setDataSnapshot invalid data', function() {
        grid.setDataSnapshot(null);
        const d = grid.getData();
        assert.equal(d.columns.length, 0);
        assert.equal(d.rows.length, 0);
    });

    it('Grid setDataSnapshot with null items', function() {
        const snapshotData = {
            columns: [
                null,
                {
                    id: 'number',
                    name: 'Number',
                    type: 'number'
                }
            ],
            rows: [
                null,
                {
                    id: 'row1',
                    number: '7'
                }
            ]
        };

        grid.setDataSnapshot(snapshotData);
        const d = grid.getData();

        assert.equal(typeof d.columns[0], 'object');
        assert.equal(typeof d.rows[0], 'object');
        assert.equal(d.rows[1].number, 7);
    });

    it('Grid getItemSnapshot', function(done) {
        grid = new Grid(container);
        grid.setData(data);

        grid.onNextUpdated(function() {

            const rowItem = grid.getRowItem(0);
            // console.log(rowItem);
            assert.equal(rowItem.tg_index, 0);
            const eItem = grid.getItemSnapshot(rowItem);
            assert.equal(typeof eItem.tg_index, 'undefined');

            done();
        });
        grid.render();
    });

    it('Grid no header', function(done) {
        grid.setData(data);
        grid.setOption({
            headerVisible: false
        });

        grid.once('onFirstUpdated', function() {
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            const hh = grid.headerHeight;
            assert.equal(hh, 0);
            const bh = grid.bodyHeight;
            assert.equal(bh, containerHeight);
            const bw = grid.bodyWidth;
            assert.equal(bw, containerWidth);
            done();
        });
        grid.render();
    });

    it('Grid setOption/getOption', function() {

        grid.setOption('key1', 'value1');

        assert.equal(grid.getOption('key1'), 'value1');
        assert.equal(grid.getOption().key1, 'value1');

    });

    it('Grid setOption/getOption before render', async () => {
        const localContainer = createContainer('500px', '200px');
        const localGrid = new Grid(localContainer);

        assert.equal(typeof localGrid.getOption(), 'undefined');
        assert.equal(typeof localGrid.getOption('key_pre'), 'undefined');

        localGrid.setOption('key_pre', 'value_pre');
        localGrid.setData(data);
        localGrid.render();

        await delay();

        assert.equal(localGrid.getOption('key_pre'), 'value_pre');

        localGrid.destroy();
        localContainer.remove();
    });

    it('Grid destroy()', async () => {
        grid.setOption({});
        grid.setData(data);
        grid.render();

        await delay();

        const selector = `.${CONST.NS}`;
        const id = grid.id;
        const gridContainer = container.querySelector(selector);

        assert.equal(gridContainer.classList.contains(id), true);
        assert.equal(gridContainer.getAttribute('id'), id);

        // console.log('onFirstUpdated before destroy');
        grid.destroy();

        assert.equal(document.querySelector(selector), null);
        assert.equal(container.innerHTML, '');

        // console.log('onFirstUpdated before done');

    });

    it('Grid frozen check', function(done) {

        // create new
        grid = new Grid(container);
        grid.setData(data);
        grid.setOption({
            frozenRow: 0,
            frozenColumn: 0
        });
        grid.once('onFirstUpdated', function() {
            const pwl = grid.paneWidthL;
            assert.equal(pwl, 230);
            const pwr = grid.paneWidthR;
            assert.equal(pwr, 500 - 230);

            const rh = grid.options.rowHeight;
            const pht = grid.paneHeightT;
            assert.equal(pht, rh);

            const ch = grid.containerHeight;
            const hh = grid.headerHeight;

            const phb = grid.paneHeightB;
            assert.equal(phb, ch - hh - rh);

            done();
        });
        grid.render();
    });

    it('Grid css style', function(done) {
        data.rows[0].classMap = 'rClass';
        data.columns[0].classMap = 'cClass';
        data.columns[0].headerClassMap = 'hClass';
        grid.setData(data);
        grid.once('onFirstUpdated', function() {

            assert.equal(container.querySelector('.tg-row[row="0"]').classList.contains('rClass'), true);

            const cellNode = grid.getCellNode(0, 0);
            assert.equal($(cellNode).hasClass('cClass'), true);

            const columnItem = grid.getColumnItem(0);

            const $headerNode = $(grid.getHeaderItemNode(columnItem));
            assert.equal($headerNode.hasClass('hClass'), true);

            done();
        });
        grid.render();
    });


    it('Grid formatter setFormatter(obj)', function(done) {
        grid.setFormatter({
            iconInfo: function(value, rowItem, columnItem, cellNode) {
                return '<span class="ic-info-sm"></span>';
            }
        });
        data.columns[1].type = 'iconInfo';
        grid.setData(data);
        grid.once('onFirstUpdated', function() {
            const cellNode = grid.getCellNode(0, 1);
            assert.equal($(cellNode).find('span').hasClass('ic-info-sm'), true);
            done();
        });
        grid.render();
    });

    it('Grid formatter setFormatter(key, value)', function() {
        const myFormatter = function() {
            return 'myFormatter';
        };
        grid.setFormatter('myFormatter', myFormatter);
        assert.equal(grid.formatters.iconInfo(), '<span class="ic-info-sm"></span>');
        assert.equal(grid.formatters.myFormatter, myFormatter);
    });

    it('Grid formatter setFormatter(key, callback)', function() {
        const callback = function() {
            return 'callback';
        };
        grid.setFormatter('callback', callback);
        assert.equal(grid.formatters.iconInfo(), '<span class="ic-info-sm"></span>');
        assert.equal(grid.formatters.myFormatter(), 'myFormatter');
        assert.equal(grid.formatters.callback, callback);
    });

    it('Grid frozen column with private columns', async () => {
        grid.destroy();
        grid = new Grid(container);
        grid.setOption({
            frozenColumn: 0,
            frozenRow: -1,
            selectVisible: true,
            rowDragVisible: true,
            rowNumberVisible: true
        });
        grid.setData(data);
        grid.render();
        await delay();

        // frozenColumn should be adjusted for private columns (select + drag + number = +3)
        assert.equal(grid.frozenInfo.column, 3);
        assert.equal(grid.frozenInfo.columns, 4);
    });

    it('Grid scrollbar touch mode', async () => {
        grid.destroy();
        grid = new Grid(container);
        grid.setOption({
            scrollbarType: 'touch'
        });
        grid.setData(data);
        grid.render();
        await delay();

        assert.equal(grid.options.scrollbarFade, true);
        assert.equal(grid.options.scrollbarRound, true);
        assert.equal(grid.options.scrollbarSize, 6);
    });

    it('Grid theme options', async () => {
        grid.destroy();
        grid = new Grid(container);
        grid.setOption({
            theme: 'dark'
        });
        grid.setData(data);
        grid.render();
        await delay();

        assert.ok(container.querySelector('.tg-dark'));
    });

    it('Grid cell click', async () => {
        grid.destroy();

        grid = new Grid(container);
        grid.setOption({});
        grid.setData(data);
        grid.render();

        await delay();

        let clickData;
        grid.bind('onClick', function(e, d) {
            clickData = d;
        });

        grid.getCellNode(0, 0).click();

        assert(clickData);
        assert.equal(clickData.rowItem.tg_index, 0);
        assert.equal(clickData.columnItem.tg_index, 0);

    });

});
