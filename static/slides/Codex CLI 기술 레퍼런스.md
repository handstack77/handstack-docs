---
marp: true
theme: gaia
_class: lead
footer: Codex CLI 기술 레퍼런스
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

# Codex CLI 기술 레퍼런스

### 단순한 코딩 도구를 넘어선 에이전트 개발 시스템

<br />
<br />
<br />
<br />
<br />

**QCN**

---

## 핵심 요약

- **멀티 인터렉션 에이전트:** CLI, 데스크톱 앱, IDE, 클라우드 모두에서 동일한 GPT-5.x 모델 공유
- **OS 수준 보안:** 컨테이너가 아닌 커널 수준의 샌드박싱(Seatbelt/Landlock)
- **크로스 시스템 지침:** `AGENTS.md`를 통한 프로젝트 지침 글로벌 표준화
- **무한한 확장성:** MCP와 Skills 시스템으로 외부 서비스 및 커스텀 워크플로 통합

<!--
"Codex는 코드를 작성해주는 단순한 챗봇이 아닙니다. 코드를 읽고, 명령을 실행하며, 샌드박스에서 검증까지 수행하는 멀티 인터렉션 코딩 에이전트입니다."
-->

---

## 목차 소개

오늘 다룰 주요 내용은 다음과 같습니다.

- **기본 환경:** 설치, 빠른 시작, 인터페이스
- **핵심 시스템:** 설정(config), 모델, 샌드박스, 비용
- **확장 및 고급 기능:** AGENTS.md, Hooks, MCP, Skills, Plan Mode
- **엔터프라이즈 및 운영:** CI/CD 통합, 메모리, 문제 해결, 모범 사례

<!--
"방대한 레퍼런스 중 현업 적용에 필수적인 26가지 주제를 빠르게 짚어보겠습니다."
-->

---

## Codex 설치 방법

**패키지 관리자를 통한 간편 설치:**
```bash
# npm (권장)
npm install -g @openai/codex

# 직접 설치 스크립트 (macOS/Linux)
curl -fsSL https://github.com/openai/codex/releases/latest/download/install.sh | sh
```

- **인증:** `codex login`
  - ChatGPT 계정 (권장): Plus, Pro, Business 와 같은 구독으로 로그인
  - API 키: CODEX_API_KEY 환경 변수 또는 --with-api-key로 설정
- **요구 사항:** macOS(Intel/Silicon), Linux, Windows 지원

<!--
"설치는 단 한 줄의 명령어로 끝납니다. API 키를 사용할 수도 있지만, 클라우드 기능 등을 온전히 쓰려면 ChatGPT 계정 로그인을 권장합니다."
-->

---

## 빠른 시작: 첫 번째 세션

1. 프로젝트 디렉토리로 이동: `cd ~/my-project`
2. CLI 실행: `codex` (대화형 TUI가 표시되며, Codex가 프로젝트 디렉토리 구조를 자동으로 확인)
3. 프롬프트 입력: *"이 프로젝트의 아키텍처를 요약해 줘"*
4. 슬래시 명령어 사용: `/plan 데이터베이스 레이어 리팩토링`
5. 결과 확인: `/diff` 로 git 변경 사항 검토 후 수락(`y`)

<!--
"프로젝트 폴더에서 codex만 입력하면 됩니다. 코드베이스를 자동으로 스캔하고 바로 대화를 시작할 수 있습니다."
-->

---

## 핵심 인터랙션 인터페이스

워크플로우에 맞춰 4가지 환경 중 선택하세요.

1. **대화형 CLI:** 터미널 환경, 빠른 버그 수정, 스크립팅
2. **Desktop App:** 멀티 프로젝트, Git Worktree 격리, 시각적 Diff
3. **IDE 확장:** VS Code/Cursor 내장, 인라인 편집, 긴밀한 코딩 루프
4. **Codex Cloud:** 비동기 장기 실행, 완료 후 PR 자동 생성

| 주요 명령어 | 설명 |
| --- | --- |
| `/model` | 모델 및 추론 강도 전환 |
| `/plan` | 계획 모드 진입 |
| `/mention` 또는 @ | 대화에 파일 첨부 |
| `/status` | 세션 설정 및 토큰 사용량 확인 |

<!--
"CLI는 빠르고, 앱은 멀티태스킹에 좋으며, IDE는 집중 코딩에, 클라우드는 대규모 리팩토링에 적합합니다."
-->

---

## 설정 시스템 분석 (`config.toml`)

Codex CLI 설정 **우선순위 계층 구조**

