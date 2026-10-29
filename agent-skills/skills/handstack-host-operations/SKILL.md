---
name: handstack-host-operations
description: HandStack 호스트와 운영 도구를 실행·설정·빌드·배포·점검한다. ack(메인 호스트, 기본 8421)·rdy(정적 결합 호스트, 기본 8420)·agent(관리 API 8422)·deploy(업데이트 호스트 8520)·forbes(정적/계약 동기화 8420), handstack CLI(start/stop/configuration/contractpack/encrypt/task…), appsettings·module.json 환경별 설정과 실시간 반영 범위, HANDSTACK_HOME/HANDSTACK_SRC 환경 변수, 로컬 개발 서버 기동, Docker, build/publish 스크립트, HostAccessID 관리 API, 로그 위치, /contractsync 계약 동기화, "서버가 안 떠요/포트 충돌/모듈이 안 올라와요/설정이 반영 안 돼요/배포 폴더가 지워졌어요" 같은 운영 요청이면 명령을 실행하기 전에 사용한다.
---

# HandStack 호스트·운영 도구

호스트는 `ack`(또는 `rdy`)가 **모듈 폴더의 DLL·`module.json`·정적 자산·계약**을 읽어 하나의 ASP.NET Core 파이프라인으로 합성하는 구조다. 운영 사고의 대부분은 (1) 설정이 어느 파일에서 오는지 모르거나, (2) 빌드·배포 명령이 `HANDSTACK_HOME`을 덮어쓰거나, (3) 재시작이 필요한 설정을 실시간 반영된다고 오해해서 생긴다. 이 스킬은 실행 전에 그 세 가지를 확인하는 절차다.

실행 옵션, 설정 우선순위와 실시간 반영 키, 관리 엔드포인트, 다른 호스트의 API와 CLI 옵션의 대표 문서는 사이트의 `reference/api/ack-프로그램`, `reference/api/운영-호스트`, `startup/HandStack-CLI-사용법`이다. 이 스킬은 판단 절차와 안전 규칙만 둔다. 문서와 소스가 다르면 소스(`1.WebHost/*`, `4.Tool/CLI/handstack`)를 따른다.

## 먼저 확인할 것

1. 저장소의 `AGENTS.md`/`CLAUDE.md`가 작업 규약이다. 큰 작업은 `Goal / Constraints / Done / Persona` 네 줄을 먼저 쓰고, 기존 변경(`git status --short`)은 사용자의 작업으로 보고 덮어쓰거나 정리하지 않는다.
2. 환경 변수: `HANDSTACK_HOME`(배포 홈, 기본 `<저장소 상위>/build/handstack`)과 `HANDSTACK_SRC`(소스 저장소). `env.ps1/.bat/.sh`가 설정하며 값은 `echo`로 확인한다. 홈 폴더 구성: `app`(호스트 실행 파일), `modules/{모듈}`, `contracts`, `log`, `tmp`, `sqlite`, `storage`, `tenants`, `batchs`, `cache`, `forbes`, `tools`(CLI·updater).
3. **파괴적 명령 여부**: 아래 목록은 실행 전에 대상 경로를 출력해 확인받는다.
   - `publish.*`: 대상 publish 폴더와 `HANDSTACK_HOME/contracts`를 먼저 삭제한다.
   - 모듈/호스트 `build`의 PostBuild: `HANDSTACK_HOME/app|modules/*|tools/*`를 삭제 후 복사하는 프로젝트가 많다. 빌드 한 번이 실행 중인 환경을 바꾼다.
   - `handstack purgecontracts`: 파일 삭제.
   - **`handstack stop`을 `--pid`/`--port` 없이 실행하면 같은 호스트의 모든 `ack`와 `dotnet` 프로세스를 종료한다**(IDE나 다른 .NET 서비스 포함). 반드시 `--pid` 또는 `--port`를 지정하고 테스트에서는 쓰지 않는다.
   - `assemblies.*`(공통 DLL 교체), Docker 볼륨 마운트.

## 호스트와 포트

기본 포트: `ack` 8421, `rdy` 8420, `forbes` 8420, `agent` 8422, `deploy` 8520. **`rdy`와 `forbes`는 기본 포트가 같아 한 호스트에서 함께 띄우면 충돌한다.** `rdy`의 `--port` 도움말은 8421이라고 쓰지만 설정 `ServerPort`(8420)가 먼저 적용된다. `rdy`는 `command`, `dbclient`, `function`, `graphclient`, `logger`, `prompter`, `repository`, `transact`, `wwwroot` 9개를 정적 결합하고 그 밖의 모듈은 동적 로드한다. 새 모듈을 `rdy`에 정적으로 결합해야 할 때만 csproj 참조와 정적 사전(`Extensions/ServiceCollectionExtensions.cs`)을 고친다. 역할과 API는 `reference/api/운영-호스트`.

