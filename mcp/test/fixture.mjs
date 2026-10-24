// 테스트용 최소 문서 인덱스입니다. (플러그인이 만드는 schema 1 형식)
function build(docs) {
    const index = { schema: 1, generatedAt: 'test', baseUrl: 'https://handstack.kr', docs: [], chunks: [], samples: [] };
    docs.forEach((doc, docIndex) => {
        index.docs.push({ ...doc, url: `https://handstack.kr/docs/${doc.id}`, source: `docs/${doc.id}.mdx` });
        let offset = 0;
        for (const part of doc.parts) {
            const text = `${part.body}\n`;
            const start = doc.markdown.indexOf(text, offset);
            index.chunks.push([docIndex, part.heading, part.anchor, start, start + text.length]);
            offset = start + text.length;
        }
    });
    return index;
}

function doc(id, title, section, parts, extra = {}) {
    const markdown = parts.map((part) => `${part.body}\n`).join('');
    return { id, title, description: '', section, module: null, optional: false, markdown, parts, ...extra };
}

export const fixtureIndex = build([
    doc('reference/거래-호출', '화면에서 거래 호출하기', 'reference', [
        { heading: '화면에서 거래 호출하기 > 구문', anchor: '구문', body: 'syn.$w.transactionAction은 화면의 거래 설정을 등록하고 서버 요청을 시작합니다.' },
        { heading: '화면에서 거래 호출하기 > 기본 옵션', anchor: '기본-옵션', body: '| 옵션 | 기본값 |\n| message | 빈 문자열 |' },
    ]),
    doc('startup/handsonlab/게시판-프로젝트-시작하기', '게시판 프로젝트 시작하기', 'startup', [
        { heading: '게시판 프로젝트 시작하기 > 쿼리 ID 규칙', anchor: '쿼리-id-규칙', body: '기능구분 1자리 + 명령구분 1자리 + 순번 2자리 = LD01 4자리로 구성합니다.' },
    ]),
    doc('reference/api/modules/prompter', 'prompter', 'reference', [
        { heading: 'prompter > 책임 범위', anchor: '책임-범위', body: 'KernelPlugin, MCP 서버, CLI 도구 사용 범위를 allowlist로 제한합니다.' },
    ], { module: 'prompter' }),
    doc('reference/vide-coding-instruction/examples/CLAUDE', 'CLAUDE.md', 'reference', [
        { heading: 'CLAUDE.md > 핵심 규칙', anchor: '핵심-규칙', body: '쿼리 ID 규칙과 무관한 범용 코드 스타일 규칙입니다. 쿼리 ID 규칙 쿼리 ID 규칙.' },
    ], { optional: true }),
]);

fixtureIndex.samples.push(
    { path: 'sample/prompter/decision/JEV010.xml', url: 'https://handstack.kr/sample/prompter/decision/JEV010.xml', text: '<decision />' },
    { path: 'sample/dbclient/BOD010.xml', url: 'https://handstack.kr/sample/dbclient/BOD010.xml', text: '<mapper />' },
);
