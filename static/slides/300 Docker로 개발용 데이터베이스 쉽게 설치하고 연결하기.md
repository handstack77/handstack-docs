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

# Docker로 데이터베이스 쉽게 설치하고 연결하기

### 개발 환경을 간편하게 구축하는 방법

---

## 1. Docker Desktop 설치하기

- 개발용 로컬 환경에 Docker를 설치하기 위해 Docker Desktop 설치를 권장합니다.

- 지원 운영체제
    - Windows 10 이상
    - macOS 10.14 이상
    - Linux (Ubuntu, Debian, Fedora)

- 설치 가이드
    - [Windows에 Docker Desktop 설치](https://docs.docker.com/desktop/install/windows-install/)
    - [macOS에 Docker Desktop 설치](https://docs.docker.com/desktop/install/mac-install/)
    - [Linux에 Docker Desktop 설치](https://docs.docker.com/desktop/install/linux-install/)

> Docker Desktop을 설치하면 Docker Engine, Docker CLI, Docker Compose 등 컨테이너 관리에 필요한 도구들이 함께 설치됩니다.

---

## 2. 로컬 데이터베이스 설치하기

- 다음 스크립트를 실행하여 원하는 데이터베이스를 로컬에 설치하고 실행할 수 있습니다.
- `Strong@Passw0rd` 부분은 원하는 비밀번호로 변경하여 사용하세요.

> 처음 스크립트를 실행하면 대용량의 Docker 이미지를 다운로드하므로 네트워크 환경에 따라 시간이 소요될 수 있습니다.

---

### SQL Server 2017

- 설치 명령어
```bash
docker run --name mssql -p 1433:1433 -d -e 'ACCEPT_EULA=Y' -e 'MSSQL_SA_PASSWORD=Strong@Passw0rd' mcr.microsoft.com/mssql/server:2017-latest
```

<br>

- 연결 문자열
```plaintext
Data Source=localhost;Initial Catalog=master;User ID=sa;Password=Strong@Passw0rd;
```

---

### Oracle 19c

- 설치 명령어
```bash
docker run --name oracle -p 1521:1521 -d -e ORACLE_SID=ORCL -e ORACLE_PWD=Strong@Passw0rd -e ORACLE_CHARACTERSET=KO16MSWIN949 doctorkirk/oracle-19c
```

<br>

- 연결 문자열
```plaintext
Data Source=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=localhost)(PORT=1521))(CONNECT_DATA=(SID=ORCL)));User Id=system;Password=Strong@Passw0rd;
```

---

### MariaDB 10.3

- 설치 명령어
```bash
docker run --name mariadb -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=Strong@Passw0rd mariadb:10.3
```

<br>

- 연결 문자열
```plaintext
Server=localhost;Port=3306;Uid=root;Pwd=Strong@Passw0rd;PersistSecurityInfo=True;SslMode=none;Charset=utf8;Allow User Variables=True;
```

---

### PostgreSQL 16

- 설치 명령어
```bash
docker run --name postgres -d -p 5432:5432 -e POSTGRES_PASSWORD=Strong@Passw0rd postgres:16
```

<br>

- 연결 문자열
```plaintext
Host=localhost;Port=5432;Database=postgres;User ID=postgres;Password=Strong@Passw0rd;
```

---

### SQLite

- SQLite는 서버가 필요 없는 내장형 데이터베이스 엔진으로, 모든 데이터를 하나의 파일에 저장합니다.
- Docker 설치가 필요 없으며, 파일 경로만 지정하여 사용합니다.

<br>

- 연결 문자열 예시
```plaintext
URI=file:../sqlite/HDS/dbclient/HDS.db;Journal Mode=MEMORY;Cache Size=4000;Synchronous=Normal;Page Size=4096;Pooling=True;BinaryGUID=False;DateTimeFormat=Ticks;Version=3;
```

---

## 요약

- Docker Desktop을 설치하여 개발 환경을 준비합니다.
- 간단한 `docker run` 명령어로 SQL Server, Oracle, MariaDB, PostgreSQL 등 다양한 데이터베이스를 로컬에 설치할 수 있습니다.
- SQLite는 별도 설치 없이 파일 기반으로 동작합니다.

> 이제 필요한 데이터베이스를 빠르게 준비하고 HandStack 프로젝트 개발을 시작할 수 있습니다.