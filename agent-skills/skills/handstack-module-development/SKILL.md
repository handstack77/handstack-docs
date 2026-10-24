---
name: handstack-module-development
description: HandStack 업무 모듈 프로젝트(.NET Razor Library + wwwroot 화면 + Contracts)의 구조·설정·메뉴·배포를 개발한다. 새 화면의 메뉴 등록(menus.json, functions/roles), module.json·syn.config.json·환경별 Settings, C# 모듈 코드(IModuleInitializer·ManagedController·ModuleConfiguration·모듈 간 이벤트), 모듈 csproj와 빌드 후 배포(복사/미러링), 계약·정적 파일이 서버에 반영되지 않는 문제, IDE 모듈 템플릿으로 새 모듈 만들기, 셸(main.js)과 화면의 버튼·탭 연동 요청이면 반드시 사용한다. 빌드 전에 배포 부작용을 확인하는 데에도 사용한다.
---

# HandStack 업무 모듈 통합

업무 모듈은 화면(`wwwroot/{모듈}/view/…`), 계약(`Contracts/{종류}/…`), 설정(`module.json`)을 한 프로젝트로 묶어 호스트(`ack`/`rdy`)가 로드하는 .NET 라이브러리다. 코드가 맞아도 **파일이 서버가 읽는 위치에 있고, 메뉴가 연결되고, 설정이 맞아야** 화면이 실제로 동작한다. 이 스킬은 "내가 고친 파일이 어디서 어떻게 서버까지 가는가"와 "새 화면을 메뉴에 올리는 방법"을 다룬다.

## 먼저 확인할 것

1. `AGENTS.md`/`CLAUDE.md`, 모듈 `README.md`·`DESIGN.md`. 모듈 폴더에서 `dotnet run`이 가능하다고 가정하지 않는다(라이브러리이며 호스트가 로드).
2. 식별자를 구분한다.

| 이름 | 의미 | 쓰이는 곳 |
|---|---|---|
| `ModuleID` | 모듈 폴더/어셈블리 이름 | `module.json`, 웹 경로 `/{ModuleID}/…`, `wwwroot/{ModuleID}/` |
| `ApplicationID` | 최상위 애플리케이션(예 `HDS`) | 계약 폴더 1단계, 계약 header, `syn.config.json` |
| `ProjectID` | 업무 묶음 코드 | 계약 폴더 2단계, 화면 폴더 |
| `TransactionID` | 화면·거래 ID | 파일명 |
| `DataSourceID` / `RepositoryID` | 서버 설정의 DB 원본 / 파일 저장소 | 계약 header / 화면 컨트롤 |

모듈 폴더 이름과 `ProjectID`는 다른 값이다. 서로 치환하지 않는다.

3. **적용 경로**를 확인한다: 소스 → 빌드 출력 → 런타임 모듈 폴더 → 런타임 계약 폴더. `module.json`의 `IsCopyContract`/`IsPurgeContract`, `ContractBasePath`, `WWWRootBasePath`, csproj의 복사 규칙이 경로를 결정한다. 편집해도 반영되지 않으면 서버가 읽는 파일이 어느 것인지부터 찾는다.

## 새 기능을 메뉴까지 연결하는 순서

1. 화면/계약 구현(`handstack-feature-delivery`) 후 **메뉴 파일을 실제로 확인**한다 — `wwwroot/{ModuleID}/menus.json`. 형식이 두 가지다(문서 `reference/api/menus.json-메뉴설정`): 평면 배열(`menuID/menuName/parentMenuID/menuType/functions/projectID/fileID/roles…`)과 IDE 템플릿의 데이터셋 래핑 형식(`GridData0/GridData1`, `MenuID/FolderYN/FnSearch…/DirectoryID/ItemID`). 파일이 쓰는 형식을 그대로 따르고 변환하지 않는다.
2. 항목 규칙: `menuID` 유일, 부모 연결과 깊이/정렬, 화면 경로 키(`projectID`+`fileID` 또는 `DirectoryID`+`ItemID`)가 `view/{App}/{Project}/{ID}.html`과 일치, 노출 역할(`roles`)과 기능 버튼(`functions`)이 화면의 `frameEvent('buttonCommand')` 분기와 짝.
3. 메뉴 표시 권한과 서버 거래 인가(`.txn`의 `Authorize`/`Roles`/`AccessScreenID`)는 **별개**다. 둘 다 확인한다.
4. 외부 모듈의 화면·거래를 쓰면 의존성을 문서화하고 계약을 복제하지 않는다.
5. 모듈 간 공유 코드도움(`CHP…` 류)이나 저장소(`RepositoryID`) 사용 시 해당 계약이 이 모듈 설정에 있는지 확인한다.

