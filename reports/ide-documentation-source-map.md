# HandStack IDE 공개 문서의 근거와 갱신 범위

확인일: 2026-09-27. qcn.winform 기준 HEAD: `b9fd080a2d365b4d27f791b55c3f69aec1e3cf61`.
교육 루트: `C:/projects/qcn.winform/0.Reference/resource-hub/2. 교육/`.
구현 루트: `C:/projects/qcn.winform/1.DesktopHost/stavlo/`.
공개 문서: 이 저장소 `docs/ide/`, 상단 **IDE 사용하기**, `/docs/ide/`.

이 표는 유지보수용이며 사용자 메뉴에는 노출하지 않습니다. 교육 원문을 그대로 게시하지 않고, 현재 구현을 대조한 내용을 짧은 학습·작업·참조 문서로 나눕니다. 소스 조회로 확인한 사실과 실제 제품 실행 검증을 구분합니다.

## 원문 → 공개 문서

| 교육 원문(교육 루트 기준) | 공개 문서(`docs/ide/` 기준) | 대표 책임 |
|---|---|---|
| `README.md`, `learn/README.md`, `learn/learning-paths.json`, `journey/README.md` | `index.mdx` | 수준별 진입·6단계 순서·완료 조건 |
| `퀵-가이드.md`, `전체-매뉴얼.md` §2~5, `learn/02-ide-화면과-파일작업/` | `learn/작업영역-열기.mdx` | 열기·편집·저장·검색 범위 |
| `learn/03-프로젝트와-개발서버/`, `references/개발자-실무-가이드.md` | `learn/프로젝트와-서버.mdx` | 생성 입력·rdy 연동·실행 준비 |
| `learn/05-view-designer-화면만들기/` | `learn/화면-편집하기.mdx` | 작은 수정·저장 왕복·실행 화면 확인 |
| `learn/07-dbclient-sql계약/`, `learn/08-transact-거래계약/` | `learn/계약-실행하기.mdx` | SQL·거래·화면 결과 비교 |
| `learn/06-화면동작과-메뉴/`, `learn/10-테스트와-디버깅/` | `learn/메뉴와-검증.mdx` | 메뉴 연결·실패 시험·추적 증거 |
| `journey/08-배포.md`, `journey/09-유지보수.md`, `journey/실습-기록장.md`, `references/운영자-런북.md` | `learn/운영-인수인계.mdx` | 백업·복원·인수 검증 |
| `references/SDLC-모델링-실습.md`, `전체-매뉴얼.md` §7.3 | `guides/도메인-모델링.mdx` | 엔티티·앱 DB·23개 도구 선택·연계 |
| 교육 자료 이후 추가된 `Bootstraping/wwwroot/GUIDE.md`의 Tabler 절 | `guides/tabler-studio.mdx` | 일반 HTML 시안·프로젝트 저장·제약 |
| `references/화면-및-메뉴-카탈로그.md`, `전체-매뉴얼.md` | `reference/메뉴와-도구.mdx` | 기능에서 실제 메뉴·도구로 찾기 |
| `references/개발자-실무-가이드.md`, `전체-매뉴얼.md` §6·13 | `reference/파일과-저장-규칙.mdx` | 확장자·경로·마커·메뉴 필드·백업 |
| `references/단축키-및-공통기능.md` | `reference/단축키.mdx` | 기본 키·포커스·탐색 경계 |
| `learn/11-환경설정과-보안/`, `references/운영자-런북.md` | `reference/설정과-보안.mdx` | 설정 적용 대상·보안 경계 |
| `references/장애대응-보안-체크리스트.md`, `learn/10-테스트와-디버깅/` | `reference/문제-해결.mdx` | 증상별 첫 확인·복구 후 재시험 |
| 위 문서들의 용어·구조 변경 | `reference/index.mdx` | 이름·작업별 빠른 찾기 |

`curriculum/`와 `slides/`의 강사 시간표·발표 표현은 웹 입문 경로에 복제하지 않습니다. 사용자 기능의 변경이 포함되면 위 대표 문서로 반영합니다. HandStack API·Board DDL·설치 절차는 기존 `docs/reference`, `docs/tutorial`, `docs/startup`으로 연결합니다.

## 사실 확인에 사용하는 구현

다음 경로는 구현 루트 기준입니다.

