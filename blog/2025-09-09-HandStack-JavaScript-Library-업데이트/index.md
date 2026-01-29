---
slug: HandStack-JavaScript-Library-업데이트
title: HandStack JavaScript Library 업데이트
authors: [handstack77]
tags: [handstack]
---

이번 syn.js HandStack 라이브러리의 업데이트는 최신 웹 표준 API를 적극적으로 도입하여 사용자 경험(UX)을 향상시키고, 실시간 통신 기능을 강화하며, 개발 편의성을 높이는 데 중점을 두었습니다.

- 최신 브라우저 API 연동 강화
- 실시간 통신 기능 (SSE, WebSocket) 추가
- DOM 조작 및 동적 기능 확장
- URL 및 스토리지 관리 편의성 개선



## 브라우저 API 연동 강화: `syn.$b`

브라우저의 네이티브 기능을 더 쉽게 활용할 수 있도록 새로운 헬퍼 함수들이 추가되었습니다.

**Web Share API 연동**

- `syn.$b.canShare(data)`: 공유 가능 여부 확인
- `syn.$b.share(data)`: 시스템 공유 UI 호출

```js
const shareData = {
    title: 'HandStack',
    text: 'HandStack 의 목표는 개발자가 좋아하고 기업이 신뢰하는 비즈니스 앱 '시스템'을 제공 하는 것입니다.',
    url: 'https://handstack.kr',
    files: Array.from(files) // 지원하는 환경에서만 가능
}
await syn.$b.share(shareData);
```

**Performance API 연동**

- `syn.$b.getPerformanceEntries(options)`: 성능 측정 항목 조회
- `syn.$b.markPerformance(name)`: 성능 측정 시점 마킹
- `syn.$b.measurePerformance(name, start, end)`: 두 마크 사이의 시간 측정

```js
const navigationEntry = syn.$l.getPerformanceEntries({ type: 'navigation' });
const transactionEntry = syn.$l.getPerformanceEntries({ name: resolveUrl('/transact/api/transaction/execute'), type: 'resource' });

syn.$b.markPerformance('start-data-processing');
// ... 데이터 처리 로직 ...
syn.$b.markPerformance('end-data-processing');
syn.$b.measurePerformance('data-processing-time', 'start-data-processing', 'end-data-processing');
const [measureEntry] = syn.$b.getPerformanceEntries({ type: 'measure', name: 'data-processing-time' });
if(measureEntry) {
    console.log(`데이터 처리 시간: ${measureEntry.duration.toFixed(2)}ms`);
}
```

**기타 정보 추가**

- `effectiveType`: 현재 네트워크 연결 유형 정보 (`4g`, `slow-2g` 등)



## DOM 조작 및 애니메이션: `syn.$m`

DOM을 더욱 유연하게 제어하고 간단한 시각적 효과를 추가하는 함수가 포함되었습니다.

- `insertBefore(el, targetEL)`
    - 지정된 대상 엘리먼트 앞에 새 엘리먼트를 삽입합니다.

- `fade(el, options)`
    - 엘리먼트의 투명도를 조절하여 부드러운 페이드 인/아웃 효과를 구현합니다.
    - `requestAnimationFrame`을 사용하여 성능에 최적화된 애니메이션을 제공합니다.

```js
// 1초 동안 엘리먼트를 서서히 투명하게 만듭니다.
syn.$m.fade('myElement', {
    duration: 1000,
    from: 1,
    to: 0,
    callback: function() {
        syn.$l.eventLog('페이드 아웃 완료');
    }
});
```



## 문자열 처리 능력 향상: `syn.$s`

다국어 환경을 고려한 고급 문자열 분석 기능이 추가되었습니다.

- `toStringCounts(text, locale)`
    - `Intl.Segmenter` API를 사용하여 언어 규칙에 맞게 문자, 단어, 문장의 수를 정확하게 계산합니다.
    - 한국어, 일본어 등 복합적인 언어에서도 높은 정확도를 보입니다.

```js
const text = "안녕하세요. HandStack 입니다! 만나서 반갑습니다.";
const counts = syn.$s.toStringCounts(text, 'ko-KR');

console.log(counts);
// { characters: 33, words: 6, sentences: 2 }
```



## URL 관리 편의성 증대: `syn.$r`

URL을 객체처럼 다룰 수 있는 직관적인 유틸리티 함수들이 추가되었습니다.

- `resolveUrl(relativePath, baseUrl)`
    - 기준 URL을 바탕으로 상대 경로의 전체 URL을 계산합니다.
- `addQueryParam(param, value, urlStr)`
    - URL에 쿼리 파라미터를 추가합니다.
- `removeQueryParam(paramName, urlStr)`
    - URL에서 특정 쿼리 파라미터를 제거합니다.
- `setQueryParam(param, value, urlStr)`
    - URL의 쿼리 파라미터 값을 설정하거나 새로 추가합니다. (기존 값 덮어쓰기)

