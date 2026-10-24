# 변경 영향 점검표

변경 종류마다 **모든 층**을 확인한다. ☐는 해당하면 수정, 해당하지 않으면 "영향 없음"을 확인한 것이다.

## A. 필드(컬럼) 추가

☐ DB: 컬럼/제약 존재(DDL 확인 — 없으면 요청 범위일 때만 추가)
☐ 조회 SQL(`LD`/`GD`): `SELECT` 목록에 추가, 별칭 = 화면 필드 이름
☐ 저장 SQL(`MD`/`ID`): `INSERT` 컬럼·값, `UPDATE SET`
☐ `<param>`: 새 `@Field` 선언(type/length/value), 숫자·날짜 빈 값 처리
☐ 화면 HTML: 입력 컨트롤 `syn-datafield="Field"` + `belongID`에 저장/조회 거래 ID, 그리드면 열 튜플(숨김/읽기전용/belongID)
☐ 화면 JS: 검증, 기본값, 신규 행 초기값, `beforeTransaction` 보정, 출력 후처리
☐ `.txn`: 명시 `Inputs/Outputs`/`Models`가 있으면 필드 반영(빈 배열이면 불필요)
☐ 다른 소비자: 같은 SQL을 쓰는 다른 화면/함수/보고서, 코드도움 결과 컬럼
☐ 권한/마스킹: 개인정보 컬럼이면 로그 마스킹·접근 제어

## B. 필드 이름 변경 / 삭제

☐ 위 A의 모든 위치를 `grep`으로 찾는다(HTML `syn-datafield`, JS `getDataAtCell('…','Field')`, `.dbc` 별칭/`@Field`/`<if test>`, 보고서 템플릿)
☐ 이름 변경 시 서버(SQL 별칭)와 화면(컨트롤·열)을 **같은 변경에서** 바꾼다. 한쪽만 바꾸면 빈 값이 전송/표시된다
☐ 삭제 시 `Flag` 분기와 수정 전 키(`BeforeXxx`) 의존 확인

## C. 조회 조건 추가

☐ HTML 컨트롤 + `belongID:['LD01',…]`
☐ `.dbc` 파라미터 + `WHERE` 조건(`<if test="(Cond != '')">` 또는 `(@Cond = '' OR …)`), 인덱스/성능
☐ 초기값/기본값(날짜 범위 `value:'month:-1'`), 엔터키 조회 이벤트(`syn-events` + `event`)
☐ 여러 조회 거래가 같은 조건 폼을 쓰면 각 거래 ID를 belongID에 추가

## D. 버튼/거래 추가

☐ `.dbc` statement + `.txn` 서비스(`TransactionScope`, 접근 제어)
☐ JS `transaction` 항목 + `event`/`method` + `afterTransaction` 분기
☐ HTML 버튼 `id` 접두어, `syn-events` 선언, 셸 버튼이면 `actionButtons`/`functions`
☐ 확인 대화상자(삭제/되돌릴 수 없는 작업), 진행 표시, 중복 클릭 방지
☐ 메뉴 `functions`, 역할 노출

## E. 저장 규칙 변경 (검증·상태 전이)

☐ 서버(SQL/함수) 검증이 단일 진실 — 화면 검증은 보조
☐ 업무 오류 → `Exception` 집합, 화면 `afterTransaction`에서 `Error` 판정과 메시지 표시
☐ `TransactionScope`, 다중 `seq`의 순서/키 전달(`BaseFieldMappings`)
☐ 상태 코드 → 색/문구 매핑(배지)과 목록 필터

## F. 결과 집합 추가/순서 변경

☐ SQL `SELECT` 순서와 화면 `outputs` 순서 동시에 변경
☐ `.txn` 명시 `Outputs`가 있으면 개수 갱신(`DisposeResult` 제외 개수가 화면 outputs 개수)
☐ `Exception` 집합이 앞에 있으면 이후 인덱스 이동 확인
☐ 같은 서비스를 호출하는 다른 화면(`transactionDirect` 포함) 영향

## G. 화면 ID 이름 변경 / 복제

☐ HTML·JS 파일명, 객체 이름 `$ID`, `.txn`/`.dbc`/`.fnc` 파일명과 header `<transaction>`, 계약 내부 `TransactionID`
☐ `AccessScreenID` 목록의 다른 계약, 메뉴 `fileID/ItemID`, `transactionDirect` 호출처, 팝업 URL
☐ 복제한 화면은 `syn-datafield`/`belongID`/거래 ID가 기존 화면 것과 충돌하지 않는지, 복사 잔여물(DUP_ID) 확인

## 검증 도구

```text
python <source-trace-skill>/scripts/hs_inspect.py --root <루트> --screen <ID> --verbose
```

변경 전후 출력을 비교해 새 ERROR/WARN이 없는지 확인하고, 연결표(서비스별 입력 필드 목록)가 의도한 대로 바뀌었는지 본다. `grep`으로 이름 변경의 잔여 참조를 확인한다.
