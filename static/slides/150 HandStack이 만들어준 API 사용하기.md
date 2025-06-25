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
  background-image: linear-gradient(to bottom right, #f7f7f7 0%, #d3d3d3 100%);
}

section table {
    margin: auto;
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

<!--
_class:
 - lead
-->

# HandStack API 사용하기

### `transact` 모듈로 자동화된 API 경험하기

---

## 오늘의 목표

- `transact` 모듈의 업무 계약(Contract)에 따라 클라이언트의 요청을 처리하는 방법을 알아봅니다.

- 데이터 요청을 검증하고, 중계하여 정확한 응답을 전달하도록 설정하는 과정을 실습합니다.

- HandStack이 어떻게 개발 생산성을 높이는지 직접 확인합니다.

---

## `transact` 모듈이란?

HandStack에서 비즈니스 로직의 핵심 관문 역할을 하는 모듈입니다.

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

## 계약(Contract) 문서 살펴보기

`transact` 모듈은 모든 것을 이 계약 문서에 기반하여 처리합니다.

```json
// HDS/TST/TST010.json
{
    "ApplicationID": "HDS",
    "ProjectID": "TST",
    "TransactionID": "TST010",
    "Description": "테스트 > 첫번째 테스트 거래",
    "Services": [
        {
            "ServiceID": "LD01",
            "Authorize": false,
            "ReturnType": "Json",
            "CommandType": "D",
            "TransactionScope": false,
            "Inputs": [ { "ModelID": "Dynamic", "Type": "Row", ... } ],
            "Outputs": [ { "ModelID": "Dynamic", "Type": "Grid" } ]
        }
    ],
    "Models": []
}
```

---

## 계약(Contract) 문서 해부하기

- `ApplicationID`, `ProjectID`, `TransactionID`
    - `HDS` 앱의 `TST` 프로젝트에 속한 `TST010` 거래를 의미합니다.

- `ServiceID`: `LD01`
    - `TST010` 거래 내에서 `LD01`이라는 서비스 ID로 요청을 식별합니다.

- `Authorize`: `false`
    - 별도의 인증 절차 없이 누구나 호출할 수 있는 공개된 서비스입니다.

- `CommandType`: `D`
    - 이 서비스는 데이터베이스 관련 명령을 수행합니다.

- `Inputs` & `Outputs`
    - `Input`은 단일 행(Row), `Output`은 다중 행(Grid) 형태의 동적 데이터를 처리합니다.

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

## Hands-on: 계약 추가하고 API 확인하기

이제 직접 신규 거래 계약 파일을 프로젝트에 추가하고, HandStack이 해당 계약을 정상적으로 인식했는지 확인해 보겠습니다.

1.  프로젝트의 계약 폴더에 위에서 살펴본 `HDS/TST/TST010.json` 파일을 생성합니다.
2.  HandStack 애플리케이션을 실행합니다.
3.  아래 URL을 웹 브라우저에서 열어 계약 정보가 조회되는지 확인합니다.

```
http://localhost:8421/transact/api/transaction/retrieve?applicationID=HDS&projectID=TST&transactionID=TST010&AuthorizationKey=HANDSTACKDHOSTNAME
```
- 위 URL은 `transact` 모듈이 관리하는 계약 정보를 조회하는 기본 API입니다.

---

## 결과 확인 및 장점

> 계약 파일 하나 만들었을 뿐인데,
> HandStack이 알아서 복잡한 API 엔드포인트를
> 자동으로 만들어 줬어요!
>
> 백엔드 개발 시간이 획기적으로 줄어듭니다.

- 이제 우리는 `http://localhost:8421/transact/api/transaction/execute` 주소로 `TST010` 거래를 요청할 수 있는 준비가 완료되었습니다.
