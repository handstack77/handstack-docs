import fs from 'node:fs/promises';
import path from 'node:path';

export const DEFAULT_INDEX_URL = 'https://handstack.kr/agent/docs-index.json';

const FETCH_TIMEOUT_MS = 15000;

function validate(index, origin) {
    if (index?.schema !== 1 || !Array.isArray(index.docs) || !Array.isArray(index.chunks)) {
        throw new Error(`지원하지 않는 문서 인덱스 형식입니다: ${origin}`);
    }
    return index;
}

// 인덱스 위치는 URL 또는 파일 경로입니다. 호출할 때마다 새로 읽으며 캐시하지 않습니다.
// 주기적 갱신은 호출하는 쪽(holder)이 맡습니다.
export async function loadIndex({ source = process.env.HANDSTACK_DOCS_INDEX || DEFAULT_INDEX_URL } = {}) {
    if (/^https?:\/\//i.test(source)) {
        const response = await fetch(source, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
        if (!response.ok) {
            throw new Error(`${source} 응답 오류: HTTP ${response.status}`);
        }
        return validate(await response.json(), source);
    }

    const file = path.resolve(source);
    return validate(JSON.parse(await fs.readFile(file, 'utf8')), file);
}