1. **CLI 플래그** (최고 우선순위, 예: `--model, --sandbox, --ask-for-approval 등`)
2. **프로젝트 설정** (`.codex/config.toml`)
3. **사용자 설정** (`~/.codex/config.toml`)
4. **시스템 환경변수 및 내장 기본값** (최저 우선순위)

> **프로필 기능:** `--profile fast`, `--profile careful` 로 미리 지정된 설정 프리셋을 빠르게 전환할 수 있습니다.

```toml
[profiles.fast]
model = "gpt-5.1-codex-mini"
model_reasoning_effort = "low"
approval_policy = "on-request"
sandbox_mode = "workspace-write"
personality = "pragmatic"

[profiles.careful]
model = "gpt-5.4"
model_reasoning_effort = "xhigh"
```

<!--
"팀 단위 프로젝트에서는 프로젝트 루트에 config.toml을 두어 팀원 모두가 동일한 환경에서 작업하도록 강제할 수 있습니다."
-->

---

## 어떤 모델을 선택해야 할까요?

- **`gpt-5.5-pro`:** 1M 컨텍스트. 코딩+추론+컴퓨터 제어를 갖춘 플래그십
- **`gpt-5.5` (권장):** 400K 컨텍스트. Codex 작업에 권장되는 기본 모델
- **`gpt-5.4`:** 1M 컨텍스트. GPT-5.5 이전 플래그십
- **`gpt-5.4-mini`:** 400K 컨텍스트. gpt-5.4 대비 30%, 2배 더 빠름. 서브 에이전트, 단순한 작업에 적합

> **추론 수준 (Reasoning Effort):** `minimal` (빠른 조회), `low` (간단/반복 작업), `medium`(개발 작업), `high` (복잡한 버그, 아키텍처 설계), `xhigh` (보안 감사, 심층 분석)

<!--
"상황에 맞게 모델과 추론 수준을 변경하세요. 단순한 린트 작업에 xhigh 수준의 추론을 쓸 필요는 없습니다."
-->

---

## Codex 비용은 얼마인가요?

- **ChatGPT 플랜 연동:** 요금제에 따라 제한 있음.
  - Plus ($20/월, 5시간 단위 컷)
  - Pro ($200/월, Plus 5배)
  - Business ($30/월, Plus + 팀용 정책 기반)
- **API 결제:** 토큰당 과금 (프롬프트 캐싱 할인 적용)
- **비용 최적화 팁:**
  - 일상 작업엔 `xxx-mini` 모델도 충분
  - `xhigh` 추론은 꼭 필요한 경우에만 사용 (비용 3~5배)
  - `/compact`를 사용해 불필요한 컨텍스트 정리

<!--
"비용을 아끼려면 프로필 기능을 적극 활용하세요. CI 파이프라인에서는 미니 모델을 사용하는 것이 정석입니다."
-->

---

## 최적 도구 결정 프레임워크

**상황별 최적의 도구 선택법**

- **3개 이상의 파일 수정?** → **Plan 모드 (`/plan`)** 사용
- **작은 버그 수정?** → **직접 실행**
- **명확한 지시 vs 모호한 요구사항:**
  - *명확:* "이 함수에 예외 처리 추가해" (직접 실행)
  - *결과:* "이 함수에 예외 처리 추가해" (비대화 실행)
  - *모호:* "인증 모듈 전체 구조 개선해" (Plan 모드)

<!--
"Codex가 올바른 방향으로 가게 하려면, 먼저 계획을 짜게 하고 사람이 검토하는 Plan 모드의 생활화가 필수적입니다."
-->

---

## 샌드박스 및 승인 시스템 작동 방식

**이중 보안 모델 (가능한 것 vs 물어볼 것)**

<div class="cols">
	<div class="card">
		<h3>Sandbox</h3>
		무엇을 할 수 있는지 제한합니다.<br />
		`read-only` · `workspace-write` · `danger-full-access`
	</div>
	<div class="card">
		<h3>Approval</h3>
		언제 사람에게 물을지 정합니다.<br />
		`untrusted` · `on-request` · `never`
	</div>
</div>

1. **샌드박스 (OS 커널 수준 적용):** `codex --sandbox=workspace-write`
   - `read-only`: 읽기 전용 (안전 탐색)
   - `workspace-write`: 작업 공간만 쓰기 허용 **(기본값)**
   - `danger-full-access`: 전체 시스템 접근 허용
