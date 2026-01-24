# handstack-integration

Handstack MCP 통합 가이드

Handstack 아키텍처와 MCP(Model Context Protocol) 서버를 통합하여 개발 효율을 높이는 방법입니다.

## 1. 데이터베이스 MCP 서버
Handstack은 주로 MSSQL을 사용하므로, 데이터베이스 스키마를 조회할 수 있는 MCP 서버 설정이 유용합니다.

**`mcp-servers.json` 예시:**
```json
{
  "mssql-server": {
    "command": "npx",
    "args": [
      "-y",
      "@modelcontextprotocol/server-mssql"
    ],
    "env": {
      "DB_HOST": "localhost",
      "DB_USER": "sa",
      "DB_PASS": "Password123!",
      "DB_NAME": "HDS_DB"
    }
  }
}
```
**활용법**:
- Claude에게 "BaseCode 테이블의 컬럼 정보를 보여줘"라고 요청하여 Contract XML 작성 시 참고.

## 2. 파일 시스템 MCP (기본)
`src/Contracts`와 `src/view` 간의 컨텍스트 스위칭을 줄이기 위해 파일 시스템 접근이 중요합니다.
- 이미 기본적으로 제공되므로 별도 설정 불필요.
- `glob` 툴을 사용하여 관련 파일(`CDM010.*`)을 한 번에 찾을 수 있음.

## 3. Handstack 전용 MCP 서버 (아이디어)
Handstack 프로젝트 구조를 이해하는 전용 MCP 서버를 개발할 수 있습니다.

**기능:**
- **트랜잭션 조회**: "LD01 트랜잭션이 무슨 일을 해?"라고 물으면 XML과 JS를 분석해 답변.
- **의존성 그래프**: 특정 Contract가 어떤 View에서 사용되는지 추적.
- **자동 완성**: JS 작성 시 사용 가능한 트랜잭션 ID 제안.

## 환경 변수 설정
`.env` 파일에 데이터베이스 연결 정보를 안전하게 저장하고 MCP 서버에 전달하세요.
