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

/* Long examples are paginated; keep reference text readable. */
section.reference-page { justify-content: flex-start; }
section.reference-page pre,
section.reference-page marp-pre,
section.reference-page pre code,
section.reference-page marp-pre code { font-size: 24px; line-height: 1.25; }
section.reference-page table { font-size: 25px; }
</style>

# HandStack 백엔드 기능 확장

Function 계약과 코드를 연결하고, 다른 실행 모듈과의 책임을 구분합니다.


<!--
발표: 첫 화면의 목표를 말한 뒤 핵심 개념과 예제로 진행합니다. 확인 질문 뒤에는 답할 시간을 주고, 마지막 완료 기준을 남겨 질문을 받습니다.
발표 구성 참고: MIT OpenCourseWare, Patrick Winston, How to Speak (2018), https://ocw.mit.edu/courses/res-tll-005-how-to-speak-january-iap-2018/pages/how-to-speak/
-->

---

## HandStack Functions 소개: 왜 쓸까?

### `Function`이란 무엇일까요?

- 특정 목적을 위해 독립적으로 실행되는 작은 코드 조각입니다.
- 작은 함수 단위로 로직을 분리하지만, 실행 서버·런타임은 직접 운영합니다.
- 복잡한 비즈니스 로직을 API 컨트롤러에서 분리하여 재사용하고 관리하기 위해 사용합니다.

> SQL만으로 표현하기 어려운 계산·외부 연동을 계약과 실행 코드로 분리합니다.

---

## HandStack Functions 소개: 왜 쓸까?

### 언제 `Function`을 사용할까요?

