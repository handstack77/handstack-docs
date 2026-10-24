import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { test } from 'node:test';
import { watchParent } from '../src/parent-watch.mjs';

test('부모 PID 가 없으면 감시하지 않는다', () => {
    let called = false;
    const stop = watchParent(undefined, () => { called = true; }, 10);
    stop();
    assert.equal(called, false);
    assert.equal(typeof watchParent(Number('abc'), () => {}, 10), 'function');
});

test('살아 있는 프로세스는 종료로 보지 않는다', async () => {
    let called = false;
    const stop = watchParent(process.pid, () => { called = true; }, 20);
    await new Promise((resolve) => setTimeout(resolve, 100));
    stop();
    assert.equal(called, false);
});

test('부모가 종료되면 콜백을 호출한다', async () => {
    const child = spawn(process.execPath, ['-e', 'setTimeout(() => {}, 30)']);
    await once(child, 'exit');

    const gone = new Promise((resolve) => watchParent(child.pid, resolve, 20));
    await Promise.race([
        gone,
        new Promise((_, reject) => setTimeout(() => reject(new Error('콜백이 호출되지 않았습니다.')), 2000)),
    ]);
    assert.ok(true);
});
