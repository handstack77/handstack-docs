# 화면 HTML 규칙

프레임워크 공식 지침(`information/resource/HandStack-화면-HTML-작성-지침`)과 여러 업무 화면에서 반복되는 관례를 정리했다. 프로젝트의 `DESIGN.md`가 이 문서와 다르면 `DESIGN.md`가 우선이다.

## 목차
1. 골격
2. 확장 속성과 ID 접두어
3. 레이아웃·스타일 관례
4. 그리드(syn_auigrid) 컬럼 튜플
5. 주요 컨트롤 모음
6. 팝업 조각
7. 자주 하는 실수

## 1. 골격

화면 HTML은 `syn.loader.js`가 읽어 초기화하는 조각이다. 대부분의 화면이 아래 형태를 공유한다.

```html
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="visibility: hidden;">
    <form autocomplete="off" id="form1" syn-datafield="MainForm">
        <div class="page">
            <div class="page-wrapper">
                <div class="page-header mt-2">
                    <div class="container-fluid max-width:1600!">
                        <div class="page-pretitle f:12!">상위 메뉴 / 하위 메뉴</div>
                        <h2 class="page-title">화면 제목</h2>
                    </div>
                </div>
                <div class="page-body mt-2">
                    <div class="container-fluid max-width:1600!"><!-- 본문 --></div>
                </div>
            </div>
        </div>
    </form>
    <script src="/{모듈 경로}/js/syn.loader.js"></script>
</body>
</html>
```

- `<body style="visibility: hidden;">`은 초기 깜빡임 방지용이며 로더가 해제한다. 지우지 않는다.
- 최상위 `<form id="form1" syn-datafield="MainForm">` 하나가 기본 입력 폼이다. `syn-datafield`를 쓰는 컨트롤은 반드시 `id`를 가진다.
- 로더 `<script src>` 경로는 모듈마다 다르다(모듈 루트 기준 `/js/syn.loader.js` 또는 `/syn.loader.js`). 이웃 화면의 것을 그대로 쓴다.
- 짝이 되는 같은 이름의 JS는 로더가 자동으로 읽는다. 팝업 조각처럼 JS가 필요 없는 예외는 이유를 남긴다.

## 2. 확장 속성과 ID 접두어

| 속성 | 의미 |
|---|---|
| `syn-datafield` | 서버와 주고받는 데이터 이름. 폼에 쓰면 폼 그룹 이름(`MainForm`), 컨트롤에 쓰면 필드 이름, 그리드/저장소에 쓰면 결과 집합 이름. 관례는 PascalCase |
| `syn-options` | 컨트롤 옵션(JS 객체 리터럴). 문법 오류는 초기화 오류가 된다 |
| `syn-events` | 연결할 이벤트 이름 배열 `['click','change']`. 선언해야 `event.{id}_{이벤트}`가 호출된다 |

`syn-options` 공통 키: `belongID`(거래 ID 문자열/배열), `dataType`(`string`/`number`/`int`/`bool`/`date`), `controlText`, `validators`(`require`,`unique`,`numeric`,`email`,`date`,`url`,`ipaddress`), `required`, `editType`, `maxlength`, `toSynControl`, `triggerConfig`, `transactConfig`, `bindingID`, `tooltip`.

`id`의 접두어(헝가리안): `btn` 버튼, `hdn` hidden, `txt` 텍스트/textarea, `pin` 비밀번호, `num` 숫자, `chk` 체크박스, `rdo` 라디오, `ddl` select, `grd` syn_auigrid/syn_grid, `lst` syn_list, `tvl` syn_tree, `cht` 차트, `chp` syn_codepicker, `dtp` 날짜/기간, `edt` HTML/소스 편집기, `sig` 서명, `fdz` 파일 드롭존, `org` 조직도, `src` syn_data, `ctx` 컨텍스트 메뉴. 파일 업로드(`syn_fileclient`)는 프로젝트별 접두어를 쓰는 경우가 있으니 이웃 화면을 따른다.

