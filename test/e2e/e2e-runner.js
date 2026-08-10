import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

export const e2eRunner = async (page) => {
    const fileList = [
        './test/e2e/index.html',
        './dist/turbogrid.js'
    ];

    for (const filePath of fileList) {
        const content = fs.readFileSync(path.resolve(projectRoot, filePath), 'utf8');
        const extname = path.extname(filePath);
        if (extname === '.html') {
            await page.setContent(content);
        } else if (extname === '.css') {
            await page.addStyleTag({
                content: `${content}\n/*# sourceURL=${filePath} */`
            });
        } else {
            await page.addScriptTag({
                content: `${content}\n//# sourceURL=${filePath}`
            });
        }
    }

    await new Promise((resolve) => {
        setTimeout(resolve, 500);
    });

    await page.evaluate(() => {
        const { Grid, VERSION } = window.turbogrid;
        console.log(`Running E2E tests with TurboGrid v${VERSION}`);
        const grid = new Grid(document.querySelector('#grid'));
        grid.setData({
            columns: [
                {
                    id: 'name', name: 'Name'
                },
                {
                    id: 'value', name: 'Value'
                }
            ],
            rows: [
                {
                    id: 1, name: 'Row 1', value: 100
                },
                {
                    id: 2, name: 'Row 2', value: 200
                }
            ]
        });
        grid.render();
        window.__E2E_GRID__ = grid;
    });

    await page.waitForFunction(() => {
        const text = document.querySelector('#grid')?.textContent || '';
        return text.includes('Row 1') && text.includes('Row 2');
    });

    const result = await page.evaluate(() => ({
        rows: window.__E2E_GRID__.getRows().length,
        cells: document.querySelectorAll('#grid .tg-cell').length
    }));
    if (result.rows !== 2 || result.cells < 4) {
        throw new Error(`Unexpected production grid result: ${JSON.stringify(result)}`);
    }
};
