import { Grid } from '../../src/index.js';
import Data from '../data/data.js';
import { createContainer } from '../data/helper.js';

describe('Row height', function() {
    let container;
    let grid;

    const data = Data.create();
    data.options = null;
    data.columns.splice(1, 0, {
        id: 'title',
        name: 'Title',
        width: 150,
        maxWidth: 2000
    });

    const longText = 'This is long text. This is long text. This is long text. This is long text.';

    data.rows.unshift({
        id: 'total',
        name: 'Total',
        title: longText
    });

    data.rows[2].title = longText;
    data.rows[3].title = `<details>
                            <summary>this is summary, click to show details</summary>
                            <p>${longText}</p>
                        </details>`;
    for (let i = 0; i < 30; i++) {
        data.rows.push({
            name: `row added ${i}`
        });
    }

    before(function() {
        container = createContainer('500px', '500px');
        grid = new Grid(container);
    });
    after(function() {
        grid.destroy();
        grid = null;
        container.remove();
        container = null;
    });

    const defaultRowHeight = 36;

    it('check row height: init', async () => {

        grid.setData(data);
        grid.setOption({
            frozenRow: 0,

            rowHeight: defaultRowHeight,

            textSelectable: true,
            cellResizeObserver: function(rowItem, columnItem) {
                if (rowItem.title && ['title', 'c5'].includes(columnItem.id)) {
                    return true;
                }
            }
        });
        grid.render();

        await delay();

        const total = grid.getRowItem('total');
        const row1 = grid.getRowItem('row1');
        const row2 = grid.getRowItem('row2');
        const row3 = grid.getRowItem('row3');

        assert.equal(grid.getRowHeight(total), defaultRowHeight);
        assert.equal(grid.getRowHeight(row1), defaultRowHeight);
        assert.equal(grid.getRowHeight(row2), defaultRowHeight);
        assert.equal(grid.getRowHeight(row3), defaultRowHeight);

        // observer emit
        await delay(100);

        // offsetHeight include border
        assert.equal(grid.getRowHeight(total), grid.getRowNodes(total).get(0).offsetHeight);
        assert.equal(grid.getRowHeight(row1), defaultRowHeight);
        assert.equal(grid.getRowHeight(row2), grid.getRowNodes(row2).get(0).offsetHeight);
        assert.equal(grid.getRowHeight(row3), grid.getRowNodes(row3).get(0).offsetHeight);

    });

    it('check row height: scroll to right', async () => {

        grid.scrollToLastColumn();
        await delay(100);

        const total = grid.getRowItem('total');
        const row1 = grid.getRowItem('row1');
        const row2 = grid.getRowItem('row2');
        const row3 = grid.getRowItem('row3');

        // reset to default height
        assert.equal(grid.getRowHeight(total), defaultRowHeight);
        assert.equal(grid.getRowHeight(row1), defaultRowHeight);
        assert.equal(grid.getRowHeight(row2), defaultRowHeight);
        assert.equal(grid.getRowHeight(row3), defaultRowHeight);

    });

    it('check row height: scroll back', async () => {

        grid.scrollToFirstColumn();
        await delay(100);

        const total = grid.getRowItem('total');
        const row1 = grid.getRowItem('row1');
        const row2 = grid.getRowItem('row2');
        const row3 = grid.getRowItem('row3');

        // updated height
        assert.equal(grid.getRowHeight(total), grid.getRowNodes(total).get(0).offsetHeight);
        assert.equal(grid.getRowHeight(row1), defaultRowHeight);
        assert.equal(grid.getRowHeight(row2), grid.getRowNodes(row2).get(0).offsetHeight);
        assert.equal(grid.getRowHeight(row3), grid.getRowNodes(row3).get(0).offsetHeight);

    });


    it('check row height: click summary shows details', async () => {

        const row3 = grid.getRowItem('row3');
        const prevHeight = grid.getRowHeight(row3);
        const cellNode = grid.getCellNode(row3, 'title');
        cellNode.querySelector('summary').click();

        // observer emit
        await delay(100);

        const openHeight = grid.getRowHeight(row3);
        assert.ok(openHeight > prevHeight);
        assert.equal(openHeight, grid.getRowNodes(row3).get(0).offsetHeight);

        cellNode.querySelector('summary').click();

        // observer emit
        await delay(100);

        const closeHeight = grid.getRowHeight(row3);
        assert.equal(closeHeight, prevHeight);
        assert.equal(closeHeight, grid.getRowNodes(row3).get(0).offsetHeight);

    });

    it('check row height: drag column width', async () => {

        const row3 = grid.getRowItem('row3');
        const prevHeight = grid.getRowHeight(row3);

        const cellNode = grid.getCellNode(row3, 'title');
        cellNode.querySelector('summary').click();

        // observer emit
        await delay(100);

        const openHeight = grid.getRowHeight(row3);
        assert.ok(openHeight > prevHeight);

        // set column width: original 150
        grid.setColumnWidth('title', 200);

        await delay(100);

        const newHeight = grid.getRowHeight(row3);
        assert.ok(newHeight < openHeight);

    });

    it('check row height: reset height after scroll to bottom then back', async () => {

        const row3 = grid.getRowItem('row3');
        const prevHeight = grid.getRowHeight(row3);

        grid.scrollToLastRow();
        await delay();

        grid.scrollToFirstRow();

        await delay(100);

        // the details closed
        const newHeight = grid.getRowHeight(row3);
        assert.ok(newHeight < prevHeight);

    });

});
