---
marp: true
theme: gaia
_class: lead
footer: Claude CLI 기술 레퍼런스
paginate: true
backgroundColor: #fff
---

<style>
:root {
  font-family: 'Noto Sans KR', 'Pretendard', 'Nanum Gothic', 'Malgun Gothic', Gulim, 굴림, sans-serif;
  --border-color: #303030;
  --text-color: #0a0a0a;
  --bg-color-alt: #dadada;
  --mark-background: #ffef92;
  --muted-color: #4b5563;
  --line-color: #17344f;
}

h1 {
  border-bottom: none;
  font-size: 1.6em;
}

h2 {
  border-bottom: none;
  font-size: 1.3em;
}

h3 {
  font-size: 1.1em;
}

h4 {
  font-size: 1.05em;
}

h5 {
  font-size: 1em;
}

h6 {
  font-size: 0.9em;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  color: var(--text-color);
}

code:not([class*="language-"]) {
  font-family: D2Coding;
  color: #000;
  vertical-align: text-bottom;
  background-color: rgba(100, 100, 100, 0.2);
}

section {
  padding: 1.2rem;
  border-bottom: 1px solid #000;
  background-image: linear-gradient(to bottom right, #f7f7f7 0%, #d3d3d3 100%);
}

section > h2 {
  border-bottom: 4px solid #17344f;
}

section table {
    margin: auto;
    margin-top: 1rem;
    font-size: 20px;
}

section::after {
  font-size: 0.75em;
  content: attr(data-marpit-pagination) " / " attr(data-marpit-pagination-total);
}

img[alt~="center"] {
  display: block;
  margin: 0 auto;
}

blockquote {
  font-size: 24px;
  border-left: 8px solid var(--border-color);
  background: var(--bg-color-alt);
  margin: 0.5em;
  padding: 0.5em;
}

blockquote::before,
blockquote::after {
    content: '';
}

mark {
  background-color: var(--mark-background);
  padding: 0 2px 2px;
  border-radius: 4px;
  margin: 0 2px;
}

section.tinytext>p,
section.tinytext>ul,
section.tinytext>blockquote {
  font-size: 0.65em;
}

table {
  width: 100%;
  margin: 0.45em auto 0 auto;
  border-collapse: collapse;
  font-size: 0.78em;
}

th, td {
  padding: 0.34em 0.45em;
  border: 1px solid rgba(0,0,0,0.22);
  vertical-align: top;
}

th { background: rgba(23,52,79,0.12); }

.cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.72rem;
  align-items: start;
}

.card {
  background: rgba(255,255,255,0.62);
  border-left: 5px solid var(--line-color);
  padding: 0.55rem 0.7rem;
  min-height: 1.2rem;
}

.card h3 { margin: 0 0 0.25em 0; }

.kicker { font-size: 0.78em; color: var(--muted-color); }

.tight li { margin: 0.1em 0; }

.small { font-size: 0.82em; }

.xsmall { font-size: 0.72em; }

.center { text-align: center; }
</style>

# Claude CLI 기술 레퍼런스

### 터미널에서 동작하는 에이전틱 코딩 시스템

<br />
<br />
<br />
<br />
<br />

**QCN**

---

## 핵심 요약

- **하나의 에이전트, 여러 표면:** REPL, Print 모드, IDE, Remote/Background, SDK가 동일한 모델을 공유
- **이중 보안 모델:** Permission(무엇을 할 수 있는가)과 Sandbox(어디까지 격리할 것인가)
- **프로젝트 표준화:** `CLAUDE.md`로 아키텍처와 팀 규칙을 자동 로딩
- **확장성:** Hooks로 결정론적 실행 보장, Subagents/MCP로 위임과 외부 연동

<!--
"Claude Code는 코드를 읽고, 계획을 세우고, 패치를 만들고, 명령을 실행하고, 결과를 검증하는 루프를 빠르게 반복하는 에이전트입니다."
-->

---

## 목차 소개

오늘 다룰 주요 내용은 다음과 같습니다.

