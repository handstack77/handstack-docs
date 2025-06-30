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

# 배포 준비를 위한 HandStack 설정 파일 (config) 깊이 파보기
### 기본 설정

---

## 설정 파일은 우리 앱의 '규칙서'

- HandStack 프로젝트의 모든 동작 규칙은 설정 파일에 정의됩니다.
- 코드를 직접 수정하지 않고, 설정 값 변경만으로 앱의 환경을 제어할 수 있습니다.

> 설정 파일은 우리 앱의 '규칙서' 같아요.
> 어떤 이름으로 불릴지, 몇 번 포트로 열릴지, 어떤 데이터베이스와 연결될지 모든 규칙이 적혀 있습니다.

- 이는 <mark>관심사의 분리</mark> 원칙을 따르는 좋은 개발 방식입니다.

---

## `config` 디렉토리 구조 살펴보기

- 프로젝트의 모든 설정은 `config` 디렉토리에서 중앙 관리됩니다.
- 환경별 (localhost, development, production) 설정을 분리하여 관리합니다.

```text
/config
|   ack.localhost.json            // 현재 환경(localhost)의 ack 프로그램 설정
|
+---modules                       // 각 모듈의 환경별 설정
|       ack.dbclient.localhost.json
|       ack.logger.localhost.json
|       ...
|
+---nodeconfigs                   // Node.js 서버의 환경별 설정
|       ack.localhost.json
|
\---synconfigs                    // syn.config.json의 환경별 재정의 설정
        ack.localhost.json
```

---

## 핵심 설정 파일의 역할

- `syn.config.json` (프로젝트 루트)
    - HandStack 프로젝트의 <mark>기본이 되는 핵심 설정 파일</mark>입니다.
    - 애플리케이션 포트, API 경로 접두사 등 전반적인 설정을 담고 있습니다.

- `config/synconfigs/ack.localhost.json`
    - `localhost` 환경에서 `syn.config.json`의 <mark>설정 값을 재정의(Override)</mark>합니다.
    - 예를 들어, 개발용 API 경로와 운영용 API 경로를 다르게 설정할 수 있습니다.

- `config/modules/*.json`
    - `dbclient`, `logger` 등 HandStack의 각 기능 모듈에 대한 세부 설정을 정의합니다.
    - 데이터베이스 접속 정보, 로그 레벨 등을 환경별로 다르게 지정할 수 있습니다.

---

## 핸즈온: API 경로 접두사 변경하기

- `apiPrefix` 값을 변경하여 실제 API 호출 주소가 어떻게 바뀌는지 확인해 봅시다.
- 이 실습을 통해 설정 파일이 애플리케이션에 어떻게 적용되는지 이해할 수 있습니다.

1.  <mark>설정 파일 열기</mark>
2.  <mark>`apiPrefix` 값 수정</mark>
3.  <mark>서버 재시작 및 테스트</mark>

---

### 1단계: 설정 파일 수정

- `syn.config.json` 파일을 열어 `apiPrefix` 속성을 찾습니다.
- 만약 `config/synconfigs/ack.localhost.json` 파일에 `apiPrefix`가 있다면 해당 파일을 수정합니다. (환경별 설정이 우선 적용)
- `apiPrefix` 값을 `/api`에서 `/myapi`로 변경하고 저장합니다.

```json
// syn.config.json 또는 config/synconfigs/ack.localhost.json

{
  // ... 다른 설정들
  "apiPrefix": "/myapi", // 기존 "/api"에서 변경
  // ... 다른 설정들
}
```

---

### 2단계: 서버 실행 및 테스트

- 터미널에서 HandStack 서버를 실행합니다.

```bash
handstack serve
```

- Postman과 같은 API 테스트 도구를 사용하여 변경 전후의 경로를 각각 호출해 봅니다.

- **변경 전 (Before)**
    - `GET http://localhost:5000/api/sample/users`
    - (이제 404 Not Found 오류가 발생합니다)

- **변경 후 (After)**
    - `GET http://localhost:5000/myapi/sample/users`
    - (정상적으로 데이터가 조회됩니다)

---

## 설정 파일 요약 정리

- HandStack의 `config` 디렉토리는 애플리케이션의 모든 동작을 제어하는 <mark>컨트롤 타워</mark>입니다.
- `syn.config.json`에 기본 설정을, `config/**/*.[환경].json`에 환경별 재정의 설정을 분리하여 관리합니다.
- 설정 파일 변경만으로 코드 수정 없이 API 경로, 데이터베이스 연결 등 <mark>핵심 동작을 쉽게 변경</mark>할 수 있습니다.
- 이는 배포 환경에 맞춰 유연하게 애플리케이션을 운영할 수 있는 기반이 됩니다.

