---
name: handstack-ide-development
description: HandStack IDE와 관련된 두 가지 작업에 사용한다. (A) IDE가 열고 저장하는 파일(.txn·.dbc·.fnc·.bas·.cyp·.pmt·.rpo, 화면 HTML/JS, menus.json)을 외부에서 고치면서 IDE 왕복 편집이 깨지지 않게 보존해야 할 때. (B) IDE 데스크톱 호스트 저장소 자체를 개발할 때 — View Designer(data-designer-*·pageMappings), Tabler Studio(data-studio-*), 계약 워크벤치(7종 계약 편집 화면), Monaco 코드 인텔리전스·포맷터, 로컬 작업영역 API, 포트·개발 서버 연동, 모듈 템플릿, 메타데이터 generator. "디자이너에서 저장하면 내용이 사라진다", "계약 편집기에 필드를 추가", "IDE 화면 수정" 같은 요청이면 사용한다.
---

# HandStack IDE 연동·개발

HandStack IDE는 로컬 웹 UI(작업 영역 파일 편집, View Designer, 계약 편집기, 서버 연동)를 데스크톱 웹뷰 호스트가 감싼 도구다. UI 상태와 편집 로직은 JavaScript가, 파일·프로세스·OS·HTTP는 C# 호스트가 맡는다. IDE는 파일을 **파싱 → 화면 모델 → 직렬화**로 왕복시키므로, 파서가 모르는 요소는 저장 때 조용히 사라진다. 이 스킬의 규칙은 대부분 "왕복에서 정보를 잃지 않는다"로 요약된다.

## A. IDE가 다루는 파일을 외부에서 고칠 때

| 파일 | 확장자 | 내부 형식 | 외부 편집 시 보존할 것 |
|---|---|---|---|
| 화면 | `.html` + `.js` | HTML / JS | `data-designer-type`·`data-designer-root-count`·`data-designer-props`(디자이너 마커), `config.pageMappings`(거래 매핑의 기준), 기존 원문 구조·주석·스크립트 |
| 거래 | `.txn` | JSON(JSONC) | 주석·후행 쉼표 허용. 오류로 단정해 지우지 않는다 |
| SQL | `.dbc` | XML | CDATA, `(id, seq)`, `<param>` 순서 |
| 함수 | `.fnc` | XML | script/CDATA 경계. `.g.*` 생성물은 수정하지 않음 |
| 명령 | `.bas` | XML | commands/requests |
| 그래프 | `.cyp` | XML | Cypher + `$param` |
| 프롬프트 | `.pmt` | XML | statement 하위 요소 전체(알 수 없는 요소는 IDE 저장 때 사라짐) |
| 저장소 | `.rpo` | JSON 배열 | 항목 필드 전체 |
| 메뉴 | `menus.json` | JSON | 파일이 쓰는 형식(평면 배열 vs 데이터셋 래핑) |

- **확장자는 내부 형식을 뜻하지 않는다**(`.dbc`는 XML, `.txn`은 JSON). 기존 파일을 다른 확장자로 바꾸지 않는다. 문서 예제의 `.json/.xml`과 IDE 프로젝트의 확장자가 다른 것은 정상이며, 서버는 두 표기를 모두 읽는다. 확장자 일괄 변환은 `handstack contractpack`(백업 ZIP 생성, 함수 폴더형은 단일 `.fnc`로 묶음)이 하며 `publicTransactions.json`은 변환 대상이 아니다.
- 같은 파일을 소스 탭, 전용 편집기, 외부 편집기에서 동시에 고치면 한쪽이 덮어쓴다. 미저장 편집본을 먼저 보호하고 외부에서 고친 뒤에는 IDE에서 다시 연다.
- 디자이너가 만든 마커(`data-designer-*`, `data-studio-*`)를 임의로 삭제·재생성하지 않는다. `data-designer-id`·`data-studio-node`는 캔버스 전용이며 저장 원본에 남아 있으면 안 된다.
- 거래 매핑은 HTML이 아니라 화면 JS의 `config.pageMappings`가 기준이다. JSON 사이드카나 `<head>` 메타로 옮기지 않는다.
- 메뉴 편집기는 대상 모듈의 `menus.json` 형식(`DirectoryID`/`ItemID`/`Fn*` 등)을 읽고 쓴다. 평면 형식과 변환하지 않는다.
- IDE의 설정(포트, 서버 연동)과 업무 모듈 설정(`module.json`), 개발 서버 설정은 서로 다른 대상이다. 어느 것을 바꾸는지 먼저 정한다. `IsDeveloperMode`는 접근 토큰 검사를 건너뛰는 보안 경계 설정이므로 접속 오류 회피용으로 켜지 않는다.
- 백업 대상: 작업 영역 파일(Git), IDE UI 설정·탭(웹뷰 저장소), 엔티티 모델(IndexedDB), DB 연결·이력(IDE `data` 폴더), 설치본의 영속 데이터는 `current`와 분리된 `data` 폴더. 폴더 하나만 복사하면 모델·설정이 빠질 수 있다.

