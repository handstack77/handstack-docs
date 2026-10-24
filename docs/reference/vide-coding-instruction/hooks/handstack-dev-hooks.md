# handstack-dev-hooks

HandStack 개발 훅 (Hooks for HandStack Dev)

이 문서는 두 가지를 구분해서 설명합니다. 1) AI 코딩 도구(Claude Code)의 훅으로 개발 생산성을 높이는 방법, 2) 화면 JS의 `hook` 객체가 가진 **런타임 생명주기 훅**입니다. 둘은 이름만 같을 뿐 별개입니다.

## 1. 개발 도구 훅

Claude Code의 훅은 도구 호출 전후에 명령을 실행하는 기능입니다. 설정 형식은 Claude Code 버전에 따라 달라질 수 있으므로 Claude Code 공식 문서로 현재 형식을 확인하세요(이 폴더의 `hooks.json`은 예전 형식 예시이며 현행 형식과 다를 수 있습니다).

HandStack 프로젝트에서 유용한 용도는 다음과 같습니다.

- **계약 파일 문법 검사**: 편집한 `contracts/dbclient/**/*.xml`·`*.dbc`가 올바른 XML인지(`xmllint --noout`) 저장 직후 확인합니다.
- **화면-거래-SQL 연결 점검**: 화면 JS를 고친 뒤 화면의 `transaction` 키가 거래 계약과 SQL 계약에 있는지 확인합니다. 이 점검은 HandStack 스킬의 `hs_inspect.py`가 합니다([점검 도구](/docs/guides/ai/점검-도구)).
- **위험 편집·명령 차단**: 보호 경로 편집이나 위험 명령(`purgecontracts`, 인자 없는 `handstack stop` 등)을 승인 없이 막는 훅은 [AI 에이전트로 개발하기](/docs/guides/ai/개발자-가이드)의 "안전장치: 훅과 보호 경로"와 `agent-skills/guides/templates/hooks`의 `protect_paths.py`, `deploy_gate.py`를 보세요.

## 2. 화면 런타임 훅 (JS의 `hook` 객체)

화면 객체의 `hook`은 `syn.js` 로더가 화면 생명주기와 거래 전후에 호출하는 함수입니다. 시그니처는 `syn.js` 소스 기준입니다.

| 훅 | 호출 시점 | 인자와 용도 |
|---|---|---|
| `pageLoad()` | 화면 로드 직후 | 초기 조회(`LD01`) 등 |
| `pageResizing(dimension)` | 업무 셸이 화면 크기 변경을 알릴 때 | 그리드 높이 조절. 호출 주체는 브라우저가 아니라 셸의 `main.js`이므로 팝업이나 단독 창에서는 호출되지 않습니다 |
| `beforeTransaction(transactConfig)` | 거래 전송 직전 | 거래 설정 조작이나 검증. `false`를 반환하면 전송을 취소하고 `afterTransaction`이 호출됩니다 |
| `afterTransaction(error, functionID, responseData, additionalData, correlationID)` | 서버 응답 후, 또는 취소·검증 실패 시 | `error`가 비어 있으면 성공. 결과 알림과 UI 갱신. 취소된 경우 `error`에 사유 문자열이 들어옵니다 |
| `beforeTrigger(triggerID, action, configParams)` | 컨트롤 트리거 동작 직전 | `false`를 반환하면 동작을 취소합니다 |
| `afterTrigger(error, action, result)` | 트리거 동작 후 | `error`와 `{ elID, result }` |
| `frameEvent(eventName, payload)` | 셸·로더가 보내는 이벤트(`buttonCommand`, `beforeSubmit`, `tabOrderControls`, `transactionException`, `transactionError` 등) | 셸 버튼(`buttonCommand`의 `actionID`)을 화면 동작에 연결 |

훅 호출 순서와 `callback`과의 관계는 [화면 스크립트 구조](/docs/tutorial/화면동작과-거래연결/화면-스크립트-구조)와 [화면 JavaScript 작성 지침](/docs/information/resource/HandStack-화면-JavaScript-작성-지침)이 정본입니다.
