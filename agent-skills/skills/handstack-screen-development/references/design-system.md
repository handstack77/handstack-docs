# 화면 디자인 시스템 (프레임워크 기본 지침 요약)

HandStack 저장소의 화면 지침(`DESIGN.md`)을 요약한 것이다. **프로젝트에 자체 `DESIGN.md`가 있으면 그 문서가 우선**하고, 없을 때 이 기본값을 따른다. 클래스 존재 여부는 번들(`@tabler/core` 1.3.2, `@tabler/icons-webfont` 3.25.0)의 CSS에서 확인한 값이다. 번들 버전이 다르면 사용 전에 `tabler.min.css`에서 클래스를 검색해 확인한다.

## 목차
1. 스택과 문법 구분
2. 화면 유형별 템플릿
3. 폼 패턴 A/B
4. 그리드·버튼·배지·팝업
5. 색·타이포·간격
6. 존재하지 않는 클래스와 알려진 함정
7. 접근성
8. 린트와 QA 게이트

## 1. 스택과 문법 구분

| 계층 | 역할 | 문법 | 예 |
|---|---|---|---|
| HandStack(`syn.loader.js`) | 로딩, 바인딩(`syn-datafield`), `syn_*` 컴포넌트, 팝업, 검증 | 속성 | `syn-datafield`, `syn-options` |
| Tabler(Bootstrap 5) | 레이아웃·카드·버튼·폼·배지 | **하이픈** | `me-2`, `mt-3`, `border-top`, `btn-primary` |
| Master CSS(런타임 엔진) | 고정 치수·폰트 | **콜론** | `f:20`, `w:120`, `mr:4`, `max-width:1600!` |

- 두 문법을 섞지 않는다(`mr-4`, `f-20`은 둘 다 틀림). 끝의 `!`는 important.
- `hidden`은 Master CSS가 제공하는 시맨틱 클래스라 이 프로젝트에서는 유효하다(일반 Tabler는 `d-none`).
- 같은 요소의 같은 방향 여백을 두 체계로 중복 지정하지 않는다. 고정 치수는 Master CSS, 의미 있는 간격(`mt-2`, `px-2`, `g-0`)은 Tabler.
- 아이콘은 `ti ti-*` 웹폰트만. 크기는 `f:NN`(`icon-sm/lg`는 SVG 전용이라 쓰지 않는다). CDN과 `@latest` 금지 — 로컬 번들(`/lib/tabler-core`, `libman.json`이 버전을 고정).

## 2. 화면 유형별 템플릿

| 유형 | 구성 | 컨테이너 폭 |
|---|---|---|
| 목록(조회) | 필터 카드 + **별도의** 결과 카드(`syn_auigrid`), 조회 버튼은 필터 카드 우측 끝 | `max-width:1600!` |
| 상세(입력) | 폼 카드(들) + `card-footer text-end p-2`에 취소/저장 | `1600!` |
| 마스터/디테일 | **한 카드 안에서** `row g-0` + `col-12 col-lg-5 border-end`(마스터) + `col`(디테일) | `1600!` |
| 사이드 패널형 | `row g-0` + `col-3 border-end`(`card-header` 반복 섹션) + `col`(본문/iframe) | `1600!` |
| 대시보드 | 필터 + KPI 타일 행(`row row-deck row-cards`) + 차트(`syn_chartjs`) + 요약 그리드 | `1600!` |
| 배치/마감 | 실행 조건 → 진행률(`progress`+건수 텍스트) → 단계/로그. 실행은 확인 팝업 | `1600!` |
| 팝업 | `simplemodal-data`(결과 반환) 또는 Bootstrap 모달(화면 내 보조) — 한 화면에 하나만 | `1200!` |
| 보고서(RPT) | `<body class="bg-white">`, 화면 전용 `<style>` 허용(유일한 예외) | `1000!` |

공통 골격은 `page > page-wrapper > (page-header + page-body) > container-fluid`. `page-header`에 `d-print-none`, 오른쪽 액션은 `col-auto ms-auto d-print-none > btn-list`. 헤더/바디는 이미 `--tblr-page-padding`(1rem)을 가지므로 `mt-2` 외의 여백(`m-3`, `mt-4`)을 관성적으로 덧붙이지 않는다.

