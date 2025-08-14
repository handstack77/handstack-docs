---
sidebar_position: 70
---

# HandStack 화면 HTML 작성 지침

이 문서는 HandStack 화면 개발 시 준수해야 할 한국어 응답 규칙 및 Tabler CSS Framework 기반의 HTML 작성 지침을 명시합니다.

## 한국어 응답 규칙

모든 응답은 한국어로 작성하며, 다음 원칙을 따릅니다.

- 언어 통일: 모든 응답 콘텐츠는 한국어로 작성합니다.
- 코드 주석: 주석을 만들지 않아야 합니다. No Comment.
- 기술 용어: 필요시 영어 원문과 한국어를 병행 표기합니다 (예: "컨테이너(container)").
- 원문 유지: 에러 메시지나 로그는 원본 언어를 유지하되, 이에 대한 설명은 한국어로 제공합니다.
- 예외 상황:
    - 코드 자체(변수명, 함수명 등)는 영어로 작성합니다.
    - 공식 문서나 명령어는 원본 언어를 유지합니다.
    - 사용자가 명시적으로 다른 언어를 요청하는 경우에만 해당 언어를 사용합니다.

## Tabler CSS Framework 기반 HTML 작성 지침

HandStack 화면은 UI/UX의 일관성과 개발 효율성을 위해 다음 오픈소스 프레임워크와 라이브러리를 기반으로 합니다.

- Tabler CSS Framework:
    - Bootstrap 5 기반으로 견고하며, 다양한 UI 컴포넌트와 아이콘을 제공합니다.
    - 모바일, 태블릿, 데스크톱 등 다양한 디바이스에 최적화된 반응형(responsive) 화면을 효율적으로 구성할 수 있습니다.
- master-css:
    - 직관적인 CSS 클래스 문법(유틸리티 우선 접근)으로 스타일을 간편하게 작성할 수 있어 코드 가독성 및 유지보수성을 높입니다.
    - 다양한 스타일링 옵션을 제공하며, 불필요한 코드 없이 빠른 페이지 로딩을 지원합니다.
- Mustache:
    - HTML과 데이터를 결합하여 동적인 콘텐츠를 생성하는 템플릿 엔진입니다.
    - 직관적인 문법으로 데이터 바인딩을 쉽게 처리하며, 복잡한 로직 없이 템플릿 작성을 가능하게 합니다.

### UI 패턴 화면 예제