- **기본 환경:** 설치, 빠른 시작, 인터페이스
- **핵심 시스템:** 설정(settings.json), 모델, 권한, 비용
- **확장 및 고급 기능:** CLAUDE.md, Plan Mode, MCP, Skills, Subagents, Hooks
- **엔터프라이즈 및 운영:** CI/CD 통합, 모범 사례, 안티패턴

<!--
"방대한 레퍼런스 중 현업 적용에 필수적인 핵심 주제를 빠르게 짚어보겠습니다."
-->

---

## 설치 및 인증

**패키지 관리자를 통한 간편 설치:**
```bash
# 네이티브 설치 (macOS/Linux, 권장)
curl -fsSL https://claude.ai/install.sh | bash

# Windows PowerShell
irm https://claude.ai/install.ps1 | iex
```

- **인증:** `claude auth login`
  - Claude Pro/Max 구독 (권장): 정액제로 예측 가능한 비용
  - Claude Console: API 사용량 기반 청구
  - 엔터프라이즈: AWS Bedrock, Google Vertex AI, Microsoft Foundry
- **진단:** `claude doctor`, `claude --version`

<!--
"설치는 한 줄로 끝납니다. 개인은 Pro/Max 구독 로그인을, 조직은 Bedrock/Vertex 연동을 권장합니다."
-->

---

## 빠른 시작: 첫 번째 세션

1. 프로젝트 디렉토리로 이동: `cd ~/my-project`
2. CLI 실행: `claude` (대화형 REPL이 표시되며 프로젝트 구조를 자동 확인)
3. 프롬프트 입력: *"이 저장소가 무엇을 하는지 핵심 파일을 읽고 요약해 줘"*
4. 계획 모드 사용: `/plan 인증 모듈 리팩토링`
5. 결과 확인: `/cost`로 비용, diff로 변경 사항 검토 후 수락

<!--
"프로젝트 폴더에서 claude만 입력하면 됩니다. 코드베이스를 자동으로 스캔하고 바로 대화를 시작할 수 있습니다."
-->

---

## 핵심 인터랙션 인터페이스

워크플로우에 맞춰 표면을 선택하세요.

1. **대화형 REPL:** 터미널 환경, 탐색적 개발
2. **Print 모드 (`-p`):** 단발 질의, 파이프 입력, 스크립트 연동
3. **IDE 확장:** VS Code 등 내장, 인라인 편집
4. **Remote/Background Agent:** 비동기 장기 실행
5. **SDK:** 사내 도구·슬랙봇에 에이전트 내장

| 주요 명령어 | 설명 |
| --- | --- |
| `/model` | 모델 전환 |
| `/plan` | Plan Mode 진입 |
| `/cost` | 비용·토큰 사용량 확인 |
| `/status` | 세션 설정 확인 |

<!--
"REPL은 탐색에, Print 모드는 자동화에, IDE는 집중 코딩에, SDK는 내재화에 적합합니다."
-->

---

## 설정 시스템 분석 (`settings.json`)

**우선순위 계층 구조**

1. **CLI 플래그** (최고 우선순위)
2. `.claude/settings.local.json` (개인용, 현재 프로젝트)
3. `.claude/settings.json` (Git으로 팀 공유)
4. `~/.claude/settings.json` (사용자 전역)
5. `managed-settings.json` (엔터프라이즈 강제, 완화 불가)

```json
{
  "model": "claude-sonnet-4-5-20250929",
  "permissions": { "defaultMode": "acceptEdits" },
  "hooks": { "PostToolUse": [ { "matcher": "Edit|Write" } ] }
}
```

> **세션 중 변경:** `/config thinking=false` 와 같은 shorthand로 즉시 반영할 수 있습니다.

<!--
"팀 프로젝트는 .claude/settings.json을 Git에 커밋해 팀원 모두가 동일한 정책으로 작업하도록 강제합니다."
-->

---

## 어떤 모델을 선택해야 할까요?

- **`fable`:** 최고 난이도 추론, Opus보다 고가 — 정말 어려운 문제에만
- **`opus` (Agentic 기본값):** 복잡한 추론, 장기 작업, 아키텍처 결정
- **`sonnet` (권장):** 균형 잡힌 일상 개발의 주력 모델
- **`haiku`:** 빠른 탐색, 단순 작업, Subagent 전용 모델로 적합
- **`opus[1m]` / `sonnet[1m]`:** 대규모 코드베이스를 위한 확장 컨텍스트

