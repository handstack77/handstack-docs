# 데이터 바인딩 규칙과 오류 해석

`syn.js`의 `tryAddFunction`/`transaction`/`transactionAction` 구현과 공식 문서(`reference/거래-호출`, `reference/concept/데이터-게더링과-바인딩`)를 대조한 내용이다. 배포된 `syn` 버전이 다르면 로더 소스를 확인한다.

## 목차
1. 거래 한 번의 흐름
2. 입력 수집(inputs)
3. 출력 바인딩(outputs)
4. 콜백과 훅의 호출 조건
5. 증상 → 원인 표
6. syn_data(메모리 저장소) 사용

## 1. 거래 한 번의 흐름

`syn.$w.transactionAction('LD01', options)`

1. `$화면ID.transaction.LD01`을 찾는다(없으면 경고 로그 후 종료). 문자열 대신 설정 객체를 넘길 수도 있으나 `functionID`가 있어야 한다.
2. `hook.beforeTransaction(transactConfig)` — `false`를 반환하면 서버 요청 없이 `afterTransaction('beforeTransaction이 false를 반환했습니다', ...)`.
3. 거래 설정을 등록(`tryAddFunction`)하며 inputs/outputs 각각의 매핑 항목을 컨트롤의 `belongID`로 계산한다.
4. 입력 수집 → 컨트롤 `validators` 검사(실패 시 `afterTransaction('validators continue false', ...)`로 중단) → 서버 요청.
5. 응답 결과 집합 개수가 `outputs` 개수와 같은지 확인 → 각 출력을 컨트롤/저장소에 반영(`hook.outputDataBinding(functionID, 응답ID, 데이터)`가 먼저 호출됨).
6. `callback` 또는 `afterTransaction` 호출(4절).

기본 옵션: `message ''`, `dynamic 'Y'`, `authorize 'N'`, `commandType 'D'`, `returnType 'Json'`, `transactionScope 'N'`, `transactionLog 'Y'`, `endpoint 'transaction'`. 이는 클라이언트의 요청 값일 뿐 서버의 인증·공개 거래 정책을 대체하지 않는다(실행은 `.txn`의 `CommandType`/`Authorize` 등이 결정).

요청의 `dataMapInterface`(예: `Row,List|Form,Grid`)는 화면의 inputs/outputs 타입 목록에서 만들어진다. 서버 `.txn`의 `Inputs`/`Outputs`가 비어 있으면 서버가 이 값으로 입출력 계약을 자동 구성한다(Row는 필수 입력 `Rejected`, 그 외는 비어도 통과 `ByPassing`).

## 2. 입력 수집(inputs)

| 입력 type | 대상 | 전송되는 것 |
|---|---|---|
| `Row` + 폼 `dataFieldID` | `<form syn-datafield="X">` 안의 컨트롤 | `syn-options.belongID`에 거래 ID가 있는 컨트롤의 현재 값. 필드명은 컨트롤의 `syn-datafield` |
| `Row` + 그리드 `dataFieldID` | `syn_auigrid` | **선택된 행 한 줄**과 그 행의 `Flag`(조회된 행은 `R`, 신규는 `C`). 선택된 행이 없으면 빈 입력이 간다. 열은 튜플 8번째(belongID)에 거래 ID가 있는 열 |
| `List` + 그리드 `dataFieldID` | `syn_auigrid` | **변경된 행만** `삭제(D) → 수정(U) → 추가(C)` 순서로 전송(`Flag` 포함, 변경 없는 `R` 행은 제외). 열 선택 규칙은 Row와 같다. 변경이 없으면 `DefaultEmpty` 한 줄 |
| `Row`/`List` + `syn_data` 이름 | 메모리 저장소 | `columns[].belongID`에 거래 ID가 있는 열 |

- `belongID`는 문자열 또는 배열이며 거래 ID와 **정확히 일치**해야 한다(대소문자 구분).
- 컨트롤 값은 컨트롤 모듈의 `getValue`가 만든다. `dataType`(`string`/`number`/`int`/`bool`/`date`)을 지정하면 서버에 그 형태로 전달되고, 숫자형이 비어 있으면 0이 전달된다.
- 그리드 컬럼 `validators`(`require`, `unique` …)는 전송 전에 검사된다. 실패하면 `afterTransaction`이 `'validators continue false'`로 호출되고 요청은 가지 않는다.
- List는 D→U→C 순서로 서버에 도착한다. 같은 키를 지우고 다시 추가하는 편집이 가능한 화면은 이 순서를 전제로 SQL을 설계한다.
- 서버가 `Flag`로 분기하는 저장 SQL은 그리드의 `Flag`를 받는다(`Flag`는 입력 계약의 필드 검사에서 예외). 폼 저장(Row)에서 Flag가 필요하면 `Flag` 필드를 가진 숨김 컨트롤을 `belongID`와 함께 둔다.

## 3. 출력 바인딩(outputs)