|ID|패턴명|용도|
|---|---|---|
|[TPL000](http://dev.textileon.net/arha/sample/uipattern/TPL000.html)|UX 레퍼런스|인터페이스, 항목 디자인|
|[TPL010](http://dev.textileon.net/arha/sample/uipattern/TPL010.html)|마스터/디테일|조회 조건 및 CRUD 가능한 그리드 목록|
|[TPL020](http://dev.textileon.net/arha/sample/uipattern/TPL020.html)|단일 마스터|단일 Row 입력 폼 서식|
|[TPL030](http://dev.textileon.net/arha/sample/uipattern/TPL030.html)|멀티 마스터|데이터가 많지 않은 단일 Row 입력 폼 서식
|[TPL040](http://dev.textileon.net/arha/sample/uipattern/TPL040.html)|멀티 마스터/멀티 디테일|데이터가 많지 않은 단일 Row 입력 폼 서식|

### 기본 레이아웃 구성

Tabler는 `page`, `page-wrapper`, `page-header`, `page-body` 등의 클래스를 활용하여 기본 레이아웃을 구성합니다.

#### 최소 레이아웃 구조

HTML 문서의 기본 구조는 다음과 같습니다. `<body>` 태그에 `style="visibility: hidden;"`이 적용된 것은 HandStack 시스템의 초기 로딩 성능 최적화를 위한 것으로, 화면 로딩 전 깜빡임(FOUC, Flash Of Unstyled Content)을 방지하기 위함입니다.

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="visibility: hidden;">
    <form autocomplete="off" id="form1" syn-datafield="MainForm">
        <div class="page">
            <div class="page-wrapper">
                <div class="page-header mt-2 d-print-none">
                    <div class="container-fluid max-width:1600!">
                        <div class="row g-2 align-items-center">
                            <div class="col">
                                <div class="page-pretitle f:12!">
                                    GNB 메뉴 / LNB 메뉴
                                </div>
                                <h2 class="page-title">
                                    프로젝트 항목
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="page-body mt-2">
                    <div class="container-fluid max-width:1600!">
						<!-- 여기에 화면 레이아웃과 디자인을 생성 -->
                    </div>
                </div>
            </div>
        </div>
    </form>
    <script src="/arha/js/syn.loader.js"></script>
</body>
</html>
```

#### 레이아웃 작성 지침

- 반응형 디자인: `col-`, `d-none`, `d-md-block` 등 Bootstrap 5의 반응형 클래스를 적극적으로 활용하여 다양한 디바이스에 최적화된 화면을 구성합니다.
- 시맨틱 태그: `<header>`, `<footer>`, `<main>`, `<aside>`와 같은 시맨틱 태그를 사용하여 문서 구조의 의미를 명확히 하고 웹 접근성 및 검색 엔진 최적화(SEO)를 고려합니다.
- Master CSS 활용: 필요시 커스텀 CSS는 Master CSS 문법(`f:12!`, `max-width:1600!`, `mr:4` 등)을 활용하여 인라인 스타일처럼 간편하게 적용합니다.
- Tabler 구성 요소 및 아이콘: Tabler에서 제공하는 다양한 UI 컴포넌트(`alert`, `card`, `form-control` 등)와 아이콘을 활용하여 일관된 디자인을 유지합니다. 아이콘은 [Tabler Icons](https://tabler-icons.io/)를 참조하세요.

### HTML Element ID 및 속성 규칙 (HandStack 특화)

HandStack 화면은 HTML Element(이하 UI 컨트롤)에 다음과 같은 확장 속성을 사용하여 서버와의 데이터 연동 및 이벤트 처리를 담당합니다.

- `syn-datafield`: 서버와의 데이터 교환(요청 및 응답)이 필요한 UI 컨트롤에 선언됩니다.
- `syn-events`: HTML Element의 이벤트 핸들러를 문자열 배열 형태로 선언할 수 있습니다 (예: `['click', 'change']`).
- `syn-options`: UI 컨트롤의 외형과 기능을 제어하는 옵션입니다. 각 컨트롤별로 지원하는 옵션 항목이 다르며, JSON 문법을 사용합니다. 문법 오류 시 초기 렌더링 오류가 발생할 수 있으므로 주의해야 합니다.

ID 속성 및 헝가리안 표기법:
위 확장 속성을 사용하는 HTML Element는 반드시 `id` 속성을 선언해야 합니다. `id` 값은 가독성과 일관성을 위해 헝가리안 표기법을 따르며, 태그 이름에 따라 다음 접두사를 사용합니다.

| 접두사(Prefix) | HTML 태그/유형                                | 설명                                                              |
| --- | --- | ---- |
| `btn` | `BUTTON`, `INPUT[type=button]`, `A` | 버튼 |
| `hdn` | `INPUT[type=hidden]` | 숨김 입력 필드 |
| `txt` | `INPUT[type=text]`, `INPUT[type=search]` | 단일 텍스트 입력 필드 |
| `pin` | `INPUT[type=password]` | 비밀번호 입력 필드 |
| `clr` | `INPUT[type=color]` | 색상 선택 입력 필드 |
| `eml` | `INPUT[type=email]` | 이메일 입력 필드 |
| `num` | `INPUT[type=number]` | 숫자 입력 필드 |
| `tel` | `INPUT[type=tel]` | 전화번호 입력 필드 |
| `url` | `INPUT[type=url]` | URL 입력 필드 |
| `smt` | `INPUT[type=submit]` | 제출 버튼 |
| `rst` | `INPUT[type=reset]` | 초기화 버튼 |
| `rdo` | `INPUT[type=radio]` | 라디오 버튼 |
| `chk` | `INPUT[type=checkbox]` | 체크박스 |
| `txt` | `TEXTAREA` | 여러 줄 텍스트 입력 필드 |
| `ddl` | `SELECT` | 드롭다운 목록 (단일 또는 다중 선택) |
| `grd` | `syn_auigrid` (커스텀 태그) | AUIGrid 기반 데이터 그리드 |
| `cht` | `syn_chart` (커스텀 태그) | Chart.js 기반 차트 |
| `chp` | `syn_codepicker` (커스텀 태그) | 코드 도움 팝업 |
| `clp` | `syn_colorpicker` (커스텀 태그) | 색상 팔레트 |
| `dtp` | `syn_datepicker`, `syn_dateperiodpicker` (커스텀 태그) | 날짜/기간 선택 |
| `edt` | `syn_htmleditor`, `syn_sourceeditor` (커스텀 태그) | HTML/소스 코드 편집기 |
| `lst` | `syn_list` (커스텀 태그) | DataTable 기반 목록 그리드 |
| `tvl` | `syn_tree` (커스텀 태그) | Fancytree 기반 트리 뷰 |
| `org` | `syn_organization` (커스텀 태그) | 조직도 뷰 |
| `txt` | `syn_jsoneditor` (커스텀 태그) | JSON 데이터 편집기 |
| `div`, `lbl` 등 | `DIV`, `SPAN`, `LABEL` (게더링/바인딩 필요 시) | `syn-datafield` 속성 사용 시 해당 태그명에 따라 id 부여 규칙 적용 |
| `src` | `syn_data` (커스텀 태그) | 데이터 소스 객체 |
| `ctx` | `syn_contextmenu` (커스텀 태그) | 컨텍스트 메뉴 |

`syn-datafield`와 `belongID`:
`syn-datafield`를 이용한 데이터 거래 시, `syn-options` 속성의 `belongID` 항목이 선언되어 데이터 그룹을 지정합니다.

UI 컨트롤 예시:

```html
<input type="text" id="txtApplicationID" syn-datafield="ApplicationID" syn-options="{editType: 'english'}" syn-events="['click']">
<input type="text" id="txtApplicationName" syn-datafield="ApplicationName" syn-events="['focus', 'change']">
<select id="ddlApplicationType" syn-datafield="ApplicationType" syn-options="{belongID: ['GD01']}" syn-events="['change']"></select>
<input type="text" id="txtRemark" syn-datafield="Remark" syn-options="{belongID: ['GD01']}">
<input id="txtEmailID" syn-datafield="EmailID" syn-options="{editType: 'text', belongID: ['LD01']}" type="text" class="form-control" maxlengthB="256">
<select class="form-select" id="ddlProjectRole" syn-datafield="ProjectRole" syn-options="{toSynControl: false, belongID: ['LD01']}">
    <option value="" selected="">전체</option>
    <option value="D">개발</option>
    <option value="B">업무</option>
    <option value="O">운영</option>
    <option value="M">관리</option>
</select>
<input id="txtMemberName" syn-datafield="MemberName" syn-options="{editType: 'text', belongID: ['LD01']}" type="text" class="form-control" maxlengthB="50">
<div class="input-group">
	<syn_datepicker id="dtpCreatedStartAt" syn-datafield="CreatedStartAt" syn-options="{value: 'month:-6', useRangeSelect: true, rangeEndControlID: 'dtpCreatedEndAt', belongID: ['LD01']}"></syn_datepicker>
</div>
<div class="input-group">
	<syn_datepicker id="dtpCreatedEndAt" syn-datafield="CreatedEndAt" syn-options="{value: 'now', useRangeSelect: true, rangeStartControlID: 'dtpCreatedStartAt', belongID: ['LD01']}"></syn_datepicker>
</div>
```

### Tabler 구성 요소와 아이콘 사용 예시

Tabler는 Bootstrap 5 기반 위에 다양한 UI 컴포넌트와 유틸리티 클래스를 제공하여 화면 개발을 용이하게 합니다. 아이콘은 [Tabler Icons](https://tabler-icons.io/)의 클래스명(`ti ti-[icon-name]`)을 사용하며, 크기는 Master CSS의 `f:XX` 클래스(예: `f:18`, `f:20`, `f:24`)로 조절합니다.

#### 아이콘 (`<i>` 태그 활용)

- 사용법: `<i class="f:XX ti ti-[icon-name]"></i>` 형태로 사용합니다.
- 예시:
    ```html
    <!-- 검색 아이콘 (크기 18px) -->
    <i class="f:18 ti ti-search"></i>
    <!-- 알림 아이콘 (크기 20px) -->
    <i class="f:20 ti ti-bell"></i>
    ```

#### 경고/정보 (`alert`)

- 설명: 사용자에게 정보, 성공, 경고, 오류 등의 메시지를 표시할 때 사용합니다. `alert-dismissible` 클래스를 사용하여 닫기 버튼을 추가할 수 있습니다.
- 클래스: `alert`, `alert-info`, `alert-success`, `alert-warning`, `alert-danger`, `alert-dismissible`, `btn-close`
- 예시:
    ```html
    <div class="alert alert-info alert-dismissible" role="alert">
        <div class="d-flex">
            <div class="mr-2">
                <i class="f:20 ti ti-check"></i>
            </div>
            <div>
                <h4 class="alert-title">작업일자통제 참고사항</h4>
                <div class="text-secondary">
                    <ul class="m-0">
                        <li>이월: 현재 기수의 회계기간 말일 자로 마감일이 자동 입력되어 통제합니다.</li>
                        <li>취소: 이전 기수 회계기간 말일 자로 마감일이 자동 입력되어 통제합니다.</li>
                        <li>일마감, 월마감 등으로 관리하는 경우 마감일을 직접 입력하여 통제합니다.</li>
                    </ul>
                </div>
            </div>
        </div>
        <span class="btn-close" data-bs-dismiss="alert" aria-label="close"></span>
    </div>
    <div class="alert alert-success" role="alert">
        <div class="d-flex">
            <div class="mr-2">
                <i class="f:20 ti ti-check"></i>
            </div>
            <div>
                Wow! Everything worked!
            </div>
        </div>
    </div>
    ```

#### 카드 (`card`)

- 설명: 콘텐츠를 그룹화하고 정리하는 유연한 컨테이너입니다. 헤더, 바디, 푸터, 상태 바 등을 포함할 수 있습니다.
- 클래스: `card`, `card-status-top`, `card-header`, `card-title`, `card-body`, `card-footer`
- 예시:
    ```html
    <div class="card">
        <div class="card-status-top bg-dark-overlay"></div>
        <div class="card-header">
            <h3 class="card-title">알림 정보</h3>
            <div class="card-actions">
                <a href="#" class="btn btn-primary">
                    <i class="f:18 ti ti-plus"></i>
                    Add new
                </a>
            </div>
        </div>
        <div class="card-body">
            카드 본문 내용
        </div>
        <div class="card-footer text-end">
            <button type="submit" class="btn btn-primary ms-auto">Send data</button>
        </div>
    </div>
    ```

#### 버튼 (`button`, `a` 태그)

- 설명: 사용자 상호작용을 위한 버튼입니다. 다양한 스타일, 크기, 상태를 가질 수 있습니다.
- 클래스: `btn`, `btn-primary`, `btn-secondary`, `btn-success`, `btn-warning`, `btn-danger`, `btn-info`, `btn-dark`, `btn-light`, `btn-outline-*`, `btn-ghost-*`, `btn-square`, `btn-pill`, `active`, `disabled`, `btn-icon`, `btn-list`, `btn-group`, `btn-group-vertical`
- 예시:
    ```html
    <!-- 표준 버튼 -->
    <button type="button" class="btn btn-primary">Primary</button>
    <a href="#" class="btn btn-secondary">Secondary</a>

    <!-- 윤곽선 버튼 (Outline Buttons) -->
    <button type="button" class="btn btn-outline-primary">Primary</button>

    <!-- 고스트 버튼 (Ghost Buttons) -->
    <button type="button" class="btn btn-ghost-primary">Primary</button>

    <!-- 사각형 버튼 (Square Buttons) -->
    <button type="button" class="btn btn-primary btn-square">Primary</button>

    <!-- 알약형 버튼 (Pill Buttons) -->
    <button type="button" class="btn btn-primary btn-pill">Primary</button>

    <!-- 아이콘 버튼 -->
    <button type="button" class="btn btn-icon">
        <i class="f:18 ti ti-plus"></i>
    </button>

    <!-- 버튼 그룹 -->
    <div class="btn-group" role="group">
        <button type="button" class="btn btn-primary">Left</button>
        <button type="button" class="btn btn-primary">Middle</button>
        <button type="button" class="btn btn-primary">Right</button>
    </div>

    <!-- 아이콘과 텍스트가 있는 버튼 -->
    <button type="button" id="btnNewDataList" syn-events="['click']" class="btn btn-primary">
        <i class="f:20 mr:4 ti ti-news"></i>
        신규 항목
    </button>
    ```

#### 배지 (`badge`)

- 설명: 작은 카운트나 라벨을 표시할 때 사용합니다. 헤딩, 버튼, 드롭다운 메뉴 등에 추가할 수 있습니다.
- 클래스: `badge`, `bg-*` (색상), `text-*-fg` (대비 글자색), `bg-*-lt` (옅은 색상), `badge-outline`, `badge-notification`, `badge-pill`, `badge-blink`
- 예시:
    ```html
    <!-- 기본 배지 -->
    <h1>Example heading <span class="badge">New</span></h1>
    <!-- 색상 배지 -->
    <span class="badge bg-blue text-blue-fg">Blue</span>
    <span class="badge bg-green-lt">Green (Light)</span>
    <!-- 윤곽선 배지 -->
    <span class="badge badge-outline text-red">Red</span>
    <!-- 버튼 내 배지 -->
    <button class="btn">Blue badge <span class="badge bg-blue text-blue-fg ms-2">1</span></button>
    <!-- 알림 배지 (점 형태) -->
    <button class="btn position-relative">Azure badge <span class="badge bg-azure badge-notification badge-pill">2</span></button>
    <button class="btn position-relative">Red badge <span class="badge bg-red badge-notification badge-blink"></span></button>
    ```

#### 폼 요소 (`input`, `select`, `textarea`, `label` 등)

- 설명: 사용자 입력을 받는 다양한 폼 컨트롤입니다. Tabler는 깔끔한 디자인과 유용한 확장 기능을 제공합니다.
- 클래스: `form-label`, `form-control`, `form-control-plaintext`, `form-control-rounded`, `form-control-flush`, `input-group`, `input-icon`, `form-help`, `is-valid`, `is-invalid`, `form-check`, `form-check-inline`, `form-check-description`, `form-switch`, `form-imagecheck`, `form-colorinput`, `form-selectgroup`, `form-selectgroup-item`, `form-floating`
- 예시:
    ```html
    <!-- 일반 텍스트 입력 -->
    <div class="mb-3">
        <label class="form-label">Text</label>
        <input type="text" class="form-control" name="example-text-input" placeholder="Input placeholder">
    </div>
    <!-- 읽기 전용 입력 -->
    <div class="mb-3">
        <label class="form-label">Readonly</label>
        <input type="text" class="form-control" value="Well, how'd you become king, then?" readonly="">
    </div>
    <!-- 아이콘이 있는 입력 필드 -->
    <div class="input-icon mb-3">
        <input type="text" value="" class="form-control" placeholder="Search…">
        <span class="input-icon-addon">
            <i class="f:18 ti ti-search"></i>
        </span>
    </div>
    <!-- 플로팅 레이블 입력 필드 (Floating Inputs) -->
    <div class="form-floating mb-3">
        <input type="email" class="form-control" id="floating-input" value="name@example.com">
        <label for="floating-input">Email address</label>
    </div>
    <!-- 이미지 체크 (Image Check) -->
    <label class="form-imagecheck mb-2">
        <input name="form-imagecheck" type="checkbox" value="1" class="form-imagecheck-input">
        <span class="form-imagecheck-figure">
            <img src="/arha/img/photos/beautiful-blonde-woman-relaxing-with-a-can-of-coke-on-a-tree-stump-by-the-beach.jpg" alt="Beautiful blonde woman relaxing with a can of coke on a tree stump by the beach" class="form-imagecheck-image">
        </span>
    </label>
    <!-- 색상 입력 (Color Input) -->
    <label class="form-colorinput">
        <input name="color" type="radio" value="blue" class="form-colorinput-input">
        <span class="form-colorinput-color bg-blue"></span>
    </label>
    <!-- 토글 스위치 (Toggle Switches) -->
    <label class="form-check form-switch">
        <input class="form-check-input" type="checkbox" checked="">
        <span class="form-check-label">Option 1</span>
    </label>
    <!-- 파일 입력 -->
    <input type="file" class="form-control">
    <!-- 데이터리스트 -->
    <input class="form-control" list="datalistOptions" placeholder="Type to search...">
    <datalist id="datalistOptions">
        <option value="Andorra"></option>
        <option value="United Arab Emirates"></option>
    </datalist>
    <!-- 범위 입력 (Range Input) -->
    <input type="range" class="form-range mb-2" value="40" min="0" max="100" step="10">
    ```

#### 폼 셀렉트 그룹 (`form-selectgroup`)

- 설명: 여러 개의 라디오 또는 체크박스 옵션을 시각적으로 그룹화하는 컴포넌트입니다. 아이콘이나 아바타를 포함할 수 있습니다.
- 클래스: `form-selectgroup`, `form-selectgroup-item`, `form-selectgroup-input`, `form-selectgroup-label`, `form-selectgroup-pills`, `form-selectgroup-boxes`
- 예시:
    ```html
    <!-- 기본 셀렉트 그룹 -->
    <div class="form-selectgroup">
        <label class="form-selectgroup-item">
            <input type="checkbox" name="name" value="HTML" class="form-selectgroup-input" checked="">
            <span class="form-selectgroup-label">HTML</span>
        </label>
    </div>
    <!-- 아이콘이 있는 셀렉트 그룹 -->
    <div class="form-selectgroup">
        <label class="form-selectgroup-item">
            <input type="checkbox" name="name" value="sun" class="form-selectgroup-input" checked="">
            <span class="form-selectgroup-label">
                <i class="f:18 ti ti-sun"></i>
            </span>
        </label>
    </div>
    <!-- 아바타가 있는 박스형 셀렉트 그룹 -->
    <div class="form-selectgroup form-selectgroup-boxes d-flex flex-column">
        <label class="form-selectgroup-item flex-fill">
            <input type="checkbox" name="form-project-manager[]" value="1" class="form-selectgroup-input">
            <div class="form-selectgroup-label d-flex align-items-center p-3">
                <div class="me-3">
                    <span class="form-selectgroup-check"></span>
                </div>
                <div class="form-selectgroup-label-content d-flex align-items-center">
                    <span class="avatar me-3" style="background-image: url(/arha/img/avatars/000m.jpg)"></span>
                    <div>
                        <div class="font-weight-medium">Paweł Kuna</div>
                        <div class="text-secondary">UI Designer</div>
                    </div>
                </div>
            </div>
        </label>
    </div>
    ```

#### 라디오 버튼 (`input type="radio"`)

- 설명: 여러 옵션 중 하나만 선택할 수 있는 폼 요소입니다.
- 클래스: `form-check`, `form-check-input`, `form-check-label`, `form-check-inline`
- 예시:
    ```html
    <div class="mb-3">
        <div class="form-label">Radios</div>
        <div>
            <label class="form-check">
                <input class="form-check-input" type="radio" name="radios" checked="">
                <span class="form-check-label">Option 1</span>
            </label>
            <label class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="radios-inline">
                <span class="form-check-label">Option 2</span>
            </label>
        </div>
    </div>
    ```

#### 체크박스 (`input type="checkbox"`)

- 설명: 여러 옵션 중 하나 이상을 선택할 수 있는 폼 요소입니다.
- 클래스: `form-check`, `form-check-input`, `form-check-label`, `form-check-inline`, `form-check-description`
- 예시:
    ```html
    <div class="mb-3">
        <div class="form-label">Checkboxes</div>
        <div>
            <label class="form-check">
                <input class="form-check-input" type="checkbox">
                <span class="form-check-label">Checkbox input</span>
            </label>
            <label class="form-check form-check-inline">
                <input class="form-check-input" type="checkbox" checked="">
                <span class="form-check-label">Option 3</span>
            </label>
            <label class="form-check">
                <input class="form-check-input" type="checkbox">
                <span class="form-check-label">
                    Checkboxes with description
                </span>
                <span class="form-check-description">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                </span>
            </label>
        </div>
    </div>
    ```

#### 타이포그래피 (Typography)

- 설명: 텍스트 스타일링 및 목록, 인용구 등을 정의합니다.
- 클래스: `text-primary`, `text-secondary`, `text-body`, `text-success`, `text-info`, `text-warning`, `text-danger`, `text-pink`, `list-unstyled`, `blockquote`, `blockquote-footer`
- 예시:
    ```html
    <!-- 헤딩 -->
    <h1>H1 Lorem ipsum dolor sit amet</h1>
    <h2>H2 Lorem ipsum dolor sit amet</h2>
    <!-- 텍스트 요소 -->
    <div>You can use the mark tag to <mark>highlight</mark> text.</div>
    <div>The following snippet of text is <strong>rendered as bold text.</strong></div>
    <div>The following snippet of text show useful keyboard shortcut: <kbd>⌘</kbd> + <kbd>C</kbd>.</div>
    <!-- 텍스트 색상 -->
    <div class="text-primary">This is an example of primary text.</div>
    <div class="text-danger">This is an example of danger text.</div>
    <!-- 인용구 -->
    <blockquote class="blockquote">
        <p>I don't want to talk to you no more, you empty-headed animal food trough water!</p>
        <footer class="blockquote-footer">Julius Cesar</footer>
    </blockquote>
    <!-- 정렬되지 않은 목록 -->
    <ul>
        <li>lorem ipsum doloret</li>
        <li>lorem ipsum doloret</li>
    </ul>
    ```

#### 단계 진행 (`steps`, `breadcrumb`)

- 설명: 작업 흐름이나 단계별 진행 상황을 시각적으로 나타냅니다.
- 클래스: `steps`, `steps-green`, `step-item`, `active`, `steps-counter`, `steps-vertical`, `breadcrumb`, `breadcrumb-arrows`, `breadcrumb-muted`
- 예시:
    ```html
    <!-- 수평 단계 진행 -->
    <ul class="steps steps-green my-4">
        <li class="step-item">1</li>
        <li class="step-item active">2</li>
        <li class="step-item">3</li>
    </ul>
    <!-- 텍스트와 함께 수평 단계 진행 -->
    <ul class="steps steps-green steps-counter my-4">
        <li class="step-item">Cart</li>
        <li class="step-item active">Billing Information</li>
        <li class="step-item">Confirmation</li>
    </ul>
    <!-- 수직 단계 진행 -->
    <ul class="steps steps-vertical">
        <li class="step-item">
            <div class="h4 m-0">Order received</div>
            <div class="text-secondary">Lorem ipsum dolor sit amet.</div>
        </li>
        <li class="step-item active">
            <div class="h4 m-0">Out for delivery</div>
        </li>
    </ul>
    <!-- 화살표 형태의 Breadcrumb -->
    <ol class="breadcrumb breadcrumb-arrows">
        <li class="breadcrumb-item"><a href="#">Step one</a></li>
        <li class="breadcrumb-item active"><a href="#">Step two</a></li>
        <li class="breadcrumb-item disabled"><a href="#">Step three</a></li>
    </ol>
    ```

#### 탭 (`nav`)

- 설명: 여러 섹션의 콘텐츠를 탭 형태로 전환하여 표시합니다.
- 클래스: `nav`, `nav-bordered`, `nav-item`, `nav-link`, `active`
- 예시:
    ```html
    <ul class="nav nav-bordered">
        <li class="nav-item">
            <span class="nav-link active">
                <i class="f:20 mr:4 ti ti-news"></i>
                View all
            </span>
        </li>
        <li class="nav-item">
            <span class="nav-link">
                <i class="f:20 mr:4 ti ti-news"></i>
                Marketing
            </span>
        </li>
    </ul>
    ```

#### 모달 (`modal`)

- 설명: 현재 페이지 위에 뜨는 오버레이 대화상자입니다. 사용자 상호작용이 필요한 경우나 추가 정보를 표시할 때 사용합니다.
- 클래스: `modal`, `modal-blur`, `fade`, `modal-dialog`, `modal-dialog-centered`, `modal-dialog-scrollable`, `modal-lg`, `modal-sm`, `modal-full-width`, `modal-content`, `modal-header`, `modal-title`, `modal-body`, `modal-footer`, `modal-status`
- 예시:
    ```html
    <!-- 단순 모달 -->
    <a href="#" class="btn" data-bs-toggle="modal" data-bs-target="#modal-simple">
        Simple modal
    </a>
    <div class="modal modal-blur fade" id="modal-simple" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Modal title</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn me-auto" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Save changes</button>
                </div>
            </div>
        </div>
    </div>

    <!-- 성공 모달 -->
    <a href="#" class="btn" data-bs-toggle="modal" data-bs-target="#modal-success">
        Success modal
    </a>
    <div class="modal modal-blur fade" id="modal-success" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-sm modal-dialog-centered" role="document">
            <div class="modal-content">
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                <div class="modal-status bg-success"></div>
                <div class="modal-body text-center py-4">
                    <i class="f:18 ti ti-circle-check"></i>
                    <h3>Payment succedeed</h3>
                    <div class="text-secondary">Your payment of $290 has been successfully submitted.</div>
                </div>
                <div class="modal-footer">
                    <div class="w-100">
                        <div class="row">
                            <div class="col">
                                <a href="#" class="btn w-100" data-bs-dismiss="modal">Go to dashboard</a>
                            </div>
                            <div class="col">
                                <a href="#" class="btn btn-success w-100" data-bs-dismiss="modal">View invoice</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    ```

---

### HandStack 커스텀 UI 컨트롤

HandStack은 검증된 오픈소스 라이브러리를 통합하거나 자체 기능을 구현하여 확장된 UI 컨트롤을 제공합니다. 각 컨트롤은 HandStack의 데이터 바인딩 및 이벤트 시스템과 연동됩니다.

#### CheckBox (커스텀 스타일)

브라우저마다 다르게 표시되는 체크박스를 일관되게 표현하기 위해 [CSS Checkbox Library](https://github.com/hunzaboy/CSS-Checkbox-Library)를 사용합니다.

```html
<div class="ckbx-square-1">
  <input type="checkbox" checked id="ckbx-square-1-2" value="0" name="ckbx-square-1">
  <label for="ckbx-square-1-2"></label>
</div>
```

#### CodePicker (`<syn_codepicker>`)

코드 도움 팝업 기능을 제공합니다.

```html
<syn_codepicker id="chpSubjectID" syn-datafield="SubjectID"
syn-options="{belongID: 'LD01',
  dataSourceID: 'CHP005',
  local: false,
  isMultiSelect: false,
  textBelongID: ['LD01', 'MD01'],
  textDataFieldID: 'CodeText'}">
</syn_codepicker>
```

#### ColorPicker (`<syn_colorpicker>`)

색상 팔레트를 제공하며, [Color-picker.js](https://github.com/taufik-nurrohman/color-picker)를 기반으로 합니다.

```html
<syn_colorpicker id="clpColorPicker" syn-datafield="ColorPicker">
</syn_colorpicker>
```

#### ContextMenu (`<syn_contextmenu>`)

오른쪽 마우스 버튼 기능을 활용하여 컨텍스트 메뉴를 제공하며, [jQuery UI Contextmenu](https://github.com/mar10/jquery-ui-contextmenu)를 기반으로 합니다.

```html
<syn_contextmenu id="ctxButtonControl" syn-options="{
    target: 'div',
    delegate: 'input[type=button]'
}" syn-events="['close', 'beforeOpen', 'open', 'select']">
</syn_contextmenu>
```

#### DataSource (`<syn_data>`)

단일 또는 여러 데이터 건의 데이터 소스 객체 기능을 제공합니다.

```html
<syn_data id="srcForm1" syn-options="{
    dataSourceID: 'StoreForm',
    storeType: 'Form',
	columns: [
        { data: 'ApplicationID', dataType: 'string', belongID: 'LD01' },
        { data: 'CodeGroupID', dataType: 'string', belongID: ['LD01', 'MD01'] }
    ]
}"></syn_data>
```

#### DatePicker, DatePeriodPicker (`<syn_datepicker>`, `<syn_dateperiodpicker>`)

날짜, 기간 선택 기능을 제공하며, [Pikaday](https://pikaday.com/)와 [Moment.js](https://momentjs.com/)를 기반으로 합니다.

```html
<div class="input-group">
	<syn_datepicker id="dtpDatePicker" syn-options="{format: 'YYYY-MM-DD'}"></syn_datepicker>
</div>
<div class="input-group">
	<syn_datepicker id="dtpStartDatePicker" syn-options="{format: 'YYYY-MM-DD', useRangeSelect: true, rangeEndControlID: 'dtpEndDatePicker'}">
</syn_datepicker>
</div>
<div class="input-group">
	<syn_dateperiodpicker id="dtpInputRangeAt" syn-datafield="InputRangeAt" syn-options="{value: 'day:-7', belongID: ['LD01']}"></syn_dateperiodpicker>
</div>
```

#### DropDownCheckList, DropDownList (`<select>`)

여러 개의 항목을 선택할 수 있는 콤보박스를 제공하며, [tail.select.js](https://getbutterfly.com/tail-select)를 기반으로 합니다.

```html
<select id="ddlFileExtension" syn-options="{dataSourceID: 'CH000',
parameters: '@GROUPCODE:MS001;',
local: false,
toSynControl: true,
required: false}"></select>
<select id="ddlBusinessRank" syn-options="{dataSourceID: 'CH000',
parameters: '@GROUPCODE:MS002;',
local: false,
toSynControl: true,
required: false}" multiple></select>
```

#### FileClient (`<syn_fileclient>`)

파일 업로드/다운로드 기능을 제공합니다.

```html
<syn_fileclient id="txtProfile1FileID" syn-datafield="Profile1FileID" syn-options="{
    repositoryID: 'LFSLP01'
}"></syn_fileclient>
```

#### HtmlEditor (`<syn_htmleditor>`)

파일 업로드/다운로드 기능이 통합된 HTML 편집기 기능을 제공하며, [TinyMCE](https://www.tiny.cloud/docs/demo/)를 기반으로 합니다.

```html
<syn_htmleditor id="txtHtmlEditor" syn-datafield="HtmlEditor" style="width:100%; height: 320px;" syn-options="{
    repositoryID: 'LFSLE01'
}">
</syn_htmleditor>
```

#### RadioButton (커스텀 스타일)

브라우저마다 다르게 표시되는 라디오버튼을 일관되게 표현합니다.

```html
<input id="rdoUseYN1" name="rdoUseYN" type="radio"
syn-datafield="RadioUseYN" value="value 1" syn-options="{textContent: '사용',
toSynControl: true}">
<input id="rdoUseYN2" name="rdoUseYN" type="radio"
syn-datafield="RadioUseYN" value="value 2" syn-options="{textContent: '미사용',
toSynControl: true}">
<input id="rdoUseYN3" name="rdoUseYN" type="radio"
syn-datafield="RadioUseYN" value="value 3" checked="checked" syn-options="{textContent: '알수없음',
toSynControl: true}">
```

#### SourceEditor (`<syn_sourceeditor>`)

소스 편집기에 특화된 에디터 기능을 제공하며, [Monaco Editor](https://microsoft.github.io/monaco-editor/)를 기반으로 합니다.

```html
<syn_sourceeditor id="edtEditor1" syn-datafield="Editor1"
syn-options="{contents: 'hello world',
language:'javascript',
minimap: {enabled: true}}">
</syn_sourceeditor>
```

#### TextArea (`<textarea>`)

여러 텍스트 줄을 관리하기 위한 추가 기능을 제공하며, [CodeMirror](https://codemirror.net/5/)를 기반으로 합니다.

```html
<textarea id="txtTextArea" syn-datafield="TextArea" syn-options="{width: '800px'}">
using System;

