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
---

# Tabler, Master CSS, Mustache 로 만드는 화면 레이아웃

---

## 먼저, 디자인 시스템이란 무엇일까요?

> 디자인 시스템은 UI(사용자 인터페이스) 및 UX(사용자 경험) 디자인 원칙과 규격을 정의하고, 재사용 가능한 UI 컴포넌트를 제공하여 다양한 제품(PC, 모바일 등)에 일관성 있게 대응할 수 있도록 하는 체계입니다.

- **주요 요소**
  - UI, UX 디자인 원칙 및 규격 정의
  - 재사용 가능한 UI 컴포넌트 (버튼, 입력 필드, 모달 등)
  - 다양한 제품(PC, 모바일 등)에 일관된 디자인 제공

---

## 왜 디자인 시스템을 사용할까요?

- **효율성 확보**
  - 디자인과 개발 과정에서 반복 작업을 줄여 생산성을 높입니다.
  - 미리 만들어진 컴포넌트를 조립하여 빠르게 화면을 구성할 수 있습니다.

- **일관성 있는 경험 제공**
  - 모든 제품과 페이지에서 통일된 사용자 경험을 제공하여 브랜드 신뢰도를 높입니다.
  - 사용자가 새로운 화면에서도 직관적으로 사용법을 익힐 수 있습니다.

---

## 화면 레이아웃을 위한 삼총사

세 가지 도구를 조합하여 빠르고 유연한 화면 개발을 할 수 있습니다.

- `Tabler` : 뼈대를 만드는 건축가
- `Master CSS` : 스타일을 입히는 디자이너
- `Mustache` : 데이터를 채우는 이야기꾼

---

## 도구별 역할 알아보기

| 도구 | 주요 역할 | 레이아웃에 대한 주요 기여 | 통합 지점 |
|---|---|---|---|
| **Tabler** | UI 구조 및 구성 요소 | 사전 구축된 레이아웃, 반응형 컴포넌트 | HTML 마크업 |
| **Master CSS** | 스타일링 및 반응성 | 유틸리티 클래스, 반응형 디자인 | HTML class 속성 |
| **Mustache** | 동적 콘텐츠 주입 | 데이터 바인딩, 조건/반복 렌더링 | HTML 템플릿 (`{{}}`) |

---

### 예시 구문으로 이해하기

| 도구 | 예시 구문 (개념적) | 설명 |
|---|---|---|
| **Tabler** | ` <div class="card">...</div> ` | 미리 디자인된 '카드' 컴포넌트를 사용합니다. |
| **Master CSS**| ` <div class="p:4 bg:blue-100">...</div> ` | 패딩(p:4)과 배경색(bg:blue-100)을 클래스로 바로 적용합니다. |
| **Mustache**| ` <h1>{{title}}</h1> ` | `title` 이라는 데이터로 제목을 동적으로 채웁니다. |

---

## 디자인 시스템 기반 환경

HandStack은 다음과 같은 검증된 도구들을 기반으로 디자인 시스템을 구축합니다.

- **Bootstrap 5**
  - 가장 인기 있는 CSS 프레임워크로, 반응형 디자인의 기초를 제공합니다.

- **Tabler**
  - Bootstrap 기반의 현대적이고 깔끔한 UI 컴포넌트 라이브러리입니다.

- **Tabler Icons**
  - UI 디자인을 풍부하게 만드는 다양한 아이콘을 제공합니다.

- **Master CSS (Master UI)**
  - 유틸리티 클래스를 통해 직관적이고 빠른 스타일링을 지원합니다.

---

## 샘플 및 예제 참고하기

HandStack은 Bootstrap 기반의 Tabler 테마를 기본 CSS 프레임워크로 사용합니다.
아래 사이트들에서 다양한 컴포넌트와 레이아웃 예제를 확인해 보세요.

- **디자인 컴포넌트 예제**
  - [Bootstrap 5 Examples](https://getbootstrap.com/docs/5.3/examples/)
  - [Bootstrap Components](https://getbootstrap.com/docs/5.3/components/)
  - [Tabler Preview](https://preview.tabler.io/)
  - [Tabler Form Elements](https://preview.tabler.io/form-elements.html)

---

## 유용한 Bootstrap 코드 조각(Snippet) 사이트

다양한 UI 요소를 미리 만들어 놓은 코드를 참고하여 개발 시간을 단축할 수 있습니다.

- [Bootsnipp](https://bootsnipp.com/)
- [Bootdey](https://www.bootdey.com/bootstrap-snippets)
- [Bootstrapious](https://bootstrapious.com/snippets)
- [Tutorial Republic](https://www.tutorialrepublic.com/snippets/gallery.php)

---



# 실습 시간
## Tabler, Master CSS, Mustache로 화면 레이아웃 만들기

이제 직접 코드를 작성하며 세 가지 도구를 통합하는 방법을 체험해 보겠습니다.