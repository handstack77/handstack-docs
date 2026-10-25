# handstack-docs 개발 지침

이 파일은 이 저장소에서 작업하는 모든 AI 코딩 에이전트의 공통 지침입니다. 문서 사이트, 예제, 에이전트 스킬, MCP 서버와 사이트 호스트를 지속적으로 유지보수할 때 적용합니다. `CLAUDE.md`는 이 파일을 불러오며, 공통 규칙은 여기에서만 관리합니다.

## 작업 시작과 변경 범위

1. `git status --short`와 대상 파일의 diff를 확인하고 기존 사용자 변경을 보존합니다. 요청과 무관한 파일, 서식, 이름을 일괄 수정하지 않습니다.
2. 문서를 고치기 전에 [CONTRIBUTING.docs.md](CONTRIBUTING.docs.md)를 읽고, 해당 주제의 대표 문서와 가까운 예제를 확인합니다.
3. `rg`로 관련 설정 키, API 이름, 문서 ID와 참조를 검색합니다. 이 저장소의 `docs/`를 먼저 읽고, 런타임 동작을 설명할 때는 사용 중인 버전의 실제 HandStack 소스와 대조합니다. 다른 저장소의 경로가 이 환경에도 있다고 가정하지 않습니다.
4. 구현·설정·문서가 다르면 확인한 근거를 남깁니다. 확인하지 못한 구문, 기본값, 지원 버전이나 실행 결과를 추측으로 보충하지 않습니다.
5. 커밋·스테이징·푸시·게시와 다른 저장소 수정은 사용자가 요청한 범위에서만 수행합니다. 파일을 삭제하거나 이동하면 참조도 확인합니다.

## 저장소 구조

| 경로 | 역할과 변경 기준 |
|---|---|
| `docs/` | 한국어 공개 문서와 API·설정의 대표 설명. Markdown/MDX와 frontmatter를 유지합니다. |
| `blog/` | 블로그 글과 글에 속한 이미지 |
| `src/` | Docusaurus 페이지, React 컴포넌트와 스타일 |
| `static/` | URL에 그대로 노출되는 스크립트, UI 컨트롤, 예제, 설치 파일과 슬라이드 |
| `docusaurus.config.ts`, `sidebars.ts` | 사이트 설정, 메뉴와 탐색 구조. 기존 문서 URL을 보존합니다. |
| `plugins/agent-docs/` | 문서 검색 인덱스와 LLM용 텍스트 생성, 개발용 MCP 연결 |
| `plugins/ide-downloads/` | 공식 updater 카탈로그를 빌드 시 읽는 IDE 다운로드 페이지 |
| `agent-skills/` | Claude Code·Codex CLI 공용 스킬, 가이드, 점검·패키징 도구의 원본 |
| `mcp/` | 문서 인덱스를 검색·조회하는 Node.js MCP 서버. 세부 실행 방법은 `mcp/README.md`를 따릅니다. |
| `Program.cs`, `Mcp*.cs`, `handstack-docs.csproj` | ASP.NET Core 사이트 호스트와 MCP 자식 프로세스 실행·프록시 |
| `marp-slide.js`, `static/slides/` | Marp 감시 스크립트와 Markdown/HTML 발표 자료 |

문서 사이트는 Docusaurus 3·React·TypeScript 기반이며 기본 언어는 한국어입니다. Node.js 최소 조건은 루트와 `mcp/package.json`의 `engines`, 사이트 호스트의 .NET 대상은 `handstack-docs.csproj`에서 확인합니다. 아래 HandStack 개발 배경의 런타임 설치 예제를 문서 사이트의 필수 환경으로 적용하지 않습니다.

## 개발과 검증 명령

저장소 루트의 PowerShell에서 실행합니다. 이미 설치된 의존성을 불필요하게 다시 설치하거나 잠금 파일을 갱신하지 않습니다.

```powershell
# 처음 준비하거나 잠금 파일에 맞춰 의존성을 설치할 때
npm ci

# 문서 개발 서버
npm run start

# TypeScript 검사와 문서 프로덕션 빌드
npm run typecheck
npm run build

# 빌드 결과 로컬 확인
npm run serve

# 스킬 또는 스킬이 인용하는 문서 변경 시
npm run check:agent

# 배포용 스킬 zip 생성이 필요한 경우에만 실행
npm run package:agent

# MCP 서버를 처음 준비할 때와 MCP 코드 변경 후 검증
npm ci --prefix mcp
npm test --prefix mcp

# 사이트 호스트 C# 코드 또는 프로젝트 설정 변경 시
dotnet build handstack-docs.csproj

# 변경 파일의 공백 오류 확인
git diff --check
```

- 문서·사이트 변경은 `npm run typecheck`와 `npm run build`로 확인합니다. 메뉴·레이아웃·예제를 바꾸면 관련 화면을 브라우저에서 확인하고, 메뉴는 데스크톱·모바일을 함께 확인합니다.
- 스킬 검증·패키징에는 Python 3.10 이상이 필요합니다. 스킬 점검 도구 변경 시 `agent-skills/tests`의 관련 테스트도 갱신합니다.
- MCP 테스트는 고정 fixture 검증입니다. 실제 인덱스와 `/mcp` 접속 검증은 별도로 수행하고 결과를 구분합니다.
- IDE 다운로드 정보는 빌드 시 외부 카탈로그를 조회합니다. 네트워크 실패나 경고가 있으면 실제 로그와 영향을 보고하며, 이를 숨기려고 기본 서버 주소를 바꾸지 않습니다.
- 루트 지침만 바꾼 경우에는 병합 내용, 파일 참조와 diff를 확인합니다. 새 지침에 적힌 모든 서버·배포 명령을 실행할 필요는 없습니다.