## B. IDE 호스트 저장소를 개발할 때

시작: 저장소의 `AGENTS.md`/`CLAUDE.md`·`DESIGN.md`·사용자 가이드(`GUIDE.md` 류)를 읽는다. 아래는 일반 원칙이며 저장소 지침이 우선한다. 파일 위치는 이름이 달라질 수 있으니 [탐색 단서](references/ide-source-map.md)로 grep해서 찾는다.

### 구조와 공통 규칙

- UI 탭·패널·편집 상태는 JS가 소유한다. C#에 UI 상태를 복제하지 않고, 호스트 콜백 스레드를 동기 대기시키지 않는다.
- 로컬에 포함된 자산(`lib`)만 사용한다. CDN·독립 포매터·중복 인텔리전스 제공자를 추가하지 않는다. 벤더 파일은 난독화·번들 변환 대상에서 제외한다.
- 사용자 확인/입력/알림은 IDE 공용 다이얼로그 모듈(`showConfirm`/`showPrompt`/`showAlert`)을 쓰고 브라우저 기본 `alert/confirm/prompt`를 쓰지 않는다. 입력 요소가 있는 `<dialog>`는 submit 핸들러 없는 폼 밖에 둔다(Enter 암묵 제출로 편집 내용 소실).
- 팝업 푸터는 공용 패턴(`card-footer modal-action-footer p-2`, 보조 동작 왼쪽 / 취소·주요 동작 오른쪽 그룹)을 따르고 푸터 버튼에 `btn-sm`을 쓰지 않는다. 툴팁은 `title`을 쓰고 공용 툴팁 모듈이 변환하게 한다. 포인터 리사이즈는 공용 resize-ghost 모듈로 드래그 종료 시 한 번만 적용한다.
- JSON: C#은 프로젝트 기본 라이브러리(Newtonsoft.Json)와 공용 `JsonDefaults`, 사용자 편집 JSON은 주석·후행 쉼표를 허용하는 파서. 브라우저 계약 화면은 `JSON.parse` 대신 워크벤치의 `parseContractJson`.
- 코딩 스타일: 명시적 불리언 비교(`if (x == false)`), 단문 `if`에도 중괄호, 로그는 한국어, 신규 코드에 주석을 추가하지 않는 지침이 있으면 따른다. `.editorconfig`(UTF-8, CRLF 등)와 기존 파일 인코딩·줄바꿈을 유지한다.

### View Designer / Tabler Studio

- 저장 데이터의 디자이너 메타데이터는 실제 HTML 요소의 `data-designer-type`/`data-designer-root-count`/`data-designer-props`뿐이다. 별도 JSON·`<head>` 메타를 만들지 않는다.
- 가져온 HTML은 첫 편집 전 원문(`importedHtml`)을 보존한다. 중첩 컴포넌트를 바꾸면 조상의 `importedHtml`을 무효화(`markSlotPathEdited`/mutation helper)해야 화면과 저장 결과가 같아진다. 소스보기 저장은 재조립한 HTML이 아니라 편집기 원문이다. 소스 탭과 디자이너 사이에서 dirty 상태인 상대편을 덮어쓰지 않는다.
- 임의 HTML을 레이아웃 타입으로 추정하지 않는다. 마커가 없거나 손상된 영역만 `rawHtml`로 보존한다.
- Dock/Anchor는 `designProps.dockLayout`과 공용 dock 계산 모듈로, 중첩 TableLayout은 전용 갱신 함수로 바꾼다. 블록 이동은 공용 이동 함수만 쓴다.
- 도구상자 분류(layout/basic/form/data/navigation/feedback/business), 공통 속성 모델, 구성요소 정의 스키마, 저작 시점 검증 규칙의 정본은 HandStack 프레임워크 `DESIGN.md`의 "디자인 저작 구성요소" 장이다. 도구로 만든 화면과 손으로 쓴 화면이 구분되지 않아야 하며, 문서와 도구가 어긋나면 도구가 이긴다. 클래스는 번들 CSS에 실재하는 것만 쓴다(`handstack-screen-development`의 디자인 시스템 참조).
- 시각 스타일의 기본 경로는 프로젝트 `DESIGN.md`의 클래스 어휘(칩)다. 인라인 `style`은 클래스로 표현할 수 없는 값에만 쓰고 `DESIGN.md`의 금지 사항·QA 게이트를 위반하지 않는지 확인한다. 어휘에 없는 CSS 클래스를 만들지 않는다.
- 캔버스 전용 속성(`contenteditable`, `data-designer-id`, `data-studio-node`)은 저장 원본에 남기지 않는다. 문구 편집 커밋은 속성 컨텍스트의 `setContent`만 쓴다.
- Studio는 `data-studio-props`를 쓰며 `data-designer-*`를 새로 만들지 않는다. 이전 Studio 메타데이터 변환은 전용 변환 모듈로만 하고 원문 스크립트·스타일·주석은 보존한다.
- 반복 입력 상태 변경은 `deferRender`로 한 프레임에 묶고 실행 취소는 첫 입력 한 칸으로 합친다. 실행할 수 없는 메뉴 항목은 감추지 말고 `enabled:false`와 이유(`hint`)를 보인다.