- 일반 API보다 더 복잡하거나 독립적인 비즈니스 로직을 처리할 때
- 순차적인 데이터 처리 파이프라인을 구성할 때
- 외부 시스템 연동(결제 API, SMS 발송 등)이 필요할 때
- 다양한 언어(C#, Node.js, Python)로 백엔드 로직을 작성하고 싶을 때

> 결제·SMS처럼 외부 상태가 바뀌는 작업은 재시도와 중복 실행 처리를 함께 설계합니다.

---

## API 컨트롤러 vs Function

### 역할과 사용 사례의 차이점

| 구분         | API 컨트롤러 (Controller)          | Function                           |
| :----------- | :--------------------------------- | :--------------------------------- |
| 주요 역할    | HTTP 요청/응답 처리                | 재사용 가능한 비즈니스 로직 캡슐화 |
| 실행 방식 | Controller 경로로 요청 | transact 또는 보호된 function 실행 API |
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

## 첫 HandStack Function 만들기 (Node.js) (1/4)

<!-- _class: reference-page -->



### 2. 구조 확인 및 로직 구현

- `featureMain.js`는 `Commands`에 정의한 `ID`(예: `GF01`)를 키로 갖는 콜백 스타일 함수를 내보냅니다.

- 첫 번째 인자 `callback(error, result)`으로 결과를 반환하는 것이 `Function`의 실행 진입점입니다.

---

## 첫 HandStack Function 만들기 (Node.js) (2/4)

<!-- _class: reference-page -->



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
```

<!-- 이어지는 코드 조각입니다. 앞뒤 페이지를 순서대로 읽으며 전체 예제의 일부임을 설명합니다. -->

---

## 첫 HandStack Function 만들기 (Node.js) (3/4)

<!-- _class: reference-page -->



```javascript
};
```

<!-- 이어지는 코드 조각입니다. 앞뒤 페이지를 순서대로 읽으며 전체 예제의 일부임을 설명합니다. -->

---

## 첫 HandStack Function 만들기 (Node.js) (4/4)

<!-- _class: reference-page -->



- 이 실습은 `transact`를 거쳐 호출합니다. function 실행 API에 대한 외부 접근은 별도 인증·네트워크 정책으로 제한합니다.

---

## Function과 API 연동하기 (1/2)

<!-- _class: reference-page -->



### `Function`을 거래로 노출하는 방법

- `Function`은 직접 URL을 갖지 않고, `transact` 거래 계약의 `CommandType`을 통해 노출됩니다.

- 클라이언트는 `transact`의 `/transact/api/transaction/execute`만 호출하고, `transact`가 `CommandType=F`인 거래를 `function` 모듈로 라우팅합니다.

Client ↔︎ transact (`CommandType=F` 라우팅) ↔︎ function

---

## Function과 API 연동하기 (2/2)

<!-- _class: reference-page -->



> `transact/module.json`의 `RoutingCommandUri`에 `"HDS|*|F|D": ".../function/api/execution"`처럼 등록되어 있어, 별도의 중계 컨트롤러 코드 없이 계약만으로 연동됩니다.

---

## Function과 API 연동하기 (1/2)

<!-- _class: reference-page -->



### 실습: 거래 계약에서 Function 호출

- 거래의 `TransactionID`는 `JSF010`, `ServiceID`는 실제 함수 ID인 `GF01`과 대조합니다. 아래는 서비스 항목 일부입니다.

```json
{
  "ServiceID": "GF01",
  "CommandType": "F",
  "ReturnType": "Json"
}
```

---

## Function과 API 연동하기 (2/2)

<!-- _class: reference-page -->



- 핸즈온: Postman으로 `POST /transact/api/transaction/execute` 요청을 보내고 `Function`의 `DataTable1` 결과가 반환되는지 확인합니다.

---

## 잠깐, 구분해 보기

함수가 응답하기 전에 외부 시스템이 바뀌었다면 거래 실패로 되돌릴 수 있을까요?

<!--
질문 후 잠시 기다립니다. 답이 없으면 앞에서 본 예제를 다시 가리킵니다.
확인할 답: 외부 부작용은 별도입니다. 실패·재시도·중복 실행 처리와 보상 방법을 설계합니다.
다음 주제로 넘어가기 전에 차이를 청중의 표현으로 한 번 확인합니다.
-->

---

## 연습: Function으로 간단한 로직 구현 (1/2)

<!-- _class: reference-page -->



### 1. `PriceChecker` Function 계약 만들기

- 상품 가격을 받아 특정 금액 이상이면 메시지를 로깅하는 `Function`을 만듭니다.

- Step 1: 계약 폴더 생성

```txt
Contracts/function/HDS/TST/PriceChecker/featureMeta.json
Contracts/function/HDS/TST/PriceChecker/featureMain.js
```

- Step 2: 로직 구현 (`featureMain.js`)

---

## 연습: Function으로 간단한 로직 구현 (2/2)

<!-- _class: reference-page -->



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

## 연습: Function으로 간단한 로직 구현 (1/2)

<!-- _class: reference-page -->



### 2. 상품 생성 거래에 연동하기

- `PriceChecker`의 transact 계약을 먼저 작성합니다: `TransactionID=PriceChecker`, `ServiceID=GF01`, `CommandType=F`.

- dbclient XML의 `<statement before="...">`에 호출할 거래를 지정합니다. transact 서비스 JSON의 `BeforeTransaction` 필드가 아닙니다.

```xml
<!-- 기존 상품 저장 statement에 추가할 속성 예시 -->
<statement id="ID01" seq="0" before="HDS|TST|PriceChecker|GF01">
  <!-- 기존 param과 상품 INSERT SQL -->
</statement>
```

---

## 연습: Function으로 간단한 로직 구현 (2/2)

<!-- _class: reference-page -->



- 먼저 단독 호출을 확인한 뒤 저장 전에 연동합니다. `Price` 전달, 1000원 경계값, 호출 실패 시 저장 중단 여부를 로그와 후속 조회로 확인합니다.

- 전·후 거래 호출은 외부 부작용까지 원자적으로 롤백한다는 뜻이 아닙니다.

---

## Function 연동의 완료 기준

- featureMeta.json과 featureMain.js/cs/py의 진입점을 맞춥니다.
- CommandType=F, 서비스 ID와 실제 함수 ID를 대조합니다.
- 전후 거래와 결과 테이블, 오류·재시도 동작을 검증합니다.

<!--
질문을 받는 동안 이 확인 기준을 화면에 남깁니다. 청중이 자신의 업무에 적용할 다음 행동 하나를 고르게 합니다.
-->
