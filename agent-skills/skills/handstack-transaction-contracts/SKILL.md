---
name: handstack-transaction-contracts
description: HandStack transact 거래 계약(.txn, 문서 예제는 .json)과 dbclient SQL 계약(.dbc, 문서 예제는 .xml)을 설계·수정·진단한다. 서비스 ID, Inputs/Outputs, ParameterHandling, BaseFieldMappings/BaseFieldRelation(계층형), TransactionScope, Authorize/Roles/AccessScreenID, statement id·seq, SQL 파라미터 type/length, Flag 기반 C/U/D 저장, 다중 결과 집합, 동적 SQL(if 조건, filters, pretreatment), 순차 거래(S) 요청이면 계약 파일을 열기 전에 반드시 사용한다.
---

# 거래(.txn)·SQL(.dbc) 계약 개발

화면이 호출한 `functionID`는 `.txn`의 `ServiceID`를 거쳐 `CommandType`에 맞는 실행 계약(D→`.dbc`의 `statement id`, F→`.fnc`의 `command id` …)으로 이어진다. 이 사슬의 이름이 한 글자라도 다르면 "계약을 찾을 수 없음" 오류가 난다. 계약을 새로 쓰거나 고칠 때는 화면(`handstack-screen-development`)과 **같은 변경 단위**로 입력/출력 순서를 맞춘다.

## 시작 전에

1. 프로젝트의 `AGENTS.md`/`DESIGN.md`/모듈 README, 그리고 같은 프로젝트 폴더의 비슷한 `.txn`/`.dbc` 한 쌍을 읽는다. 확장자는 프로젝트마다 다르다 — 서버는 `.json`/`.txn`, `.xml`/`.dbc`(`.fnc`)를 모두 읽고, `handstack contractpack`이 `.json→.txn` 식으로 이름만 바꾼다(내용 형식은 동일). 기존 파일을 다른 확장자로 바꾸지 않는다.
2. DB 종류와 데이터 원본(`<datasource>` ID)은 파일 이름이 아니라 서버 설정(`module.json`의 `DataSource`)이 결정한다. 설정 값(연결 문자열·키)을 읽거나 출력에 복사하지 않는다. SQL 문법(T-SQL/Oracle/MySQL/PostgreSQL/SQLite)은 이웃 계약과 같은 방언을 쓴다.
3. 연결 확인: `../handstack-source-trace/scripts/hs_inspect.py --screen <ID>`로 현재 상태를 보고 시작한다.

## 식별자

| 계층 | 키 |
|---|---|
| 화면 요청 | `programID(ApplicationID)/businessID(ProjectID)/transactionID/functionID` — 보통 화면 경로에서 자동으로 정해진다 |
| transact | `ApplicationID|ProjectID|TransactionID|ServiceID` (계약 파일 위치 `Contracts/transact/{App}/{Project}/{TransactionID}.txn`) |
| dbclient | `ApplicationID|ProjectID|TransactionID|{id}{seq 두 자리}` — `id="GD01" seq="0"` → `GD0100`. 화면은 `GD01`만 쓴다 |

기능 ID 관례: **기능 1자 + 실행 구분 1자 + 순번 2자**. 앞 글자는 `L`(목록 조회) `G`(단건 조회) `M`(저장) `I`(입력) `D`(삭제) `U`(수정)처럼 업무 성격을 나타내고, 두 번째 글자 `D`는 Database(함수는 `F`)다. 그 밖의 앞 글자(`A` 등)는 이웃 계약에서 의미를 확인한다. 이 관례와 실제 라우팅(`CommandType`)은 별개다 — 라우팅은 `.txn`의 `CommandType` 값이 정한다. 기존 ID(`AD01`, `G01` 등)를 요청 없이 개명하지 않는다.

## 작업 흐름

