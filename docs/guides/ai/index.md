---
sidebar_position: 0
description: 역할별로 HandStack 스킬을 쓰는 순서와 복사해 쓰는 템플릿을 안내합니다.
---

# HandStack 스킬로 AI 에이전트와 개발하기

스킬 14개를 **어떤 순서로, 누가, 어떻게** 쓰면 되는지 안내하는 문서 모음입니다. 스킬 자체의 규칙은 `skills/*/SKILL.md`에 있고, 여기는 처음 시작하는 사람을 위한 사용법과 예시입니다.

스킬 원본과 설치기(`Install-Skills.ps1`)는 [handstack-developer-skills.zip](pathname:///agent-skills/handstack-developer-skills.zip)으로 내려받거나 [handstack-docs 저장소의 agent-skills 폴더](https://github.com/handstack77/handstack-docs/tree/master/agent-skills)에서 받을 수 있습니다. 스킬이 인용하는 HandStack 문서를 에이전트가 직접 읽게 하려면 [문서 MCP 서버를 연결](/docs/guides/에이전트에-문서-연결하기)하세요.

## 나는 누구인가? → 여기서 시작

| 나는… | 읽을 문서 | 이 문서에서 얻는 것 |
|---|---|---|
| 처음 HandStack 프로젝트에 합류한 **개발자** | [개발자 가이드](개발자-가이드.md) | 준비 30분, 첫날 코드 읽기, 기능 하나를 끝까지 만드는 따라 하기, 점검 출력 읽는 법, 훅, 자주 하는 실수 |
| 서버·배포를 맡은 **운영자** | [운영자 가이드](운영자-가이드.md) | 환경 파악, 설정 반영 방식, 배포 방식 선택과 승인 관문, 롤백, 장애 대응, 위험 명령, 보안 점검 |
| 기능을 요청하는 **업무 담당자** | [업무 담당자 가이드](업무-담당자-가이드.md) | `intent.md` 쓰기, 규칙 확정, 명세 검토, 인수 시나리오, 변경 요청·장애 신고 양식 |
| 전체 그림이 궁금한 사람 | [개발 흐름 개요](개발-흐름-개요.md) | 단계·산출물·스킬·사람의 관문 지도, 도입 순서 |
| 프롬프트를 바로 복사해 쓰고 싶은 사람 | [프롬프트 쿡북](프롬프트-쿡북.md) | 상황별 요청 문장 |
| 스킬을 설치하고 어떤 스킬이 있는지 보려는 사람 | [스킬 목록과 설치](스킬-목록.md) | 스킬 14개의 용도, 설치 명령, 호출 예시 |
| 점검 스크립트를 쓰려는 사람 | [점검 도구](점검-도구.md) | `hs_inspect.py`, `design_lint.py`, `pipeline_lint.py` 사용법과 한계 |

## 한 장 요약

1. **의도를 파일로 남긴다** — `intent.md` (업무 담당자)
2. **규칙을 한 줄에 판단 하나로 확정한다** — 규칙 표 (담당자 + 개발자)
3. **계획 모드에서 계획을 먼저 만들고 승인한다** — `plan.md` (개발자)
4. **안쪽(SQL)부터 바깥(화면)으로 구현하고 층마다 점검한다** — `hs_inspect.py`, `design_lint.py`
5. **점검 출력을 붙여 검토를 요청한다** — "정적/실행" 수준 구분
6. **격리 환경에서 스모크 후, 승인을 받아 배포한다** — 릴리즈 기록, 롤백
7. **운영 신호를 다시 의도로 되돌린다** — 장애 기록이 새 `intent.md`

## 템플릿

복사해서 쓰는 파일들입니다(`templates/`).

| 파일 | 용도 |
|---|---|
| [intent.md](https://github.com/handstack77/handstack-docs/blob/master/agent-skills/guides/templates/intent.md) | 원하는 일 기록 (업무 담당자) |
| [spec.md](https://github.com/handstack77/handstack-docs/blob/master/agent-skills/guides/templates/spec.md) | 요구사항·설계 명세 (담당자 확인용) |
| [plan.md](https://github.com/handstack77/handstack-docs/blob/master/agent-skills/guides/templates/plan.md) | 구현 계획과 연결표 (개발자) |
| [rules-table.md](https://github.com/handstack77/handstack-docs/blob/master/agent-skills/guides/templates/rules-table.md) | 업무 규칙 표, 결정표, 테스트 표 |
| [AGENTS.md](https://github.com/handstack77/handstack-docs/blob/master/agent-skills/guides/templates/AGENTS.md) | 프로젝트 지침(`CLAUDE.md`/`AGENTS.md`) 초안 |
| [REVIEW.md](https://github.com/handstack77/handstack-docs/blob/master/agent-skills/guides/templates/REVIEW.md) | 검토 지침 |
| [release-record.md](https://github.com/handstack77/handstack-docs/blob/master/agent-skills/guides/templates/release-record.md) | 릴리즈 기록과 배포 후 확인 |
| [hooks/protect_paths.py](https://github.com/handstack77/handstack-docs/blob/master/agent-skills/guides/templates/hooks/protect_paths.py) | 보호 경로 편집 차단 훅 |
| [hooks/deploy_gate.py](https://github.com/handstack77/handstack-docs/blob/master/agent-skills/guides/templates/hooks/deploy_gate.py) | 위험 명령을 릴리즈 승인 없이 차단하는 훅 |

## 읽기 전에 알아 둘 것

- **스킬은 권고입니다.** 반드시 지켜야 하는 규칙은 점검 스크립트·훅·CI 게이트로 강제하세요.
- **프로젝트 지침이 우선합니다.** 프로젝트의 `AGENTS.md`/`CLAUDE.md`/`DESIGN.md`가 이 문서와 스킬의 일반 규칙보다 앞섭니다.
- 예시 ID(`SUP010`, `LD01`)와 시나리오는 설명용 가상 값입니다.
- 훅 설정 형식, 계획 모드, 스킬 호출 방식은 사용하는 도구(Claude Code, Codex CLI)의 버전에 따라 다를 수 있으니 도구 문서로 확인하세요. 훅 스크립트는 이 번들의 테스트로 동작을 확인했지만 실제 도구에 연결한 실행은 검증하지 못했습니다.
- AI가 만든 결과의 책임은 승인한 사람에게 있습니다. 실행하지 못한 검증은 "미수행"으로 적습니다.
