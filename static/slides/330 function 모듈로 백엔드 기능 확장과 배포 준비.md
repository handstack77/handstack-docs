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

## 첫 HandStack Function 만들기 (Node.js)

### 1. Function 생성하기

- HandStack CLI를 사용하여 Node.js 기반의 `Function`을 간단하게 생성할 수 있습니다.
- 국세청 사업자등록정보 진위확인 및 상태조회 API 목록을 조회합니다.

```url
https://infuser.odcloud.kr/api/stages/28493/api-docs
```

---

## 첫 HandStack Function 만들기 (Node.js)

### 2. 구조 확인 및 로직 구현

- 생성된 `MyNodeUtil.js` 파일에는 `execute` 메서드가 있습니다.
- 이 `execute` 메서드가 `Function`의 실제 코드가 실행되는 진입점입니다.

```javascript
// server/src/functions/MyNodeUtil.js
module.exports = {
  execute: async (payload, context) => {
    // payload: Function 호출 시 전달된 데이터
    // context: 실행 컨텍스트 정보 (로그 등)
    
    console.log('MyNodeUtil Function 실행됨');
    
    return {
      message: "Hello from Node.js Function!",
      input: payload
    };
  }
};
```
- 지금은 외부에서 직접 호출할 수 없으며, 내부 호출만 가능합니다.

---

## Function과 API 연동하기

### `Function`을 API로 노출하는 방법

- `Function`은 그 자체로 외부에서 접근할 수 없습니다.
- 외부와 통신하려면 API 컨트롤러가 '창구' 역할을 해야 합니다.
- API 컨트롤러가 요청을 받아 내부적으로 `Function`을 호출하고, 그 결과를 클라이언트에게 응답하는 구조입니다.

Client ↔︎ API Controller ↔︎ Function

> HandStack은 API와 `Function`을 매끄럽게 연동할 수 있도록 설계되어, 복잡한 비즈니스 로직을 모듈화하고 재사용하기 용이합니다.

---

## Function과 API 연동하기

### 실습: API 컨트롤러에서 Function 호출

- 기존 API 컨트롤러에 새로운 엔드포인트를 추가합니다.
- `context.function.execute`를 사용해 `MyNodeUtil` Function을 호출합니다.

```csharp
// C# API 컨트롤러 예시
[HttpPost("call-function")]
public async Task<object> CallNodeFunction([FromBody] JsonObject payload)
{
    // "MyNodeUtil" Function을 payload와 함께 실행
    var result = await context.function.execute("MyNodeUtil", payload);
    return result;
}
```

- 핸즈온: Postman으로 `POST /api/[컨트롤러명]/call-function` 요청을 보내고 `Function`의 결과가 반환되는지 확인합니다.

---

## 연습: Function으로 간단한 로직 구현

### 1. `PriceChecker` Function 생성 및 구현

- 상품 가격을 받아 특정 금액 이상이면 메시지를 로깅하는 `Function`을 만듭니다.

- Step 1: `Function` 생성
  ```bash
  handstack generate function PriceChecker
  ```

- Step 2: 로직 구현 (`PriceChecker.js`)
  ```javascript
  module.exports = {
    execute: async (payload, context) => {
      const price = payload.price || 0;
      if (price >= 1000) {
        context.log.info(`[PriceChecker] 고가 상품 감지: ${price}원`);
        return { isExpensive: true };
      }
      return { isExpensive: false };
    }
  };
  ```

---

## 연습: Function으로 간단한 로직 구현

### 2. 상품 생성 API에 연동하기

- 상품 정보가 저장될 때, `PriceChecker` `Function`을 호출하여 가격을 검사하도록 `POST /api/products` API를 수정합니다.

```csharp
// ProductsController.cs 의사 코드
[HttpPost]
public async Task<object> CreateProduct([FromBody] Product product)
{
    // 1. PriceChecker Function 호출하여 가격 검사
    var checkPayload = new JsonObject { ["price"] = product.Price };
    await context.function.execute("PriceChecker", checkPayload);
    
    // 2. 기존 상품 저장 로직 실행
    // ... repository.execute("saveProduct", product) ...
    
    return new { message = "상품이 생성되었습니다." };
}
```
- 핸즈온: 가격이 1000원 이상인 상품을 생성 요청 시, 서버 콘솔에 로깅 메시지가 출력되는지 확인합니다.

---

## 정리

- `Function`은 재사용 가능한 독립적인 비즈니스 로직 단위입니다.
- `handstack generate function` CLI 명령어로 `Function`을 쉽게 생성할 수 있습니다.
- API 컨트롤러에서 `context.function.execute`로 `Function`을 호출하여 연동합니다.
- 이를 통해 API는 '요청/응답 처리'에, `Function`은 '핵심 로직 처리'에 집중하여 코드를 더 깔끔하게 구성할 수 있습니다.

> 이제 API의 핵심 로직을 `Function`으로 분리하고, API가 그 `Function`을 호출하는 형태로 만들 수 있게 되었어요. 이렇게 하면 코드가 더 깔끔하고 관리하기 쉬워집니다.

---

# Q & A
