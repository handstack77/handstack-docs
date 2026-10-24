// 에이전트 스킬 번들 통합 검증: `npm run check:agent`
// 번들 검증(금지어·링크·형식) → 문서 경로 인용 → 단위 테스트 순서로 실행하고, 하나라도 실패하면 실패로 끝냅니다.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findPython, runPython } from './python.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const python = findPython();

const steps = [
    ['번들 검증', ['scripts/validate_bundle.py']],
    ['문서 경로 인용 확인', ['scripts/check_doc_refs.py']],
    ['단위 테스트', ['-m', 'unittest', 'discover', '-s', 'tests']],
];

let failed = false;
for (const [label, args] of steps) {
    console.log(`\n== ${label}`);
    const result = runPython(python, root, args);
    if (result.status !== 0) {
        failed = true;
        console.error(`실패: ${label}`);
    }
}
process.exit(failed ? 1 : 0);
