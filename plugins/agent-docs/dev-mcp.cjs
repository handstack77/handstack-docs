'use strict';

// 개발 서버(npm run start)에서 mcp/ 의 MCP 서버를 자식 프로세스로 띄우고 감시합니다.
// 개발 서버는 사이트가 바뀔 때마다 플러그인을 다시 만들 수 있으므로 상태는 모듈 범위에 하나만 둡니다.
const { spawn } = require('child_process');
const fs = require('fs');
const net = require('net');
const path = require('path');

const LOG_PREFIX = '[agent-docs:mcp]';
const state = {
    child: null,
    port: 0,
    ready: false,
    stopping: false,
    failures: 0,
    starting: null,
    unavailable: '',
    exitHookRegistered: false,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function findFreePort() {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.once('error', reject);
        server.listen(0, '127.0.0.1', () => {
            const { port } = server.address();
            server.close(() => resolve(port));
        });
    });
}

function pipeLines(stream, write) {
    let buffer = '';
    stream.setEncoding('utf8');
    stream.on('data', (chunk) => {
        buffer += chunk;
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop();
        for (const line of lines) {
            if (line.trim()) {
                write(`${LOG_PREFIX} ${line}`);
            }
        }
    });
}

async function waitUntilReady(port, child) {
    for (let attempt = 0; attempt < 150 && child.exitCode === null; attempt += 1) {
        try {
            const response = await fetch(`http://127.0.0.1:${port}/healthz`);
            if (response.ok) {
                return true;
            }
        } catch {
            // 아직 포트를 열지 않았습니다.
        }
        await sleep(200);
    }
    return false;
}

function registerExitHook() {
    if (state.exitHookRegistered) {
        return;
    }
    state.exitHookRegistered = true;
    process.once('exit', () => {
        state.stopping = true;
        state.child?.kill();
    });
}

async function launch(options) {
    const { mcpDir, indexFile, publicUrl } = options;
    const port = await findFreePort();

    const child = spawn(process.execPath, [path.join(mcpDir, 'bin', 'serve.mjs'), '--host', '127.0.0.1', '--port', String(port)], {
        cwd: mcpDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
        env: {
            ...process.env,
            HANDSTACK_DOCS_INDEX: indexFile,
            HANDSTACK_DOCS_PUBLIC_URL: publicUrl,
            // 개발 중에는 문서를 고친 뒤 빨리 확인할 수 있게 자주 다시 읽고, 요청 제한은 두지 않습니다.
            HANDSTACK_DOCS_RELOAD_MINUTES: process.env.HANDSTACK_DOCS_RELOAD_MINUTES ?? '1',
            HANDSTACK_DOCS_RATE_LIMIT: process.env.HANDSTACK_DOCS_RATE_LIMIT ?? '0',
            HANDSTACK_DOCS_PARENT_PID: String(process.pid),
        },
    });

    state.child = child;
    state.port = port;
    state.ready = false;
    pipeLines(child.stdout, (line) => console.log(line));
    pipeLines(child.stderr, (line) => console.log(line));

    child.once('exit', (code) => {
        state.ready = false;
        state.child = null;
        if (state.stopping) {
            return;
        }

        state.failures += 1;
        const delay = Math.min(30000, 1000 * 2 ** Math.min(state.failures, 5));
        console.warn(`${LOG_PREFIX} 서버가 종료되었습니다(코드 ${code}). ${delay / 1000}초 후 다시 시작합니다.`);
        setTimeout(() => {
            launch(options).catch((error) => console.warn(`${LOG_PREFIX} 다시 시작하지 못했습니다: ${error.message}`));
        }, delay).unref();
    });

    if (await waitUntilReady(port, child)) {
        state.ready = true;
        state.failures = 0;
        console.log(`${LOG_PREFIX} 준비되었습니다: ${publicUrl}`);
    }
}

// 여러 번 호출해도 프로세스는 하나만 유지합니다.
function startDevMcp(options) {
    const script = path.join(options.mcpDir, 'bin', 'serve.mjs');
    if (!fs.existsSync(script)) {
        state.unavailable = `${options.mcpDir} 에 MCP 서버가 없습니다.`;
        return Promise.resolve();
    }
    if (!fs.existsSync(path.join(options.mcpDir, 'node_modules', '@modelcontextprotocol'))) {
        const reason = 'mcp/ 에 의존성이 설치되지 않았습니다. "npm install --prefix mcp" 를 실행하면 /mcp 가 열립니다.';
        if (state.unavailable !== reason) {
            console.warn(`${LOG_PREFIX} ${reason}`);
        }
        state.unavailable = reason;
        return Promise.resolve();
    }

    state.unavailable = '';
    registerExitHook();
    if (state.child || state.starting) {
        return state.starting ?? Promise.resolve();
    }

    state.starting = launch(options).finally(() => {
        state.starting = null;
    });
    return state.starting;
}

// 개발 서버 프록시가 요청마다 호출합니다. 준비되기 전에는 null 입니다.
function getTarget() {
    return state.ready ? `http://127.0.0.1:${state.port}` : null;
}

function getUnavailableReason() {
    return state.unavailable;
}

module.exports = { startDevMcp, getTarget, getUnavailableReason };
