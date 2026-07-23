# syn.$bind API 참조

## 모듈 정보
| 항목 | 내용 |
|---|---|
| 전역 별칭 | `syn.$bind` |
| 소스 위치 | `2.Modules/wwwroot/wwwroot/js/syn.js` (약 11925~12468번째 줄, 원본 모듈: `1.WebHost/ack/wwwroot/assets/src/syn.binding.js`) |
| 예제 페이지 | `/sample/syn/binding.html` |
| 의존 모듈 | `syn.$l`(eventLog), `syn.$object`(getType) |
| 활성화 조건 | 없음. `syn.js` 로드 즉시 사용 가능. |
| HTML 속성 | `syn-bind="타입(인자):경로"`(세미콜론으로 다중 바인딩 나열), `syn-bind-list="경로"`(배열 반복 바인딩, `<template>` 자식 1개 필요), `syn-bind-adapter`(어댑터 이름을 별도 속성으로 지정하고 싶을 때) |

## 내장 바인딩 타입 (`syn.$bind.bindings`)
| 타입 | 인자 | 방향 | 이벤트 | 설명 |
|---|---|---|---|---|
| `text` | - | 단방향(store→DOM) | - | `el.textContent`에 값을 반영. |
| `html` | - | 단방향(store→DOM) | - | `el.innerHTML`에 값을 반영. |
| `show` | - | 단방향(store→DOM) | - | 값이 참이면 `display`를 원래대로, 거짓이면 `none`. |
| `hide` | - | 단방향(store→DOM) | - | `show`의 반대. |
| `disabled` | - | 단방향(store→DOM) | - | `el.disabled = !!value`. |
| `class(이름)` | 클래스명 | 단방향(store→DOM) | - | 값의 참/거짓에 따라 `classList.toggle(이름, value)`. |
| `attr(이름)` | 속성명 | 단방향(store→DOM) | - | 값이 `null`/`undefined`/`false`면 속성 제거, 아니면 `setAttribute`. |
| `style(속성)` | CSS 속성명 | 단방향(store→DOM) | - | `el.style[속성] = value`. |
| `value` | - | 양방향 | `input`(일반)/`change`(`SELECT`) | `el.value` 동기화. `type="number"`/`"range"`는 숫자로 변환해 store에 반영. |
| `checked` | - | 양방향 | `change` | `el.checked` 동기화(체크박스). |
| `radio` | - | 양방향 | `change` | `el.checked = (el.value === String(value))`, 변경 시 `el.value`를 store에 반영. |
| `edit` | - | 양방향 | `input` | `contenteditable` 요소의 `textContent` 동기화. |
| `adapter(어댑터명)` | 어댑터명(생략 시 `syn-bind-adapter` 속성 값 사용) | 양방향(어댑터 구현에 따름) | 어댑터의 `on`/`off` | `registerAdapter()`로 등록한 커스텀 컨트롤 어댑터를 연결. |

## 메서드

### `syn.$bind.createStore(data)`
- 설명: 순수 객체/평면 객체 배열을 Proxy로 감싼 반응형 `Store` 인스턴스를 생성합니다. DOM에 연결하지 않으며, 화면 반영이 필요하면 `subscribe()`로 직접 연결하거나 이후 `attach()`/`mount()`로 DOM에 붙여야 합니다.
- 매개변수
  | 이름 | 타입 | 필수 | 설명 |
  |---|---|---|---|
  | data | `object \| Array` | Y | 감쌀 원본 데이터(순수 객체 또는 평면 객체 배열). |
- 반환값: `Store`
- 예시
  ```js
  const store = syn.$bind.createStore({ count: 0 });
  ```

### `syn.$bind.mount(root, dataOrStore)`
- 설명: `createStore` + `attach`를 한 번에 수행합니다. `root` 내부에서 `[syn-bind-list]`, `[syn-bind]` 엘리먼트를 찾아 바인딩을 연결합니다.
- 매개변수
  | 이름 | 타입 | 필수 | 설명 |
  |---|---|---|---|
  | root | `HTMLElement \| DocumentFragment` | Y | 바인딩 대상을 탐색할 루트 노드. |
  | dataOrStore | `object \| Array \| Store` | Y | 순수 데이터를 넘기면 내부에서 `createStore`를 호출하고, 이미 만든 `Store`를 넘기면 그대로 재사용. |
- 반환값: `{ store: Store, destroy(): void }` — `destroy()`를 호출하면 이 `mount()` 호출로 생성된 모든 바인딩(DOM 이벤트 리스너, store 구독)이 해제됩니다.
- 예시
  ```js
  const mounted = syn.$bind.mount(document.body, { user: { name: '홍길동' } });
  mounted.store.data.user.name = '김철수';
  mounted.destroy();
  ```

