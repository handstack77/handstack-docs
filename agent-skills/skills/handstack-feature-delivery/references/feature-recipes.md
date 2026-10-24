# 기능 유형별 구성

각 유형에서 **만들어야 하는 조각**과 **기능 ID 예시**. 이름은 예시이며 프로젝트 규칙을 따른다. 세부 코드는 `handstack-screen-development`/`handstack-transaction-contracts`의 참조를 본다.

## 1. 목록 조회 화면 (조회 조건 + 그리드)

| 층 | 조각 |
|---|---|
| HTML | 검색 카드(조건 컨트롤 `belongID:['LD01']`) + 그리드 카드(`syn_auigrid` `syn-datafield="DataList"`), 필요 시 `hidden` 사용자/회사 키 |
| JS | `transaction.LD01`(`Row:MainForm` → `Grid:DataList`), `frameEvent(search)`, `pageLoad` 첫 조회, `pageResizing`으로 그리드 높이, 선택 이벤트 |
| .txn | `LD01`(D, 조회 `TransactionScope false`) |
| .dbc | `LD01` SELECT + 조건 파라미터(`value="NULL"`, 빈 문자열 처리), 정렬·페이징 |
| 메뉴 | `functions`에 `search`(+필요 시 `export`/`print`) |

## 2. 마스터-디테일 (좌 목록 / 우 상세 목록) 저장

| 층 | 조각 |
|---|---|
| HTML | `row g-0` 2열, 부모 그리드 `DataList1`, 자식 그리드 `DataList2`(부모 키 숨김 열), 행 추가/삭제 버튼 `triggerConfig` |
| JS | `LD01`(부모 조회), `LD02`(`Row:DataList1` → `Grid:DataList2`, 부모 선택 시), `MD01`(`List:DataList1` + `List:DataList2`), `DD01`(`Row:DataList1`), `beforeTrigger`(부모 미선택/신규일 때 자식 추가 차단), `beforeTransaction`(자식 변경 시 부모 Flag `U`), `afterTransaction`(재조회·선택 행 복원) |
| .txn | `MD01`/`DD01` `TransactionScope true` |
| .dbc | `MD01 seq0`(부모 C/U/D), `MD01 seq1`(자식 C/U/D) — seq = inputs 순서 |

## 3. 단건 입력/수정 폼 (등록 화면)

| 층 | 조각 |
|---|---|
| HTML | 카드 폼(라벨 `input-group`), 키 `hidden`, `hidden Flag`, 필수 표시, 저장/취소 버튼(하단 액션바) |
| JS | `GD01`(`Row:MainForm` → `Form:MainForm`; 수정 모드 진입 시), `MD01`(`Row:MainForm` → `Form:Exception`), 신규/수정 모드 전환(Flag `C`/`U`), 클라이언트 검증 후 저장, 성공 시 목록 갱신/팝업 닫기 |
| .dbc | `GD01` SELECT 단건, `MD01` `<if test="(Flag == 'C')">`/`'U'`, 업무 오류는 Exception 5컬럼 |

## 4. 팝업(상세/등록) 화면

| 층 | 조각 |
|---|---|
| 호출 화면 | `showUIDialog`(별도 화면 팝업) 또는 `showDialog`(조각), 콜백에서 저장 성공 시에만 재조회 |
| 팝업 화면 | 쿼리스트링 값 읽기(`syn.$r.query`), 저장 성공 후 `parent.syn.$w.closeDialog('save')` |
| .txn | 팝업이 호출하는 서비스는 `AccessScreenID`에 팝업 화면 ID가 있어야 함(같은 TransactionID가 아니면) |

## 5. 코드도움 / 공통 코드

`syn_codepicker`/`select`의 `dataSourceID`가 가리키는 코드도움 거래(`ReturnType CodeHelp`)가 있는지 확인하고, 없으면 기존 공통 코드 거래를 재사용한다(다른 모듈 거래를 복제하지 않음). 코드 변경 후 캐시(`codeCacheClear`) 정책 확인.

## 6. 파일 첨부

`.rpo`의 RepositoryID 확인 → 메타데이터 거래(`Transaction*`) 존재 확인 → `syn_fileclient`/`syn_filedropzone` 배치 → 신규 중 임시 키 → 저장 후 업무 키로 이동 → 삭제/교체 정책. → `handstack-external-contracts`.

## 7. 외부 시스템 연계가 있는 저장

DB 저장 + 외부 API/메일/알림이면 `F` 서비스(함수)로 구현하거나 `S` 순차 거래로 잇는다. 실패 보상, 재시도, Exception 응답을 설계하고 외부 호출 테스트는 모의 대상으로 한정한다. → `handstack-function-contracts`.

## 8. 대시보드/차트 화면

`syn_chartjs`(또는 `syn_chart`)에 `Grid` 출력을 바인딩. 시리즈 열 이름과 SQL 별칭을 맞춘다. 집계 SQL은 기간·조직 조건을 파라미터화한다.
