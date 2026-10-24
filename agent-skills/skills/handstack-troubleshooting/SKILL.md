---
name: handstack-troubleshooting
description: HandStack 화면·거래·SQL·함수·서버 문제를 증상에서 원인 계층까지 좁혀 진단한다. "조회가 안 돼요", "목록이 비어 있어요", "저장했는데 반영이 안 돼요", "화면이 404/하얗다", "거래 설정/계약을 찾을 수 없다", "요청 가능화면 오류", "입력 항목이 계약과 동일한지 확인 필요", "거래 응답 정의와 데이터 갯수가 다릅니다", "Output Mapping 확인 필요", 401/403, 수정이 반영 안 됨, 함수가 안 불림 같은 오류 메시지·증상·로그를 받으면 코드를 고치기 전에 이 스킬로 층별 원인을 확정한다.
---

# HandStack 문제 진단

HTTP 200이어도 거래 응답 본문에 오류가 있을 수 있고, 브라우저 콘솔 경고만 남기고 조용히 끝나는 경로도 있다. 그래서 **어느 층에서 처음 틀어졌는지**를 순서대로 좁힌다. 한 번에 여러 곳을 바꾸지 않는다(원인이 가려진다). 설정을 풀거나(개발자 모드, 인증 해제, 공개 거래 확대) 데이터를 지워서 증상을 없애는 것은 해결이 아니다.

## 진단 사다리

```text
① 접속/리소스  →  ② 화면 로딩/초기화  →  ③ 클라이언트 거래 설정·바인딩  →  ④ 전송·인증·권한(transact)
              →  ⑤ 계약 매핑(.txn → 실행 계약)  →  ⑥ 실행(SQL/함수/외부)  →  ⑦ 응답 → 화면 반영
```

1. **증상·재현 기록**: 화면 ID, 사용자 동작, 입력값(비식별), 시각, 환경(개발/운영), 최초 오류 문구. 같은 입력으로 재현하는 가장 짧은 절차.
2. **로그 확보**: 브라우저 Console(경고/오류, `syn.$l.eventLog` 출력)·Network(요청 본문 `DataMapInterface`/입력, 응답 본문의 `ExceptionText`·`acknowledge`), 서버 모듈 로그, 거래 이력(발생 시각 + `GlobalID`로 좁힘). 토큰·쿠키·키는 공유 전에 제거한다.
3. **층 판정**: 아래 표로 첫 실패 층을 정한다. 그 층에서 소스를 읽고(`handstack-source-trace`) 가설을 하나씩 검증한다.
4. **최소 수정 → 같은 입력으로 재시험 → 정상·빈 결과·오류 경로 확인**. 회귀 확인 후 원인과 근거를 기록한다.

## 층별 증상표

오류 문구별 발생 조건과 확인할 설정은 사이트의 `reference/거래-오류-메시지`(서버 `ExceptionText`와 화면 로더 경고)가 대표 문서다. 아래는 층을 정하는 요약이다. 서버 `SecurityHardening.SanitizeErrorText`가 켜져 있으면 응답이 `요청을 처리할 수 없습니다. 참조 ID: …`로 바뀌어 문구 검색이 통하지 않으니 참조 ID(`GlobalID`)로 서버 로그를 찾는다.

