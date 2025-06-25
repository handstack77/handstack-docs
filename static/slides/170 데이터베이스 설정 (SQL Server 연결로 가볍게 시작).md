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

# 데이터베이스 설정

### SQL Server 연결로 가볍게 시작

---

## 왜 데이터베이스가 필요한가요?

애플리케이션의 핵심은 <mark>데이터</mark>입니다.

- 사용자의 정보, 게시글, 상품 목록 등 모든 중요한 데이터를 저장하고 관리하는 공간이 필요합니다.
- HandStack 프로젝트가 이 데이터베이스와 통신하기 위해서는 <mark>연결 정보</mark>가 필요합니다.
- 이 연결 정보를 '연결 문자열 (Connection String)'이라고 부릅니다.

<br>
> 연결 문자열은 데이터베이스의 주소, 계정 정보 등을 담고 있는 특별한 텍스트입니다.

---

## HandStack 데이터베이스 설정 파일

HandStack은 `module.json` 파일 하나로 데이터베이스 연결을 관리합니다.

- 개발 소스 위치
    - `$(HANDSTACK_SRC)/2.Modules/dbclient/module.json`
    - 프로젝트의 원본 소스에 포함된 설정 파일입니다.

- 빌드 후 위치
    - `$(HANDSTACK_HOME)/modules/dbclient/module.json`
    - 실제 실행 환경에서 사용되는 설정 파일입니다.

<br>

> 소스와 실행 환경의 설정이 분리되어 있어 각 환경에 맞는 DB 정보를 유연하게 관리할 수 있습니다.

---

## `module.json` 설정 항목 살펴보기

`dbclient` 모듈의 `module.json` 파일은 다음과 같은 구조로 되어 있습니다.

```json
{
  "DataSources": [
    {
      "ApplicationID": "Default",
      "ProjectID": "Default",
      "DataSourceID": "Main",
      "DataProvider": "SqlServer",
      "ConnectionString": "서버=localhost;데이터베이스=YourDB;...",
      "IsEncryption": false,
      "Timeout": 30
    }
  ]
}
```

- `DataSourceID`: 여러 DB를 사용할 경우, 이를 구분하는 고유 ID입니다.
- `DataProvider`: 연결할 데이터베이스 종류 (예: `SqlServer`, `Oracle`, `MariaDB` 등)
- `ConnectionString`: 실제 데이터베이스 연결 정보
- `IsEncryption`: 연결 문자열 암호화 여부

---

## 안전한 연결 문자열 관리

중요한 접속 정보를 코드에 그대로 노출하는 것은 위험합니다.
HandStack CLI는 간단한 명령어로 연결 문자열을 암호화/복호화하는 기능을 제공합니다.

- 연결 문자열 암호화
    ```bash
    handstack encrypt --format=connectionstring --value="[연결 문자열]"
    ```

- 암호화된 문자열 복호화
    ```bash
    handstack decrypt --format=connectionstring --value="[암호화된 문자열]"
    ```
<br>

> 암호화된 문자열은 `ConnectionString`에 넣고 `IsEncryption` 값을 `true`로 변경하여 사용합니다.
> 암호화는 동일한 서버 환경 내에서만 유효합니다.

---

## 핸즈온: 직접 확인해보기

이제 여러분의 프로젝트에서 데이터베이스 설정 파일을 직접 열어봅시다.

1. Visual Studio Code에서 `$(HANDSTACK_HOME)/modules/dbclient/module.json` 파일을 엽니다.
2. `ConnectionString` 항목을 찾아 로컬 SQL Server 환경에 맞게 수정합니다.
    - 예시: `Server=localhost;Database=handstack_db;User Id=sa;Password=your_password;`
3. `IsEncryption` 값이 `false`인지 확인합니다.

<br>

> `DataSources`는 배열(`[]`)로 되어 있어, 여러 개의 데이터베이스 접속 정보를 추가할 수 있습니다. 이를 통해 <mark>테넌트별로 다른 데이터베이스를 연결</mark>하는 것도 가능합니다.

---

## HandStack의 유연한 DB 연동

> HandStack은 다양한 데이터베이스를 쉽게 연결할 수 있도록 도와줘요.
> 첫걸음으로는 가장 간편한 SQL Server를 사용하지만, 나중엔 프로젝트 필요에 따라 아래 데이터베이스들로 쉽게 바꿀 수 있답니다!

- SQL Server
- Oracle
- PostgreSQL
- MariaDB
- SQLite

<br>

간단한 `module.json` 파일 수정만으로 데이터베이스 전환이 가능하여 높은 유연성과 확장성을 제공합니다.
