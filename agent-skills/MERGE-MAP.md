# 문서·스킬 병합 매핑표 (초안)

`agent-skills/`의 스킬·가이드와 `docs/`의 겹치는 부분을 한 곳으로 모으기 위한 판정표입니다. 2단계 이후의 작업 목록으로 쓰며, 항목을 처리할 때마다 상태를 갱신합니다.

**근거 수준**: 파일·절 제목, 문서 크기, 키워드(`docs/` 대 `agent-skills/`) 대조까지만 했습니다. 줄 단위 대조와 소스(`C:\projects\handstack77\handstack`) 확인은 각 항목을 처리할 때 합니다. 처리 전에는 아래 판정을 확정으로 읽지 마세요.

## 판정 기준

| 판정 | 뜻 | 처리 |
|---|---|---|
| 유지 | 스킬 고유의 절차·점검·함정. 문서에 같은 역할의 내용이 없음 | 스킬에 두고, 값과 구문은 대표 문서를 인용 |
| 병합 | 대표 문서에 같은 내용이 이미 있음 | 스킬 쪽을 줄이고 인용으로 대체. 차이가 있으면 소스로 확인해 한쪽에 맞춤 |
| 이동 | 대표 문서에 없는 구문·명세. 스킬에만 있음 | 대표 문서에 새 절 또는 문서를 만들고 스킬은 인용 |
| 도구 | 실행 파일과 그 테스트·해설 | `agent-skills/`에 유지. 사용법 문서는 `guides/ai/`에서 안내 |

## 새로 확인한 겹침: `reference/vide-coding-instruction`

사이트에는 이미 "AI 활용 자료"(`docs/reference/vide-coding-instruction/`, 사이드바 `AI 활용 자료`)가 있습니다. 에이전트·명령·훅·규칙·스킬·예시 파일(`examples/AGENTS.md`, `CLAUDE.md`, `HANDSTACK.md`)을 담고 있어 `agent-skills/`와 주제가 겹칩니다.

- 범용 자료(코딩 표준, TDD, 보안 검토, 직무별 역할 설명 등)는 HandStack 고유가 아니므로 이 작업의 대상이 아닙니다. 그대로 둡니다.
- HandStack 고유 파일 5개는 스킬과 내용이 겹칩니다. 아래 "충돌" 표에서 다룹니다: `skills/handstack-patterns.md`, `rules/handstack-rules.md`, `agents/handstack-developer.md`, `commands/handstack-scaffold.md`, `examples/HANDSTACK.md`.
- 프로젝트 지침 예시가 `examples/AGENTS.md`, `CLAUDE.md`, `HANDSTACK.md`와 `guides/templates/AGENTS.md`로 4벌입니다. 한 벌의 템플릿으로 합칩니다.
- 기존 주소는 유지합니다(`CONTRIBUTING.docs.md`의 주소 유지 원칙). 합치더라도 삭제하지 않고 이동 안내를 남깁니다.

## 충돌과 해결 결과

| 번호 | 내용 | 확인된 사실 | 해결 |
|---|---|---|---|
| C1 | 계약 파일 확장자 | 모듈마다 기존 확장자와 모듈별 확장자를 모두 읽음(`ModuleConfiguration.ContractFileExtensions`). 쌍은 내부 형식이 같음(커밋 `690bef9a`, 2026-07-10). 스킬은 모듈별 확장자(`.txn`/`.dbc`), 문서 예제는 기존 확장자(`.json`/`.xml`) | **해결.** `reference/식별자와-파일-경로`에 "계약 확장자" 절(모듈별 쌍 표)을 추가했다. 스킬의 `txn-contract.md` 1절은 이미 같은 설명이라 변경 없음 |
| C2 | 서비스 ID 접두어의 뜻 | 소스 샘플 계약을 집계하면 둘째 글자가 `CommandType`과 일치(`D`·`G`·`F`·`P`). 첫 글자는 `G`·`L`·`I`·`U`·`D`·`M`. 서버는 접두어를 해석하지 않음. 구버전 규칙 문서는 `LD`를 Load로 설명 | **해결.** 같은 문서에 "서비스 ID 접두어 관례" 절을 추가하고, `vide-coding-instruction/rules/handstack-rules.md`를 이에 맞게 수정 |
| C3 | 파일 경로 구조 | `vide-coding-instruction`의 HandStack 고유 파일 7개가 특정 프로젝트의 `src/view/…`, `src/Contracts/…` 구조와 그 프로젝트의 화면 ID를 사용. 실제 샘플은 `contracts/wwwroot/HDS/BOD/BOD010.js`, `contracts/dbclient/HDS/BOD/BOD010.xml` | **해결.** 7개 파일의 경로·예시 ID를 대표 문서 기준(`BOD010`)으로 바꾸고, 기준 문서 안내를 넣었다. DBMS를 SQL Server로 한정한 문구도 정정 |
| C4 | 프로젝트 지침 4벌 | `examples/AGENTS.md`, `examples/CLAUDE.md`는 대표 문서와 일치하는 최신 템플릿. `examples/HANDSTACK.md`는 코드 스타일 예시. 번들의 `templates/AGENTS.md`는 스킬·점검 도구용 짧은 보충본 | **해결.** 대표는 `examples/AGENTS`·`examples/CLAUDE`. `HANDSTACK.md`에 역할 안내를 넣고, 번들 템플릿 머리말에서 대표 템플릿과 합쳐 쓰도록 안내 |

