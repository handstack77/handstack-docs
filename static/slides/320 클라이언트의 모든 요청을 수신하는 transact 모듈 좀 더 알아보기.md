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
section.reference-page img { max-height: 440px; max-width: 100%; object-fit: contain; }
</style>

# HandStack transact 모듈
transact의 실행 모듈 선택과 입출력 규칙을 일반 REST 개념과 구분합니다.


<!--
발표: 첫 화면의 목표를 말한 뒤 핵심 개념과 예제로 진행합니다. 확인 질문 뒤에는 답할 시간을 주고, 마지막 완료 기준을 남겨 질문을 받습니다.
발표 구성 참고: MIT OpenCourseWare, Patrick Winston, How to Speak (2018), https://ocw.mit.edu/courses/res-tll-005-how-to-speak-january-iap-2018/pages/how-to-speak/
-->

---

## transact 모듈이란? (1/2)

<!-- _class: reference-page -->



클라이언트의 모든 거래 요청을 수신하는 관문입니다.

- 데이터베이스 조회/수정

- 그래프 데이터 조회

- 서버리스 함수 호출

- CLI 명령과 Web URL 호출

- LLM 프롬프트 실행

- 외부 API 연동

---

## transact 모듈이란? (2/2)

<!-- _class: reference-page -->



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

### 데이터 형식: Row·List는 거래의 입력

- `Row`: 검색 조건이나 입력 폼처럼 한 건의 값을 보냅니다.
- `List`: 여러 행을 묶어 보냅니다.
- 출력은 `Form`(한 건), `Grid`(목록) 등으로 지정합니다.

**비교: 일반 REST API**
`GET /api/products/1` → 객체, `GET /api/products` → 배열은 별도 Controller를 만든 경우의 예입니다. transact 계약을 등록한다고 이 URL이 생기지는 않습니다.

---

### UI 매핑: 입력과 출력을 나눠 읽기

| 방향 | 거래 설정 | 화면에서 확인할 것 |
|---|---|---|
| 입력 | `Row` / `List` | 보낼 폼·목록의 필드와 데이터 타입 |
| 출력 | `Form` / `Grid` | 결과를 받을 폼·그리드와 반환 컬럼 |

화면 `transaction`의 매핑과 서버 계약의 `Inputs`·`Outputs`를 함께 대조합니다.

[HandStack 거래 호출 레퍼런스](/docs/reference/거래-호출)

---

### 핸즈온: 요청과 결과 한 쌍 비교하기

1. 실습 화면에서 조회하고 Network의 거래 요청을 캡처합니다.
2. Postman 또는 Thunder Client로 같은 `POST /transact/api/transaction/execute` 요청을 재현합니다.
3. 한 건 출력은 폼 필드, 목록 출력은 그리드에 연결되는지 확인합니다.

일반 REST/Vue 예제에서는 객체를 입력 필드에, 배열을 `v-for`에 연결할 수 있습니다. 이는 HandStack의 기본 화면 문법과는 별도입니다.

---

## 잠깐, 구분해 보기

Row|Grid에서 Row와 Grid는 각각 어느 방향의 데이터일까요?

<!--
질문 후 잠시 기다립니다. 답이 없으면 앞에서 본 예제를 다시 가리킵니다.
확인할 답: Row는 요청 입력 한 건, Grid는 응답 출력 목록을 뜻합니다. 서버 계약과 화면 매핑을 함께 읽습니다.
다음 주제로 넘어가기 전에 차이를 청중의 표현으로 한 번 확인합니다.
-->

---

## 2. 저장 전에 서버에서 검증하기

브라우저 검증은 입력을 돕고, 서버 검증은 조작된 요청을 막습니다.

- 계약: 필드·타입·입출력 구조를 확인합니다.
- 업무 로직: 필수 값·금액 범위·업무 상태를 검증합니다.
- 권한: 요청자의 작업·데이터 접근 범위를 확인합니다.

---

### 검증 위치를 구분하기

클라이언트 검증은 우회될 수 있습니다. 화면 버그·직접 API 호출에도 서버 규칙이 적용되어야 합니다.

- HandStack: 거래 계약과 실제 실행 모듈의 검증 로직을 확인합니다.
- 별도 Node.js 서비스: `class-validator` 등의 선택적 라이브러리를 사용할 수 있습니다.
- ASP.NET Core Controller/DTO: `DataAnnotations`를 적용할 수 있습니다.

뒤의 두 방식이 transact 계약에 자동 적용되는 것은 아닙니다.