| 주장·변경 영역 | 확인 위치 |
|---|---|
| IDE C# 프로젝트·실행 파일 이름 | 솔루션 루트 `winform.slnx`, `stavlo.csproj`의 `RootNamespace`·`AssemblyName`, `README.md`의 패키징 명령 |
| 셸 조작·설정·도구별 사용법 | `Bootstraping/wwwroot/GUIDE.md`, `index.html`, `js/ide.js` |
| 프로젝트명·코드 검증, 기본 키 | `Bootstraping/wwwroot/js/ide.js`의 `newProject` 입력 검증과 `shortcuts` |
| 공개된 업무 메뉴와 화면 ID | `Bootstraping/wwwroot/store/business_menu/menu_items.json`의 `showYN`·상위 메뉴 |
| View Designer 저장 마커·거래 매핑 | `Bootstraping/wwwroot/page/view-designer/view-designer.js`의 `DESIGNER_SAVED_ATTRS`, `PAGE_MAPPINGS_CONFIG_KEY` |
| Studio 프로젝트·마커·내보내기 | `Bootstraping/wwwroot/GUIDE.md`의 Tabler 절, `page/tabler-studio/` |
| 생성 파일·경로·실행 부작용 | `Bootstraping/templates/handstack-module/README.md`, 실제 `Contracts`·`wwwroot` 템플릿 |
| IDE 포트·로컬 접근·영속 경로 | 루트 `AGENTS.md`, `Services/IdePortConfigurationService.cs`, `Startup.cs`, `Shared/Services/AppPaths.cs` |

## 원문 차이와 이번 반영

- 교육 퀵 가이드의 프로젝트 입력 설명을 그대로 쓰지 않고 실제 검증에 맞춰 **프로젝트명=소문자 모듈 ID**, **프로젝트 코드=대문자 3자리**로 구분했습니다.
- 교육 원문의 Board 예제와 현재 생성 템플릿의 SampleItem 예제는 다릅니다. 웹 IDE 학습에서는 `idelab/LAB` 생성 예제와 기존 게시판 학습을 명시적으로 분리했습니다.
- GUIDE의 오래된 View Designer 절에는 `<block data-design-type>` 설명이 남아 있지만, 현재 코드의 저장 속성은 `data-designer-type`, `data-designer-root-count`, `data-designer-props`입니다. 코드 기준으로 작성했습니다.
- GUIDE의 모듈 API 콘솔 목록과 실제 메뉴 정의가 다릅니다. 공개 문서에는 확인되지 않은 모듈 화면을 추가하지 않고 실제 메뉴 경로를 안내했습니다.
- 현재 `.dbc` 템플릿 `LD01`에는 테이블 생성·초기 데이터 삽입이 있습니다. ‘조회는 읽기 전용’으로 설명하지 않고 실행 전 경고를 추가했습니다.
- 템플릿 README는 `ItemNo TEXT` DDL을 안내하지만 `.dbc`의 초기화 구문은 `INTEGER PRIMARY KEY AUTOINCREMENT`이며 저장 구문에는 문자열 키 생성이 있습니다. 제품 결함 여부는 실제 실행 검증이 필요합니다. 문서에서는 스키마·계약 대조와 별도 실습 DB를 요구하고, CRUD 성공을 보장하거나 제품 코드를 임의 수정하지 않았습니다.
- 하단 개발자 도구·API 테스트의 표시 조건은 Debug 빌드+디버거이며, DevTools 메뉴의 `IsDeveloperMode` 조건과 구분했습니다.
- 기존 교육 캡처는 사용자·PC 식별 정보와 과거 UI가 포함될 수 있어 공개 문서에 복사하지 않았습니다. 새 캡처는 비식별 검토 후 추가합니다.

## 프로젝트명 변경 확인 — 2026-09-27

- 위 HEAD 이후 작업 트리에서 C# 프로젝트가 `1.DesktopHost/stavlo/stavlo.csproj`로 변경된 것을 확인했습니다. `RootNamespace`는 `Stavlo`, `AssemblyName`은 `stavlo`이며, 프로젝트 README의 실행 파일은 Windows `stavlo.exe`, macOS·Linux `stavlo`입니다.
- 공개 문서의 `index.mdx`에 `stavlo` 이름을 연결하고, `reference/파일과-저장-규칙.mdx#ide-host-project`와 빠른 참조에 현재 이름·경로를 정리했습니다. UI 라이브러리 소개에도 소속 프로젝트를 명시했습니다. 설정 화면의 `stavlo IDE 포트` 표기는 실제 `index.html`과 일치합니다.
- 솔루션 디렉터리 `qcn.winform`, 솔루션 파일 `winform.slnx`, 인스턴스 확인 API `/winform/instance`, Mutex `WinformSingleInstance-{port}`는 현재 이름을 유지합니다. 일반 WinForms 기술명이나 과거 블로그 사례는 프로젝트명 변경 대상이 아닙니다.
- 솔루션 README·updater README·루트 지침·교육 원본에는 이미 변경된 프로젝트명이 반영되어 있어 중복 수정하지 않았습니다. 이번 확인은 소스와 문서 대조이며, 설치 파일 재배포나 제품 실행 검증을 의미하지 않습니다.

