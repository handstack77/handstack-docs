import assert from 'node:assert/strict';
import http from 'node:http';
import { test } from 'node:test';
import { loadIndex } from '../src/index-source.mjs';
import { fixtureIndex } from './fixture.mjs';

test('URL 인덱스는 호출할 때마다 새로 받는다', async () => {
    let generation = 0;
    const server = http.createServer((request, response) => {
        generation += 1;
        response.setHeader('content-type', 'application/json');
        response.end(JSON.stringify({ ...fixtureIndex, generatedAt: `g${generation}` }));
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

    try {
        const source = `http://localhost:${server.address().port}/agent/docs-index.json`;
        assert.equal((await loadIndex({ source })).generatedAt, 'g1');
        assert.equal((await loadIndex({ source })).generatedAt, 'g2');
    } finally {
        server.close();
    }
});

test('로컬 서버가 오류를 응답하면 원인을 알려 준다', async () => {
    const server = http.createServer((request, response) => {
        response.statusCode = 404;
        response.end();
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

    try {
        await assert.rejects(loadIndex({ source: `http://127.0.0.1:${server.address().port}/x.json` }), /HTTP 404/);
    } finally {
        server.close();
    }
});

test('파일 경로 인덱스를 읽는다', async () => {
    const { mkdtemp, writeFile, rm } = await import('node:fs/promises');
    const { tmpdir } = await import('node:os');
    const { join } = await import('node:path');

    const dir = await mkdtemp(join(tmpdir(), 'docs-index-'));
    try {
        const file = join(dir, 'docs-index.json');
        await writeFile(file, JSON.stringify(fixtureIndex));
        assert.equal((await loadIndex({ source: file })).docs.length, fixtureIndex.docs.length);

        await writeFile(file, JSON.stringify({ schema: 2 }));
        await assert.rejects(loadIndex({ source: file }), /지원하지 않는 문서 인덱스 형식/);
    } finally {
        await rm(dir, { recursive: true, force: true });
    }
});
