# 자주 쓰는 계약 패턴

각 패턴은 **화면 `transaction` ↔ `.txn` 서비스 ↔ `.dbc` statement**를 한 묶음으로 보여 준다. 이름은 예시이며 프로젝트의 ID 규칙을 따른다.

## 1. 목록 조회 (L)

```javascript
LD01: { inputs: [{ type: 'Row', dataFieldID: 'MainForm' }], outputs: [{ type: 'Grid', dataFieldID: 'DataList' }] }
```

- 조건 컨트롤: `belongID: ['LD01']`. `.txn`: `LD01`, `CommandType D`, `TransactionScope false`, `Inputs/Outputs` 비움.
- `.dbc`: 조건 파라미터 `value="NULL"` + `WHERE (@X = '' OR Col = @X)` 또는 `<if test="(X != '')">`. 대용량은 `TOP`/`OFFSET`/페이징 조건을 파라미터화한다.

## 2. 단건 조회 (G) + 폼 채우기

```javascript
GD01: { inputs: [{ type: 'Row', dataFieldID: 'MainForm' }], outputs: [{ type: 'Form', dataFieldID: 'MainForm' }] }
```

키 컨트롤(보통 `hidden`)의 `belongID`에 `GD01`. 응답 컬럼명 = 폼 컨트롤의 `syn-datafield`. 결과가 0행이면 Form은 갱신되지 않는다(빈 상태 처리는 화면에서).

## 3. 폼 단건 저장 (신규/수정 구분)

```javascript
MD01: { inputs: [{ type: 'Row', dataFieldID: 'MainForm' }], outputs: [{ type: 'Form', dataFieldID: 'Exception' }] }
```

- 폼에 `hidden Flag`(`C`/`U`) 컨트롤을 두고 `belongID: ['MD01']`. 신규 진입 시 `C`, 조회 후 `U`로 바꾼다.
- `.dbc`: `<if test="(Flag == 'C')">INSERT …</if><if test="(Flag == 'U')">UPDATE …</if>` + 업무 오류가 가능하면 Exception 5컬럼 집합을 첫 출력으로.
- 서버에서 채번한 키를 화면에 돌려주려면 출력 Form에 키 컬럼을 포함하고 `belongID`와 무관하게 같은 `syn-datafield` 컨트롤을 둔다.

## 4. 그리드 일괄 저장 (List, C/U/D)

```javascript
MD01: { inputs: [{ type: 'List', dataFieldID: 'DataList' }], outputs: [] }
```

- 열 8번째 belongID에 `MD01`, 수정 전 키 열(`BeforeXxx`)을 숨김으로 포함. `.dbc`는 `<if test="(Flag == 'C')">`/`'U'`/`'D'` 세 분기. `.txn`: `TransactionScope true`, `Inputs`는 비우거나 `List`/`ByPassing`.
- 삭제를 행 `D` Flag로 처리할지 별도 `DD01`로 분리할지는 이웃 화면을 따른다(`softRemoveRowMode` 사용 여부 확인).
- 서버에는 변경 행이 삭제(D) → 수정(U) → 추가(C) 순서로 도착한다. 입력 행이 0건이면 `DefaultEmpty` 한 줄이 가고 dbclient가 건너뛴다.

## 5. 부모-자식 동시 저장

```javascript
MD01: { inputs: [{ type: 'List', dataFieldID: 'ParentList' }, { type: 'List', dataFieldID: 'ChildList' }], outputs: [] }
```

- `.dbc`: `MD01 seq=0`(부모 Flag 분기), `MD01 seq=1`(자식 Flag 분기). **seq 번호 = 입력 순서**. `.txn`: `TransactionScope true`.
- 자식이 바뀌면 부모를 같이 갱신해야 하는 업무(수정자·수정일)는 화면 `beforeTransaction`에서 부모 행 Flag를 `U`로 표시한다.
- 부모 키를 서버가 채번해 자식에 넘겨야 하면 `IgnoreResult` + `BaseFieldMappings`(문서 `reference/거래-계약-명세`의 "앞선 결과를 입력으로 전달").

## 6. 삭제 (부모 + 하위)

```javascript
DD01: { inputs: [{ type: 'Row', dataFieldID: 'ParentList' }], outputs: [] }
```

`.dbc`에서 자식 → 부모 순으로 `DELETE`(한 statement 안 두 SQL 또는 seq 분리). `TransactionScope true`. 화면은 확인 대화상자 후 호출.

## 7. 키 중복 검사 후 입력 (Exception 응답)

```javascript
ID01: { inputs: [{ type: 'Row', dataFieldID: 'MainForm' }], outputs: [{ type: 'Form', dataFieldID: 'Exception' }] }
```

`.dbc`는 `TRY/CATCH`로 INSERT 후 Exception 5컬럼을 반환. 화면 `afterTransaction`에서 `Error`가 0이면 알림과 재조회, 아니면 `Message` 표시.

## 8. 여러 결과 집합 한 번에 (조회)

```javascript
AD01: { inputs: [...], outputs: [{ type: 'Form', dataFieldID: 'MainForm' }, { type: 'Grid', dataFieldID: 'ItemList' }, { type: 'Grid', dataFieldID: 'FileList' }] }
```

`SELECT` 3개를 이 순서로 한 statement에 둔다. `.txn` `Outputs`를 명시하면 개수를 일치시킨다. 순서를 바꿀 때는 화면과 SQL을 같이 바꾼다.

## 9. 계층형 조회

문서 `reference/거래-계약-명세`의 "계층형 출력(`BaseFieldRelation`)". 부모 집합에 자식 집합을 중첩해 트리/조직도 컨트롤에 한 번에 바인딩한다. 재귀 CTE(`WITH … UNION ALL`)는 SQL Server/PostgreSQL/Oracle 문법을 따로 확인한다.

## 10. 코드도움 / 공통 코드 목록

- `ReturnType: "CodeHelp"` 서비스 + 코드도움 컨트롤(`syn_codepicker`/`select`)의 `dataSourceID`. 이 서비스는 여러 화면이 공유하므로 `AccessScreenID`에 호출 화면을 포함하거나 `Authorize`/공개 범위를 정책에 맞게 설정한다.
- 공통 코드 변경 시 클라이언트 코드 캐시가 남을 수 있다(`syn.$w.codeCacheClear()`, 서버 `cache-clear`).

## 11. 외부 연계가 섞인 저장

DB 저장 + 외부 API/파일/메일이 함께 필요하면 `CommandType F`(함수) 서비스로 구현하거나 순차 거래(S)로 잇는다. 전체 롤백이 자동 보장되지 않으므로 보상 처리와 Exception 응답을 설계한다. → `handstack-function-contracts`.
