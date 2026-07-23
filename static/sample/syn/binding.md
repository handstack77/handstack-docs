# 양방향 데이터 바인딩 사용법 (syn.$bind)

## 개요
`syn.$bind`는 순수 객체(`{}`) 및 평면 객체 배열(`[{}, {}, ...]`)을 Proxy로 감싸서, 프로퍼티 값 변경/재할당, 배열 `push`·`pop`·`splice`·정렬, 배열 인덱스 직접 교체, 배열 내 객체 값 변경을 표준 JS 문법만으로 감지하고 화면에 반영하는 모듈입니다.

`syn.uicontrols.$data`가 `syn-datafield`/`syn-options` 메타 설정 기반으로 HandStack 전용 컨트롤(`syn_grid`, `syn_data` 등)을 바인딩하는 것과는 별개의 기능입니다. `$bind`는 `syn-bind`/`syn-bind-list` 속성만으로 표준 `HTMLElement`는 물론 AUIGrid, Handsontable, tail-select, daterangepicker 같은 임의의 커스텀 컨트롤까지 `get`/`set`/`on`/`off` 4개 함수(어댑터) 구현만으로 가볍게 양방향 연결하고 싶을 때 사용합니다. 두 시스템은 서로 다른 HTML 속성을 사용하므로 같은 화면에서 함께 써도 충돌하지 않습니다.

## 로드 방법
`syn.js`가 로드되면 전역에 `syn.$bind`로 즉시 사용할 수 있습니다. 별도 활성화 설정이나 외부 라이브러리 의존성은 없습니다.

## 빠른 시작
```html
<input type="text" syn-bind="value:user.name">
<span syn-bind="text:user.name"></span>
```
```javascript
const mounted = syn.$bind.mount(document.body, { user: { name: '홍길동' } });
mounted.store.data.user.name = '김철수'; // 표준 JS 문법으로 값 변경 시 화면 자동 반영
mounted.destroy(); // 바인딩 해제
```
데이터 변경은 별도 API 없이 표준 JS 문법을 그대로 사용합니다.
```javascript
store.data.user.name = '홍길동';            // 프로퍼티 값 변경
store.data.user = { name: '김철수' };        // 프로퍼티(객체) 재할당
store.data.items.push({ title: '신규' });    // 배열 push
store.data.items[2] = { title: '교체' };     // 배열 인덱스 직접 변경
store.data.items[2].title = '수정';          // 배열 내 객체 값 변경
store.data.items.splice(1, 1);               // 배열 splice
```

## 주요 시나리오
### 선언적 바인딩 문법
`syn-bind` 속성에 `타입1(인자1):경로1; 타입2(인자2):경로2` 형태로 여러 바인딩을 세미콜론으로 나열할 수 있습니다. 내장 타입은 `text`, `html`, `value`, `checked`, `radio`, `edit`, `show`, `hide`, `disabled`, `class(이름)`, `attr(이름)`, `style(속성)`, `adapter(어댑터명)`입니다.
```html
<input type="checkbox" syn-bind="checked:user.active">
<span syn-bind="show:user.active">사용중</span>
<span syn-bind="hide:user.active">미사용</span>
```

### 리스트(배열) 반복 바인딩
`syn-bind-list="경로"` 컨테이너 안에 `<template>` 1개를 행 템플릿으로 두면, 배열의 `push`/`pop`/`splice`/인덱스 교체에 따라 자동으로 행이 추가·삭제·교체됩니다.
```html
<tbody syn-bind-list="items">
    <template>
        <tr>
            <td><input type="text" syn-bind="value:title"></td>
        </tr>
    </template>
</tbody>
```

### 커스텀 컨트롤 어댑터
표준 HTMLElement가 아닌 컨트롤은 `get`/`set`/`on`/`off` 4개 함수만 구현해 `registerAdapter()`에 등록하면, 동일한 `syn-bind="adapter(어댑터명):경로"` 문법으로 AUIGrid, Handsontable, tail-select, daterangepicker 같은 서드파티 컨트롤도 연결할 수 있습니다.
```javascript
syn.$bind.registerAdapter('grid', {
    get(el) { return el._grid.getData(); },
    set(el, value) { el._grid.setData(value || []); },
    on(el, handler) { el._grid.on('change', handler); }
});
```
```html
<div id="grid" syn-bind="adapter(grid):items"></div>
```

