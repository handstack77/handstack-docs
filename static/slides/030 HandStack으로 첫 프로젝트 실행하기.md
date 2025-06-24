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

### 프로젝트를 빌드하고, 서버를 실행하여 결과를 확인합니다.

---

## 1. 프로젝트 빌드하기

- 먼저 프로젝트 소스 코드를 빌드하여 컴파일합니다.
- HandStack 소스 디렉토리로 이동하여 `dotnet build` 명령어를 실행합니다.

```bash
cd %HANDSTACK_SRC%
dotnet build
```
- 이 과정은 프로젝트에 필요한 모든 코드를 확인하고 실행 가능한 상태로 만듭니다.

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
- 이 과정에서 의존성 패키지를 설치하므로 시간이 다소 걸릴 수 있습니다.

---

## 3. ack 서버 실행하기

- 게시가 완료되면 결과물이 생성된 디렉토리로 이동합니다. (`%HANDSTACK_HOME%`)
- 이제 `ack` 서버를 실행하여 웹 애플리케이션을 시작합니다.
- 운영체제에 맞는 명령어를 사용하세요.

```bash
# HandStack 게시 디렉토리로 이동
cd %HANDSTACK_HOME%

# 서버 실행 (Windows)
ack.exe
# 또는
dotnet ack.dll

# 서버 실행 (Linux/macOS)
./ack
```
---

## 4. 브라우저에서 확인하기

- 서버가 성공적으로 실행되면 터미널에 접속 주소가 표시됩니다.
- 웹 브라우저를 열고 해당 주소로 접속합니다. (기본값: `http://localhost:8421`)

```
http://localhost:8421
```

- "Hello HandStack" 메시지가 보이면 성공적으로 실행된 것입니다.

---

## 5. 개발 서버 종료하기

- 서버를 실행한 터미널 창에서 `Ctrl` 키와 `C` 키를 함께 눌러 개발 서버를 종료할 수 있습니다.

```
Ctrl + C
```

---

## 핸즈온 활동: 첫 프로젝트 실행

1.  `cd %HANDSTACK_SRC%`
2.  `dotnet build`
3.  `publish.bat win build Debug x64`
4.  `cd %HANDSTACK_HOME%`
5.  `ack.exe`
6.  브라우저에서 `http://localhost:8421` 접속
7.  `Ctrl+C` 로 종료

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

### 결과 확인하기

`ack` 서버가 실행 중인지 확인하고, 웹 브라우저를 열어 아래 주소로 접속합니다.

- `http://localhost:8421/index.html`

화면에 "Welcome to HandStack!" 메시지가 보이면 성공입니다.

- 참고: 각 모듈의 기본 페이지는 아래와 같이 접근할 수 있습니다.
- `http://localhost:8421/[모듈 ID]/module.html`