---

## HandStack 프로젝트 모듈화/확장 전략
### (Monorepo 개념)

- 목표: 단일 HandStack 프로젝트 내에서 여러 클라이언트나 모듈을 효율적으로 관리하는 모노레포(Monorepo) 개념과 HandStack의 확장 전략을 이해합니다.

---

### 모노레포(Monorepo)란?

- 여러 개의 프로젝트를 하나의 소스코드 저장소에서 관리하는 개발 방식입니다.

- 장점
    - 코드 공유 용이성: 공통 모듈, 라이브러리, 컴포넌트를 쉽게 공유하고 재사용할 수 있습니다.
    - 일관된 도구 및 설정: 린팅, 빌드, 테스트 도구를 전사적으로 통일하여 일관성을 유지합니다.
    - 쉬운 통합 테스트: 여러 프로젝트 간의 변경 사항을 한번에 테스트하기 용이합니다.

---

### HandStack과 모노레포

- HandStack은 이미 `server`와 `client`를 한 프로젝트 내에서 관리하는 모노레포 형태의 구조를 가지고 있습니다.
- 다중 클라이언트 확장
    - `client-admin` (관리자 페이지), `client-user` (사용자 페이지)와 같이 클라이언트 디렉토리를 추가하여 관리할 수 있습니다.
- 공유 라이브러리
    - `server/src/shared` 또는 별도의 공통 패키지 디렉토리에서 공통 로직(데이터 모델, 유틸리티 함수 등)을 관리할 수 있습니다.

---

### 핸즈온 활동 (개념 이해)

- `client` 디렉토리 옆에 `client-admin`이라는 새 디렉토리를 만들어 보세요.
- `package.json`의 `scripts` 부분을 어떻게 수정하면 두 클라이언트를 동시에 또는 개별적으로 빌드하고 실행할 수 있을지 상상해 보세요.

```json
// package.json (예시)
"scripts": {
  "start:user": "cd client && npm start",
  "start:admin": "cd client-admin && npm start",
  "start:all": "npm-run-all --parallel start:user start:admin"
}
```

---

### 초급자 눈높이

> 모노레포는 마치 한 빌딩 안에 여러 개의 회사가 입주해 있는 것과 같아요.
> 각 회사는 독립적으로 일하지만, 같은 건물 안에 있어서 서로 자료를 공유하거나 회의를 하기가 훨씬 편리하죠.

---

## HandStack 프로젝트 간단 배포 (1)
### 로컬 서버에 PM2로 배포하기 (Node.js)

- 목표: 5개월차에 배운 PM2를 활용하여 HandStack Node.js 백엔드 애플리케이션을 로컬 환경에서 안정적으로 실행하고 관리하는 방법을 실습합니다.

---

### PM2의 중요성

PM2는 Node.js 애플리케이션을 위한 프로덕션 프로세스 매니저입니다.

- 무중단 서비스 (0-downtime reloads)
- 자동 재시작 (애플리케이션 충돌 시)
- 클러스터링 (CPU 코어 최대 활용)
- 로그 관리 (편리한 로그 모니터링 및 저장)

---

### PM2로 HandStack 실행하기

- PM2 설치 (글로벌)
  `npm install -g pm2`

- HandStack 빌드 결과물 실행
  - `handstack build` 명령으로 `dist` 디렉토리 생성
  - `pm2 start dist/server/main.js --name my-handstack-app`

- 주요 PM2 명령어
    - `pm2 list`: 실행 중인 앱 목록 확인
    - `pm2 logs`: 실시간 로그 확인
    - `pm2 restart <app_name>`: 앱 재시작
    - `pm2 stop <app_name>`: 앱 중지
    - `pm2 delete <app_name>`: 목록에서 앱 제거

---

### `ecosystem.config.js` 활용