### 저수준 API: createStore / mount / attach
`createStore(data)`는 DOM에 연결하지 않고 반응형 store만 만듭니다. `mount(root, dataOrStore)`는 store 생성과 DOM 스캔·바인딩을 한 번에 수행합니다. `attach(root, store)`는 이미 있는 store를 다른 DOM 영역에 추가로 연결만 하는 저수준 API입니다.
```javascript
const store = syn.$bind.createStore({ count: 0 });
const mounted = syn.$bind.mount(document.body, store);
syn.$bind.attach(document.getElementById('extra'), store);
```

### store 조회/변경/구독
`store.get(path)`/`store.set(path, value)`는 `store.data.xxx` 접근과 동일한 결과를 냅니다. `store.subscribe(path, cb, { deep })`은 경로 변경을 구독하며(반환값은 구독 해제 함수), `deep: true`면 하위 경로 변경까지 함께 수신합니다. `store.batch(fn)`은 `splice`처럼 한 번의 호출에서 여러 트랩 호출이 발생하는 연산을 감싸 구독 콜백이 항상 연산 완료 후의 안정된 상태만 관찰하도록 합니다.
```javascript
const unsubscribe = store.subscribe('items', (ev) => console.log(ev.type, ev.path, ev.value), { deep: true });
store.batch(() => { store.data.items.splice(1, 1); });
unsubscribe();
```

### scope와 raw
`store.scope(basePath)`는 특정 경로를 기준으로 상대 경로만 쓰는 얇은 뷰(`ScopedStore`)를 만듭니다(리스트 바인딩이 각 행마다 내부적으로 사용하는 것과 같은 방식). `syn.$bind.raw(value)`/`store.toRaw()`는 프록시를 원본 순수 객체/배열로 되돌립니다.
```javascript
const rowScope = store.scope('items[0]');
rowScope.set('title', '수정된 제목');

const rawItem = syn.$bind.raw(store.data.items[0]);
```
> 주의: `toRaw()`로 얻은 원본 객체를 직접 수정하면 실제 값은 바뀌지만 Proxy의 `set` 트랩을 거치지 않아 이벤트가 발생하지 않고 화면도 갱신되지 않습니다. 화면까지 갱신하려면 항상 `store.data.xxx = ...` 형태로 Proxy를 통해야 합니다.

## 실전 예제 페이지
`/sample/syn/binding.html` 예제에서 다음 항목을 실습할 수 있습니다.
- 1~3번 섹션: `value`/`checked`/`radio`/`edit` 등 기본 바인딩 타입, 중첩 객체 재할당, `syn-bind-list`(push/pop/splice/index 교체/정렬)
- 4~5번 섹션: `registerAdapter()`로 만든 별점/토글/미니 그리드 데모, 실제 AUIGrid/Handsontable/tail-select/daterangepicker 어댑터 참고 코드
- 6번 섹션: 루트 구독(`store.subscribe('', cb, { deep: true })`)으로 모든 변경 이벤트 로그 확인, `store.toRaw()` 실시간 스냅샷
- 7번 섹션: `createStore`, `mount`/`attach`, `registerBinding`, `registerAdapter`, `raw`, `get`/`set`, `subscribe`, `batch`, `toRaw`, `scope` API 전체를 개별적으로 실습

## 주의 사항
- 순수 객체/평면 객체 배열 전용입니다. `Date`, `Map`, `Set` 등 다른 참조 타입은 관찰 대상이 아닙니다.
- 동일한 원본 객체는 내부 `WeakMap` 캐시로 Proxy를 재사용하므로, 같은 데이터를 여러 곳에서 바인딩해도 항상 동일한 Proxy 인스턴스를 참조합니다.
- `syn-bind-list` 컨테이너에는 반드시 `<template>` 자식이 하나 있어야 하며, 없으면 오류가 발생합니다.
- `adapter(어댑터명)` 사용 전에 `syn.$bind.registerAdapter()`로 먼저 등록해야 합니다. 미등록 어댑터를 참조하면 오류가 발생합니다.
- `syn.uicontrols.$data`/`syn-datafield` 기반 바인딩과는 별개의 시스템입니다. 서로 다른 HTML 속성을 사용하므로 같은 화면에서 함께 사용해도 충돌하지 않지만, 같은 데이터를 두 시스템에 동시에 연결하지는 않도록 주의하십시오.

## 관련 모듈
- API 상세: [`binding_api.md`](./binding_api.md)