1. **연결표부터 쓴다**: 서비스 ID / 입력(type·dataFieldID·필드) / SQL statement(id·seq·파라미터) / 결과 집합 순서 / 화면 출력. 이 표가 곧 구현 명세다.
2. **`.dbc`** — [SQL 계약 규칙](references/dbc-sql.md): header, `<statement id seq>`, CDATA, `<param id type length value>`, `<if test="(Flag == 'U')">`, 다중 statement, `Exception` 결과, 안전한 동적 SQL.
3. **`.txn`** — 항목·구문은 문서 `reference/거래-계약-명세`가 대표이고, [거래 계약 점검](references/txn-contract.md)은 작성 순서·함정·체크리스트다(서비스 필드, 빈 `Inputs/Outputs` vs 명시 계약, `ParameterHandling`, 계층형 출력, 접근 제어, 순차 거래 `S`).
4. **패턴** — [자주 쓰는 계약 패턴](references/patterns.md): 목록/단건 조회, 부모-자식 저장, 삭제, ID 중복 검사 후 입력, 계층형 조회, 코드도움.
5. **정적 검증**: JSONC/XML 파싱, `(id,seq)` 중복 없음, 화면 필드·파라미터·출력 순서 대응, `hs_inspect.py` ERROR 0.
6. **실행 검증**: 서버가 읽는 계약 경로와 캐시를 확인한다(원본 → 배포/복사 → 서버 감시/refresh). 승인된 테스트 환경에서 정상·빈 결과·검증 실패·저장 롤백을 확인한다. 실행하지 못한 SQL은 검증했다고 쓰지 않는다.

## 지켜야 할 원칙

- **값은 바인딩, 식별자는 허용 목록**: 입력은 `@Param`으로 바인딩한다. 테이블명·정렬 컬럼을 사용자 문자열로 이어 붙이지 않는다. 사용자 정의 검색 조건은 `<filters>`(허용 컬럼·연산자 선언)로 받는다.
- **보안 속성을 편의로 끄지 않는다**: `Authorize`, `Roles`, `AccessScreenID`, `TransactionTokens`, 공개 거래 범위는 오류 회피 수단이 아니다. 문서의 비인증 실습 설정을 업무 계약에 복사하지 않는다.
- **원자성**: 여러 statement를 한 번에 저장하는 서비스는 `TransactionScope: true`로 둔다(같은 서비스의 seq들이 한 트랜잭션). 순차 서비스(`S`)나 외부 호출이 섞이면 전체 롤백이 자동 보장되지 않는다. 소스상 롤백은 예외일 때만이라, SQL이 오류를 `Exception` 결과로 돌려주면 같은 요청의 다른 seq 변경은 커밋된다([동시성과 원자성](references/dbc-sql.md#8-동시성과-원자성-소스-기준)). 규칙이 복잡하거나 동시 저장이 있으면 `handstack-rules-and-verification`.
- **결과 집합 순서가 계약**이다. `SELECT` 순서 = 화면 `outputs` 순서. `Exception`처럼 보조 출력을 추가하면 뒤의 인덱스가 모두 바뀐다.
- **생성/복사 파일 구분**: 서버 배포 폴더의 복사본이 아니라 소스 저장소의 원본을 수정한다. 빌드가 계약을 덮어쓰는 구조면 어떤 쪽이 원본인지 먼저 확인한다.
- 다른 실행 계약(F/C/G/P)과 저장소는 각각 `handstack-function-contracts`, `handstack-external-contracts`, `handstack-prompt-contracts`를 사용한다. 여러 거래를 서버에서 순서대로 엮고 단계 결과를 검증하는 `CommandType W`(`WorkflowSteps`)는 `handstack-workflow-contracts`다.
- 출력 가공(`Maskings`·`ValidateRules`·`FallbackTransaction`)과 인증 판정 세부는 문서 `reference/거래-계약-명세`의 "출력 가공"·"접근 제어". 권한 판정은 소스상 `Roles`·`Policys`·`TransactionTokens`가 OR로 결합되고 미지정 항목이 통과로 시작하므로, 역할 제한은 반드시 실제 거부 테스트로 확인한다.

## 문서 확인

`handstack-docs` MCP: `reference/거래-계약-명세`(거래 계약 항목), `reference/api/modules/transact`(라우팅·공개 거래·요청 출처 검증), `reference/api/modules/dbclient`(계약·식별자·`<filters>`·공급자별 타입), `reference/거래-호출`, `startup/handsonlab/게시판-프로젝트-시작하기`(CRUD ID 규칙), `startup/handsonlab/계층형-데이터-조회하기`, `tutorial/transact-거래계약/*`, `tutorial/dbclient-SQL계약/*`. 없으면 `https://handstack.kr/docs/<id>`. 로컬 소스와 문서가 다르면 서버 모듈 소스(`TransactionController`, `TransactClient`, `QueryDataClient`)를 확인한다.
