import fs from 'node:fs';
import path from 'node:path';
import EC from 'eight-colors';
import MCR from 'monocart-coverage-reports';
import { chromium } from 'playwright';
import { build, preview } from 'vite';

const projectRoot = process.cwd();
const configFile = path.resolve(projectRoot, 'vite.config.js');
const coverageDir = path.resolve(projectRoot, '.temp/coverage');
const pkg = JSON.parse(fs.readFileSync(path.resolve(projectRoot, 'package.json'), 'utf8'));
const debug = process.argv.includes('--debug');
const debugSpecFilter = debug ? process.argv.slice(2).find((arg) => !arg.startsWith('-')) : '';
process.env.TEST_SPEC_FILTER = debugSpecFilter || '';

let previewServer;
let browser;
let page;
let coverageStarted = false;
let coverageData = [];
let mochaResult;
let executionError;
let pageError;
let debugClosed = false;
let testUrl;

const isTargetClosedError = function(error) {
    const message = error && (error.message || `${error}`);
    return Boolean(message && message.includes('Target page, context or browser has been closed'));
};

const getPreviewUrl = function(server) {
    const localUrl = server.resolvedUrls && server.resolvedUrls.local && server.resolvedUrls.local[0];
    if (localUrl) {
        return new URL('index.html', localUrl).href;
    }

    const address = server.httpServer.address();
    if (!address || typeof address === 'string') {
        throw new Error('Unable to resolve the Vite preview server address');
    }
    return `http://127.0.0.1:${address.port}/index.html`;
};

const normalizeSourcePath = function(filePath) {
    const normalized = filePath.replace(/\\/g, '/');
    const srcIndex = normalized.lastIndexOf('/src/');
    if (srcIndex !== -1) {
        return normalized.slice(srcIndex + 1);
    }
    if (normalized.startsWith('src/')) {
        return normalized;
    }
    return normalized;
};

const generateCoverageReport = async function(data) {
    if (!data.length) {
        throw new Error('No Playwright coverage data was collected');
    }

    const origin = new URL(testUrl).origin;
    const report = MCR({
        name: `${pkg.name || path.basename(projectRoot)} unit test coverage`,
        outputDir: coverageDir,
        reports: ['v8', 'console-summary'],
        lcov: true,
        cleanCache: true,
        entryFilter: (entry) => entry.url.startsWith(origin) && entry.url.includes('/assets/'),
        sourceFilter: (sourcePath) => {
            const normalized = sourcePath.replace(/\\/g, '/');
            return normalized.startsWith('src/') || normalized.includes('/src/');
        },
        sourcePath: normalizeSourcePath
    });

    await report.add(data);
    return report.generate();
};

const waitForDebugExit = function(activeBrowser, activePage) {
    console.log(EC.magenta('\nDebug mode is active. The browser and preview server will remain open.'));
    console.log(`Close Chromium or press ${EC.cyan('Ctrl+C')} to close the test process.`);
    return new Promise((resolve) => {
        const close = function() {
            process.off('SIGINT', close);
            process.off('SIGTERM', close);
            activeBrowser.off('disconnected', close);
            activePage.off('close', close);
            resolve();
        };
        process.once('SIGINT', close);
        process.once('SIGTERM', close);
        activeBrowser.once('disconnected', close);
        activePage.once('close', close);
    });
};

const printTestSummary = function(result) {
    console.log(EC.magenta('\nUnit test summary'));
    console.log(`  Suites: ${result.suites}`);
    console.log(`  Tests: ${result.tests}`);
    console.log(`  Passed: ${EC.green(result.passed)}`);
    console.log(`  Skipped: ${result.skipped}`);
    console.log(`  Failed: ${result.failed ? EC.red(result.failed) : EC.green(result.failed)}`);
    console.log(`  Duration: ${result.duration}ms`);

    if (result.failures && result.failures.length) {
        console.error(EC.red('\nFailed tests:'));
        result.failures.forEach((failure, index) => {
            console.error(EC.red(`${index + 1}. ${failure.title}`));
            console.error(EC.red(failure.errorMsg));
        });
    }
};

