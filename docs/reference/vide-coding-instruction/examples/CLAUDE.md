---
title: CLAUDE.md
description: HandStack 프로젝트에서 Claude Code가 문서 조회, 작업 순서, 검증, 보안을 지키도록 하는 CLAUDE.md 템플릿입니다.
---

# CLAUDE.md

HandStack 프로젝트의 루트에 두는 `CLAUDE.md` 템플릿입니다. 프로젝트 규칙(식별자, 파일 배치, 계약 작성, 보안)은 [AGENTS.md 템플릿](/docs/reference/vide-coding-instruction/examples/AGENTS)에 두고, `CLAUDE.md`에는 Claude Code에만 해당하는 작업 방식을 둡니다. 두 파일에 같은 규칙을 복사해 두면 한쪽만 고쳐져 어긋나므로, 아래처럼 `@AGENTS.md`로 불러오세요.

`<...>`로 표시한 곳은 프로젝트에 맞게 바꾸세요.

## 사용 방법

1. 프로젝트 루트에 [AGENTS.md](/docs/reference/vide-coding-instruction/examples/AGENTS)를 먼저 만듭니다.
2. 아래 템플릿을 같은 위치의 `CLAUDE.md`로 복사합니다. 첫 줄 `@AGENTS.md`가 프로젝트 규칙을 불러옵니다.
3. [AI 에이전트에 HandStack 문서 연결하기](/docs/guides/에이전트에-문서-연결하기)를 따라 문서 MCP 서버를 `.mcp.json`으로 등록합니다.
4. 개인 취향(응답 언어, 알림 방식)은 저장소에 두지 말고 `~/.claude/CLAUDE.md`에 둡니다.

## 템플릿

~~~~markdown
# <프로젝트 이름>

@AGENTS.md

## 문서 조회

HandStack 규칙을 기억에 의존해 답하지 말고 `handstack-docs` MCP 도구로 확인합니다.

- `search_docs`: API 이름(`syn.$w.transactionAction`), 설정 키, 식별자, 오류 문구로 검색합니다. 질문 문장 전체보다 핵심 키워드가 잘 맞습니다. `section`(reference, tutorial 등)이나 `module`(transact, dbclient 등)로 좁힙니다.
- `get_doc`: 검색 결과의 id로 읽습니다. 긴 문서는 `section`으로 필요한 부분만 읽습니다.
- `get_sample`: 화면·계약 예제 파일을 봅니다. 새 파일을 만들 때 가장 가까운 예제를 기준으로 삼습니다.
- `llms-full.txt`(약 3MB)를 통째로 읽지 않습니다. MCP를 쓸 수 없을 때만 `llms.txt`로 문서를 고르고 영역별 `llms-<영역>.txt`를 읽습니다.
- 문서에서 근거를 찾지 못한 내용은 "문서에서 확인하지 못했다"고 말하고 추측으로 코드를 쓰지 않습니다.

## 작업 방식

1. 새 화면이나 기능은 구현 전에 계획을 먼저 보여 줍니다. 계획에는 TransactionID, ServiceID, 만들거나 고칠 파일(화면 HTML·JS, 거래 JSON, SQL XML)과 사용할 datasource를 적습니다.
2. 계획에서 기존 ID와 충돌하지 않는지 `Grep`으로 먼저 확인합니다.
3. 한 번에 한 화면(한 TransactionID)씩 만듭니다. 화면·거래·SQL 세 파일을 같은 단계에서 함께 고치고, 중간 상태로 두지 않습니다.
4. 요청과 무관한 파일, 서식, 이름은 건드리지 않습니다. 필요해 보이면 제안만 합니다.
5. 같은 계약을 쓰는 화면이 더 있는지 검색한 뒤 공유 SQL·계약을 고칩니다.
6. 설정 파일(`appsettings*.json`, `module*.json`)과 `contracts` 밖의 서버 파일은 수정 전에 이유를 설명하고 확인을 받습니다.

## 검증

