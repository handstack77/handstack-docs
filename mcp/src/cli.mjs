import { LOOPBACK_HOSTS } from './http.mjs';

const DEFAULT_HTTP_PORT = 8787;
const DEFAULT_HTTP_HOST = '127.0.0.1';

function list(value) {
    return (value ?? '').split(',').map((item) => item.trim()).filter(Boolean);
}

function numberOr(value, fallback) {
    const parsed = Number(value);
    return value !== undefined && value !== '' && Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * 실행 인자와 환경 변수를 실행 설정으로 바꿉니다. 인자가 환경 변수보다 우선합니다.
 *   --port <n>          포트 (HANDSTACK_DOCS_HTTP_PORT, 기본 8787)
 *   --host <h>          바인딩 주소 (HANDSTACK_DOCS_HTTP_HOST, 기본 127.0.0.1)
 */
export function parseConfig(argv, env = {}) {
    const flags = new Map();
    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];
        if (!arg.startsWith('--')) {
            throw new Error(`알 수 없는 인자입니다: ${arg}`);
        }
        const [name, inline] = arg.slice(2).split('=');
        if (['port', 'host'].includes(name)) {
            flags.set(name, inline ?? argv[++i]);
        } else {
            throw new Error(`알 수 없는 옵션입니다: --${name}`);
        }
    }

    const host = flags.get('host') ?? env.HANDSTACK_DOCS_HTTP_HOST ?? DEFAULT_HTTP_HOST;
    const port = numberOr(flags.get('port') ?? env.HANDSTACK_DOCS_HTTP_PORT, DEFAULT_HTTP_PORT);
    if (!Number.isInteger(port) || port < 0 || port > 65535) {
        throw new Error(`포트가 올바르지 않습니다: ${port}`);
    }

    // 루프백에 바인딩하면 로컬 Host 만 허용합니다. 외부에 열 때는 ALLOWED_HOSTS 를 지정하세요.
    const extraHosts = list(env.HANDSTACK_DOCS_ALLOWED_HOSTS).map((item) => item.toLowerCase());
    const isLoopback = LOOPBACK_HOSTS.includes(host) || host === '::1';
    let allowedHosts = null;
    if (extraHosts.length > 0) {
        allowedHosts = isLoopback ? [...LOOPBACK_HOSTS, ...extraHosts] : extraHosts;
    } else if (isLoopback) {
        allowedHosts = LOOPBACK_HOSTS;
    }

    return {
        host,
        port,
        allowedHosts,
        allowedOrigins: list(env.HANDSTACK_DOCS_ALLOWED_ORIGINS),
        trustProxy: env.HANDSTACK_DOCS_TRUST_PROXY === 'true',
        rateLimit: { limit: numberOr(env.HANDSTACK_DOCS_RATE_LIMIT, 60), windowMs: 60 * 1000 },
        publicUrl: env.HANDSTACK_DOCS_PUBLIC_URL ?? `http://localhost:${port}/mcp`,
        reloadMinutes: numberOr(env.HANDSTACK_DOCS_RELOAD_MINUTES, 10),
    };
}
