---
marp: true
theme: gaia
_class: lead
footer: QCN
paginate: true
backgroundColor: #fff
---

<style>
:root {
  font-family: Pretendard;
  --border-color: #303030;
  --text-color: #0a0a0a;
  --bg-color-alt: #dadada;
  --mark-background: #ffef92;
}

h1 {
  border-bottom: none;
  font-size: 1.6em;
}

h2 {
  border-bottom: none;
  font-size: 1.3em;
}

h3 {
  font-size: 1.1em;
}

h4 {
  font-size: 1.05em;
}

h5 {
  font-size: 1em;
}

h6 {
  font-size: 0.9em;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  color: var(--text-color);
}

code:not([class*="language-"]) {
  font-family: D2Coding;
  color: #000;
  vertical-align: text-bottom;
  background-color: rgba(100, 100, 100, 0.2);
}

section {
  background-image: linear-gradient(to bottom right, #f7f7f7 0%, #d3d3d3 100%);
}

section table {
    margin: auto;
    font-size: 28px;
}

section::after {
  font-size: 0.75em;
  content: attr(data-marpit-pagination) " / " attr(data-marpit-pagination-total);
}

img[alt~="center"] {
  display: block;
  margin: 0 auto;
}

blockquote {
  font-size: 26px;
  border-left: 8px solid var(--border-color);
  background: var(--bg-color-alt);
  margin: 0.5em;
  padding: 0.5em;
}

blockquote::before,
blockquote::after {
    content: '';
}

mark {
  background-color: var(--mark-background);
  padding: 0 2px 2px;
  border-radius: 4px;
  margin: 0 2px;
}

section.tinytext>p,
section.tinytext>ul,
section.tinytext>blockquote {
  font-size: 0.65em;
}
</style>

# 화면의 공통 UI/UX 제공을 위한 공통 컨트롤

상용 제품 및 오픈소스 기반 UI 라이브러리 살펴보기

---

## 일관된 사용자 경험의 중요성

- HandStack은 `syn.js` 와 `uicontrol` 라이브러리를 통해 일관되고 편리한 UI/UX를 제공합니다.
- 이 라이브러리들은 화면의 공통 로직을 처리하고, 개발자가 비즈니스 로직에 집중할 수 있도록 돕습니다.

> 큰 힘에는 큰 책임이 따릅니다.
> 화면의 동작과 업무 구현을 위한 공통 라이브러리를 이해하고 커스터마이징하여 프로젝트의 완성도를 높여보세요.

---

## 기본 공통 컨트롤 (1/3)

| 약어 | 컴포넌트명 | 설명 |
| :--- | :--- | :--- |
| `$checkbox` | CheckBox | 브라우저마다 다른 체크박스를 일관되게 표현합니다. |
| `$codepicker` | CodePicker | 코드도움 팝업 기능을 제공합니다. |
| `$colorpicker`| ColorPicker | 색상 팔레트를 제공합니다. |
| `$contextmenu`| ContextMenu | 오른쪽 마우스 버튼 컨텍스트 메뉴를 제공합니다. |
| `$data` | DataSource | 단일/여러 건의 데이터 소스 객체 기능을 제공합니다. |
| `$datepicker` | DatePicker | 날짜 선택 기능을 제공합니다. |
| `$dateperiodpicker` | DatePeriodPicker | 시작 및 종료 기간 날짜 선택 기능을 제공합니다. |
| `$select` | DropDownList | 단일 항목 선택 콤보박스를 제공합니다. |

---

## 기본 공통 컨트롤 (2/3)

| 약어 | 컴포넌트명 | 설명 |
| :--- | :--- | :--- |
| `$multiselect`| DropDownCheckList | 여러 항목 선택 콤보박스를 제공합니다. |
| `$element` | Element | HTML 항목의 `getValue`, `setValue` 기능을 제공합니다. |
| `$fileclient`| FileClient | 파일 업로드/다운로드 기능을 제공합니다. |
| `$list` | GridList | 데이터 조회에 특화된 기능을 제공합니다. |
| `$guide` | Guide | 화면 내 표시되는 도움말 기능을 제공합니다. |
| `$htmleditor`| HtmlEditor | 파일 업로드/다운로드 통합 HTML 편집기를 제공합니다. |
| `$organization`| OrganizationView | 조직도 데이터를 직관적으로 편집하는 기능을 제공합니다. |
| `$radio` | RadioButton | 브라우저마다 다른 라디오버튼을 일관되게 표현합니다. |
| `$sourceeditor`| SourceEditor | 소스 편집에 특화된 에디터 기능을 제공합니다. |

---

## 기본 공통 컨트롤 (3/3)

| 약어 | 컴포넌트명 | 설명 |
| :--- | :--- | :--- |
| `$textarea` | TextArea | 여러 텍스트 줄 관리 기능을 제공합니다. |
| `$textbox` | TextBox | 단일 텍스트 관리 기능을 제공합니다. |
| `$button` | Button | 버튼 관리 추가 기능을 제공합니다. |
| `$tree` | TreeView | 트리 구조를 표현하는 기능을 제공합니다. |
| `$grid` | WebGrid | 대량 편집 그리드 기능을 제공합니다. (Handsontable 라이선스) |
| `$auigrid` | AUIGrid | 대량 편집 그리드 기능을 제공합니다. (AUISoft 라이선스) |

> 그리드는 상용 라이선수 구매 필수

---

## 소스 위치와 번들링

- HandStack의 UI 컨트롤 라이브러리는 직접 수정하고 확장할 수 있습니다.

- 소스 코드 위치
  - `$(HANDSTACK_SRC)/2.Modules/wwwroot/wwwroot/uicontrols`

- 번들링
  - 개별 Javascript 파일로 구성된 컨트롤들은 빌드 시 `syn.controls.js` 파일 하나로 통합(Bundle)되어 서비스 성능을 최적화합니다.

---

## 핸즈온: UI 컨트롤 사용 현황 분석

- 프로젝트에서 어떤 UI 컨트롤이 얼마나 사용되고 있는지 CLI 명령으로 분석할 수 있습니다.

- `uicontrols` 사용 현황 분석 명령어
  ```bash
  synusage --directory="%HANDSTACK_HOME%\modules\wwwroot\wwwroot\view" --value=uicontrols > result.csv
  ```

- 참고 자료 및 실습 페이지
  - `syn.js` 소개: [https://handstack.kr/docs/startup/learning/syn/syn.js-소개](https://handstack.kr/docs/startup/learning/syn/syn.js-소개)
  - 로컬 `syn` 샘플: [http://localhost:8421/sample/syn](http://localhost:8421/sample/syn)
  - 로컬 `uicontrol` 샘플: [http://localhost:8421/sample/uicontrol](http://localhost:8421/sample/uicontrol)

---

## Q & A