### `syn.$bind.attach(root, store)`
- 설명: `mount()`의 저수준 버전으로, store를 새로 만들지 않고 이미 있는 `store`를 다른 DOM 영역에 추가로 연결만 합니다. 여러 화면 영역이 같은 store를 공유할 때 사용합니다.
- 매개변수
  | 이름 | 타입 | 필수 | 설명 |
  |---|---|---|---|
  | root | `HTMLElement \| DocumentFragment` | Y | 바인딩 대상을 탐색할 루트 노드. |
  | store | `Store` | Y | 연결할 기존 store. |
- 반환값: `Array<Function>` — 이 `attach()` 호출로 생성된 정리(cleanup) 함수 배열. 각 함수를 호출하면 해당 바인딩이 해제됩니다.
- 예시
  ```js
  syn.$bind.attach(document.getElementById('extra'), mounted.store);
  ```

### `syn.$bind.registerBinding(type, handler)`
- 설명: `syn-bind` 선언 문법에서 사용할 새로운 바인딩 타입을 등록합니다. 반드시 `mount()`/`attach()` 호출 이전에 등록해야 해당 타입이 인식됩니다.
- 매개변수
  | 이름 | 타입 | 필수 | 설명 |
  |---|---|---|---|
  | type | `string` | Y | `syn-bind="타입:경로"`에서 사용할 타입 이름. |
  | handler | `object` | Y | `{ toDOM(el, value, arg), event?, fromDOM?(el) }`. `event`를 생략하면 단방향(store→DOM) 바인딩이 되고, 문자열 또는 `(el) => string` 함수로 지정하면 해당 DOM 이벤트 발생 시 `fromDOM(el)` 결과를 store에 반영하는 양방향 바인딩이 됩니다. |
- 반환값: 없음
- 예시
  ```js
  syn.$bind.registerBinding('uppercase', {
      toDOM(el, v) { el.textContent = (v || '').toUpperCase(); }
  });
  ```
  ```html
  <b syn-bind="uppercase:user.name"></b>
  ```

### `syn.$bind.registerAdapter(name, adapter)`
- 설명: 표준 HTMLElement가 아닌 커스텀 컨트롤(AUIGrid, Handsontable, tail-select, daterangepicker 등)을 `syn-bind="adapter(name):경로"` 문법으로 연결할 수 있도록 어댑터를 등록합니다. `get`/`set`은 필수이며, `on`/`off`를 생략하면 store→컨트롤 단방향 바인딩만 동작합니다.
- 매개변수
  | 이름 | 타입 | 필수 | 설명 |
  |---|---|---|---|
  | name | `string` | Y | 어댑터 이름. |
  | adapter | `object` | Y | `{ get(el), set(el, value), on?(el, handler), off?(el, handler) }`. `get`/`set`이 함수가 아니면 오류가 발생합니다. |
- 반환값: 없음
- 예시
  ```js
  syn.$bind.registerAdapter('grid', {
      get(el) { return el._grid.getData(); },
      set(el, value) { el._grid.setData(value || []); },
      on(el, handler) { el._grid.on('change', handler); }
  });
  ```

### `syn.$bind.raw(value)`
- 설명: 트리 중간의 Proxy 값(예: `store.data.items[0]`)을 원본 순수 객체/배열로 변환합니다. Proxy가 아닌 값은 그대로 반환합니다.
- 매개변수
  | 이름 | 타입 | 필수 | 설명 |
  |---|---|---|---|
  | value | `any` | Y | 변환할 값. |
- 반환값: `any` — Proxy면 원본 객체/배열, 아니면 입력값 그대로.
- 예시
  ```js
  const rawRow = syn.$bind.raw(store.data.items[0]);
  ```

### `syn.$bind.bindings` / `syn.$bind.controlAdapters` / `syn.$bind.Store`
- 설명: 각각 등록된 내장/커스텀 바인딩 타입 테이블, 등록된 커스텀 컨트롤 어댑터 테이블, `Store` 클래스 참조입니다. `registerBinding`/`registerAdapter`로 채워지는 내부 테이블을 직접 조회하거나, `new syn.$bind.Store(data)`처럼 클래스를 직접 사용할 때 참조합니다.

## Store 인스턴스 메서드
`createStore()`/`mount()`가 반환하는 `Store` 인스턴스는 다음 메서드를 제공합니다.

### `store.data`
- 설명: 원본 데이터를 감싼 최상위 Proxy입니다. `store.data.user.name = '값'`처럼 표준 JS 문법으로 값을 변경하면 즉시 화면에 반영됩니다.