> **Effort Level:** `low`(간단/반복), `medium`(개발), `high`(복잡한 버그), `xhigh`(아키텍처·보안)

<!--
"상황에 맞게 모델과 추론 강도를 바꾸세요. 단순 탐색에 옵스나 페이블 수준의 추론은 필요 없습니다."
-->

---

## Claude Code 비용은 얼마인가요?

- **구독 플랜:** Pro($20/월), Max 5x($100/월), Max 20x($200/월) — 사용량 배수로 차등
- **API 결제:** 토큰당 과금, Prompt Caching으로 캐시 읽기 약 90% 절감
- **비용 최적화 팁:**
  - Subagent 탐색에는 Haiku 사용
  - `--max-turns`로 폭주 방지
  - Plan Mode로 우발적 고비용 실행 차단
  - 긴급하지 않은 작업은 Batch API로 50% 할인

```txt
/cost
Total cost: $0.55  |  Total duration (API): 6m 19.7s
```

<!--
"비용을 아끼려면 Subagent 모델 라우팅과 /cost 모니터링을 습관화하세요."
-->

---

## 권한(Permission) 시스템

**무엇을 할 수 있는지 정의합니다.**

| Mode | 동작 | 사용 사례 |
|---|---|---|
| `default` | 도구 사용 시마다 승인 요청 | 일반 개발 초기 |
| `acceptEdits` | 편집 자동 승인, Bash는 승인 요청 | 신뢰된 프로젝트 |
| `auto` | Classifier가 안전성 평가 | 보호장치 있는 자율 실행 |
| `plan` | 실행·편집 불가 | 분석 전용 |
| `bypassPermissions` | 모든 승인 생략 | 격리된 CI/CD만 |

```json
{ "allow": ["Bash(npm run:*)"], "deny": ["Bash(rm -rf:*)", "Read(.env*)"] }
```

<!--
"Bash 패턴은 정규식이 아닌 prefix matching입니다. allow/deny/ask 세 단계로 세밀하게 통제하세요."
-->

---

## Sandbox: OS 수준 격리

**커널 수준에서 파일시스템·네트워크를 차단합니다.**

```json
{
  "sandbox": {
    "enabled": true,
    "network": { "deniedDomains": ["pastebin.com"] },
    "credentials": { "denyRead": [".aws/credentials", ".ssh/*"] }
  }
}
```

- Auto Mode는 `curl | bash`, 운영 배포, IAM 변경 등을 자동 차단
- 3회 연속/누적 20회 차단 시 수동 프롬프트로 자동 복귀 (circuit breaker)
- 내부 테스트 기준 승인 프롬프트 대폭 감소

<!--
"Sandbox는 Permission과 별개의 안전장치입니다. 자격 증명 파일 노출을 막고 네트워크 도메인을 화이트/블랙리스트로 통제합니다."
-->

---

## CLAUDE.md는 어떻게 작동하나요?

- 프로젝트 루트에 위치하는 **시스템 프롬프트 역할**의 파일
- 매 세션 자동으로 로딩되어 아키텍처·빌드·테스트·금지 규칙을 전달
- 모호한 지시 금지 ("조심해서 작업해" ❌). 명령·금지·검증 기준을 적어야 효과적

```markdown
## Build & Run
npm install && npm run dev

## Known Issues
- DB 커넥션 풀 타임아웃 5초
```

`/init` 명령으로 초안을 생성할 수 있습니다.

<!--
"CLAUDE.md에 명확한 규칙을 적어두면 매번 같은 설명을 반복할 필요가 사라집니다."
-->

---

## Plan Mode와 Steer 제어

- **Plan Mode:** `/plan`으로 진입. 읽기 전용 도구로 코드베이스를 분석해 `.claude/plans/{slug}.md`에 계획 작성, 승인 전까지 변경 없음
- **Steer 제어:** 작업 도중 즉시 개입 가능 ("잠깐, 방식 바꿔")
- **되돌리기:** `/undo`(최근 변경 취소), `/rewind N`(N턴 되감기)