## 문서와 예제 유지보수

- 독자가 할 일과 예상 결과를 먼저 설명합니다. 학습·작업별 가이드·참조·개념의 구분과 대표 문서 목록은 `CONTRIBUTING.docs.md`를 따릅니다.
- API 구문·옵션·기본값은 대표 문서 한 곳에서 관리합니다. 실습과 스킬에는 필요한 예제나 판단 절차를 두고 대표 문서를 연결합니다.
- 파일명·`id`·`slug`·절 제목을 바꾸면 기존 링크, `sidebars.ts`, 코드 예제, 스크린샷 설명과 슬라이드의 참조를 검색합니다. 기존 주소를 유지하거나 이동 안내를 제공합니다.
- MDX의 JSX, 중괄호와 태그 문법을 확인합니다. 문서 빌드를 통과시키기 위해 깨진 링크 검사를 완화하지 않습니다.
- HandStack 예제의 화면 HTML·JS, 거래·SQL·함수 계약, 설정 키와 식별자는 기존 계약을 보존하며 함께 대조합니다. 거래 호출은 `docs/reference/거래-호출.mdx`, 식별자·경로는 `docs/reference/식별자와-파일-경로.mdx`가 기준입니다.
- `docs/ide/`는 실제 IDE UI·저장 형식·교육 원문과 대조합니다. 설치 주소 `/ide`와 사용법 `/docs/ide/`를 구분하고, 자세한 규칙은 `CONTRIBUTING.docs.md`의 IDE 절을 따릅니다.
- `docs/reference/vide-coding-instruction/examples/`와 `agent-skills/guides/templates/`의 지침 파일은 독자를 위한 템플릿입니다. 이 저장소 자체의 경로·명령·작업 규칙과 혼용하지 않습니다.

## 원본과 생성 파일

- `build/`, `.docusaurus/`, `bin/`, `obj/`, `node_modules/`는 생성 결과입니다. 직접 고치거나 커밋하지 않습니다. `mcp/bin/serve.mjs`는 예외로 실행 진입점 소스입니다.
- `llms*.txt`, `agent/docs-index.json`은 `plugins/agent-docs/`가 생성합니다. 출력물을 직접 수정하지 말고 문서나 플러그인 원본을 고칩니다.
- `static/js/syn*.js`, `static/uicontrols/`에는 HandStack 소스와 동기화하는 자산이 있습니다. 원본 위치와 생성 방법을 확인한 뒤 요청받은 파일만 동기화하며, minified 파일만 따로 고치지 않습니다.
- 슬라이드는 `static/slides/*.md`를 원본으로 관리합니다. 수정한 슬라이드에 한해 대응 HTML을 Marp로 갱신합니다. 루트의 `marp-slide.js`는 시작할 때 기존 슬라이드 전체를 처리하므로 전체 재생성이 필요한 경우에만 실행합니다.
- 스킬 배포 zip은 `npm run package:agent`로 생성하며 `static/agent-skills/`의 결과물을 커밋하지 않습니다. 상세 규칙은 `agent-skills/README.md`를 따릅니다.
- 기존 파일의 인코딩, 줄바꿈, 들여쓰기와 한국어 주석·메시지를 유지합니다. 대량 서식 변경과 불필요한 번들 재생성을 피합니다.

## 보안과 완료 보고

- 연결 문자열, 암호, 토큰과 API 키는 문서·예제·로그·커밋에 넣지 않습니다. 예제에는 자리표시자를 사용합니다.
- 데이터 삭제·덮어쓰기·권한 변경이 있는 절차는 명령 앞에 영향을 설명하고, 실제 작업은 사용자가 요청한 대상과 범위 안에서 수행합니다.
- 완료 시 변경 내용, 수행한 검증과 결과, 미확인 사항을 간결하게 보고합니다. 정적 검사·빌드 성공과 실제 서버·브라우저·DB·외부 서비스의 실행 성공을 구분합니다.
- 작업 방식이 달라지면 이 파일과 관련 대표 문서를 함께 갱신합니다. 공통 규칙을 `CLAUDE.md`에 복제하지 않습니다.

---

# HandStack 개발 배경

기존 개발 가이드의 내용을 아래에 통합했습니다. HandStack 업무 앱의 개념과 개발·운영 흐름을 설명하는 배경 자료이며, 버전별 설치 명령·CLI 옵션·설정은 해당 대표 문서와 실제 배포본을 먼저 확인합니다. 문서 사이트 자체의 작업에는 위 저장소 지침을 적용합니다.

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

- **주요 모듈**: `wwwroot`, `transact`, `dbclient`, `function`, `repository`, `logger` 등

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
4.  **확인**: 웹 브라우저에서 `http://localhost:8421/checkip`로 접속하여 HandStack 실행을 확인합니다.

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
