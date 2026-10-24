#!/usr/bin/env node
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { parseConfig } from '../src/cli.mjs';
import { createServiceHolder } from '../src/holder.mjs';
import { createHttpHandler } from '../src/http.mjs';
import { loadIndex } from '../src/index-source.mjs';
import { watchParent } from '../src/parent-watch.mjs';

const log = (message) => console.error(`[handstack-docs-mcp] ${message}`);

const { version } = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));

try {
    const config = parseConfig(process.argv.slice(2), process.env);

    const holder = await createServiceHolder({
        load: () => loadIndex(),
        intervalMs: config.reloadMinutes * 60 * 1000,
        log,
    });
    const handler = createHttpHandler({
        getService: holder.get,
        version,
        publicUrl: config.publicUrl,
        defaultPublicUrl: config.defaultPublicUrl,
        allowedOrigins: config.allowedOrigins,
        allowedHosts: config.allowedHosts,
        trustProxy: config.trustProxy,
        rateLimit: config.rateLimit,
        log,
    });

    const server = http.createServer(handler);
    server.requestTimeout = 30 * 1000;
    server.headersTimeout = 10 * 1000;
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(config.port, config.host, resolve);
    });

    const { index } = holder.get();
    log(`http://${config.host}:${server.address().port}/mcp — 문서 ${index.docs.length}건 (인덱스 생성: ${index.generatedAt})`);

    const shutdown = () => {
        holder.stop();
        server.close(() => process.exit(0));
        setTimeout(() => process.exit(0), 3000).unref();
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    // 사이트 호스트가 자식으로 실행한 경우 호스트가 사라지면 함께 종료합니다.
    watchParent(Number(process.env.HANDSTACK_DOCS_PARENT_PID), () => {
        log('부모 프로세스가 종료되어 서버를 종료합니다.');
        shutdown();
    });
} catch (error) {
    log(error.message);
    process.exit(1);
}