`belongID` 예:

```html
<input type="text" id="txtTitle" syn-datafield="Title" syn-options="{belongID: ['LD01', 'MD01'], editType: 'text'}" maxlength="100">
<input type="hidden" id="hdnCreatedUserNo" syn-datafield="CreatedUserNo" syn-options="{belongID: ['MD01']}">
<select class="form-select" id="ddlStatus" syn-datafield="Status" syn-options="{belongID: ['LD01'], dataSourceID: 'CHP001', parameters: '@GROUPCODE:STATUS;', local: false, toSynControl: true}"></select>
<syn_dateperiodpicker id="dtpPeriod" syn-datafield="Period" syn-options="{value: 'day:-7', belongID: ['LD01']}"></syn_dateperiodpicker>
```

서버로 보내야 하는데 사용자에게 보일 필요 없는 값(사용자 번호, 회사 번호, 플래그)은 `hidden` 입력에 `syn-datafield`+`belongID`를 주고 `pageLoad`에서 `syn.$w.User`/`syn.$w.Variable` 값을 채운다. 어떤 값이 존재하는지는 로그인·셸 코드를 확인한다.

## 3. 레이아웃·스타일 관례

- 기본 스택: **Tabler(Bootstrap 5)** 시각 컴포넌트 + **Master CSS** 런타임 유틸리티(`f:20`, `w:120`, `mr:4`, 끝의 `!`는 important) + **Tabler Icons**(`ti ti-*`).
- 목록 화면: 검색 조건 카드 + 그리드 카드(`syn_auigrid`). 입력 화면: 카드 + `row g-2` + `input-group` 안에 라벨(좌측 고정폭 `w:100`)과 컨트롤. 마스터/디테일: `row g-0`에 `col-3`(목록) + `col`(상세).
- 프레임워크 기본 지침과 대부분의 프로젝트는 `container-fluid` + `max-width:1600!`(팝업 `1200!`, 보고서 `1000!`)을 쓰고 `container-xl`, 임의 HEX 색, 인라인 색·크기 스타일, FontAwesome을 금지한다. 상세는 [디자인 시스템](design-system.md).
- 상태 배지 색은 상태 코드→색 클래스 매핑 함수를 JS에 두고 그리드 렌더러에서 적용한다. HTML에 하드코딩하지 않는다.
- 인라인 `style`은 `display:none`/`visibility` 같은 상태 토글에만 쓴다.
- 보고서·인쇄 전용 화면은 별도 규칙(순수 `<table>`, 화면 전용 `<style>` 허용)을 두는 프로젝트가 있다.
- 새로운 CSS 클래스를 만들지 않고 Tabler + Master CSS 조합으로 해결한다.

## 4. 그리드(syn_auigrid) 컬럼 튜플

```html
<syn_auigrid id="grdList" syn-datafield="DataList" syn-options="{
    height: 584, showInlineFilter: true, controlText: '목록',
    columns: [
        ['Code',  '코드',   80, false, 'text',     true,  'left',   ['LD02','MD01','DD01'], {maxlength: 10}],
        ['Name',  '이름',  150, false, 'text',     false, 'left',   'MD01', {validators: ['require','unique'], maxlength: 50}],
        ['Kind',  '분류',  100, false, 'dropdown', false, 'center', 'MD01', {dataSourceID: 'KindCodes', local: true, emptyText: '선택'}],
        ['UserNo','등록자', 100, true,  'text',     true,  'left',   'MD01'],
        ['Memo',  '설명',   -1, false, 'text',     false, 'left',   'MD01', {maxlength: 200}]
    ]
}" syn-events="['afterSelectionEnd','filtering']"></syn_auigrid>
```

