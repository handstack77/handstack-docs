---
marp: true
theme: gaia
size: 16:9
footer: MCP 서버 및 스킬 사용
paginate: true
backgroundColor: #fff
title: MCP 서버 및 스킬 사용
description: Claude Code와 Codex CLI에서 MCP와 스킬을 관리하고 HandStack 게시판 개발에 적용하는 입문 실습
---

<style>
:root {
  font-family: 'Noto Sans KR', 'Pretendard', 'Nanum Gothic', 'Malgun Gothic', Gulim, 굴림, sans-serif;
  --text-color: #0a0a0a;
  --line-color: #17344f;
}
section {
  padding: 48px 56px;
  color: var(--text-color);
  font-size: 29px;
  line-height: 1.48;
  border-bottom: 1px solid #000;
  background-image: linear-gradient(to bottom right, #f7f7f7 0%, #d3d3d3 100%);
  justify-content: flex-start;
}
h1 { font-size: 1.75em; border-bottom: none; }
h2 { font-size: 1.27em; border-bottom: 4px solid var(--line-color); padding-bottom: 0.22em; }
h3 { font-size: 1em; }
strong { color: var(--line-color); }
a { color: #164f82; }
p { margin: 0.45em 0; }
li { margin: 0.18em 0; }
code { font-family: 'D2Coding', 'Consolas', 'Malgun Gothic', monospace; }
code:not([class*='language-']) { background: rgba(100,100,100,0.13); color: #000; padding: 0 0.12em; }
pre, marp-pre { font-size: 23px; line-height: 1.35; background: #182433; color: #e6edf3; }
pre code, marp-pre code { font-size: inherit; color: #e6edf3; background: transparent; }
.hljs-comment { color: #a6b7c8; }
.hljs-keyword, .hljs-selector-tag { color: #ff9e80; }
.hljs-attr, .hljs-name, .hljs-variable { color: #a6c8ff; }
.hljs-string { color: #c3e88d; }
table { width: 100%; font-size: 24px; border-collapse: collapse; margin: 0.7em auto; }
th, td { padding: 0.38em 0.5em; border: 1px solid rgba(0,0,0,0.25); vertical-align: top; }
th { background: rgba(23,52,79,0.12); }
blockquote { font-size: 27px; border-left: 6px solid var(--line-color); background: rgba(255,255,255,0.55); padding: 0.45em 0.65em; margin: 0.6em 0; }
blockquote::before, blockquote::after { content: ''; }
footer { font-size: 17px; }
section::after { font-size: 17px; content: attr(data-marpit-pagination) ' / ' attr(data-marpit-pagination-total); }
section.lead { justify-content: center; }
section.compact { font-size: 26px; }
section.compact pre, section.compact marp-pre { font-size: 22px; }
section.compact table { font-size: 22px; }
</style>

<!-- _class: lead -->

# MCP 서버 및 스킬 사용

Claude Code · Codex CLI로 시작하는 HandStack 개발

문서 연결 → 관리 → 스킬 사용 → 게시판 검색 조건 추가

**초보자 실습 발표**

<!--
발표자: 본인의 도구 하나를 골라 따라 하게 한다. 두 도구의 명령을 모두 실행할 필요는 없다.
실습 전에 CLI 로그인과 HandStack 테스트 환경을 준비한다. 명령 입력과 AI 요청 입력을 구분해서 시연한다.
자료의 CLI 기준: codex-cli 0.164.0, Claude Code 2.1.310. 공식 문서 확인일: 2026-10-26.
-->

---

## 오늘 다룰 업무: 게시판 검색 개선

“기존 제목 검색이 어떻게 동작하는지 읽고,
**작성자로도 검색**할 수 있게 바꿔 주세요.”

1. 문서 MCP를 연결해 HandStack 규칙을 찾습니다.
2. 스킬로 화면·거래·SQL 연결을 확인합니다.
3. 기존 조건을 보존하며 작성자 조건을 추가합니다.
4. 코드 검사와 실제 조회 결과를 나눠 확인합니다.

<!-- 발표자: 처음부터 새 앱 전체를 생성하지 않는다. BOD010의 작은 변경 하나로 모든 과정을 연결한다. -->

---

## 명령과 요청을 입력하는 곳

| 입력 위치 | 입력 예 | 하는 일 |
|---|---|---|
| PowerShell 터미널 | `codex mcp list` | CLI 설정 조회 |
| Claude Code 대화창 | `/mcp` | 연결 상태 확인 |
| Codex 대화창 | `$handstack-source-trace …` | 스킬 지정 |
| 두 도구의 대화창 | `handstack-docs MCP로 …` | AI에게 작업 요청 |

`/mcp`와 `$스킬이름`은 **대화창에** 입력합니다.
코드 블록의 `#` 줄은 PowerShell 설명 주석입니다.

<!-- 출처: https://developers.openai.com/codex/mcp/ ; https://developers.openai.com/codex/skills/ ; https://code.claude.com/docs/en/mcp ; https://code.claude.com/docs/en/skills -->

---

## MCP란 무엇인가요?

**Model Context Protocol**: AI 앱과 외부 도구·데이터를
연결하는 공통 통신 규약입니다.

도서관에 비유하면, AI가 사서에게 “거래 호출 규칙을 찾아 줘”라고
요청하고 사서가 문서와 출처를 돌려주는 통로입니다.

- **호스트**: Claude Code·Codex 같은 AI 앱
- **클라이언트**: 앱 안에서 서버와 통신하는 연결 구성 요소
- **서버**: 문서 검색 등 기능을 제공하는 프로그램

<!-- 출처: https://modelcontextprotocol.io/docs/learn/architecture -->

---

## 문서를 찾아 답하기까지

**개발자 요청 → AI 앱 → MCP 서버 → 문서 검색 결과 → AI 답변**

1. 개발자: “`belongID`가 어떤 역할인지 찾아 줘.”
2. AI: 서버의 `search_docs` 도구를 선택합니다.
3. 서버: 관련 문서 위치를 반환합니다.
4. AI: `get_doc`으로 본문을 읽고 출처와 함께 답합니다.

모델을 새로 학습시키는 과정은 아닙니다.
필요한 정보를 작업 중에 가져옵니다.

<!-- 출처: https://modelcontextprotocol.io/docs/learn/architecture ; docs/guides/에이전트에-문서-연결하기.md -->

---

## MCP 서버가 제공할 수 있는 것

| 종류 | 의미 | 예 |
|---|---|---|
| Tools | AI가 호출하는 기능 | 문서 검색, 이슈 조회 |
| Resources | 읽을 수 있는 자료 | 파일 본문, 데이터 스키마 |
| Prompts | 재사용할 요청 템플릿 | 서버가 제공하는 분석 템플릿 |

서버마다 제공 기능과 권한이 다릅니다.
이번 실습은 **공개 문서를 읽는 HandStack 문서 도구**를 씁니다.

<!-- 출처: https://modelcontextprotocol.io/docs/learn/architecture ; mcp/src/server.mjs ; mcp/README.md -->

---

## MCP · 스킬 · 프로젝트 지침

| 구분 | 맡는 일 | HandStack 예 |
|---|---|---|
| MCP | 외부 자료·기능에 접근 | 거래 호출 문서 찾기 |
| 스킬 | 작업 절차와 점검 기준 제공 | 화면 → 거래 → SQL 추적 |
| AGENTS.md / CLAUDE.md | 해당 프로젝트의 작업 규칙 | 수정 경로, 인코딩, 검증 명령 |

스킬은 MCP 없이도 로컬 소스를 읽을 수 있습니다.
MCP를 연결하면 스킬이 필요한 문서도 조회할 수 있습니다.

<!-- 출처: https://developers.openai.com/plugins/concepts/skills ; agent-skills/README.md -->

---

## 원격 HTTP와 로컬 stdio

| 방식 | 연결에 필요한 정보 | 관리 대상 |
|---|---|---|
| Streamable HTTP | 서버 URL | 주소·인증·서비스 상태 |
| stdio | 실행 명령·인자 | 로컬 프로그램·런타임·환경 변수 |

이번 실습 주소: **`https://handstack.kr/mcp`**

별도 MCP 서버 프로그램 설치나 로그인 없이 이용합니다.
로컬에서 실행하는 HTTP 서버도 URL로 연결합니다.

<!-- 출처: https://modelcontextprotocol.io/docs/learn/architecture ; docs/guides/에이전트에-문서-연결하기.md -->

---

## 실습 준비

- Claude Code 또는 Codex CLI 설치·로그인
- PowerShell에서 본인이 작업할 **프로젝트 루트** 열기
- 인터넷에서 `https://handstack.kr` 접근 가능
- 스킬 점검기를 쓸 경우 Python 3.10 이상
- 게시판 변경 실습: BOD010 원본과 **분리된 테스트 DB**

```powershell
# 설치된 도구만 확인합니다.
codex --version
claude --version
python --version
```

<!-- 발표자: C:\work\handstack 등 이후 경로는 예시이므로 학습자의 실제 경로로 바꾼다. BOD010의 LD01에도 CREATE TABLE IF NOT EXISTS가 포함되어 있으므로 테스트 DB를 준비한다. -->

---

## Codex CLI: 문서 MCP 추가

**PowerShell 터미널**에서 실행합니다.

```powershell
# 같은 사용자 계정에서 사용할 문서 서버를 등록합니다.
codex mcp add handstack-docs --url https://handstack.kr/mcp

# 등록된 서버와 상세 설정을 확인합니다.
codex mcp list
codex mcp get handstack-docs
```

기본 저장 위치는 사용자 홈의 `~/.codex/config.toml`입니다.
이미 등록되어 있으면 `get`으로 확인한 뒤 관리 실습으로 넘어갑니다.

<!-- 출처: https://developers.openai.com/resources/docs-mcp ; https://developers.openai.com/codex/mcp/ ; codex mcp add --help / get --help (0.164.0) ; docs/guides/에이전트에-문서-연결하기.md -->

---

## Claude Code: 문서 MCP 추가

**작업할 프로젝트 루트의 PowerShell**에서 실행합니다.

```powershell
# 이 프로젝트에서 개인적으로 사용할 연결을 등록합니다.
claude mcp add --transport http --scope local handstack-docs https://handstack.kr/mcp

# 등록과 연결 상태를 확인합니다.
claude mcp list
claude mcp get handstack-docs
```

`local` 범위는 등록한 프로젝트에서만 사용합니다.
다른 프로젝트에서도 쓰려면 `user` 범위를 선택합니다.

<!-- 출처: https://code.claude.com/docs/en/mcp ; claude mcp add --help (2.1.310) -->

---

## 등록 다음에는 실제 호출 확인

1. 설정을 반영할 **새 대화 세션**을 엽니다.
2. 대화창에서 `/mcp`로 서버·도구 상태를 봅니다.
3. 아래 요청을 보내고 **도구 호출 기록**을 확인합니다.

```text
handstack-docs MCP의 search_docs로 belongID를 찾아 줘.
찾은 문서를 get_doc으로 읽고, 역할과 문서 URL을 알려 줘.
도구를 쓸 수 없다면 그 상태를 먼저 알려 줘.
```

목록에 등록됨 → 연결됨 → 검색·본문 조회 성공을 구분합니다.

<!-- 출처: docs/guides/에이전트에-문서-연결하기.md ; https://developers.openai.com/codex/mcp/ ; https://code.claude.com/docs/en/mcp -->

---

## HandStack 문서 MCP의 도구

| 도구 | 언제 쓰나요? | 요청 예 |
|---|---|---|
| `search_docs` | 관련 문서 찾기 | `belongID` 검색 |
| `get_doc` | 본문·특정 절 읽기 | `reference/거래-호출`의 입출력 연결 |
| `list_docs` | 문서 목록 확인 | `reference` 영역 목록 |
| `get_sample` | 예제 자료 찾기 | `BOD010` 관련 예제 검색 |

먼저 핵심 단어로 검색하고 필요한 본문만 읽습니다.
질문에 맞는 도구가 호출됐는지도 확인합니다.

<!-- 출처: docs/guides/에이전트에-문서-연결하기.md#제공-도구 ; mcp/src/server.mjs ; mcp/src/service.mjs -->

---

## 문서 검색을 개발 요청으로 바꾸기

```text
handstack-docs MCP로 reference/거래-호출의 입출력 연결을 읽어 줘.
내 프로젝트의 BOD010.html과 BOD010.js를 찾아 대조해 줘.
MainForm, Title, LD01, Board가 어떻게 연결되는지 설명해 줘.
문서와 실제 코드가 다르면 각각의 근거를 보여 줘.
지금은 파일을 수정하지 마.
```

확인할 결과: **문서 URL + 실제 파일 경로 + 연결 설명**

문서 MCP는 내 PC의 소스·DB를 자동으로 읽지 않습니다.
로컬 소스는 코딩 도구의 파일 읽기 기능으로 확인합니다.

<!-- 출처: docs/reference/거래-호출.mdx ; mcp/README.md ; agent-skills/skills/handstack-source-trace/SKILL.md -->

---

<!-- _class: compact -->

## 연결을 어디에 저장할까요?

| 도구·범위 | 적용 범위 | 설정 위치 |
|---|---|---|
| Claude `local` | 현재 프로젝트, 나만 | `~/.claude.json`의 프로젝트 항목 |
| Claude `user` | 모든 프로젝트, 나만 | `~/.claude.json` |
| Claude `project` | 현재 프로젝트, 팀 공유 | 프로젝트 `.mcp.json` |
| Codex 기본 CLI 등록 | 같은 사용자의 세션 | `~/.codex/config.toml` |
| Codex 프로젝트 설정 | 신뢰한 프로젝트 | 프로젝트 `.codex/config.toml` |

`~`는 사용자 홈입니다. **같은 이름의 중복 등록**을 먼저 확인하세요.
Claude의 `local`은 통신 방식 stdio를 뜻하지 않습니다.

<!-- 출처: https://code.claude.com/docs/en/mcp ; https://developers.openai.com/codex/mcp/ -->

---

## 팀 공유: Claude Code

프로젝트 루트의 **`.mcp.json`**에 넣는 최소 예입니다.

```json
{
  "mcpServers": {
    "handstack-docs": {
      "type": "http",
      "url": "https://handstack.kr/mcp"
    }
  }
}
```

기존 파일에는 해당 서버 항목만 병합합니다.
대화형 실행에서 프로젝트 MCP 사용 승인이 표시될 수 있습니다.

<!-- 출처: https://code.claude.com/docs/en/mcp ; docs/guides/에이전트에-문서-연결하기.md -->

---

## 팀 공유: Codex CLI

신뢰한 프로젝트의 **`.codex/config.toml`**에 넣는 예입니다.

```toml
[mcp_servers.handstack-docs]
url = "https://handstack.kr/mcp"
```

- 기존 TOML에 같은 테이블을 두 번 만들지 않습니다.
- 개인 설정에 같은 서버가 있으면 중복·우선순위를 확인합니다.
- 팀 공유 파일에는 비밀 토큰을 넣지 않습니다.
- 프로젝트 신뢰·관리자 정책에 따라 로드가 제한될 수 있습니다.

<!-- 출처: https://developers.openai.com/codex/mcp/ ; docs/guides/에이전트에-문서-연결하기.md -->

---

## 주소나 설정을 변경할 때

1. `mcp get handstack-docs`로 현재 주소·범위를 기록합니다.
2. 설정 파일을 백업하고 **해당 서버 항목만** 수정합니다.
3. 새 세션에서 목록·연결·실제 검색을 다시 확인합니다.

Claude: `.mcp.json` 또는 `~/.claude.json`의 해당 항목
Codex: 사용자 또는 프로젝트 `config.toml`의 해당 테이블

CLI로 재등록할 때는 **기존 범위에서 제거 → 새 주소로 추가**합니다.
주소 변경으로 인증이 달라지면 서버 안내에 따라 다시 인증합니다.

<!-- 출처: https://code.claude.com/docs/en/mcp ; https://developers.openai.com/codex/mcp/ ; docs/guides/에이전트에-문서-연결하기.md. 발표자: 갱신을 위한 공통 mcp update 명령이 있다고 가정하지 않는다. -->

---

## MCP 삭제: 연결 등록 해제

**이 서버의 도구를 더 이상 사용할 수 없게 됩니다.**
다음은 앞에서 CLI로 등록한 범위를 제거하는 명령입니다.

```powershell
# Claude: 앞 실습의 local 등록을 제거합니다.
claude mcp remove handstack-docs --scope local
claude mcp list

# Codex: 사용자 설정의 등록을 제거합니다.
codex mcp remove handstack-docs
codex mcp list
```

공유 파일·다른 범위에 남은 항목도 확인합니다.
외부 서버의 프로그램·데이터를 삭제하는 명령은 아닙니다.

<!-- 출처: https://code.claude.com/docs/en/mcp ; codex mcp remove --help (0.164.0) ; docs/guides/에이전트에-문서-연결하기.md. 발표자: Claude 원격 서버 제거는 저장된 OAuth 정보도 제거할 수 있다. Codex 프로젝트 파일에 직접 넣은 항목은 해당 파일에서 제거한다. -->

---

## 삭제 실습 후 다시 연결하기

이후 HandStack 실습을 계속하려면 **본인의 도구 하나**로
문서 MCP를 다시 등록합니다.

```powershell
# Codex CLI: 사용자 범위
codex mcp add handstack-docs --url https://handstack.kr/mcp

# Claude Code: 개발 프로젝트 루트에서 local 범위
claude mcp add --transport http --scope local handstack-docs https://handstack.kr/mcp
```

새 대화에서 `/mcp`를 열고 `belongID` 검색을 다시 요청합니다.
삭제 후에도 스킬 파일은 남으며, MCP는 따로 다시 연결해야 합니다.

<!-- 출처: docs/guides/에이전트에-문서-연결하기.md. 발표자: 삭제를 실행하지 않은 학습자는 재등록하지 않고 상세 설정만 확인한다. -->

---

## 잠시 끄기와 다시 켜기

Codex: **기존 서버 테이블**에 `enabled` 값을 추가·수정합니다.

```toml
[mcp_servers.handstack-docs]
url = "https://handstack.kr/mcp"
enabled = false
```

다시 켤 때는 `true`로 바꾸고 새 세션에서 확인합니다.
Claude: `/mcp`에서 해당 서버의 활성·비활성 메뉴를 확인합니다.
메뉴·지원 범위는 설치된 버전의 도움말을 따릅니다.

<!-- 출처: https://developers.openai.com/codex/mcp/ ; https://code.claude.com/docs/en/mcp#disable-a-server-without-removing-it -->

---

## “갱신”할 대상을 구분하세요

| 바뀌는 것 | 해야 할 일 |
|---|---|
| 서버 주소·인증 설정 | 연결 설정 변경 → 재연결·인증 |
| 원격 서버의 기능 | 운영자가 배포 → 도구 목록 재확인 |
| 로컬 stdio 프로그램 | 배포자 절차로 업데이트 → 프로세스 재시작 |
| HandStack 공개 문서 | 사이트 배포 후 서버 인덱스 갱신 대기 |
| 설치한 스킬 파일 | 새 원본 확보 → 비교 → 백업·교체 |

HandStack 문서 서버는 기본적으로 **10분마다** 인덱스를 다시 읽습니다.
같은 URL의 문서 갱신에 매번 서버를 재등록할 필요는 없습니다.

<!-- 출처: docs/guides/에이전트에-문서-연결하기.md#동작-방식 ; mcp/src/cli.mjs (reloadMinutes 기본 10) ; mcp/src/holder.mjs ; https://code.claude.com/docs/en/mcp#dynamic-tool-updates -->

---

## 인증이 필요한 다른 MCP 서버

- 공개 HandStack 문서 서버: 별도 로그인 없음
- 회사 문서·이슈·DB 서버: 계정과 접근 권한이 필요할 수 있음
- OAuth 서버: 도구의 로그인 흐름으로 계정 연결
- 토큰 방식: 비밀 값은 환경 변수·안전한 자격 증명 저장소 사용

Codex의 지원 명령은 `codex mcp login --help`로 확인합니다.
Claude는 `/mcp`의 해당 서버에서 인증 안내를 확인합니다.

서버 등록, 계정 로그인, 읽기·쓰기 권한은 각각 확인합니다.

<!-- 출처: https://developers.openai.com/codex/mcp/ ; https://code.claude.com/docs/en/mcp#authenticate-with-remote-mcp-servers ; mcp/README.md -->

---

## 스킬은 어떻게 동작하나요?

**작업에 맞는 지침과 자료를 묶은 폴더**입니다.

```text
handstack-source-trace/
  SKILL.md          언제 쓰고 어떤 순서로 확인할지
  scripts/          연결표 점검 스크립트
  references/       점검 결과 해설
  agents/           Codex용 메타데이터
```

이름·설명을 보고 선택한 뒤 상세 지침을 읽습니다.
스킬의 지침과 함께 실행할 스크립트의 내용·영향도 확인합니다.

<!-- 출처: https://developers.openai.com/codex/skills/ ; https://code.claude.com/docs/en/skills ; agent-skills/skills/handstack-source-trace/ -->

---

## HandStack 작업별 스킬 선택

| 하고 싶은 일 | 스킬 |
|---|---|
| 버튼부터 SQL까지 흐름 읽기 | `handstack-source-trace` |
| 화면 HTML·JS 수정 | `handstack-screen-development` |
| 거래·SQL 입출력 수정 | `handstack-transaction-contracts` |
| C#·JavaScript·Python 서버 함수 수정 | `handstack-function-contracts` |
| 증상에서 첫 실패 지점 찾기 | `handstack-troubleshooting` |

첫 실습에는 **추적·화면·거래 스킬**을 사용합니다.
전체 목록과 설치기는 [스킬 목록과 설치](https://handstack.kr/docs/guides/ai/스킬-목록)에서 확인합니다.

<!-- 출처: agent-skills/README.md ; docs/guides/ai/스킬-목록.md -->

---

## 스킬 원본 준비

1. [HandStack 스킬 ZIP](https://handstack.kr/agent-skills/handstack-developer-skills.zip)을 내려받아 새 폴더에 풉니다.
2. `Install-Skills.ps1`과 `skills/` 폴더가 있는지 확인합니다.
3. PowerShell에서 **설치기가 있는 폴더**로 이동합니다.

```powershell
# 아래 경로를 실제 압축 해제 위치로 바꾸세요.
Set-Location C:\work\handstack-developer-skills
Get-ChildItem .\Install-Skills.ps1, .\skills
```

ZIP을 받을 수 없으면 [저장소의 agent-skills](https://github.com/handstack77/handstack-docs/tree/master/agent-skills)를 받습니다.
설치 폴더와 개발할 프로젝트 폴더를 구분하세요.

<!-- 출처: agent-skills/README.md ; agent-skills/scripts/package_bundle.py ; docs/guides/ai/index.md -->

---

<!-- _class: compact -->

## 프로젝트에 설치하기

`C:\work\handstack`은 **이미 존재하는 개발 프로젝트**로 바꿉니다.

```powershell
# 설치기 폴더에서 실행합니다. 경로와 설치할 스킬을 지정합니다.
$ProjectRoot = 'C:\work\handstack'
$Skills = @('handstack-source-trace',
  'handstack-screen-development', 'handstack-transaction-contracts')

# 먼저 변경될 경로를 확인하고, 같은 인자로 실제 설치합니다.
.\Install-Skills.ps1 -Tool Both -Scope Project `
  -ProjectRoot $ProjectRoot -Skill $Skills -WhatIf
.\Install-Skills.ps1 -Tool Both -Scope Project `
  -ProjectRoot $ProjectRoot -Skill $Skills
```

설치기는 MCP 연결이나 인증 설정을 바꾸지 않습니다.

<!-- 출처: agent-skills/Install-Skills.ps1 ; agent-skills/README.md. 발표자: 앞 슬라이드에서 정의한 폴더에서 실행한다. 실행 정책 오류는 조직 정책에 따라 해결하며 무조건 우회하지 않는다. -->

---

## 설치 위치와 확인

| 도구 | 프로젝트 설치 | 사용자 설치 |
|---|---|---|
| Claude Code | `<프로젝트>/.claude/skills/` | `~/.claude/skills/` |
| Codex CLI | `<프로젝트>/.agents/skills/` | `~/.agents/skills/` |

```powershell
# 앞 슬라이드에서 지정한 프로젝트의 설치 결과를 확인합니다.
Get-ChildItem "$ProjectRoot/.claude/skills" -Directory
Get-ChildItem "$ProjectRoot/.agents/skills" -Directory
Set-Location $ProjectRoot
```

처음에는 한 범위를 선택하세요. 설치 후 새 대화에서 확인합니다.

<!-- 출처: agent-skills/Install-Skills.ps1 ; https://developers.openai.com/codex/skills/ ; https://code.claude.com/docs/en/skills -->

---

## 스킬을 명시해서 요청하기

**Claude Code 대화창**

```text
/handstack-source-trace BOD010 조회 버튼에서 SQL까지 추적해 줘.
handstack-docs MCP로 관련 문서도 읽어 줘. 파일은 수정하지 마.
```

**Codex 대화창**

```text
$handstack-source-trace BOD010 조회 버튼에서 SQL까지 추적해 줘.
handstack-docs MCP로 관련 문서도 읽어 줘. 파일은 수정하지 마.
```

사용한 스킬과 읽은 파일·문서가 답변에 드러나는지 확인합니다.

<!-- 출처: docs/guides/ai/스킬-목록.md ; agent-skills/skills/handstack-source-trace/SKILL.md ; https://code.claude.com/docs/en/skills -->

---

## 스킬 갱신: 새 원본으로 교체

**기존 설치 내용이 교체됩니다.** 새 ZIP은 별도 폴더에 풉니다.
그 폴더에서 앞과 같은 대상 경로·스킬 목록을 지정합니다.

```powershell
# 실제 새 ZIP 압축 해제 위치로 이동합니다.
Set-Location C:\work\handstack-developer-skills-new

# 앞에서 정의한 $ProjectRoot와 $Skills를 그대로 사용합니다.
.\Install-Skills.ps1 -Tool Both -Scope Project `
  -ProjectRoot $ProjectRoot -Skill $Skills -Update -WhatIf
.\Install-Skills.ps1 -Tool Both -Scope Project `
  -ProjectRoot $ProjectRoot -Skill $Skills -Update
```

다른 내용은 `-Update` 없이 덮어쓰지 않습니다.
기존 파일은 `.claude/skills-backup/`·`.agents/skills-backup/`에 보관됩니다.

<!-- 출처: agent-skills/Install-Skills.ps1 ; agent-skills/README.md. 발표자: Set-Location $ProjectRoot 상태에서 실행하지 말고 새 설치기 폴더로 이동한다. 날짜 폴더 아래에 백업되며, 커스텀 수정은 diff로 비교·병합한다. -->

---

## 스킬을 사용하지 않게 하기

**해당 범위의 스킬 폴더 전체**를 백업한 뒤
검색 경로 밖으로 이동하면 활성 목록에서 제외할 수 있습니다.

예: `.agents/skills/handstack-source-trace`를
프로젝트의 `.agents/skills-backup/수동보관/` 아래로 옮깁니다.

- Claude도 설치했다면 `.claude/skills/` 쪽을 따로 확인합니다.
- 사용자 범위나 플러그인에도 같은 이름이 있는지 확인합니다.
- 새 세션에서 목록·호출 가능 여부를 다시 확인합니다.
- MCP 연결은 별도 설정이므로 그대로 남습니다.

<!-- 출처: https://developers.openai.com/codex/skills/ ; https://code.claude.com/docs/en/skills ; agent-skills/Install-Skills.ps1. 발표자: 실제 이동은 대상 절대 경로를 확인한 뒤 수행한다. 설치기의 -RetireSkill은 구 이름 스킬의 백업 이동 기능이며 범용 uninstall 명령으로 소개하지 않는다. -->

---

## 사례 1: 기존 게시판 흐름 읽기

기본 예제의 원본은 HandStack 소스 저장소의
**`2.Modules/wwwroot/Contracts`** 아래에 있습니다.

```text
wwwroot/HDS/BOD/BOD010.html   입력·버튼·목록
wwwroot/HDS/BOD/BOD010.js     이벤트·거래 설정
transact/HDS/BOD/BOD010.json  LD01 거래 계약
dbclient/HDS/BOD/BOD010.xml   목록 SQL·파라미터
```

다른 프로젝트는 `.txn/.dbc`를 쓸 수 있습니다.
실제 파일과 서버의 계약 경로를 확인하고 기존 확장자를 유지합니다.

<!-- 출처: docs/reference/식별자와-파일-경로.mdx ; https://github.com/handstack77/handstack/tree/master/2.Modules/wwwroot/Contracts ; 2.Modules/transact/Entity/ModuleConfiguration.cs ; 2.Modules/dbclient/Entity/ModuleConfiguration.cs -->

---

## 사례 1: 분석 요청과 예상 결과

```text
handstack-source-trace 스킬로 BOD010의 LD01을 분석해 줘.
프로젝트 지침을 읽고, 실제 파일에서 조회 버튼부터 SQL까지 추적해 줘.
입력 필드, 서비스 ID, SQL 파라미터, 출력 순서를 표로 써 줘.
문서 MCP로 거래 호출과 식별자 규칙을 확인해 줘.
파일을 수정하거나 거래·SQL을 실행하지 마.
```

예상 결과: `MainForm → LD01 → SQL → Board` 연결표
및 각 항목의 실제 파일 위치

문서 근거와 로컬 구현 근거를 함께 읽습니다.

<!-- 출처: agent-skills/skills/handstack-source-trace/SKILL.md ; docs/reference/거래-호출.mdx -->

---

## BOD010에서 확인할 연결

| 단계 | 실제 예제의 연결 |
|---|---|
| 조회 버튼 | `syn-events`의 click → `btnSearch_click` |
| JS 호출 | `syn.$w.transactionAction('LD01')` |
| 입력 | `MainForm`의 `Title`, `Category`, 기간·정렬 조건 |
| 거래 → SQL | `ServiceID: LD01`, `CommandType: D` → `LD01`, seq 0 |
| 출력 | SQL 결과 → `Grid` → HTML의 `Board` |

화면의 `dataFieldID`와 서버의 모든 필드를 같은 이름으로
복제하는 규칙은 아닙니다. **각 연결 지점**을 대조합니다.

<!-- 출처: HandStack 2.Modules/wwwroot/Contracts/wwwroot/HDS/BOD/BOD010.html 및 .js ; Contracts/transact/HDS/BOD/BOD010.json ; Contracts/dbclient/HDS/BOD/BOD010.xml ; docs/reference/거래-호출.mdx -->

---

## 제목 조건은 어떻게 전송되나요?

HTML의 기존 입력 항목 발췌입니다.

```html
<input id="txtTitle" syn-datafield="Title"
  syn-options="{editType: 'text', belongID: ['LD01']}"
  type="text" class="form-control" maxlengthB="256">
```

JS의 `transaction` 객체 안에 있는 기존 설정입니다.

```javascript
LD01: {
    inputs: [{ type: 'Row', dataFieldID: 'MainForm' }],
    outputs: [{ type: 'Grid', dataFieldID: 'Board' }]
}
```

<!-- 출처: HandStack 2.Modules/wwwroot/Contracts/wwwroot/HDS/BOD/BOD010.html 및 .js ; syn.webform.js의 belongID 검사. 발표자: 두 코드 모두 발췌이며 독립 실행 파일이 아니다. -->

---

## 사례 2: 작성자 검색 추가 요청

```text
handstack-screen-development와 handstack-transaction-contracts를 사용해
BOD010에 작성자 부분 일치 검색을 추가해 줘.
Board의 Author 컬럼과 현재 SQLite SQL을 먼저 확인해 줘.
빈 값은 작성자 제한 없이 조회하고 기존 조건·정렬·출력은 유지해 줘.
HTML, JS, 거래, SQL의 변경 필요 여부부터 표로 정리해 줘.
인증 설정은 유지하고, 테스트 DB 실행은 환경 확인 뒤 진행해 줘.
```

Claude에서는 `/스킬이름`, Codex에서는 `$스킬이름`으로
각 스킬을 지정하거나 위처럼 이름을 명시할 수 있습니다.

<!-- 출처: agent-skills/skills/handstack-screen-development/SKILL.md ; agent-skills/skills/handstack-transaction-contracts/SKILL.md ; HandStack BOD010.xml (Board.Author, SQLite 문자열 연결) -->

---

## 작성자 조건의 변경 연결표

| 위치 | 이번에 확인·추가할 내용 |
|---|---|
| HTML | `MainForm` 안에 `txtAuthor`, `Author`, `belongID: LD01` |
| JS | 기존 `Row: MainForm`, `Grid: Board` 매핑 확인 |
| 거래 계약 | LD01 입력 제한·명시 필드가 있는지 확인 |
| SQL 계약 | `@Author` 파라미터와 WHERE 조건 추가 |
| DB | 기존 `Board.Author` 사용, 새 컬럼 불필요 |

기본 예제의 거래 입력은 `Dynamic`이며 `Fields`가 비어 있습니다.
명시 필드가 있는 업무 계약은 필요한 입력 정의도 함께 고칩니다.

<!-- 출처: HandStack Contracts/transact/HDS/BOD/BOD010.json (LD01 Inputs) ; Contracts/dbclient/HDS/BOD/BOD010.xml ; docs/reference/거래-계약-명세.mdx -->

---

## 작성자 입력 항목 예시

**학습용 추가 예시**: `BOD010.html`의 기존 `MainForm`
검색 조건 영역에 주변 레이아웃을 따라 삽입합니다.

```html
<div class="input-group">
  <label for="txtAuthor"
    class="w:86 col-form-label px-2">작성자</label>
  <input id="txtAuthor" syn-datafield="Author"
    syn-options="{editType: 'text', belongID: ['LD01']}"
    type="text" class="form-control" maxlengthB="256">
</div>
```

화면에 입력란이 생겨도 서버에 값이 전송되는지 따로 확인합니다.

<!-- 근거: HandStack BOD010.html의 txtTitle·MainForm 구조 ; docs/reference/거래-호출.mdx. 이 조각은 새 학습 예시이며 저장소에 이미 있는 코드라고 설명하지 않는다. -->

---

## SQLite SQL 조건 예시

**학습용 발췌**: `BOD010.xml`의 LD01 SQL에서
기존 WHERE 조건 뒤, **ORDER BY 앞**에 추가합니다.

```sql
AND (@Author = '' OR B.Author LIKE ('%' || @Author || '%'))
```

CDATA 밖의 LD01 `statement` 안에는 파라미터를 추가합니다.

```xml
<param id="@Author" type="String" length="-1" value="" />
```

입력값은 바인딩합니다. `%`, `_`는 LIKE의 패턴 문자입니다.
다른 DB 공급자는 해당 SQL 문법에 맞춰 작성합니다.

<!-- 근거: HandStack BOD010.xml의 SQLite LIKE·param 구조 ; docs/reference/api/modules/dbclient.mdx. 이 SQL은 새 학습 예시이다. 빈 문자열·부분 일치·무일치 동작을 테스트 DB에서 확인한다. -->

---

## 파일 검사와 연결표 재확인

**개발 프로젝트 루트**에서 실행합니다.

```powershell
# Codex 프로젝트 설치 기준입니다. Claude는 .claude/skills를 씁니다.
$SkillRoot = '.agents/skills'
python "$SkillRoot/handstack-source-trace/scripts/hs_inspect.py" `
  --root . --screen BOD010 --fail-on ERROR

# 아래 경로는 기본 HandStack 소스 예제 기준입니다.
node --check ./2.Modules/wwwroot/Contracts/wwwroot/HDS/BOD/BOD010.js
git diff --check
git diff
```

점검기는 정적 분석의 후보를 보여 줍니다.
SQL 실행·서버 반영·브라우저 성공을 보장하지 않습니다.

<!-- 출처: agent-skills/skills/handstack-source-trace/SKILL.md ; scripts/hs_inspect.py. 발표자: 중복 BOD010 후보가 나오면 --root를 해당 모듈로 좁힌다. 배포본 contracts 구조는 경로를 바꾼다. 이 실습에서 JS 변경이 없더라도 기존 구문 확인 용도로 실행할 수 있다. -->

---

## 테스트 환경에서 확인할 결과

작성자 `김개발`, `이운영`인 게시글이 있는 **테스트 데이터**를 준비합니다.
다른 조회 조건도 이 게시글을 포함하도록 설정합니다.

| 작성자 입력 | 예상 결과 |
|---|---|
| 빈 값 | 작성자 조건이 결과를 제한하지 않음 |
| `김` | 작성자에 `김`이 포함된 게시글 |
| 존재하지 않는 값 | 빈 목록 |
| 작성자 + 제목·분류 | 기존 조건과 작성자 조건을 모두 만족 |

요청 데이터에 `Author`가 있는지, 응답이 `Board`에 표시되는지 봅니다.
예제의 **테이블 초기화 버튼은 데이터를 지우므로 누르지 않습니다.**

<!-- 근거: 학습용 SQLite SQL 예시. 발표자: LD01에도 CREATE TABLE IF NOT EXISTS가 포함된다. 운영 DB를 실습에 쓰지 않는다. 서버가 읽는 계약 경로·감시/refresh 정책을 먼저 확인하고 반영한다. -->

---

## 사례 3: 입력했는데 결과가 그대로예요

```text
작성자로 검색해도 결과가 같습니다.
handstack-source-trace로 Author 입력이 실제 전송되는지부터 추적해 줘.
HTML의 MainForm·belongID, JS 입력, 거래 입력, @Author를 대조해 줘.
원본과 서버가 읽는 계약 경로도 확인해 줘.
정적 확인과 실제 요청 확인을 나눠 보고하고,
원인을 확인하기 전에는 인증·권한 설정을 바꾸지 마.
```

확인 순서: **입력 수집 → 전송 → 계약 → SQL → 응답·표시**
처음 끊어진 지점부터 고칩니다.

<!-- 출처: agent-skills/skills/handstack-source-trace/SKILL.md ; agent-skills/skills/handstack-troubleshooting/SKILL.md ; docs/reference/식별자와-파일-경로.mdx -->

---

## 연결 문제를 해결하는 순서

| 증상 | 먼저 확인할 것 |
|---|---|
| 명령을 찾을 수 없음 | CLI 설치·PATH·새 터미널 |
| 서버가 목록에 없음 | 실행 사용자·프로젝트·등록 범위 |
| 등록됐지만 연결 실패 | URL·프록시·서버 상태·인증 |
| 도구가 대화에 안 보임 | 활성 상태·새 세션·관리자 정책 |
| 스킬이 선택되지 않음 | 설치 경로·이름·중복, 명시 호출 |
| 문서 내용이 오래됨 | 배포 여부·인덱스 갱신 주기 |

`https://handstack.kr/mcp` 상태 페이지가 열리는 것과
**에이전트의 실제 도구 호출 성공**을 구분합니다.

<!-- 출처: docs/guides/에이전트에-문서-연결하기.md#실패하면 ; https://code.claude.com/docs/en/mcp ; agent-skills/README.md -->

---

## 작업 권한과 자료의 범위

- 서버 제공자와 도구 목록을 확인하고 필요한 연결만 켭니다.
- 공개 문서 MCP에는 비밀 키·DB 연결 문자열을 보내지 않습니다.
- 파일 수정·DB 실행은 각 도구의 실제 권한에 따라 수행됩니다.
- 스킬에 적힌 지침만으로 운영 권한이 생기지 않습니다.
- 변경 요청에는 보존할 기능, 테스트 환경, 확인 기준을 적습니다.

**“문서 조회 성공”과 “업무 기능 실행 성공”은 별개입니다.**

<!-- 출처: mcp/README.md ; agent-skills/README.md ; docs/guides/ai/개발자-가이드.md -->

---

## 직접 해 볼 과제

1. 문서 MCP로 `transactionAction`의 입출력 연결을 읽습니다.
2. 추적 스킬로 본인 프로젝트의 조회 화면 하나를 분석합니다.
3. 기존 DB 컬럼 하나를 골라 검색 조건 추가 계획을 만듭니다.
4. 테스트 환경에서 조건을 추가하고 정상·빈 결과를 확인합니다.
5. 개인 설치 스킬 하나를 백업·갱신하고 다시 호출합니다.

제출할 것: **연결표, 변경 diff, 검증 결과, 미확인 항목**

<!-- 발표자: BOD010을 쓸 수 없는 학습자는 2번부터 본인의 기존 조회 화면을 사용한다. DB 환경이 없으면 변경 계획과 정적 검사까지만 기록하며 실행 성공으로 쓰지 않는다. -->

---

## 실습 완료 확인

- [ ] 등록한 MCP를 조회하고 실제 검색·본문 조회를 수행했다.
- [ ] 추가·삭제·비활성화·갱신의 차이를 설명할 수 있다.
- [ ] 스킬 설치 위치와 호출 방법을 확인했다.
- [ ] 화면·거래·SQL의 입력·출력 연결표를 만들었다.
- [ ] 변경한 코드와 기존 조건 보존 여부를 검토했다.
- [ ] 실제 실행한 검사와 실행하지 못한 항목을 구분했다.

다음 작업에서도 **문서 확인 → 소스 대조 → 작은 변경 → 결과 확인**을
같은 순서로 진행합니다.

---

## 관리할 때 보는 빠른 표

| 작업 | Claude Code | Codex CLI |
|---|---|---|
| 목록 | `claude mcp list` | `codex mcp list` |
| 상세 | `claude mcp get 이름` | `codex mcp get 이름` |
| 추가 | `mcp add --transport http` | `mcp add … --url …` |
| 삭제 | `mcp remove … --scope …` | `mcp remove …` |
| 대화에서 연결 확인 | `/mcp` | `/mcp` |
| 스킬 지정 | `/handstack-source-trace` | `$handstack-source-trace` |
| 스킬 갱신 | 설치기 `-Update` | 설치기 `-Update` |

실제 복사할 명령은 앞의 해당 실습 슬라이드를 사용하세요.

<!-- 출처: https://code.claude.com/docs/en/mcp ; https://developers.openai.com/codex/mcp/ ; agent-skills/Install-Skills.ps1 -->

---

## HandStack 문서와 예제

- [AI 에이전트에 문서 연결하기](https://handstack.kr/docs/guides/에이전트에-문서-연결하기): 등록·해제·도구·문제 해결
- [스킬 목록과 설치](https://handstack.kr/docs/guides/ai/스킬-목록): 설치기와 작업별 스킬
- [화면에서 거래 호출하기](https://handstack.kr/docs/reference/거래-호출): 입력·출력 매핑
- [식별자와 파일 경로](https://handstack.kr/docs/reference/식별자와-파일-경로): BOD010 파일·계약 연결
- [게시판 프로젝트 시작하기](https://handstack.kr/docs/startup/handsonlab/게시판-프로젝트-시작하기): 기본 예제 전체
- [스킬 원본 저장소](https://github.com/handstack77/handstack-docs/tree/master/agent-skills): 설치기·지침·점검기

<!-- 발표자: 문서 URL을 통해 최신 대표 설명을 확인한다. 이 발표의 SQL·HTML 추가 예시는 기존 예제 위에 적용하는 학습용 조각이다. -->

---

## 도구별 공식 안내

- [MCP 구조](https://modelcontextprotocol.io/docs/learn/architecture): 호스트·클라이언트·서버, 통신 방식
- [Codex MCP](https://developers.openai.com/codex/mcp/): 등록·설정·인증
- [Codex Skills](https://developers.openai.com/codex/skills/): 탐색 경로·스킬 사용
- [Claude Code MCP](https://code.claude.com/docs/en/mcp): 범위·관리·연결 상태
- [Claude Code Skills](https://code.claude.com/docs/en/skills): 설치·호출·선택 규칙

명령 예시 기준: **Codex CLI 0.164.0 · Claude Code 2.1.310**
공식 안내 확인일: **2026-10-26**
설치 버전이 다르면 먼저 `mcp --help`로 지원 옵션을 확인하세요.

---

## 부록: 로컬 문서 개발 서버 연결

**문서를 직접 수정하는 사람을 위한 선택 실습**입니다.
`handstack-docs` 저장소와 Node.js 의존성이 준비되어 있어야 합니다.

```powershell
# handstack-docs 루트에서, MCP 의존성이 없을 때 한 번 실행합니다.
npm ci --prefix mcp

# 사이트 개발 서버와 문서 MCP를 실행합니다.
npm run start
```

기본 개발 주소는 `http://localhost:3000/mcp`입니다.
터미널을 열어 둔 채 실제 표시된 서버 주소를 확인합니다.

<!-- 출처: mcp/README.md ; plugins/agent-docs/dev-mcp.cjs. 발표자: 루트 의존성은 잠금 파일 기준으로 준비되어 있어야 하며 저장소 Node.js engines를 따른다. 개발 서버 포트를 바꿨다면 MCP URL도 맞춘다. 공개 문서를 사용하는 일반 학습자에게는 필요 없다. -->

---

## 부록: 공개 문서와 로컬 문서 구분

**새 PowerShell 터미널**에서 사용하는 도구 하나만 등록합니다.

```powershell
# Codex CLI
codex mcp add handstack-docs-dev --url http://localhost:3000/mcp

# Claude Code: 문서 프로젝트에서 사용할 개인 연결
claude mcp add --transport http --scope local handstack-docs-dev http://localhost:3000/mcp
```

대화에서 `handstack-docs-dev`를 명시하고 수정한 문서를 검색합니다.
개발 인덱스는 기본적으로 **1분 주기**로 다시 읽습니다.
서버를 종료하면 로컬 MCP도 사용할 수 없습니다.

<!-- 출처: mcp/README.md ; plugins/agent-docs/dev-mcp.cjs ; docs/guides/에이전트에-문서-연결하기.md. 발표자: 등록 해제는 각 도구의 remove로 handstack-docs-dev만 지정한다. 공개 문서 서버 handstack-docs와 구분한다. -->