- 메인 콘텐츠 카드에는 `card-status-top bg-dark-overlay`(의미가 있을 때만 `bg-green` 등으로 교체). 팝업 내부 카드와 KPI 타일에는 붙이지 않는다.
- 그리드를 담는 래퍼는 `form-fieldset p-0` 또는 `card-body p-0`.
- 마스터/디테일은 **부모 미선택, 부모 신규(키 없음), 빈 자식, 편집 중 부모 변경**의 동작을 모두 정의한다. 부모 키가 없으면 자식 추가를 막고 가짜 키를 만들지 않는다.
- 조회 결과 0건은 빈 영역 대신 `empty`(`empty-icon`/`empty-title`/`empty-subtitle`/`empty-action`) 컴포넌트로 다음 행동을 안내한다.

## 3. 폼 패턴 A/B

라벨은 **언제나 입력의 왼쪽**이다(상단 라벨 레이아웃은 업무 폼에 쓰지 않음; 팝업 안 좁은 단일 폼만 `form-label` 허용).

- **패턴 A(검색 필터)**: `row g-2 align-items-center` > `col-12 col-md-6 col-xl-3` > `input-group` > `<label class="w:100 col-form-label px-2" for="…">` + 컨트롤. 조회 버튼은 필터 카드 오른쪽 끝(`btn-list justify-content-end`, 초기화 버튼은 그 왼쪽).
- **패턴 B(등록/수정 폼)**: `row mb-2` > `<label class="col-2 col-form-label required" for="…">` + `col-4` 컨트롤. 한 화면 안에서 라벨 폭(`col-2`/`w:100`)을 통일.
- 필수 표시는 라벨의 `required` 클래스만(CSS가 `*` 추가). 텍스트에 `*`를 쓰지 않는다. 모든 `label[for]` ↔ `input[id]` 연결, `syn_*`는 `aria-label`.
- 도움말 `small.form-hint`, 읽기 전용 `form-control-plaintext`, 오류 `is-invalid` + `invalid-feedback` + `aria-describedby`(서버 오류처럼 HandStack 검증기로 표현 못 할 때만; 1차 검증은 `syn-options={validators:[…]}`).
- 선택 그룹(`form-selectgroup`)은 값이 고정이고 6개 이하일 때만. 서버 코드·조직·대량 옵션은 `syn_codepicker`/`syn_organization`.
- 상태 필터는 배지가 아니라 `btn-group` + `btn bg-muted-lt` 토글(또는 `btn-check`). 배지는 클릭 동작이 없는 요약·건수 표시용.

## 4. 그리드·버튼·배지·팝업

- 업무 목록은 `syn_auigrid`(순수 `<table>`은 RPT와 소량 읽기 전용 요약표만). **`syn_auigrid`의 `columns`는 배열 튜플 형식**이다(`['필드','헤더',폭,숨김,'형식',읽기전용,'정렬','belongID',{옵션}]`). 일부 문서 예제의 객체형(`{header, dataField, …}`)은 AUIGrid 컨트롤이 해석하지 못한다 — 객체형은 `syn_data`의 columns 같은 다른 컨트롤에서 쓰는 형식이다.
- 숫자·금액 우측, 코드·상태·날짜 가운데, 나머지 좌측 정렬. 결과 건수는 카드 제목 옆 배지.
- 버튼: 주 액션 `btn btn-primary`(한 영역에 하나), 중립/취소 `btn bg-muted-lt`, 보조 `btn-outline-secondary`, 위험 `btn-danger`, 아이콘 전용 `btn btn-icon bg-muted-lt` + `aria-label`. 크기는 기본과 `btn-sm`만(`btn-xs/xl` 없음). 권한·상태로 숨길 때는 `hidden` 클래스 토글.
- 팝업: 업무 팝업은 `simplemodal-data`(`card-header dialog-header sticky-top p-2`, 닫기는 `triggerConfig`), 화면 안에서 끝나는 확인·JSON 보기는 Bootstrap 모달(`data-bs-dismiss="modal"`). 섞지 않고, 팝업 위 팝업 금지, 등록·수정 폼 본체를 모달로 옮기지 않는다.
- 알림은 `alert-heading`/`alert-description`(제목은 `alert-title`이 아님). 저장 성공처럼 잠깐 알릴 것은 `syn.$w.notify`.

## 5. 색·타이포·간격