| 층 | 증상 | 원인 후보와 확인 |
|---|---|---|
| ① | 서버 접속 불가 | 호스트 프로세스 기동·포트 점유, 화면의 서버 주소 설정(포트 변경 시 같이) |
| ① | 화면 404/빈 화면 | 파일 탐색기로 직접 열지 말고 서버 URL로 접속, Network에서 404 파일 확인, 모듈 경로·대소문자, 호스트가 서빙하는 웹 루트 |
| ② | 컨트롤이 렌더링되지 않음, `pageLoad`가 안 돎 | `syn-options` 문법 오류(콘솔), 화면 객체 이름 ≠ 파일명, 스크립트 구문 오류, `pageLoad` 안 조기 `return`/예외, 컨트롤 스크립트·라이선스 라이브러리 로드. `guides/문제-해결` |
| ③ | 클릭해도 요청 없음 | `syn-events` 선언·핸들러 이름 `{id}_{event}`, 콘솔 `거래 설정을 찾을 수 없습니다`, `beforeTransaction`이 `false` 반환 |
| ③ | 서버가 빈 값만 받음, `… Input Mapping 확인 필요` | 컨트롤 `belongID`에 거래 ID 누락, `syn-datafield` 이름, 폼 `dataFieldID`, 그리드 열 `belongID`(대상 컨트롤 없음/중복) |
| ③ | 전송 전 검증 중단 | 그리드 열 `validators`(require/unique) 실패 → `afterTransaction('validators continue false')` |
| ④ | `요청 가능화면 거래 매핑 정보 확인 필요` | `.txn` 서비스의 `AccessScreenID`에 호출 화면 ID 없음(다른 화면/팝업/공용 거래 호출) |
| ④ | `인증 자격 증명 확인 필요` | 토큰 만료가 아니다. 서버 `IsPermissionRoles`가 켜진 상태에서 `PermissionRoles` 정규식(공개 경로·사용자 역할)이 요청 경로와 맞지 않음. 토큰 문제는 `거래 액세스 토큰 유효기간 만료`/`유효성 오류`/`IP 유효성 오류` 또는 `BearerToken …` 문구 |
| ④ | `역할 또는 정책 권한 확인 필요` (`앱 사용자 …` 쿠키 / `BearerToken …`) | `Roles`/`Policys`/`TransactionTokens` 세 검사가 모두 실패. 메뉴 권한과 별개 |
| ④ | `환경정보 구분코드 허용 안됨`, `애플리케이션 ID … 요청 가능 거래 매핑 정보 확인 필요` | 서버 `AvailableEnvironment`(비어 있어도 거부), `AllowRequestTransactions` |
| ④ | `제한된 거래 요청입니다.` | 테넌트 앱 경로(Referer)에서 온 호출인데 서비스 `CommandType`이 `AllowTenantTransactionCommands`(코드 기본 빈 목록, 배포 `module.json`은 `["D","G"]`)에 없음 |
| ④ | `잘못된 요청`, `요청 만료`(180초), `중복 요청` | 서버 `IsValidationRequest`(기본 꺼짐)가 켜짐 — `GlobalID`가 분산 캐시에 시딩돼야 하고 1회용이며 `System.Routes`가 비어 있어도 `잘못된 요청`. 화면 로더 경로가 아닌 직접 호출(curl 등)은 `BypassGlobalIDTransactions`나 설정 확인. `중복 요청`은 `IsValidationGlobalID`도 필요 |
| ④ | `요청 한도 초과`, `… 한도 초과(… > …)` | `SecurityHardening.RateLimit`가 `Enforce`, 또는 `MaxRoutes`/`MaxDataMapSetCount` 상한 |
| ⑤ | `거래 Transaction 입력 전문 확인 필요`, `FunctionID '…' 거래 매핑 정보 확인 필요`(`… 중복 정보`) | `.txn`이 서버에 없음(파일 위치/이름, ID 3종, 배포·refresh) / `ServiceID` 없음(오타·대소문자)·중복 |
| ⑤ | `거래 입력 항목이 계약과 동일한지 확인 필요`, `필요한 입력 항목이 필요`, `BaseFieldMappings … 매핑 정보 필요`, `출력 데이터 검증 규칙 … 확인 필요` | 명시 `Inputs` 개수·Row 건수, `Rejected` 입력 0건, 앞 statement 결과 행·컬럼, `ValidateRules` 거짓. `reference/거래-계약-명세` |
| ⑤ | `QueryID - … 매핑 정보 필요`, `DataSourceID … 데이터 원본 정보 필요` | `.dbc`의 `(id,seq)` 없음 / `<datasource>`가 서버 `DataSource`에 없음 |
| ⑤ | `StepID '…' Workflow 실행/검증 오류`, `Workflow 순환 호출`, `WorkflowSteps 확인 필요` | 워크플로 계약 — `handstack-workflow-contracts`(점검기의 WORKFLOW_* 코드) |
| ⑥ | SQL 오류(변수 선언 필요, 타입 변환), `no such table`/`Invalid object` | `<param>` 선언 누락, 빈 문자열을 숫자·날짜로 변환(`value="NULL"`=빈 문자열), 방언 문법 / 연결된 DB가 의도한 DB인가(`<datasource>`와 서버 설정) — 운영 데이터를 지워 맞추지 않는다 |
| ⑥ | 함수 `EntryType, EntryMethod 확인 필요`, 외부 호출 실패 | 클래스/네임스페이스/메서드 이름 규칙·`.fnc` 파싱 / 대상 URL·키 설정, 타임아웃, 허용 경로/호스트 allowlist(command/graph) |
| ⑦ | 응답은 오는데 화면이 비어 있음, `거래 응답 정의와 데이터 갯수가 다릅니다`, `Form/Grid/Chart Output Mapping 확인 필요` | outputs 순서·개수 ↔ 결과 집합(Exception 집합·`DisposeResult` 포함 여부), `dataFieldID` ↔ `syn-datafield`, 컬럼명 대소문자, 0행 Form은 갱신 안 됨, 출력 대상 컨트롤/`syn_data` 없음 |
| ⑦ | 저장은 됐는데 후처리가 안 돎 | callback이 `undefined` 반환 → afterTransaction 미호출, 매핑 오류는 `result.errorText`로 callback에 전달 |
| 반영 | 수정했는데 예전 동작 | 서버가 읽는 파일이 어느 것인가(원본/배포 복사본, `IsCopyContract`), 계약 캐시(refresh/감시/재시작), 브라우저 캐시, `syn.config.json` 세션 캐시(`SystemVersion`), 빌드가 덮어쓴 경우. `guides/문제-해결` |

