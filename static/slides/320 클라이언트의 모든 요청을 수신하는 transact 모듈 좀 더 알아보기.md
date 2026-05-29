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

# HandStack transact 모듈
### 클라이언트와 서버의 통신 마스터하기

---

## transact 모듈이란?

클라이언트의 모든 거래 요청을 수신하는 관문입니다.

- 데이터베이스 조회/수정
- 그래프 데이터 조회
- 서버리스 함수 호출
- CLI 명령과 Web URL 호출
- LLM 프롬프트 실행
- 외부 API 연동

`transact` 모듈은 이 모든 요청을 처리하고, 약속된 형식으로 결과를 반환하는 핵심적인 역할을 수행합니다.

---

## transact 라우팅 대상 모듈

`transact`는 거래 계약의 `CommandType` 값을 보고 실행 모듈을 선택합니다.

| CommandType | 대상 모듈 | 역할 |
|---|---|---|
| `D` | `dbclient` | SQL 실행 |
| `G` | `graphclient` | Cypher 실행 |
| `F` | `function` | C#, Node.js, Python 함수 실행 |
| `C` | `command` | CLI 프로세스와 Web URL 실행 |
| `P` | `prompter` | LLM 프롬프트 계약 실행 |

> 외부 시스템 연동도 기능 성격에 따라 `function`, `command`, `prompter` 중 적절한 모듈로 분리합니다.

---

## 1. API 요청/응답 데이터 형식 이해하기

- 목표: 백엔드 API와 프론트엔드 UI가 데이터를 주고받는 기본 규칙을 이해합니다.
- 핵심 키워드: 단일 건(Row), 여러 건(List), 폼(Form), 그리드(Grid)

---

### 데이터 형식: Row vs List

- 단일 건 (Row) 응답
  - `GET /api/products/1`
  - 특정 객체 하나를 요청하며, JSON 객체 `{}`로 응답합니다.
  - 프론트엔드의 <mark>상세 페이지</mark>나 <mark>수정 폼</mark>에 사용됩니다.
  - 예시: `{ "id": 1, "name": "노트북", "price": 1500000 }`

- 여러 건 (List) 응답
  - `GET /api/products`
  - 객체 목록을 요청하며, JSON 배열 `[]`로 응답합니다.
  - 프론트엔드의 <mark>목록 페이지</mark>나 <mark>데이터 그리드</mark>에 사용됩니다.
  - 예시: `[ { "id": 1, ... }, { "id": 2, ... } ]`

---

### UI 매핑: Form 과 Grid

- Form 데이터 (입력)
  - 클라이언트에서 서버로 데이터를 보낼 때 사용합니다. (`POST`, `PUT`)
  - 보통 JSON 객체 `{}` 형태로 서버에 전송됩니다.

- Grid 데이터 (출력)
  - 서버에서 받은 배열 `[]` 형태의 데이터를 표(테이블/그리드) 형태로 표시합니다.

> HandStack은 이러한 표준 RESTful 형식을 기본으로 지원하여, 백엔드와 프론트엔드의 협업을 매우 효율적으로 만듭니다.

---

### 핸즈온: 데이터 구조 확인하기

- Postman 또는 Thunder Client를 사용해 API에 요청을 보내봅니다.
  - `GET /api/products/1` 요청을 보내 단일 건 `{}` 응답 확인
  - `GET /api/products` 요청을 보내 여러 건 `[]` 응답 확인

- 클라이언트 코드에서 데이터가 어떻게 사용되는지 확인합니다.
  - 단일 건 데이터는 각 입력 필드에 직접 바인딩
  - 여러 건 데이터는 `v-for` 와 같은 반복문으로 그리드/리스트 생성

---

## 2. API 유효성 검사 (Server-side Validation)

- 목표: 잘못된 데이터가 시스템에 저장되는 것을 방지하기 위해 서버에서 데이터를 검증하는 방법을 배웁니다.

> 💡 API 유효성 검사는 마치 물건을 배송하기 전에 내용물을 검사하는 것과 같아요. 깨지거나 잘못된 물건을 보내지 않기 위함이죠. DB에 저장하기 전에 데이터를 한 번 더 확인하는 과정입니다.

---

### 유효성 검사, 왜 서버에서 해야 할까요?

- 클라이언트(브라우저) 검증은 쉽게 우회될 수 있습니다.
- 악의적인 사용자가 조작된 데이터를 직접 API로 전송할 수 있습니다.
- 클라이언트 코드의 버그로 인해 잘못된 데이터가 전송될 수 있습니다.

- HandStack의 유효성 검사
  - Node.js: `class-validator`와 같은 라이브러리 사용
  - ASP.NET Core: `DataAnnotations` 애트리뷰트 사용

---

### 핸즈온: 유효성 규칙 추가 및 테스트

