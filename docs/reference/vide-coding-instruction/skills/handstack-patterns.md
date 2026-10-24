# handstack-patterns

HandStack 아키텍처 및 개발 패턴

> 파일 위치·식별자·계약 확장자의 기준은 [식별자와 파일 경로](/docs/reference/식별자와-파일-경로)입니다. 아래 경로는 기본 배포본 예제(`BOD010`) 배치입니다.

HandStack 업무 화면은 화면(View), 거래 계약(`transact`), SQL 계약(`dbclient`)이 **이름으로** 연결된 구조입니다. 컴파일러가 연결을 검사해 주지 않으므로 한 곳을 고칠 때 나머지 이름을 함께 확인해야 합니다.

## 아키텍처 개요

### 1. View (프론트엔드)

- **위치:** `contracts/wwwroot/{AppID}/{ProjectID}/{TransactionID}.html`과 `.js`
- **기술:** HTML, JavaScript(ES6+), `syn` 라이브러리
- **구조:**
  - HTML: `syn_grid`, `syn_datepicker` 같은 컨트롤 태그와 `syn-datafield`, `syn-options`, `syn-events` 속성으로 UI를 구성합니다.
  - JS: 파일 이름과 같은 전역 객체 `$BOD010`에 `transaction`, `hook`, `event`, `method` 등을 정의합니다.

### 2. 거래 계약 (transact)

- **위치:** `contracts/transact/{AppID}/{ProjectID}/{TransactionID}.json`(IDE 프로젝트는 `.txn`)
- **역할:** 화면이 호출하는 서비스(`ServiceID`)의 실행 모듈(`CommandType`), 입출력 형태, 접근 제어를 선언합니다. 항목은 [거래 계약 명세](/docs/reference/거래-계약-명세)를 보세요.

### 3. SQL 계약 (dbclient)

- **위치:** `contracts/dbclient/{AppID}/{ProjectID}/{TransactionID}.xml`(IDE 프로젝트는 `.dbc`)
- **기술:** XML과 SQL. SQL은 `header`의 `datasource`가 가리키는 데이터 원본의 DBMS 문법을 따릅니다.
- **구조:** `<statement id seq>`에 SQL을 두고 `<param>`으로 입력 파라미터를 선언합니다. `<if test>` 같은 동적 구문을 쓸 수 있습니다.

실제 코드는 [HANDSTACK.md](/docs/reference/vide-coding-instruction/examples/HANDSTACK)의 `BOD010` 발췌를 보세요.

## 데이터 흐름

1. **View**: `syn.$w.transactionAction('LD01')`을 호출합니다.
2. **View 로더**: 화면 `transaction.LD01`의 `inputs`에 해당하는 컨트롤 값(`belongID`에 `LD01`이 있는 컨트롤)을 모아 `transact`로 보냅니다.
3. **transact**: 거래 계약에서 `ServiceID: "LD01"`을 찾아 접근 제어를 검사하고 `CommandType`에 따라 실행 모듈로 라우팅합니다.
4. **dbclient**: SQL 계약에서 `id="LD01"`인 statement를 실행합니다.
5. **View**: 결과 집합을 `outputs` 순서대로 컨트롤에 바인딩하고 `hook.afterTransaction`을 호출합니다.

## 개발 시 주의사항

- **ID 일치**: JS 파일 이름, 객체 이름(`$ID`), 거래 계약과 SQL 계약의 파일 이름이 같아야 합니다. 거래 이름(`transaction` 키)은 거래 계약의 `ServiceID`, SQL 계약의 `statement id`와 같아야 합니다. 화면 `transaction`의 `functionID` 옵션을 쓰면 키와 서비스 ID가 달라질 수 있으니 이웃 화면의 방식을 따르세요.
- **입출력 개수**: 화면 `outputs` 개수는 서버가 돌려주는 결과 집합 수와 같아야 합니다([거래 오류 메시지](/docs/reference/거래-오류-메시지)).
- **SQL 문법**: 데이터 원본의 DBMS 문법을 따르며, 조건에 따라 달라지는 구문은 `<if test>`로 처리합니다. 값은 `@Param` 바인딩으로만 받습니다.
