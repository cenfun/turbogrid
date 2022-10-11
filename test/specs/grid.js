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
        //console.log('after');
        grid.destroy();
        grid = null;
        container.remove();
        container = null;
    });

    it('Grid is true', function() {
        assert.ok(grid);
        assert.equal(grid.toString(), '[object Grid]');
    });

    it('Grid setOption/getOption', function() {
        grid.setOption({
            option1: 'option1'
        });
        assert.equal(grid.getOption().option1, 'option1');
        grid.setOption({
            option2: 'option2'
        });
        assert.equal(typeof grid.getOption().option1, 'undefined');
    });

    it('Grid getAllThemes/getThemeOptions', function() {
        const allThemes = grid.getAllThemes();
        assert.equal(allThemes.length, 3);

        const themeOption = grid.getDefaultOption({
            theme: 'lightblue'
        });

        assert.equal(themeOption.rowHeight, 35);
        assert.equal(themeOption.scrollbarSize, 10);
        assert.equal(themeOption.scrollbarRound, true);

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
        const defaultLoading = container.querySelector('.tg-loading').querySelector('.tg-loading-default');
        assert(defaultLoading);

        grid.setLoading({
            size: '50px',
            color: 'green',
            fast: true
        });

        assert.equal(defaultLoading.style.width, '50px');
        assert.equal(defaultLoading.style.height, '50px');
        assert.equal(defaultLoading.style.color, 'green');
        assert.equal(defaultLoading.classList.contains('tg-loading-fast'), true);

        grid.setLoading();
        assert.equal(defaultLoading.getAttribute('style'), '');
        assert.equal(defaultLoading.classList.contains('tg-loading-fast'), false);

        grid.showLoading();
        grid.hideLoading();
        grid.render();

        grid.destroy();
        grid.destroy();
        grid.resize();

        //after destroy call api without error

    });

    it('Grid onNextUpdated', function(done) {
        grid = new Grid(container);
        grid.setData(data);
        grid.onNextUpdated();
        grid.onNextUpdated(function() {
            assert.equal(this.getData(), data, 'getData');

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
        //-1 is tg-column-blank
        let c = grid.getColumnItem(-2);
        assert.equal(c.id, 'c5');
        c = grid.getColumnItem(-3);
        assert.equal(c.id, 'c4');
    });

    it('Grid getItemSnapshot', function(done) {
        grid = new Grid(container);
        grid.setData(data);

        grid.onNextUpdated(function() {

            const rowItem = grid.getRowItem(0);
            //console.log(rowItem);
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

    it('Grid destroy()', function(done) {
        grid.setOption({});
        grid.setData(data);
        grid.once('onFirstUpdated', function() {

            const selector = `.${CONST.NS}`;
            const id = grid.id;
            const gridContainer = container.querySelector(selector);

            assert.equal(gridContainer.classList.contains(id), true);
            assert.equal(gridContainer.getAttribute('id'), id);

            //console.log('onFirstUpdated before destroy');
            grid.destroy();

            assert.equal(document.querySelector(selector), null);
            assert.equal(container.innerHTML, '');

            //console.log('onFirstUpdated before done');

            done();

            //console.log('onFirstUpdated after done');
        });
        grid.render();
    });

    it('Grid frozen check', function(done) {

        //create new
        grid = new Grid(container);
        grid.setData(data);
        grid.setOption({
            frozenRow: 0,
            frozenColumn: 0
        });
        grid.once('onFirstUpdated', function() {
            const pwl = grid.paneWidthL;
            assert.equal(pwl, 300);
            const pwr = grid.paneWidthR;
            assert.equal(pwr, 200);

            const rh = grid.option.rowHeight;
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

    it('Grid formatter setFormatter(objOverride)', function() {
        const callbackOverride = function() {
            return 'callbackOverride';
        };
        grid.setFormatter({
            callback: callbackOverride
        });
        assert.equal(typeof grid.formatters.iconInfo, 'undefined');
        assert.equal(typeof grid.formatters.myFormatter, 'undefined');
        assert.equal(grid.formatters.callback, callbackOverride);
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
