# 거래 계약(.txn) 점검

항목·구문·서버 동작의 대표 문서는 사이트의 `reference/거래-계약-명세`(https://handstack.kr/docs/reference/거래-계약-명세)다. 이 문서는 작성·수정할 때의 점검 순서와 함정만 둔다. 값이나 필드 이름이 필요하면 대표 문서를 읽고, 문서와 소스가 다르면 서버 모듈 소스(`TransactionController`, `TransactionMapper`)를 확인한다.

## 목차
1. 작성·수정 순서
2. 함정
3. 변경 체크리스트

## 1. 작성·수정 순서

1. 같은 프로젝트 폴더의 비슷한 `.txn`(또는 `.json`) 한 개와 호출 화면을 먼저 읽는다. 확장자는 프로젝트마다 다르다(`reference/식별자와-파일-경로`의 "계약 확장자"). 기존 파일의 확장자를 일괄 바꾸지 않는다.
2. 화면 `transaction` 키 = `ServiceID` = 실행 계약의 id(대소문자 포함)로 연결표를 만든다.
3. `Inputs`/`Outputs`가 비어 있는지 채워져 있는지 확인한다. 비어 있으면 화면 선언이 계약이고, 채워져 있으면 서버가 개수를 검증한다.
4. 접근 제어(`Authorize`, `AccessScreenID`, `Roles`)를 호출 화면 목록과 맞춘다.
5. 결과 집합 순서와 개수를 화면 `outputs`와 맞춘다.
6. 저장·삭제 서비스는 `TransactionScope`를 확인한다.

## 2. 함정

- 값이 이미 채워진 기존 계약을 그대로 둔다. 빈 `Inputs`/`Outputs`를 미구현으로 보고 일괄로 채우지 않는다.
- `AccessScreenID`를 생략하면 자기 `TransactionID`와 같은 화면만 호출할 수 있다. 팝업·코드도움·셸 화면이 호출하면 `요청 가능화면 거래 매핑 정보 확인 필요`가 난다. 개발 설정의 `PublicTransactions: *`는 이 검사를 사실상 열어 두므로 운영에 가져가지 않는다.
- **권한 판정**은 소스상 `Roles`·`Policys`·`TransactionTokens`가 OR로 결합되고 미지정 항목은 통과 상태로 시작한다. `Roles`만 지정한 서비스는 역할이 맞지 않아도 거부되지 않는 것으로 읽힌다. 역할 제한에 의존하기 전에 권한 없는 계정으로 실제 거부되는지 테스트한다.
- 클라이언트 옵션(`authorize`, `commandType` 등)은 계약을 대체하지 않는다. 서버 `IsAllowDynamicRequest`가 `true`이면 공개 거래에서 계약 없는 서비스가 합성될 수 있으므로 운영에서는 `false`로 둔다.
- `BearerFields`는 현재 컨트롤러가 참조하지 않는다. 토큰 변수는 `Variable`이 `$이름`으로 주입한다.
- `IgnoreResult: true`인 입력의 statement를 `NonQuery`로 바꾸지 않는다(후속 `BaseFieldMappings`가 마지막 행을 쓴다).
- **화면 `outputs` 개수 = 계약 `Outputs` 개수 − `DisposeResult: true` 항목 수**다. `BaseFieldRelation`을 추가하거나 `Exception`처럼 보조 출력을 넣으면 뒤의 인덱스가 모두 바뀐다.
- 순차 거래(`S`)와 워크플로(`W`)는 전체가 한 DB 트랜잭션으로 롤백된다고 가정하지 않는다. 워크플로는 `handstack-workflow-contracts`를 쓴다.
- `Maskings`는 서버 `IsDataMasking`이 켜져 있을 때만 동작한다. `ValidateRules`가 거짓이면 거래가 실패하므로 조건식의 데이터맵 ID(`[GridData0]`)가 실제 출력 순서와 맞는지 확인한다.
- `handstack contractpack`은 파일 **이름을 바꾸는** 명령이다. 백업은 `--options true`를 줬을 때만 만들어지므로 실행 전에 대상과 백업 여부를 확인한다.

## 3. 변경 체크리스트

- [ ] 화면 `transaction` 키 = `ServiceID` = 실행 계약의 id (대소문자 포함)
- [ ] `ServiceID` 중복 없음, JSONC 파싱 성공
- [ ] 저장/삭제 서비스 `TransactionScope: true`
- [ ] 접근 제어가 호출 화면 목록과 일치하고, `PublicTransactions`가 개발 설정 그대로가 아님
- [ ] 명시 `Inputs/Outputs`가 있으면 화면 선언 개수와 일치, 결과 집합 순서 확인
- [ ] 역할 제한이 있으면 권한 없는 계정으로 거부 테스트
- [ ] 계약 캐시 갱신 방식(재시작/refresh/감시) 확인 — 갱신은 대상 환경과 요청 범위 안에서만