try {
    console.log(EC.magenta('Building browser unit tests ...'));
    await build({
        configFile,
        mode: 'test'
    });

    console.log(EC.magenta('Starting Vite preview server ...'));
    previewServer = await preview({
        configFile,
        mode: 'test'
    });
    testUrl = getPreviewUrl(previewServer);
    if (debugSpecFilter) {
        console.log(`Spec filter: ${EC.cyan(debugSpecFilter)}`);
    }
    console.log(`Test page: ${EC.cyan(testUrl)}`);

    browser = await chromium.launch({
        headless: !debug,
        devtools: debug,
        args: debug ? ['--auto-open-devtools-for-tabs'] : []
    });
    const context = await browser.newContext({
        viewport: {
            width: 1280,
            height: 900
        }
    });
    page = await context.newPage();
    browser.once('disconnected', () => {
        debugClosed = debug;
    });
    page.once('close', () => {
        debugClosed = debug;
    });
    await page.exposeBinding('__playwrightPageApi', ({ page: sourcePage }, action, args) => {
        const actions = {
            'mouse.move': (... values) => sourcePage.mouse.move(... values),
            'mouse.down': (... values) => sourcePage.mouse.down(... values),
            'mouse.up': (... values) => sourcePage.mouse.up(... values),
            'mouse.wheel': (... values) => sourcePage.mouse.wheel(... values)
        };
        const handler = actions[action];
        if (!handler) {
            throw new Error(`Unsupported Playwright page action: ${action}`);
        }
        return handler(... args);
    });

    page.on('console', (message) => {
        const text = message.text();
        if (message.type() === 'error') {
            console.error(text);
            return;
        }
        console.log(text);
    });
    page.on('pageerror', (error) => {
        pageError = pageError || error;
        console.error(EC.red(`Browser page error: ${error.stack || error.message}`));
    });

    await Promise.all([
        page.coverage.startJSCoverage({
            resetOnNavigation: false
        }),
        page.coverage.startCSSCoverage({
            resetOnNavigation: false
        })
    ]);
    coverageStarted = true;

    await page.goto(testUrl, {
        waitUntil: 'load',
        timeout: 60 * 1000
    });
    await page.waitForFunction(() => window.__MOCHA_RESULT__ && window.__MOCHA_RESULT__.completed, null, {
        timeout: 10 * 60 * 1000
    });
    mochaResult = await page.evaluate(() => window.__MOCHA_RESULT__);
} catch (error) {
    if (debug && (debugClosed || isTargetClosedError(error))) {
        debugClosed = true;
    } else {
        executionError = error;
    }
} finally {
    if (coverageStarted && page && !page.isClosed() && browser?.isConnected()) {
        try {
            const [jsCoverage, cssCoverage] = await Promise.all([
                page.coverage.stopJSCoverage(),
                page.coverage.stopCSSCoverage()
            ]);
            coverageData = [... jsCoverage, ... cssCoverage];
        } catch (error) {
            executionError = executionError || error;
        }
    }
}

if (mochaResult) {
    printTestSummary(mochaResult);
    if (mochaResult.tests === 0) {
        executionError = executionError || new Error('No unit tests were executed');
    }
}

if (coverageData.length && testUrl) {
    try {
        console.log(EC.magenta(`\nGenerating coverage report in ${coverageDir} ...`));
        await generateCoverageReport(coverageData);
        const coverageReportPath = path.relative(projectRoot, path.resolve(coverageDir, 'index.html')).replace(/\\/g, '/');
        console.log(`Coverage details: ${EC.cyan(coverageReportPath)}`);
    } catch (error) {
        executionError = executionError || error;
        console.error(EC.red(`Coverage report failed: ${error.stack || error.message}`));
    }
} else if (!executionError && !debugClosed) {
    executionError = new Error('No Playwright coverage data was collected');
}

if (pageError) {
    executionError = executionError || pageError;
}
if (executionError) {
    console.error(EC.red(`\nUnit test runner failed: ${executionError.stack || executionError.message}`));
}
if ((!mochaResult && !debugClosed) || mochaResult?.failed > 0 || executionError) {
    process.exitCode = 1;
}

if (debug && browser?.isConnected() && page && !page.isClosed() && previewServer) {
    await waitForDebugExit(browser, page);
}

await browser?.close();
await previewServer?.close();
