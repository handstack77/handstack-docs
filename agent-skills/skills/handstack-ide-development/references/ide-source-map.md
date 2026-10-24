# IDE 소스 탐색 단서

파일 이름과 위치는 저장소마다 다르다. 아래 "찾는 방법"으로 grep한 결과를 우선한다.

| 기능 | 찾는 방법(예시 검색어) | 확인할 책임 |
|---|---|---|
| IDE 셸(탭, 편집 상태) | 가장 큰 셸 스크립트, `monaco.editor.create`, 탭 모델 | 열린 파일 목록, dirty 상태, 저장 흐름 |
| 업무 화면 디자이너 | `data-designer-type`, `markSlotPathEdited`, `importedHtml`, `pageMappings` | 파싱·직렬화·원문 보존, 매핑 저장 |
| 독립 HTML 스튜디오 | `data-studio-props`, `data-studio-node` | 스튜디오 전용 마커와 변환 |
| 거래 계약 화면 | `.txn`, `parseContractJson`, `Services`, `CommandType` | JSONC 파싱, 서비스 편집 |
| SQL 계약 화면 | `.dbc`, `statement`, `param`, `CDATA` | XML 파싱·직렬화 |
| 함수/명령/그래프/프롬프트/저장소 화면 | `.fnc`, `.bas`, `.cyp`, `.pmt`, `.rpo` | 유형별 parse/serialize 쌍 |
| 계약 공통 워크벤치 | `contract-workbench`, `bindSectionToggle` | 공통 UI·JSONC 파서 |
| 판단 계약 검증 | `decisionIssues`, `analyzeDecisionBody` | 서버 `DecisionContract` 거울 |
| DB/API 클라이언트 | `db-console`, `api-console` | 연결 저장(비밀), 쿼리 실행 |
| 업무 관리(설정·라이브러리·메뉴) | `menus.json`, `DirectoryID`, `FolderYN`, `module.json` | 메뉴 편집기, 모듈 설정 편집 |
| Monaco 언어 제공자 | `registerCompletionItemProvider`, `syn-js-language`, `syn-html-language` | 인텔리전스 단일 구현 |
| 포매터 | `IdeFormatter`, `executeEdits`, `pushUndoStop` | 확장자별 포맷, 실행 취소 |
| 공용 다이얼로그·툴팁·리사이즈 | `showConfirm`, `showPrompt`, `tippy`, `resize-ghost` | 공용 모듈 재사용 |
| 로컬 작업영역 API | `relativePath`, 작업영역 endpoint, 템플릿 토큰 | 경로 경계 검증, 토큰 치환 |
| 포트·서버 설정 | `ServerPort`, `IdePort`, 개발 서버 연동 서비스 | 다중 설정 원자 갱신 |
| 메타데이터 generator | `tools/generate-*`, `syn-api`, `ui-library` | 생성물 재생성 |
| 모듈 템플릿 | `templates/*module*`, `__MODULE_NAME__` | 토큰·확장자·Version |

## 직접 편집 금지(재생성 대상)

생성된 메타데이터 JSON, 번들러 산출 폴더, 함수 계약의 `.g.*`, 외부 저장소에서 미러링되는 모듈 스냅샷. 원본을 고치고 generator/빌드로 재생성한다.

## 왕복 테스트 템플릿

새 필드/요소를 지원한 뒤 확인할 시나리오:

1. 기존 파일 열기 → **아무것도 바꾸지 않고 저장** → diff가 비어 있어야 한다(공백·주석·알 수 없는 요소 보존).
2. 새 필드 편집 후 저장 → 다시 열었을 때 같은 값, 다른 영역은 diff 없음.
3. 소스 탭에서 수정 → 디자이너/전용 편집기로 전환 → 되돌아와 저장 → 두 편집본이 충돌 없이 유지.
4. 실행 취소/다시 실행이 한 단계로 동작하는지, 라이트/다크 테마에서 UI가 깨지지 않는지.
5. 오류 입력(깨진 JSON/XML)에서 데이터를 잃지 않고 오류를 표시하는지.
