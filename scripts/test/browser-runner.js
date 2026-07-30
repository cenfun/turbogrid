import 'mocha/mocha.js';
import { assert } from 'chai';
import EC from 'eight-colors';

const result = {
    completed: false,
    suites: 0,
    tests: 0,
    skipped: 0,
    failed: 0,
    passed: 0,
    duration: 0,
    failures: []
};

window.__MOCHA_RESULT__ = result;
window.assert = assert;
window.page = {
    mouse: {
        move: (... args) => window.__playwrightPageApi('mouse.move', args),
        down: (... args) => window.__playwrightPageApi('mouse.down', args),
        up: (... args) => window.__playwrightPageApi('mouse.up', args),
        wheel: (... args) => window.__playwrightPageApi('mouse.wheel', args)
    }
};
window.delay = function(ms) {
    if (!arguments.length || ms <= 0) {
        return Promise.resolve();
    }
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

const errorMessage = function(error) {
    if (!error) {
        return 'Unknown test error';
    }
    return error.stack || error.message || `${error}`;
};

const BrowserReporter = function(runner) {
    let indent = 0;

    runner.on('suite', (suite) => {
        if (!suite.root) {
            console.log(EC.magenta(`${'   '.repeat(indent)}+ ${suite.title}`));
            indent += 1;
        }
    });

    runner.on('suite end', (suite) => {
        if (!suite.root) {
            indent = Math.max(0, indent - 1);
        }
    });

    runner.on('pending', (test) => {
        console.log(EC.magenta(`${'   '.repeat(indent)}- ${test.title}`));
    });

    runner.on('pass', (test) => {
        console.log(EC.green(`${'   '.repeat(indent)}√ ${test.title}`));
    });

    runner.on('fail', (test, error) => {
        const message = errorMessage(error);
        console.error(EC.red(`${'   '.repeat(indent)}× ${test.title}\n${message}`));
        result.failures.push({
            title: typeof test.fullTitle === 'function' ? test.fullTitle() : test.title,
            errorMsg: message
        });
    });

    runner.once('end', () => {
        const stats = runner.stats || {};
        result.suites = stats.suites || 0;
        result.tests = stats.tests || 0;
        result.skipped = stats.pending || 0;
        result.failed = stats.failures || 0;
        result.passed = stats.passes || 0;
        result.duration = stats.duration || 0;
        result.completed = true;
    });
};

const failBootstrap = function(error) {
    const message = errorMessage(error);
    console.error(EC.red(message));
    result.failed = 1;
    result.failures.push({
        title: 'Test bootstrap failed',
        errorMsg: message
    });
    result.completed = true;
};

const getSpecFilters = function() {
    const value = new URLSearchParams(window.location.search).get('spec') || '';
    return value.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
};

const filterSpecFiles = function(files, filters) {
    if (!filters.length) {
        return files;
    }
    return files.filter((file) => {
        const fileName = file.split('/').pop().toLowerCase();
        return filters.some((keyword) => fileName.includes(keyword));
    });
};

const start = async function() {
    try {
        window.mocha.setup({
            ui: 'bdd',
            timeout: 60 * 1000,
            color: true,
            reporter: BrowserReporter
        });

        const specs = import.meta.glob('../../test/specs/*.js');
        const allSpecFiles = Object.keys(specs).sort();
        const filters = getSpecFilters();
        const specFiles = filterSpecFiles(allSpecFiles, filters);
        if (!specFiles.length) {
            throw new Error(`No test spec files matched: ${filters.join(',')}`);
        }
        console.log(EC.magenta(`Loading ${specFiles.length}/${allSpecFiles.length} test spec files`));
        if (filters.length) {
            console.log(EC.magenta(`Matched spec files (${filters.join(', ')}):`));
            specFiles.forEach((file) => {
                const relativePath = file.replace(/^(\.\.\/)+/, '');
                console.log(EC.cyan(`  ${relativePath}`));
            });
        }

        for (const file of specFiles) {
            await specs[file]();
        }

        window.mocha.run();
    } catch (error) {
        failBootstrap(error);
    }
};

start();
