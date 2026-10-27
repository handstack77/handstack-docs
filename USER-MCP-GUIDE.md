# Claude Code와 Codex CLI에서 HandStack 문서 MCP 활용하기

HandStack 문서 MCP를 연결해 공식 문서와 예제를 확인하고 화면·거래·SQL·함수 계약 개발에 활용합니다. 등록과 실행 예제는 Windows 명령 프롬프트(cmd) 기준이며, Windows Terminal에서는 명령 프롬프트 프로필을 선택합니다.

- 확인 기준일: 2026-10-27
- 명령 도움말 확인 환경: Claude Code 2.1.311, Codex CLI 0.164.0
- 이 문서의 등록·도구 호출·개발 요청은 사용자가 실행할 예제입니다. 작성 과정에서는 CLI 버전과 도움말을 확인했으며, 사용자 MCP 설정 변경이나 실제 MCP 도구 호출은 수행하지 않았습니다.

## 목차

1. [HandStack 문서 MCP 등록하고 연결 확인하기](#quick-start)
2. [등록 범위와 설정 파일 선택하기](#configuration)
3. [문서와 예제 조회하기](#invocation)
4. [HandStack 개발에 활용하기](#development-examples)
5. [CLI로 HandStack 점검 실행하고 결과 저장하기](#codex-workflows)
6. [프로젝트 지침과 Skill로 반복 작업 정리하기](#reusable-workflows)
7. [문서 조회 도구의 사용 범위 설정하기](#permissions)
8. [로컬 개발용 HandStack 문서 MCP 연결하기](#custom-servers)
9. [연결 문제 해결과 등록 해제](#troubleshooting)
10. [관련 문서](#sources)

<a id="quick-start"></a>

## 1. HandStack 문서 MCP 등록하고 연결 확인하기

### 1.1 준비

사용할 CLI가 설치되어 있고 해당 제품에 로그인되어 있어야 합니다. 실행하는 PC에서 `https://handstack.kr/mcp`에 접속할 수 있어야 하며, HandStack 문서 MCP에는 별도 로그인이나 API 키가 필요 없습니다.

```bat
REM 설치 버전 확인: 사용할 도구의 명령만 실행
claude --version
codex --version

REM 작업할 저장소로 이동
cd /d "C:\projects\handstack77\handstack-docs"
```

`claude mcp ...`, `codex mcp ...`는 **터미널 명령**입니다. `/mcp`와 개발 요청문은 **각 CLI를 시작한 뒤 대화창에 입력**합니다.

명령 예제의 `REM`은 cmd 주석입니다. 경로와 요청문은 큰따옴표로 감싸며, `set "이름=값"`으로 설정한 환경변수는 해당 명령 프롬프트와 그곳에서 시작한 프로그램에 적용됩니다.

### 1.2 Claude Code

```bat
REM 현재 프로젝트에서 개인적으로 사용할 문서 MCP 등록
claude mcp add --transport http handstack-docs https://handstack.kr/mcp

REM 등록 목록 확인
claude mcp list

REM Claude Code 시작
claude
```

대화창에서 연결 상태를 확인합니다.

```text
/mcp
```

### 1.3 Codex CLI

```bat
REM 사용자 MCP 설정에 문서 서버 등록
codex mcp add handstack-docs --url https://handstack.kr/mcp

REM 등록 내용 확인
codex mcp list
codex mcp get handstack-docs

REM Codex CLI 시작
codex
```

Codex CLI 대화창에서도 다음 명령을 사용합니다.

```text
/mcp
```

### 1.4 첫 호출과 성공 기준

두 도구에서 같은 요청문을 사용할 수 있습니다.

```text
handstack-docs MCP의 list_docs를 호출해서 제공하는 문서 영역을 알려줘.
실제 호출 결과를 근거로 설명하고, 연결에 실패하면 실패 내용을 알려줘.
```

연결 목록에 이름이 있는 것과 실제 도구 호출 성공은 구분합니다. 호출 내역과 문서 목록이 응답에 나타나는지 확인하세요. 등록 전에 열어 둔 대화에서 서버가 보이지 않으면 새 세션에서 확인합니다.

HandStack 문서 MCP는 읽기 전용이며 별도 로그인이 필요 없습니다. API·계약·설정의 상세 설명은 이 문서에 복제하지 않고 [AI 에이전트에 HandStack 문서 연결하기](docs/guides/에이전트에-문서-연결하기.md)와 해당 대표 문서를 확인합니다.

<a id="configuration"></a>

## 2. 등록 범위와 설정 파일 선택하기

### 2.1 Claude Code의 범위

| 범위 | 적용 대상 | 저장 위치 | 선택 기준 |
|---|---|---|---|
| `local` | 나의 현재 프로젝트 | 사용자 홈의 `.claude.json` | 기본값, 개인 실험 |
| `project` | 현재 프로젝트 | 프로젝트 루트 `.mcp.json` | 팀 공유 |
| `user` | 나의 모든 프로젝트 | 사용자 홈의 `.claude.json` | 공통 개발 도구 |

```bat
REM 팀과 공유할 때 선택: .mcp.json에 기록
claude mcp add --scope project --transport http handstack-docs https://handstack.kr/mcp

REM 모든 프로젝트에서 개인적으로 사용할 때 선택
claude mcp add --scope user --transport http handstack-docs https://handstack.kr/mcp
```

위 명령은 대안입니다. 같은 이름을 여러 범위에 반복 등록할 필요는 없습니다. [Claude Code 등록 범위](https://code.claude.com/docs/en/mcp#mcp-installation-scopes)

### 2.2 Codex CLI의 사용자·프로젝트 설정

`codex mcp add`의 사용자 설정과 프로젝트에서 공유할 설정을 구분합니다.

| 설정 | 기본 위치 | 적용 대상 |
|---|---|---|
| 사용자 설정 | `~/.codex/config.toml` | 해당 사용자의 프로젝트 |
| 프로젝트 설정 | `<프로젝트>/.codex/config.toml` | 신뢰한 해당 프로젝트 |

프로젝트에서 공유하려면 `.codex/config.toml`의 기존 내용에 다음 블록을 병합합니다.

```toml
[mcp_servers.handstack-docs]
url = "https://handstack.kr/mcp"
```

같은 테이블을 파일 안에 두 번 선언하지 마세요. 프로젝트 설정의 적용 조건은 [Codex MCP 공식 문서](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)를 확인합니다. Claude Code의 `--scope project`를 Codex 명령에 그대로 붙이지 않습니다.

### 2.3 같은 서버를 두 도구에 등록하기

다음은 각각의 설정 파일에 넣는 완전한 최소 예제입니다. 파일이 이미 있으면 해당 서버 항목만 병합합니다.

Claude Code: 프로젝트 루트의 `.mcp.json`

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

Codex CLI: 프로젝트 루트의 `.codex/config.toml`

```toml
[mcp_servers.handstack-docs]
url = "https://handstack.kr/mcp"
```

서버 주소와 개발 요청은 공유할 수 있지만, 두 도구의 설정 형식과 인증 상태는 각각 확인해야 합니다.

<a id="invocation"></a>

## 3. 문서와 예제 조회하기

Claude Code와 Codex CLI에서 같은 자연어 요청을 사용할 수 있습니다. `MCP를 사용해`는 자연어 지시이며, 실제 도구 호출 내역과 반환된 문서 내용을 확인합니다.

| 작업 | 두 CLI에서 사용할 요청 |
|---|---|
| 연결·도구 확인 | 대화창에서 `/mcp` 입력 |
| 문서 검색 | `handstack-docs의 search_docs로 거래 호출 규칙을 찾아줘.` |
| 본문 확인 | `get_doc으로 검색된 문서의 입력·출력 매핑 절을 읽어줘.` |
| 예제 확인 | `get_sample로 관련 예제 파일을 찾아 구조를 설명해 줘.` |

### 3.1 제공 도구

| 도구 | HandStack 개발에서의 용도 |
|---|---|
| `search_docs` | API 이름, 설정 키, 식별자, 오류 문구로 문서 검색 |
| `get_doc` | 검색한 문서 본문이나 필요한 절 조회 |
| `list_docs` | 영역·모듈별 문서 목록 확인 |
| `get_sample` | 문서에 딸린 화면·계약 예제 파일 확인 |

정확한 인자는 [문서 연결 가이드의 제공 도구](docs/guides/에이전트에-문서-연결하기.md#제공-도구)를 확인합니다. 문서를 검색하고 필요한 절과 예제를 읽은 뒤 대상 프로젝트 소스와 대조합니다.

### 3.2 API를 검색하고 현재 소스와 대조

```text
handstack-docs의 search_docs로 "syn.$w.transactionAction"을 검색해 줘.
get_doc으로 관련 절을 읽고 현재 화면의 거래 정의와 비교해 줘.
잘못된 입력·출력 매핑을 문서 ID, 파일과 줄 번호로 알려줘.
```

### 3.3 모듈 문서와 예제 확인

```text
handstack-docs의 list_docs로 prompter 모듈 문서를 확인해 줘.
search_docs와 get_doc으로 decision 관련 규칙을 읽고,
get_sample로 관련 예제 파일을 찾아 입력·출력 구조를 설명해 줘.
조회하지 못한 문서나 예제는 확인하지 못했다고 알려줘.
```

<a id="development-examples"></a>

## 4. HandStack 개발에 활용하기

아래 요청문은 두 CLI의 대화창에서 사용할 수 있습니다. 화면 ID와 업무 조건을 대상 프로젝트에 맞게 바꾸고, 구현 요청은 개발할 업무 저장소에서 실행합니다. 구현을 요청하면 해당 프로젝트 파일이 변경될 수 있습니다.

### 4.1 목록 화면 구현

```text
handstack-docs MCP로 화면 개발, 거래 호출, 식별자와 파일 경로 규칙을 확인해 줘.
현재 프로젝트의 가까운 목록 화면을 참고해서 고객 목록 화면을 구현해 줘.

검색 조건은 고객명과 사용 여부이고 결과는 AUIGrid에 표시해 줘.
HTML·JS, 거래 계약, SQL 계약을 함께 대조하고
기존 공통 버튼과 오류 처리 방식을 유지해 줘.
```

### 4.2 거래 연결 오류 추적

```text
handstack-docs MCP로 거래 호출과 출력 매핑 규칙을 확인해 줘.
CUS010 화면에서 조회 결과가 그리드에 표시되지 않는 원인을 추적해 줘.

화면 HTML·JS → 거래 계약 → SQL 계약 → 응답 매핑 순서로 확인하고,
식별자와 dataFieldID가 어긋나는 지점을 파일과 줄 번호로 알려줘.
```

### 4.3 서버 함수 예제 확인

```text
handstack-docs의 search_docs와 get_sample을 사용해 서버 함수 예제를 찾아줘.
현재 프로젝트의 함수 계약과 비교해서 입력 파라미터,
정상 출력, Exception 출력 구조를 설명해 줘.
```

확인한 문서, 수정한 파일, 수행한 검증과 미확인 사항을 함께 보고하도록 요청하세요. HandStack 문서 MCP의 조회 성공과 실제 업무 화면·서버·DB 실행 성공은 별도로 확인합니다.

<a id="codex-workflows"></a>

## 5. CLI로 HandStack 점검 실행하고 결과 저장하기

HandStack 문서 MCP의 등록과 연결을 먼저 확인합니다. 이 절의 명령은 추가 모델 요청을 수행하며, 구현 요청은 작업 파일을 변경할 수 있습니다. 여기서는 작성 예제를 제시하며 실제로 실행하지 않았습니다.

### 5.1 시작할 때 작업 요청 전달

```bat
REM 대화형 세션을 열면서 문서 기반 분석 요청
codex "handstack-docs MCP로 거래 호출 규칙을 확인하고 현재 프로젝트의 거래 연결 구조를 설명해 줘. 파일 변경 없이 분석해 줘."
```

### 5.2 여러 줄 요청을 파일로 전달

작업 폴더에 UTF-8 텍스트 파일 `mcp-task.txt`를 만들고 다음 요청문을 저장합니다. 기존 파일이 있으면 다른 이름을 사용하세요.

```text
handstack-docs MCP로 syn.$w.transactionAction의 입력·출력 매핑 규칙을 확인해 줘.
현재 저장소에서 거래 호출 예제를 찾아 문서와 비교해 줘.
확인한 문서 ID, 관련 파일, 불일치와 미확인 사항을 정리해 줘.
분석 결과는 대화에만 작성해 줘.
```

명령 프롬프트에서 파일 내용을 표준 입력으로 전달해 비대화형으로 실행합니다.

```bat
REM 저장한 요청문을 읽어 Codex 실행
codex exec - < "mcp-task.txt"
```

cmd에서 `$`는 환경변수 치환 기호가 아니므로 파일의 `syn.$w`와 Skill 호출 이름을 그대로 사용할 수 있습니다.

### 5.3 지정한 저장소에서 분석

```bat
REM 작업 디렉터리를 명시해 비대화형 분석 실행
codex exec -C "C:\projects\handstack77\handstack-docs" "handstack-docs MCP로 현재 거래 호출 문서를 확인하고 로컬 대표 문서와 차이를 분석해 줘. 파일 변경 없이 결과만 보고해 줘."
```

### 5.4 최종 결과를 Markdown으로 저장

아래 명령은 작업 루트에 `MCP-REVIEW.md`를 생성하거나 같은 이름의 파일을 덮어씁니다. 기존 결과가 있으면 출력 파일명을 바꾸세요.

```bat
codex exec -o ".\MCP-REVIEW.md" "handstack-docs MCP로 거래 호출과 식별자 규칙을 확인하고 현재 프로젝트의 위험 요소를 검토해 줘. 소스는 변경하지 말고 최종 보고서를 Markdown으로 작성해 줘."
```

### 5.5 JSONL 실행 기록과 최종 결과 함께 저장

아래 명령은 `mcp-run.jsonl`과 `MCP-REVIEW.md`를 생성하거나 덮어씁니다.

```bat
codex exec --json -o ".\MCP-REVIEW.md" "handstack-docs MCP로 거래 호출 규칙을 확인하고 현재 화면의 거래·SQL 계약 연결을 검토해 줘. 소스는 변경하지 말고 결과만 작성해 줘." > ".\mcp-run.jsonl"
```

`--json`은 실행 이벤트를 JSONL로 출력합니다. `-o`는 최종 답변을 별도 파일로 저장합니다. [Codex CLI 명령 참조](https://learn.chatgpt.com/docs/developer-commands?surface=cli)

### 5.6 Claude Code에서 같은 점검 실행

```bat
REM 문서와 소스를 비교하고 한 번 응답한 뒤 종료
claude -p "handstack-docs MCP로 거래 호출 규칙을 확인하고 현재 화면의 입력·출력 매핑을 점검해 줘. 파일 변경 없이 결과만 알려줘."
```

[Claude Code CLI 참조](https://code.claude.com/docs/en/cli-reference)

<a id="reusable-workflows"></a>

## 6. 프로젝트 지침과 Skill로 반복 작업 정리하기

이 절의 파일은 **개발 대상 프로젝트에 적용할 템플릿**입니다. 이 문서를 읽는 것만으로 이 저장소의 `AGENTS.md`나 `CLAUDE.md`가 변경되지는 않습니다.

### 6.1 프로젝트 지침

Claude Code는 `CLAUDE.md`, Codex CLI는 `AGENTS.md`에 다음과 같은 기준을 둘 수 있습니다. 두 파일을 함께 관리하는 프로젝트는 공통 규칙의 대표 파일을 정하고 중복을 줄이세요.

```markdown
## HandStack 문서 MCP 사용

- HandStack API, 설정과 계약 규칙은 handstack-docs MCP로 확인한다.
- search_docs로 찾고 get_doc으로 필요한 절을 읽는다.
- 예제 파일은 get_sample로 확인한다.
- 화면 HTML·JS와 거래·SQL·함수 계약을 함께 대조한다.
- MCP로 확인한 사실, 소스에서 확인한 사실, 추정을 구분한다.
- 연결 실패를 알리고 실제로 조회하지 않은 정보를 조회했다고 보고하지 않는다.
```

### 6.2 Claude Code와 Codex CLI가 함께 사용하는 Skill

아래와 같이 각 도구가 읽는 위치에 같은 내용의 `SKILL.md`를 둡니다. 프로젝트 설치 예제입니다.

```text
<프로젝트>/
├─ .claude/
│  └─ skills/
│     └─ handstack-check/
│        └─ SKILL.md
└─ .agents/
   └─ skills/
      └─ handstack-check/
         └─ SKILL.md
```

두 `SKILL.md`에 넣을 공통 내용입니다. 이 예제는 MCP를 사용하는 절차만 정의하며 서버를 등록하거나 인증하지 않습니다.

```markdown
---
name: handstack-check
description: HandStack 화면과 거래 계약의 입력·출력 연결을 점검할 때 사용한다.
---

사용자가 지정한 화면이나 파일을 대상으로 다음 절차를 수행한다.

1. 대상 저장소의 AGENTS.md와 CLAUDE.md에서 적용 규칙을 확인한다.
2. HTML·JS와 연결된 거래·SQL·함수 계약을 찾는다.
3. handstack-docs MCP로 관련 거래 호출과 식별자 규칙을 확인한다.
4. 화면 입력·출력과 계약의 매핑을 대조한다.
5. 문제와 근거를 문서 ID, 파일, 줄 번호로 정리한다.
6. 정적 확인, 실제 실행 검증과 미확인 사항을 구분한다.
7. MCP 연결에 실패하면 실패를 알리고 확인하지 못한 규칙을 추측하지 않는다.
```

Claude Code 대화창:

```text
/handstack-check CUS010
```

Codex CLI 대화창:

```text
$handstack-check CUS010 화면의 거래 연결을 점검해 줘.
```

Codex CLI에서는 `/skills`로 선택할 수도 있습니다. 명령 프롬프트에서 직접 초기 요청으로 전달할 때는 큰따옴표로 감쌉니다.

```bat
codex "$handstack-check CUS010 화면의 거래 연결을 점검해 줘."
```

`/handstack-check`와 `$handstack-check`는 위에서 설치한 로컬 Skill을 사용하는 구문입니다. HandStack 문서 MCP의 `search_docs`·`get_doc` 같은 도구 이름과 구분합니다.

- [Claude Code Skill 공식 문서](https://code.claude.com/docs/en/skills)
- [Codex Skill 작성·탐색 공식 문서](https://learn.chatgpt.com/docs/build-skills)
- [이 저장소의 배포용 HandStack 스킬 안내](agent-skills/README.md)

<a id="permissions"></a>

## 7. 문서 조회 도구의 사용 범위 설정하기

HandStack 문서 MCP는 읽기 전용 문서 조회 도구입니다. 문서 조회 후 CLI에 구현을 요청하면 로컬 소스는 변경될 수 있으므로 분석만 필요한지, 수정까지 원하는지 요청에 명시합니다.

### 7.1 Claude Code의 도구 허용

아래 설정을 `.claude/settings.json`에 병합하면 명시한 문서 조회 도구의 일반 승인 절차를 줄일 수 있습니다. 조직 정책과 서버가 요구하는 추가 승인은 별도로 적용될 수 있습니다.

```json
{
  "permissions": {
    "allow": [
      "mcp__handstack-docs__search_docs",
      "mcp__handstack-docs__get_doc",
      "mcp__handstack-docs__list_docs",
      "mcp__handstack-docs__get_sample"
    ]
  }
}
```

실제 도구 이름은 `/mcp`에서 확인합니다. [Claude Code MCP 권한 규칙](https://code.claude.com/docs/en/permissions#mcp)

### 7.2 Codex CLI의 도구 노출 범위

기존 `config.toml`의 해당 서버 테이블에 필요한 항목을 병합합니다.

```toml
[mcp_servers.handstack-docs]
url = "https://handstack.kr/mcp"
enabled_tools = ["search_docs", "get_doc", "list_docs", "get_sample"]
startup_timeout_sec = 30
tool_timeout_sec = 120
```

`enabled_tools`는 노출할 도구를 제한합니다. 함께 설정한 `disabled_tools`는 그 결과에서 도구를 제외합니다. 자동 호출 승인 여부와 같은 의미는 아닙니다. 시간 설정의 단위는 초입니다. [Codex 설정 참조](https://learn.chatgpt.com/docs/config-file/config-reference)

<a id="custom-servers"></a>

## 8. 로컬 개발용 HandStack 문서 MCP 연결하기

이미 의존성이 준비된 저장소에서 개발 서버를 시작합니다. 최초 준비와 실행 조건은 [MCP README](mcp/README.md)를 따릅니다.

```bat
REM 터미널 1: 문서 개발 서버와 개발용 MCP 시작
npm run start
```

다른 터미널에서 필요한 도구에 등록합니다.

```bat
REM Claude Code
claude mcp add --transport http handstack-docs-dev http://localhost:3000/mcp

REM Codex CLI
codex mcp add handstack-docs-dev --url http://localhost:3000/mcp
```

```text
handstack-docs-dev MCP로 방금 수정한 문서를 검색하고 해당 절을 읽어줘.
검색 결과와 실제 수정 내용을 비교하고, 갱신 전 내용이면 알려줘.
```

공개 서버의 `handstack-docs`와 로컬 서버의 `handstack-docs-dev`를 구분해서 요청합니다. 인덱스 반영 시점과 오류는 `mcp/README.md`의 개발 서버 설명을 확인하세요.

<a id="troubleshooting"></a>

## 9. 연결 문제 해결과 등록 해제

### 9.1 등록과 도구 호출 구분

```bat
REM Claude Code 진단
claude --version
claude mcp add --help
claude mcp list
claude mcp get handstack-docs

REM Codex CLI 진단
codex --version
codex mcp --help
codex mcp add --help
codex mcp list
codex mcp get handstack-docs
```

두 도구 모두 대화창에서는 `/mcp`로 현재 세션에 연결된 서버와 도구를 확인합니다. 등록 설정이 존재하는 것, 세션에 연결되는 것, 요청한 도구가 성공하는 것을 각각 확인합니다.

| 증상 | 확인·조치 | 다시 확인할 결과 |
|---|---|---|
| Claude에서 다른 프로젝트에 서버가 안 보임 | `local` 범위인지 확인하고 필요한 범위 선택 | 해당 프로젝트의 `/mcp` 목록 |
| Codex에서 프로젝트 서버가 안 보임 | `.codex/config.toml` 위치와 프로젝트 신뢰 상태 확인 | 새 세션의 `/mcp` 목록 |
| 등록 후 기존 대화에서 도구가 안 보임 | 새 CLI 세션 시작 | 서버와 도구 목록 |
| 공개 문서 서버 연결 실패 | PC에서 `https://handstack.kr/mcp` 접속과 사내 프록시 정책 확인 | 실제 문서 조회 호출 성공 |
| 서버는 연결되지만 사용하지 않음 | 서버명·대상·도구·결과물을 요청문에 명시 | 실제 도구 호출 내역 |
| 도구 일부가 안 보임 | 서버가 제공하는 목록, 계정 권한, Codex `enabled_tools`·`disabled_tools` 확인 | 기대한 도구 노출 |
| 로컬 개발용 MCP에 접속 실패 | 문서 개발 서버 실행 상태와 `mcp/` 의존성 확인 | `handstack-docs-dev`의 실제 문서 조회 성공 |

### 9.2 Claude Code 시간 제한 조정

```bat
REM 서버 시작 제한: 30초, 단위는 밀리초
set "MCP_TIMEOUT=30000"

REM 도구 실행 제한: 2분, 단위는 밀리초
set "MCP_TOOL_TIMEOUT=120000"

REM 위 환경변수를 제공한 터미널에서 실행
claude
```

Codex는 [서버별 TOML 설정](#permissions)의 `startup_timeout_sec`와 `tool_timeout_sec`를 사용합니다. Claude Code의 환경변수를 Codex 설정으로 간주하지 않습니다. [Claude Code 환경변수 참조](https://code.claude.com/docs/en/env-vars)

### 9.3 등록 해제

다음 명령은 CLI의 서버 등록을 제거합니다. 프로젝트 공용 설정을 수정하면 팀이 공유하는 연결에도 영향을 주므로 제거할 위치를 확인하세요.

```bat
REM Claude Code: 해당 범위를 지정해서 제거
claude mcp remove handstack-docs --scope local

REM Codex CLI: 사용자 등록 제거
codex mcp remove handstack-docs
```

프로젝트의 `.mcp.json`이나 `.codex/config.toml`에 직접 추가한 항목은 해당 파일에서 제거합니다. 남아 있는 허용 규칙과 프로젝트 지침의 참조도 함께 확인합니다. Codex에서 등록을 유지하며 잠시 사용하지 않으려면 기존 서버 테이블에 `enabled = false`를 설정할 수 있습니다.

### 9.4 확인할 수 없는 상황의 보고 예

```text
MCP 등록 설정은 확인했지만 HandStack 문서 서버에 연결하지 못했습니다.
현재 소스에서 확인한 사실과 문서 조회가 필요한 사항을 구분해 보고합니다.
```

```text
코드 수정과 정적 검사는 완료했습니다.
업무 실행 환경이 준비되지 않아 화면 호출과 실제 DB 거래는 검증하지 못했습니다.
```

<a id="sources"></a>

## 10. 관련 문서

이 문서는 등록·호출 방식과 작업 요청 예제를 다룹니다. HandStack의 API 구문·식별자·계약 명세는 아래 저장소 대표 문서를 우선 확인합니다.

| 주제 | 대표 문서 |
|---|---|
| HandStack 문서 MCP 등록·제공 도구 | [AI 에이전트에 문서 연결하기](docs/guides/에이전트에-문서-연결하기.md) |
| 문서 MCP 개발·운영 | [MCP README](mcp/README.md) |
| HandStack 거래 호출 | [거래 호출](docs/reference/거래-호출.mdx) |
| 식별자와 계약 경로 | [식별자와 파일 경로](docs/reference/식별자와-파일-경로.mdx) |
| 배포용 HandStack 스킬 | [agent-skills README](agent-skills/README.md) |

제품별 전체 옵션과 최신 동작은 공식 문서를 확인합니다.

- Claude Code: [MCP 연결](https://code.claude.com/docs/en/mcp), [CLI 참조](https://code.claude.com/docs/en/cli-reference), [권한](https://code.claude.com/docs/en/permissions), [Skill](https://code.claude.com/docs/en/skills), [환경변수](https://code.claude.com/docs/en/env-vars)
- Codex CLI: [MCP 연결](https://learn.chatgpt.com/docs/extend/mcp?surface=cli), [개발 명령](https://learn.chatgpt.com/docs/developer-commands?surface=cli), [설정 참조](https://learn.chatgpt.com/docs/config-file/config-reference), [Skill](https://learn.chatgpt.com/docs/build-skills)
