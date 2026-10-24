import assert from 'node:assert/strict';
import http from 'node:http';
import { after, before, test } from 'node:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { parseConfig } from '../src/cli.mjs';
import { createHttpHandler } from '../src/http.mjs';
import { DocsService } from '../src/service.mjs';
import { fixtureIndex } from './fixture.mjs';

const service = new DocsService(fixtureIndex);
let server;
let base;
const rateLimit = { limit: 1000, windowMs: 60000 };
const allowedOrigins = [];

before(async () => {
    const handler = createHttpHandler({
        getService: () => service,
        version: 'test',
        allowedHosts: ['localhost', '127.0.0.1', '[::1]'],
        allowedOrigins,
        rateLimit,
        maxBodyBytes: 2048,
    });
    server = http.createServer(handler);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

const initialize = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 't', version: '0' } },
};

const post = (body, headers = {}) => fetch(`${base}/mcp`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
});

test('SDK 클라이언트로 도구를 호출한다 (stateless)', async () => {
    const client = new Client({ name: 'http-test', version: '0.0.0' });
    await client.connect(new StreamableHTTPClientTransport(new URL(`${base}/mcp`)));

    const { tools } = await client.listTools();
    assert.equal(tools.length, 4);

    const result = await client.callTool({ name: 'search_docs', arguments: { query: 'transactionAction' } });
    assert.match(result.content[0].text, /reference\/거래-호출/);
    await client.close();
});

test('GET /mcp: 브라우저에는 상태 페이지, 일반 요청에는 JSON', async () => {
    const html = await fetch(`${base}/mcp`, { headers: { accept: 'text/html' } });
    assert.equal(html.status, 200);
    const page = await html.text();
    assert.match(page, /서버가 실행 중입니다/);
    assert.doesNotMatch(page, /서버 버전/);
    assert.match(page, /claude mcp add --transport http handstack-docs /);
    assert.match(page, /codex mcp add handstack-docs --url /);

    const json = await (await fetch(`${base}/mcp`)).json();
    assert.equal(json.status, 'ok');
    assert.equal(json.docs, fixtureIndex.docs.length);
});

test('GET /healthz', async () => {
    const response = await fetch(`${base}/healthz`);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).status, 'ok');
});

test('SSE 스트림과 DELETE 는 405', async () => {
    assert.equal((await fetch(`${base}/mcp`, { headers: { accept: 'text/event-stream' } })).status, 405);
    assert.equal((await fetch(`${base}/mcp`, { method: 'DELETE' })).status, 405);
});

test('잘못된 JSON 은 400, 큰 본문은 413, 다른 Content-Type 은 415', async () => {
    assert.equal((await post('{not json')).status, 400);
    assert.equal((await post({ ...initialize, pad: 'x'.repeat(4096) })).status, 413);
    assert.equal((await post('x', { 'content-type': 'text/plain' })).status, 415);
});

test('허용되지 않은 Origin 은 403, 허용 목록에 있으면 CORS 헤더를 붙인다', async () => {
    const denied = await post(initialize, { origin: 'https://evil.example' });
    assert.equal(denied.status, 403);

    allowedOrigins.push('https://app.example');
    try {
        const allowed = await post(initialize, { origin: 'https://app.example' });
        assert.equal(allowed.status, 200);
        assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://app.example');

        const preflight = await fetch(`${base}/mcp`, { method: 'OPTIONS', headers: { origin: 'https://app.example' } });
        assert.equal(preflight.status, 204);
    } finally {
        allowedOrigins.length = 0;
    }
});

test('허용되지 않은 Host 는 403 (DNS rebinding 방어)', async () => {
    const response = await new Promise((resolve, reject) => {
        const request = http.request(`${base}/mcp`, { method: 'GET', headers: { host: 'attacker.example' } }, resolve);
        request.on('error', reject);
        request.end();
    });
    assert.equal(response.statusCode, 403);
    response.resume();
});

test('요청 제한을 넘으면 429 와 Retry-After', async () => {
    rateLimit.limit = 2;
    try {
        const codes = [];
        for (let i = 0; i < 4; i += 1) {
            const response = await post(initialize);
            codes.push(response.status);
            await response.arrayBuffer();
            if (response.status === 429) {
                assert.ok(Number(response.headers.get('retry-after')) > 0);
            }
        }
        assert.ok(codes.includes(429), `429 가 없습니다: ${codes}`);
    } finally {
        rateLimit.limit = 1000;
    }
});

test('없는 경로는 404', async () => {
    assert.equal((await fetch(`${base}/other`)).status, 404);
});

test('parseConfig: 기본은 루프백 127.0.0.1:8787', () => {
    const config = parseConfig([], {});
    assert.equal(config.host, '127.0.0.1');
    assert.equal(config.port, 8787);
    assert.deepEqual(config.allowedHosts, ['localhost', '127.0.0.1', '[::1]']);
});

