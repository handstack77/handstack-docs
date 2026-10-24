# handstack-integration

Handstack MCP 통합 가이드

Handstack 아키텍처와 MCP(Model Context Protocol) 서버를 통합하여 개발 효율을 높이는 방법입니다.

## 1. 데이터베이스 MCP 서버
Handstack은 SQL Server, Oracle, PostgreSQL, MySQL, SQLite를 지원하므로, 데이터베이스 스키마를 조회할 수 있는 MCP 서버 설정이 유용합니다.

**`mcp-servers.json` 예시** (패키지 이름과 환경 변수 이름은 설명용 자리표시자입니다. 사용하는 DBMS용 MCP 서버의 문서를 확인해 바꾸세요):
```json
{
  "database-server": {
    "command": "npx",
    "args": [
      "-y",
      "<사용하는 DBMS용 MCP 서버 패키지>"
    ],
    "env": {
      "DB_HOST": "localhost",
      "DB_USER": "<읽기 전용 계정>",
      "DB_PASS": "${DB_PASS}",
      "DB_NAME": "<데이터베이스 이름>"
    }
  }
}
```

비밀번호를 파일에 직접 쓰지 말고 환경 변수로 주입하세요. 개발·운영 DB에는 읽기 전용 계정을 쓰는 것이 안전합니다.
**활용법**:
- Claude에게 "BaseCode 테이블의 컬럼 정보를 보여줘"라고 요청하여 Contract XML 작성 시 참고.

## 2. 파일 시스템 MCP (기본)
`contracts/dbclient`와 `contracts/wwwroot` 간의 컨텍스트 스위칭을 줄이기 위해 파일 시스템 접근이 중요합니다.
- 이미 기본적으로 제공되므로 별도 설정 불필요.
- `glob` 툴을 사용하여 관련 파일(`BOD010.*`)을 한 번에 찾을 수 있음.

## 3. Handstack 전용 MCP 서버

공식 문서를 검색하고 읽는 문서 MCP 서버는 이미 제공됩니다. 등록 방법은 [AI 에이전트에 HandStack 문서 연결하기](/docs/guides/에이전트에-문서-연결하기)를 참고하세요. 아래는 프로젝트 소스를 분석하는 서버를 직접 만들 때의 아이디어입니다.

Handstack 프로젝트 구조를 이해하는 전용 MCP 서버를 개발할 수 있습니다.

**기능:**
- **트랜잭션 조회**: "LD01 트랜잭션이 무슨 일을 해?"라고 물으면 XML과 JS를 분석해 답변.
- **의존성 그래프**: 특정 Contract가 어떤 View에서 사용되는지 추적.
- **자동 완성**: JS 작성 시 사용 가능한 트랜잭션 ID 제안.

## 환경 변수 설정
`.env` 파일에 데이터베이스 연결 정보를 안전하게 저장하고 MCP 서버에 전달하세요.
