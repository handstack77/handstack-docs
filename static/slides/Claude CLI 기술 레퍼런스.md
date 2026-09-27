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
section.reference-page { justify-content: flex-start; }
section.reference-page pre,
section.reference-page marp-pre,
section.reference-page pre code,
section.reference-page marp-pre code { font-size: 24px; line-height: 1.25; }
section.reference-page table { font-size: 25px; }
section.reference-page img { max-height: 440px; max-width: 100%; object-fit: contain; }
</style>

# Claude CLI 기술 레퍼런스

Claude Code의 실행 방식과 권한 경계를 구분하고, 작은 변경을 검토 가능한 결과로 만듭니다.

<br />
<br />
<br />
<br />
<br />

**QCN**


<!--
발표: 첫 화면의 목표를 말한 뒤 핵심 개념과 예제로 진행합니다. 확인 질문 뒤에는 답할 시간을 주고, 마지막 완료 기준을 남겨 질문을 받습니다.
발표 구성 참고: MIT OpenCourseWare, Patrick Winston, How to Speak (2018), https://ocw.mit.edu/courses/res-tll-005-how-to-speak-january-iap-2018/pages/how-to-speak/
-->

---

## Claude Code를 사용할 때 구분할 것

- REPL·Print·IDE·원격 실행·SDK: 작업 환경
- Permission·Sandbox: 승인 규칙과 실행 격리
- CLAUDE.md: 프로젝트 지침
- Hooks·Skills·Subagents·MCP: 자동 검사·작업 절차·위임·외부 도구

설정을 공유하는 것과 조직 정책을 강제하는 것은 다릅니다.

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

## 설치 및 인증 (1/4)

<!-- _class: reference-page -->



