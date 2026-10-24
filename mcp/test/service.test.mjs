import assert from 'node:assert/strict';
import { test } from 'node:test';
import { tokenize } from '../src/search.mjs';
import { DocsService } from '../src/service.mjs';
import { fixtureIndex } from './fixture.mjs';

const service = new DocsService(fixtureIndex);

test('tokenize: 카멜 케이스와 한글 2-gram 을 분리한다', () => {
    const tokens = tokenize('syn.$w.transactionAction 쿼리를');
    assert.ok(tokens.includes('transactionaction'));
    assert.ok(tokens.includes('transaction'));
    assert.ok(tokens.includes('action'));
    assert.ok(tokens.includes('쿼리'));
    assert.ok(tokens.includes('리를'));
});

test('searchDocs: 한글 조사가 붙어도 규칙 섹션을 찾는다', () => {
    const [first] = service.searchDocs({ query: '쿼리 ID 규칙을' });
    assert.equal(first.id, 'startup/handsonlab/게시판-프로젝트-시작하기');
    assert.match(first.url, /#쿼리-id-규칙$/);
});

test('searchDocs: 보조 자료 문서는 순위가 뒤로 밀린다', () => {
    const ids = service.searchDocs({ query: '쿼리 ID 규칙' }).map((result) => result.id);
    assert.ok(ids.indexOf('startup/handsonlab/게시판-프로젝트-시작하기') < ids.indexOf('reference/vide-coding-instruction/examples/CLAUDE'));
});

test('searchDocs: module, section 필터', () => {
    assert.deepEqual(service.searchDocs({ query: 'allowlist', module: 'prompter' }).map((r) => r.id), ['reference/api/modules/prompter']);
    assert.equal(service.searchDocs({ query: 'allowlist', section: 'startup' }).length, 0);
});

test('getDoc: id, URL, 제목 일부로 같은 문서를 찾는다', () => {
    for (const reference of ['reference/거래-호출', 'https://handstack.kr/docs/reference/거래-호출#구문', '거래 호출하기']) {
        assert.equal(service.getDoc({ doc: reference }).doc.id, 'reference/거래-호출');
    }
});

test('getDoc: 섹션만 반환하고 없는 섹션은 목록을 알려 준다', () => {
    const found = service.getDoc({ doc: 'reference/거래-호출', section: '기본 옵션' });
    assert.match(found.body, /message/);
    assert.doesNotMatch(found.body, /transactionAction/);

    const missing = service.getDoc({ doc: 'reference/거래-호출', section: '없는 섹션' });
    assert.equal(missing.error, 'section-not-found');
    assert.equal(missing.headings.length, 2);
});

test('getDoc: 없는 문서는 not-found', () => {
    assert.equal(service.getDoc({ doc: 'no/such/doc' }).error, 'not-found');
});

test('getSample: 목록, 검색, 본문 조회', () => {
    assert.ok(service.getSample({}).groups.length > 0);
    assert.equal(service.getSample({ query: 'prompter decision' }).total, 1);
    assert.equal(service.getSample({ path: 'prompter/decision/JEV010.xml' }).body, '<decision />');
});
