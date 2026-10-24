---
name: handstack-feature-delivery
description: HandStack 프로젝트에서 새 업무 기능(조회·등록·수정·삭제·저장 화면과 거래·SQL 계약, 메뉴)을 처음부터 끝까지 구현하거나, 기존 기능에 필드·조회 조건·버튼·거래를 추가·변경할 때의 전체 작업 순서와 영향 범위 점검 절차. "화면 하나 만들어줘", "CRUD 추가", "게시판/목록/마스터-디테일 만들기", "컬럼 하나 추가", "조회 조건 추가", "저장 기능 붙여줘", "이 기능 수정" 같은 요청이면 개별 파일을 열기 전에 먼저 이 스킬로 계획을 세우고, 화면·거래·SQL·메뉴 스킬을 순서대로 호출한다.
---

# HandStack 기능 구현 워크플로

HandStack 기능은 **화면(HTML/JS) – 거래(.txn) – SQL/함수(.dbc/.fnc) – 메뉴**가 이름으로 이어진 한 덩어리다. 파일 하나만 고치면 다른 층이 조용히 깨진다. 그래서 구현 전에 **연결표(Contract Table)** 를 먼저 쓰고, 그 표를 기준으로 각 층을 같은 변경 단위로 수정한 뒤, 같은 표로 검증한다.

관련 스킬: 규칙·동시성·테스트 도출 `handstack-rules-and-verification` · 화면 `handstack-screen-development` · 거래/SQL `handstack-transaction-contracts` · 서버 오케스트레이션 `handstack-workflow-contracts` · 함수 `handstack-function-contracts` · 외부 연동 `handstack-external-contracts` · 프롬프트 `handstack-prompt-contracts` · 메뉴/모듈/C# 모듈 `handstack-module-development` · 서버 실행 `handstack-host-operations` · 빌드·배포 파이프라인 `handstack-cicd-pipeline` · 추적 `handstack-source-trace` · 장애 `handstack-troubleshooting`.

## 1단계 — 이해와 규약 수집 (코드 작성 전)

1. 저장소 지침(`AGENTS.md`/`CLAUDE.md`), 모듈의 `DESIGN.md`·`README.md`를 읽는다. 지침이 이 스킬보다 우선한다.
2. 요청에서 다음을 확정한다. 정보가 없고 추측하면 위험한 것만 사용자에게 묻고 나머지는 합리적 기본값으로 진행하되 가정을 보고서에 적는다.
   - 대상 모듈/업무 코드(`ProjectID`), 화면 ID(새 번호 규칙은 이웃 화면에서 확인), 화면 유형(목록 / 마스터-디테일 / 입력 폼 / 팝업).
   - 데이터: 테이블·컬럼. **DDL을 읽어서** 확인한다(프로젝트의 스키마 SQL, 기존 `.dbc`). 컬럼을 추측하지 않는다. 테이블 생성·변경은 요청 범위일 때만 하고 운영 DB에서 실행하지 않는다.
   - 업무 규칙(한도, 상태, 기간, 중복 금지 등)이 있으면 문장·경계·기준 시각을 먼저 확정한다. 조건이 여러 개이거나 동시 저장이 있으면 `handstack-rules-and-verification`.
   - 권한(누가 보고/저장/삭제), 메뉴 위치, 공통 코드·코드도움·파일 첨부 필요 여부.
3. **복제 기준 기능**을 같은 모듈에서 하나 고른다(`../handstack-source-trace/scripts/hs_inspect.py --list`로 후보를 찾고 `--screen`으로 구조 확인). 새 패턴을 발명하지 않는다. [기능 유형별 구성](references/feature-recipes.md)에서 유형을 고른다.

## 2단계 — 연결표 작성

변경을 시작하기 전에 아래 표를 작성해 사용자에게 보여 주거나 작업 메모로 남긴다. 이후 모든 수정은 이 표의 행을 기준으로 한다.

