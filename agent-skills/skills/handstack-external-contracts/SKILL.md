---
name: handstack-external-contracts
description: HandStack의 command(.bas, CLI 실행·외부 HTTP 호출, CommandType C), graphclient(.cyp, Cypher/Neo4j·Memgraph, CommandType G), repository(.rpo 파일 저장소 정책, 업로드·다운로드·첨부 파일 컨트롤) 계약을 개발·수정한다. executable·arguments·{@Param}/{#Param} 치환, requests의 url/headers/authorization/body, $param Cypher, RepositoryID·UploadSizeLimit·메타데이터 거래(TransactionGetItem 등), syn_fileclient·syn_filedropzone 첨부 기능 요청이면 반드시 사용한다.
---

# command · graphclient · repository 계약

세 계약은 모두 `.txn` 서비스에서 `CommandType`으로(또는 화면의 `repositoryID`로) 연결되고 서버 권한으로 외부 자원(프로세스, 외부 API, 그래프 DB, 파일 시스템)에 접근한다. 그래서 **무엇을 허용하는지**(allowlist, 권한, 크기)가 기능만큼 중요하다. 계약을 쓸 때 "동작"과 "허용 범위"를 같이 검토한다.

| 계약 | 확장자(IDE) | CommandType | 모듈 | 위치 | 형식의 대표 문서 |
|---|---|---|---|---|---|
| command | `.bas` | `C` | command | `Contracts/command/{App}/{Project}/{TransactionID}.bas` | `reference/api/modules/command`의 "계약 파일 형식 (.bas)" |
| graphclient | `.cyp` | `G` | graphclient | `Contracts/graphclient/{App}/{Project}/{TransactionID}.cyp` | `reference/api/modules/graphclient`의 "계약 파일 형식 (.cyp)" |
| repository | `.rpo` | (거래 아님) | repository | `Contracts/repository/{App}/{모듈}.rpo` | `reference/api/modules/repository`의 "저장소 선언 (.rpo)" |

요소 이름, 치환 규칙(`{@이름}`/`{#이름}`), 인증·본문 형식, 저장소 항목의 의미와 서버가 강제하는 범위는 위 문서가 대표다. 이 스킬은 작업 순서와 허용 범위 점검만 둔다.

## 시작

프로젝트 지침과 같은 폴더의 기존 계약을 읽고, 대응 `.txn`과 호출 화면을 확인하고(`handstack-source-trace`), 서버 설정 값(키·연결 문자열)은 존재만 확인한다.

## command (.bas)

- 실행 파일과 인자를 **셸 없이 분리**해 선언한다. 사용자 입력은 인자나 JSON 본문에 `{#…}`로 넣고 문자열을 이어 붙여 명령줄을 만들지 않는다.
- 실행 파일이 서버 `Security.AllowedExecutableBasePaths` 허용 경로 안에 있는지 확인한다(비어 있으면 정책 검토를 요청한다).
- 인증 키·토큰은 계약에 고정하지 않고 파라미터나 서버 설정으로 주입한다. 예제 도메인을 운영 값으로 바꿔 커밋하지 않는다.
- `timeout`, `successExitCodes`, `maxOutputBytes`를 명시한다. 출력은 `maxOutputBytes`에서 잘린다.
- 테스트 중에 패키지 설치, 메일 발송, 운영 명령을 실행하지 않는다. 실제 외부 API 호출이 필요하면 모의 서버나 승인된 대상으로 제한한다.

## graphclient (.cyp)

- 파라미터는 `$이름`이다(SQL의 `@`와 다르다). SQL 문법으로 바꾸지 않는다.
- 반환 별칭(`AS`)이 화면 컬럼 이름이다.
- 읽기와 쓰기(`CREATE`/`MERGE`/`DELETE`)를 구분하고 쓰기는 필요한 계정 권한만 있는지 확인한다. 결과가 크면 `LIMIT`/조건으로 제한한다.

## repository (.rpo)

- **메타데이터 거래**: `Transaction*` 항목이 가리키는 `.txn`/`.dbc`가 모두 있어야 한다. 파일을 물리적으로 복사하는 것만으로 메타데이터가 생기지 않으며 삭제·이관은 repository API로 한다.
- **확장자(`UploadExtensions`)는 서버가 검사하지 않는다.** 서버 측 차단이 필요하면 업로드 후 검증 로직을 따로 둔다고 보고한다. 크기·경로 안전성·건수는 서버가 강제한다.
- 신규 작성 중에는 임시 `dependencyID`로 올리고 저장 성공 후 `updateDependencyID`로 업무 키로 옮긴다.
- 단일 파일 저장소(`IsMultiUpload: false`)는 새 파일을 올리면 이전 파일을 지운다. `AccessMethod`와 다운로드 URL 노출 범위를 최소화한다.
- 저장 경로(`PhysicalPath`)와 DB 경로는 환경별 값이다. 운영 경로를 소스에 새로 쓰지 않는다.

## 검증

`.bas`/`.cyp`는 XML 파싱과 파라미터 치환 이름 일치, `.rpo`는 JSONC 파싱과 `Transaction*` 거래 존재를 확인한다. 실행은 허용 경로·대상 호스트·테스트 파일로 제한한 승인된 환경에서 한다. 업로드 성공·실패(크기 초과)·삭제·다운로드를 따로 확인하고 외부 호출 검증은 정적 검증과 분리해 보고한다.

## 문서

MCP `reference/api/modules/command`, `reference/api/modules/graphclient`, `reference/api/modules/repository`, `startup/learning/uicontrols/file-client`, `startup/learning/uicontrols/file-drop-zone`, `reference/api/modules/transact`(C/G 라우팅).