남은 일: `vide-coding-instruction`의 HandStack 고유 파일(`handstack-patterns`, `HANDSTACK.md`의 코드 예시)과 화면 작성 지침의 내용 중복은 아래 "병합" 항목에서 줄인다.

## docs에 없던 내용 (이동 결과)

`grep` 건수(`docs/` 대 `agent-skills/`)로 확인한 공백입니다. 처리 결과는 다음과 같습니다. 워크플로는 `transact` 모듈 문서에 개요 절이 있었지만 계약 항목 명세는 없었습니다.

| 항목 | 처리 | 대표 문서 |
|---|---|---|
| 워크플로 `CommandType W`, 단계 항목, 매핑, 검증 15종, 일회성 워크플로 | 완료 | `reference/워크플로-계약` (신설) |
| 거래 계약 항목(서비스, 입출력, `ParameterHandling`, `BaseFieldMappings`, `BaseFieldRelation`, 순차 거래, `Maskings`, `ValidateRules`, `FallbackTransaction`, 접근 제어) | 완료 | `reference/거래-계약-명세` (신설) |
| `.fnc` 단일 파일 계약, 언어별 진입점, `Exception` 출력, featureSQL | 완료 | `reference/api/modules/function`의 "단일 파일 계약 (.fnc)" |
| `.bas`, `.cyp`, `.rpo` 계약 형식 | 완료 | `reference/api/modules/command`, `reference/api/modules/graphclient`, `reference/api/modules/repository` |
| 점검 도구 사용법(`hs_inspect.py` 등) | 완료 | `guides/ai/점검-도구` |

## 스킬별 판정

대표 문서는 `docs/` 기준 문서 id입니다(`npm run check:agent`가 존재를 확인합니다).

