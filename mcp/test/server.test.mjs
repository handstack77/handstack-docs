import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server.mjs';
import { DocsService } from '../src/service.mjs';
import { fixtureIndex } from './fixture.mjs';

async function connect() {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await createServer(new DocsService(fixtureIndex)).connect(serverTransport);
    const client = new Client({ name: 'test', version: '0.0.0' });
    await client.connect(clientTransport);
    return client;
}

test('도구 4개를 노출한다', async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map((tool) => tool.name).sort(), ['get_doc', 'get_sample', 'list_docs', 'search_docs']);
});

test('search_docs -> get_doc 흐름', async () => {
    const client = await connect();
    const search = await client.callTool({ name: 'search_docs', arguments: { query: 'transactionAction' } });
    assert.match(search.content[0].text, /id: reference\/거래-호출/);

    const doc = await client.callTool({ name: 'get_doc', arguments: { doc: 'reference/거래-호출' } });
    assert.match(doc.content[0].text, /^# 화면에서 거래 호출하기/);
});

test('없는 문서는 isError', async () => {
    const client = await connect();
    const result = await client.callTool({ name: 'get_doc', arguments: { doc: 'no/such/doc' } });
    assert.equal(result.isError, true);
});
