// 스킬 배포 zip 생성: `npm run package:agent`
// 검증(check.mjs)을 통과한 뒤에만 만들고, 사이트 정적 파일 폴더(static/agent-skills/)에 둡니다.
// 사이트 빌드(npm run build) 전에 실행하면 /agent-skills/handstack-developer-skills.zip 으로 배포됩니다. 결과물은 저장소에 커밋하지 않습니다.
// publish 스크립트가 호출하므로, 실패하면 이전 실행에서 남은 zip이 배포되지 않도록 시작할 때 기존 zip부터 지웁니다.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findPython, runPython } from './python.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = join(root, '..', 'static', 'agent-skills');
const output = join(outputDir, 'handstack-developer-skills.zip');

if (existsSync(output)) {
    rmSync(output);
}

const check = spawnSync(process.execPath, [join(root, 'scripts', 'check.mjs')], { stdio: 'inherit' });
if (check.status !== 0) {
    console.error('검증에 실패해 zip을 만들지 않습니다. (Python 3.10 이상이 필요합니다.)');
    process.exit(1);
}

mkdirSync(outputDir, { recursive: true });
const result = runPython(findPython(), root, ['scripts/package_bundle.py', '--output', output]);
process.exit(result.status ?? 1);