```txt
Shift+Tab   모드 순환: normal → plan → auto-accept
```

<!--
"결과가 나올 때까지 기다릴 필요 없습니다. Plan Mode로 먼저 검토하고, 필요하면 즉시 방향을 바꾸세요."
-->

---

## MCP (Model Context Protocol)이란?

외부 도구나 데이터를 Claude의 컨텍스트로 끌어옵니다.

- GitHub: PR/이슈 관리 · Database: SQL 쿼리 · Sentry: 에러 모니터링 · Slack: 메시지

```json
{
  "mcp": {
    "servers": {
      "github": {
        "command": "npx",
        "args": ["@modelcontextprotocol/server-github"],
        "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..." }
      }
    }
  }
}
```

권한은 `mcp__github`, `mcp__database__query`처럼 도구 단위로 allow/deny 합니다.

<!--
"MCP는 Claude의 눈과 귀를 넓혀줍니다. 반복적인 수동 조회가 있을 때만 도입하세요."
-->

---

## Skills란?

관련 컨텍스트에서 자동(`auto`) 혹은 명시적으로(`user-invocable-only`) 로드되는 **재사용 가능한 전문성 패키지**입니다.

```txt
.claude/skills/
├── security-review.md
├── performance-analysis.md
└── api-design-check.md
```

```markdown
---
name: Security Review
description: Comprehensive security analysis of code
type: auto
---
```

`settings.json`의 `skillOverrides`로 개별 Skill을 일괄 끄거나 수동 호출 전용으로 전환할 수 있습니다.

<!--
"반복되는 복잡한 검토가 있다면 Skill로 만드세요. description이 자동 선택의 품질을 좌우합니다."
-->

---

## Subagents

메인 세션과 분리된 **격리 컨텍스트**에서 작업하고 요약만 반환합니다.

```bash
/task explore              # 탐색 전용
/task plan                 # 계획 수립
/task "custom prompt"      # 사용자 정의 작업
```

- 깨끗한 컨텍스트로 시작 → 메인 세션 비대화 방지
- 더 저렴한 모델로 라우팅 가능 (`CLAUDE_CODE_SUBAGENT_MODEL=haiku`)
- 최대 5단계 깊이까지 재귀적 생성 가능
- **Agent Teams:** 여러 Subagent를 병렬로 운용

<!--
"탐색은 Haiku 서브에이전트에 위임하고, 메인 세션은 결정과 통합에 집중하세요."
-->

---

## Hooks

세션 라이프사이클 이벤트에서 **결정론적으로** 스크립트를 실행합니다.

- `PreToolUse`(차단 가능) · `PostToolUse` · `UserPromptSubmit`(차단 가능)
- `Stop` / `SubagentStop`(차단 가능) · `SessionStart` / `SessionEnd`

```json
{
  "hooks": {
    "PostToolUse": [
      { "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "npx prettier --write \"$FILE_PATH\"" }] }
    ]
  }
}
```

`command` / `prompt` / `http` / `agent` 네 가지 Hook 타입을 지원하며, `async: true`로 비차단 실행도 가능합니다.

<!--
"프롬프트로 부탁하는 것과 달리, Hook은 실행을 보장합니다. 포맷팅과 검증은 Hook으로 고정하세요."
-->

---

## 비대화형 모드 (`claude -p`)

CI/CD 및 셸 자동화를 위한 헤드리스 모드입니다.

```bash
claude -p "실패한 테스트 원인을 분석해 줘" --output-format json
claude -p "lint 수정" --max-turns 10 --allowedTools "Edit,Bash(npm run lint)"
```

```json
{ "type": "result", "subtype": "success", "total_cost_usd": 0.0034, "is_error": false }
```

- `--output-format`: text(기본) / json / stream-json
- 종료 코드: `0`(성공) · `1`(오류)

<!--
"TUI 오버헤드 없이 순수 자동화를 원할 때 claude -p를 사용하세요. CI 파이프라인의 핵심 도구입니다."
-->

---

## 성능 최적화

컨텍스트 예산(토큰) 관리가 속도와 품질을 결정합니다.

