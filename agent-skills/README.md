# HandStack 개발자 스킬

HandStack(syn.js 화면 + transact/dbclient 계약 기반 업무 앱) 프로젝트를 개발하는 사람을 위한 **Claude Code · Codex CLI 공용 스킬 14개**와 점검 도구(`hs_inspect.py`, `design_lint.py`)다. 특정 프로젝트에 종속되지 않으며, 각 스킬은 작업 대상 저장소의 `AGENTS.md`/`CLAUDE.md`/`DESIGN.md`를 먼저 읽고 그 규약을 우선하도록 작성했다.

| 스킬 | 언제 쓰나 |
|---|---|
| [handstack-feature-delivery](skills/handstack-feature-delivery/SKILL.md) | 새 업무 기능·화면 구현, 필드/조회 조건/버튼 추가 — 연결표 작성 → 구현 순서 → 영향 범위·검토 체크리스트 |
| [handstack-screen-development](skills/handstack-screen-development/SKILL.md) | 화면 HTML/JS, `syn-datafield`·`belongID` 바인딩, AUIGrid, 팝업, 셸 버튼 |
| [handstack-transaction-contracts](skills/handstack-transaction-contracts/SKILL.md) | `.txn` 거래 + `.dbc` SQL 계약, Flag 저장, 다중 seq, 계층형·순차 거래 |
| [handstack-function-contracts](skills/handstack-function-contracts/SKILL.md) | `.fnc` 서버 함수(C#·Node.js·Python), Exception 출력, featureSQL |
| [handstack-external-contracts](skills/handstack-external-contracts/SKILL.md) | command(`.bas`)·graphclient(`.cyp`)·repository(`.rpo`)와 파일 첨부 |
| [handstack-prompt-contracts](skills/handstack-prompt-contracts/SKILL.md) | prompter(`.pmt`) 프롬프트, Jev·Ollama 판단 계약, LLM 설정 경계 |
| [handstack-workflow-contracts](skills/handstack-workflow-contracts/SKILL.md) | `CommandType W` 서버 워크플로 — 단계 매핑, 검증(Assertions 15종), 일회성 워크플로 |
| [handstack-rules-and-verification](skills/handstack-rules-and-verification/SKILL.md) | 업무 규칙 정리, 결정표, 동시성·재시도, 경계값 테스트 도출, 결함 기록 |
| [handstack-module-development](skills/handstack-module-development/SKILL.md) | 모듈 구조·`module.json`·`menus.json`·C# 모듈 코드·빌드/배포 경로·새 모듈 템플릿 |
| [handstack-cicd-pipeline](skills/handstack-cicd-pipeline/SKILL.md) | 빌드·검증·패키징·배포 파이프라인 단계, 배포 방식(폴더 반영/업데이트 패키지/Docker), 릴리즈 기록·롤백, `pipeline_lint.py` |
| [handstack-host-operations](skills/handstack-host-operations/SKILL.md) | ack·rdy·agent·deploy·forbes 호스트, `handstack` CLI, 설정 계층·실시간 반영, 관리 API, 빌드/배포 주의 |
| [handstack-source-trace](skills/handstack-source-trace/SKILL.md) | 화면 → 거래 → SQL/함수 호출 경로 추적, `hs_inspect.py` 점검기 |
| [handstack-troubleshooting](skills/handstack-troubleshooting/SKILL.md) | 증상·오류 메시지에서 실패 계층과 원인 확정 |
| [handstack-ide-development](skills/handstack-ide-development/SKILL.md) | IDE 왕복 편집 보존, IDE 호스트 저장소 개발 |

## 이 폴더의 위치와 범용 기준

이 폴더는 `handstack-docs` 저장소의 `agent-skills/`입니다. 사이트 문서(`docs/`)가 구문·옵션·기본값의 단일 원본이고, 스킬은 판단 절차와 점검 순서를 담아 문서를 인용합니다. 문서와 스킬을 함께 고치는 규칙은 저장소 루트의 `CONTRIBUTING.docs.md`("에이전트 스킬 갱신"), 문서와 겹치는 부분의 정리 계획은 저장소의 `agent-skills/MERGE-MAP.md`를 보세요.

스킬은 특정 업무 저장소에 종속되지 않습니다. 모듈 경로, 업무 ID, 화면별 규칙처럼 프로젝트에만 해당하는 정보는 그 저장소의 `AGENTS.md`/`CLAUDE.md`(초안: `guides/templates/AGENTS.md`)에 두세요. 스킬은 해당 지침을 먼저 읽고 우선합니다. 같은 이름의 프로젝트 전용 스킬이 이미 설치돼 있으면 이 번들로 교체하고(`-Update`), 이름이 다른 스킬은 `-RetireSkill`로 백업 폴더로 옮깁니다.

## 사용 가이드

처음 시작하는 개발자·운영자·업무 담당자를 위한 문서는 사이트의 [AI 에이전트로 개발하기](https://handstack.kr/docs/guides/ai/)에 있고, 복사해 쓰는 템플릿은 [`guides/templates/`](guides/templates/AGENTS.md)에 있다. 사이트에는 역할별 가이드(개발자, 운영자, 업무 담당자), 개발 흐름 개요, 프롬프트 쿡북이 있고 템플릿은 `intent.md`/`spec.md`/`plan.md`/규칙 표/릴리즈 기록 템플릿, 보호 경로·배포 관문 훅 스크립트(`guides/templates/hooks`, 테스트 포함)로 구성된다.

## 스킬의 근거

- **공식 문서**: `handstack-docs` MCP(`https://handstack.kr/mcp`)의 `search_docs`/`get_doc`로 확인한 참조·학습·IDE 문서. 각 스킬 끝에 읽을 문서 ID가 있다. MCP가 연결되지 않은 환경에서는 `https://handstack.kr/docs/<문서 id>`를 사용하며, 확인하지 않은 것을 확인했다고 보고하지 않도록 지시한다.
- **런타임 소스 대조**: 화면 로더(`syn.js`)의 거래 입출력 수집·콜백 규칙, transact의 입력 검증·접근 제어, dbclient의 파라미터 기본값·seq 처리, function 진입점 규칙, command 치환 규칙을 실제 구현과 비교해 반영했다.
- **실제 업무 프로젝트 패턴**: 수백 개의 화면(HTML/JS)과 계약 파일을 통계적으로 분석해 반복 관례(객체 골격, hook 구성, 그리드 컬럼 튜플, Flag 저장, Exception 출력, 메뉴 형식 등)를 추렸다.

## 설치

```powershell
# 변경될 경로만 미리 확인
.\Install-Skills.ps1 -Scope User -WhatIf

# 모든 프로젝트에서 사용: Claude Code(~/.claude/skills), Codex CLI(~/.agents/skills)
.\Install-Skills.ps1 -Scope User

# 특정 저장소에서만 사용: <프로젝트>/.claude/skills, <프로젝트>/.agents/skills
.\Install-Skills.ps1 -Scope Project -ProjectRoot C:\path\to\project

# 도구·스킬 선택
.\Install-Skills.ps1 -Tool ClaudeCode -Scope User -Skill handstack-source-trace,handstack-screen-development

# 이전 버전을 백업하고 교체 / 더 이상 쓰지 않는 이전 스킬 이름을 백업 폴더로 이동
.\Install-Skills.ps1 -Scope User -Update
.\Install-Skills.ps1 -Scope User -Update -RetireSkill <이전-스킬-이름>
```

- 같은 이름의 스킬이 다른 내용이면 **아무것도 덮어쓰지 않고 중단**한다(`-Update`를 주면 `.claude/skills-backup/<시각>/`, `.agents/skills-backup/<시각>/`에 백업 후 교체).
- 개인(User)과 프로젝트(Project) 범위에 중복 설치하면 같은 이름이 여러 위치에서 발견되므로 한쪽만 쓴다.
- 이 설치기는 MCP 연결·키·권한 설정을 변경하지 않는다. `handstack-docs` MCP를 쓰려면 각 도구에 따로 등록한다(예: Codex `config.toml`의 `[mcp_servers.handstack-docs] url = "https://handstack.kr/mcp"`, Claude Code `claude mcp add --transport http handstack-docs https://handstack.kr/mcp`).

## 사용과 점검 도구

호출 예시(`/스킬이름`, `$스킬이름`)는 사이트의 [스킬 목록과 설치](https://handstack.kr/docs/guides/ai/스킬-목록), 읽기 전용 점검 스크립트(`hs_inspect.py`, `design_lint.py`, `pipeline_lint.py`)의 옵션과 한계는 [점검 도구](https://handstack.kr/docs/guides/ai/점검-도구)에 있다. 스크립트는 각 스킬의 `scripts/` 폴더에 있다.

## 검증

저장소 루트에서 `npm run check:agent` 하나로 번들 검증, 문서 경로 인용 확인, 단위 테스트를 순서대로 실행한다. 이 폴더에서 개별로 실행할 수도 있다.

```powershell
python -B -X utf8 -m unittest discover -s tests -v
python -X utf8 .\scripts\validate_bundle.py
python -X utf8 .\scripts\check_doc_refs.py
.\tests\Test-InstallSkills.ps1 -TestRoot C:\tmp\새-검증-폴더
```

- `validate_bundle.py`: frontmatter 규칙(name, description ≤1024자·꺾쇠 금지), SKILL.md ≤500줄, 상대 링크·형제 스킬 스크립트 경로, Codex 메타데이터, 파이썬 구문·캐시, 비밀 값 패턴. `config/banned-terms.txt`(기본값, `--banned-terms-file`로 변경)의 `[all]` 표현은 번들과 `docs/` 전체에, `[skills]` 표현은 번들에만 없어야 한다. 이 목록은 번들(zip)에 포함하지 않는다. `--installed-root`로 설치본 일치를 비교한다.
- `check_doc_refs.py`: 스킬·가이드가 백틱으로 인용한 `docs/` 문서 id(`reference/거래-호출` 형식)가 실제로 있는지 확인한다. 문서 파일명·폴더를 바꾸면 이 검사가 영향받는 스킬을 알려 준다.
- 한계: 모델이 스킬을 실제로 선택·수행하는 품질, 업무 DB·외부 API·LLM·데스크톱 앱의 실행 검증은 포함하지 않는다. 스킬 작성 시 서버·로더 소스와 정적으로 대조했으나 사용 중인 배포본의 버전이 다르면 해당 소스를 우선한다.
