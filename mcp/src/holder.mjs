import { DocsService } from './service.mjs';

// 장기 실행(HTTP) 서버용입니다. 인덱스를 주기적으로 다시 읽어 새 문서 배포를 재시작 없이 반영합니다.
export async function createServiceHolder({ load, intervalMs = 10 * 60 * 1000, log = () => {} }) {
    let service = new DocsService(await load());

    const refresh = async () => {
        try {
            const index = await load();
            if (index.generatedAt !== service.index.generatedAt) {
                service = new DocsService(index);
                log(`문서 인덱스를 갱신했습니다. (${index.generatedAt}, 문서 ${index.docs.length}건)`);
            }
        } catch (error) {
            log(`문서 인덱스 갱신에 실패해 이전 인덱스를 유지합니다: ${error.message}`);
        }
    };

    const timer = intervalMs > 0 ? setInterval(refresh, intervalMs) : null;
    timer?.unref();

    return {
        get: () => service,
        refresh,
        stop: () => clearInterval(timer),
    };
}