| 스킬 | 파일 | 판정 | 대표 문서·비고 |
|---|---|---|---|
| handstack-feature-delivery | `SKILL.md` | 유지 | 연결표 → 구현 순서 → 검토 절차는 스킬 고유 |
| | `references/feature-recipes.md` | 병합 | 기능 유형별 구성. `startup/handsonlab/게시판-프로젝트-시작하기`, `startup/handsonlab/계층형-데이터-조회하기`와 대조 |
| | `references/change-ripple.md`, `review-checklist.md` | 유지 | 변경 영향·검토 체크리스트 |
| handstack-screen-development | `SKILL.md` | 유지 | 바인딩 규칙 요약·구현 절차 |
| | `references/binding-rules.md` | 유지(소스 대조 요약) | `syn.js` 구현과 `reference/거래-호출`·`reference/concept/데이터-게더링과-바인딩`을 대조한 내용. 증상 → 원인 표(5절)는 스킬 고유 |
| | `references/html-conventions.md` | 유지(요약) | 대표 문서(`information/resource/HandStack-화면-HTML-작성-지침`, 1,037줄)를 이미 명시한 172줄 요약이며 업무 화면 관례를 더한 것. 프로젝트 `DESIGN.md` 우선 규칙 포함 |
| | `references/script-conventions.md` | 유지(요약) | 대표 문서(4,483줄)와 `syn.js` 소스 확인 결과를 합친 252줄 요약. 줄 단위 대조는 하지 않았음 |
| | `references/design-system.md` | 유지(요약) | 프레임워크 `DESIGN.md` 요약이며 프로젝트 `DESIGN.md` 우선 규칙을 명시. 대표 문서: `information/resource/HandStack-프로젝트-전용-DESIGN.md-템플릿` |
| | `references/ux-states.md` | 유지 | 화면 상태 설계. 대응 문서 없음 |
| | `scripts/design_lint.py` | 도구 | |
| handstack-transaction-contracts | `SKILL.md` | 유지 | |
| | `references/txn-contract.md` | 이동(완료) | 항목 명세는 `reference/거래-계약-명세`로 옮기고, 이 파일은 작성 순서·함정·체크리스트로 줄임. 스킬의 `contractpack` 백업 서술을 소스 기준(`--options true`일 때만)으로 정정 |
| | `references/dbc-sql.md` | 유지(소스 대조 요약) | 대표 문서(`reference/api/modules/dbclient`, `tutorial/dbclient-SQL계약/*`)와 소스(`QueryDataClient`, `DatabaseMapper`) 기준. 8절 동시성·원자성은 스킬 고유 |
| | `references/patterns.md` | 병합 | `tutorial/dbclient-SQL계약/CRUD-계약-작성`, `tutorial/transact-거래계약/CRUD-거래-연결과-검증`과 대조 |
| handstack-function-contracts | `SKILL.md`, `references/function-patterns.md` | 이동(완료) | `.fnc` 형식·진입점 규칙·`featureSQL`·`Exception`은 `reference/api/modules/function`으로 옮김. `function-patterns.md`는 삭제하고 `SKILL.md`는 작업 순서·함정만 유지 |
| handstack-external-contracts | `SKILL.md` | 이동(완료) | `.bas`/`.cyp`/`.rpo` 형식은 각 모듈 문서로 옮기고 `SKILL.md`는 허용 범위 점검과 함정만 유지 |
| handstack-prompt-contracts | `SKILL.md` | 병합 | `reference/api/modules/prompter`. 판단 계약(`decision`) 검증 절차는 유지 |
| handstack-workflow-contracts | `SKILL.md`, `references/assertions.md` | 이동(완료) | `reference/워크플로-계약` 신설. `assertions.md`는 삭제하고 `SKILL.md`는 판단·순서·함정만 유지 |
| handstack-rules-and-verification | 전체 | 유지 | 대응 문서 없음(`reference/concept/domain-driven-low-code-governance`와 일부 주제만 인접). `concurrency.md`는 dbclient 동작 사실을 인용 |
| handstack-module-development | `SKILL.md` | 유지 | 문서 목록에 새 대표 문서 추가 |
| | `references/module-integration.md` | 이동(완료) | 폴더 구성·`module.json`·`menus.json`은 `reference/api/업무-모듈-개발`, `reference/api/module.json-환경설정`, `reference/api/menus.json-메뉴설정`으로 옮기고 셸 연동·csproj·반영 점검만 유지 |
| | `references/csharp-module.md` | 이동(완료) | 구조·코드 예시는 `reference/api/업무-모듈-개발`로 옮기고 함정·체크리스트만 유지. IDE 모듈 템플릿 토큰은 소스가 없어 문서화하지 않음 |
| handstack-host-operations | `SKILL.md` | 병합(완료) | 실행 옵션·설정 계층·실시간 반영 키·관리 엔드포인트는 `reference/api/ack-프로그램`, 다른 호스트는 `reference/api/운영-호스트`, CLI는 `startup/HandStack-CLI-사용법`에 추가. 스킬은 위험 명령·승인 관문·진단 순서 유지. 소스로 틀린 서술 정정(rdy 포트 8420, rdy 정적 결합 모듈, `--key`, Docker 볼륨, `hosts/`, `IsAutoUpdate`) |
| handstack-cicd-pipeline | `SKILL.md` | 유지 | 단계·게이트·안전 규칙은 스킬 고유 |
| | `references/deploy-methods.md` | 이동(완료) | 업데이트 패키지·Docker 명세는 `twelvefactor/빌드-릴리즈-실행/업데이트-패키지-배포`, `twelvefactor/빌드-릴리즈-실행/Docker-ack-이미지`로 옮기고 선택 기준·함정만 유지. `mandatory`는 소스에서 쓰인다는 점 등 낡은 서술 정정 |
| | `references/pipeline-stages.md`, `release-and-rollback.md` | 유지 | CI 골격(검증 전)·릴리즈 기록 템플릿. 릴리즈 기록 항목은 `twelvefactor/빌드-릴리즈-실행/빌드-릴리즈-실행-절차`와 겹치지만 확장 항목이 있어 줄이지 않았음 |
| | `scripts/pipeline_lint.py` | 도구 | |
| handstack-source-trace | `SKILL.md` | 유지 | 식별자 4종 표는 `reference/식별자와-파일-경로`로 병합 |
| | `references/finding-codes.md`, `scripts/hs_inspect.py` | 도구 | |
| handstack-troubleshooting | `SKILL.md` | 병합(완료) | 오류 문구 표는 `reference/거래-오류-메시지`(신설)로 옮기고 스킬은 층 판정·진단 사다리·보고 형식 유지. 소스로 틀린 서술 정정(`제한된 거래 요청`, `인증 자격 증명 확인 필요`, 관리 API `400`) |
| handstack-ide-development | `SKILL.md`, `references/ide-source-map.md` | 유지 | IDE 호스트 저장소 개발 절(B)은 내부 개발자용이고 정본이 IDE 저장소 지침이라 docs로 옮기지 않음. 사용자용 사실은 `ide/*`가 이미 대표. IDE 소스가 이 디스크에 없어 "외부에서 고칠 때 보존할 것" 절은 사실 확인이 불가해 보류 |