```js
syn.$r.resolveUrl('/api/v1/users', 'https://example.com'); // https://example.com/api/v1/users
syn.$r.resolveUrl('/api/v1/users', 'https://example.com/api/v2'); // https://example.com/api/v1/users
syn.$r.resolveUrl('../v1/users/', 'https://example.com/api/v2'); // https://example.com/api/v1/users
syn.$r.resolveUrl('users', 'https://example.com/api/v1/groups'); // https://example.com/api/v1/users
const usersApiUrl = syn.$r.resolveUrl('/api/users');
```


## 실시간 통신 기능 추가: `syn.$n`

서버와 실시간으로 데이터를 주고받을 수 있는 SSE(Server-Sent Events)와 WebSocket 기능이 `syn.$network` 모듈에 통합되었습니다.

- **Server-Sent Events (SSE) 지원**
    - `startSse(id, url, handlers)`: SSE 연결 시작
    - `stopSse(id)` / `stopAllSse()`: SSE 연결 중지

- **WebSocket 지원**
    - `startSocket(id, url, handlers)`: WebSocket 연결 시작
    - `sendSocketMessage(id, message)`: 메시지 전송
    - `stopSocket(id)` / `stopAllSockets()`: WebSocket 연결 중지



## 실시간 통신 기능 예시: `syn.$n`

```js
// SSE 이벤트 핸들러 정의
const sseHandler = {
    open: () => console.log('SSE 연결 성공!'),
    message: (event) => console.log('수신 데이터:', event.data),
    error: (err) => console.error('SSE 오류:', err)
};

// SSE 연결 시작
syn.$n.startSse('my-sse-stream', '/api/events', sseHandler);

// WebSocket 이벤트 핸들러 정의
const wsHandler = {
    open: () => syn.$n.sendSocketMessage('my-socket', { action: 'join', room: 'general' }),
    message: (data) => console.log('수신 메시지:', data),
};

// WebSocket 연결 시작
syn.$n.startSocket('my-socket', 'wss://example.com/ws', wsHandler);
```



## UX 및 동적 기능 확장: `syn.$w` (1/2)

사용자 경험을 개선하고 동적인 웹 페이지를 구현하기 위한 다양한 기능이 `syn.$webform` 모듈에 추가되었습니다.

- **클립보드 복사**
    - `copyToClipboard(text)`: 텍스트를 클립보드에 복사합니다. Clipboard API를 우선 사용하며, 구형 브라우저를 위한 대체 기능도 포함합니다.
- **무한 스크롤 (Intersection Observer)**
    - `startIntersection(id, placeholder, callback)`: 스크롤이 특정 지점에 도달하면 콜백 함수를 실행하여 콘텐츠를 동적으로 로드합니다.
- **다크 모드 감지**
    - `isDarkMode`: 사용자의 시스템 테마가 다크 모드인지 여부를 확인하고, 변경 시 자동으로 업데이트됩니다.

```js
function loadMoreContent(done) {
	   done(true);
}

syn.$w.startIntersection(
    'my-list-scroll', 
    '#loading-placeholder', 
    loadMoreContent,
    {
        rootMargin: '100px' // placeholder가 화면 상하좌우 100px 안으로 들어오면 미리 로드 시작
    }
);
```


## UX 및 동적 기능 확장: `syn.$w` (2/2)

- **동적 CSS 규칙 관리**
    - `getDynamicStyle(styleID)`: 동적으로 제어할 `<style>` 시트를 가져오거나 생성합니다.
    - `addCssRule(rules, styleID)`: CSS 규칙을 동적으로 추가합니다.
    - `removeCssRule(identifier, styleID)`: CSS 규칙을 동적으로 제거합니다.
- **개선된 유틸리티**
    - `fetchImage(url, fallbackUrl)`: 이미지 로딩을 Promise 기반으로 처리하며, 실패 시 대체 이미지를 로드할 수 있습니다.
    - `getStorage(prop, isLocal)`: 여러 개의 키를 배열로 전달하여 스토리지에서 여러 항목을 한 번에 가져올 수 있도록 개선되었습니다.
    - `getStorageKeys(isLocal)`: 스토리지의 모든 키 목록을 반환합니다.

```js
syn.$l.addCssRule('.highlight { background-color: yellow; font-weight: bold; }', 'page-style');
syn.$l.addCssRule('div { border: 1px solid red; }', 'page-styles');
syn.$l.addCssRule('span { border: 1px solid blue; }', 'page-styles');
syn.$l.removeCssRule('.highlight', 'page-styles');
const loadedImage = await syn.$w.fetchImage('path/to/image.jpg', 'path/to/fallback.png');
```

## 모듈 의존성 개선: `syn.$p`

`syn.$print` 모듈이 `Clipboard.js` 라이브러리에 대한 의존성을 제거하고, 새롭게 추가된 `syn.$w.copyToClipboard` 함수를 활용하도록 개선되었습니다.

- `getSchemeText(excelUrl, formatted, indent)`
    - 이전에는 `Clipboard.js`가 있어야만 클립보드 복사 기능이 동작했습니다.
    - 이제는 라이브러리 내장 함수인 `syn.$w.copyToClipboard`를 대체 기능으로 사용하여 외부 라이브러리 없이도 핵심 기능을 제공합니다.
    - 이를 통해 라이브러리의 전체적인 용량을 줄이고 모듈 간의 유기적인 연동을 강화했습니다.
