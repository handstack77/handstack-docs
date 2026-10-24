---
name: handstack-screen-development
description: HandStack syn.js 업무 화면(HTML·JS 쌍)을 만들거나 고친다. 조회 조건·목록(AUIGrid)·입력 폼·마스터/디테일 저장·팝업·코드도움·날짜/파일 컨트롤, syn-datafield·belongID 바인딩, transaction 입출력, hook/event/method 작성, 조회/저장/삭제 버튼 연결, 화면 로직 버그 수정 요청이면 반드시 사용한다. 화면 파일(view/*.html, *.js)을 한 줄이라도 수정하기 전에 이 스킬의 바인딩 규칙을 확인한다.
---

# HandStack 업무 화면 개발

화면은 HTML 한 장과 같은 이름의 JS 한 개로 이루어진다. JS는 `$화면ID` 객체 하나에 `config → prop → transaction → hook → event → method` 순서로 로직을 담고, HTML의 `syn-datafield`/`belongID`가 서버 거래와 데이터를 주고받는 선이다. 이 선은 이름으로만 이어지므로(컴파일러가 보증하지 않음) 작업의 대부분은 "이름이 모든 층에서 일치하는지"를 지키는 일이다.

## 시작 전에

1. `AGENTS.md`/`CLAUDE.md`, 대상 모듈의 `DESIGN.md`를 읽는다. UI 규칙(컨테이너, 팝업 방식, 색·아이콘 금지 목록)은 프로젝트별로 다르며 그 문서가 이 스킬보다 우선한다. 신규 화면은 필수 준수, 기존 화면은 수정 범위 안에서만 점진 적용하고 일괄 리팩터링하지 않는다.
2. 같은 모듈에서 요청과 비슷한 화면 한 쌍(조회형/마스터-디테일/입력 폼/팝업)을 골라 HTML·JS·`.txn`·`.dbc`를 함께 읽고 그 구조를 복제 기준으로 삼는다. 새 패턴을 발명하기 전에 이웃 화면이 어떻게 하는지 본다.
3. 거래·SQL 계약이 필요하면 `handstack-transaction-contracts`, 서버 함수가 필요하면 `handstack-function-contracts`를 함께 사용한다. 새 업무 기능 전체를 만든다면 `handstack-feature-delivery`가 순서를 안내한다.
4. `../handstack-source-trace/scripts/hs_inspect.py --screen <ID>`가 있으면 수정 전후로 실행해 연결표와 ERROR/WARN을 비교한다.
5. 프로젝트에 `DESIGN.md`가 없으면 프레임워크 기본 지침을 요약한 [디자인 시스템](references/design-system.md)을 따른다(화면 유형별 템플릿, 폼 패턴, 없는 클래스 목록, 접근성).

## 반드시 지키는 바인딩 규칙 (런타임 소스로 확인한 동작)

[바인딩 규칙](references/binding-rules.md)에 근거와 오류 메시지가 있다. 요약:

- **입력 수집**: `inputs: [{type:'Row', dataFieldID:'MainForm'}]`은 그 `<form syn-datafield="MainForm">` 안의 컨트롤 중 `syn-options.belongID`에 **해당 거래 ID가 들어 있는 것만** 전송한다. 그리드는 `columns` 튜플의 8번째 값(belongID)이 같은 역할이다. `dataFieldID`를 생략하면 첫 `<form>`을 쓴다.
- **출력 바인딩**: `outputs`는 **배열 순서**대로 서버 결과 집합과 짝지어진다. 개수가 다르면 `거래 응답 정의와 데이터 갯수가 다릅니다` 오류로 끝난다. Form 출력은 그 폼 안의 `syn-datafield` 컨트롤에 컬럼 이름으로 채우고(belongID와 무관), 대상이 없으면 `Output Mapping 확인 필요` 오류다.
- **그리드 입력**: `Row`는 선택된 행 한 줄(+Flag), `List`는 변경 행만 `D → U → C` 순서로 전송된다. 변경이 없으면 서버에는 `DefaultEmpty` 한 줄이 간다.
- **결과 처리**: `transactionAction`은 Promise를 반환하지 않는다. 결과는 `outputs`로 자동 반영되고, 후처리는 `transaction.X.callback(error, responseObject, additionalData, correlationID)` 또는 `hook.afterTransaction(error, functionID, responseData, additionalData)`에서 한다. **callback이 `undefined`를 반환(일반적인 경우)하면 afterTransaction은 호출되지 않는다.** 한 거래에는 둘 중 하나만 쓴다.
- **오류 경로**: 매핑 오류(`errorText`)는 콜백/afterTransaction 없이 로그만 남기고 끝난다. `beforeTransaction`이 `false`를 반환하면 요청하지 않고 afterTransaction이 오류 문자열과 함께 호출된다. 업무 오류는 `Exception` Form 출력(첫 출력)으로 받아 `$string.toBoolean($this.store.Exception.Error)`로 판정하고, 통신 성공을 저장 성공으로 알리지 않는다.

## 구현 절차

1. **ID 정하기**: 파일 `{업무코드}{3자리 번호}.html/.js`, 객체 `$파일명`. 팝업 파생 화면은 끝자리로 구분하는 관례가 많다(프로젝트 확인). 서비스 ID는 `handstack-transaction-contracts`의 규칙을 따른다.
2. **HTML**: [HTML 규칙](references/html-conventions.md) — 골격, 컨트롤 접두어, `syn-options`, 그리드 컬럼 튜플(`syn_auigrid`는 **배열 튜플만** 해석), 코드도움/날짜/파일, 팝업 조각. 스타일은 [디자인 시스템](references/design-system.md).
3. **JS**: [스크립트 규칙](references/script-conventions.md) — 수명주기 hook, 셸 버튼(`actionButtons`·`buttonCommand`), 그리드 조작, 팝업, 직접 거래 호출, 검증·알림.
4. **메뉴**: 셸에 노출하려면 `handstack-module-development`의 메뉴 규칙으로 등록한다. 메뉴의 `functions`(search/save/delete/print/export…)와 화면 `frameEvent('buttonCommand')` 분기가 짝이다.
5. **확인**: 변경한 JS에 `node --check`, `hs_inspect.py` 재실행, 변경한 HTML에 `scripts/design_lint.py <파일>`(신규 화면은 ERROR/WARN 0이 목표, 기존 화면은 수정한 범위만). 가능하면 브라우저에서 진입 → 조회 → 선택 → 저장 → 삭제 → 업무 오류 → 빈 결과를 확인한다. 브라우저·DB로 확인하지 못했다면 정적 검사 결과와 분리해 보고한다.

## 지켜야 할 습관

- 기존 코드의 이벤트 이름 규칙은 `{컨트롤ID}_{이벤트}`이고 **`syn-events`에 이벤트를 선언해야 호출된다**. 핸들러만 만들고 선언을 빠뜨리는 것이 가장 흔한 실수다.
- 컨트롤 접근은 `syn.$l.get('id')`, 그리드는 `syn.uicontrols.$auigrid.*`, 값 변환은 `$string`/`$object`/`$date` 헬퍼를 쓴다. DOM·그리드 내부 상태를 직접 건드려 Flag·변경 추적을 우회하지 않는다.
- 저장 전 입력 검증은 화면에서 먼저 하되 서버(SQL/함수)에서도 같은 조건을 확인한다. 화면 검사만으로 데이터 무결성을 보장하지 않는다.
- 빈 결과, 입력 오류, 업무 거절, 결과 불명(응답 유실)을 구분해 보여 준다. 상태 표와 HandStack 구현 연결은 [화면 상태 설계](references/ux-states.md).
- 신규 코드에 주석을 추가하지 않는 프로젝트 지침(HandStack 화면 작성 지침의 "No Comment")이 있으면 따른다. 사용자 노출 문구는 한국어, 식별자는 영어다.
- `syn.$w.alert/notify/showDialog/showUIDialog/windowOpen/progressMessage/codeCacheClear` 같은 UI 헬퍼는 `syn.js`가 아니라 모듈의 **`syn.domain.js`(도메인 계층)** 가 정의하며 프로젝트마다 다를 수 있다(`openUIManual`, `newSuid`, `sendAlimMessage`처럼 프로젝트 전용인 것도 있다). 처음 쓰는 헬퍼는 그 모듈의 `syn.domain.js`에서 시그니처를 확인한다.
- 외부 CDN·키가 필요한 스크립트(지도, 우편번호 등)를 새로 추가하기 전에 프로젝트의 기존 로드 방식과 키 관리 규칙을 확인하고, 키 값을 소스·출력에 새로 적지 않는다.

## 문서 확인

`handstack-docs` MCP가 있으면 `search_docs`로 `syn.$w.transactionAction`, `belongID`, 필요한 컨트롤 API(예: `AUIGrid`, `codepicker`)를 검색하고 `get_doc`의 해당 섹션만 읽는다. 대표 문서: `reference/거래-호출`, `tutorial/화면동작과-거래연결/화면-스크립트-구조`, `information/resource/HandStack-화면-HTML-작성-지침`, `information/resource/HandStack-화면-JavaScript-작성-지침`, `startup/learning/uicontrols/aui-grid`. 설치된 `syn` 버전과 문서가 다를 수 있으니 이웃 화면과 로더 소스를 대조한다.
