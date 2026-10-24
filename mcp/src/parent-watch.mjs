// 부모 프로세스(사이트 호스트)가 강제 종료되어도 이 서버가 고아로 남지 않게 부모가 사라지면 콜백을 호출합니다.
export function watchParent(parentPid, onGone, intervalMs = 5000) {
    if (!Number.isInteger(parentPid) || parentPid <= 0) {
        return () => {};
    }

    const timer = setInterval(() => {
        try {
            process.kill(parentPid, 0);
        } catch (error) {
            // ESRCH: 프로세스 없음. EPERM 은 존재하지만 권한이 없는 경우라 살아 있는 것으로 봅니다.
            if (error.code === 'ESRCH') {
                clearInterval(timer);
                onGone();
            }
        }
    }, intervalMs);
    timer.unref();

    return () => clearInterval(timer);
}
