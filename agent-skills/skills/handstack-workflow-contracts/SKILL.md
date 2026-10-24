---
name: handstack-workflow-contracts
description: HandStack transact 워크플로 계약(CommandType W, Services[].WorkflowSteps)을 설계·작성·진단한다. 한 번의 호출로 여러 거래(D·G·F·P·C·하위 W)를 순서대로 실행하고, InputMappings/OutputMappings로 단계 사이 값을 전달하며, Assertions(Equal·NotEmpty·InRange·Throws 등 15종)로 단계 결과를 검증하는 서버 오케스트레이션이다. 여러 SQL/함수/프롬프트를 묶는 서버 흐름, AI 의도 분석→함수 호출 파이프라인, X-Workflow-Contract 일회성 워크플로, /transact/api/workflow/execute 호출, "Workflow 순환 호출", "StepID 실행 오류", "입력 매핑 확인 필요" 오류가 나오면 사용한다.
---

# transact 워크플로 계약 (CommandType W)

워크플로는 **서버에서** 여러 거래를 순서대로 실행하고 단계 간 값을 넘기는 계약이다. 필드·매핑·검증 15종·호출 방법·오류 문구의 대표 문서는 사이트의 `reference/워크플로-계약`(https://handstack.kr/docs/reference/워크플로-계약)이다. 이 스킬은 쓸지 말지의 판단, 작성 순서, 함정만 둔다. 문서와 서버 소스(`WorkflowController`)가 다르면 소스를 따른다.

## 쓸지 판단

| 상황 | 선택 |
|---|---|
| 한 SQL 계약 안에서 여러 문장을 한 트랜잭션으로 저장 | `.dbc` 다중 `seq` + `TransactionScope` (`handstack-transaction-contracts`) |
| 같은 모듈 안의 간단한 입출력 연결 | 순차 거래(`S`) |
| 서로 다른 실행 모듈(D/G/F/P/C)과 하위 워크플로를 섞고 중간 결과를 검증 | 워크플로 |

화면이 거래를 여러 번 호출해 이어 붙이면 왕복이 늘고 부분 실패를 다루기 어렵다. 다만 워크플로도 단계마다 별개의 요청이므로 **전체가 하나의 DB 트랜잭션으로 롤백되지 않는다.**

## 작업 순서

1. 단계로 나눌 서비스들이 이미 계약으로 존재하는지 확인한다(없으면 먼저 `handstack-transaction-contracts`/`handstack-function-contracts`/`handstack-prompt-contracts`로 만든다). 단계마다 입력 필드 이름과 결과 필드 이름을 표로 적는다.
2. 값 흐름도를 그린다: 요청 입력 → 단계1 결과 필드 → 단계2 입력 필드 …. 필드 이름이 서로 다르면 `InputMappings`의 `TargetFieldID`로 맞춘다.
3. 각 단계에 `Assertions`를 둔다(빈 결과, 필수 값, 범위). 실패 시 운영자가 원인을 알 수 있게 `Message`를 쓴다. 실패가 정상 흐름인 단계에만 `Throws`.
4. 최종 응답에 필요한 단계만 `IncludeResult: true`로 둔다.
5. 점검: `../handstack-source-trace/scripts/hs_inspect.py --screen <TransactionID>`(화면이 없어도 계약만 점검)가 단계 대상 서비스 존재, `SourceStepID` 순서, `Assert` 이름, 빈 `WorkflowSteps`를 검사한다. 실행은 승인된 환경에서 `curl`/IDE 거래 실행으로 정상·검증 실패·권한 없음 경로를 확인한다.

## 함정

- **최종 응답 `dataSet`은 마지막 단계 결과가 아니라 `IncludeResult: true`인 모든 단계의 비어 있지 않은 결과를 `{StepID}_{FieldID}`로 누적한 목록**이다. 모듈 README의 "마지막 단계 결과"는 구현과 다르다. 앞 단계 결과를 빼려면 `IncludeResult: false`.
- `OutputMappings`는 별칭을 추가할 뿐 응답 `dataSet`을 바꾸지 않는다. 이름 바꿈과 필수 값 확인용이다.
- `NotEmpty`/`Empty`/`Single`은 `Value`가 아니라 `Collection`을 읽고, `NotEmpty`는 null을 통과시킨다. null 방지는 `NotNull`을 함께 쓴다.
- 같은 이름의 필드가 여러 단계에 있으면 `SourceStepID`를 명시한다(생략=현재 단계).
- 단계가 늘수록 장애 범위가 넓어진다. 단계별 `timeout`(대상 서비스 설정), 폴백, 검증을 계약에 명시한다. 단계 안에서 데이터를 바꾸는 서비스를 여러 개 호출하면 부분 성공이 남으므로 보상 단계나 멱등성을 설계한다.
- `Authorize`/`Roles`/`AccessScreenID`는 워크플로 서비스 자체에 적용되고 각 단계의 대상 서비스에는 단계 실행 경로의 설정이 적용된다. 민감한 서비스를 워크플로로 우회 노출하지 않는지 확인한다.
- **일회성 워크플로**(`X-Workflow-Contract`)는 서버 측 임의 흐름 실행을 연다. 운영에서는 허용 범위(`DynamicWorkflowTransaction`/`DynamicWorkflowServices`)를 최소화하고 `EnforceWorkflowContractGuard`를 켠다. 설정을 사용자가 요청하지 않았는데 바꾸지 않는다.
- AI 파이프라인(의도 분류 → 함수 선택 → 실행)은 `P` 단계의 `PromptResult`를 `OutputMappings`로 다음 단계 입력에 넘기는 패턴이 샘플이다. 모델 출력은 비결정적이므로 `Assertions`로 형식을 검증하고 실패 경로를 둔다.

## 문서

MCP `reference/워크플로-계약`, `reference/거래-계약-명세`, `reference/api/modules/transact`(Workflow 실행 절). 샘플은 서버 저장소의 transact 모듈 `Contracts/transact`에 있는 워크플로 계약.