오류 메시지 원문은 서버 모듈이 응답의 `ExceptionText`로 돌려준다. 메시지 앞의 `'ApplicationID|ProjectID|TransactionID|ServiceID'` 값을 계약과 대조하는 것이 가장 빠르다.

## 호스트·관리 API 문제

| 증상 | 확인 |
|---|---|
| 관리 API 401 / `hostAccessID` 거부 | `AppSettings:HostAccessID` **평문이 아니라 SHA-256 해시**를 전달했는지 |
| 모듈 관리 API가 400 (`401`이 아님) | `AuthorizationKey` 불일치 + `AllowClientIP`에 호출 IP/`*` 없음. 키는 로컬 호출이면 쿼리·폼·경로·헤더, 원격이면 헤더. `LockdownMetadataEndpoints`가 켜진 `transact`는 `*`만으로 통과하지 못함. 요청 출처 필터(`X-Api-Key`)는 별개 |
| 모듈이 올라오지 않음 / 새 모듈이 안 보임 | `LoadModules` 이름 = `module.json`의 `ModuleID` = DLL 이름, 재시작 필요 여부 — `handstack-host-operations` |
| 설정을 바꿨는데 그대로 | 실시간 반영 대상인지(`IsConfigurationWatching`), 재시작 필요 항목인지, OS별·환경별 파일이 덮어쓰는지 |

## 계약 존재·상태 확인 API

각 실행 모듈은 `has`/`retrieve`/`meta`/`refresh` 관리 API를 가진다(예: `/transact/api/transaction/has`, `/dbclient/api/query/has`, `/function/api/execution/has`). 파라미터(`applicationID`, `projectID`, `transactionID`, `functionID`)는 `reference/api/modules/transact`의 "계약 관리 API 공통 규칙". 접근 키·요청 출처 검사가 적용되므로 **인증을 우회하지 않는다**. 가능하면 IDE의 계약 실행/거래 이력 도구나 서버 로그를 사용하고, API 호출이 필요하면 사용자가 제공한 키·환경에서만 한다. `refresh`는 운영 캐시를 바꾸는 동작이므로 승인된 환경에서만 한다.

## 보고 형식

1. 증상과 재현 절차 2. 첫 실패 층과 근거(로그/파일:줄) 3. 원인 4. 수정(최소 변경)과 이유 5. 재시험 결과(정상·빈 결과·오류) 6. 재발 방지(검증 스크립트/체크리스트) 7. 확인하지 못한 것.

## 문서

MCP `reference/거래-오류-메시지`, `guides/문제-해결`, `ide/reference/문제-해결`, `reference/거래-호출`, `reference/api/ack-프로그램`(관리 엔드포인트), `tutorial/테스트와-디버깅/*`(`진단-도구와-계층`, `결함-재현과-원인분석`, `회귀-확인-습관`), `startup/handsonlab/debugging/*`(로그 모니터링, ack/모듈 디버깅, 함수 디버깅).
