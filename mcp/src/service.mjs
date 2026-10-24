import { ChunkSearcher, makeSnippet } from './search.mjs';

const DEFAULT_MAX_CHARS = 40000;
const MAX_HITS_PER_DOC = 2;
// 범용 템플릿·발표 자료 같은 보조 문서는 HandStack 규칙 질의에서 뒤로 미룹니다.
const OPTIONAL_DOC_PENALTY = 0.6;

export const SECTION_LABELS = {
    startup: '시작하기',
    tutorial: '따라 만들기',
    guides: '작업별 가이드',
    reference: 'API·설정 참조',
    ide: 'IDE 사용하기',
    twelvefactor: '배포·운영 원칙 (12-Factors)',
    etc: '기타',
};

function truncate(text, maxChars) {
    if (text.length <= maxChars) {
        return { text, truncated: false };
    }
    return { text: text.slice(0, maxChars), truncated: true };
}

function normalizeKey(value) {
    return value.trim().toLowerCase().replace(/\\/g, '/').replace(/\.mdx?$/, '').replace(/\/+$/, '');
}

function safeDecode(value) {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

function stripDocsUrl(value, baseUrl) {
    return value.replace(safeDecode(baseUrl), '').replace(/^\/?docs\//, '');
}

function docKeys(doc, baseUrl) {
    return [
        normalizeKey(doc.id),
        normalizeKey(doc.source.replace(/^docs\//, '')),
        normalizeKey(stripDocsUrl(doc.url, baseUrl)),
    ];
}

export class DocsService {
    constructor(index) {
        this.index = index;
        this.docs = index.docs;
        this.baseUrl = index.baseUrl;

        this.chunks = index.chunks.map(([docIndex, heading, anchor, start, end]) => ({
            docIndex,
            heading,
            anchor,
            text: this.docs[docIndex].markdown.slice(start, end),
        }));
        this.searcher = new ChunkSearcher(this.chunks);
    }

    searchDocs({ query, section, module, limit = 5 }) {
        const filter = (chunkIndex) => {
            const doc = this.docs[this.chunks[chunkIndex].docIndex];
            return (!section || doc.section === section) && (!module || doc.module === module);
        };

        const { hits, queryTokens } = this.searcher.search(query, { filter: section || module ? filter : null });
        const adjusted = hits
            .map((hit) => ({ ...hit, score: this.docs[this.chunks[hit.chunkIndex].docIndex].optional ? hit.score * OPTIONAL_DOC_PENALTY : hit.score }))
            .sort((a, b) => b.score - a.score);
        const perDoc = new Map();
        const results = [];

        for (const hit of adjusted) {
            const chunk = this.chunks[hit.chunkIndex];
            const used = perDoc.get(chunk.docIndex) ?? 0;
            if (used >= MAX_HITS_PER_DOC) {
                continue;
            }
            perDoc.set(chunk.docIndex, used + 1);

            const doc = this.docs[chunk.docIndex];
            results.push({
                id: doc.id,
                title: doc.title,
                heading: chunk.heading,
                url: chunk.anchor ? `${doc.url}#${chunk.anchor}` : doc.url,
                section: doc.section,
                module: doc.module,
                score: Number(hit.score.toFixed(2)),
                snippet: makeSnippet(chunk.text, queryTokens),
            });
            if (results.length >= limit) {
                break;
            }
        }
        return results;
    }

    // id, 소스 경로, URL, 제목 일부 순으로 문서를 찾습니다.
    resolveDoc(reference) {
        const key = normalizeKey(stripDocsUrl(safeDecode(reference).replace(/#.*$/, ''), this.baseUrl));
        const exact = this.docs.filter((doc) => docKeys(doc, this.baseUrl).includes(key));
        if (exact.length === 1) {
            return { doc: exact[0] };
        }

        const loose = this.docs.filter((doc) => {
            return normalizeKey(doc.id).endsWith(`/${key}`) || doc.title.toLowerCase().includes(key);
        });
        if (loose.length === 1) {
            return { doc: loose[0] };
        }

        return { candidates: (exact.length > 1 ? exact : loose).slice(0, 10) };
    }

    getDoc({ doc: reference, section, maxChars = DEFAULT_MAX_CHARS }) {
        const resolved = this.resolveDoc(reference);
        if (!resolved.doc) {
            return { error: resolved.candidates.length > 0 ? 'ambiguous' : 'not-found', candidates: resolved.candidates ?? [] };
        }

        const doc = resolved.doc;
        const docIndex = this.docs.indexOf(doc);
        const sections = this.chunks.filter((chunk) => chunk.docIndex === docIndex);

        let body = doc.markdown;
        let matchedSections = null;
        if (section) {
            const needle = section.trim().replace(/^#+\s*/, '').toLowerCase();
            const matched = sections.filter((chunk) => {
                return chunk.anchor.toLowerCase() === needle || chunk.heading.toLowerCase().includes(needle);
            });
            if (matched.length === 0) {
                return { error: 'section-not-found', doc, headings: [...new Set(sections.map((chunk) => chunk.heading))] };
            }
            matchedSections = matched;
            body = matched.map((chunk) => chunk.text.trim()).join('\n\n');
        }

        const { text, truncated } = truncate(body, maxChars);
        return {
            doc,
            body: text,
            truncated,
            matchedSections,
            headings: truncated ? [...new Set(sections.map((chunk) => chunk.heading))] : null,
        };
    }

    listDocs({ section, module, prefix, limit = 200 }) {
        const normalizedPrefix = prefix ? normalizeKey(prefix) : null;
        const matched = this.docs.filter((doc) => {
            return (!section || doc.section === section)
                && (!module || doc.module === module)
                && (!normalizedPrefix || normalizeKey(doc.id).startsWith(normalizedPrefix));
        });

        const counts = {};
        for (const doc of this.docs) {
            counts[doc.section] = (counts[doc.section] ?? 0) + 1;
        }
        return { total: matched.length, docs: matched.slice(0, limit), counts };
    }

    getSample({ path: samplePath, query, maxChars = DEFAULT_MAX_CHARS }) {
        const samples = this.index.samples ?? [];

        if (samplePath) {
            const key = samplePath.replace(/\\/g, '/').replace(/^\/+/, '');
            const normalized = key.startsWith('sample/') ? key : `sample/${key}`;
            const sample = samples.find((item) => item.path === normalized);
            if (!sample) {
                return { error: 'not-found', candidates: samples.filter((item) => item.path.includes(key)).slice(0, 10) };
            }
            const { text, truncated } = truncate(sample.text, maxChars);
            return { sample, body: text, truncated };
        }

        if (query) {
            const needles = query.toLowerCase().split(/\s+/).filter(Boolean);
            const matched = samples.filter((item) => needles.every((needle) => item.path.toLowerCase().includes(needle)));
            return { matches: matched.slice(0, 50), total: matched.length };
        }

        const groups = new Map();
        for (const item of samples) {
            const parts = item.path.split('/');
            const group = parts.slice(0, Math.min(parts.length - 1, 3)).join('/');
            groups.set(group, (groups.get(group) ?? 0) + 1);
        }
        return { groups: [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0])) };
    }
}
