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

# HandStack으로 첫 프로젝트 실행하기

### Windows 에서 프로젝트를 빌드하고, 결과를 확인합니다.

---

## 1. 프로젝트 빌드하기

> [내 컴퓨터에 개발 환경 꾸미기](https://handstack.kr/slides/020%20내%20컴퓨터에%20개발%20환경%20꾸미기.html) 에서 설치 과정이 완료되면 호스트에 HANDSTACK_SRC, HANDSTACK_HOME 환경변수가 설정됩니다.

- 먼저 프로젝트 소스 코드를 빌드하여 컴파일합니다.
- HandStack 소스 디렉토리로 이동하여 `dotnet build` 명령어를 실행합니다.
- 이 과정은 프로젝트에 필요한 모든 코드를 확인하고 실행 가능한 상태로 만듭니다.

```bash
cd %HANDSTACK_SRC%
dotnet build
```

---

## 2. 프로젝트 게시(Publish)하기

- 빌드가 완료되면, 실행 가능한 형태로 배포 파일을 생성합니다.
- HandStack은 다양한 운영체제와 환경에 맞춰 게시할 수 있는 `publish.bat` 스크립트를 제공합니다.

```bash
cd %HANDSTACK_SRC%

# publish.bat [운영체제] [빌드설정] [빌드구성] [아키텍처]

# 예시
publish.bat win build Debug x64
publish.bat linux build Debug x64
publish.bat osx build Debug x64
```

---

## 3. ack 서버 실행하기

- 게시가 완료되면 결과물이 생성된 디렉토리로 이동합니다. (`%HANDSTACK_HOME%`)
- 이제 `ack` 서버를 실행하여 웹 애플리케이션을 시작합니다.
- 운영체제에 맞는 명령어를 사용하세요.

```bash
cd %HANDSTACK_HOME%
ack.exe
```
---

## 브라우저에서 확인하기

- 서버가 성공적으로 실행되면 명령 프롬프트에 접속 주소가 표시됩니다.
- 웹 브라우저를 열고 해당 주소로 접속합니다. (기본값: `http://localhost:8421`)

```txt
http://localhost:8421
```

- "hello syn !" 메시지가 보이면 성공적으로 실행된 것입니다.

---

## 개발 서버 종료하기

- 서버를 실행한 명령 프롬프트 창에서 `Ctrl` 키와 `C` 키를 함께 눌러 개발 서버를 종료할 수 있습니다.

```txt
Ctrl + C
```

---

## 핸즈온 활동: 첫 프로젝트 실행

1. `cd %HANDSTACK_SRC%`
2. `dotnet build`
3. `publish.bat win build Debug x64`
4. `cd %HANDSTACK_HOME%`
5. `ack.exe`
6. 브라우저에서 `http://localhost:8421` 접속
7. `Ctrl+C` 로 종료

---

## HandStack 에서는 컴파일 디렉토리를 구분합니다

`cd %HANDSTACK_SRC%/..` 로 이동하면 build, publish 디렉토리가 있습니다.

- build: 개발 중 코드 검증 및 디버깅 결과물 위치로 개발 머신에서만 실행하는 것을 권장
- publish: 배포 가능한 완전한 애플리케이션 패키지 생성 결과물 위치로 운영체제에 맞는 출력 디렉토리

> 개발할 때는 build, 배포할 때는 publish를 사용하여 각각의 목적에 맞는 최적화된 결과물을 얻을 수 있습니다!

---

## 첫 웹 페이지 수정하기: 나만의 환영 메시지 만들기

`wwwroot` 모듈의 코드를 직접 수정하고 결과를 브라우저에서 확인합니다.

1. `wwwroot` 모듈의 웹 루트 디렉토리로 이동합니다.
   - `$(HANDSTACK_SRC)/2.Modules/wwwroot/wwwroot`

2. `index.html` 파일의 내용을 수정합니다.
   - "hello module wwwroot" -> "Welcome to HandStack!"

3. 웹 브라우저에서 결과를 확인합니다.
   - `http://localhost:8421/index.html`

---

## 각 모듈의 기본 페이지 확인하기

`http://localhost:8421/[모듈 ID]/module.html`

HandStack에서는 공식 module로서 다음과 같이 기본 제공됩니다.

<style scoped>
  table { font-size: 22px; }  
</style>

|module명|설명|
|---|---|
|checkup|태넌트 앱 개발 및 운영 기능 관리|
|dbclient|SQL Server, Oracle, MySQL & MariaDB, PostgreSQL, SQLite SQL을 관리|
|function|C# 또는 Node.js 기반 Function 개발 기능 관리|
|repository|단일, 다중, 이미지, 첨부파일 등등 파일 업로드/다운로드 관리|
|transact|거래 요청 검증 및 접근 제어 관리와 요청 정보를 dbclient, function 등등 module로 라우팅 기능 관리|
|logger|module 요청/응답 구간 주요 이벤트 로그 수집 관리|
|wwwroot|웹 공통 static assets 및 화면 단위 소스 호스팅 관리|
|openapi|데이터베이스 데이터를 Open API로 제공 하기 위한 기능 관리|

---

## 요약 정리 및 Q&A

- 처음 소스를 내려받으면 솔루션 빌드와 게시를 해보세요.
- 화면/기능 개발을 위해 기본 모듈이 실행되는지 확인하세요.
- 각 모듈의 기본 페이지 확인하며 UI 파일이 어떻게 보이는지 생각해보세요.
