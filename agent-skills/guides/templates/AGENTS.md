# <프로젝트 이름> — HandStack 업무 모듈

> Claude Code는 `CLAUDE.md`, Codex CLI는 `AGENTS.md`를 읽습니다. 같은 내용을 두 이름으로 두거나 한쪽에서 다른 쪽을 가리키게 하세요.
> 한 페이지 안으로 유지하고, 에이전트가 같은 실수를 두 번 하면 "자주 틀리는 사항"에 한 줄 추가합니다.
> 식별자·파일 배치·거래 호출·보안 규칙의 전체 템플릿은 사이트의 `reference/vide-coding-instruction/examples/AGENTS`(https://handstack.kr/docs/reference/vide-coding-instruction/examples/AGENTS)입니다. 이 파일은 스킬과 점검 도구를 쓰는 프로젝트에 더하는 짧은 보충본이므로 두 가지를 합쳐 한 파일로 쓰세요.

## 구조
- 모듈: `modules/<모듈>/` (`ModuleID` = 폴더명). 화면 `wwwroot/<모듈>/view/<App>/<Project>/<ID>.html|js`, 계약 `Contracts/{transact,dbclient,function,...}/<App>/<Project>/`
- 식별자: ApplicationID=`<예: HDS>`, ProjectID=`<업무 코드>`, 화면 ID=`<업무코드><3자리>`
- 서버: `HANDSTACK_HOME=<경로>` (빌드 후처리가 이 폴더를 덮어쓸 수 있다)

## 명령
- 점검(화면·거래·SQL 연결): `python <스킬 폴더>/handstack-source-trace/scripts/hs_inspect.py --root . --screen <ID> --fail-on ERROR`
- 화면 HTML 규칙: `python <스킬 폴더>/handstack-screen-development/scripts/design_lint.py <파일>`
- JS 문법: `node --check <파일>`
- 빌드: `dotnet build -c Debug modules/<모듈>/<모듈>.csproj` (**빌드 전에 PostBuild 확인**)
- 스크립트·배포 파일 점검: `python <스킬 폴더>/handstack-cicd-pipeline/scripts/pipeline_lint.py .`

## 규칙
- 새 기능은 같은 모듈의 비슷한 화면 하나를 복제 기준으로 삼는다. 새 패턴을 만들지 않는다.
- 화면 ↔ `.txn` ↔ `.dbc`의 서비스 ID·입출력 순서·개수를 연결표로 맞춘다.
- SQL 값은 `@Param` 바인딩. 테이블/컬럼은 DDL을 읽어서 쓴다(추측 금지).
- 저장 서비스는 서버에서 규칙을 다시 검사한다. 오류를 `Exception` 결과로 돌려준 뒤 다른 seq가 쓰지 않게 한다.
- 비밀(키·토큰·연결 문자열)은 소스·로그·출력에 쓰지 않는다.

## 완료 보고 전에 (모두 실행하고 출력 요약을 붙인다)
1. `hs_inspect.py` ERROR 0 (변경한 화면 전부)
2. `design_lint.py` (변경한 HTML), `node --check` (변경한 JS)
3. 실행하지 못한 검증은 "미수행 + 이유"로 적는다 (성공으로 쓰지 않는다)

## Claude가 자주 틀리는 사항
- 그리드 컬럼은 배열 튜플만 해석된다 (객체형 불가).
- `syn-events`에 이벤트를 선언하지 않으면 핸들러가 호출되지 않는다.
- 거래 출력 개수/순서가 SQL 결과 집합과 어긋난다 (`DisposeResult` 제외 개수).
- <프로젝트 고유 사항을 여기에 추가>

## 건드리지 말 것
- 운영 설정 파일, 비밀 파일, 생성물(`bin`, `obj`, `publish`), 외부 라이브러리 폴더
- `publish.*`, `purgecontracts`, 인자 없는 `handstack stop`은 운영자 승인 후에만
