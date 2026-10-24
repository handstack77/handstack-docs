// Node 스크립트가 쓰는 파이썬 실행 파일 탐색.
// Windows의 python3는 Microsoft Store 스텁이라 실행하면 node가 비정상 종료하므로 후보에서 뺍니다.
import { spawnSync } from 'node:child_process';

export function findPython() {
    // Windows는 py 런처를 먼저 본다(없으면 실행 실패일 뿐이지만 Store 스텁 python은 실행하면 node가 비정상 종료한다).
    const candidates = process.platform === 'win32' ? ['py', 'python'] : ['python3', 'python'];
    const python = candidates.find((name) => spawnSync(name, ['--version']).status === 0);
    if (!python) {
        console.error(`Python 3.10 이상이 필요합니다(${candidates.join(' 또는 ')}).`);
        process.exit(1);
    }
    return python;
}

export function runPython(python, cwd, args) {
    return spawnSync(python, ['-B', '-X', 'utf8', ...args], { cwd, stdio: 'inherit' });
}
