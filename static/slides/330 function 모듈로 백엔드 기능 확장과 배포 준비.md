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

# HandStack 백엔드 기능 확장

### function 모듈로 백엔드 기능 확장과 배포 준비

---

## HandStack Functions 소개: 왜 쓸까?

### `Function`이란 무엇일까요?

- 특정 목적을 위해 독립적으로 실행되는 작은 코드 조각입니다.
- 서버리스(Serverless) 함수와 유사한 개념을 가집니다.
- 복잡한 비즈니스 로직을 API 컨트롤러에서 분리하여 재사용하고 관리하기 위해 사용합니다.

> `Function`은 마치 여러분의 개인 비서 같아요. '이런 일이 있는데 좀 해줄래?' 하고 시키면, 그 비서가 딱 그 일만 처리해서 결과를 돌려주는 거죠.

---

## HandStack Functions 소개: 왜 쓸까?

### 언제 `Function`을 사용할까요?

- 일반 API보다 더 복잡하거나 독립적인 비즈니스 로직을 처리할 때
- 순차적인 데이터 처리 파이프라인을 구성할 때
- 외부 시스템 연동(결제 API, SMS 발송 등)이 필요할 때
- 다양한 언어(C#, Node.js, Python)로 백엔드 로직을 작성하고 싶을 때

> HandStack Functions는 여러분의 백엔드를 마치 레고처럼 조립할 수 있게 해줘요. 필요한 기능만 따로 만들어서 붙일 수 있죠!

---

## API 컨트롤러 vs Function

### 역할과 사용 사례의 차이점

| 구분         | API 컨트롤러 (Controller)          | Function                           |
| :----------- | :--------------------------------- | :--------------------------------- |
| 주요 역할    | HTTP 요청/응답 처리                | 재사용 가능한 비즈니스 로직 캡슐화 |
| 실행 방식    | 외부 HTTP 요청에 의해 직접 실행    | 내부 호출 (다른 컨트롤러, Function) |
| 주요 관심사  | 엔드포인트 라우팅, 데이터 검증     | 특정 작업 수행, 로직의 모듈화      |
| 예시         | `/api/users` 엔드포인트 정의       | 사용자 등급 계산 로직              |

---

## 백엔드 확장 모듈 선택 기준

`function`은 범용 비즈니스 로직을 작성할 때 사용합니다. 하지만 모든 백엔드 확장을 `function`으로 만들 필요는 없습니다.

| 필요 기능 | 권장 모듈 |
|---|---|
| C#, Node.js, Python 로직 실행 | `function` |
| 서버 CLI나 Web URL 호출 | `command` |
| Neo4j, Memgraph Cypher 실행 | `graphclient` |
| LLM 프롬프트 실행과 도구 호출 | `prompter` |

> 구현 언어보다 실행 책임을 먼저 보고 모듈을 선택합니다.

---

## 첫 HandStack Function 만들기 (Node.js)

### 1. Function 계약 만들기

- `Function`은 CLI로 자동 생성되지 않고, `featureMeta.json`과 `featureMain.js`를 계약 폴더에 직접 둡니다.
- 계약 경로는 `Contracts/function/{ApplicationID}/{ProjectID}/{TransactionID}/` 형식입니다.

```txt
Contracts/function/HDS/TST/JSF010/
├─ featureMeta.json   (Header, Commands 메타 정의)
└─ featureMain.js     (실제 실행 코드)
```

---

## 첫 HandStack Function 만들기 (Node.js)

### 2. 구조 확인 및 로직 구현

- `featureMain.js`는 `Commands`에 정의한 `ID`(예: `GF01`)를 키로 갖는 콜백 스타일 함수를 내보냅니다.
- 첫 번째 인자 `callback(error, result)`으로 결과를 반환하는 것이 `Function`의 실행 진입점입니다.

```javascript
// Contracts/function/HDS/TST/JSF010/featureMain.js
module.exports = {
    GF01: (callback, moduleID, parameters, dataContext) => {
        // parameters: featureMeta.json Commands.Params로 전달된 값
        var serverName = $array.getValue(parameters, 'ServerName');

        var result = {
            DataTable1: [
                { FunctionResult: `Hello from Node.js Function! serverName: ${serverName}` }
            ]
        };

        callback(null, result);
    }
};
```
- `Function`은 그 자체로는 외부에 노출되지 않으며, `transact`의 라우팅을 거쳐 실행됩니다.

---

## Function과 API 연동하기

### `Function`을 거래로 노출하는 방법

- `Function`은 직접 URL을 갖지 않고, `transact` 거래 계약의 `CommandType`을 통해 노출됩니다.
- 클라이언트는 `transact`의 `/transact/api/transaction/execute`만 호출하고, `transact`가 `CommandType=F`인 거래를 `function` 모듈로 라우팅합니다.

Client ↔︎ transact (`CommandType=F` 라우팅) ↔︎ function

> `transact/module.json`의 `RoutingCommandUri`에 `"HDS|*|F|D": ".../function/api/execution"`처럼 등록되어 있어, 별도의 중계 컨트롤러 코드 없이 계약만으로 연동됩니다.

---

## Function과 API 연동하기

### 실습: 거래 계약에서 Function 호출

- `transact` 거래 계약에서 `CommandType`을 `F`로 지정하고 `ServiceID`에 `Function`의 `TransactionID`를 연결합니다.

```json
{
  "ServiceID": "JSF010",
  "CommandType": "F",
  "ReturnType": "Json"
}
```

- 핸즈온: Postman으로 `POST /transact/api/transaction/execute` 요청을 보내고 `Function`의 `DataTable1` 결과가 반환되는지 확인합니다.

---

## 연습: Function으로 간단한 로직 구현

### 1. `PriceChecker` Function 계약 만들기

- 상품 가격을 받아 특정 금액 이상이면 메시지를 로깅하는 `Function`을 만듭니다.

- Step 1: 계약 폴더 생성
  ```txt
  Contracts/function/HDS/TST/PriceChecker/featureMeta.json
  Contracts/function/HDS/TST/PriceChecker/featureMain.js
  ```

- Step 2: 로직 구현 (`featureMain.js`)
  ```javascript
  module.exports = {
    GF01: (callback, moduleID, parameters, dataContext) => {
      var price = Number($array.getValue(parameters, 'Price')) || 0;
      if (price >= 1000) {
        console.log(`[PriceChecker] 고가 상품 감지: ${price}원`);
      }

      callback(null, { DataTable1: [{ IsExpensive: price >= 1000 }] });
    }
  };
  ```

---

## 연습: Function으로 간단한 로직 구현

### 2. 상품 생성 거래에 연동하기

- 상품을 저장하는 `dbclient` 거래 계약의 `BeforeTransaction`에 `PriceChecker` `Function`의 `TransactionID`를 지정하면, 저장 전에 자동으로 가격 검사가 실행됩니다.

```json
{
  "ServiceID": "PRD010",
  "CommandType": "D",
  "BeforeTransaction": "HDS|TST|PriceChecker|GF01",
  "ReturnType": "Json"
}
```
- 핸즈온: 가격이 1000원 이상인 상품을 생성 요청 시, `function` 모듈 로그에 감지 메시지가 남는지 확인합니다.

---

## 정리

- `Function`은 재사용 가능한 독립적인 비즈니스 로직 단위입니다.
- CLI 실행은 `command`, 그래프 쿼리는 `graphclient`, LLM 프롬프트는 `prompter`로 분리할 수 있습니다.
- `Function`은 `featureMeta.json` + `featureMain.js/cs/py` 계약으로 구성하고, `transact`의 `CommandType=F` 라우팅으로 연동합니다.
- `BeforeTransaction`/`AfterTransaction` 설정으로 다른 거래 앞뒤에 `Function`을 연쇄 호출할 수 있습니다.
- 이를 통해 API는 '요청/응답 처리'에, `Function`은 '핵심 로직 처리'에 집중하여 코드를 더 깔끔하게 구성할 수 있습니다.

> 이제 API의 핵심 로직을 `Function`으로 분리하고, `transact` 계약이 그 `Function`을 라우팅하는 형태로 만들 수 있게 되었어요. 이렇게 하면 코드가 더 깔끔하고 관리하기 쉬워집니다.

---

# Q & A
