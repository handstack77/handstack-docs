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
section.reference-page { justify-content: flex-start; }
section.reference-page pre,
section.reference-page marp-pre,
section.reference-page pre code,
section.reference-page marp-pre code { font-size: 24px; line-height: 1.25; }
section.reference-page table { font-size: 25px; }
section.reference-page img { max-height: 440px; max-width: 100%; object-fit: contain; }
</style>

# Codex CLI 기술 레퍼런스

Codex의 실행 방식·설정·보안 경계를 읽고, 작은 변경을 검토 가능한 결과로 만듭니다.

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

## Codex를 사용할 때 구분할 것

- CLI·앱·IDE·Cloud: 작업하는 환경
- 모델·추론 강도: 문제를 푸는 방식
- 샌드박스·승인: 실행 범위와 승인 요청
- AGENTS.md·Skills·MCP·Plugins: 지침과 확장 기능

한 기능의 설정이 다른 기능의 권한까지 보장하지는 않습니다.

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

## 설치와 인증

1. [공식 CLI 설치 안내](https://developers.openai.com/codex/cli/)에서 OS 지원 조건을 확인합니다.
2. 설치 후 `codex --version`·`codex --help`를 확인합니다.
3. `codex login`으로 지원되는 계정에 로그인합니다.

```bash
npm install -g @openai/codex
codex login
```

API 키 인증은 `codex login --with-api-key`의 표준 입력을 사용합니다. 키를 명령 인자·소스·로그에 남기지 않습니다.

---

## 첫 세션: 읽기부터 변경 검토까지

1. 프로젝트 폴더에서 `codex`를 실행합니다.
2. “핵심 파일을 읽고 구조를 요약해 줘”라고 요청합니다.
3. `/plan`으로 변경 범위와 검증 방법을 정합니다.
4. 구현을 요청한 뒤 `/diff`와 테스트 결과를 확인합니다.

`/diff`는 이미 생긴 변경의 검토입니다. 편집 전 승인과 혼동하지 않습니다.

---

## 핵심 인터랙션 인터페이스 (1/4)

<!-- _class: reference-page -->



워크플로우에 맞춰 4가지 환경 중 선택하세요.

1. **대화형 CLI:** 터미널 환경, 빠른 버그 수정, 스크립팅

2. **Desktop App:** 멀티 프로젝트, Git Worktree 격리, 시각적 Diff

---

## 핵심 인터랙션 인터페이스 (2/4)

<!-- _class: reference-page -->



3. **IDE 확장:** VS Code/Cursor 내장, 인라인 편집, 긴밀한 코딩 루프

4. **Codex Cloud:** 비동기 장기 실행, 결과 검토 후 PR 생성 여부 결정

---

## 핵심 인터랙션 인터페이스 (3/4)

<!-- _class: reference-page -->



| 주요 명령어 | 설명 |
| --- | --- |
| `/model` | 모델 및 추론 강도 전환 |
| `/plan` | 계획 모드 진입 |
| `@파일` | 대화에 파일 첨부 |

---

## 핵심 인터랙션 인터페이스 (4/4)

<!-- _class: reference-page -->



| 주요 명령어 | 설명 |
| --- | --- |
| `/status` | 세션 설정 및 토큰 사용량 확인 |

---

## 설정·프로필·조직 정책 (1/3)

<!-- _class: reference-page -->



- 사용자 기본값: `~/.codex/config.toml`

- 신뢰한 프로젝트 설정: `.codex/config.toml`

- CLI 플래그: 세션별 선택

---

## 설정·프로필·조직 정책 (2/3)

<!-- _class: reference-page -->



- 조직 정책: 사용자가 완화할 수 있는 범위를 제한

```toml
approval_policy = "on-request"
sandbox_mode = "workspace-write"
```

---

## 설정·프로필·조직 정책 (3/3)

<!-- _class: reference-page -->



`--profile fast`·`--profile careful`로 프리셋을 선택할 수 있습니다. 프로필 파일 형식은 설치 버전의 도움말을 확인합니다. 팀 설정 파일만으로 정책이 강제되지는 않습니다.

[설정 안내](https://developers.openai.com/codex/config-basic/)

---

## 모델과 추론 강도 선택

- 단순 탐색·반복 작업: 지연 시간과 비용을 우선 비교합니다.
- 복잡한 결함·설계 검토: 검증 품질을 우선 비교합니다.
- 같은 입력과 테스트로 후보 모델을 평가합니다.

`/model`에서 현재 계정이 사용할 수 있는 모델과 추론 강도를 확인합니다. 지원 강도·컨텍스트 크기는 모델마다 다릅니다.

[현재 Codex 모델](https://developers.openai.com/codex/models/)

---

## 비용 확인

- **구독 사용**: 플랜별 사용 한도와 추가 사용 조건을 확인합니다.
- **API 사용**: 모델·입력·출력·캐시 사용량을 기준으로 계산합니다.
- 작업 범위와 완료 조건을 좁히고 불필요한 재실행을 줄입니다.
- `/status`로 상태를 확인하고, 긴 대화는 `/compact` 후 핵심 제약이 남았는지 확인합니다.

가격·모델별 배수는 고정해 외우지 않습니다.
[Codex 요금·한도](https://developers.openai.com/codex/pricing/)

---

## 계획·대화·자동화 선택

| 작업의 상태 | 시작 방식 |
|---|---|
| 요구사항이나 영향 범위가 불명확 | 계획을 먼저 검토 |
| 작은 수정, 재현·완료 조건이 명확 | 대화형 구현과 검증 |
| 입력·출력이 고정된 반복 작업 | 비대화형 실행 |

파일 수보다 위험과 불확실성을 기준으로 판단합니다.

---

## 샌드박스와 승인은 별개

| 구분 | 선택 | 의미 |
|---|---|---|
| 샌드박스 | `read-only` | 쓰기 제한 |
| 샌드박스 | `workspace-write` | 작업 공간 중심의 쓰기 |
| 샌드박스 | `danger-full-access` | 보호 범위를 크게 완화 |
| 승인 | `on-request` | 필요하다고 판단할 때 승인 요청 |
| 승인 | `never` | 승인 요청 없이 제한 내 실행·실패 반환 |

`never`는 샌드박스 해제가 아닙니다. OS·실행 환경·조직 정책에 따른 적용 범위를 확인합니다.

[보안과 권한](https://developers.openai.com/codex/security/)

---

## AGENTS.md는 어떻게 작동하나요?

- 프로젝트 운영 규칙을 정의하는 지침 파일
- 작업 경로의 지침을 읽고 범위에 맞게 적용
- 모호한 지시 금지 ("조심해서 작업해" ❌). 명령·금지·검증 기준을 적어야 효과적 ("테스트는 `pytest -v`로 실행해" ⭕️)

> 같은 디렉토리에서는 AGENTS.override.md를 우선 확인합니다. 지침은 OS 보안 정책을 대체하지 않습니다.

```bash
~/.codex/AGENTS.md
  └─ /repo/AGENTS.md
      └─ /repo/services/AGENTS.md
          └─ /repo/services/payments/
               AGENTS.override.md
```

---

## Hooks: 이벤트에 맞춰 검사 실행 (1/3)

<!-- _class: reference-page -->



- `SessionStart`: 세션 시작

- `UserPromptSubmit`: 사용자 요청 제출

- `PostToolUse`: 도구 실행 뒤 검사

---

## Hooks: 이벤트에 맞춰 검사 실행 (2/3)

<!-- _class: reference-page -->



- `Stop`: 턴 종료 지점 / `SessionEnd`: 세션 종료

```toml
[[hooks.PostToolUse]]
matcher = "Bash"
[[hooks.PostToolUse.hooks]]
type = "command"
command = "node scripts/check-tool-result.js"
```

---

## Hooks: 이벤트에 맞춰 검사 실행 (3/3)

<!-- _class: reference-page -->



예제 스크립트는 직접 구현해야 합니다. `/hooks`에서 소스·신뢰 상태를 검토합니다.
[이벤트·입출력 규격](https://learn.chatgpt.com/docs/hooks)

---

## 잠깐, 구분해 보기

승인 정책이 never이면 샌드박스 제한도 해제될까요?

<!--
질문 후 잠시 기다립니다. 답이 없으면 앞에서 본 예제를 다시 가리킵니다.
확인할 답: 승인 요청 여부와 실행 가능 범위는 별개입니다. 샌드박스·조직 정책은 따로 적용됩니다.
다음 주제로 넘어가기 전에 차이를 청중의 표현으로 한 번 확인합니다.
-->

---

## MCP (Model Context Protocol)이란? (1/3)

<!-- _class: reference-page -->



외부의 툴이나 데이터를 Codex의 컨텍스트로 끌어옵니다.

- STDIO: 로컬 프로세스 실행

- HTTP: 원격 서비스 연결

---

## MCP (Model Context Protocol)이란? (2/3)

<!-- _class: reference-page -->



- **설정:** `config.toml`에 `[mcp_servers]` 블록으로 정의

```toml
[mcp_servers.context7]
enabled = true
command = "npx"
args = ["-y", "@upstash/context7-mcp"]
```

---

## MCP (Model Context Protocol)이란? (3/3)

<!-- _class: reference-page -->



> 외부 패키지는 출처·버전을 검토하고 연결 계정에 필요한 권한만 부여합니다.

---

## Skills란? (1/5)

<!-- _class: reference-page -->



필요할 때만 로드되는 **재사용 가능한 도메인 워크플로우 패키지**입니다. 저장소의 `.agents/skills/`, 사용자 홈의 `.agents/skills/`를 확인합니다.

---

## Skills란? (2/5)

<!-- _class: reference-page -->



- **구성:** `SKILL.md` (지침) + `scripts/` (실행파일) + `agents/openai.yaml`

- **활용:** 배포, 보안 감사(`$security-audit`), 반복적인 작업 또는 생성 등

---

## Skills란? (3/5)

<!-- _class: reference-page -->



자연어로 요청 `오늘 안 읽은 Gmail 스레드를 요약해 줘.` 하거나 `$my-skill 오늘 받은 중요 메일을 요약해 줘.` 멘션 플래그를 사용하여 실행.

---

## Skills란? (4/5)

<!-- _class: reference-page -->



```bash
my-skill/
  SKILL.md           (required: instructions)
  scripts/           (optional: executable scripts)
  references/        (optional: reference docs)
  assets/            (optional: images, icons)
  agents/openai.yaml (optional: metadata, UI, dependencies)
```

---

## Skills란? (5/5)

<!-- _class: reference-page -->



[스킬 탐색 경로와 작성법](https://developers.openai.com/codex/skills)

---

## Plugins: 확장 기능 묶음

Skills·MCP·Hooks 등 확장 기능을 묶어 배포합니다.

- `codex plugin --help`: 설치 버전의 관리 명령 확인
- `codex plugin list`: 사용 가능한 플러그인 확인
- `codex plugin add` / `remove`: 추가·제거
- 지원되는 환경에서 `@플러그인`으로 사용할 대상을 지정

예: 연결된 메일 도구로 “읽지 않은 중요 메일을 요약해 줘.”
설치와 계정 연결은 별개이며, 읽기·쓰기 권한을 확인합니다.

---

## 계획 모드와 작업 중 방향 조정

- `/plan`: 구현 전에 요구사항·대안·검증 방법을 정합니다.
- 작업 중 새 지시: 현재 작업 수정인지 후속 작업인지 구분해 전달합니다.
- 입력창의 안내로 즉시 전달·대기열 단축키를 확인합니다.

예: “스키마는 바꾸지 말고, 기존 컬럼을 사용해. 완료 후 해당 테스트만 실행해.”

계획을 검토한 뒤 구현을 명확히 요청합니다.

---

## 비대화형 실행 (1/3)

<!-- _class: reference-page -->



자동화는 제한된 작업 폴더와 권한에서 시작합니다.

```bash
codex exec --sandbox read-only --json "실패한 테스트 원인을 분석해"
codex review --base main
```

- `--json`: JSONL 이벤트

---

## 비대화형 실행 (2/3)

<!-- _class: reference-page -->



- `--output-schema`: 최종 응답 구조 지정

- 자동 수정은 `workspace-write` 등 필요한 범위만 허용

- `danger-full-access`와 무승인을 기본 CI 설정으로 사용하지 않습니다.

---

## 비대화형 실행 (3/3)

<!-- _class: reference-page -->



종료 코드·최종 응답·테스트 결과를 각각 확인합니다.

---

## Cloud: 원격 환경에서 실행

- `codex cloud exec --env <ENV_ID> "주문 API 오류를 분석해"`
- `codex cloud status <TASK_ID>`: 진행 상태
- `codex cloud diff <TASK_ID>`: 변경 검토
- `codex cloud apply <TASK_ID>`: 로컬 반영

인증·환경·네트워크 조건을 먼저 구성합니다. 완료가 자동 PR 생성이나 자동 병합을 뜻하지는 않습니다.

---

## Codex Desktop App

CLI의 기능을 유지하면서 **시각적 멀티태스킹**에 최적화된 앱입니다.

- **Git Worktree 격리:** 별도 작업 트리에서 변경 격리; 외부 서비스 부작용은 별도
- **인라인 Diff 리뷰:** 에디터처럼 변경점을 보며 수락/거절/커밋
- **Automations:** 주기적 이슈 분류, 빌드 모니터링 자동화
- 설치 전 [앱 안내](https://developers.openai.com/codex/app/)에서 OS·기능 지원 확인

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
- PR 이벤트·권한·결과 게시 단계를 별도 workflow로 구성
- `drop-sudo` 등 권한 축소 보안 전략 내장



[공식 Action 설정·보안 조건](https://github.com/openai/codex-action)
신뢰하지 않은 PR에 비밀 값과 쓰기 권한을 노출하지 않습니다.

---

## Codex SDK (1/3)

<!-- _class: reference-page -->



TypeScript 기반 SDK(`@openai/codex-sdk`)로 사내 도구에 에이전트를 내장하세요.

---

## Codex SDK (2/3)

<!-- _class: reference-page -->



```typescript
import { Codex } from "@openai/codex-sdk";

const codex = new Codex();
const thread = codex.startThread();
const response = await thread.run("CI 에러 원인 분석해줘");
```

- 비동기 이벤트 스트림 지원

---

## Codex SDK (3/3)

<!-- _class: reference-page -->



- 구조화된 JSON 응답 강제

- 멀티모달(이미지+텍스트) 입력 지원

[SDK 사용법](https://developers.openai.com/codex/sdk/)

---

## 작업 범위와 컨텍스트 관리

1. 파일·재현 입력·오류를 먼저 제공합니다.
2. 긴 대화는 요약하고 필수 제약을 다시 확인합니다.
3. 단순 작업과 복잡한 검토의 모델·추론 강도를 구분합니다.
4. 테스트·중단 조건·변경 금지 범위를 함께 지정합니다.

“통과할 때까지”라는 요청도 무제한 권한이나 외부 배포 허가를 뜻하지 않습니다.

---

## 조직 운영과 감사

- `requirements.toml` 등 관리 정책으로 허용 범위를 제한합니다.
- MDM을 통한 설정 배포와 사용자 설정을 구분합니다.
- OpenTelemetry의 수집 이벤트·보관·민감정보 노출을 확인합니다.
- 데이터 사용·보존 조건은 실제 플랜과 조직 계약을 확인합니다.

프로젝트 설정 파일만으로 조직 정책이나 완전한 감사 로그가 보장되지는 않습니다.

[조직 설정](https://developers.openai.com/codex/enterprise/)

---

## 모범 사례 및 안티패턴

**성공적인 AI 페어 프로그래밍 규칙**

- ❌ **안티패턴:** "에러 고쳐줘" (무의미한 탐색에 토큰 낭비)
- ⭕️ **모범 사례:** "이 파일 `src/api.py`의 42번 줄 TypeError 고쳐. 완료 후 `pytest` 실행해."
- ❌ **안티패턴:** main 브랜치에서 직접 실행
- ⭕️ **모범 사례:** 항상 피처 브랜치에서 실행하고 `/diff` 검토 후 커밋

---

## 워크플로 레시피

**시나리오별 정석 패턴**

1. **새 프로젝트:** `codex` 실행 → 요구사항 프롬프팅 → `/init` 으로 AGENTS.md 생성
2. **일상 기능 개발:** `@파일1 @파일2` 지정 → 요구사항 명시 → 테스트 수행 지시
3. **대규모 리팩토링:** `/plan DB ORM 마이그레이션` → Steer 모드로 방향 조정
4. **코드 리뷰:** `/review` 으로 git 변경 내용 리뷰 자동화

---

## 필요할 때 찾을 레퍼런스

- [Codex 공식 문서](https://developers.openai.com/codex/): 설치·설정·기능
- [openai/codex](https://github.com/openai/codex): 소스·릴리스·이슈
- [API 문서](https://platform.openai.com/docs/): API·가격·SDK
- [OpenAI 소식](https://openai.com/news/): 제품 발표
- [feiskyer/codex-settings](https://github.com/feiskyer/codex-settings): 커뮤니티 예시, 공식 정책 아님

명령 예시는 설치된 버전의 `--help`와 함께 확인합니다.

---

## 팀에서 합의할 기준

- 작업 경로·승인 정책·샌드박스와 완료 테스트를 정합니다.
- AGENTS.md·설정·Hooks·MCP·Skills·Plugins의 책임을 구분합니다.
- 계획·diff·테스트 결과를 검토한 뒤 커밋·배포를 판단합니다.

<!--
질문을 받는 동안 이 확인 기준을 화면에 남깁니다. 청중이 자신의 업무에 적용할 다음 행동 하나를 고르게 합니다.
-->
