import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

// 검색 결과로 이동한 문서의 하이라이트(?_highlight=...)를 Esc 키로 끕니다.
// 하이라이트 표시·해제는 검색 플러그인(@easyops-cn/docusaurus-search-local)이 주소의 _highlight를 읽어 처리하므로,
// 여기서는 주소에서 _highlight만 제거하고 라우터에 위치 변경을 알립니다. 검색창 입력값도 플러그인이 함께 비웁니다.
const HIGHLIGHT_PARAM = '_highlight';

function isTextInput(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
        return false;
    }

    return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

function clearHighlight(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing) {
        return;
    }

    if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
        return;
    }

    // 검색창 등 입력 중의 Esc는 각 입력 컨트롤(검색 목록 닫기 등)의 동작에 맡깁니다.
    if (isTextInput(event.target)) {
        return;
    }

    const url = new URL(window.location.href);
    if (!url.searchParams.has(HIGHLIGHT_PARAM)) {
        return;
    }

    url.searchParams.delete(HIGHLIGHT_PARAM);
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);

    // history 라이브러리는 popstate에서 현재 주소를 다시 읽어 라우터 위치를 갱신합니다.
    window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }));
}

if (ExecutionEnvironment.canUseDOM) {
    document.addEventListener('keydown', clearHighlight);
}
