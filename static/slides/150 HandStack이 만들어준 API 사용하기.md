---
marp: true
theme: gaia
_class: lead
footer: QCN
paginate: true
backgroundColor: #fff
---

<style>
:root {
  font-family: Pretendard;
  --border-color: #303030;
  --text-color: #0a0a0a;
  --bg-color-alt: #dadada;
  --mark-background: #ffef92;
}

h1 {
  border-bottom: none;
  font-size: 1.6em;
}

h2 {
  border-bottom: none;
  font-size: 1.3em;
}

h3 {
  font-size: 1.1em;
}

h4 {
  font-size: 1.05em;
}

h5 {
  font-size: 1em;
}

h6 {
  font-size: 0.9em;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  color: var(--text-color);
}

code:not([class*="language-"]) {
  font-family: D2Coding;
  color: #000;
  vertical-align: text-bottom;
  background-color: rgba(100, 100, 100, 0.2);
}

section {
  padding: 1rem;
  border-bottom: 1px solid #000;
  background-image: linear-gradient(to bottom right, #f7f7f7 0%, #d3d3d3 100%);
}

section > h2 {
  border-bottom: 4px solid #17344f;
}

section table {
    margin: auto;
    margin-top: 1rem;
    font-size: 28px;
}

section::after {
  font-size: 0.75em;
  content: attr(data-marpit-pagination) " / " attr(data-marpit-pagination-total);
}

img[alt~="center"] {
  display: block;
  margin: 0 auto;
}

blockquote {
  font-size: 26px;
  border-left: 8px solid var(--border-color);
  background: var(--bg-color-alt);
  margin: 0.5em;
  padding: 0.5em;
}

blockquote::before,
blockquote::after {
    content: '';
}

mark {
  background-color: var(--mark-background);
  padding: 0 2px 2px;
  border-radius: 4px;
  margin: 0 2px;
}

section.tinytext>p,
section.tinytext>ul,
section.tinytext>blockquote {
  font-size: 0.65em;
}
</style>

# HandStack API 사용하기

### `transact` 모듈로 자동화된 API 경험하기
---

## 전달하려는 주요 내용

- `transact` 모듈의 업무 계약(Contract)에 따라 클라이언트의 요청을 처리하는 방법을 알아봅니다.

- 데이터 요청을 검증하고, 중계하여 정확한 응답을 전달하도록 설정하는 과정을 실습합니다.

- HandStack이 어떻게 개발 생산성을 높이는지 직접 확인합니다.

---

## `transact` 모듈이란?

HandStack에서 비즈니스 로직의 핵심 관문 역할을 하는 모듈입니다.

<style scoped>
  li { font-size: 28px; }
</style>

- <mark>API 자동 관리</mark>
    - 업무 계약(Contract) JSON 파일을 생성하거나 변경하면, 해당 계약을 위한 HTTP POST 엔드포인트를 자동으로 생성하고 관리합니다.

- <mark>주요 기능</mark>
    - 요청 데이터 검증 (Validation)
    - 실행 허가 (Authorization)
    - 응답 정보 캐싱 (Caching)
    - 실행 상태 모니터링 (Monitoring)
    - 실행 과정 로깅 (Logging)
    - `dbclient`, `function` 등 다른 모듈로 이벤트 라우팅

---

## 거래 데이터 흐름

모든 거래 요청은 단 하나의 Endpoint로 수신합니다.

<style scoped>
  img { width: 76%; display: inline; margin-left:120px; }
</style>

![](/img/transact-architecture.png)


---

## 계약(Contract) 문서 살펴보기

`transact` 모듈은 모든 것을 이 계약 문서에 기반하여 처리합니다.

<style scoped>
  marp-pre code { font-size: 17px; }
</style>

```json
{
    "ApplicationID": "HDS",
    "ProjectID": "TST",
    "TransactionID": "TST010",
    "Services": [
        {
            "ServiceID": "LD01",
            "Authorize": false,
            "Roles": [ "Administrator", "Master" ],
            "Policys": { "ApplicationRoleID": [ "Bot" ] },
            "ReturnType": "Json",
            "CommandType": "D",
            "SequentialOptions": [...],
            "AccessScreenID": [ "TST010" ],
            "TransactionScope": false,
            "Inputs": [ { "ModelID": "Dynamic", "Type": "Row", ... } ],
            "Outputs": [ { "ModelID": "Dynamic", "Type": "Grid" } ]
        }
    ]
}
```

---

## 계약(Contract) 문서 해부하기 (1/2)

- `ApplicationID`, `ProjectID`, `TransactionID`
    - `HDS` 앱의 `TST` 프로젝트에 속한 `TST010` 거래를 의미합니다.
- ServiceID: `TST010` 거래 내에서 `LD01`이라는 서비스 ID로 요청을 식별합니다.
- Authorize: 별도의 인증 절차 없이 누구나 호출할 수 있는 공개된 서비스입니다.
- CommandType: D, F
    - D: 데이터베이스 관련 명령을 수행합니다.
    - F: 함수 관련 명령을 수행합니다.

---

## 계약(Contract) 문서 해부하기 (2/2)

- Roles: 인증 토큰에서 프로그램 역할(보안 레벨)에 해당되는 지 확인합니다.
- Policys: 인증 토큰에서 업무 정책(실행 권한)에 포함되는 지 확인합니다.
- AccessScreenID: 특정 화면 ID에서만 접근을 허용합니다.
- SequentialOptions: 여러 거래를 순차적으로 한번에 수행합니다.
- Inputs: 여러 요청을 처리하는 정보를 포함하는 배열입니다.
- Outputs: 여러 응답을 처리하는 정보를 포함하는 배열입니다.
---

## 설계 사상: 책임의 분리

`transact` 모듈은 역할과 책임(R&R)이 분리된 구조를 지향합니다.

- <mark>화면 개발</mark>
    - 계약에 정의된 API 명세에 따라 입/출력 데이터만 처리

- <mark>운영 담당</mark>
    - 계약의 실행 권한, 로깅, 모니터링 등 시스템 운영에 집중

- <mark>업무 개발</mark>
    - 계약에 연결될 실제 비즈니스 로직(DB 쿼리, Function 등) 개발에 집중

더 알아보기: [계약 중심 거래](https://handstack.kr/docs/reference/concept/계약-중심-거래#요청-거래-전문정보)

---

## 핸즈온: 계약 목록 조회하고 정보 확인하기

transact 모듈의 module.json 의 다음 보안 항목에 해당하는 클라이언트만 가능
- AuthorizationKey: 기본값 (SystemID + RunningEnvironment + HostName == HANDSTACKDHOSTNAME)
- AllowClientIP: *


```http
# `transact` 모듈이 관리하는 계약 목록 정보를 조회하는 기본 API입니다.
http://localhost:8421/transact/api/transaction/meta
```

```http
# 특정 계약 상세 정보를 조회하는 기본 API입니다.
http://localhost:8421/transact/api/transaction/retrieve?applicationID=HDS&projectID=TST&transactionID=TST010
```

---

## 핸즈온: 데이터 연동 실습

이제 직접 화면과 서버의 데이터 연동 과정을 체험해 봅시다.

- 1단계: 페이지 자바스크립트 파일에 거래(transaction) 함수 정의하기
- 2단계: HTML 요소에 `syn-datafield` 속성으로 데이터 Key 연결하기
- 3단계: 조회 버튼에 `onclick` 이벤트를 연결하여 거래 함수 호출하기
- 4단계: `beforeTransaction` Hook으로 조회 전 조건을, `afterTransaction` Hook으로 조회 후 결과를 확인하기
- 5단계: 브라우저에서 버튼을 클릭하고 개발자 도구(F12) 네트워크 탭에서 실제 통신 데이터 확인하기

---

## 결과 확인 및 장점

> 계약 파일 하나 만들었을 뿐인데,
> HandStack이 알아서 복잡한 API 엔드포인트를
> 자동으로 만들어 줬어요!
>
> 백엔드 개발 시간이 획기적으로 줄어듭니다.

- 이제 우리는 `http://localhost:8421/transact/api/transaction/execute` 주소로 `TST010` 거래를 요청할 수 있는 준비가 완료되었습니다.
