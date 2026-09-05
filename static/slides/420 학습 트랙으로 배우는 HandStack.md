---
marp: true
theme: gaia
_class: lead
footer: HandStack
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
    font-size: 26px;
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

# 학습 트랙으로 배우는 HandStack

### 12개 주제로 배우는 게시판 프로젝트

---

## 학습 트랙이란

- `/docs/tutorial`에 있는 신규 자습 코스입니다.
- "이 기능이 무엇을 하는가"를 정리한 참고 문서와 달리, **왜 필요한지 알고 직접 만들어 보는** 순서로 구성했습니다.
- 하나의 게시판 프로젝트(`BOD` 모듈)를 03~08주제에 걸쳐 계속 키워 나갑니다.

---

## 12개 주제 지도 (1/2)

1. HandStack 기초 개념
2. 프로젝트 구조와 파일 작업
3. 프로젝트와 개발 서버
4. 도메인 모델과 데이터베이스
5. 화면 저작 (HTML/JS 작성)
6. 화면 동작과 거래 연결

---

## 12개 주제 지도 (2/2)

7. dbclient SQL 계약
8. transact 거래 계약
9. 확장 모듈 (function·command·repository)
10. 테스트와 디버깅
11. 환경설정과 보안
12. 모니터링과 운영 인수인계

---

## 게시판 예제가 자라나는 순서

| 화면·계약 | 처음 만드는 주제 |
|---|---|
| `BOD` 모듈, 개발 서버 | 03 |
| `Board` 테이블 | 04 |
| `BOD010`, `BOD011`, `BOD012` 화면 | 05 · 06 |
| SQL 계약(`.xml`) | 07 |
| 거래 계약(`.json`) | 08 |

> 05·06주제에서 화면을 준비해도, 조회·저장의 전체 성공은 07·08주제의 계약을 완성한 뒤 확인합니다.

---

## 역할별 추천 경로

| 나는 | 이 순서로 |
|---|---|
| 화면·거래를 만드는 신규 개발자 | 01 → 02 → ... → 12 (전체) |
| 화면/기능 개발자로 빠르게 투입 | 01 → 03 → 05 → 06 → 07 → 08 |
| 시스템 운영·인수인계 담당자 | 01 → 02 → 03 → 11 → 12 → 10 |

---

## 지금 시작하기

- 학습 트랙: `/docs/tutorial`
- 전체 코드를 한 번에 보고 싶다면: [게시판 프로젝트 시작하기](/docs/startup/handsonlab/게시판-프로젝트-시작하기)
- 개념 정의가 필요하면: [계약 중심 거래](/docs/reference/concept/계약-중심-거래) 등 개념 문서

<br>

> 진도는 각 주제 문서 하단의 완료 조건 체크리스트로 스스로 확인하십시오.