namespace Example
{
    public class Employee : Person
    {
    }
}
</textarea>
```

#### TextBox (`<input type="text">`)

단일 텍스트를 관리하기 위한 추가 기능을 제공하며, [iSpin.js](https://unmanner.github.io/ispinjs/), [Superplaceholder.js](https://github.com/chinchang/superplaceholder.js/), [Vanilla Masker](https://vanilla-masker.github.io/vanilla-masker/) 등을 통합하여 사용합니다.

```html
txtApplicationID - <input id="txtApplicationID" type="text" syn-options="{editType: 'numeric', formatNumber: false, dataType: 'int'}" value="0">
txtSpinnerID - <input id="txtSpinnerID" type="text" syn-options="{editType: 'spinner', dataType: 'int', minCount: -10, maxCount: 10}" value="0">
txtCreateDate - <input id="txtCreateDate" type="text" syn-options="{editType: 'date'}">
txtHour - <input id="txtHour" type="text" syn-options="{editType: 'hour'}">
txtMinute - <input id="txtMinute" type="text" syn-options="{editType: 'minute'}">
txtYearMonth - <input id="txtYearMonth" type="text" syn-options="{editType: 'yearmonth'}">
txtHomePhone - <input id="txtHomePhone" type="text" syn-options="{editType: 'homephone'}">
txtMobilePhone - <input id="txtMobilePhone" type="text" syn-options="{editType: 'mobilephone'}">
txtEmail - <input id="txtEmail" type="text" syn-options="{editType: 'email'}">
txtCodeGroupID - <input id="txtCodeGroupID" type="text" syn-options="{editType: 'text'}">
txtJuminID - <input id="txtJuminID" type="text" syn-options="{editType: 'juminno'}">
txtBusinessID - <input id="txtBusinessID" type="text" syn-options="{editType: 'businessno'}">
txtCustomFormat - <input id="txtCustomFormat" type="text" syn-options="{editType: 'text', maskPattern: '(99) SSSS-AAAA'}">
txtMaxLength - <input id="txtMaxLength" maxlengthB="10" type="text" syn-options="{editType: 'text'}">
```

#### syn_auigrid (`<syn_auigrid>`)

대량 편집이 가능한 그리드 컴포넌트 기능을 제공합니다. (AUIGrid는 상용 라이브러리입니다.)

```html
<syn_auigrid id="grdFeatureTransactItem" syn-options="{
  width: 670,
  height: 206,
  columns: [
    ['FeatureID', '기능 ID', 100, false, 'text', false, 'left'],
    ['Authorize', '인증', 60, false, 'checkbox', false, 'center']
  ]
}" syn-events="['afterSelectionEnd']"></syn_auigrid>
```

#### Element (`<div>`, `<span>`, `<label>` 등)

HTML Element에 게더링 및 바인딩 기능을 제공합니다.

```html
<div id="divElement1" syn-datafield="Element1"
syn-options="{belongID: 'LD01', content: 'value'}" value="div value 1"></div>
<span id="lblElement2" syn-datafield="Element2"
syn-options="{belongID: 'LD01', content: 'text'}">span value 1</span>
<label id="lblElement3" syn-datafield="Element3"
syn-options="{belongID: 'LD01', content: 'html'}">blabla</label>
```

#### Chart (`<syn_chart>`)

데이터 시각화 기능을 제공하며, [Chart.js](https://www.chartjs.org/)를 기반으로 합니다.

```html
<syn_chart id="chtChart" style="width:450px; height: 320px;"></syn_chart>
```

#### GridList (`<syn_list>`)

데이터 조회에 특화된 기능을 제공하며, [DataTables](https://www.datatables.net/examples/index)를 기반으로 합니다.

```html
<syn_list id="lstDataTable" syn-options="{
    checkbox: true,
    pageLength: 50,
    columns: [
        { title: 'ID', data: 'id', visible: true, width: '30px' },
        { title: 'Name', data: 'name', width: '200px' }
    ]
}" syn-events="['select']" style="width: 100%; border: 1px solid;"></syn_list>
```

#### TreeView (`<syn_tree>`)

재귀적으로 트리 구조를 표현하는 기능을 제공하며, [Fancytree](https://www.wendt.de/tech/fancytree/demo/)를 기반으로 합니다.

```html
<syn_tree id="tvlTreeView" syn-options="{
    checkbox: false,
    itemID: 'key',
    parentItemID: 'parentID',
    childrenID: 'children',
    reduceMap: {
        key: 'PROGRAMID',
        title: 'PROGRAMNAME',
        parentID: 'PARENTID',
        folder: 'FOLDERYN',
        icon: false
    }
}" syn-events="['click', 'focus', 'dblclick']"></syn_tree>
```

#### JsonEditor (`<syn_jsoneditor>`)

JSON 데이터를 직관적으로 편집하는 기능을 제공하며, [JSONEditor](https://jsoneditoronline.org/)를 기반으로 합니다.

```html
<syn_jsoneditor id="txtEditor" syn-options="{contents: '{}'}"></syn_jsoneditor>
```

#### OrganizationView (`<syn_organization>`)

조직도 데이터를 직관적으로 편집하는 기능을 제공하며, [OrgChart](https://github.com/dabeng/OrgChart)를 기반으로 합니다.

```html
<syn_organization id="orgChartView" syn-options="{
    draggable: true,
    nodeTitle: 'name',
    nodeContent: 'title',
    reduceMap: {
        key: 'id',
        title: 'title',
        parentID: 'parentId',
    },
    nodeTemplate: '$this.event.orgChartView_nodeTemplate',
    createNode: '$this.event.orgChartView_createNode'
}" syn-events="['nodedrop', 'select', 'click']"></syn_organization>
```

# MasterCSS 웹 디자인 시스템 지침

본 시스템의 웹 개발은 Tabler CSS Framework를 기본으로 사용하여 일관된 UI 컴포넌트 기반 개발을 진행하며,
레이아웃 및 세부 디자인 조정, 맞춤형 스타일링은 MasterCSS로 처리합니다.

이 구조는

* 빠른 UI 구성(Tabler)
* 세부 레이아웃/스타일의 유연한 제어(MasterCSS)
* 유지보수성과 확장성 확보

를 동시에 달성하기 위함입니다.

## 적용 원칙

### Tabler 활용 규칙

* 페이지 기본 레이아웃, 네비게이션, 버튼, 카드, 테이블 등 공통 컴포넌트는 Tabler 클래스를 우선 사용
* Tabler의 spacing(`.mt-2`, `.p-3`), 그리드(`.row`, `.col-md-6`) 시스템을 기본 적용
* UI 일관성을 위해 불필요한 커스텀 CSS 작성 금지

### MasterCSS 활용 규칙

* Tabler로 처리하기 어려운 세부 레이아웃, 색상, 상태 기반 스타일, 반응형 조정은 MasterCSS 사용
* MasterCSS의 축약 문법(semantic, acronym, shorthand, symbolic)으로 가독성과 유지보수성 확보
* 다크 모드, 상태(hover, active, open), breakpoint 기반 레이아웃 조정에 MasterCSS 사용

### 결합 규칙

* Tabler의 기본 구조 + MasterCSS의 세부 스타일 조합으로 개발
* 마진/패딩 조정이 필요할 경우 Tabler spacing이 부족하면 MasterCSS(`m:4`, `p:2`)로 보완
* 상태 기반 스타일 변경은 MasterCSS로 처리 (`hover:bg:gray-100`, `@md:flex-row` 등)

## MasterCSS 사용 문법 요약

* Semantic & Acronym: `flex`, `grid`, `f:16`(font-size:16px)
* Shorthand: `p:8|16`(padding:8px 16px), `b:1|solid|gray-300`
* Symbolic: `@fade|300ms`, `~opacity|200ms`
* 상태/조건: `:hover`, `:active`, `@md`, `.active`, `[open]`
* 다크모드: `bg:white@light bg:gray-22@dark`

## 구체 예시

### 예시 1: Tabler 그리드 기반 + MasterCSS 레이아웃 보정

```html
<div class="row g-2 p-3">
  <div class="col-md-6 col-12 p:4 bg:white round shadow hover:bg:gray-100 transition">
    <h2 class="f:20 font:bold mb:2">카드 제목</h2>
    <p class="f:14 color:gray-600">카드 내용입니다.</p>
  </div>
</div>
```

### 예시 2: Tabler 버튼 + MasterCSS 상태 제어

```html
<button
  class="btn btn-primary px:4 py:2 @fade|ease-in|150ms:hover ~opacity|opacity|150ms"
>
  저장
</button>
```

### 예시 3: 폼 입력 필드

```html
<div class="mb-3 flex flex-col gap:2">
  <label class="form-label f:14 font:medium">이메일</label>
  <input
    type="email"
    class="form-control border:gray-300|1|solid focus:border:blue focus:ring:blue/.2 transition"
    placeholder="example@email.com"
  />
</div>
```

### 예시 4: 헤더 (다크모드 + 반응형)

```html
<header class="navbar bg:white@light bg:gray-22@dark p:3 flex flex-col sm:flex-row items-center justify-between">
  <a href="#" class="navbar-brand f:20 font:bold">로고</a>
  <nav class="flex gap:3 mt:2 sm:mt:0">
    <a class="nav-link color:gray-700 hover:color:blue">홈</a>
    <a class="nav-link color:gray-700 hover:color:blue">서비스</a>
    <a class="nav-link color:gray-700 hover:color:blue">문의</a>
  </nav>
</header>
```