배포 설정을 파일로 관리하면 더 체계적이고 재사용 가능한 배포가 가능합니다.

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'my-handstack-app',
    script: 'dist/server/main.js',
    instances: 'max', // or a number
    exec_mode: 'cluster',
    watch: false,
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```
- 실행: `pm2 start ecosystem.config.js`

---

### 핸즈온 활동

1. `handstack build` 명령어로 프로젝트를 빌드합니다.
2. 프로젝트 루트에 `ecosystem.config.js` 파일을 생성하고 위 예시처럼 설정합니다.
3. `pm2 start ecosystem.config.js` 명령어로 앱을 실행합니다.
4. `pm2 logs`로 로그를 확인합니다.
5. `pm2 stop` 후 `pm2 start`로 앱을 중지하고 재시작해 봅니다.

---

### HandStack 장점

> HandStack은 PM2와 같은 강력한 프로세스 관리 도구와 쉽게 연동되어, Node.js 기반 백엔드를 안정적으로 운영할 수 있도록 돕습니다.

---

## HandStack 프로젝트 간단 배포 (2)
### systemctl 활용 (Ubuntu 22.04 기반)

- 목표: 리눅스(Ubuntu) 환경에서 HandStack ASP.NET Core 애플리케이션을 `systemctl` 서비스로 등록하여 백그라운드에서 실행하고 관리하는 방법을 학습합니다.

---

### `systemd`와 `systemctl`

- `systemd`: 최신 리눅스 배포판의 표준 시스템 및 서비스 관리자입니다.
- `systemctl`: `systemd`를 제어하는 커맨드 라인 도구로, 서비스의 시작, 중지, 재시작, 상태 확인 등을 담당합니다.

- ASP.NET Core 앱 실행 준비
    - 서버에 `.NET SDK` 또는 `Runtime` 설치
    - 앱 배포: `dotnet publish -c Release`

---

### `.service` 파일 생성

서비스 정의 파일을 `/etc/systemd/system/` 경로에 생성합니다.

```ini
# /etc/systemd/system/mywebapp.service

[Unit]
Description=My HandStack Web App

[Service]
WorkingDirectory=/var/www/mywebapp
ExecStart=/usr/bin/dotnet /var/www/mywebapp/YourApp.dll
Restart=always
RestartSec=10
SyslogIdentifier=mywebapp
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production

[Install]
WantedBy=multi-user.target
```

---

### 주요 `systemctl` 명령어

- `sudo systemctl enable mywebapp.service`: 부팅 시 자동 시작 설정
- `sudo systemctl start mywebapp.service`: 서비스 시작
- `sudo systemctl stop mywebapp.service`: 서비스 중지
- `sudo systemctl restart mywebapp.service`: 서비스 재시작
- `sudo systemctl status mywebapp.service`: 서비스 상태 확인
- `sudo journalctl -fu mywebapp.service`: 실시간 로그 확인

---

### 핸즈온 활동 (WSL2/VM)

1. `dotnet publish`로 ASP.NET Core 프로젝트를 빌드합니다.
2. 빌드 결과물을 Ubuntu 서버의 특정 경로(예: `/var/www/mywebapp`)에 업로드합니다.
3. `/etc/systemd/system/mywebapp.service` 파일을 생성하고 위 예시처럼 설정합니다.
4. `sudo systemctl daemon-reload`로 서비스 파일을 리로드합니다.
5. `sudo systemctl start mywebapp`으로 서비스를 시작하고 `status`로 상태를 확인합니다.
6. `journalctl` 명령으로 로그를 확인합니다.

---

### HandStack 장점

> HandStack은 ASP.NET Core 백엔드를 리눅스 환경에서 `systemctl` 서비스로 쉽게 배포할 수 있도록 지원하여, 안정적인 서버 운영이 가능합니다.

---

## HandStack 프로젝트 간단 배포 (3)
### Windows 서비스 활용 (ASP.NET Core)

- 목표: Windows 환경에서 HandStack ASP.NET Core 애플리케이션을 Windows 서비스로 등록하여 백그라운드에서 실행하고 관리하는 방법을 학습합니다.

---

### Windows 서비스의 필요성

- 서버 재부팅 시 자동 시작
- 사용자가 로그인하지 않은 상태에서도 백그라운드에서 지속적으로 실행
- 안정적인 서비스 운영 보장

### 서비스 등록 및 관리

- 등록: `sc.exe` (명령 프롬프트) 또는 `New-Service` (PowerShell)를 사용하여 서비스를 생성합니다.
- 관리: `services.msc` (서비스 관리자) 콘솔 또는 `net start/stop` 명령어로 서비스를 제어합니다.
- 로그 확인: Windows 이벤트 뷰어 또는 자체적으로 구성한 파일 로그를 통해 확인합니다.

---

### 핸즈온 활동

1. ASP.NET Core 프로젝트를 `dotnet publish` 명령어로 빌드합니다.
2. 관리자 권한으로 PowerShell을 실행합니다.
3. `sc.exe` 명령어를 사용하여 서비스를 등록합니다.

```powershell
sc.exe create MyWebApp binPath="C:\path\to\publish\YourApp.exe" DisplayName="My HandStack App" start=auto
```

4. `services.msc`를 실행하여 "My HandStack App" 서비스가 등록되었는지 확인합니다.
5. 서비스를 시작, 중지, 재시작 해보며 정상 동작하는지 테스트합니다.

---

### HandStack 장점

> HandStack ASP.NET Core 백엔드는 Windows 서비스로 쉽게 배포되어, Windows 서버 환경에서도 안정적인 서비스 운영을 보장합니다.

---

## HandStack 프로젝트 간단 배포 (4)
### Windows IIS 활용 (ASP.NET Core)

- 목표: Windows 서버의 IIS(Internet Information Services) 웹 서버에 HandStack ASP.NET Core 애플리케이션을 배포하고 호스팅하는 방법을 학습합니다.

---

### IIS(Internet Information Services)

- Windows 운영체제에 포함된 강력하고 유연한 웹 서버입니다.
- 웹 사이트, 웹 애플리케이션, 서비스를 호스팅하고 관리하는 데 사용됩니다.

### 배포 준비
- IIS 역할 추가: 'Windows 기능 켜기/끄기'에서 인터넷 정보 서비스를 활성화합니다.
- ASP.NET Core Hosting Bundle 설치: IIS가 ASP.NET Core 앱을 실행할 수 있도록 하는 필수 모듈입니다.

---

### IIS 설정 절차

1. IIS 관리자를 엽니다.
2. '사이트'에서 마우스 오른쪽 클릭 -> '웹 사이트 추가'
3. 사이트 이름, 실제 경로(`dist` 디렉토리 등), 포트 등 바인딩 정보를 입력합니다.
4. '응용 프로그램 풀'에서 생성된 풀의 .NET CLR 버전을 '관리 코드 없음'으로 설정합니다. (IIS가 프록시 역할만 하기 때문)
5. `web.config` 파일이 빌드 결과물에 포함되어 있는지 확인합니다.

---

### 핸즈온 활동

1. Windows 서버 기능에서 IIS를 설치합니다.
2. 최신 ASP.NET Core Hosting Bundle을 다운로드하여 설치합니다.
3. `dotnet publish`로 HandStack 프로젝트를 빌드합니다.
4. IIS 관리자에서 새 웹 사이트를 생성하고, 실제 경로를 빌드 결과 폴더로 지정합니다.
5. 웹 브라우저에서 설정한 주소(예: http://localhost:8080)로 접속하여 앱이 실행되는지 확인합니다.

---

### HandStack 장점

> HandStack ASP.NET Core 앱은 IIS와 완벽하게 호환되어, 기존 Windows 서버 환경에서도 고성능 웹 서비스를 쉽게 구축할 수 있습니다.

---

## HandStack 프로젝트 간단 배포 (5)
### Docker 컨테이너화 기초

- 목표: Docker의 핵심 개념을 복습하고, HandStack 프로젝트를 Docker 이미지로 빌드하고 컨테이너화하여 일관된 배포 환경을 구성하는 방법을 학습합니다.

---

### Docker 핵심 개념 복습

- 이미지 (Image): 애플리케이션을 실행하는 데 필요한 모든 것(코드, 런타임, 라이브러리, 환경 변수, 설정 파일)을 포함하는 읽기 전용 템플릿입니다.
- 컨테이너 (Container): 이미지의 실행 가능한 인스턴스입니다. 격리된 환경에서 애플리케이션을 실행합니다.
- Dockerfile: 이미지를 생성하는 방법을 정의하는 텍스트 파일입니다.

---

### `Dockerfile` 작성 예시 (ASP.NET Core)

멀티스테이지 빌드를 사용하여 최종 이미지 크기를 최적화합니다.

```dockerfile
# 1. Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /source
COPY . .
RUN dotnet publish -c Release -o /app/publish

