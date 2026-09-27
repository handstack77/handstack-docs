const assert = require('node:assert/strict');
const { test } = require('node:test');
const { getServerUrl, normalizeCatalog, loadCatalog } = require('../plugins/ide-downloads/catalog.cjs');
const plugin = require('../plugins/ide-downloads/index.cjs');

const serverUrl = 'https://releases.example.test/';
const checkedAt = '2026-09-26T01:00:00.000Z';
const now = () => new Date(checkedAt);
const asset = (fileName, type = 'Installer') => ({ fileName, type, size: 221816974, downloadCount: 12 });
const channel = (id = 'win', installer = asset('Stavlo-win-Setup.exe'), portable = asset('Stavlo-win-Portable.zip', 'Portable')) => ({
    channel: id,
    installer,
    portable,
    versions: [
        { version: '1.0.0-beta.10', publishedAt: '2026-09-22T06:46:03Z', notesHtml: '<script>untrusted()</script>', installer: asset('archived-1.0.0-beta.10.exe') },
        { version: '1.0.0-beta.2', publishedAt: '2026-09-21T06:46:03Z' },
    ],
});
const response = payload => ({ ok: true, json: async () => payload });

test('uses channel-level latest assets and updater version ordering; omits notes and counts', () => {
    const catalog = normalizeCatalog({ channels: [channel()] }, serverUrl, checkedAt);
    assert.equal(catalog.status, 'available');
    assert.equal(catalog.checkedAt, checkedAt);
    assert.equal(catalog.sourceUrl, `${serverUrl}index.html`);
    assert.deepEqual(catalog.platforms.map(item => [item.name, item.status]), [
        ['Windows', 'ready'], ['macOS', 'pending'], ['Linux', 'pending'],
    ]);
    const windows = catalog.platforms[0];
    assert.equal(windows.version, '1.0.0-beta.10');
    assert.equal(windows.installer.url, `${serverUrl}releases/download/Stavlo-win-Setup.exe`);
    assert.equal(windows.portable.url, `${serverUrl}releases/download/Stavlo-win-Portable.zip`);
    assert.equal(windows.portable.extension, '.zip');
    assert.equal(windows.publishedAt, '2026-09-22T06:46:03.000Z');
    assert.doesNotMatch(JSON.stringify(catalog), /notesHtml|untrusted|downloadCount|archived/);
    assert.equal(catalog.platforms[1].installer, null);
});

test('supports published macOS and Linux assets without guessing filenames', () => {
    const catalog = normalizeCatalog({ channels: [
        channel('linux', asset('Stavlo-linux.AppImage'), null),
        channel('osx', asset('Stavlo-osx-Setup.pkg'), asset('Stavlo-osx-Portable.zip', 'Portable')),
        channel(),
    ] }, serverUrl, checkedAt);
    assert.ok(catalog.platforms.every(item => item.status === 'ready'));
    assert.equal(catalog.platforms[1].installer.extension, '.pkg');
    assert.equal(catalog.platforms[1].installer.url, `${serverUrl}releases/download/Stavlo-osx-Setup.pkg`);
    assert.equal(catalog.platforms[1].portable.url, `${serverUrl}releases/download/Stavlo-osx-Portable.zip`);
    assert.equal(catalog.platforms[2].installer.extension, '.AppImage');
    assert.equal(catalog.platforms[2].installer.url, `${serverUrl}releases/download/Stavlo-linux.AppImage`);
    assert.equal(catalog.platforms[2].portable, null);
});

test('preserves catalog filenames for releases published before the package rename', () => {
    const catalog = normalizeCatalog({ channels: [channel('win',
        asset('HandStack.IDE-win-Setup.exe'), asset('HandStack.IDE-win-Portable.zip', 'Portable'))] }, serverUrl, checkedAt);
    assert.equal(catalog.platforms[0].installer.fileName, 'HandStack.IDE-win-Setup.exe');
    assert.equal(catalog.platforms[0].installer.url, `${serverUrl}releases/download/HandStack.IDE-win-Setup.exe`);
    assert.equal(catalog.platforms[0].portable.url, `${serverUrl}releases/download/HandStack.IDE-win-Portable.zip`);
});