## 가이드·템플릿

| 파일 | 판정 | 대상 |
|---|---|---|
| 개발 흐름 개요, 개발자·운영자·업무 담당자 가이드 | 이동(완료) | `guides/ai/개발-흐름-개요`, `guides/ai/개발자-가이드`, `guides/ai/운영자-가이드`, `guides/ai/업무-담당자-가이드`. 위치는 `docs/ai/` 대신 기존 자동 사이드바 아래 `docs/guides/ai/`로 정했다(사이드바·MCP 구역 추가 불필요) |
| 프롬프트 쿡북 | 이동(완료)·병합 대기 | `guides/ai/프롬프트-쿡북`. `information/resource/AI로-게시판-설계-검토하기`, `information/resource/Claude CLI 기술 레퍼런스`와의 중복은 대조 후 정리 |
| 번들 `README.md`의 안내 문서 | 이동(완료) | `guides/ai/index` |
| `guides/templates/AGENTS.md` | 병합 | C4. `vide-coding-instruction/examples/*`와 한 벌로 |
| `agent-skills/guides/templates/hooks/`의 파이썬 훅 2개 | 병합 | `vide-coding-instruction/hooks/handstack-dev-hooks.md`와 대조 |
| `agent-skills/guides/templates/`의 `intent.md`, `spec.md`, `plan.md`, `rules-table.md`, `release-record.md`, `REVIEW.md` | 유지 | `agent-skills/guides/templates/`에 두고 `docs/ai/`에서 안내 |
| `README.md`의 연결·설치 절 | 병합 | `guides/에이전트에-문서-연결하기`가 연결(MCP 등록·새 세션 확인)의 대표 |

## 처리 현황

1. (완료) 충돌 C1~C4 해결.
2. (완료) "이동" 항목: 워크플로, 거래 계약 필드, `.fnc`/`.bas`/`.cyp`/`.rpo`, 모듈 통합, 호스트 운영, 업데이트 패키지, Docker, 거래 오류 메시지.
3. (완료) 구버전 "AI 활용 자료"의 HandStack 고유 파일 정정: `examples/HANDSTACK.md`(실제 샘플 `BOD010` 기준으로 재작성), `commands/handstack-scaffold`, `agents/handstack-developer`, `skills/handstack-patterns`, `rules/handstack-rules`, `hooks/handstack-dev-hooks`, `mcp-configs/handstack-integration`, `plugins/handstack-plugins`.
4. (완료) 가이드를 `docs/guides/ai/`로 이동, 스킬 목록·점검 도구 문서 추가, 운영자 가이드의 복제 표를 대표 문서 링크로 교체.
5. (남음) 화면·바인딩·SQL 요약 참조(줄 단위 대조), `plugins/handstack-plugins`처럼 구현체가 없는 구상 문서의 정리 여부, IDE "보존할 것" 절(IDE 소스 필요).
6. 항목마다 `npm run check:agent`와 `npm run build`로 검증합니다.