2. **승인 정책:** `codex --ask-for-approval=on-request`
   - `untrusted`: 모든 변경에 승인 요청
   - `on-request`: 경계 위반 시에만 승인 요청 **(기본값)**
   - `never`: 승인 없이 자동 진행 (CI/CD 자동화)

<!--
"Codex의 샌드박스는 Docker가 아닙니다. Mac의 Seatbelt, Linux의 Landlock을 사용해 커널 레벨에서 원천적으로 차단합니다."
-->

---

## AGENTS.md는 어떻게 작동하나요?

- 프로젝트 운영 규칙을 정의하는 **글로벌 오픈 표준**
- 루트의 `AGENTS.md`부터 하위 디렉토리의 `AGENTS.override.md`까지 자동 병합
- 모호한 지시 금지 ("조심해서 작업해" ❌). 명령·금지·검증 기준을 적어야 효과적 ("테스트는 `pytest -v`로 실행해" ⭕️)

> AGENTS.override.md는 AGENTS.md보다 우선합니다.

```bash
~/.codex/AGENTS.md
  └─ /repo/AGENTS.md
      └─ /repo/services/AGENTS.md
          └─ /repo/services/payments/
               AGENTS.override.md
```

<!--
"AGENTS.md는 프로젝트의 시스템 프롬프트입니다. 여기에 명확한 룰을 적어두면 매번 지시할 필요가 사라집니다."
-->

---

## Hooks

세션 라이프사이클과 같은 이벤트에서 스크립트를 자동 실행합니다.

- `SessionStart`: 시작 시 동적 데이터(브랜치 이름 등) 주입
- `UserPromptSubmit`: 사용자 입력 전 프롬프트 가로채기 (v0.116.0)
- `AfterToolUse`: 개별 도구 사용 직후 린팅 등 실행
- `AfterAgent`: 에이전트가 완전한 턴을 마친 후
- `Stop`: 세션 종료 시 알림

```toml
[[hooks]]
event = "SessionStart"
command = "echo 'Current date: $(date +%Y-%m-%d)'"

[[hooks]]
event = "AfterToolUse"
command = "echo 'Tool completed' >> /tmp/codex-log.txt"
```

<!--
"Claude Code의 Hook 모델처럼, Codex도 특정 이벤트마다 린터 실행이나 알림 발송을 자동화할 수 있습니다."
-->

---

## MCP (Model Context Protocol)이란?

외부의 툴이나 데이터를 Codex의 컨텍스트로 끌어옵니다.

<div class="cols">
	<div class="card">
		<h3>STDIO</h3>
		로컬 프로세스 실행<br />예: Context7, GitHub 도구
	</div>
	<div class="card">
		<h3>HTTP</h3>
		원격 서비스 연결<br />예: Figma, Sentry, 사내 API
	</div>
</div>

- **설정:** `config.toml`에 `[mcp_servers]` 블록으로 정의

```toml
[mcp_servers.context7]
enabled = true
command = "npx"
args = ["-y", "@upstash/context7-mcp"]
```

<!--
"MCP는 Codex의 눈과 귀를 넓혀줍니다. 사내 데이터베이스나 서드파티 서비스와 Codex를 직접 연결해 보세요."
-->

---

## Skills란?

필요할 때만 로드되는 **재사용 가능한 도메인 워크플로우 패키지**입니다. ~/.codex/skills/ (또는 $CODEX_HOME/skills/)

- **구성:** `SKILL.md` (지침) + `scripts/` (실행파일) + `agents/openai.yaml`
- **활용:** 배포, 보안 감사(`$security-audit`), 반복적인 작업 또는 생성 등

자연어로 요청 `오늘 안 읽은 Gmail 스레드를 요약해 줘.` 하거나 `$my-skill 오늘 받은 중요 메일을 요약해 줘.` 멘션 플래그를 사용하여 실행.

```bash
my-skill/
  SKILL.md           (required: instructions)
  scripts/           (optional: executable scripts)
  references/        (optional: reference docs)
  assets/            (optional: images, icons)
  agents/openai.yaml (optional: metadata, UI, dependencies)
```

<!--
"반복되는 복잡한 작업이 있다면 Skill로 만드세요. 팀원 모두가 $skill-name 한 번으로 동일한 고품질 워크플로우를 실행할 수 있습니다."
-->

---

## 플러그인 (Plugins)

Plugins는 Skills, MCP, hooks, app connector를 하나의 패키지로 묶습니다.

- 설치: `codex plugin install/remove <name>`
- 플러그인 확인: `codex plugin list 또는 /plugins`
- **`@plugin` 멘션:** 채팅 중 `@deploy` 처럼 설치된 플러그인을 직접 멘션하여 모델 컨텍스트에 즉시 포함시킵니다.