| 인덱스 | 이름 | 설명 |
|---|---|---|
| 0 | dataField | 컬럼 ID(= 서버 컬럼/파라미터 이름) |
| 1 | headerText | 헤더 문구 |
| 2 | width | px. `-1`이면 남는 폭을 채움 |
| 3 | isHidden | 숨김. 키/서버 전용 값은 `true` |
| 4 | columnType | `text`/`numeric`/`date`/`time`/`checkbox`/`button`/`dropdown`/`codehelp`/`link`/`image`… 또는 객체 |
| 5 | readOnly | 편집 불가 |
| 6 | align | `left`/`center`/`right` |
| 7 | belongID | **이 열을 전송할 거래 ID(문자열/배열)**. 비우면 어떤 거래에도 전송되지 않음 |
| 8 | options | `dataSourceID`, `local`, `validators`, `maxlength`, `style`, `emptyText`, `required`, `checkValue`/`unCheckValue` 등 |

- `Flag` 컬럼은 자동으로 추가되어 숨겨진다. 행 상태는 `R`(조회됨)/`C`/`U`/`D`다.
- 튜플 10번째 값(인덱스 9)은 `children`(열 그룹 헤더용 하위 컬럼 배열)이다.
- `columns`는 **튜플(배열)** 로만 해석된다. `{header, dataField, width}` 같은 객체형 컬럼 정의는 `syn_auigrid`에서 동작하지 않는다.
- 저장 거래는 수정 불가 키(예: 수정 전 키 `BeforeXxx`)를 숨김 열로 함께 보내는 패턴을 쓴다. 키가 편집 가능한 그리드에서는 수정 전 값을 별도 열에 담아 `WHERE`에 쓴다.
- 열 정의를 `{dataField, headerText, ...}` 객체 형태로 쓰는 화면도 있다. 한 그리드 안에서 두 형식을 섞지 않고 이웃 화면의 형식을 유지한다.
- 행 추가/삭제 버튼은 JS 없이 `triggerConfig`로 만든다(아래).

```html
<button type="button" id="btnAddRow" class="btn btn-icon" syn-options="{triggerConfig: {
    triggerEvent: 'click', triggerID: 'grdList', action: 'syn.uicontrols.$auigrid.insertRow',
    params: {options: {sourceValueID: ['DataList1@Code','MainForm@hdnCreatedUserNo'],
                       targetColumnID: ['ParentCode','CreatedUserNo'], focusColumnID: 'Code'}}}}">
    <i class="f:18 ti ti-plus"></i>
</button>
```

`sourceValueID`는 `{저장소/폼 이름}@{컨트롤ID}` 형태로 새 행에 채울 값을 가져온다. 이 경우 `syn-events`는 필요 없고 `event.btnAddRow_click` 핸들러도 만들지 않는다.

## 5. 주요 컨트롤 모음

```html
<!-- 코드도움: dataSourceID는 코드도움 거래(ReturnType CodeHelp)의 식별자 -->
<syn_codepicker id="chpUser" syn-datafield="UserID" syn-options="{belongID: 'LD01', dataSourceID: 'CHP005', local: false,
    isMultiSelect: false, textBelongID: ['LD01'], textDataFieldID: 'UserName', controlText: '사용자'}"></syn_codepicker>

<!-- 날짜·기간 -->
<div class="input-group"><syn_datepicker id="dtpFrom" syn-datafield="FromDate" syn-options="{value: 'month:-1', useRangeSelect: true, rangeEndControlID: 'dtpTo', belongID: ['LD01']}"></syn_datepicker></div>
<div class="input-group"><syn_datepicker id="dtpTo" syn-datafield="ToDate" syn-options="{value: 'now', useRangeSelect: true, rangeStartControlID: 'dtpFrom', belongID: ['LD01']}"></syn_datepicker></div>

<!-- 파일: repositoryID는 저장소 계약(.rpo)의 RepositoryID -->
<syn_fileclient id="qfcAttach" syn-datafield="AttachFileID" syn-options="{repositoryID: 'MYREPO01'}"></syn_fileclient>
<syn_filedropzone id="fdzAttach" syn-datafield="Attachments" syn-options="{repositoryID: 'MYREPO01', applicationID: 'HDS', dependencyID: 'POST_0001'}" syn-events="['change']"></syn_filedropzone>

<!-- 트리, HTML 편집기, 단일 항목 저장소 -->
<syn_tree id="tvlMenu" syn-options="{checkbox:false, itemID:'key', parentItemID:'parentID', childrenID:'children',
    reduceMap:{key:'MenuID', title:'MenuName', parentID:'ParentMenuID', folder:'FolderYN', icon:false}}" syn-events="['click']"></syn_tree>
<syn_htmleditor id="edtContent" syn-datafield="Content" style="width:100%;height:320px;" syn-options="{repositoryID: 'MYREPO02'}"></syn_htmleditor>
```

