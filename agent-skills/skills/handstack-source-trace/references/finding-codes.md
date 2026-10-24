# hs_inspect.py 점검 코드

심각도는 "런타임에서 실패할 가능성"의 기준이다. 모든 항목은 정적 근사이므로 소스에서 확정한다.

| 코드 | 수준 | 의미 | 확정 방법·흔한 원인 |
|---|---|---|---|
| INPUT_TARGET | ERROR | 입력 `dataFieldID`에 해당하는 `<form syn-datafield>`·컨트롤·`syn_data`가 HTML에 없음 | 오타, 폼 이름 변경, 팝업 조각이 폼 밖에 있음 |
| OUTPUT_TARGET | ERROR | 출력 `dataFieldID` 대상이 없음. 런타임은 `"X" Form/Grid Output Mapping 확인 필요` 오류를 기록하고 콜백·afterTransaction 없이 끝낸다 | 컨트롤 이름 변경, 다른 화면에서 복사 |
| NO_SERVICE | ERROR | `.txn`이 있는데 화면 거래 키에 해당하는 `ServiceID`가 없음 | 서비스 누락, ID 오타, `.txn`의 다른 TransactionID 파일을 읽음 |
| NO_STATEMENT | ERROR/WARN | `CommandType`에 맞는 실행 계약에 같은 `id`가 없음(계약 파일이 아예 없으면 WARN) | `.dbc` 누락, `id` 오타, `use="N"` |
| INPUT_COUNT / OUTPUT_COUNT | ERROR | `.txn`에 `Inputs`/`Outputs`가 채워져 있는데 화면 선언 개수와 다름. 서버는 입력 개수를 계약과 비교하고, 화면은 응답 개수가 `outputs`와 다르면 오류 처리 | 서버/화면 한쪽만 수정. 빈 배열이면 자동 구성이라 검사 대상이 아님. 출력은 `BaseFieldRelation.DisposeResult: true` 항목을 뺀 개수로 비교 |
| TXN_PARSE / CONTRACT_PARSE | ERROR | `.txn`(JSONC) 또는 XML 계약 파싱 실패 | 주석·후행 쉼표는 허용되므로 그 외 문법 오류 |
| DUP_STATEMENT | ERROR | 같은 `(id, seq)`가 중복 | seq 번호 중복. 같은 id의 서로 다른 seq는 정상(다중 statement) |
| ACTION_UNDEFINED | WARN | `transactionAction('X')`가 있으나 `transaction.X`가 없음(런타임은 경고만 남기고 무시) | 거래 키 누락·오타, 죽은 코드 |
| NO_INPUT_FIELDS | WARN | SQL 파라미터가 있는데 입력 대상에 `belongID`로 해당 거래를 지정한 전송 필드가 없음 | 컨트롤 `belongID`에 거래 ID 누락. 서버 변수만 쓰는 SQL이면 정상 |
| DUP_ID | WARN | HTML `id` 중복 | 복사한 조각. 컨트롤 조회가 첫 요소만 잡아 오동작 |
| OBJECT_NAME / NO_OBJECT | WARN | `$화면ID` 객체 이름이 파일명과 다르거나 찾지 못함 | 화면 로더는 파일명으로 객체를 찾는다 |
| PARAM_NOT_SENT | INFO | SQL 파라미터 중 전송 필드에 없는 것 | `NULL` 기본값 선택 파라미터, 서버 주입값(`$` 접두 Variable), `<if>` 분기 전용이면 정상 |
| SERVICE_UNUSED | INFO | 이 화면이 참조하지 않는 `.txn` 서비스 | 다른 화면/모듈에서 `transactionDirect`로 쓰거나 코드도움 전용일 수 있다 |
| BELONG_NO_TX | INFO | `belongID` 값이 이 화면의 `transaction` 키에 없음 | 다른 화면 거래용(코드도움 등) 또는 오타 |
| CALLBACK_AFTER | INFO | 거래에 `callback`이 있음. callback이 `true`나 `null`을 반환할 때만 `hook.afterTransaction`이 호출된다 | 일반 화살표 콜백은 `undefined`를 반환하므로 afterTransaction이 호출되지 않는다 |
| EVENT_HANDLER | INFO | `syn-events`에 선언했지만 `event.{id}_{이벤트}`가 없음 | 선언만 남은 코드 |
| EVENT_NOT_DECLARED | INFO | `event.{id}_{이벤트}`는 있으나 `syn-events`에 이벤트가 없음 | **새로 만든 핸들러라면 선언 누락**. 다른 컨트롤의 `triggerConfig`가 호출하는 경우는 정상 |
| ID_PREFIX | INFO | 헝가리안 접두어 관례(`btn`/`txt`/`hdn`/`ddl`/`grd`/`dtp`/`chp`/`src`…)와 다름 | 프로젝트 관례 확인 |
| WORKFLOW_EMPTY | ERROR | `CommandType W` 서비스에 `WorkflowSteps`가 없음 | 단계 정의 누락 |
| WORKFLOW_SERVICE | ERROR/INFO | 단계의 대상 거래에 `ServiceID`가 없음(`Throws` 검증이 있는 단계는 의도된 실패라 INFO) | 단계 `TransactionProjectID/TransactionID/ServiceID` 오타 |
| WORKFLOW_TARGET | WARN | 단계의 대상 거래를 점검 범위에서 못 찾음 | 다른 루트의 계약이면 `--root`를 추가 |
| WORKFLOW_SOURCE_STEP | ERROR | `InputMappings`/`Assertions`가 앞선 단계에 없는 `SourceStepID`를 참조 | 단계 순서·ID 오타 |
| WORKFLOW_ASSERT | ERROR | 알 수 없는 `Assert` 이름 | 지원 15종 외 |
| WORKFLOW_STEP_DUP | ERROR | `StepID` 중복 | |
| CONTRACT_ONLY | INFO | 화면 파일 없이 계약만 점검 | 워크플로·API 전용 거래 |
| AMBIGUOUS | INFO | 같은 ID의 `.txn`이 여러 모듈에 있음 | `--module`로 범위를 좁힌다 |
| NO_HTML / NO_JS | INFO | 짝 파일 없음 | 팝업 조각·정적 HTML은 정상 |

## 점검기의 한계

- JS의 `transaction` 객체는 리터럴 문법을 가정한다. 거래 설정을 동적으로 생성하거나 `transactionAction({ ... })`에 객체를 직접 넘기는 코드는 놓칠 수 있다.
- `belongID`는 HTML 속성의 문자열에서 추출한다. 스크립트가 런타임에 `syn-options`를 바꾸는 경우는 보지 못한다.
- 모듈 간 호출(`transactionDirect`)은 "직접 호출" 줄로만 보여 준다. 대상 모듈의 계약은 `--screen <대상 TransactionID>`로 따로 점검한다.
- 설정 파일(`module.json`, `appsettings*.json`)과 메뉴 파일은 읽지 않는다.
- 워크플로 단계의 하위 워크플로(`W` 재귀) 순환, 매핑된 필드가 실제 결과에 존재하는지는 실행해야 알 수 있다.
