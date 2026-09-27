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

# Docker로 데이터베이스 쉽게 설치하고 연결하기

실습 DB의 컨테이너와 연결 문자열을 맞추고, SQLite와의 차이를 확인합니다.


<!--
발표: 첫 화면의 목표를 말한 뒤 핵심 개념과 예제로 진행합니다. 확인 질문 뒤에는 답할 시간을 주고, 마지막 완료 기준을 남겨 질문을 받습니다.
발표 구성 참고: MIT OpenCourseWare, Patrick Winston, How to Speak (2018), https://ocw.mit.edu/courses/res-tll-005-how-to-speak-january-iap-2018/pages/how-to-speak/
-->

---

## 1. Docker Desktop 설치하기 (1/2)

<!-- _class: reference-page -->



- 개발용 로컬 환경에 Docker를 설치하기 위해 Docker Desktop 설치를 권장합니다.

- 설치 전 OS 버전·CPU·가상화 지원을 확인합니다. 지원 조건은 아래 공식 설치 문서를 기준으로 합니다.

---

## 1. Docker Desktop 설치하기 (2/2)

<!-- _class: reference-page -->



- 설치 가이드
    - [Windows에 Docker Desktop 설치](https://docs.docker.com/desktop/install/windows-install/)
    - [macOS에 Docker Desktop 설치](https://docs.docker.com/desktop/install/mac-install/)
    - [Linux에 Docker Desktop 설치](https://docs.docker.com/desktop/install/linux-install/)

> Docker Desktop을 설치하면 Docker Engine, Docker CLI, Docker Compose 등 컨테이너 관리에 필요한 도구들이 함께 설치됩니다.

---

## 잠깐, 구분해 보기

컨테이너를 지운 뒤에도 데이터가 남으려면 무엇이 필요할까요?

<!--
질문 후 잠시 기다립니다. 답이 없으면 앞에서 본 예제를 다시 가리킵니다.
확인할 답: DB 저장소의 볼륨·바인드 마운트와 백업을 별도로 준비해야 합니다.
다음 주제로 넘어가기 전에 차이를 청중의 표현으로 한 번 확인합니다.
-->

---

## 2. 로컬 데이터베이스 설치하기

- 아래 태그는 기존 교육용 고정 버전입니다. 신규 환경의 최신·권장 버전을 뜻하지 않습니다.
- 실습용 DB와 새 비밀번호를 사용하고 포트는 localhost에만 공개합니다.
- 예제에는 영속화 볼륨이 없습니다. 보관할 데이터에는 볼륨과 백업을 먼저 설정합니다.

> 처음 스크립트를 실행하면 대용량의 Docker 이미지를 다운로드하므로 네트워크 환경에 따라 시간이 소요될 수 있습니다.

---

### SQL Server 2017

- 설치 명령어
```bash
docker run --name mssql -p 127.0.0.1:1433:1433 -d -e 'ACCEPT_EULA=Y' -e 'MSSQL_SA_PASSWORD=Strong@Passw0rd' mcr.microsoft.com/mssql/server:2017-latest
```

<br>

- 연결 문자열
```plaintext
Data Source=localhost;Initial Catalog=master;User ID=sa;Password=Strong@Passw0rd;
```

---

### Oracle 19c (1/2)

<!-- _class: reference-page -->



> 아래는 제3자 이미지 예시입니다. 실행 전에 출처·라이선스·CPU 지원을 검토합니다. [Oracle 공식 컨테이너 자료](https://github.com/oracle/docker-images/tree/main/OracleDatabase)를 우선 참고합니다.

- 설치 명령어

```bash
docker run --name oracle -p 127.0.0.1:1521:1521 -d -e ORACLE_SID=ORCL -e ORACLE_PWD=Strong@Passw0rd -e ORACLE_CHARACTERSET=KO16MSWIN949 doctorkirk/oracle-19c
```

<br>

- 연결 문자열

---

### Oracle 19c (2/2)

<!-- _class: reference-page -->



```plaintext
Data Source=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=localhost)(PORT=1521))(CONNECT_DATA=(SID=ORCL)));User Id=system;Password=Strong@Passw0rd;
```

---

### MariaDB 10.3

- 설치 명령어
```bash
docker run --name mariadb -d -p 127.0.0.1:3306:3306 -e MYSQL_ROOT_PASSWORD=Strong@Passw0rd mariadb:10.3
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
docker run --name postgres -d -p 127.0.0.1:5432:5432 -e POSTGRES_PASSWORD=Strong@Passw0rd postgres:16
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

## DB 준비의 완료 기준

- OS와 CPU에 맞는 Docker 및 DB 이미지를 확인합니다.
- 포트·계정·DB 이름을 연결 문자열과 맞춥니다.
- 데이터 영속화와 재시작 후 조회를 확인합니다. SQLite는 파일 경로를 확인합니다.

<!--
질문을 받는 동안 이 확인 기준을 화면에 남깁니다. 청중이 자신의 업무에 적용할 다음 행동 하나를 고르게 합니다.
-->