[공식 설치 안내](https://code.claude.com/docs/en/setup)에서 OS·셸을 선택합니다. 원격 설치 스크립트는 출처와 내용을 확인한 뒤 실행합니다.

---

## 설치 및 인증 (2/4)

<!-- _class: reference-page -->



```bash
# 네이티브 설치 (macOS/Linux, 권장)
curl -fsSL https://claude.ai/install.sh | bash

# Windows PowerShell
irm https://claude.ai/install.ps1 | iex
```

---

## 설치 및 인증 (3/4)

<!-- _class: reference-page -->



- **인증:** `claude auth login`
  - 지원 구독: 플랜별 사용량 한도·추가 사용 조건 확인
  - Claude Console: API 사용량 기반 청구
  - 엔터프라이즈: AWS Bedrock, Google Vertex AI, Microsoft Foundry

---

## 설치 및 인증 (4/4)

<!-- _class: reference-page -->



- **진단:** `claude doctor`, `claude --version`

---

## 빠른 시작: 첫 번째 세션

1. 프로젝트 디렉토리로 이동: `cd ~/my-project`
2. CLI 실행: `claude` (대화형 REPL이 표시되며 프로젝트 구조를 자동 확인)
3. 프롬프트 입력: *"이 저장소가 무엇을 하는지 핵심 파일을 읽고 요약해 줘"*
4. 계획 모드 사용: `/plan 인증 모듈 리팩토링`
5. 결과 확인: `/cost`로 사용량을 확인하고, Git diff·테스트로 이미 적용된 변경을 검토

---

## 핵심 인터랙션 인터페이스 (1/4)

<!-- _class: reference-page -->



워크플로우에 맞춰 표면을 선택하세요.

1. **대화형 REPL:** 터미널 환경, 탐색적 개발

2. **Print 모드 (`-p`):** 단발 질의, 파이프 입력, 스크립트 연동

<!--
"REPL은 탐색에, Print 모드는 자동화에, IDE는 집중 코딩에, SDK는 내재화에 적합합니다."
-->

---

## 핵심 인터랙션 인터페이스 (2/4)

<!-- _class: reference-page -->



3. **IDE 확장:** VS Code 등 내장, 인라인 편집

4. **Remote/Background Agent:** 비동기 장기 실행

5. **SDK:** 사내 도구·슬랙봇에 에이전트 내장

---

## 핵심 인터랙션 인터페이스 (3/4)

<!-- _class: reference-page -->



| 주요 명령어 | 설명 |
| --- | --- |
| `/model` | 모델 전환 |
| `/plan` | Plan Mode 진입 |
| `/cost` | 비용·토큰 사용량 확인 |

---

## 핵심 인터랙션 인터페이스 (4/4)

<!-- _class: reference-page -->



| 주요 명령어 | 설명 |
| --- | --- |
| `/status` | 세션 설정 확인 |

---

## 설정의 적용 순서 (1/3)

<!-- _class: reference-page -->



같은 키는 일반적으로 위쪽이 우선합니다.

1. 조직의 managed settings

2. CLI 인자

---

## 설정의 적용 순서 (2/3)

<!-- _class: reference-page -->



3. `.claude/settings.local.json`

4. `.claude/settings.json`

5. `~/.claude/settings.json`

---

## 설정의 적용 순서 (3/3)

<!-- _class: reference-page -->



```json
{ "permissions": { "defaultMode": "default" } }
```

`/status`로 로드한 파일, `claude doctor`로 잘못된 설정을 확인합니다. 목록 병합·환경 변수에는 별도 규칙이 있습니다.
[설정 우선순위](https://code.claude.com/docs/en/settings)

---

## 모델과 추론 강도 선택

- 빠른 탐색·반복 작업과 복잡한 설계·검토를 구분합니다.
- `/model`에서 현재 계정의 모델·별칭을 확인합니다.
- `/effort` 등 지원되는 조절 방법은 설치 버전에서 확인합니다.
- 후보 모델에 같은 입력·완료 테스트를 적용해 비교합니다.

모델명·기본값·확장 컨텍스트·추론 단계는 제공 환경에 따라 달라집니다.
[모델 설정](https://code.claude.com/docs/en/model-config)

---

## 비용과 사용량 확인

- 구독의 사용 한도와 API 토큰 청구를 구분합니다.
- `/cost`의 표시와 실제 계정 청구·한도를 함께 확인합니다.
- `--max-turns`는 작업 횟수 제한이지 고정 비용 보장이 아닙니다.
- 캐시·모델 선택·불필요한 재실행 감소로 사용량을 관리합니다.

Batch API는 별도 API 기능이며 CLI 대화가 자동으로 할인되는 것은 아닙니다.
[비용 관리](https://code.claude.com/docs/en/costs)

---

## 권한 모드와 도구 규칙

| 모드 | 확인할 동작 |
|---|---|
| `default` | 도구·기존 허용 규칙에 따라 승인 요청 |
| `acceptEdits` | 파일 편집 등 자동 승인 범위 확대 |
| `auto` | 지원 환경에서 자동 안전성 검토 |
| `plan` | 소스 편집 없이 탐색·계획 |
| `bypassPermissions` | 승인 생략; 별도로 격리된 환경에서만 검토 |

`allow`·`ask`·`deny` 규칙은 `/permissions`에서 확인합니다.
[도구별 규칙 문법](https://code.claude.com/docs/en/permissions)

---

## Sandbox와 Permission의 차이 (1/3)

<!-- _class: reference-page -->



Permission은 도구 승인 규칙, Sandbox는 지원 도구의 파일·네트워크 접근 범위입니다.

```json
{ "sandbox": { "enabled": true } }
```

---

## Sandbox와 Permission의 차이 (2/3)

<!-- _class: reference-page -->



- OS·런타임별 지원과 실제 활성 상태를 확인합니다.

- 허용 경로·도메인·예외를 검토합니다.

- 특정 명령 차단만으로 비밀 유출이나 운영 변경이 완전히 방지되지는 않습니다.

---

## Sandbox와 Permission의 차이 (3/3)

<!-- _class: reference-page -->



[샌드박스 설정과 제한](https://code.claude.com/docs/en/sandboxing)

---

## CLAUDE.md는 어떻게 작동하나요? (1/3)

<!-- _class: reference-page -->



- 프로젝트 루트에 위치하는 프로젝트 지침 파일

- 매 세션 자동으로 로딩되어 아키텍처·빌드·테스트·금지 규칙을 전달

- 모호한 지시 금지 ("조심해서 작업해" ❌). 명령·금지·검증 기준을 적어야 효과적

---

## CLAUDE.md는 어떻게 작동하나요? (2/3)

<!-- _class: reference-page -->



```markdown
## Build & Run
npm install && npm run dev

## Known Issues
- DB 커넥션 풀 타임아웃 5초
```

`/init` 명령으로 초안을 생성할 수 있습니다.

---

## CLAUDE.md는 어떻게 작동하나요? (3/3)

<!-- _class: reference-page -->



지침은 권한 정책을 대체하지 않습니다. 예제의 빌드 명령·알려진 문제는 실제 프로젝트에 맞게 수정합니다.

---

## 계획·방향 조정·되돌리기

- `/plan` 또는 모드 전환으로 구현 전에 계획을 검토합니다.
- 진행 중에는 변경 금지 범위와 수정할 방향을 명확히 전달합니다.
- `/rewind` 또는 `Esc` 두 번으로 지원되는 체크포인트 복원을 선택합니다.

체크포인트는 모든 셸 작업·DB·외부 서비스 변경을 되돌리지 않습니다. Git과 별도 백업·복구 절차를 함께 사용합니다.

[체크포인트 범위](https://code.claude.com/docs/en/checkpointing)

---

## 잠깐, 구분해 보기

MCP를 연결하면 데이터 조회와 외부 변경 권한도 같은 범위일까요?

<!--
질문 후 잠시 기다립니다. 답이 없으면 앞에서 본 예제를 다시 가리킵니다.
확인할 답: 서버가 제공하는 읽기·쓰기 도구와 자격 증명 범위를 따로 확인해야 합니다.
다음 주제로 넘어가기 전에 차이를 청중의 표현으로 한 번 확인합니다.
-->

---

## MCP: 외부 서비스 연결 (1/3)

<!-- _class: reference-page -->



GitHub·DB·Sentry·Slack 같은 외부 도구를 연결합니다.
프로젝트 공유 설정은 `.mcp.json`을 사용합니다.

---

## MCP: 외부 서비스 연결 (2/3)

<!-- _class: reference-page -->



```json
{
  "mcpServers": {
    "team-service": {
      "type": "http",
      "url": "https://example.com/mcp"
    }
  }
}
```

---

## MCP: 외부 서비스 연결 (3/3)

<!-- _class: reference-page -->



예시 URL은 실제 서버로 교체합니다. 비밀 토큰을 커밋하지 않고, 서버·도구별 읽기와 쓰기 권한을 구분합니다.
[MCP 설정](https://code.claude.com/docs/en/mcp)

---

## Skills: 반복 절차를 파일로 관리 (1/3)

<!-- _class: reference-page -->



프로젝트의 `.claude/skills/security-review/SKILL.md`에 지침을 둡니다.

---

## Skills: 반복 절차를 파일로 관리 (2/3)

<!-- _class: reference-page -->



```yaml
---
name: security-review
description: 변경된 코드의 보안 검토 절차
disable-model-invocation: true
---
```

- 위 설정은 사용자가 `/security-review`로 호출하는 예입니다.

---

## Skills: 반복 절차를 파일로 관리 (3/3)

<!-- _class: reference-page -->



- 자동 선택은 설명과 호출 설정에 따라 달라집니다.

- 지침·예제·검증 기준을 함께 관리합니다.

[스킬 구조와 호출 제어](https://code.claude.com/docs/en/skills)

---

## Subagents: 분리된 작업 맥락

- 탐색·검토처럼 분리 가능한 하위 작업을 맡깁니다.
- `/agents`에서 정의·도구·모델을 확인합니다.
- 메인 세션은 결과 통합과 충돌·누락 검증을 담당합니다.
- 모델 선택과 병렬 실행에는 추가 비용·권한 검토가 필요합니다.

Agent Teams와 일반 Subagent는 같은 기능이 아닙니다. 지원 조건과 제약은 공식 문서에서 확인합니다.

[Subagents](https://code.claude.com/docs/en/sub-agents)

---

## Hooks: 이벤트와 검사 연결 (1/3)

<!-- _class: reference-page -->



예: 편집 뒤 검사 스크립트를 실행합니다.

<!--
PreToolUse·UserPromptSubmit·Stop·SubagentStop·SessionStart·SessionEnd의 목적도 비교합니다. command·prompt·http·agent 타입과 async 지원 여부는 이벤트별로 확인합니다. Hook 실패·시간 초과는 별도 처리하며, 실행·검증 성공을 무조건 보장한다고 설명하지 않습니다.
-->

---

## Hooks: 이벤트와 검사 연결 (2/3)

<!-- _class: reference-page -->



```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "node scripts/check-edited-file.js"
      }]
    }]
  }
}
```

---

## Hooks: 이벤트와 검사 연결 (3/3)

<!-- _class: reference-page -->



스크립트는 stdin의 이벤트 JSON을 해석하도록 구현합니다. `$FILE_PATH`가 자동 제공된다고 가정하지 않습니다.
[이벤트·종료 코드·차단 조건](https://code.claude.com/docs/en/hooks)

---

## 비대화형 모드 (`claude -p`) (1/2)

<!-- _class: reference-page -->



CI/CD 및 셸 자동화를 위한 헤드리스 모드입니다.

```bash
claude -p "실패한 테스트 원인을 분석해 줘" --output-format json
claude -p "lint 수정" --max-turns 10 --allowedTools "Edit,Bash(npm run lint)"
```

```json
{ "type": "result", "subtype": "success", "total_cost_usd": 0.0034, "is_error": false }
```

---

## 비대화형 모드 (`claude -p`) (2/2)

<!-- _class: reference-page -->



- `--output-format`: text(기본) / json / stream-json

- 종료 코드와 `is_error`, 최종 결과·테스트를 함께 확인합니다. 예시 비용 값은 실제 청구액이 아닙니다.

---

## 성능 최적화

컨텍스트 예산(토큰) 관리가 속도와 품질을 결정합니다.

1. **사전 압축:** 컨텍스트가 차기 전에 `/compact`로 대화 이력 요약
2. **명시적 참조:** 파일 경로를 직접 지정해 탐색 낭비 제거
3. **모델 라우팅:** 작업 난이도에 맞는 모델을 선택하고 같은 테스트로 비교
4. **결과 중심 루프:** "테스트 통과할 때까지 반복해"처럼 완료 조건을 한 번에 지시

---

## 조직 운영과 감사

- managed settings: 조직의 권한·모델 정책 적용
- AWS Bedrock·Google Vertex AI·Microsoft Foundry: 사용 환경별 인증·청구 검토
- 조직 사용량 API: 제공 지표·권한·보관 기간 확인
- Hooks·감사 로그: 수집 범위와 누락·실패·민감정보 처리 확인

Hooks가 모든 외부 부작용을 완전하게 기록한다고 가정하지 않습니다.

[조직 운영 문서](https://code.claude.com/docs/en/overview)

---

## 모범 사례 및 안티패턴

**성공적인 AI 페어 프로그래밍 규칙**

- ❌ **안티패턴:** "에러 고쳐줘" (무의미한 탐색에 토큰 낭비)
- ⭕️ **모범 사례:** "이 파일 `src/api.py`의 42번 줄 TypeError 고쳐. 완료 후 테스트 실행해."
- ❌ **안티패턴:** 포맷팅을 매번 프롬프트로 요청
- ⭕️ **모범 사례:** `PostToolUse` Hook으로 포맷팅을 연결하고 실패 시 CI에서도 검증

---

## 워크플로 레시피

**시나리오별 정석 패턴**

1. **새 프로젝트:** `claude` 실행 → 분석 요청 → `/init`으로 CLAUDE.md 생성
2. **일상 기능 개발:** 파일 경로 지정 → 요구사항 명시 → 테스트 수행 지시
3. **대규모 리팩토링:** `/plan` → 승인 → Steer로 방향 조정
4. **코드 리뷰:** Git diff를 대상으로 검토 요청; `/code-review`는 해당 스킬·플러그인이 있을 때 사용

---

## 필요할 때 찾을 레퍼런스

- [공식 문서](https://code.claude.com/docs/en/overview): 설치·사용 환경
- [설정](https://code.claude.com/docs/en/settings) · [권한](https://code.claude.com/docs/en/permissions) · [Hooks](https://code.claude.com/docs/en/hooks)
- [MCP](https://code.claude.com/docs/en/mcp) · [Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview)
- [비용 관리](https://code.claude.com/docs/en/costs)
- [Blake Crosley 가이드](https://blakecrosley.com/ko/guides/claude-code): 커뮤니티 참고, 공식 규격 아님

---

## 팀에서 합의할 기준

- 작업 경로·허용 도구·완료 테스트를 요청에 명시합니다.
- CLAUDE.md·설정·Hooks·Skills·Subagents의 책임을 구분합니다.
- 변경 diff와 테스트 결과, 외부 부작용을 사람이 확인합니다.

<!--
질문을 받는 동안 이 확인 기준을 화면에 남깁니다. 청중이 자신의 업무에 적용할 다음 행동 하나를 고르게 합니다.
-->
