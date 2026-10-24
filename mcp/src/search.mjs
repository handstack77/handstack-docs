// 청크 단위 BM25 검색입니다. 한글은 형태소 분석 없이 문자 2-gram으로 토큰화합니다.
const HANGUL_RUN = /[ㄱ-ㆎ가-힣一-鿿]+/g;
const LATIN_WORD = /[A-Za-z0-9]+/g;

const K1 = 1.2;
const B = 0.75;
const HEADING_WEIGHT = 3;

export function tokenize(text) {
    const tokens = [];

    for (const word of text.match(LATIN_WORD) ?? []) {
        const lower = word.toLowerCase();
        tokens.push(lower);

        // transactionAction -> transaction, action
        const parts = word.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|[0-9]+/g) ?? [];
        if (parts.length > 1) {
            for (const part of parts) {
                tokens.push(part.toLowerCase());
            }
        }
    }

    for (const run of text.match(HANGUL_RUN) ?? []) {
        if (run.length === 1) {
            tokens.push(run);
            continue;
        }
        for (let i = 0; i < run.length - 1; i++) {
            tokens.push(run.slice(i, i + 2));
        }
    }

    return tokens;
}

function countTokens(tokens, weight, into) {
    for (const token of tokens) {
        into.set(token, (into.get(token) ?? 0) + weight);
    }
}

export class ChunkSearcher {
    // chunks: [{ heading, text }]
    constructor(chunks) {
        this.chunks = chunks;
        this.postings = new Map();
        this.lengths = new Array(chunks.length);

        let totalLength = 0;
        chunks.forEach((chunk, chunkIndex) => {
            const frequencies = new Map();
            countTokens(tokenize(chunk.heading), HEADING_WEIGHT, frequencies);
            countTokens(tokenize(chunk.text), 1, frequencies);

            let length = 0;
            for (const [token, frequency] of frequencies) {
                length += frequency;
                let list = this.postings.get(token);
                if (!list) {
                    list = [];
                    this.postings.set(token, list);
                }
                list.push([chunkIndex, frequency]);
            }
            this.lengths[chunkIndex] = length;
            totalLength += length;
        });

        this.averageLength = chunks.length > 0 ? totalLength / chunks.length : 1;
    }

    // filter(chunkIndex) => boolean 로 후보를 제한합니다.
    search(query, { filter = null } = {}) {
        const queryTokens = [...new Set(tokenize(query))];
        const scores = new Map();
        const total = this.chunks.length;

        for (const token of queryTokens) {
            const list = this.postings.get(token);
            if (!list) {
                continue;
            }

            const idf = Math.log(1 + (total - list.length + 0.5) / (list.length + 0.5));
            for (const [chunkIndex, frequency] of list) {
                if (filter && !filter(chunkIndex)) {
                    continue;
                }
                const norm = frequency + K1 * (1 - B + B * (this.lengths[chunkIndex] / this.averageLength));
                const score = idf * ((frequency * (K1 + 1)) / norm);
                scores.set(chunkIndex, (scores.get(chunkIndex) ?? 0) + score);
            }
        }

        const phrase = query.trim().toLowerCase();
        const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]).slice(0, 100);
        if (phrase.length >= 2) {
            for (const entry of ranked) {
                const chunk = this.chunks[entry[0]];
                if (chunk.heading.toLowerCase().includes(phrase) || chunk.text.toLowerCase().includes(phrase)) {
                    entry[1] *= 1.3;
                }
            }
            ranked.sort((a, b) => b[1] - a[1]);
        }

        return { hits: ranked.map(([chunkIndex, score]) => ({ chunkIndex, score })), queryTokens };
    }
}

// 질의어가 처음 나오는 위치 주변을 잘라 보여 줍니다.
export function makeSnippet(text, queryTokens, maxLength = 360) {
    const lower = text.toLowerCase();
    let first = -1;
    for (const token of queryTokens) {
        const position = lower.indexOf(token);
        if (position >= 0 && (first < 0 || position < first)) {
            first = position;
        }
    }

    const start = first > 80 ? first - 80 : 0;
    let snippet = text.slice(start, start + maxLength).replace(/\s+/g, ' ').trim();
    if (start > 0) {
        snippet = `…${snippet}`;
    }
    if (start + maxLength < text.length) {
        snippet = `${snippet}…`;
    }
    return snippet;
}