## 실행

```powershell
dotnet run --project 1.WebHost/ack/ack.csproj -- --port=8421 --modules=wwwroot,transact,dbclient,function
dotnet run --project 1.WebHost/rdy/rdy.csproj -- --port=8420
handstack start --ack=%HANDSTACK_HOME%/app/ack.exe --arguments="--port=8421"    # 배포본
handstack stop --port=8421
handstack list
```

`--modules`는 `LoadModules`를 대체한다. 개발 중 필요한 모듈만 켜면 기동이 빠르고 원인 분리가 쉽다 — 화면 개발은 `wwwroot,transact,dbclient`(+`function`, `prompter` 등 사용하는 것). 옵션 전체는 `reference/api/ack-프로그램`의 "실행 옵션". `--key`는 암호화한 `--appsettings`를 복호화하는 키로, 설정 암호화 키가 아니라 ack 실행 검증 키다.

## 설정과 실시간 반영

우선순위(뒤가 앞을 덮어씀): `appsettings.json` → OS별 `appsettings.{windows|linux|macos}.json` → 환경 변수(`AppSettings__Key=값`) → `--key`/`--appsettings` 복호화 설정 또는 `appsettings.{ACK_ENVIRONMENT}.json`. 따라서 환경 파일이 환경 변수보다 우선한다(소스 순서). 전체는 `reference/api/ack-프로그램`의 "설정을 읽는 순서".

- `IsConfigurationWatching=true`일 때 반영되는 키와 **재시작이 필요한 키 목록**은 `reference/api/ack-프로그램`의 "실시간 반영과 재시작이 필요한 설정". 이 목록에 없는 변경(DLL, 새 모듈, DI·미들웨어, OS별 파일, 환경 변수)도 재시작이 필요하다.
- `RunningEnvironment`는 `D`/`S`/`P`만 지원한다. `IsEnabledDevAutoSignIn`은 개발(`D`)에서만 켠다.
- 비밀(`HostAccessID`, 각 모듈 `ManagedAccessKey`/`AuthorizationKey`/`EncryptionAES256Key`, 연결 문자열, LLM·API 키)은 소스·로그·출력에 새로 쓰지 않고 환경 변수/비밀 저장소로 주입한다. 예시는 명백한 placeholder만.

## 헬스체크·관리 API

```powershell
curl -I http://localhost:8421                       # 200
curl http://localhost:8421/checkip
curl "http://localhost:8421/diagnostics?hostAccessID=<SHA256 해시>"
```

`hostAccessID`에는 `AppSettings:HostAccessID` **평문이 아니라 그 SHA-256 소문자 16진 해시**를 보낸다(쿼리·폼·경로·헤더 순으로 찾음). 불일치는 `401`이다. 모듈 관리 API(`/{모듈}/api/*/has|refresh|retrieve|meta`)는 인증에 실패하면 `401`이 아니라 본문 없는 **`400`**을 돌려주며, 키 일치 또는 `AllowClientIP`(`*` 포함)로 판정한다. `AllowClientIP` 기본값 `*`는 개발용이며 운영에서는 좁힌다. 인증을 우회해 호출하지 않는다. 엔드포인트 목록은 `reference/api/ack-프로그램`의 "관리 엔드포인트", 모듈 API 규칙은 `reference/api/modules/transact`의 "계약 관리 API 공통 규칙". `/stop`은 인증에 실패해도 응답이 `200` 빈 본문이므로 종료 여부는 프로세스로 확인한다.

`HostAccessID`를 실시간 반영으로 바꾼 직후에는 기대 값이 달라질 수 있다(문서에 확인 필요로 표시됨). 바꾼 뒤 호출이 거부되면 재시작한다.

## 계약 반영

계약은 `ack` 시작 시 모듈의 `Contracts`에서 `contracts` 폴더로 복사될 수 있다(모듈 `module.json`의 `IsCopyContract` 기본 `true`, `IsPurgeContract` 기본 `false`). 수정이 반영되지 않으면: 서버가 읽는 경로(원본/복사본) → 파일 감시(`IsContractFileWatching`) 또는 `refresh` → 같은 ID 중복 → 재시작. 원격 동기화는 `POST /contractsync`(`AppSettings:UseContractSync=true`, 재시작 필요)이며 폼 필드는 `reference/api/ack-프로그램`의 "계약 파일 동기화".

