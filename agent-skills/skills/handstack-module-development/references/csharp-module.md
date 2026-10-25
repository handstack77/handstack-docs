# C# 모듈 코드 개발

모듈 코드의 구조(로딩, `ModuleInitializer`, 설정 엔티티, 컨트롤러 접근 제어, 모듈 간 이벤트, 런타임 설정 반영)의 대표 문서는 사이트의 `reference/api/업무-모듈-개발`이다. 이 문서는 새로 만들거나 고칠 때의 함정과 체크리스트만 둔다. 문서와 소스가 다르면 소스(`3.Infrastructure/HandStack.Web/Modules`, 기존 모듈 `2.Modules/*`)를 따른다.

## 목차
1. 함정
2. 체크리스트

## 1. 함정

- 같은 라이브러리를 여러 모듈이 쓰므로 `ack`에서는 모든 모듈이 기본 로드 컨텍스트를 공유한다. 호환 버전으로 맞추고, 리플렉션으로 다른 모듈의 타입을 찾는 코드는 먼저 `Assembly.Load("이름")`을 호출한다(파일을 폴더에 두는 것만으로 선행 로드되지 않는다).
- 새 모듈을 `rdy`에 **정적으로** 결합해야 할 때만 csproj 참조와 정적 사전을 고친다. `rdy`는 정적 사전에 없는 모듈을 동적으로 로드한다.
- 설정 파일 누락·역직렬화 실패는 시작을 중단하는 것이 기존 모듈의 방식이다. 조용히 기본값으로 넘기지 않는다. `AuthorizationKey`가 비었을 때 파생 값을 쓰는 모듈이 많으므로 운영에서는 명시 값을 환경 변수로 주입한다.
- `Entity/ModuleConfiguration.cs`의 static 필드는 이름·형식이 `ModuleConfig`와 같을 때만 실시간 반영이 자동으로 채운다. 새 옵션은 `module.json`(기본값), `ModuleConfigJson`, `ModuleConfiguration`, 설정 화면(`module-settings.*`), 사용하는 코드, 템플릿의 `module.json`을 함께 갱신한다.
- 관리 API는 `RequestOriginActionFilter`와 `IsAllowAuthorization()`을 모두 통과해야 하고 실패하면 `400`이다. 필터를 붙이는 위치(클래스 또는 메서드)는 모듈마다 다르다. 로컬 호출은 `AuthorizationKey`를 쿼리·폼·경로·헤더에서, 원격은 헤더에서만 읽는다. `AllowClientIP` 기본 `*`는 개발용이다.
- 업무 API(거래 실행 등)의 인증·권한은 transact 계약(`Authorize`, `Roles`, `AccessScreenID`)에 둔다. 새 컨트롤러를 만들어 인증 없이 데이터를 노출하지 않는다.
- 컨트롤러에서 장시간 작업은 `lock`을 오래 잡지 않고, 예외는 로그 후 일반 메시지로 응답한다(스택·경로 노출 금지).
- 모듈 간 이벤트는 `module.json`의 `EventAction`/`SubscribeAction`에 등록하고, 거래를 실행하려면 `BusinessServerUrl`로 `TransactionClient.TransactionDirect`/`ModuleApiClient`를 쓴다. 내부 호출도 요청 출처 검사와 인증 정책을 통과해야 한다.
- `IModuleRuntimeConfiguration`을 구현하면 캐시형 설정은 **새 목록 전체를 검증한 뒤 한 번에 교체**하고 실패하면 이전 설정을 유지한다.

## 2. 체크리스트

- [ ] `ModuleID` = 폴더 = 어셈블리 = `module.json` 이름, `LoadModules`에 등록(`rdy`로 정적 결합하려면 참조도)
- [ ] 설정 누락 시 시작 중단, 비밀은 환경 변수, 기본 `AllowClientIP`/키를 운영에서 좁힘
- [ ] 컨트롤러: Area/Route 규칙, 관리 API에 출처 필터 + `IsAllowAuthorization`
- [ ] 새 옵션이 `module.json`·엔티티·`ModuleConfiguration`·설정 화면·템플릿에 모두 반영
- [ ] csproj: `Library`, `wwwroot/**`·`Contracts/**`·`module.json` 복사, `Contracts/function/**` 컴파일 제외, PostBuild 배포 부작용 확인
- [ ] 검증: `dotnet build <csproj>` → 필요한 모듈만으로 `ack --modules=…` 기동 → `/checkip` → 대상 API/거래 → 설정 변경 반영(실시간/재시작) 확인