1. 모델(DTO)에 유효성 검사 규칙을 추가합니다.
    - 예시: `Product` 모델의 `name` 필드는 비어있을 수 없고(`@IsNotEmpty()`), `price` 필드는 양수여야 합니다.

2. Postman으로 유효하지 않은 데이터를 전송해봅니다.
    - `name` 필드를 비워서 `POST` 요청
    - `price`에 음수 값을 넣어서 `PUT` 요청

3. 서버의 응답을 확인합니다.
    - `400 Bad Request` 상태 코드와 함께 어떤 규칙을 위반했는지에 대한 에러 메시지가 반환되는 것을 확인합니다.

---

## 3. API 에러 처리와 응답 (HTTP Status Codes)

- 목표: API 호출 시 발생 가능한 다양한 에러 상황을 처리하고, 약속된 HTTP 상태 코드로 응답하는 방법을 배웁니다.

> 💡 API는 마치 통역사와 같아요. 올바른 메시지뿐만 아니라, 문제가 생겼을 때 '나 이런 문제가 생겼어!'라고 올바르게 알려주는 것도 중요하죠. HTTP 상태 코드가 바로 그 에러 메시지의 종류를 나타냅니다.

---

### 주요 HTTP 상태 코드

- `2xx` (성공)
  - `200 OK`: 요청 성공 (조회)
  - `201 Created`: 리소스 생성 성공 (생성)
  - `204 No Content`: 성공했으나 반환할 내용 없음 (삭제)

- `4xx` (클라이언트 오류)
  - `400 Bad Request`: 잘못된 요청 (예: 유효성 검사 실패)
  - `401 Unauthorized`: 인증 필요
  - `403 Forbidden`: 권한 없음
  - `404 Not Found`: 요청한 리소스 없음

- `5xx` (서버 오류)
  - `500 Internal Server Error`: 서버 내부에서 예측하지 못한 오류 발생

---

### 핸즈온: 에러 상황별 응답 확인

- Postman으로 다양한 에러 상황을 시뮬레이션 해봅니다.

  - `404 Not Found` 확인
    - `GET /api/products/9999` (존재하지 않는 ID) 요청

  - `400 Bad Request` 확인
    - 이전 단계에서 실습한 유효성 검사 실패 요청 재현

  - `500 Internal Server Error` 확인
    - 백엔드 코드에 의도적으로 에러 유발 코드(예: 정의되지 않은 변수 접근) 삽입 후 API 호출

---

## 4. 쿼리 파라미터 활용하기

- 목표: URL의 쿼리 파라미터를 사용하여 데이터를 필터링하고 검색하는 기능을 구현합니다.
- HandStack 키워드: `BaseFieldMappings`, `Pretreatment`, `$Variable`

---

### 쿼리 파라미터란?

URL 주소 뒤에 `?`를 붙여 `key=value` 형태로 데이터를 전달하는 방법입니다.
주로 데이터 목록을 조회(`GET`)할 때 정렬, 필터링, 페이징 등의 조건을 전달하는 데 사용됩니다.

- 예시: `GET /api/products?category=electronics&minPrice=100`
  - `category`가 `electronics` 이고
  - `minPrice`가 `100` 이상인 상품을 조회

HandStack은 쿼리 파라미터를 SQL 조건으로 자동 매핑하는 강력한 기능을 제공합니다.

---

### 핸즈온: 검색 기능 구현하기

1. 백엔드에서 쿼리 파라미터를 처리하는 로직을 추가합니다.
   - HandStack 설정 파일에서 `BaseFieldMappings` 등을 사용하여 URL의 `name` 파라미터를 SQL의 `WHERE name LIKE ...` 조건과 연결합니다.

2. Postman으로 쿼리 파라미터를 포함한 요청을 보냅니다.
   - `GET /api/products?name=노트북`
   - `GET /api/products?category=가전`

3. 응답 결과가 쿼리 파라미터 조건에 맞게 필터링되는지 확인합니다.

> HandStack을 사용하면 복잡한 SQL 쿼리를 직접 작성할 필요 없이, 간단한 설정만으로 강력한 검색 기능을 쉽게 구현할 수 있습니다.

---

<!-- _class: lead -->
## 정리

- transact 모듈은 클라이언트와 서버 통신의 핵심입니다.
- `CommandType`으로 `dbclient`, `graphclient`, `function`, `command`, `prompter` 실행을 라우팅합니다.
- Row/List, Form/Grid는 데이터와 UI의 기본 약속입니다.
- 서버 측 유효성 검사는 시스템 안정성의 필수 요소입니다.
- HTTP 상태 코드는 API의 상태를 알려주는 중요한 신호입니다.
- 쿼리 파라미터와 HandStack 설정을 통해 강력한 검색 기능을 쉽게 구현할 수 있습니다.