# 2. Final Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "YourApp.dll"]
```

- `FROM`, `WORKDIR`, `COPY`, `RUN`, `ENTRYPOINT` 등 주요 명령어를 사용합니다.

---

### Docker 이미지 빌드 및 실행

- 이미지 빌드
  - `docker build -t my-handstack-app .`
  - `-t` 옵션으로 이미지에 이름(태그)을 지정합니다.

- 컨테이너 실행
  - `docker run -p 8080:80 my-handstack-app`
  - `-p` 옵션으로 호스트의 8080 포트와 컨테이너의 80 포트를 매핑합니다.

---

### 핸즈온 활동

1. 프로젝트 루트 디렉토리에 위 예시를 참고하여 `Dockerfile`을 작성합니다.
2. `docker build -t my-handstack-app .` 명령어로 이미지를 빌드합니다.
3. `docker images` 명령어로 생성된 이미지를 확인합니다.
4. `docker run -d -p 5000:80 my-handstack-app` 명령어로 컨테이너를 백그라운드에서 실행합니다.
5. 웹 브라우저에서 `http://localhost:5000`으로 접속하여 컨테이너화된 앱을 확인합니다.

---

### HandStack 장점

> HandStack은 Docker와의 연동이 뛰어나, 개발부터 배포까지 일관된 컨테이너 환경을 통해 어떤 서버에서도 동일하게 동작하는 앱을 만들 수 있게 합니다.
