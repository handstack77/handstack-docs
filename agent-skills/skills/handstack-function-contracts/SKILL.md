---
name: handstack-function-contracts
description: HandStack 서버 함수(CommandType F)를 개발·수정·진단한다. .fnc(또는 featureMain.cs/js/py + featureMeta.json 폴더형) 계약의 C#·Node.js·Python script, command/param, featureSQL, entryType/entryMethod, referenceModuleID, Exception 결과 테이블, 외부 API·파일·메일 연동 함수, 단순 SQL로 끝나지 않는 계산·연계 로직을 서버에 추가하는 요청이면 반드시 사용한다. 함수가 호출되지 않거나 수정이 반영되지 않는 문제도 이 스킬로 진단한다.
---

# HandStack 서버 함수 계약

SQL만으로 끝나지 않는 업무(외부 API, 파일, 계산, 여러 DB 조합)는 `CommandType: "F"` 서비스로 `function` 모듈의 C#/Node.js/Python 함수를 실행한다. 호출 사슬은 `화면 transaction 키 → .txn ServiceID(F) → 함수 계약의 command id → 함수 본문 → 결과 테이블`이다.

## 먼저 확인

1. 형식이 두 가지다. 같은 프로젝트의 기존 함수를 보고 맞춘다.
   - **단일 계약 파일** `Contracts/function/{App}/{Project}/{TransactionID}.fnc` — XML 안에 `<script><![CDATA[…]]></script>`와 선택 `<featureSQL>`을 둔다. 서버가 저장 시 `{TransactionID}.g.cs|.g.js|.g.py`, `.g.featureSQL`을 **생성**한다.
   - **폴더형** `…/{TransactionID}/featureMain.cs|js|py` + `featureMeta.json`(+`featureSQL.xml`) — 공식 문서 예제의 형식.
   같은 ID를 두 형식으로 중복 만들지 않는다(폴더형이 우선 로드되는 경로가 있다). 생성된 `.g.*` 파일은 수정해도 다음 생성 때 덮어써지므로 **원본(.fnc/featureMain.*)** 만 고친다. IDE 파일 트리는 `.g.*`를 숨기는 것이 정상이다.
2. 대응하는 `.txn` 서비스(`CommandType F`)와 호출 화면의 `transaction` 키, 출력 개수·순서를 읽는다(`handstack-transaction-contracts`, `handstack-source-trace`).
3. 서버 설정(`FunctionSource`: 데이터 원본·작업 디렉터리, Node/C#/Python 런타임 옵션, 파일 감시)은 값을 읽거나 복사하지 않고 **존재만** 확인한다.

## 진입점 규칙

계약 형식(header·command·param), 언어별 진입점(C# 클래스·메서드 이름, Node 4인자, Python 클래스), `Exception` 출력, featureSQL은 사이트 문서 `reference/api/modules/function`의 "단일 파일 계약 (.fnc)" 절이 대표다. 이 스킬은 작업 순서와 함정만 둔다. 반드시 지킬 것:

- 진입점 이름은 header의 `<project>`/`<transaction>`과 `command id`로 정해진다. 다른 클래스·메서드를 쓰려면 `entryType`과 `entryMethod`를 **둘 다** 채운다.
- 오래된 Node 함수의 4번째 인자 `isTransaction`은 실제로는 `dataContext`다.
- `isHttpContext`가 `true`이면 클래스에 `HttpContext`를 받는 생성자가 있어야 한다.

## 구현 원칙

- **입력**: `<param id type length value required>`로 선언한 이름이 호출 화면의 필드 이름(보통 `@` 없음)이다(`required`는 메타데이터일 뿐 실행 시 강제되지 않는다). 값 접근은 C# `dynamicParameters.Value("Name").ToStringSafe()`, Node `$array.getValue(parameters, 'Name')`. 필수값은 함수 안에서 검증한다.
- **출력**: 결과 테이블 **순서와 개수**가 화면 `outputs`와 같아야 한다. `Exception` 테이블을 먼저 내보내는 서비스는 빈 결과·정상·실패 모두에서 같은 구조를 유지한다(문서 `reference/api/modules/function`의 "Exception 출력").
- **오류 처리**: 업무 오류는 Exception 테이블로, 시스템 오류는 로그 + Exception(`Error`/`Level`/`Message`/`TypeMember`). 응답에 토큰·연결 문자열·전체 개인정보를 싣지 않는다. Node는 `callback`을 **정확히 한 번** 호출한다(누락하면 요청이 멈추고, 두 번 호출하면 중복 응답).
- **외부 접근**: HTTP/파일/프로세스 호출은 서버 권한으로 실행된다. 대상 URL·키는 설정(`functionHeader.Configuration` 등)에서 읽고 코드에 넣지 않는다. 타임아웃을 지정한다.
- **DB 접근**: 함수 안에서 SQL이 필요하면 `<featureSQL>`(MyBatis형 `select/insert/update` id)을 선언하고 Node `syn.$s.executeQuery(moduleID, 'L01', params, cb)`로 호출한다. 단순 CRUD는 함수가 아니라 `.dbc` 서비스가 맞다.
- C# 샘플의 `using DataSet result = new …; return result;`처럼 반환 객체를 해제하는 코드를 복사하지 않는다. 반환 뒤 해제된 객체에 의존하는지 실제 호출 결과로 확인한다.
- 비활성 코드, 복사된 namespace, 사용하지 않는 `using`을 새 함수의 관례로 따라 하지 않는다.

## 검증과 반영

- `.fnc`: XML 파싱(CDATA 경계), `command id` ↔ 메서드/키 이름, 파라미터 선언 ↔ 사용, 결과 테이블 순서.
- 동적으로 컴파일되는 C# 함수는 모듈 csproj가 `Contracts/function/**`를 `Compile`에서 **제외**하는 경우가 많다. 모듈 빌드 성공은 함수 컴파일 성공을 뜻하지 않는다. 서버가 계약을 로드하고 실제로 실행해 정상·실패·빈 결과를 확인해야 한다.
- 컴파일된 C# 어셈블리는 **파일 경로 단위로 캐시**된다. 같은 프로세스에서는 계약 갱신(refresh/파일 감시/재시작) 없이는 이전 컴파일 결과가 쓰일 수 있다. 메서드는 public/비공개·인스턴스/정적 모두 찾지만 `entryType`·`entryMethod` 이름이 일치해야 한다.
- 수정이 반영되지 않으면 순서대로: ① 원본 저장 및 `.g.*` 생성 여부 ② 서버가 읽는 계약 경로(배포 복사 여부) ③ 같은 ID의 중복 계약(폴더형 vs 단일) ④ 계약 캐시(`refresh`/감시/재시작).
- Node의 외부 패키지(axios, qs 등)는 서버 Node 환경에 설치돼 있어야 한다. 새 패키지를 쓰려면 배포 단위를 검토한다.
- 파일 감시(`EnableFileWatching`)는 개발 편의 설정이다. 운영 반영 절차를 임의로 바꾸지 않는다.

## 문서 확인

`handstack-docs` MCP: `reference/api/modules/function`(계약·식별자·설정), `reference/concept/서버리스-Function`, `startup/handsonlab/debugging/function/CSharp-함수-디버깅하기`·`Node.js-함수-디버깅하기`·`Python-함수-디버깅하기`, `ide/reference/문제-해결`(생성 파일). 문서의 폴더형 예제를 현재 단일 `.fnc` 프로젝트에 그대로 적용하지 말고 서버 모듈의 `FunctionMapper` 파서를 확인한다.