---

### 핸즈온: 정상 값에서 경계값으로

1. 상품명 필수, 가격 양수 규칙을 실행 모듈에 구현합니다.
2. 정상 값 → 빈 상품명 → 음수 가격 순으로 같은 거래를 보냅니다.
3. HTTP 상태와 거래 응답의 오류 정보, DB 저장 여부를 함께 확인합니다.

별도 REST Controller 실습에서는 DTO의 `@IsNotEmpty()` 등과 `400 Bad Request` 응답을 확인합니다. HandStack 거래 오류도 반드시 HTTP 400일 것이라 가정하지 않습니다.

---

## 3. 전송 오류와 거래 오류 구분하기

HTTP 상태는 전송·엔드포인트 처리 상태를, 거래 응답은 업무 실행 결과를 알려줍니다.

- HTTP 200만으로 저장 성공을 판단하지 않습니다.
- 사용자에게는 해결 가능한 메시지를 보여줍니다.
- 개발자는 GlobalID로 상세 서버 로그를 확인합니다.

---

### 주요 HTTP 상태 코드 (1/2) · 세부 1/2

<!-- _class: reference-page -->



- `2xx` (성공)
  - `200 OK`: 요청 성공 (조회)
  - `201 Created`: 리소스 생성 성공 (생성)
  - `204 No Content`: 성공했으나 반환할 내용 없음 (삭제)



---

### 주요 HTTP 상태 코드 (1/2) · 세부 2/2

<!-- _class: reference-page -->



- `4xx` (클라이언트 오류)
  - `400 Bad Request`: 잘못된 요청 (예: 유효성 검사 실패)
  - `401 Unauthorized`: 인증 필요
  - `403 Forbidden`: 권한 없음
  - `404 Not Found`: 요청한 리소스 없음

---

### 주요 HTTP 상태 코드 (2/2)

<!-- _class: reference-page -->



- `5xx` (서버 오류)
  - `500 Internal Server Error`: 서버 내부에서 예측하지 못한 오류 발생

---

### 핸즈온: 세 가지 실패를 분리해서 확인하기

- **라우팅**: 존재하지 않는 경로의 HTTP 응답을 확인합니다.
- **검증**: 앞서 만든 빈 값·음수 요청의 거래 오류를 확인합니다.
- **서버**: 격리된 테스트 코드에서 의도적인 예외를 발생시킵니다.

일반 REST 예제 `GET /api/products/9999`의 404는 Controller 구현에 따라 달라집니다. 400·404·500을 모든 거래에 기계적으로 대응시키지 않습니다.

---

## 4. 검색 조건을 SQL까지 전달하기

목표: 검색 입력 → 거래 매개변수 → 바인딩 SQL → 결과를 추적합니다.

- URL 쿼리: 별도 GET API에서 쓰는 전달 방식
- `BaseFieldMappings`: 앞선 실행 결과 필드를 후속 입력에 연결
- `pretreatment`: 본 SQL 전에 실행할 쿼리
- `$Variable`: 서버가 부여한 세션 변수

---

### URL의 쿼리와 SQL 매개변수는 다릅니다

일반 GET API는 `?key=value`로 정렬·필터·페이징 조건을 전달할 수 있습니다.

예: `GET /api/products?category=electronics&minPrice=100`

이 URL 자체가 SQL WHERE 절을 만들지는 않습니다. HandStack 거래에서는 입력 계약과 dbclient SQL을 작성하고, 값을 바인딩합니다.

---

### 핸즈온: 검색 조건 하나부터 연결하기

1. 화면의 상품명·분류를 거래의 `Row` 입력에 매핑합니다.
2. dbclient 계약에 바인딩 매개변수와 필요한 `<if>` 조건을 작성합니다.
3. 전체 조회 → 상품명 → 분류 → 결과 없음 순으로 비교합니다.

`BaseFieldMappings`는 URL-to-WHERE 자동 변환 설정이 아닙니다. 선행 실행 결과를 후속 매개변수로 넘길 때만 사용합니다.

---

## transact 검증의 기준

- CommandType과 실행 모듈의 연결을 확인합니다.
- 요청 Row·List와 응답 Form·Grid를 맞춥니다.
- 서버 검증·거래 오류·검색 조건을 성공 및 실패 요청으로 확인합니다.

<!--
질문을 받는 동안 이 확인 기준을 화면에 남깁니다. 청중이 자신의 업무에 적용할 다음 행동 하나를 고르게 합니다.
-->