자연어로 요청 `오늘 안 읽은 Gmail 스레드를 요약해 줘.` 하거나 `@gmail 오늘 받은 중요 메일을 요약해 줘.` 멘션 플래그를 사용하여 실행.

<!--
"과거에는 Skill과 MCP를 따로 설정해야 했지만, 이제는 플러그인 하나로 설치하고 @멘션하여 직관적으로 사용할 수 있습니다."
-->

---

## Plan Mode 및 Steer Mode

- **Plan Mode (계획 설계):**: `/plan`으로 진입. 파일을 읽고 코드베이스를 분석하여 구현 계획을 제안, 승인할 때까지 변경 사항을 적용하지 않음
- **Steer Mode (방향 전환):** 에이전트 작업 도중 개입 가능
  - `Enter`: 진행 중인 작업을 즉시 수정 ("잠깐, 방식 바꿔")
  - `Tab`: 현재 작업 완료 후 후속 작업으로 대기열 추가 ("이거 끝나면 린트도 해")

<!--
"결과가 나올 때까지 기다릴 필요가 없습니다. 실시간으로 에이전트의 생각을 보고 즉각적으로 방향을 틀어주세요."
-->

---

## 비대화형 모드 (`codex exec`)

CI/CD 및 셸 자동화 스크립트를 위한 헤드리스 모드입니다.

- codex --sandbox=danger-full-access --ask-for-approval=never
- `codex exec --sandbox=danger-full-access --ask-for-approval=never "실패한 테스트 수정해"`
- **파이프라인 연동:** `--json` 플래그로 JSONL 이벤트 스트림 출력
- **구조화된 출력:** `--output-schema`로 응답을 JSON Schema 규격에 맞게 강제
- `codex exec review --base main` (브랜치 간 코드 리뷰)

<!--
"TUI 오버헤드 없이 순수 자동화를 원할 때 codex exec를 사용하세요. CI 파이프라인의 핵심 도구입니다."
-->

---

## Codex Cloud

내 PC가 아닌 **OpenAI 인프라**에서 작업을 비동기 실행합니다.

- `codex cloud exec --env my-env "주문 API 500 에러 원인 분석해"`
- 백그라운드 실행 후 완료 시 PR 생성
- `codex cloud status`로 진행 상황 확인
- `codex apply <TASK_ID>`로 클라우드의 결과를 로컬에 병합

<!--
"수백 개의 파일을 수정하는 마이그레이션 작업은 클라우드에 던져두고, 여러분은 다른 업무에 집중하세요."
-->

---

## Codex Desktop App

CLI의 기능을 유지하면서 **시각적 멀티태스킹**에 최적화된 앱입니다.

- **Git Worktree 격리:** 현재 작업을 망치지 않고 병렬 스레드 실행
- **인라인 Diff 리뷰:** 에디터처럼 변경점을 보며 수락/거절/커밋
- **Automations:** 주기적 이슈 분류, 빌드 모니터링 자동화
- Windows 및 macOS 완벽 네이티브 지원 (WSL 불필요)

<!--
"여러 프로젝트를 동시에 띄워놓고 시각적으로 관리하고 싶다면 Desktop App이 최고의 선택입니다."
-->

---

## GitHub Action 및 CI/CD

공식 `openai/codex-action@v1`을 이용해 자동화 파이프라인 구축

```yaml
- uses: openai/codex-action@v1
  with:
    openai-api-key: ${{ secrets.OPENAI_API_KEY }}
    prompt-file: review-prompt.md
    sandbox: workspace-write
    safety-strategy: drop-sudo
```
- PR이 열리면 자동 코드 리뷰 수행
- `drop-sudo` 등 권한 축소 보안 전략 내장

<!--
"단순한 린터를 넘어 논리적 버그를 잡아내는 AI 리뷰어를 파이프라인에 구축할 수 있습니다."
-->

---

## Codex SDK

TypeScript 기반 SDK(`@openai/codex-sdk`)로 사내 도구에 에이전트를 내장하세요.

```typescript
import { Codex } from "@openai/codex-sdk";

const codex = new Codex();
const thread = codex.startThread();
const response = await thread.run("CI 에러 원인 분석해줘");
```

- 비동기 이벤트 스트림 지원
- 구조화된 JSON 응답 강제
- 멀티모달(이미지+텍스트) 입력 지원