## 설정 파일

키 목록은 문서 `reference/api/module.json-환경설정`, 셸·`syn.config.json`·환경별 파일은 [모듈 통합 참조](references/module-integration.md)에 있다. 원칙:

- `module.json`의 비밀(접근 키, AES 키, 연결 문자열, 토큰)은 읽을 필요가 없으면 열지 않고, 열었다면 출력·로그·커밋에 복사하지 않는다. 새 키는 환경 변수/비밀 저장소로 주입한다.
- 기존 필드를 보존하고, 새 옵션은 로드·저장 경로(설정 화면 `module-settings.*`, 기본값 객체)까지 연결한다.
- `syn.config.json`은 브라우저 세션에 캐시된다. 값을 바꾸면 `SystemVersion`을 올리거나 세션 저장소를 비워야 반영된다.
- 보안 경계(`Authorize`, 공개 거래, `RequestOriginApiAccess`, 개발용 자동 로그인)를 테스트 편의로 끄지 않는다.

## 빌드·배포 부작용

- 모듈 csproj는 보통 `OutputType=Library`, `wwwroot/**`·`Contracts/**`·`module.json`을 출력으로 복사하고 `Contracts/function/**`를 `Compile`에서 제외한다. PostBuild가 환경 변수가 가리키는 런타임 폴더를 **삭제 후 다시 복사**하는 구조가 흔하다. 빌드 한 번이 실행 환경을 바꾼다.
- 따라서 검증 목적으로 원본 저장소를 빌드하기 전에 csproj의 PreBuild/PostBuild와 해당 환경 변수의 실제 값을 확인한다. 필요하면 출력 경로를 격리한 위치로 돌리고 resolved path를 출력해 확인한다. 주석 처리된 과거 배포 블록과 활성 Target을 구분한다.
- 정적 자산·계약만 바꾸는 작업은 빌드가 필요 없을 수 있다. 빌드 성공은 계약 복사·캐시 갱신·DB 접속 성공을 증명하지 않는다.
- 계약 반영: 파일 감시(`IsContractFileWatching`)가 꺼져 있으면 `refresh` API/재시작이 필요하다. 운영 상태를 바꾸는 동작이므로 대상 환경과 요청 범위 안에서만 수행한다.

## C# 모듈 코드

새 모듈의 `ModuleInitializer`, 설정 엔티티, 컨트롤러 접근 제어, 모듈 간 이벤트, 런타임 설정 반영은 [C# 모듈 코드 개발](references/csharp-module.md)을 읽는다. 호스트 기동·설정 계층·배포 스크립트는 `handstack-host-operations`다.

## 새 모듈 만들기(IDE 템플릿)

`handstack create --file=<템플릿.zip> --directory=<새 폴더> --find=<기존 이름> --replace=<새 이름>`으로 ZIP 템플릿에서 프로젝트를 만들 수도 있다. IDE의 모듈 템플릿은 `__MODULE_NAME__`, `__MODULE_PREFIX__`, `__EXAMPLE_ID1__`, `__MODULE_DESCRIPTION__` 같은 토큰을 텍스트 치환해 프로젝트를 만든다. 생성 후 실제 파일명·`module.json`의 `ModuleID`/`Version`·`menus.json`·`Settings/*.json`의 모듈 URL/포트·계약 폴더(`HDS/{PREFIX}`)가 일관된지 확인한다. 템플릿 자체를 수정하는 일은 `handstack-ide-development`다.

## 확인 순서

정적(파일 위치, JSON/XML 파싱, 메뉴↔화면 경로) → 호스트 로드(모듈 로드 로그, 정적 파일 응답) → 메뉴 진입 → 대표 거래 → 권한 → 업로드 같은 부가 기능. 소스 수정 / 복사·배포 / 호스트 로드 / DB·외부 연동 검증을 구분해 보고한다.

## 문서

MCP `reference/api/업무-모듈-개발`, `reference/api/module.json-환경설정`, `reference/api/menus.json-메뉴설정`, `reference/api/modules/wwwroot`(정적 파일·계약 경로·동기화), `reference/api/syn.config.json-환경설정`, `reference/api/modules/transact`(`RoutingCommandUri`·공개 거래), `ide/reference/파일과-저장-규칙`(메뉴 필드), `ide/reference/설정과-보안`, `startup/handsonlab/업무-모듈-배치-스크립트-만들기`.