## 빌드·배포 스크립트

파이프라인(CI/CD) 단계 설계, 배포 방식 선택(폴더 반영/업데이트 패키지/Docker), 릴리즈 기록과 롤백은 `handstack-cicd-pipeline`을 쓴다. 아래는 로컬 스크립트 요약이다.

- `env`, `install`(의존성·libman), `assemblies`(공통 DLL 재생성 — 인프라 변경 때만, diff 확인), `build`(솔루션 restore/clean 후 프로젝트 Debug 빌드), `publish`(`./publish.ps1 win publish Release x64` → `../publish/win-x64/handstack`; 대상 폴더와 `HANDSTACK_HOME/contracts`를 삭제한 뒤 패키징 — 격리된 홈에서 실행). `.ps1/.bat/.sh`의 대상 프로젝트 목록이 완전히 같지 않으므로 실제로 쓰는 OS의 스크립트를 읽고, 목록에서 빠진 프로젝트(`rdy`, `forwarder`, `node-cli` 등)는 직접 빌드해 확인한다. 현재 `publish.ps1`은 `agent`·`deploy`·`forbes` 게시가 주석 처리돼 있어 기본 산출물에 `hosts/`가 없다.
- 의존성(csproj/package.json/libman.json)을 바꾸면 `THIRD-PARTY-NOTICES.md`를 먼저 재생성한다(publish 중에는 갱신되지 않음).
- 새 프로젝트·모듈을 추가·삭제하면 `*.sln`, `ack/appsettings.json`의 `LoadModules`, `rdy` 정적 참조, `build.*`, `publish.*`, 설치 스크립트, 연계 문서를 함께 확인한다.
- 전용 .NET 테스트 프로젝트가 없는 저장소가 많다. 최소 검증은 관련 프로젝트 `dotnet build -c Debug` + 기동 후 `/checkip` + 대상 API(거래 변경은 `/transact/api/transaction/execute`로 실행 모듈까지) + 해당되면 브라우저 확인. 못 한 검증은 완료 보고에 이유와 함께 적는다.

## handstack CLI

CLI는 게시 산출물의 `tools/handstack`에 있다. 명령(`list`, `start`/`startlog`/`stop`, `configuration`, `purgecontracts`, `contractpack`, `encrypt|decrypt`, `compress|extract`, `create`, `replacetext`, `task`, `synusage`, `publickey`, `encryptcontracts`)과 옵션은 `startup/HandStack-CLI-사용법`. `contractpack`은 확장자를 **바꾸는** 명령이고 백업 ZIP은 `--options true`일 때만 만들어진다.

## 로그·장애 대응

- 로그: `${HANDSTACK_HOME}/log/app*.log`(일 롤링), Docker는 `docker logs --tail 300 -f handstack-ack`. agent는 `/logs/{targetAckId}?rows=`, `/logtree/{targetAckId}`.
- 응답 없음: `curl -I` → 프로세스/컨테이너 → 최근 로그 → 재시작. 포트 충돌: `netstat -ano | findstr :8421` 후 `--port` 변경(화면의 서버 주소·모듈 `module.json`의 내부 URL도 같이). 관리 API 401: `hostAccessID` 해시, `HostAccessID` 변경 여부. `HANDSTACK_HOME 환경변수 확인 필요`: 경로 존재·Docker `HANDSTACK_HOME_HOST` 마운트.
- 모듈이 안 올라옴: `LoadModules` 이름 = `modules/{이름}/module.json`의 `ModuleID`, `modules/{이름}/{이름}.dll` 존재, 의존 DLL 누락(첫 호출 때 드러날 수 있음 — 배포 검증에 해당 모듈 API와 동적 C# 함수 실행 포함), 새 모듈은 재시작 필요.
- 새 모듈 C# 코드를 개발하는 일은 `handstack-module-development`다.

## 문서

MCP `reference/api/ack-프로그램`, `reference/api/운영-호스트`, `startup/HandStack-CLI-사용법`, `reference/api/module.json-환경설정`, `startup/install/필수-프로그램-설치하기`, `startup/learning/ack-프로그램-가이드`, `twelvefactor/빌드-릴리즈-실행/*`(절차, 업데이트 패키지 배포, Docker ack 이미지), `startup/handsonlab/ack-배치-스크립트-만들기`. 저장소 내: `1.WebHost/*/README.md`, `4.Tool/CLI/handstack/README.md`, `PUBLISH.md`.
