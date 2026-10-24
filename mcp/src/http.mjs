import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from './server.mjs';

const MCP_PATH = '/mcp';
const LOOPBACK_HOSTS = ['localhost', '127.0.0.1', '[::1]'];

class HttpError extends Error {
    constructor(status, code, message, headers = {}) {
        super(message);
        this.status = status;
        this.code = code;
        this.headers = headers;
    }
}

function sendJson(response, status, body, headers = {}) {
    if (response.headersSent) {
        return;
    }
    response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers });
    response.end(JSON.stringify(body));
}

function sendRpcError(response, error) {
    sendJson(response, error.status, { jsonrpc: '2.0', error: { code: error.code, message: error.message }, id: null }, error.headers);
}

// 고정 윈도우 방식의 IP별 요청 제한입니다. 메모리만 사용하므로 프로세스를 재시작하면 초기화됩니다.
function createRateLimiter(config) {
    const buckets = new Map();

    return (key) => {
        const { limit, windowMs } = config;
        if (limit <= 0) {
            return 0;
        }

        const now = Date.now();
        if (buckets.size > 10000) {
            for (const [bucketKey, bucket] of buckets) {
                if (bucket.resetAt <= now) {
                    buckets.delete(bucketKey);
                }
            }
        }

        let bucket = buckets.get(key);
        if (!bucket || bucket.resetAt <= now) {
            bucket = { count: 0, resetAt: now + windowMs };
            buckets.set(key, bucket);
        }
        bucket.count += 1;
        return bucket.count > limit ? Math.ceil((bucket.resetAt - now) / 1000) : 0;
    };
}

async function readJsonBody(request, maxBytes) {
    const chunks = [];
    let size = 0;
    for await (const chunk of request) {
        size += chunk.length;
        if (size > maxBytes) {
            throw new HttpError(413, -32600, `요청 본문은 ${maxBytes}바이트를 넘을 수 없습니다.`);
        }
        chunks.push(chunk);
    }

    try {
        return JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
        throw new HttpError(400, -32700, '요청 본문이 올바른 JSON이 아닙니다.');
    }
}

function clientAddress(request, trustProxy) {
    if (trustProxy) {
        // 신뢰하는 프록시가 덧붙인 가장 마지막 값만 사용합니다. 앞쪽 값은 클라이언트가 위조할 수 있습니다.
        const forwarded = request.headers['x-forwarded-for'];
        const last = (Array.isArray(forwarded) ? forwarded.join(',') : forwarded)?.split(',').pop()?.trim();
        if (last) {
            return last;
        }
    }
    return request.socket.remoteAddress ?? 'unknown';
}

// 호스트 이름(또는 IPv4)과 [IPv6], 선택적 포트만 허용합니다.
const HOST_LABEL = '[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?';
const HOST_PATTERN = new RegExp(`^(?:${HOST_LABEL}(?:\\.${HOST_LABEL})*|\\[[0-9A-Fa-f:.]+\\])(?::\\d{1,5})?$`);

function lastHeaderValue(value) {
    const text = Array.isArray(value) ? value.join(',') : value;
    return text?.split(',').map((item) => item.trim()).filter(Boolean).pop();
}

// 상태 페이지에 보여 줄 공개 주소를 정합니다. 명시한 publicUrl 이 있으면 그것을 쓰고,
// 신뢰하는 프록시 뒤라면 프록시가 알려 준 Host/Proto 로 만들고, 그 외에는 기본 주소를 씁니다.
// 헤더 값은 페이지에 그대로 표시되므로 호스트 이름 형식이 아니면 버립니다.
function resolvePublicUrl(request, { publicUrl, defaultPublicUrl, trustProxy }) {
    if (publicUrl) {
        return publicUrl;
    }

    if (trustProxy) {
        const host = lastHeaderValue(request.headers['x-forwarded-host']);
        if (host && host.length <= 255 && HOST_PATTERN.test(host)) {
            const proto = lastHeaderValue(request.headers['x-forwarded-proto'])?.toLowerCase();
            return `${proto === 'https' ? 'https' : 'http'}://${host}${MCP_PATH}`;
        }
    }
    return defaultPublicUrl;
}