| 출력 type | 반영 방식 |
|---|---|
| `Form` | 응답 첫 행의 컬럼명 → 같은 `<form>` 안 컨트롤 중 `syn-datafield` 이름이 같은 것(belongID 무관). 폼 대신 `syn_data(storeType:'Form')` 이름도 가능. 컨트롤을 못 찾으면 오류 |
| `Grid` | 모든 행을 `syn-datafield`가 `dataFieldID`인 그리드/차트/목록에 채움. `syn_data(storeType:'Grid')`도 가능 |
| `Chart` | 차트 컨트롤에 채움 |
| `Dynamic` | 정의하지 않은 형태 그대로 `outputStat.dynamicData`에 보관 |

- 출력 항목에 `clear: false`를 주지 않으면 기본적으로 그리드/저장소를 비운 뒤 채운다. 이전 데이터를 유지하려면 `clear: false`.
- 한 거래에서 응답이 여러 개일 때 순서는 SQL 결과 집합의 순서(`SELECT` 순서)다. `Exception` 같은 보조 출력을 앞에 두면 이후 출력 인덱스가 모두 밀린다.
- 응답 컬럼 이름이 컨트롤 `syn-datafield`와 대소문자까지 일치해야 한다.

## 4. 콜백과 훅의 호출 조건

| 상황 | callback | afterTransaction |
|---|---|---|
| callback 미정의, 정상 | — | `(null, functionID, result, additionalData, correlationID)` 호출 |
| callback 정의, `undefined` 반환 | 호출 | **호출되지 않음** |
| callback이 `true` 반환 | 호출 | 호출 |
| callback이 `false` 반환 | 호출 | `('callbackResult가 false를 반환했습니다', functionID, …)` |
| callback이 배열 `[controlID, eventName]` | 해당 컨트롤에 이벤트 트리거 | 호출 |
| 응답 `errorText` 존재(매핑 오류 등) | 호출 안 됨 | 호출 안 됨(로그만) |
| `beforeTransaction` false | 호출 안 됨 | 오류 문자열과 함께 호출 |
| 컨트롤 validators 실패 | 호출 안 됨 | `'validators continue false'`로 호출 |

실무 권장: 거래별 후처리가 다르면 callback을, 공통 후처리(포커스 이동, 알림)가 많으면 afterTransaction을 쓰되 한 거래에 둘을 섞지 않는다. afterTransaction은 첫 인자가 `null`이 아니면 오류로 취급해 조기 반환한다.

## 5. 증상 → 원인

| 증상 | 확인 순서 |
|---|---|
| 클릭해도 요청이 안 나감 | `syn-events`에 이벤트 선언 → `event.{id}_{이벤트}` 이름 → 콘솔의 `거래 설정을 찾을 수 없습니다` |
| 요청은 가는데 서버가 빈 값만 받음 | 컨트롤 `belongID`에 거래 ID 포함 여부 → `syn-datafield` 이름 → 폼 `dataFieldID` |
| 서버가 `입력 항목이 계약과 동일한지 확인` 응답 | `.txn` `Inputs` 개수 ≠ 화면 inputs 개수, Row인데 건수 ≠ 1 |
| 응답은 오는데 화면이 비어 있음 | outputs 순서·개수 ↔ SQL 결과 집합, `dataFieldID` ↔ `syn-datafield`, 컬럼명 대소문자 |
| `기능의 거래 응답 정의와 데이터 갯수가 다릅니다` | 서버가 반환한 결과 집합 수 ≠ outputs 수(Exception 출력 포함) |
| `Form/Grid Output Mapping 확인 필요` | 출력 대상 컨트롤/저장소 없음 또는 `dataFieldID` 중복 |
| 저장은 되는데 성공 알림 없음 | callback이 `undefined`를 반환해 afterTransaction이 호출되지 않음 |
| 저장 실패인데 성공 알림 | 응답 성공만 보고 `Exception` 출력을 확인하지 않음 |
| 변경 행이 저장되지 않음 | 그리드 Flag(편집 경로를 우회해 `Flag`가 `R`로 남음), 열 belongID, 서버 SQL의 `<if test="(Flag == 'U')">` |

## 6. syn_data(메모리 저장소)

```html
<syn_data id="srcException" syn-options="{
    dataSourceID: 'Exception', storeType: 'Form',
    columns: [
        { data: 'Error', dataType: 'string' },
        { data: 'Message', dataType: 'string' }
    ]
}"></syn_data>
```

- 거래 출력의 `dataFieldID`를 `dataSourceID`로 쓰면 값이 `$this.store.Exception.Message`처럼 JS에서 읽힌다(컨트롤 없이 값만 받을 때).
- 입력에 쓸 열은 `columns[].belongID`를 지정한다. 이전 호출의 값이 남으므로 출력 후 `syn.uicontrols.$data.clear('srcException')`로 비우는 패턴이 많다.
- `storeType`은 단건 `Form`, 다건 `Grid`. 중첩(계층) 결과는 열을 `dataType: 'object'`로 선언한다.