test('supports portable-only releases and missing optional metadata', () => {
    const windows = channel('win', null);
    windows.versions = [];
    const catalog = normalizeCatalog({ channels: [windows] }, serverUrl, checkedAt);
    assert.equal(catalog.platforms[0].status, 'ready');
    assert.equal(catalog.platforms[0].installer, null);
    assert.equal(catalog.platforms[0].version, null);
    assert.equal(catalog.platforms[0].publishedAt, null);
});

test('an empty catalog is pending, not a network failure', () => {
    const catalog = normalizeCatalog({ channels: [] }, serverUrl, checkedAt);
    assert.equal(catalog.status, 'available');
    assert.ok(catalog.platforms.every(item => item.status === 'pending' && !item.installer && !item.portable));
});

test('rejects untrusted paths, unsupported assets, invalid sizes and malformed catalogs', () => {
    for (const fileName of ['../setup.exe', 'folder/setup.exe', 'folder\\setup.exe', 'https://evil.test/setup.exe', '%2e%2e.exe', 'setup.exe?x=1', 'setup.nupkg']) {
        assert.throws(() => normalizeCatalog({ channels: [channel('win', asset(fileName))] }, serverUrl, checkedAt));
    }
    for (const size of [0, -1, '100', NaN, Infinity]) {
        assert.throws(() => normalizeCatalog({ channels: [channel('win', { ...asset('setup.exe'), size })] }, serverUrl, checkedAt));
    }
    for (const payload of [null, {}, { channels: {} }, { channels: [channel(), channel()] }, { channels: [{ channel: 'win' }] }]) {
        assert.throws(() => normalizeCatalog(payload, serverUrl, checkedAt));
    }
});

test('validates the configured server and supports an explicit local override', () => {
    assert.equal(getServerUrl('http://localhost:8090'), 'http://localhost:8090/');
    for (const value of ['file:///tmp', 'javascript:alert(1)', 'https://user:password@example.test', `${serverUrl}?key=secret`, `${serverUrl}#fragment`]) {
        assert.throws(() => getServerUrl(value));
    }
});

test('fetches only catalog metadata, never downloads installers', async () => {
    const calls = [];
    const catalog = await loadCatalog({ serverUrl, now, fetchImpl: async (url, options) => {
        calls.push(url);
        assert.equal(options.headers.Accept, 'application/json');
        assert.ok(options.signal instanceof AbortSignal);
        return response({ channels: [channel()] });
    } });
    assert.deepEqual(calls, [`${serverUrl}releases/catalog`]);
    assert.equal(catalog.platforms[0].status, 'ready');
});

test('network, HTTP, JSON and validation failures show unknown availability without fake links', async () => {
    for (const fetchImpl of [
        async () => { throw new Error('offline'); },
        async () => ({ ok: false, status: 503 }),
        async () => ({ ok: true, json: async () => { throw new Error('not JSON'); } }),
        async () => response({ channels: [channel('win', asset('../setup.exe'))] }),
    ]) {
        const catalog = await loadCatalog({ serverUrl, now, fetchImpl });
        assert.equal(catalog.status, 'unavailable');
        assert.equal(catalog.sourceUrl, `${serverUrl}index.html`);
        assert.ok(catalog.platforms.every(item => item.status === 'unavailable' && !item.installer && !item.portable));
    }
});

test('aborts a slow catalog request and keeps the fallback page usable', async () => {
    const catalog = await loadCatalog({ serverUrl, now, timeoutMs: 10, fetchImpl: (url, { signal }) =>
        new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })) });
    assert.equal(catalog.status, 'unavailable');
});

test('Docusaurus exposes the loaded data to the download page', async () => {
    const instance = plugin({}, { serverUrl, now, fetchImpl: async () => response({ channels: [channel()] }) });
    const content = await instance.loadContent();
    let globalData;
    instance.contentLoaded({ content, actions: { setGlobalData: value => { globalData = value; } } });
    assert.equal(instance.name, 'handstack-ide-downloads');
    assert.equal(globalData.platforms[0].status, 'ready');
});
