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

# HandStack이란 무엇일까요?

### 개발자의 워크플로우를 높이는 통합 플랫폼

---

## 왜 HandStack을 써야 할까요?

- 초급 개발자를 위한 풀스택 프레임워크 입문
- 중소 기업을 위한 비즈니스 앱 개발 플랫폼
- AI 협업 친화적인 개발 환경

---

## HandStack 소개

- HandStack은 <mark>풀스택(Full-Stack) 개발 프레임워크</mark>입니다.
- 표준 기술로 <mark>프론트엔드</mark>(사용자 화면)와 <mark>백엔드</mark>(서버 로직)를 모두 만들 수 있습니다.

- 주요 기술
    - 백엔드: ASP.NET Core, Node.js
    - 데이터베이스: SQL Server, Oracle, PostgreSQL, MySQL/MariaDB, SQLite 기반 제품 및 서비스
    - 라이선스: 오픈소스 (MIT License)

- 누구나 자유롭게 사용하고 기여할 수 있습니다.

---

## 왜 개발은 복잡하게 느껴질까요?

- 배워야 할 것이 너무 많아요 (프론트엔드, 백엔드, 데이터베이스...)
- 개발 환경 설정부터 막막해요.
- 프로젝트 구조를 어떻게 잡아야 할지 어려워요.
- 반복적인 코드를 계속 작성해야 해요.
- 유지보수와 인수인계가 쉬웠으면 좋겠어요.

> HandStack은 개발자와 운영자의 실무적인 어려움을 해결하기 위해 만들어졌습니다.

---

## 장점 1. 빠른 시작

- HandStack은 <mark>CLI (명령줄 도구)</mark>를 제공하여 복잡한 초기 설정을 자동화합니다.
- 터미널에 명령어 몇 줄만 입력하면 프로젝트가 바로 생성됩니다.
- 프로젝트 생성, 모듈 관리, 빌드, 배포까지 CLI로 간편하게 해결할 수 있습니다.


```bash
# Windows 에서 초기 설정 실행
cd C:/projects
curl -L -o handstack-win-x64.zip https://github.com/handstack77/handstack/releases/latest/download/win-x64.zip
powershell Expand-Archive -Path handstack-win-x64.zip -DestinationPath .
cd handstack
install.bat
```

> https://handstack.kr/docs/startup/빠른-시작

---

## 장점 2. 놀라운 생산성

- <mark>반복적인 작업을 자동화</mark>하여 개발자가 핵심 로직에만 집중하게 합니다.
- 적은 코드로 더 많은 기능을 구현할 수 있습니다.

- 대표적인 예: <mark>단일 엔드포인트 API</mark>
    - 복잡한 API 코드를 직접 작성할 필요 없이, SQL 쿼리와 백엔드의 실행 코드를 연계하는 데이터 조회/수정 API가 만들어집니다.
    - 백엔드에서 실행 되는 데이터베이스와 API 결과를 화면에 매우 쉽게 연결할 수 있습니다.

---

## 장점 3. 초급자 친화적인 구조

- 프론트엔드와 백엔드가 하나의 프로젝트 안에서 유기적으로 연결됩니다.
    - 기술들이 분리되어 있을 때보다 전체 흐름을 이해하기 쉽습니다.
- <mark>모듈러 모놀리식 아키텍처</mark>를 기반으로 합니다.
    - 프로젝트가 커져도 길을 잃지 않도록, 기능별로 코드를 깔끔하게 정리할 수 있는 구조를 제공합니다.

> 마치 잘 정리된 서랍장처럼 필요한 코드를 쉽게 찾고 관리할 수 있습니다.
> checkup 모듈의 항목 ID HAC010, HDM010 를 필터로 검색 해보세요.

---

## 장점 4. 실전 활용성

- HandStack은 학습용으로도 좋은 도구이며, 다양한 업무 시나리오에 대응하기 위한 기업(Enterprise) 환경에서 필요한 기능들을 갖추고 있습니다.
    - 사용자 인증 및 권한 관리
    - 안정적인 데이터 처리 (트랜잭션)
    - 상세한 로그 기록
    - 외부 서비스 연동 (Open API)

