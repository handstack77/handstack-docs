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
</style>

# HandStack 을 소개합니다

### 개발자의 워크플로우를 높이는 통합 플랫폼

<style scoped>
  img { width: 120px; display: inline; }
</style>

![](img/qcn-logo.png)
큐씨엔

---

## 비전

- HandStack === 클라우드 네이티브 앱 개발 및 관리 SDK (Vertical)
- Qrame === HandStack 으로 개발된 SaaS 서비스 플랫폼 (Horizontal)

> 고객은 MVP (Minimum Viable Product)를 싫어합니다. 대신 CVT (Clarity, Value, Trust)를 만들어 보세요.

---

## 누가 HandStack를 관심 가져야 하나요?

S/W 를 통한 고객의 문제 해결 역량이 모든 기업에게 선택이 아닌 필수인 시대, S/W 경쟁력을 갖춘 기업이 시장을 주도

- 전문 개발자를 위한 앱 개발 플랫폼
- 체계적인 인하우스 개발 업무 시스템 도입
- 자사 레거시 제품을 클라우드 또는 SaaS 로 전환

---

## IT 는 업무 외에도 알아야 할게 너무 많습니다

- 시스템에 대한 분석·설계 방법론
- 개발 도구 및 솔루션 라이선스
- 프로그램의 형상·배포 관리
- 시스템 운영 관리
- 데스크톱 응용 프로그램 > 웹 응용 프로그램 > 클라우드 네이티브 앱

> 이 모든 것들이 부채이고 비용입니다.

---

## 문제

- 업무 담당자들의 개발 업무외에 어려운 IT 접근성 (EA, SA, TA, AA, DA, SM, 개발, 디자인)
- IT 기술의 발전으로 패키지 제품보다 클라우드와 서비스형 소프트웨어(SaaS)가 친숙한 것이 되었고 이에 따라 개발과 운영의 경계는 희미
- 지금의 운영 문제는 전통적인 운영 부서가 해결할 수 있는 수준이 아님 개발자가 업무와 운영의 문제를 이해하고 이에 준비된 소프트웨어를 만들 어야 함

---

## 알려진 대안 및 해결 방안

- 프로그래밍에 익숙지 않은 사람들도 솔루션의 템플릿을 결합해 스스로 필요한 서비스나 기능을 로우코드/노코드 개발 서비스
- 전문 개발자 입장에서 더 적은 비용으로 더 빠르게 앱을 개발하고 운영 할 수 있는 방법

---

## 외부 의존도는 결국 기술 부채를 낳습니다

> 기능에 집중해 만들 수 있고, 일정한 패턴과 품질로 구성되며, 개발자라면 쉽게 코드를 파악 가능하여 유지보수에 이점으로 적용할 수 있나요?

- 다음 프로젝트에 써 먹을 수 있나요?
- 일이 점점 많아져요
- 한 두명이서 하기엔 점점 외로워요

---

## 내부 도메인 개발자를 먼저 키워야 합니다.

- 개인 또는 여러 팀원에 따라 적용 가능한 업계 표준 개발/업무 지식
- 적은 학습 비용으로 적용 가능한 업무 시스템 기술 인프라
- 도구에 의존하지 않는 어플리케이션 개발
- 확장을 위한 다양한 상용/공개 SW 활용 가능
- 공개 SW 기반 비 독점적 비용 구조

---

## 오픈소스와 상용 라이선스

- HandStack 은 상업적 사용 제한이 없는 MIT 라이선스를 제공합니다.
- 수많은 오픈소스를 프로젝트에 적용할 수 있습니다.
- 그리드, 차트와 같으 고급 기능을 필요로 하는 컴포넌트는 상용 라이선스를 구매해 적용이 가능합니다.

---

## HandStack 핵심 가치

- 간단함 - 화면, 쿼리, 함수
- 저비용 - 자유로운 IT 인프라 (onpremise, selfhost, cloud)
- 확장성 - tenant, forbes, modules

---

## 중요한 건 당신의 비즈니스와 SW 그리고 개발자 입니다

셀프호스트(클라우드, 온프레미스)로 기업의 요구사항에 맞춰 구축되는 개발 도구을 확인하세요.
- HandStack GitHub 주소: https://github.com/handstack77/handstack
- HandStack 공식 문서: https://handstack.kr/docs/startup/개요
- HandStack 개발자 시작 가이드: https://www.youtube.com/@handstack-kr
- HandStack 그룹웨어 데모: https://qrame.kr/qramework/login.html (tester@qcn.co.kr / tester1234)