### 검증 메모

- 타입 검사, 정적 사이트 생성, 다운로드 단위 테스트 10개는 통과했습니다. 브라우저에서 새 참조 링크와 모바일 사이드바를 확인했습니다.
- 다만 생성 HTML의 일부 한글 텍스트·링크에 원문에는 없는 NULL 문자가 들어갑니다. `/docs/ide/`의 프로젝트와 서버 링크에서 확인했으며, 캐시 삭제·재빌드·HTML 압축 생략 후에도 재현됩니다. 탐색 테스트에 NULL 문자 검사를 추가했고 현재 `/blog`에서 실패합니다. 배포 전 해결이 필요합니다.
- 설치된 React DOM 18.2.0과 Docusaurus 3.10.1의 `renderToPipeableStream` 경로를 확인했습니다. [React의 유사 증상 보고](https://github.com/react/react/issues/31134)가 있으나 이번 작업에서 정확한 원인을 확정하거나 의존성을 변경하지는 않았습니다. 공식 updater 조회 실패에 따른 배포 페이지 안내도 별도로 확인했습니다.

## 배포 패키지 ID 변경 확인 — 2026-09-27

- `2.WebHost/updater/createpack.bat`의 `PACKID=Stavlo`와 updater README의 `--packId Stavlo`를 확인했습니다. 데스크톱 프로젝트 README에 남은 `-u HandStack.IDE`를 `-u Stavlo`로 갱신하고, 채널도 updater 지침과 같이 명시했습니다.
- 공개 참조와 `/ide` 다운로드 안내에는 새 패키지 ID `Stavlo`를 반영했습니다. 제품 설명 `HandStack IDE`, C# 프로젝트·실행 파일의 소문자 `stavlo`, 기존 `/ide`·`/docs/ide/` 주소는 유지합니다.
- 로컬 `updater/releases/assets.win.json`은 확인 시점에 이전 `HandStack.IDE-*` 파일을 가리키고 있습니다. 배포 자산·인덱스를 변경하지 않았으며, 다운로드 플러그인은 계속 실제 카탈로그의 `fileName`을 사용합니다. 새 OS별 파일명 테스트와 이전 이름 보존 테스트로 두 경우를 구분합니다.
- 패키징·업로드·기존 설치본 자동 업데이트는 실행하지 않았습니다. 이전 절의 생성 HTML NULL 문자 문제는 이번 이름 변경 범위에서 수정하지 않습니다.
- 이번 변경의 타입 검사·사이트 빌드·다운로드 단위 테스트 11개와 새 패키지명 산출물 검사는 통과했습니다. 개발 서버에서 데스크톱·모바일 다운로드 안내를 확인했습니다. 전체 탐색 검사는 기존 `/blog`의 NULL 문자 오류로 여전히 실패하며, 공식 updater 조회 실패 시 안내 링크로 대체됩니다.

## 갱신 완료 조건

1. 원문 변경의 사용자 영향과 대응 페이지를 찾습니다. 구현과 다르면 현재 메뉴·코드·템플릿을 확인하고 차이를 기록합니다.
2. 학습 절차에는 행동·성공 기준·실패 시 확인 위치만 남기고 정확한 규칙은 참조 문서 한 곳에서 관리합니다.
3. 순서·주소 변경 시 navbar, `sidebars.ts`, 이전/다음 링크, `/ide` 설치 후 안내와 빠른 참조를 함께 검토합니다.
4. 타입 검사·사이트 빌드·`tests/docs-navigation.mjs`를 통과시키고 브라우저에서 데스크톱·모바일 탐색을 확인합니다.
5. qcn.winform의 두 루트 지침이 byte 단위로 동일한지 확인합니다. 제품 실행·DB 거래를 하지 않았다면 미검증으로 명시합니다.

자동 원문 복사나 외부 배포는 수행하지 않습니다. 문서 저장소에 접근할 수 없으면 미반영 목록을 남겨 다음 작업으로 넘깁니다.
