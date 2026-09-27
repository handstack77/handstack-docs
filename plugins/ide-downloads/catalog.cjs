const DEFAULT_SERVER_URL = 'https://stavlo.qrame.kr';
const PLATFORMS = [
    { channel: 'win', name: 'Windows' },
    { channel: 'osx', name: 'macOS' },
    { channel: 'linux', name: 'Linux' },
];

function getServerUrl(value = DEFAULT_SERVER_URL) {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
        throw new Error('IDE release server must be an HTTP(S) URL without credentials, query or fragment.');
    }
    return `${url.href.replace(/\/+$/, '')}/`;
}

function normalizeAsset(asset, type, serverUrl) {
    if (asset == null) return null;
    if (asset.type !== type || typeof asset.fileName !== 'string' ||
        !/^[a-z0-9][a-z0-9._-]*\.(exe|zip|pkg|dmg|appimage)$/i.test(asset.fileName) ||
        !Number.isSafeInteger(asset.size) || asset.size <= 0) {
        throw new Error('Invalid IDE download asset.');
    }
    return {
        fileName: asset.fileName,
        size: asset.size,
        extension: asset.fileName.slice(asset.fileName.lastIndexOf('.')),
        url: new URL(`releases/download/${encodeURIComponent(asset.fileName)}`, serverUrl).href,
    };
}

function normalizeCatalog(payload, serverUrl, checkedAt) {
    if (!payload || !Array.isArray(payload.channels)) throw new Error('Invalid IDE release catalog.');
    return {
        status: 'available',
        checkedAt,
        sourceUrl: new URL('index.html', serverUrl).href,
        platforms: PLATFORMS.map(platform => {
            const channels = payload.channels.filter(item => item?.channel === platform.channel);
            if (channels.length > 1) throw new Error('Duplicate IDE release channel.');
            const channel = channels[0];
            const result = { ...platform, status: 'pending', version: null, publishedAt: null, installer: null, portable: null };
            if (!channel) return result;
            if (!Array.isArray(channel.versions)) throw new Error('Invalid IDE release versions.');

            // The updater sorts versions by SemVer, newest first. Channel assets are the latest, non-archived files.
            const latest = channel.versions[0];
            if (latest && (typeof latest.version !== 'string' || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(latest.version))) {
                throw new Error('Invalid IDE release version.');
            }
            const installer = normalizeAsset(channel.installer, 'Installer', serverUrl);
            const portable = normalizeAsset(channel.portable, 'Portable', serverUrl);
            return {
                ...result,
                status: installer || portable ? 'ready' : 'pending',
                version: latest?.version ?? null,
                publishedAt: typeof latest?.publishedAt === 'string' && Number.isFinite(Date.parse(latest.publishedAt))
                    ? new Date(latest.publishedAt).toISOString() : null,
                installer,
                portable,
            };
        }),
    };
}

async function loadCatalog({ serverUrl = DEFAULT_SERVER_URL, fetchImpl = fetch, now = () => new Date(), timeoutMs = 10000 } = {}) {
    const baseUrl = getServerUrl(serverUrl);
    const checkedAt = now().toISOString();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetchImpl(new URL('releases/catalog', baseUrl).href, {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
        });
        if (!response.ok) throw new Error(`IDE catalog HTTP ${response.status}`);
        return normalizeCatalog(await response.json(), baseUrl, checkedAt);
    } catch {
        return {
            status: 'unavailable',
            checkedAt,
            sourceUrl: new URL('index.html', baseUrl).href,
            platforms: PLATFORMS.map(platform => ({ ...platform, status: 'unavailable', version: null, publishedAt: null, installer: null, portable: null })),
        };
    } finally {
        clearTimeout(timeout);
    }
}

module.exports = { DEFAULT_SERVER_URL, getServerUrl, normalizeCatalog, loadCatalog };
