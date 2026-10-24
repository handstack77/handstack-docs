import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { SECTION_LABELS } from './service.mjs';

const SECTION_KEYS = Object.keys(SECTION_LABELS);
const READ_ONLY = { readOnlyHint: true, idempotentHint: true, openWorldHint: false };

function text(content, isError = false) {
    return { content: [{ type: 'text', text: content }], ...(isError ? { isError: true } : {}) };
}

function formatDocHeader(doc) {
    return `# ${doc.title}\nURL: ${doc.url}\nid: ${doc.id}\n`;
}

function formatCandidates(candidates) {
    return candidates.map((doc) => `- ${doc.id} — ${doc.title}`).join('\n');
}

// service: DocsService. HTTP 모드에서는 요청마다 서버를 만들고 같은 service 를 공유합니다.
export function createServer(service, { version = '0.1.0' } = {}) {
    const server = new McpServer({ name: 'handstack-docs', version });

    server.registerTool('search_docs', {
        title: 'HandStack 문서 검색',
        description: 'HandStack 공식 문서를 키워드로 검색해 관련 섹션을 반환합니다. API 이름(syn.$w.transactionAction), 설정 키, 식별자(ApplicationID, 쿼리 ID), 오류 문구, 한글 개념어로 검색하세요. 결과의 id를 get_doc에 넘기면 본문을 읽을 수 있습니다.',
        inputSchema: {
            query: z.string().min(1).describe('검색어. 예: "쿼리 ID 규칙", "prompter MCP allowlist", "transactionAction 옵션"'),
            section: z.enum(SECTION_KEYS).optional().describe('문서 영역 제한: startup(시작하기) tutorial(따라 만들기) guides(작업별 가이드) reference(API·설정 참조) ide(IDE) twelvefactor(운영 원칙)'),
            module: z.string().optional().describe('서버 모듈 문서로 제한. 예: transact, dbclient, wwwroot, prompter, function'),
            limit: z.number().int().min(1).max(20).default(5).describe('반환할 결과 수'),
        },
        annotations: READ_ONLY,
    }, async ({ query, section, module, limit }) => {
        const results = service.searchDocs({ query, section, module, limit });
        if (results.length === 0) {
            return text(`"${query}"와 일치하는 문서가 없습니다. 더 짧은 키워드로 다시 검색하거나 list_docs로 목차를 확인하세요.`);
        }

        const lines = results.map((result, order) => {
            const tags = [result.section, result.module].filter(Boolean).join(' / ');
            return `${order + 1}. ${result.heading}  [${tags}]\n   id: ${result.id}\n   url: ${result.url}\n   ${result.snippet}`;
        });
        return text(`검색 결과 ${results.length}건 (get_doc으로 본문 확인)\n\n${lines.join('\n\n')}`);
    });

    server.registerTool('get_doc', {
        title: 'HandStack 문서 읽기',
        description: '문서 한 건의 마크다운 본문을 반환합니다. section을 주면 해당 섹션만 반환하므로 긴 문서는 section으로 필요한 부분만 읽으세요.',
        inputSchema: {
            doc: z.string().min(1).describe('search_docs/list_docs 결과의 id, 문서 URL, 또는 제목 일부. 예: "reference/거래-호출"'),
            section: z.string().optional().describe('읽을 섹션의 제목 일부 또는 앵커. 예: "기본 옵션"'),
            max_chars: z.number().int().min(1000).max(200000).default(40000).describe('반환할 최대 글자 수'),
        },
        annotations: READ_ONLY,
    }, async ({ doc, section, max_chars }) => {
        const result = service.getDoc({ doc, section, maxChars: max_chars });

        if (result.error === 'not-found') {
            return text(`"${doc}"에 해당하는 문서가 없습니다. search_docs나 list_docs로 id를 확인하세요.`, true);
        }
        if (result.error === 'ambiguous') {
            return text(`"${doc}"에 해당하는 문서가 여러 건입니다. 아래 id 중 하나를 지정하세요.\n${formatCandidates(result.candidates)}`, true);
        }
        if (result.error === 'section-not-found') {
            return text(`"${section}" 섹션을 찾지 못했습니다. 사용 가능한 섹션:\n${result.headings.map((heading) => `- ${heading}`).join('\n')}`, true);
        }

        let output = `${formatDocHeader(result.doc)}\n${result.body}`;
        if (result.truncated) {
            output += `\n\n…(${max_chars}자에서 잘림. section으로 일부만 읽으세요)\n\n섹션 목록:\n${result.headings.map((heading) => `- ${heading}`).join('\n')}`;
        }
        return text(output);
    });

    server.registerTool('list_docs', {
        title: 'HandStack 문서 목록',
        description: '문서 목록을 영역·모듈·경로 접두사로 좁혀 반환합니다. 인자 없이 호출하면 영역별 문서 수를 알려 줍니다.',
        inputSchema: {
            section: z.enum(SECTION_KEYS).optional().describe('문서 영역'),
            module: z.string().optional().describe('서버 모듈 이름. 예: transact'),
            prefix: z.string().optional().describe('id 접두사. 예: "tutorial/transact-거래계약"'),
        },
        annotations: READ_ONLY,
    }, async ({ section, module, prefix }) => {
        const result = service.listDocs({ section, module, prefix });

        if (!section && !module && !prefix) {
            const summary = Object.entries(result.counts)
                .map(([key, count]) => `- ${key} (${SECTION_LABELS[key] ?? key}): ${count}개`)
                .join('\n');
            return text(`영역별 문서 수 (section 인자로 목록을 확인하세요)\n${summary}`);
        }

        const lines = result.docs.map((doc) => `- ${doc.id} — ${doc.title}${doc.description ? `: ${doc.description}` : ''}`);
        const more = result.total > result.docs.length ? `\n…외 ${result.total - result.docs.length}건 (prefix로 좁히세요)` : '';
        return text(`문서 ${result.total}건\n${lines.join('\n')}${more}`);
    });

    server.registerTool('get_sample', {
        title: 'HandStack 예제 파일',
        description: '문서에 딸린 실행 가능한 예제(화면 HTML·JS, 계약 XML·JSON 등)를 조회합니다. 인자 없이 호출하면 예제 폴더 목록, query로 경로를 검색, path로 파일 내용을 반환합니다.',
        inputSchema: {
            path: z.string().optional().describe('예제 파일 경로. 예: "sample/prompter/decision/JEV010.xml"'),
            query: z.string().optional().describe('경로 검색어(공백으로 AND). 예: "prompter decision"'),
            max_chars: z.number().int().min(1000).max(200000).default(40000).describe('반환할 최대 글자 수'),
        },
        annotations: READ_ONLY,
    }, async ({ path, query, max_chars }) => {
        const result = service.getSample({ path, query, maxChars: max_chars });

        if (result.groups) {
            return text(`예제 폴더 (파일 수)\n${result.groups.map(([group, count]) => `- ${group} (${count})`).join('\n')}`);
        }
        if (result.matches) {
            const lines = result.matches.map((sample) => `- ${sample.path}`);
            return text(`경로 일치 ${result.total}건\n${lines.join('\n')}`);
        }
        if (result.error) {
            const hint = result.candidates.length > 0 ? `\n비슷한 경로:\n${result.candidates.map((sample) => `- ${sample.path}`).join('\n')}` : '';
            return text(`예제를 찾지 못했습니다: ${path}${hint}`, true);
        }

        const note = result.truncated ? `\n\n…(${max_chars}자에서 잘림)` : '';
        return text(`${result.sample.path}\nURL: ${result.sample.url}\n\n\`\`\`\n${result.body}\n\`\`\`${note}`);
    });

    return server;
}