- 라디오/체크박스 그룹은 `name`을 공유하고 `syn-datafield`를 모두 같은 이름으로 준다. 체크 값은 `checkValue`/`unCheckValue`.
- 코드 목록을 채우는 `select`/그리드 `dropdown`은 `dataSourceID`(코드도움 거래) + `parameters: '@GROUPCODE:값;'` 또는 `local:true`와 `config.dataSource` 로컬 목록을 쓴다.
- 서명(`syn_signaturepad`) 값은 base64 data URL 문자열, 파일 드롭존 값은 파일 항목 배열이다.
- 컨트롤별 옵션·메서드는 배포된 `uicontrols/{컨트롤}/README.md`·`API.md`(정본)와 `startup/learning/uicontrols/*` 문서(MCP `search_docs`)에서 확인한다. 존재하는 `syn_*` 태그 목록은 [디자인 시스템 6절](design-system.md#6-존재하지-않는-클래스와-알려진-함정).

## 6. 팝업 조각

두 방식이 있고 **화면마다 하나만 고른다**. 프로젝트 `DESIGN.md`가 업무 팝업 방식을 정해 두었으면 그대로 따른다.

| 방식 | 마크업 | 호출 |
|---|---|---|
| 업무 팝업(simplemodal) | 화면 안에 `<div id="tplX" class="simplemodal-data" style="display:none">…</div>` | `syn.$w.showDialog('tplX', options, callback)`; 닫기 버튼은 `syn-options="{triggerConfig:{triggerEvent:'click', method:'syn.$w.closeDialog'}}"` |
| 별도 화면 팝업(iframe) | 팝업이 될 화면은 일반 화면 HTML | `syn.$w.showUIDialog(url, options, callback)`; 팝업에서 `parent.syn.$w.closeDialog(result)` |
| 별도 창 | 일반 화면 HTML | `syn.$w.windowOpen(windowID, options)` + `syn.$n.emit/call` 메시지 |
| 보조 대화상자(Bootstrap modal) | `modal`, `modal-dialog` | `data-bs-toggle="modal"` — 한 화면 안에서 끝나는 확인·JSON 보기용. 업무 팝업 대신 쓰지 않는 프로젝트가 많다 |

공통: 팝업 위에 팝업을 겹치지 않고, 등록·수정 폼 본체를 오버레이로 옮기지 않으며, 닫기 버튼에 `aria-label`을 둔다. 팝업 조각 제목 `h3/h4`는 드래그 손잡이로 동작하고 최소 크기는 `syn.$w.dialogOptions`의 `minWidth`/`minHeight`다.

## 7. 자주 하는 실수

- `syn-events`에 이벤트를 선언하지 않고 `event.xxx_click`만 만든다.
- 전송해야 하는 컨트롤의 `belongID`에 새 거래 ID를 추가하지 않는다(요청 값이 빈 문자열로 간다).
- 같은 `id`/`syn-datafield`를 폼 안에 두 번 둔다(컨트롤 조회가 첫 요소만 잡음).
- 서버 전용 값(키, 수정 전 키, 등록자)을 그리드에서 `isHidden`이 아닌 편집 가능 열로 노출한다.
- `syn-options`의 따옴표·쉼표·중괄호 균형을 깨뜨린다(초기 렌더링 오류).
- 신규 화면에서 외부 CDN이나 새 CSS 클래스를 임의로 추가한다.