- 색은 Tabler 변수·유틸리티(`bg-*`, `text-*`, `border-*`)만. HEX와 인라인 색 금지(다크 모드가 깨진다). `bg-blue`에는 `text-white`가 아니라 `text-blue-fg`.
- 상태 색은 전 화면 공통: 완료/승인 green, 진행 blue, 대기 yellow, 취소/반려/실패 red, 마감/비활성 secondary. 상태코드→색 클래스 매핑 함수를 JS에 한 곳 두고 그리드 렌더러에서 적용한다. 색만으로 의미를 전달하지 않는다(텍스트/아이콘/부호 병기).
- 본문 14px. 크기는 Master CSS `f:12/14/16/20/24`(Tabler `fs-*`와 한 화면 안에서 섞지 않음). 제목 계층은 `h2.page-title` → `h3.card-title`.
- 간격 스케일 0~6, 논리 방향 `ms/me/ps/pe`만(`ml-/mr-/pl-/pr-`는 Bootstrap 5에 없음). 폼 행 `mb-2`/`mb-3`, 카드 사이 `mt-2`, 조밀 본문 `card-body p-2`.

## 6. 존재하지 않는 클래스와 알려진 함정

번들 CSS에서 확인된 **없는 클래스**: `alert-title`(→`alert-heading`), `border-dashed`, `border-dotted`, `border-r`, `border-t`, `ml-*`, `mr-*`, `pl-*`, `pr-*`(→`ms/me/ps/pe` 또는 Master CSS 콜론), `tracking-tight/wide`, `btn-xs`, `btn-xl`, `progress-lg`, `progress-steps`, `font-weight-*`(→`fw-*`), `align-content-baseline`, `datagrid-content`/`datagrid-item`, `icon-sm/icon-lg`(웹폰트에는 무효), `badge-blink`(금지). 없는 아이콘 예 `ti-organization` → `ti-sitemap`. `accept` 속성은 `.gif,.jpg`(쉼표+점) 형식.

기존 화면에 이런 클래스가 남아 있어도 신규 화면에 따라 쓰지 않는다. 기존 화면은 수정하는 범위에서만 고친다.

존재하는 `syn_*` 태그만 쓴다: `syn_auigrid`, `syn_data`, `syn_datepicker`, `syn_dateperiodpicker`, `syn_codepicker`, `syn_tree`, `syn_organization`, `syn_fileclient`, `syn_filedropzone`, `syn_htmleditor`, `syn_chartjs`, `syn_contextmenu`, `syn_guide` (그 외: `syn_opengrid`, `syn_grid`, `syn_list`, `syn_auipivot`, `syn_chart`, `syn_echarts`, `syn_sourceeditor`, `syn_jsoneditor`, `syn_colorpicker`, `syn_calendar`, `syn_propertypanel`, `syn_googlemap`, `syn_navermap`, `syn_mediaplayer`, `syn_signaturepad`). `syn_combo`, `syn_upload` 같은 이름은 없다. 컨트롤별 옵션·이벤트는 배포된 `uicontrols/{컨트롤}/README.md`·`API.md`가 정본이다.

## 7. 접근성

모든 입력에 라벨 연결, 아이콘 전용 버튼에 `aria-label` + 아이콘 `aria-hidden="true"`, 클릭 대상은 `button`/`a`(div·span에 onclick 금지), 팝업은 포커스를 안으로 이동했다가 닫을 때 호출 요소로 복귀, 오류는 `aria-describedby`, `iframe`에 `title`, 자동으로 움직이는 요소 금지, 키보드만으로 조회→입력→저장이 가능해야 한다. 안내·오류 문구는 한국어이며 **원인과 다음 행동**을 쓴다.

## 8. 린트와 QA 게이트

`scripts/design_lint.py <화면 폴더 또는 파일>`는 위 규칙 중 기계 검증이 가능한 것(타 아이콘 폰트/SVG, HEX, 인라인 시각 스타일, 없는 클래스, 컨테이너, 팝업 혼용, 필수 `*` 하드코딩, 아이콘 버튼 라벨, 순수 table, CDN, div onclick, 알 수 없는 `syn_*`, id 중복, 골격)을 검사한다. 화면 폴더(`view/`)에만 돌린다. 프로젝트 지침이 다른 규칙은 `--disable <rule>`로 끈다(`--list-rules`). 린트가 통과해도 라벨 배치, 상태 색 일관성, 키보드 흐름, 다크 모드, 반응형은 직접 확인해야 한다.
