# 모듈 통합 참조

폴더 구성, `module.json`, `menus.json`의 대표 문서는 사이트의 `reference/api/업무-모듈-개발`, `reference/api/module.json-환경설정`, `reference/api/menus.json-메뉴설정`이다. 이 문서는 셸·화면 연동, `csproj` 읽는 법, 반영되지 않을 때의 점검 순서만 둔다.

## 목차
1. 문서에서 확인할 것
2. 셸과 화면의 연동
3. csproj 읽는 법
4. 반영되지 않을 때

## 1. 문서에서 확인할 것

- 모듈 폴더 구성과 식별자(`ModuleID`와 `ProjectID`는 다른 값): `reference/api/업무-모듈-개발`
- `module.json` 최상위 키, `ModuleConfig` 공통 키, 비밀 취급, `IsCopyContract`/`IsPurgeContract`: `reference/api/module.json-환경설정`
- `menus.json`의 평면 배열 형식과 IDE 데이터셋 형식(**서로 변환하지 않는다**), `menuType`/`functions`/`roles`: `reference/api/menus.json-메뉴설정`
- `syn.config.json`: `reference/api/syn.config.json-환경설정`. 세션 동안 캐시되므로 변경 후 `SystemVersion`을 올린다. 운영에서는 `IsDebugMode=false`. 포트가 다른 개발용 사본(`syn.config.*.json`)이 있으면 어떤 것이 쓰이는지 확인한다.
- 환경별 Settings: 호스트 루트의 `ack.{환경}.json`과 `modules/`·`modulesettings/`·`synconfigs/`·`nodeconfigs/`의 환경별 파일이 짝으로 관리된다. 환경 추가는 세트 복제이므로 주소·계정·키를 다시 확인하고, 저장한 것과 실행 서버에 적용한 것은 다르다는 점을 구분한다.

## 2. 셸과 화면의 연동

- 화면은 셸 탭의 iframe에서 열리고 `parent.syn.$w…`로 셸 기능에 접근한다. 탭 ID로 화면 객체(`$화면ID`)를 찾아 `hook.frameEvent('buttonCommand', {actionID})`를 호출한다.
- 셸은 `functions`로 상단 버튼을 켜고, 화면의 `config.actionButtons`로 추가 버튼을 그린다.
- 셸이 `pageResizing`, `frameEvent('darkModeChanging' | 'storegeChanging' | 'sessionDestroy')`를 호출한다. 셸 JS를 바꾸면 모든 화면에 영향이 가므로 이웃 화면의 사용 방식을 먼저 조사한다.

## 3. csproj 읽는 법

확인 항목: `TargetFramework`, `OutputType=Library`, `Reference`(HandStack.Core/Web/Data), `None/Content` 복사 규칙(`wwwroot/**`, `Contracts/**`, `module.json`), `Compile Remove="Contracts/function/**"`, PreBuild(`RemoveDir $(TargetDir)`), PostBuild(환경 변수 경로 삭제·복사), 주석 처리된 이전 배포 블록. 환경 변수 이름은 프로젝트마다 다르다 — 값은 `echo`로 확인하되 출력에 비밀이 없는지 본다.

## 4. 반영되지 않을 때

| 증상 | 확인 순서 |
|---|---|
| 화면 404 | 열린 URL의 `/{Module}/view/…` 경로·대소문자 → 호스트가 서빙하는 `WWWRootBasePath` → 파일 존재 |
| 메뉴에 안 보임 | 메뉴 형식·`showYN`/`ViewYN` → 부모 연결 → 역할 → 메뉴 캐시(브라우저 세션) |
| 계약 수정이 안 먹음 | 런타임 계약 폴더 vs 소스 → `IsCopyContract`/`IsPurgeContract` → 서버 refresh/감시 → 같은 ID 중복 |
| 거래 `요청 가능화면` 오류 | `.txn`의 `AccessScreenID`에 호출 화면 ID가 있는지 |
| 빌드 후 수정이 사라짐 | PostBuild가 런타임 폴더를 재생성함 — 원본 위치와 환경 변수 확인 |
| 설정 변경 무반응 | `IsConfigurationWatching` 여부, 재시작 필요(`reference/api/ack-프로그램`의 재시작 필요 키), `syn.config.json` 세션 캐시 |