<!--
"사내 슬랙봇이나 백오피스 시스템에 Codex의 능력을 그대로 이식할 수 있습니다."
-->

---

## 성능 최적화

컨텍스트 예산(토큰) 관리가 속도와 품질을 결정합니다.

1. **사전 압축:** 컨텍스트 창이 차기 전에 `/compact`로 대화 이력 요약
2. **명시적 참조:** 에이전트가 코드를 뒤지게 놔두지 말고 `@filename`으로 타겟 파일 지정
3. **가벼운 모델 활용:** `--profile fast` 로 단순 작업 비용/시간 절약
4. **결과 중심 루프:** "테스트 통과할 때까지 반복해" 라고 한 번에 지시

<!--
"가장 큰 성능 저하는 불필요한 파일 탐색에서 옵니다. 타겟을 명확히 짚어주면 응답 속도가 비약적으로 상승합니다."
-->

---

## 엔터프라이즈 배포

관리자가 사용자 통제 권한을 잃지 않습니다.

- `/etc/codex/requirements.toml`: 사용자가 임의로 샌드박스나 승인 정책을 완화하지 못하도록 **강제 제약**
- **MDM 지원:** Jamf, Fleet 등으로 사내 설정(TOML) 일괄 배포
- **OpenTelemetry:** 모든 실행 및 API 호출 트래픽 중앙 모니터링
- Data Privacy: Enterprise 플랜 사용 시 학습 데이터에 미포함

<!--
"보안팀을 설득하기 가장 좋은 도구입니다. 개발자 PC의 로컬 샌드박스부터 API 호출까지 모든 권한을 중앙에서 통제합니다."
-->

---

## 모범 사례 및 안티패턴

**성공적인 AI 페어 프로그래밍 규칙**

- ❌ **안티패턴:** "에러 고쳐줘" (무의미한 탐색에 토큰 낭비)
- ⭕️ **모범 사례:** "이 파일 `src/api.py`의 42번 줄 TypeError 고쳐. 완료 후 `pytest` 실행해."
- ❌ **안티패턴:** main 브랜치에서 직접 실행
- ⭕️ **모범 사례:** 항상 피처 브랜치에서 실행하고 `/diff` 검토 후 커밋

<!--
"AI에게 '알아서 해'라고 던져주는 것은 최악의 방법입니다. 정확한 경계와 완료 조건을 제시하는 것이 핵심입니다."
-->

---

## 워크플로 레시피

**시나리오별 정석 패턴**

1. **새 프로젝트:** `codex` 실행 → 요구사항 프롬프팅 → `/init` 으로 AGENTS.md 생성
2. **일상 기능 개발:** `@파일1 @파일2` 지정 → 요구사항 명시 → 테스트 수행 지시
3. **대규모 리팩토링:** `/plan DB ORM 마이그레이션` → Steer 모드로 방향 조정
4. **코드 리뷰:** `/review` 으로 git 변경 내용 리뷰 자동화

<!--
"결국 이 4가지 패턴이 실무의 90%를 차지합니다. 이 레시피대로만 사용하셔도 생산성이 크게 오릅니다."
-->

---

## 참고 자료

추가 학습이 필요하시다면 아래 공식 채널을 확인하세요.

- **GitHub Repository:** `openai/codex` (이슈 및 소스코드)
- **공식 API Docs:** 플랫폼 가격 및 SDK 문서 (`platform.openai.com`)
- **Community:** `feiskyer/codex-settings` (커뮤니티 제공 프롬프트 및 스킬)
- **OpenAI Blog:** 릴리스 노트 및 활용 사례 업데이트

<!--
"오늘 다루지 못한 세부 옵션이나 에러 해결법은 공식 레포지토리와 이슈 트래커에 모두 정리되어 있습니다."
-->

--- 

## 정리

Codex를 효과적으로 쓰려면 기능 보다 **운영 모델**을 먼저 잡아야 합니다.

<div class="cols">
	<div class="card">
		<h3>5개 실행 표면</h3>
		CLI · Desktop · IDE · Cloud · Browser/Extension
	</div>
	<div class="card">
		<h3>5개 핵심 시스템</h3>
		config · sandbox/approval · AGENTS.md · MCP · Skills
	</div>
</div>

- 작업은 **읽기 → 계획 → 패치 → 명령 실행 → 검토**의 루프로 진행
- 안전성은 **OS 샌드박스 + 승인 정책**의 조합으로 통제
- 팀 표준은 `AGENTS.md`, 자동화는 `hooks`, 외부 연동은 `MCP/Skills`로 확장