- HandStack으로 배운 기술은 개인/중소/대기업에 상관없이 실무에 바로 적용할 수 있습니다.

---

## 고려해야 할 단점

- <mark>HandStack 고유의 학습 곡선</mark>
  - CLI 문법, 모듈 구조 등 HandStack만의 방식에 익숙해지는 시간이 필요합니다.
  - 자동화된 기능의 내부 동작 원리를 이해하기 전까지는 디버깅이 어려울 수 있습니다.

- <mark>자유도와 제약</mark>
  - 일정 규모 이상의 시스템이 필요한 정해진 구조와 방식을 따를 때 가장 큰 생산성을 발휘하지만, 숙련된 개발자에게는 다소 제약으로 느껴질 수 있습니다.

---

## HandStack, 한마디로?

- HandStack은 마치 <mark>조립식 블록</mark> 같아요.
- 이미 만들어진 편리한 블록(기능)들을 가져와 <mark>백엔드와 프론트엔드를 한 번에 뚝딱</mark> 만들 수 있게 도와주는 멋진 도구입니다!

---

## 1일차 학습 과정

<style scoped>
  li { font-size: 0.8rem; }
</style>

- 내 컴퓨터에 개발 환경 꾸미기
- HandStack으로 첫 프로젝트 실행하기
- HandStack 프로젝트의 큰 그림 그리기
- 업무 모듈 디렉토리 깊게 파헤치기
- HandStack 라우팅의 마법
- 클라이언트 디렉토리와 화면 구조 이해하기
- 나만의 첫 화면 만들기 (클라이언트 사이드)
- 화면의 동작과 업무 구현을 위한 공통 라이브러리
- 화면의 공통 UI UX 제공을 위한 공통 컨트롤
- repository 모듈을 이용한 파일 업로드, 다운로드

---

## 2일차 학습 과정

<style scoped>
  li { font-size: 0.8rem; }
</style>

- 기초코드와 코드도움을 이용한 화면 데이터 관리
- 클라이언트와 서버 데이터 연동 테스트
- 데이터 거래란 무엇인가요
- HandStack이 만들어준 API 사용하기
- 데이터베이스 쿼리 계약 관리하기
- 데이터베이스 설정 (SQL Server 연결로 가볍게 시작)
- SQL 처리를 위한 다양한 확장 기능
- HTTP 클라이언트로 거래 데이터 및 SQL 테스트 하기
- Tabler, Master CSS, Mustache 로 만드는 화면 레이아웃
- UI 화면과 거래 로그로 디버깅하기
- tasks 작업 스크립트로 반복 작업 관리하기

---

## 우리가 함께 만들 첫 프로젝트

- 간단한 "나만의 게시판" 만들기
- HandStack을 이용해 다음 기능들을 구현해 볼 거예요.
    - 데이터베이스 스키마 관리
    - AI 를 이용한 CRUD 쿼리 작성
    - 게시판 글 목록 보기
    - 새로운 글 작성하기
    - 글 내용 보기

- 이 과정을 통해 HandStack의 강력하고 편리한 기능들을 자연스럽게 익히게 될 것입니다.

---

## 오픈소스 생태계는 함께할 때 더 가치가 있습니다

- HandStack은 기술을 넘어, 개발자 중심의 오픈소스 생태계를 함께 만들어가는 것을 지향합니다.
- 실제 운영 중인 사례를 중심으로 기능과 안정성을 계속 발전시키고 있습니다.
- HandStack에 대한 모든 소스와 문서는 GitHub 에서 관리되고 있으며 GitHub 이슈 등록, 개선 제안, 활용 사례 공유, 소스 병합 요청 등 개발자 들의 참여와 피드백을 통해 더 나은 방향으로 나아가고자 합니다.

---

## 이제 시작해볼까요?

- HandStack에 대해 더 궁금하다면 공식 문서를 둘러보세요.
- 앞으로 진행될 학습을 통해 여러분도 풀스택 개발자가 될 수 있습니다.

- 공식 GitHub
    - `https://github.com/handstack77/handstack`

- 공식 문서 GitHub
    - `https://github.com/handstack77/handstack-docs`

- https://handstack.kr
