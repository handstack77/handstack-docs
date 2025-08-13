# HandStack 개발을 위한 GEMINI 가이드

이 문서는 HandStack 기반의 프로젝트 개발을 위한 전반적인 가이드입니다. HandStack의 핵심 개념, 개발 환경 설정, 프론트엔드 및 백엔드 개발 방법, 그리고 배포 및 운영 전략에 대해 설명합니다.

## 1. HandStack 개요

HandStack은 기업의 고유 비즈니스 앱을 합리적인 비용으로 개발하고 운영하기 위한 개발자 및 엔지니어를 위한 통합 개발 플랫폼(SDK)입니다. 클라우드 네이티브 환경에 최적화되어 있으며, 개발자가 비즈니스 가치에 집중할 수 있도록 생산성을 높이는 것을 목표로 합니다.

- **주요 대상**: 전문 개발자, 시스템 엔지니어, 사내 개발팀
- **핵심 가치**: 개발 프로세스 단순화, 표준화, 비용 절감
- **기술 스택**: HTML5, ASP.NET Core, Node.js, Docker (HAND)
- **라이선스**: 상업적 사용에 제한이 없는 MIT 라이선스

## 2. 핵심 아키텍처 및 개념

HandStack은 현대적인 소프트웨어 개발 방법론을 채택하여 유연성과 확장성을 확보합니다.

### 2.1. 모듈러 모놀리식 아키텍처

HandStack은 모놀리식의 단순성과 마이크로서비스의 모듈성의 장점을 결합한 **모듈러 모놀리식 아키텍처**를 기반으로 합니다. 각 기능은 독립적인 모듈로 개발되지만, 단일 프로세스 내에서 실행되어 운영 복잡성을 줄입니다. 이는 프로젝트 규모에 따라 유연하게 마이크로서비스로 전환할 수 있는 기반을 제공합니다.

- **주요 모듈**: `wwwroot`, `transact`, `dbclient`, `function`, `repository`, `logger`, `checkup` 등

### 2.2. 계약 중심 거래 (Contract-Driven)

모든 클라이언트-서버 통신은 '거래(Transaction)'라는 작업 단위로 이루어지며, 이는 명확하게 정의된 '계약(Contract)'에 의해 관리됩니다.

- **`transact` 모듈**: 모든 거래 요청을 수신하는 단일 엔드포인트(Gateway) 역할을 합니다. 요청 검증, 라우팅, 로깅, 캐싱 등을 처리합니다.
- **`dbclient` 모듈**: XML 계약 문서를 통해 다양한 데이터베이스(SQL Server, Oracle, PostgreSQL, MySQL, SQLite)의 CRUD 쿼리를 관리하고 실행합니다.
- **`function` 모듈**: C#, Node.js, Python으로 작성된 서버리스 함수를 실행하여 복잡한 비즈니스 로직이나 외부 시스템 연동을 처리합니다.

### 2.3. 서버리스 함수 (Serverless Function)

데이터베이스 CRUD 외의 복잡한 비즈니스 로직은 서버리스 함수로 구현하여 모듈성과 재사용성을 높입니다. HandStack은 컴파일 없이 텍스트 파일 기반으로 C#, Node.js, Python 함수를 개발하고 배포할 수 있는 환경을 제공합니다.

## 3. 개발 환경 설정 (시작하기)

HandStack 개발을 시작하기 위해 필요한 프로그램과 도구를 설치하고 환경을 구성합니다.

### 3.1. 필수 프로그램 설치

HandStack은 .NET과 Node.js를 기반으로 동작합니다. 각 운영체제에 맞는 패키지 관리자를 사용하여 설치하는 것을 권장합니다.

- **Windows (winget 사용)**:
  ```bash
  winget install -e --id=Microsoft.DotNet.SDK.8
  winget install -e --id=OpenJS.NodeJS.LTS
  winget install -e --id=Git.Git
  ```
- **macOS (Homebrew 사용)**:
  ```bash
  brew install --cask dotnet-sdk
  brew install node@20
  ```
- **Linux (apt 사용)**:
  ```bash
  sudo apt-get update
  sudo apt-get install -y dotnet-sdk-8.0
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```

### 3.2. HandStack 프로젝트 실행

