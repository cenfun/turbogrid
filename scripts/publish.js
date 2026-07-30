import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import EC from 'eight-colors';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const packagePath = path.resolve(projectRoot, 'package.json');
const requestedVersion = process.argv[2];
const gitCommand = process.platform === 'win32' ? 'git.exe' : 'git';
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

// "publish" is also an npm lifecycle event. Do nothing when a later
// `npm publish` invokes this script without a release type.
if (!requestedVersion && process.env.npm_lifecycle_event === 'publish' && process.env.npm_command !== 'run') {
    console.log(EC.green('Release preparation already completed; continuing npm publish.'));
    process.exit(0);
}

const releaseType = requestedVersion || 'patch';

const fail = function(message) {
    console.error(EC.red(message));
    process.exit(1);
};

const checkCommandResult = function(result, command, args, capture) {
    if (result.error) {
        throw result.error;
    }
    if (result.status === 0) {
        return;
    }
    const details = capture ? `\n${result.stderr || result.stdout}` : '';
    throw new Error(`Command failed (${result.status}): ${command} ${args.join(' ')}${details}`);
};

const run = function(command, args, options = {}) {
    if (!options.silent) {
        console.log(EC.magenta(`> ${command} ${args.join(' ')}`));
    }
    const result = spawnSync(command, args, {
        cwd: projectRoot,
        encoding: 'utf8',
        stdio: options.capture ? 'pipe' : 'inherit'
    });
    checkCommandResult(result, command, args, options.capture);
    return options.capture ? result.stdout.trim() : '';
};

const originalPackageContent = fs.readFileSync(packagePath, 'utf8');
const currentVersion = JSON.parse(originalPackageContent).version;
let nextVersion;
let startHead;

try {
    const status = run(gitCommand, ['status', '--porcelain'], {
        capture: true,
        silent: true
    });
    if (status) {
        throw new Error(`Git working tree is not clean. Commit or stash changes first:\n${status}`);
    }

    startHead = run(gitCommand, ['rev-parse', 'HEAD'], {
        capture: true,
        silent: true
    });

    console.log(EC.magenta(`Preparing ${releaseType} release from ${currentVersion}`));
    run(npmCommand, ['version', releaseType, '-m', 'chore(release): %s']);

    nextVersion = JSON.parse(fs.readFileSync(packagePath, 'utf8')).version;
    console.log(`Version: ${EC.cyan(currentVersion)} -> ${EC.green(nextVersion)}`);

    console.log(EC.green(`\nRelease ${nextVersion} prepared successfully.`));
    console.log(EC.magenta('Next steps (run manually):'));
    console.log(`1. ${EC.cyan('git push && git push --tags')}`);
    console.log(`2. ${EC.cyan('npm login')}`);
    console.log(`3. ${EC.cyan('npm publish')}`);
} catch (error) {
    if (startHead) {
        const currentHead = run(gitCommand, ['rev-parse', 'HEAD'], {
            capture: true,
            silent: true
        });
        if (currentHead === startHead) {
            fs.writeFileSync(packagePath, originalPackageContent);
            spawnSync(gitCommand, ['reset', '--quiet', '--', 'package.json', 'package-lock.json'], {
                cwd: projectRoot,
                stdio: 'ignore'
            });
        }
    }
    fail(`Release failed: ${error.stack || error.message}`);
}