### `store.get(path)` / `store.set(path, value)`
- 설명: `"items[0].title"` 형식의 경로 문자열로 값을 조회/설정합니다. `store.data.xxx`로 접근/대입하는 것과 완전히 동일한 결과를 냅니다.
- 매개변수
  | 이름 | 타입 | 필수 | 설명 |
  |---|---|---|---|
  | path | `string` | Y | `"user.name"`, `"items[0].title"` 형식의 경로. |
  | value | `any` | `set`만 Y | 설정할 값. |
- 반환값: `get`은 조회된 값(`any`), `set`은 없음.
- 예시
  ```js
  const name = store.get('user.name');
  store.set('user.name', '김민수');
  ```

### `store.subscribe(path, cb, opts)`
- 설명: 지정한 경로의 변경을 구독합니다. `opts.deep === true`면 하위 경로(`items[0].title` 등) 변경도 함께 수신합니다. 경로를 빈 문자열(`''`)로 구독하면 모든 변경을 수신합니다(디버깅/전체 감시용).
- 매개변수
  | 이름 | 타입 | 필수 | 설명 |
  |---|---|---|---|
  | path | `string` | Y | 구독할 경로. 빈 문자열이면 모든 변경 수신. |
  | cb | `(event) => void` | Y | `event = { path, type, key, value, oldValue, parentPath }`. `type`은 `'set'`/`'add'`/`'delete'`/`'length'` 중 하나. |
  | opts | `{ deep?: boolean }` | N | `deep: true`면 하위 경로 변경까지 수신. |
- 반환값: `Function` — 호출하면 구독을 해제하는 함수.
- 예시
  ```js
  const unsubscribe = store.subscribe('items', (ev) => console.log(ev.type, ev.path), { deep: true });
  unsubscribe();
  ```

### `store.batch(fn)`
- 설명: `splice`처럼 한 번의 호출에서 내부적으로 여러 트랩(get/set/deleteProperty) 호출이 연속 발생하는 연산을 감쌉니다. `batch` 없이는 연산 도중 구독 콜백이 불완전한 중간 상태를 볼 수 있지만, `batch`로 감싸면 연산이 모두 끝난 뒤 한 번만(모아서) 통지됩니다.
- 매개변수
  | 이름 | 타입 | 필수 | 설명 |
  |---|---|---|---|
  | fn | `() => void` | Y | 배칭할 동기 함수. |
- 반환값: 없음
- 예시
  ```js
  store.batch(() => { store.data.items.splice(1, 1); });
  ```

### `store.toRaw()`
- 설명: 루트 데이터를 원본 순수 객체/배열(Proxy가 아닌 실제 참조)로 반환합니다. 반환값을 직접 수정하면 데이터는 실제로 바뀌지만, Proxy의 `set` 트랩을 거치지 않으므로 이벤트가 발생하지 않고 화면도 갱신되지 않습니다.
- 반환값: `object | Array`
- 예시
  ```js
  const snapshot = JSON.stringify(store.toRaw(), null, 2);
  ```

### `store.scope(basePath)`
- 설명: 특정 경로를 기준으로 상대 경로만 사용하는 얇은 뷰(`ScopedStore`)를 만듭니다. `syn-bind-list`의 각 행이 내부적으로 자동 생성하는 것과 같은 방식으로, 리스트 행 컴포넌트처럼 상위 경로를 몰라도 되는 코드를 작성할 때 유용합니다.
- 매개변수
  | 이름 | 타입 | 필수 | 설명 |
  |---|---|---|---|
  | basePath | `string` | Y | 기준 경로(예: `"items[0]"`). |
- 반환값: `ScopedStore`
- 예시
  ```js
  const rowScope = store.scope('items[0]');
  rowScope.set('title', '수정된 제목');
  ```

## ScopedStore 인스턴스 메서드
`store.scope(basePath)`가 반환하는 `ScopedStore`는 `basePath` 기준 상대 경로로 동작하는 `get`/`set`/`subscribe`/`batch`/`scope`를 제공하며, 내부적으로 원본 `store`에 위임합니다.

### `scopedStore.data`
- 설명: `store.get(basePath)`와 동일(getter). `basePath` 위치의 Proxy 값을 반환합니다.

### `scopedStore.get(relPath)` / `scopedStore.set(relPath, value)`
- 설명: `basePath` 기준 상대 경로(생략 시 `basePath` 자체)로 조회/설정합니다. 상대 경로가 `[`로 시작하면(`"[0]"`) 인덱스로, 아니면 `.`로 이어붙인 프로퍼티 경로로 해석합니다.

### `scopedStore.subscribe(relPath, cb, opts)` / `scopedStore.batch(fn)`
- 설명: 각각 `store.subscribe`/`store.batch`에 `basePath` 기준 절대 경로로 변환해 위임합니다.

### `scopedStore.scope(relPath)`
- 설명: 현재 `basePath` 기준 상대 경로로 한 단계 더 좁힌 `ScopedStore`를 반환합니다.