function statusPage(status, mcpUrl) {
    const escaped = (value) => String(value).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
    return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>HandStack 문서 MCP 서버</title>
<style>body{font-family:system-ui,sans-serif;max-width:42rem;margin:3rem auto;padding:0 1rem;line-height:1.6}code,pre{background:#f3f3f3;padding:.1rem .3rem;border-radius:4px}pre{padding:.75rem;overflow:auto}</style>
</head><body>
<h1>HandStack 문서 MCP 서버</h1>
<p>서버가 실행 중입니다. 이 주소는 MCP 클라이언트(Claude Code, Codex CLI, Cursor 등)가 사용하며 브라우저에서는 상태만 볼 수 있습니다.</p>
<ul><li>문서 ${escaped(status.docs)}건, 청크 ${escaped(status.chunks)}건</li><li>인덱스 생성: ${escaped(status.generatedAt)}</li></ul>
<p>Claude Code에 등록하려면:</p>
<pre>claude mcp add --transport http handstack-docs ${escaped(mcpUrl)}</pre>
<p>Codex CLI에 등록하려면:</p>
<pre>codex mcp add handstack-docs --url ${escaped(mcpUrl)}</pre>
</body></html>`;
}

/**
 * 상태를 유지하지 않는(stateless) Streamable HTTP 핸들러입니다.
 * - POST /mcp: MCP 요청. 요청마다 JSON 응답 하나를 돌려줍니다.
 * - GET /mcp: 브라우저용 상태 페이지(JSON 도 가능). SSE 스트림은 지원하지 않습니다.
 * - GET /healthz: 로드밸런서·프로세스 감시용
 */
export function createHttpHandler({
    getService,
    version = '0.0.0',
    publicUrl = null,
    defaultPublicUrl = `http://localhost${MCP_PATH}`,
    allowedOrigins = [],
    allowedHosts = null,
    trustProxy = false,
    maxBodyBytes = 64 * 1024,
    rateLimit = { limit: 60, windowMs: 60 * 1000 },
    log = () => {},
}) {
    const checkRate = createRateLimiter(rateLimit);

    const corsHeaders = (origin) => (origin
        ? {
            'access-control-allow-origin': origin,
            'access-control-allow-methods': 'POST, GET, OPTIONS',
            'access-control-allow-headers': 'content-type, accept, mcp-protocol-version, mcp-session-id',
            'access-control-max-age': '600',
            vary: 'Origin',
        }
        : {});

    const status = () => {
        const { index } = getService();
        return { status: 'ok', version, docs: index.docs.length, chunks: index.chunks.length, generatedAt: index.generatedAt };
    };

    return async function handle(request, response) {
        const { pathname } = new URL(request.url ?? '/', 'http://localhost');
        const origin = request.headers.origin;

        try {
            if (pathname === '/healthz' && request.method === 'GET') {
                return sendJson(response, 200, status());
            }
            if (pathname !== MCP_PATH) {
                throw new HttpError(404, -32601, '찾을 수 없는 경로입니다.');
            }

            // DNS rebinding 과 브라우저 교차 출처 호출을 막기 위해 Host 와 Origin 을 검사합니다.
            const host = request.headers.host?.toLowerCase();
            if (allowedHosts && (!host || !allowedHosts.includes(host.replace(/:\d+$/, '')))) {
                throw new HttpError(403, -32600, '허용되지 않은 Host 입니다.');
            }
            if (origin && !allowedOrigins.includes('*') && !allowedOrigins.includes(origin)) {
                throw new HttpError(403, -32600, '허용되지 않은 Origin 입니다.');
            }
            const cors = corsHeaders(origin);

            if (request.method === 'OPTIONS') {
                response.writeHead(204, cors);
                return response.end();
            }

            if (request.method === 'GET') {
                if ((request.headers.accept ?? '').includes('text/event-stream')) {
                    throw new HttpError(405, -32000, '이 서버는 SSE 스트림을 지원하지 않습니다. POST 를 사용하세요.', { allow: 'POST, GET, OPTIONS', ...cors });
                }
                if ((request.headers.accept ?? '').includes('text/html')) {
                    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', ...cors });
                    return response.end(statusPage(status(), resolvePublicUrl(request, { publicUrl, defaultPublicUrl, trustProxy })));
                }
                return sendJson(response, 200, status(), cors);
            }

            if (request.method !== 'POST') {
                throw new HttpError(405, -32000, '지원하지 않는 메서드입니다.', { allow: 'POST, GET, OPTIONS', ...cors });
            }

            const retryAfter = checkRate(clientAddress(request, trustProxy));
            if (retryAfter > 0) {
                throw new HttpError(429, -32000, '요청이 너무 많습니다. 잠시 후 다시 시도하세요.', { 'retry-after': String(retryAfter), ...cors });
            }
            if (!(request.headers['content-type'] ?? '').includes('application/json')) {
                throw new HttpError(415, -32600, 'Content-Type 은 application/json 이어야 합니다.', cors);
            }

            const body = await readJsonBody(request, maxBodyBytes);
            for (const [name, value] of Object.entries(cors)) {
                response.setHeader(name, value);
            }

            const server = createServer(getService(), { version });
            const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
            response.on('close', () => {
                transport.close();
                server.close();
            });
            await server.connect(transport);
            await transport.handleRequest(request, response, body);
        } catch (error) {
            if (error instanceof HttpError) {
                return sendRpcError(response, error);
            }
            log(`요청 처리 중 오류: ${error.stack ?? error.message}`);
            sendRpcError(response, new HttpError(500, -32603, '서버 내부 오류가 발생했습니다.'));
        }
    };
}

export { LOOPBACK_HOSTS, MCP_PATH };
