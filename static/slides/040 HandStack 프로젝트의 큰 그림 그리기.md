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

# HandStack 프로젝트 큰 그림 그리기

## 주요 디렉토리 구조

---

## 학습 목표

> HandStack 프로젝트의 주요 디렉토리 역할을 이해하고, 전체적인 구조를 파악합니다.

---

## 잘 정리된 사무실 같은 HandStack

HandStack 프로젝트는 마치 잘 정리된 사무실과 같습니다. 각 공간이 명확한 역할을 가지고 있어 전체 구조를 이해하기 쉽습니다.

- `1.WebHost`       - 회사 정문, 안내 데스크
- `2.Modules`       - 각 업무를 담당하는 부서들
- `3.Infrastructure`  - 모든 부서가 사용하는 공용 시설
- `4.Tool`            - 업무에 필요한 각종 도구함
- `Solution Items`  - 전사 공통 규정집

---

## `1.WebHost`: 프로젝트의 시작점

- 서버 실행의 진입점(Entry Point) 역할을 하는 웹 호스트 프로젝트입니다.
- 웹 애플리케이션의 환경 설정, 시작, 실행을 모두 이곳에서 담당합니다.
- 비유하자면, 건물의 정문이자 모든 방문객을 맞는 안내 데스크와 같습니다.

---

## `2.Modules`: 핵심 비즈니스 로직

- 도메인 기반의 실제 업무 기능(모듈)들이 모여있는 곳입니다.
- 각 모듈은 독립적으로 `Application`, `Domain`, `Persistence`, `API` 계층을 가질 수 있습니다.
- 예시: 게시판 관리, 사용자 관리, 주문 처리 등
- 비유하자면, 회계팀, 인사팀, 개발팀처럼 각자의 역할을 가진 ‘업무 부서’에 해당합니다.

---

## `3.Infrastructure`: 공통 기반 시설

- 공통 인프라스트럭처 레이어입니다.
- 데이터베이스 연결, 로깅, 인증 처리처럼 여러 모듈이 공유하는 시스템 자원이나 구현체를 제공합니다.
- 비유하자면, 모든 부서가 함께 사용하는 ‘회의실’이나 ‘서버실’과 같은 공용 시설입니다.

---

## `4.Tool`: 개발 보조 도구

- 프로젝트 개발 및 유지보수를 위한 보조 도구와 유틸리티를 모아놓은 곳입니다.
- CLI 도구, 데이터베이스 마이그레이션 스크립트 등이 포함될 수 있습니다.
- 비유하자면, 업무 효율을 높여주는 ‘사무용품’ 또는 ‘공구함’과 같습니다.

---

## `Solution Items`: 솔루션 공용 파일

- Visual Studio 솔루션 레벨에서 사용하는 공용 파일들을 모아놓은 논리적 디렉토리입니다.
- `.gitignore`나 `Directory.Build.props` 같이 솔루션 전체에 적용되는 파일들이 위치합니다.
- 비유하자면, 모든 부서원이 반드시 참고해야 하는 ‘회사 공통 규정집’입니다.

---

## 직접 확인해보기 (Hands-on)

이제 Visual Studio에서 프로젝트를 직접 열어 구조를 살펴봅시다.

1. Visual Studio 2022 Community를 실행합니다.
2. `$(HANDSTACK_SRC)/handstack.sln` 파일을 엽니다.
3. 솔루션 탐색기에서 오늘 배운 디렉토리들을 찾아보세요.
4. 각 디렉토리의 역할과 설명을 마음속으로 매칭시켜 봅니다.

---

## 디렉토리 역할 정리하기

| 디렉토리           | 역할 (비유)                       |
| ------------------ | --------------------------------- |
| `1.WebHost`        | 프로젝트 시작점 (안내 데스크)     |
| `2.Modules`        | 핵심 업무 기능 (업무 부서)        |
| `3.Infrastructure` | 공통 기반 시설 (공용 시설)        |
| `4.Tool`           | 개발 보조 도구 (공구함)           |
| `Solution Items`   | 솔루션 공용 파일 (회사 규정집)    |


---

## 다시 보는 `모듈` 라이브러리

- HandStack의 백엔드는 <mark>모듈러 모놀리식 아키텍처</mark>를 기반으로 합니다.
- 각 `모듈`은 독립적으로 개발하고 배포할 수 있는 작은 애플리케이션과 같습니다.
- 이 모듈들이 모여 하나의 큰 애플리케이션(ack 서버)을 구성합니다.
- 오늘은 이 `모듈`의 서버 측 구성 요소들을 자세히 살펴보겠습니다.

---

## 아키텍처 간단 비교

| 아키텍처 | 장점 | 단점 |
| :--- | :--- | :--- |
| 모놀리식 | 개발 초기 단순함 | 유연성 부족, 배포 어려움 |
| 마이크로서비스 | 높은 유연성, 확장성 | 복잡성 증가, 관리 비용 |
| <mark>모듈러 모놀리식</mark> | 균형 잡힌 접근 | 초기 설계 중요성 증가 |

- HandStack은 모놀리식의 단순함과 마이크로서비스의 장점을 결합한 <mark>모듈러 모놀리식</mark>을 채택하여 개발 생산성과 유지보수성을 높였습니다.
