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
  padding: 1rem;
  border-bottom: 1px solid #000;
  background-image: linear-gradient(to bottom right, #f7f7f7 0%, #d3d3d3 100%);
}

section > h2 {
  border-bottom: 4px solid #17344f;
}

section table {
    margin: auto;
    margin-top: 1rem;
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

/* Long examples are paginated; keep reference text readable. */
section.reference-page { justify-content: flex-start; }
section.reference-page pre,
section.reference-page marp-pre,
section.reference-page pre code,
section.reference-page marp-pre code { font-size: 24px; line-height: 1.25; }
section.reference-page table { font-size: 25px; }
</style>

# Tabler, Master CSS, Mustache 로 만드는 화면 레이아웃

Tabler·Master CSS·Mustache의 역할을 나눠 데이터가 표시되는 레이아웃을 만듭니다.


<!--
발표: 첫 화면의 목표를 말한 뒤 핵심 개념과 예제로 진행합니다. 확인 질문 뒤에는 답할 시간을 주고, 마지막 완료 기준을 남겨 질문을 받습니다.
발표 구성 참고: MIT OpenCourseWare, Patrick Winston, How to Speak (2018), https://ocw.mit.edu/courses/res-tll-005-how-to-speak-january-iap-2018/pages/how-to-speak/
-->

---

## 디자인 시스템이란 무엇일까요?

> 디자인 시스템은 화면의 원칙·규격과 재사용 컴포넌트를 함께 관리하는 체계입니다.

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

## 세 도구의 연결 순서

1. `Tabler`로 카드·폼 등 화면 구조를 고릅니다.
2. `Master CSS`로 간격·색상·반응형 스타일을 조정합니다.
3. `Mustache`로 템플릿에 데이터를 넣습니다.

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

## 디자인 시스템 기반 환경 (1/2)

<!-- _class: reference-page -->



HandStack은 다음과 같은 검증된 도구들을 기반으로 디자인 시스템을 구축합니다.

- **Bootstrap 5**
  - 가장 인기 있는 CSS 프레임워크로, 반응형 디자인의 기초를 제공합니다.

- **Tabler**
  - Bootstrap 기반의 현대적이고 깔끔한 UI 컴포넌트 라이브러리입니다.

---

## 디자인 시스템 기반 환경 (2/2)

<!-- _class: reference-page -->



- **Tabler Icons**
  - UI 디자인을 풍부하게 만드는 다양한 아이콘을 제공합니다.

- **Master CSS (Master UI)**
  - 유틸리티 클래스를 통해 직관적이고 빠른 스타일링을 지원합니다.

---

## Bootstrap, Tabler 샘플 및 예제 참고하기 (1/2)

<!-- _class: reference-page -->



HandStack은 Bootstrap 기반의 Tabler 테마를 기본 CSS 프레임워크로 사용합니다.
아래 사이트들에서 다양한 컴포넌트와 레이아웃 예제를 확인해 보세요.

---

## Bootstrap, Tabler 샘플 및 예제 참고하기 (2/2)

<!-- _class: reference-page -->



- **디자인 컴포넌트 예제**
  - [Bootstrap 5 Examples](https://getbootstrap.com/docs/5.3/examples/)
  - [Tabler Preview](https://preview.tabler.io/)
  - [Tabler Form Elements](https://preview.tabler.io/form-elements.html)
  - [Tabler Documents](https://docs.tabler.io/ui/layout)
  - [Tabler Icons](https://tabler.io/icons)

---

## 유용한 Bootstrap 코드 조각(Snippet) 사이트

다양한 UI 요소를 미리 만들어 놓은 코드를 참고하여 개발 시간을 단축할 수 있습니다.

- [Bootsnipp](https://bootsnipp.com/)
- [Bootdey](https://www.bootdey.com/bootstrap-snippets)
- [Bootstrapious](https://bootstrapious.com/snippets)
- [shuffle.dev](https://shuffle.dev/components/bootstrap)

---

## Master CSS 샘플 및 예제 참고하기

Master CSS 는 TailwindCSS 와 같이 유틸리티 클래스 처럼 동작하지만 가상 CSS 엔진을 도입하여 미리 정의한 수많은 클래스를 학습할 필요 없이 자동으로 생성하도록 설계 되었습니다.

> 예를 들어, font:14, pt:16, w:36@md 와 같이 속성명과 값 사이에 콜론(:)을 사용하고, 유닛 변환이 더 지능적으로 이루어집니다.

- [Getting started with Master CSS](https://css.master.co/docs)

---

## 잠깐, 구분해 보기

카드 모양은 맞는데 제목이 비어 있다면 무엇을 확인할까요?

<!--
질문 후 잠시 기다립니다. 답이 없으면 앞에서 본 예제를 다시 가리킵니다.
확인할 답: 스타일보다 Mustache의 데이터 키와 템플릿 표현식을 먼저 대조합니다.
다음 주제로 넘어가기 전에 차이를 청중의 표현으로 한 번 확인합니다.
-->

---

## mustache.js 템플릿 엔진 샘플 및 예제 참고하기 (1/2)

<!-- _class: reference-page -->



Mustache는 로직이 없는(logic-less) 템플릿 엔진으로, JavaScript를 포함한 다양한 언어로 구현되어 있습니다. JavaScript 버전의 Mustache는 일반적으로 "Mustache.js"로 불립니다.

---

## mustache.js 템플릿 엔진 샘플 및 예제 참고하기 (2/2)

<!-- _class: reference-page -->



```js
var template = "Hello, {{name}}! You have {{calc}} new messages.";
var data = {
    name: "Alice",
    messages: ["msg1", "msg2", "msg3"],
    calc: function() {
        return this.messages.length;
    }
};

var rendered = Mustache.render(template, data);
document.getElementById('output').innerHTML = rendered;
```

- [Mustache.js 사용법](https://github.com/janl/mustache.js)

---

# 실습 시간
## Tabler, Master CSS, Mustache로 화면 레이아웃 만들기

Tabler 카드에 Master CSS로 간격을 적용하고, Mustache로 제목·목록을 표시합니다. 데이터가 0건일 때와 여러 건일 때를 비교합니다.

---

## 레이아웃 실습의 완료 기준

- Tabler는 구조, Master CSS는 스타일, Mustache는 템플릿 데이터에 사용합니다.
- 빈 데이터와 여러 건의 데이터로 결과를 비교합니다.
- 외부 예제는 적용 버전과 라이선스를 확인해 가져옵니다.

<!--
질문을 받는 동안 이 확인 기준을 화면에 남깁니다. 청중이 자신의 업무에 적용할 다음 행동 하나를 고르게 합니다.
-->
