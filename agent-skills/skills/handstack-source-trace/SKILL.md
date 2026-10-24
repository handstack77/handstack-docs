---
name: handstack-source-trace
description: HandStack 화면(HTML·JS)에서 transact 거래(.txn)와 SQL·함수 계약(.dbc·.fnc)까지 호출 경로를 추적하고 화면-계약 불일치를 진단한다. "이 버튼이 어떤 SQL을 타나", "저장하면 어디에 들어가나", "이 컬럼을 바꾸면 어디가 영향받나", "조회가 비어 있다", 화면/거래 구조 설명, 변경 영향 분석, 누락·불일치 계약 점검 요청이면 코드 수정 전에 반드시 이 스킬을 먼저 사용한다.
---

# HandStack 소스 흐름 추적

HandStack은 화면·거래·SQL을 **이름으로** 연결한다(`syn-datafield`/`belongID` ↔ `transaction` ↔ `ServiceID` ↔ `statement id`). 컴파일러가 연결을 검사해 주지 않으므로, 한 곳을 고치기 전에 연결표를 먼저 만들어야 다른 곳이 조용히 깨지지 않는다. 분석 요청에는 제품 파일을 고치지 않는다.

## 1. 맥락 확인

1. 저장소 루트의 `AGENTS.md`/`CLAUDE.md`, 모듈의 `DESIGN.md`·`README.md`를 읽는다. 프로젝트 규약이 이 스킬의 일반 규칙보다 우선한다.
2. 식별자 4가지를 구분한다. 폴더/모듈 이름(`ModuleID`)과 업무 코드(`ProjectID`)는 서로 다른 값이다.

| 값 | 어디서 오나 | 예 |
|---|---|---|
| ApplicationID | 화면: `syn.config.json`의 `ApplicationID`(경로가 아님). 계약: header·폴더 1단계 | `HDS` |
| ProjectID | 화면: URL에서 **파일 바로 앞 폴더**(없으면 `syn.config.json`의 `ProjectID`). 계약: header·폴더 2단계 | `BOD` |
| TransactionID | 화면: 스크립트 객체 이름 `$BOD010`(= 파일명). 계약: 파일명·header | `BOD010` |
| ServiceID / statement id | `.txn`의 `ServiceID`, 화면 `transaction` 키, SQL의 `id` | `LD01` |

같은 화면 ID가 여러 모듈에 있을 수 있다. 모듈을 특정하지 못하면 후보를 모두 보여 주고 묻는다.

## 2. 점검기 실행(읽기 전용)

`scripts/hs_inspect.py`는 Python 3.10+ 표준 라이브러리만 쓰며 코드·SQL·HTTP를 실행하지 않고 `module.json` 같은 설정 파일을 읽지 않는다.

```text
python <skill-dir>/scripts/hs_inspect.py --root <프로젝트 루트> --list                 # 화면 ID 목록
python <skill-dir>/scripts/hs_inspect.py --root <프로젝트 루트> --screen BOD010        # 연결표 + 불일치
python <skill-dir>/scripts/hs_inspect.py --root <루트> --module <모듈폴더> --screen X --verbose
python <skill-dir>/scripts/hs_inspect.py --root <루트> --screen X --json --fail-on ERROR
```

출력의 표는 `서비스 | 입력(type:dataField=전송 필드) | 출력 순서 | 실행(.dbc#id seq) | callback`이다. 점검 코드의 의미와 오탐 판단은 [점검 코드 해설](references/finding-codes.md)을 읽는다. 결과는 정규식 기반 근사치이므로 ERROR도 소스를 직접 열어 확정한 뒤 보고한다.

## 3. 수동 추적 순서

점검기가 못 보는 부분(동적 호출, 설정 오버라이드, 외부 모듈)은 직접 읽는다.

1. **HTML**: `<form syn-datafield>`, 컨트롤의 `syn-datafield`·`syn-options.belongID`·`syn-events`, 그리드 `columns` 튜플의 8번째(belongID), `syn_data`, 팝업 조각.
2. **JS**: `$화면ID`의 `transaction`(inputs/outputs 순서), `hook`(`beforeTransaction`·`afterTransaction`·`outputDataBinding`), `event`, `method`. 호출 방식을 구분한다 — `transactionAction`, `transactionDirect`(다른 업무의 거래를 직접 호출), `transactionExchange`, 컨트롤의 `transactConfig`/`triggerConfig`, 일반 HTTP.
3. **.txn**: 서비스의 `CommandType`(`W` 워크플로의 단계 대상은 `WorkflowSteps`를 따라가고, `R`은 서버 더미 파일 응답), `Inputs`/`Outputs`(비어 있으면 화면이 보낸 `dataMapInterface`로 서버가 자동 구성), `Authorize`·`Roles`·`AccessScreenID`·`TransactionTokens`, `TransactionScope`, 순차 서비스 `S`.
4. **실행 계약**: D는 `.dbc`의 `(id, seq)`와 `<param>`·`<if test>`, F는 `.fnc`의 command/script, C/G/P는 각 계약.
5. **반환 → 화면**: 결과 집합의 순서 ↔ `outputs` 순서(개수가 다르면 런타임 오류), 컬럼 이름 ↔ 컨트롤 `syn-datafield`, `Exception` 출력이 있으면 업무 오류와 통신 오류를 따로 추적.
6. **주변 의존**: 메뉴(`menus.json`)·코드도움(`syn_codepicker`의 `dataSourceID`)·파일 저장소(`repositoryID`)·다른 모듈 거래 호출·배포 경로.

## 4. 보고 형식

`이벤트 → 화면 거래(입력) → .txn 서비스 → 실행 계약(SQL/함수) → 반환 순서 → 화면 출력`을 파일 경로와 줄 번호로 제시한다. 입력 필드↔SQL 파라미터↔출력 컬럼 대응은 표로 정리한다. 반드시 구분해 적는다:

- 확인한 것(파일을 읽음) / 추정한 것(정규식·이름 규칙) / 확인하지 못한 것(동적 호출, 외부 모듈, 실제 실행)
- 비활성 코드(`pageLoad` 조기 `return`, 주석 처리된 호출)와 실제 호출 경로
- 설정 파일의 키·연결 문자열·사용자 데이터는 출력에 복사하지 않는다.

## 5. 문서 확인

`handstack-docs` MCP가 연결되어 있으면 `search_docs`로 API·식별자를 검색하고 `get_doc`으로 필요한 섹션만 읽는다(도구 이름 접두어는 클라이언트마다 다르다). 먼저 볼 문서: `reference/식별자와-파일-경로`, `reference/거래-호출`, `reference/concept/데이터-게더링과-바인딩`. 연결이 없으면 `https://handstack.kr/docs/<문서 id>`와 현재 소스를 근거로 삼고, MCP로 확인했다고 쓰지 않는다. 문서 예제의 확장자(`.json`/`.xml`)와 프로젝트의 실제 확장자(`.txn`/`.dbc`)가 다를 수 있으니 일괄 치환하지 않는다.