- 파일을 고친 뒤 화면 ↔ 거래 계약 ↔ SQL 계약의 ID, `dataFieldID`, `statement id`를 표로 대조해 보고합니다.
- JSON·XML은 저장 후 문법을 확인합니다. XML은 `CDATA` 닫힘과 태그 짝을, JSON은 쉼표와 따옴표를 봅니다.
- `ack` 서버(`<개발 서버 주소>`)가 실행 중이면 화면을 열어 Network 응답을 확인합니다. 서버를 띄우지 못했거나 화면을 확인하지 못했다면 결과를 "미실행"으로 보고하고 동작을 보장하는 표현을 쓰지 않습니다.
- 회귀 확인 항목: `<예: 조건 없는 조회, 분류 조건 조회, 필수값 누락 등록, 정상 등록, 없는 ID 조회, 삭제>`

## 코드 스타일

- 화면 JS는 `'use strict'`로 시작하고 화면 객체 하나(`$<TransactionID>`)에 로직을 모읍니다. 전역 변수와 함수를 새로 만들지 않습니다.
- 파일은 작게 나눕니다. 한 화면이 복잡해지면 공통 로직을 `method`나 공통 스크립트로 분리하는 방안을 제안합니다.
- 코드, 주석, 문서에 이모지를 쓰지 않습니다.
- 디버깅용 `console.log`는 작업을 끝내기 전에 지웁니다.
- 주석은 이유가 코드에서 드러나지 않을 때만 씁니다. 기존 주석의 언어와 밀도를 따릅니다.
- SQL은 파라미터(`@이름`)로만 값을 받습니다. 사용자 입력을 SQL 문자열에 이어 붙이지 않습니다.

## 비밀정보와 권한

Claude Code가 비밀정보 파일을 읽지 않도록 `.claude/settings.json`에 막아 둡니다. 파일 이름은 프로젝트에 맞게 바꾸세요.

```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./**/appsettings.production.json)",
      "Read(./**/module.production.json)"
    ]
  }
}
```

- 연결 문자열이나 키가 필요한 작업은 자리표시자(`<데이터베이스 연결 문자열>`)로 코드를 쓰고, 실제 값은 사용자가 설정에 넣게 안내합니다.
- 응답이나 로그에서 비밀 값을 발견하면 파일이나 커밋에 옮기지 말고 사용자에게 알립니다.

## Git

- `<기본 브랜치>`에 직접 커밋하지 않고 작업 브랜치를 만듭니다.
- 한 기능의 화면·거래·SQL 변경은 한 커밋에 묶고, 메시지에 TransactionID와 ServiceID를 적습니다. 예: `BOD010 LD01 조회 조건에 분류 추가`
- 커밋 메시지 언어와 형식은 `<팀 규칙>`을 따릅니다.
- 커밋과 푸시는 사용자가 요청할 때만 합니다.

## 이 프로젝트의 확장

- 신규 화면 생성: `/handstack-scaffold <TransactionID>` 명령 (`<경로 수정 완료 여부>`)
- 구현 담당 서브에이전트: `handstack-developer`
~~~~

## 설정 예시

### .mcp.json

프로젝트 루트에 두고 저장소에 커밋하면 팀원이 같은 문서 서버를 씁니다. 설치가 필요 없어 팀 공용 설정에 적합합니다. 사내망에서 직접 운영하는 서버를 쓰려면 `url`만 바꿉니다.

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

### 문서 조회 자동 허용

읽기 전용 도구이므로 매번 승인하지 않도록 `.claude/settings.json`에서 허용할 수 있습니다.

```json
{
  "permissions": {
    "allow": ["mcp__handstack-docs"]
  }
}
```

## 함께 쓰는 자료

- [AI 에이전트에 HandStack 문서 연결하기](/docs/guides/에이전트에-문서-연결하기): 등록 방법과 제공 도구
- [handstack-rules](/docs/reference/vide-coding-instruction/rules/handstack-rules): 파일 명명과 화면 스크립트 작성 규칙
- [handstack-scaffold](/docs/reference/vide-coding-instruction/commands/handstack-scaffold) 명령과 [handstack-developer](/docs/reference/vide-coding-instruction/agents/handstack-developer) 에이전트: 구현체가 없는 예시이므로 프로젝트의 `.claude/commands/`, `.claude/agents/`로 복사한 뒤 계약 경로와 확장자(`.xml`/`.dbc`, `.json`/`.txn`)를 프로젝트에 맞게 고쳐 사용하세요.