1.  **다운로드**: [HandStack 최신 릴리즈](https://github.com/handstack77/handstack/releases/latest)에서 운영체제에 맞는 압축 파일을 다운로드하여 원하는 경로(예: `C:/projects/handstack`)에 압축을 해제합니다.
2.  **환경 구성**: 해당 경로로 이동하여 OS에 맞는 `install` 스크립트를 실행합니다. 이 과정에서 필요한 종속 라이브러리가 설치됩니다.
    -   Windows: `install.bat`
    -   Linux/macOS: `chmod +x install.sh && sudo ./install.sh`
3.  **서버 실행**: `app` 디렉토리로 이동하여 `ack` 프로그램을 실행합니다.
    -   Windows: `ack.exe`
    -   Linux/macOS: `./ack` 또는 `dotnet ack.dll`
4.  **확인**: 웹 브라우저에서 `http://localhost:8421/checkup/account/signin.html`로 접속하여 HandStack 실행을 확인합니다.

### 3.3. HandStack CLI

HandStack은 개발 및 운영을 돕는 강력한 CLI 도구를 제공합니다. (`app/cli/handstack`)

-   `handstack list`: 실행 중인 ack 프로세스 목록 조회
-   `handstack configuration`: 환경설정 적용
-   `handstack purgecontracts`: 중복 계약 파일 정리
-   `handstack start/stop`: ack 서버 시작/종료
-   `handstack encrypt/decrypt`: 중요 정보 암호화/복호화
-   `handstack task`: 사전 정의된 배치 스크립트 실행

## 4. 프론트엔드 개발

HandStack의 프론트엔드는 표준 웹 기술을 기반으로 하며, 생산성을 높이기 위한 다양한 도구와 라이브러리를 제공합니다.

### 4.1. UI 디자인 시스템

-   **Tabler CSS Framework**: Bootstrap 5 기반의 UI Kit으로, 일관되고 반응성이 뛰어난 UI를 쉽게 구성할 수 있습니다.
-   **Master CSS**: 유틸리티 우선 CSS 프레임워크로, 직관적인 문법으로 빠르게 스타일을 적용할 수 있습니다.
-   **Mustache.js**: 로직 없는 템플릿 엔진으로, HTML과 데이터를 결합하여 동적인 콘텐츠를 생성합니다.

### 4.2. 공통 라이브러리 및 컨트롤

-   **syn.js**: DOM 조작, 유효성 검사, 암호화, HTTP 요청 등 웹 개발에 필요한 공통 유틸리티 함수를 제공하는 경량 라이브러리입니다.
-   **syn.controls.js**: `syn_grid`, `syn_datepicker`, `syn_codepicker` 등 업무 화면 개발에 필수적인 UI 컨트롤을 제공하여 개발 생산성을 극대화합니다.

## 5. 백엔드 개발

HandStack의 백엔드는 계약(Contract)을 중심으로 데이터베이스 및 서버리스 함수를 통해 비즈니스 로직을 구현합니다.

### 5.1. 데이터베이스 연동

-   `dbclient` 모듈을 통해 다양한 RDBMS(SQL Server, Oracle, MySQL, PostgreSQL, SQLite)와 연동합니다.
-   **쿼리 계약**: SQL 쿼리를 코드와 분리하여 XML 파일로 관리합니다. 이를 통해 동적 SQL, 전처리/후처리, 세션 변수 사용 등 강력한 기능을 제공하며 유지보수성을 높입니다.
-   **연결 관리**: 데이터베이스 연결 정보는 `modules/dbclient/module.json`의 `DataSource` 항목에서 관리하며, HandStack CLI를 통해 안전하게 암호화할 수 있습니다.

### 5.2. 서버리스 함수 (Function)

-   `function` 모듈을 통해 C#, Node.js, Python으로 비즈니스 로직을 작성할 수 있습니다.
-   외부 API 연동, 복잡한 계산, 배치 작업 등 데이터베이스 CRUD만으로 처리하기 어려운 로직을 구현하는 데 사용됩니다.
-   함수는 컴파일 없이 텍스트 파일 형태로 관리되어 배포가 간편합니다.

## 6. 운영 및 관리

### 6.1. 배포 전략

-   **빌드 및 게시**: `build.bat`(.sh)와 `publish.bat`(.sh) 스크립트를 통해 개발 및 배포용 결과물을 생성합니다.
-   **호스팅**:
    -   **Windows**: IIS 호스팅, Windows 서비스 등록
    -   **Linux**: systemd 서비스 등록
    -   **크로스플랫폼**: PM2 (프로세스 관리자), Docker 컨테이너

### 6.2. 디버깅 및 모니터링

-   **디버깅**: Visual Studio, JetBrains Rider, VS Code 등 다양한 IDE를 통한 로컬 및 원격 디버깅을 지원합니다. (SSH, `msvsmon.exe`)
-   **로깅**: `logger` 모듈을 통해 파일 또는 데이터베이스에 거래 로그를 기록하며, `pm2 logs`나 `tail` 명령어로 실시간 모니터링이 가능합니다.
-   **.NET 진단 도구**: `dotnet-trace`, `dotnet-dump`를 활용하여 운영 환경의 성능 문제나 메모리 누수를 분석할 수 있습니다.

### 6.3. 비밀 키 관리 (Secrets Management)

-   HandStack은 ack 서버의 KVS(Key Vault Secret) 기능을 통해 암호, API 키 등 민감한 정보를 안전하게 관리합니다.
-   `handstack-secrets.json` 파일에 암호화된 키를 저장하고, 클라이언트의 식별 정보(MachineID, IP, HostName)를 기반으로 접근을 제어합니다.

## 7. 기여하기

HandStack은 오픈소스 프로젝트이며 여러분의 기여를 환영합니다.

-   **버그 리포트 및 기능 제안**: [GitHub Issues](https://github.com/handstack77/handstack/issues)
-   **코드 기여**: [Pull Requests](https://github.com/handstack77/handstack/pulls)
-   **문서 개선**: [Docs Repository](https://github.com/handstack77/handstack-docs)

자세한 내용은 [기여하기 가이드](/docs/information/community/기여하기)를 참고하세요.
