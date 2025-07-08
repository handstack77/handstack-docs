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

# 클라이언트 도구로 거래 및 SQL 테스트 하기

### Postman과 CLI 도구를 활용한 HandStack API 테스트

---

## 왜 HTTP 클라이언트가 필요한가?

HandStack으로 개발한 애플리케이션은 HTTP 기반의 단일 엔드포인트의 API를 사용합니다.

- UI 화면 없이도 백엔드의 기능이 올바르게 동작하는지 확인해야 합니다.
- HTTP 클라이언트는 서버에 직접 요청을 보내고 응답을 확인할 수 있는 도구입니다.
- 이를 통해 개발 초기 단계에서 빠르게 API를 테스트하고 디버깅할 수 있습니다.
- 대표적인 도구로 <mark>Postman</mark>이 있으며, 터미널 환경을 위한 <mark>CLI 도구</mark>도 있습니다.

---

## 방법 1: Postman 활용하기

Postman은 API 개발 및 테스트를 위한 강력한 GUI 도구입니다.

- 직관적인 인터페이스로 HTTP 요청을 쉽게 구성하고 전송할 수 있습니다.
- 요청 기록, 환경 변수 설정 등 다양한 편의 기능을 제공합니다.
- [Postman 다운로드](https://go.postman.co/build) 후 설치하여 바로 사용할 수 있습니다.

---

## `transact` 모듈 테스트 (1/2)

`transact` 모듈의 비즈니스 거래를 테스트합니다.

- 사전 설정: `transact` 모듈의 `syn.config.json` 에서 `IsValidationRequest` 값을 `false`로 변경합니다.
- Method: `POST`
- URL: `http://localhost:8421/transact/api/transaction/execute`
- Headers: `Content-Type: application/json`

---

## `transact` 모듈 테스트 (2/2)

[transact-payload.json 다운로드](assets/transact-payload.json) 후에 다음의 항목을 변경하여 요청을 실행합니다.

```json
{
    ...
    "transaction": {
        "globalID": "LD00000HDSTSTSQS010GD01WRPFJF9104400",
        "businessID": "TST",
        "transactionID": "TST020",
        "functionID": "AD01",
        "commandType": "R",
        "screenID": "TST020",
    },
    "payLoad": {
        "property": {},
        "dataMapInterface": "Row|Form,Grid",
        "dataMapCount": [
            1
        ],
        "dataMapSet": [
            [
                {
                    "id": "CompanyNo",
                    "value": "1"
                }
            ]
        ]
    }
    ...
}
```

---

## `dbclient` 모듈 테스트 (1/2)

`dbclient` 모듈을 통해 직접 SQL을 실행하고 테스트합니다.

- 사전 설정: `dbclient` 모듈의 `syn.config.json` 에서 `AuthorizationKey` 값을 `HANDSTACKDHOSTNAME`으로 설정합니다.
- Method: `POST`
- URL: `http://localhost:8421/dbclient/api/query`
- Headers: `Content-Type: application/json`

---

## `dbclient` 모듈 테스트 (2/2)

[dbclient-payload.json 다운로드](assets/dbclient-payload.json) 후에 다음의 항목을 변경하여 요청을 실행합니다.

```json
{
    ...
    "ClientTag": "",
    "AccessToken": "",
    "Version": "001",
    "Action": "SYN",
    "Environment": "D",
    "ReturnType": 0,
    "GlobalID": "HDSTSTSQS010LF01D20230821133753804DP0",
    "IsTransaction": false,
    "DynamicObjects": [
        {
            "QueryID": "HDS|TST|SQS010|GD0100",
            "JsonObject": 0,
            "JsonObjects": [
                0
            ],
            "Parameters": [
                {
                    "ParameterName": "ApplicationID",
                    "Value": "helloworld",
                    "DbType": "String",
                    "Length": -1
                }
            ],
            "DecryptParameters": [],
            "BaseFieldMappings": [],
            "IgnoreResult": false
        }
    ]
    ...
}
```

---

## `function` 모듈 테스트 (1/2)

`function` 모듈을 통해 직접 Function 을 실행하고 테스트합니다.

- 사전 설정: `function` 모듈의 `syn.config.json` 에서 `AuthorizationKey` 값을 `HANDSTACKDHOSTNAME`으로 설정합니다.
- Method: `POST`
- URL: `http://localhost:8421/function/api/execution`
- Headers: `Content-Type: application/json`

---

## `function` 모듈 테스트 (2/2)

[function-payload.json 다운로드](assets/function-payload.json) 후에 다음의 항목을 변경하여 요청을 실행합니다.

```json
{
    ...
    "ClientTag": "",
    "AccessToken": "",
    "Version": "001",
    "Action": "SYN",
    "Environment": "D",
    "ReturnType": 0,
    "GlobalID": "HDSHEDHED010GF01D20230821133753804DP0",
    "IsTransaction": false,
    "DynamicObjects": [
        {
            "QueryID": "HDS|HED|HED010|GF0100",
            "JsonObject": 0,
            "JsonObjects": [
                0
            ],
            "Parameters": [
                {
                    "ParameterName": "UserWorkID",
                    "Value": "3qmbxyhc",
                    "DbType": "String",
                    "Length": -1
                }
            ],
            "DecryptParameters": [],
            "BaseFieldMappings": [],
            "IgnoreResult": false
        }
    ]
    ...
}
```

---

## postman 에서 컬렉션 import

HandStack transact, dbclient, function API 테스트에서 거래 항목을 수정하여 요청

- [postman_handstack_apitest.json](assets/postman_handstack_apitest.json) 파일을 다운로드
- 왼쪽 상단의 `import` 버튼을 클릭하여 다운로드 받은 파일을 드래그 또는 선택

---

## 방법 2: CLI (Command-Line Interface) 활용

인터넷 연결이 제한되거나 GUI 환경이 없는 서버 터미널에서는 어떻게 테스트할까요?

- 이때 <mark>명령줄 인터페이스(CLI)</mark> 도구를 사용합니다.
- 미리 작성된 요청 파일을 실행하여 API를 테스트할 수 있습니다.
- 스크립트에 포함하여 테스트를 자동화하기에도 용이합니다.
- 여기서는 JetBrains에서 제공하는 <mark>IntelliJ HTTP Client CLI</mark>를 사용해 보겠습니다.

> ijhttp는 IntelliJ IDEA의 HTTP Client 플러그인과 동일한 .http 파일 형식을 사용하기 때문에, IDE에서 작성한 요청 파일을 터미널에서도 그대로 활용할 수 있다는 장점이 있습니다

---

## `.http` 파일 만들기

CLI 도구에서 사용하기 위해, Postman 에서 요청 정보를 `.http` 파일 형식으로 저장합니다.

- Postman 의 Code snippet 에서 HTTP 를 선택합니다.
  - `transact.http`, `dbclient.http`, `function.http` 파일을 각각 `C:/tmp/handstack` 디렉토리에 생성합니다.

- 파일 내용은 다음과 같은 형식으로 작성합니다.
    - 요청 메서드와 URL
    - 헤더 정보
    - 한 줄 띄고
    - JSON 본문

---

## IntelliJ HTTP Client CLI 설치하기 (1/2)

- JDK 17+ 설치
    - `ijhttp` CLI는 JDK 17 이상이 필요합니다.
    - Windows에서는 `winget`을 사용하여 쉽게 설치할 수 있습니다.

    ```bash
    winget install Microsoft.OpenJDK.17
    ```

- JDK 21 설치
    ```bash
    winget install Microsoft.OpenJDK.21
    ```

---

## IntelliJ HTTP Client CLI 설치하기 (2/2)

- `ijhttp` 다운로드 및 압축 해제
    - [JetBrains 공식 웹사이트](https://www.jetbrains.com/ko-kr/ijhttp/download/)에서 직접 다운로드하거나, 터미널에서 `curl` 명령을 사용합니다.
    ```bash
    curl -f -L -o ijhttp.zip "https://jb.gg/ijhttp/latest"
    ```
    - 다운로드한 `ijhttp.zip` 파일의 압축을 해제합니다.

- 명령 프롬프트를 관리자 권한으로 실행하여 다음 명령어로 환경변수에 등록합니다.
  ```cmd
  setx PATH "%PATH%;[압축 해제 경로]\ijhttp\bin" /M
  ```

---

## IntelliJ HTTP Client CLI 실행하기

`ijhttp` 명령을 실행하여 사전에 만든 .http 파일로 요청을 실행합니다.

- `-L VERBOSE` 옵션은 요청과 응답의 상세 정보(헤더, 본문)를 모두 출력합니다.

- `transact.http` 파일 테스트
    ```bash
    ijhttp -L VERBOSE C:/tmp/handstack/transact.http
    ```

---

## 핸즈온: 직접 테스트 해보기

이제 배운 내용을 바탕으로 직접 실습해 봅시다.

- 1. `transact` 요청 보내기
    - Postman 또는 `ijhttp`를 사용하여 데이터를 저장하는 `transact` 요청을 전송합니다.

- 2. 결과 확인하기
    - HandStack으로 만든 목록 조회 화면에서 데이터가 정상적으로 저장되었는지 확인합니다.
    - 또는, `dbclient` 요청을 보내 데이터베이스에서 직접 조회하여 확인합니다.

- 3. 응용하기
    - `.http` 파일이나 Postman의 Body 내용을 수정하여 다른 데이터를 입력해 보고 결과를 다시 확인합니다.

---

## HandStack의 장점

> <blockquote>HandStack이 자동으로 만들어준 API 덕분에, 데이터베이스에 직접 접근할 필요 없이 웹 요청만으로 데이터를 넣고 뺄 수 있어요. 정말 편리하죠?</blockquote>

- 이처럼 HandStack은 복잡한 설정 없이 표준화된 방식으로 데이터를 처리하는 API를 제공합니다.
- 개발자는 비즈니스 로직에만 집중할 수 있어 생산성이 크게 향상됩니다.
- 프론트엔드와 백엔드 개발자 간의 협업이 매우 명확하고 간단해집니다.