| 서비스ID | 호출 이벤트 | 입력(type:dataFieldID → 전송 필드, belongID) | SQL/함수(파일#id seq) | 파라미터 | 결과 집합 순서 → 화면 출력 | Authorize/Roles/AccessScreenID | TransactionScope |
|---|---|---|---|---|---|---|---|

작성 규칙: 연결표에 **근거 규칙 ID** 열을 더해 업무 규칙과 서비스를 연결하면 변경 영향 추적이 쉽다(규칙이 있는 기능에 한해). 서비스 ID는 이웃 기능과 같은 규칙(`L`조회 `G`단건 `M`저장 `D`삭제 `I`입력 + `D`/`F` + 두 자리 순번). 저장은 `Flag`(C/U/D) 분기 하나로 모을지 서비스를 나눌지 이웃을 따른다. 결과 집합 순서와 `Exception` 출력 위치를 이 단계에서 정한다.

## 3단계 — 구현 순서 (안쪽에서 바깥으로)

계약이 입출력 순서를 정하고 화면이 그 계약을 소비하므로 계약부터 만든다.

1. **SQL/함수**: `.dbc`(또는 `.fnc`)를 연결표대로 작성 — `handstack-transaction-contracts`/`handstack-function-contracts`.
2. **거래**: `.txn` 서비스 추가 — `CommandType`, `TransactionScope`, 접근 제어(`AccessScreenID`는 호출 화면 포함).
3. **화면 JS**: `transaction`(inputs/outputs 순서), `hook`, `event`, `method` — `handstack-screen-development`.
4. **화면 HTML**: 컨트롤의 `syn-datafield`/`belongID`(새 거래 ID 추가), 그리드 컬럼 튜플, `syn-events` 선언, 팝업 조각.
5. **메뉴/설정**: 새 화면이면 `menus.json` 등록과 `functions`/역할 — `handstack-module-development`.
6. **부수 계약**: 코드도움 거래, 파일 저장소, 프롬프트, 외부 호출이 필요하면 해당 스킬. 여러 서버 호출을 한 요청으로 엮어야 하면 `handstack-workflow-contracts`.
7. **반영 실행**: 변경한 계약·정적 파일이 서버에 반영되는 방법(복사/감시/refresh/재시작)과 빌드의 배포 부작용은 `handstack-host-operations`로 확인한다.

각 단계가 끝날 때마다 `hs_inspect.py --screen <ID>`를 실행해 ERROR가 늘지 않았는지 본다.

## 4단계 — 기존 기능 변경 시 영향 범위

[변경 영향 점검표](references/change-ripple.md)로 "필드 추가/삭제/이름 변경", "조회 조건 추가", "버튼·거래 추가", "저장 규칙 변경"마다 만져야 하는 층을 모두 확인한다. 한 층만 고치고 끝내지 않는다.

## 5단계 — 검증

1. 정적: 연결표의 모든 행에서 화면 ↔ `.txn` ↔ SQL 이름·순서·개수 일치 (`hs_inspect.py` ERROR/WARN 0 또는 설명 가능), 변경한 JS `node --check`, JSONC/XML 파싱.
2. 리뷰: [검토 체크리스트](references/review-checklist.md)로 보안(바인딩, 권한), 데이터(Flag, 트랜잭션), UX(빈 결과, 오류)를 점검한다.
3. 실행(가능할 때만, 승인된 환경): 진입 → 조회 → 선택 → 신규 → 저장 → 수정 → 삭제 → 업무 오류 → 빈 결과 → 권한 없는 사용자. 실데이터 변경은 테스트 데이터로 제한한다. 실행하지 못했다면 "정적 검증만 수행"이라고 명시한다.

## 6단계 — 보고 형식

- 변경한 파일 목록(층별), 연결표 최종본, 가정과 결정(복제 기준 기능, 접근 제어 선택).
- 검증 결과를 정적 / 실행으로 구분하고 실행하지 못한 항목과 이유.
- 사용자가 해야 할 일: 계약 반영(배포/refresh), DB 변경 적용, 메뉴 권한 설정 등.
- 기존 코드의 문제를 발견했지만 범위 밖이라 고치지 않은 것(예: 중복 id, 죽은 코드)은 별도 목록으로 알린다.

## 하지 말 것

- 컬럼·테이블·코드값을 추측해 쓰기, 운영 DB에서 DDL/DML 실행.
- 이웃 화면과 다른 임의 패턴(다른 팝업 방식, 새 CSS 클래스, 새 아이콘 폰트) 도입.
- 보안 속성(`Authorize`, `AccessScreenID`, 공개 거래)을 오류 회피용으로 완화.
- 화면 검증만으로 서버 검증을 생략, 저장 실패를 성공 알림으로 처리.
- 배포 부작용을 확인하지 않은 원본 저장소 빌드.
