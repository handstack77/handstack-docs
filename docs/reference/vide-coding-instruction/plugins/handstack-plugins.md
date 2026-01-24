# handstack-plugins

Handstack 개발용 플러그인 가이드

Handstack 개발 시 유용한 Claude Code 및 에디터 플러그인 추천입니다.

## 추천 Claude Code 플러그인

### 1. XML Formatter
Handstack Contract 파일(`.xml`)의 포맷팅을 돕는 플러그인입니다.
- **기능**: 들여쓰기, CDATA 섹션 정리, 태그 정렬.

### 2. SQL Linter (for XML)
XML 내 `CDATA` 섹션에 있는 SQL 문법을 검사합니다.
- **기능**: MSSQL 문법 오류 탐지, 예약어 강조.

### 3. Handstack Snippets
자주 사용하는 패턴을 빠르게 입력할 수 있습니다.
- `/snippet view` -> JS 객체 템플릿
- `/snippet trans` -> 트랜잭션 매핑 템플릿
- `/snippet stmt` -> XML Statement 템플릿

## 외부 도구 통합

### VS Code 확장 프로그램
Handstack 개발 시 VS Code에서 다음 확장 프로그램을 사용하면 좋습니다:
- **XML Tools**: XML 검증 및 포맷팅.
- **ESLint**: JS 코드 품질 검사.
- **SQL Server (mssql)**: Contract에서 사용하는 쿼리 테스트.

## 커스텀 플러그인 아이디어

만약 직접 플러그인을 만든다면:
- **Contract-View Sync**: JS에서 Contract XML로 바로 이동하거나, 그 반대로 이동하는 기능.
- **Auto-Mapper**: XML의 `<param>` 태그를 보고 JS의 `inputs` 배열을 자동 생성.