1. **사전 압축:** 컨텍스트가 차기 전에 `/compact`로 대화 이력 요약
2. **명시적 참조:** 파일 경로를 직접 지정해 탐색 낭비 제거
3. **모델 라우팅:** Subagent에 Haiku, 메인 세션에 Sonnet/Opus
4. **결과 중심 루프:** "테스트 통과할 때까지 반복해"처럼 완료 조건을 한 번에 지시

<!--
"가장 큰 성능 저하는 불필요한 컨텍스트 비대화에서 옵니다. 모델 라우팅과 압축을 습관화하세요."
-->

---

## 엔터프라이즈 배포

관리자가 사용자 통제 권한을 잃지 않습니다.

- `managed-settings.json`: 사용자가 임의로 권한·모델 정책을 완화하지 못하도록 강제
- **클라우드 연동:** AWS Bedrock, Google Vertex AI, Microsoft Foundry
- **Admin API:** `num_sessions`, `lines_of_code`, `commits_by_claude_code` 등 조직 사용량 집계
- **Audit Logging:** Hooks를 통한 모든 액션의 중앙 로깅

<!--
"보안팀을 설득하기 가장 좋은 도구입니다. 로컬 권한부터 API 호출까지 모든 정책을 중앙에서 통제합니다."
-->

---

## 모범 사례 및 안티패턴

**성공적인 AI 페어 프로그래밍 규칙**

- ❌ **안티패턴:** "에러 고쳐줘" (무의미한 탐색에 토큰 낭비)
- ⭕️ **모범 사례:** "이 파일 `src/api.py`의 42번 줄 TypeError 고쳐. 완료 후 테스트 실행해."
- ❌ **안티패턴:** 포맷팅을 매번 프롬프트로 요청
- ⭕️ **모범 사례:** `PostToolUse` Hook으로 포맷팅을 결정론적으로 고정

<!--
"AI에게 '알아서 해'라고 던져주는 것은 최악의 방법입니다. 정확한 경계와 완료 조건, 그리고 Hook으로 보장되는 규칙이 핵심입니다."
-->

---

## 워크플로 레시피

**시나리오별 정석 패턴**

1. **새 프로젝트:** `claude` 실행 → 분석 요청 → `/init`으로 CLAUDE.md 생성
2. **일상 기능 개발:** 파일 경로 지정 → 요구사항 명시 → 테스트 수행 지시
3. **대규모 리팩토링:** `/plan` → 승인 → Steer로 방향 조정
4. **코드 리뷰:** `/code-review`로 git 변경 내용 리뷰 자동화

<!--
"결국 이 4가지 패턴이 실무의 대부분을 차지합니다. 이 레시피대로만 사용하셔도 생산성이 크게 오릅니다."
-->

---

## 참고 자료

추가 학습이 필요하시다면 아래 공식 채널을 확인하세요.

- **공식 문서:** `docs.claude.com/en/docs/claude-code`
- **Settings/Permissions/Hooks/MCP/SDK 레퍼런스:** 공식 문서 하위 페이지
- **API Pricing:** `docs.claude.com/en/docs/about-claude/pricing`
- **Blake Crosley 가이드:** `blakecrosley.com/ko/guides/claude-code`

<!--
"오늘 다루지 못한 세부 옵션이나 에러 해결법은 공식 문서와 레퍼런스에 모두 정리되어 있습니다."
-->

---

## 정리

Claude Code를 효과적으로 쓰려면 기능보다 **운영 모델**을 먼저 잡아야 합니다.

<div class="cols">
	<div class="card">
		<h3>5개 실행 표면</h3>
		REPL · Print 모드 · IDE · Remote/Background · SDK
	</div>
	<div class="card">
		<h3>5개 핵심 시스템</h3>
		settings.json · Permission/Sandbox · CLAUDE.md · MCP · Hooks/Subagents
	</div>
</div>

- 작업은 **읽기 → 계획 → 패치 → 명령 실행 → 검토**의 루프로 진행
- 안전성은 **Permission + Sandbox**의 조합으로 통제
- 팀 표준은 `CLAUDE.md`, 자동화는 `Hooks`, 위임은 `Subagents`, 외부 연동은 `MCP`로 확장