test('parseConfig: 인자가 환경 변수보다 우선하고, 외부 바인딩은 Host 목록을 환경 변수로만 받는다', () => {
    const config = parseConfig(['--port=9000', '--host', '0.0.0.0'], {
        HANDSTACK_DOCS_HTTP_PORT: '1234',
        HANDSTACK_DOCS_ALLOWED_HOSTS: 'Docs.Example.com',
        HANDSTACK_DOCS_TRUST_PROXY: 'true',
        HANDSTACK_DOCS_RATE_LIMIT: '10',
    });
    assert.equal(config.port, 9000);
    assert.deepEqual(config.allowedHosts, ['docs.example.com']);
    assert.equal(config.trustProxy, true);
    assert.equal(config.rateLimit.limit, 10);

    assert.equal(parseConfig(['--host', '0.0.0.0'], {}).allowedHosts, null);
    assert.throws(() => parseConfig(['--bogus'], {}), /알 수 없는 옵션/);
    assert.throws(() => parseConfig(['--port', '99999'], {}), /포트/);
});

// 상태 페이지가 보여 주는 등록 예시 주소
async function statusPageUrl(options, headers = {}) {
    const handler = createHttpHandler({ getService: () => service, version: 'test', ...options });
    const local = http.createServer(handler);
    await new Promise((resolve) => local.listen(0, '127.0.0.1', resolve));
    try {
        const response = await fetch(`http://127.0.0.1:${local.address().port}/mcp`, { headers: { accept: 'text/html', ...headers } });
        return (await response.text()).match(/claude mcp add --transport http handstack-docs (\S+)<\/pre>/)?.[1];
    } finally {
        local.close();
    }
}

test('상태 페이지 주소: 프록시를 신뢰하면 X-Forwarded-Host/Proto 로 공개 주소를 만든다', async () => {
    const forwarded = { 'x-forwarded-host': 'handstack.kr', 'x-forwarded-proto': 'https' };
    assert.equal(await statusPageUrl({ trustProxy: true, defaultPublicUrl: 'http://localhost:1/mcp' }, forwarded), 'https://handstack.kr/mcp');
    assert.equal(await statusPageUrl({ trustProxy: true }, { 'x-forwarded-host': 'docs.example.com:8443', 'x-forwarded-proto': 'http' }), 'http://docs.example.com:8443/mcp');
    assert.equal(await statusPageUrl({ trustProxy: true }, { 'x-forwarded-host': '1.1.1.207:8080', 'x-forwarded-proto': 'http' }), 'http://1.1.1.207:8080/mcp');
    assert.equal(await statusPageUrl({ trustProxy: true }, { 'x-forwarded-host': '[::1]:8080' }), 'http://[::1]:8080/mcp');
});

test('상태 페이지 주소: 여러 프록시가 덧붙인 값은 마지막 값을 쓴다', async () => {
    assert.equal(await statusPageUrl({ trustProxy: true }, { 'x-forwarded-host': 'evil.example, handstack.kr', 'x-forwarded-proto': 'http, https' }), 'https://handstack.kr/mcp');
});

test('상태 페이지 주소: 프록시를 신뢰하지 않으면 헤더를 무시하고 기본 주소를 쓴다', async () => {
    assert.equal(
        await statusPageUrl({ trustProxy: false, defaultPublicUrl: 'http://localhost:9/mcp' }, { 'x-forwarded-host': 'handstack.kr', 'x-forwarded-proto': 'https' }),
        'http://localhost:9/mcp',
    );
});

test('상태 페이지 주소: 명시한 publicUrl 이 헤더보다 우선한다', async () => {
    assert.equal(
        await statusPageUrl({ trustProxy: true, publicUrl: 'https://docs.example.com/mcp' }, { 'x-forwarded-host': 'handstack.kr', 'x-forwarded-proto': 'https' }),
        'https://docs.example.com/mcp',
    );
});

test('상태 페이지 주소: 호스트 이름 형식이 아닌 값은 버린다 (HTML 삽입 방지)', async () => {
    for (const bad of ['evil.example"><script>x</script>', 'a b', 'host/path', 'host:99999999', '-bad.example', '']) {
        assert.equal(
            await statusPageUrl({ trustProxy: true, defaultPublicUrl: 'http://localhost:9/mcp' }, { 'x-forwarded-host': bad, 'x-forwarded-proto': 'https' }),
            'http://localhost:9/mcp',
            `거부해야 하는 값: ${bad}`,
        );
    }
});

test('parseConfig: publicUrl 은 지정한 경우에만 값이 있고 기본 주소는 따로 둔다', () => {
    const config = parseConfig(['--port=9000'], {});
    assert.equal(config.publicUrl, undefined);
    assert.equal(config.defaultPublicUrl, 'http://localhost:9000/mcp');
    assert.equal(parseConfig([], { HANDSTACK_DOCS_PUBLIC_URL: 'https://handstack.kr/mcp' }).publicUrl, 'https://handstack.kr/mcp');
});