### 계약 편집 화면(7종)과 워크벤치

- 공통 CSS/JS 워크벤치를 재사용한다. 계약 유형별 화면의 **파서와 직렬화기는 화면 책임**이므로 새 필드를 지원하면 **읽기와 쓰기 양쪽**에 반영하고 "원문 → 무변경 저장 → 수정 저장" 결과를 비교한다.
- prompter 화면은 `.pmt`만 연다. 판단 계약(`<decision>`) 검증 로직은 서버의 `DecisionContract` 규칙을 거울처럼 따르므로 서버 규칙 변경 때 같이 갱신한다. 판단 전용 제공자를 일반 채팅 제공자 목록에 넣지 않는다.
- 계약 필드·런타임 동작의 기준은 HandStack 서버 모듈의 entity/parser다. 편집기가 임의로 의미를 만들지 않는다.

### Monaco 인텔리전스·포맷

- HandStack JS/HTML 인텔리전스는 각각 하나의 언어 제공자 모듈에만 구현하고 셸과 디자이너 코드에 완성 항목을 복제하지 않는다. 제공자를 바꾸면 IDE 셸과 View Designer **두 Monaco 표면**에서 모두 확인한다. iframe의 메타데이터 URL은 절대 경로(`/metadata/`).
- 포맷은 공용 포매터 하나(`IdeFormatter` 류)에만 구현한다. 비동기 포맷은 적용 직전에 대상 탭·model·내용이 그대로인지 다시 확인하고 `executeEdits` + `pushUndoStop`으로 실행 취소 한 칸에 반영한다. HTML 포맷은 멱등이어야 한다.

### 생성물·템플릿·빌드

- 메타데이터(`syn-api.json`, `ui-library.json` 등)는 직접 편집하지 않고 generator로 재생성한다. 설명 데이터는 별도 파일에 쓴다. 대규모 생성물 diff를 사용자 수정과 혼동하지 않는다.
- Vite 등의 산출 폴더(`obj/*`)는 원본이 아니다. 빌드 때 모듈 스냅샷(`modules/{module}/{Contracts,wwwroot}`)을 외부 저장소에서 미러링하는 구조면 그 폴더를 직접 고치지 말고 원본 저장소와 diff를 함께 본다. 미러링 대상이 아닌 `module.json`은 저장소가 따로 관리한다.
- 모듈 템플릿은 텍스트 복사 + 토큰 치환이다. 토큰을 추가하면 생성 엔드포인트의 토큰 정의도 같이 갱신하고, 템플릿의 계약은 IDE가 인식하는 확장자와 유효한 `Version`을 가져야 하며 `module-settings.js`의 기본 설정은 `module.json`과 의미가 같아야 한다. 템플릿에 바이너리를 넣지 않는다(`.bat` CRLF, `.sh` LF).
- 포트·개발 서버·작업영역 API: 포트의 기준은 호스트 설정 한 곳이며 모듈 URL·CSP를 한 파일만 수동 변경하지 않는다(다중 파일 원자 갱신·롤백 서비스 사용). 호스트 준비 확인은 TCP 연결이 아니라 인스턴스 식별 엔드포인트로 한다. 작업영역 API의 `root`/`relativePath` 경계 검증과 접근 토큰 게이트를 우회하지 않는다. 영속 데이터 경로를 임의로 옮기지 않는다.

### 검증

JS 변경: `node --check <파일>` 후 프로젝트의 웹 빌드 스크립트. C#·프로젝트·설정 변경: 솔루션 빌드(미러링·배포 부작용 확인). 인텔리전스/포맷: 양쪽 Monaco, 실행 취소, 비동기 안전. generator 변경: 재생성 후 diff. 포트·서버 변경: 다중 설정 파일·롤백·프로세스 종료 경로. 완료 전 `git status`/`git diff --check`로 예기치 않은 생성물·사용자 파일 변경이 없는지 확인한다. 실제 데스크톱 앱·브라우저 동작은 빌드와 분리해 보고한다.

공개 사용자 동작(메뉴, 저장 형식, 계약 실행, 설정·보안)이 바뀌면 저장소의 문서 동기화 지침(IDE 사용자 가이드, 공개 문서)을 확인하고 반영하지 못한 항목은 보고서에 명시한다.

## 문서

MCP `ide/reference/파일과-저장-규칙`, `ide/reference/설정과-보안`, `ide/reference/메뉴와-도구`, `ide/reference/문제-해결`, `ide/guides/tabler-studio`, `ide/guides/도메인-모델링`.
