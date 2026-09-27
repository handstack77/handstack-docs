const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

const bash = process.env.BASH_BIN || (process.platform === 'win32' ? 'C:/Program Files/Git/bin/bash.exe' : 'bash');
const source = fs.readFileSync(path.join(__dirname, '../static/install/macos-bootstrapper.sh'), 'utf8');
const minimumVersionDeclaration = source.match(/^readonly DOTNET_MIN_MACOS_MAJOR=14$/m)?.[0];
assert.ok(minimumVersionDeclaration, '.NET 10 minimum macOS version must be 14');
const versionStart = source.indexOf('macos_version="$(sw_vers -productVersion)"');
const installStart = source.indexOf('if ! xcode-select -p');
assert.ok(versionStart >= 0 && installStart > versionStart, 'Preflight boundaries must precede all installation steps');
const preflight = source.slice(versionStart, installStart);

function runBash(input, args = [], env = {}) {
    const result = spawnSync(bash, ['--noprofile', '--norc', ...args], {
        input,
        encoding: 'utf8',
        env: { ...process.env, BASH_ENV: '', ...env },
        timeout: 10000,
    });
    if (result.error) throw result.error;
    return result;
}

function checkPlatform(version, architecture, translated = '0') {
    return runBash(`set -Eeuo pipefail
${minimumVersionDeclaration}
sw_vers() { printf '%s\\n' "$TEST_MACOS_VERSION"; }
uname() { printf '%s\\n' "$TEST_ARCHITECTURE"; }
sysctl() {
    [[ "$TEST_TRANSLATED" != 'missing' ]] || return 1
    printf '%s\\n' "$TEST_TRANSLATED"
}
${preflight}
printf 'DOTNET=%s\\nBREW=%s\\n' "$dotnet_architecture" "$homebrew_binary"
`, [], { TEST_MACOS_VERSION: version, TEST_ARCHITECTURE: architecture, TEST_TRANSLATED: translated });
}

test('script uses LF line endings and valid Bash syntax', () => {
    assert.ok(!source.includes('\r'), 'Shell scripts must retain LF line endings');
    const result = runBash(source, ['-n']);
    assert.equal(result.status, 0, result.stderr);
});

for (const version of ['14.0', '15.7', '26.0', '26.6']) {
    for (const architecture of ['arm64', 'x86_64']) {
        test(`preserves macOS ${version} ${architecture} installation targets`, () => {
            const result = checkPlatform(version, architecture);
            assert.equal(result.status, 0, result.stderr);
            assert.equal(result.stdout, architecture === 'arm64'
                ? 'DOTNET=arm64\nBREW=/opt/homebrew/bin/brew\n'
                : 'DOTNET=x64\nBREW=/usr/local/bin/brew\n');
        });
    }
}

for (const version of ['14', '014.0', '16.0', '25.0', '27', '27.0', '27.1', '27.0.1', '28.0', '30.1', '100.0']) {
    test(`accepts macOS ${version} with native ARM64 tooling`, () => {
        const result = checkPlatform(version, 'arm64');
        assert.equal(result.status, 0, result.stderr);
        assert.equal(result.stdout, 'DOTNET=arm64\nBREW=/opt/homebrew/bin/brew\n');
    });
}

test('Rosetta detection does not depend on the macOS version', () => {
    for (const version of ['14.0', '26.0', '27.0', '28.0']) {
        const result = checkPlatform(version, 'x86_64', '1');
        assert.equal(result.status, 1, version);
        assert.match(result.stderr, /Rosetta/);
        assert.match(result.stderr, /arch -arm64 \/bin\/bash \.\/macos-bootstrapper\.sh/);
        assert.equal(result.stdout, '');
    }
});

test('native x64 targets are selected without an OS version whitelist', () => {
    for (const version of ['14.0', '26.0', '28.0']) {
        const result = checkPlatform(version, 'x86_64', 'missing');
        assert.equal(result.status, 0, result.stderr);
        assert.equal(result.stdout, 'DOTNET=x64\nBREW=/usr/local/bin/brew\n');
    }
});

test('macOS versions below the .NET 10 minimum remain rejected', () => {
    for (const version of ['0', '9.0', '10.15.7', '12.7', '13.7.9']) {
        const result = checkPlatform(version, 'arm64');
        assert.equal(result.status, 1, version);
        assert.match(result.stderr, /macOS 14 이상/);
        assert.equal(result.stdout, '');
    }
});

test('invalid macOS versions fail with a clear diagnostic before arithmetic', () => {
    for (const version of ['', 'unknown', '14.x', '14..1', '14.0.1.2', '-14', '14+1', '14.0 beta', '14\n15']) {
        const result = checkPlatform(version, 'arm64');
        assert.equal(result.status, 1, version);
        assert.match(result.stderr, /macOS 버전을 확인할 수 없습니다/);
        assert.equal(result.stdout, '');
    }
});

test('unsupported architectures remain rejected', () => {
    const result = checkPlatform('27.0', 'unknown');
    assert.equal(result.status, 1);
    assert.match(result.stderr, /지원하지 않는 아키텍처/);
});
