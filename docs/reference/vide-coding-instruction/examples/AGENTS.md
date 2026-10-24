---
title: AGENTS.md
description: HandStack 프로젝트에서 AI 코딩 에이전트가 지켜야 할 식별자·계약·화면·보안 규칙을 담은 AGENTS.md 템플릿과 하위 폴더용 예시입니다.
---

# AGENTS.md

HandStack으로 업무 화면을 만드는 프로젝트의 루트에 두는 `AGENTS.md` 템플릿입니다. Codex CLI, Gemini CLI, Cursor 등 `AGENTS.md`를 읽는 에이전트에 그대로 적용됩니다. Claude Code는 `CLAUDE.md`를 읽으므로 [CLAUDE.md 예시](/docs/reference/vide-coding-instruction/examples/CLAUDE)처럼 `@AGENTS.md`를 불러오게 하세요.

규칙은 이 사이트의 [식별자와 파일 경로](/docs/reference/식별자와-파일-경로), [거래 호출](/docs/reference/거래-호출), [transact](/docs/reference/api/modules/transact), [dbclient](/docs/reference/api/modules/dbclient), [파일과 저장 규칙](/docs/ide/reference/파일과-저장-규칙), [증상별 문제 해결](/docs/guides/문제-해결)에서 가져왔습니다. `<...>`로 표시한 곳은 프로젝트에 맞게 바꾸세요.

## 사용 방법

1. 아래 [루트 템플릿](#루트-템플릿)을 프로젝트 루트의 `AGENTS.md`로 복사하고 `<...>` 값을 채웁니다.
2. 에이전트가 문서를 직접 조회하도록 문서 MCP 서버를 등록합니다. 방법은 [AI 에이전트에 HandStack 문서 연결하기](/docs/guides/에이전트에-문서-연결하기)를 참고하세요. MCP를 쓸 수 없으면 템플릿의 `llms.txt` 주소가 대신합니다.
3. 계약 폴더나 화면 폴더처럼 규칙이 다른 위치에는 [하위 폴더용 AGENTS.md](#하위-폴더용-agentsmd)를 둡니다. 에이전트는 작업 중인 파일에 가장 가까운 `AGENTS.md`를 우선 적용하므로, 루트에는 공통 규칙만 두고 SQL·JSON·화면 상세는 하위 파일로 나눕니다.
4. 규칙이 문서와 어긋나면 프로젝트 사정이 우선입니다. 다만 어긋난 이유를 파일에 한 줄 남겨 에이전트가 되돌리지 않게 하세요.

## 루트 템플릿

~~~~markdown
# <프로젝트 이름>

HandStack 기반 업무 웹 앱입니다. 화면(HTML·JavaScript), 거래 계약(transact), SQL 계약(dbclient)을 같은 ID로 연결하고 `ack` 서버에서 실행합니다.

## 먼저 문서를 확인하세요

HandStack 고유 규칙은 추측하지 말고 공식 문서에서 확인합니다.

- MCP 서버 `handstack-docs`가 있으면 `search_docs`로 찾고 `get_doc`으로 필요한 섹션만 읽습니다. 예제 파일은 `get_sample`로 봅니다.
- MCP가 없으면 https://handstack.kr/llms.txt 의 목록에서 문서를 고릅니다. 전체 본문은 https://handstack.kr/llms-full.txt 입니다.
- 이 파일과 문서가 다르면 이 파일의 프로젝트 규칙을 따르고, 차이를 사용자에게 알립니다.
- 문서에 없는 API, 옵션, 설정 키는 만들어 쓰지 않습니다. 확인이 안 되면 사용자에게 묻습니다.

## 프로젝트 값

| 항목 | 값 |
|---|---|
| ApplicationID | `<예: HDS>` |
| ProjectID | `<예: BOD>` |
| 계약 경로 | `<예: contracts/>` |
| 개발 서버 주소 | `<예: http://localhost:8421>` |
| 데이터 원본(datasource) ID | `<예: DB01>` |
| DB 공급자 | `<예: SQLite, SQL Server, PostgreSQL>` |

## 요청 흐름

화면이 기능 ID만 부르면 나머지는 계약이 정합니다.

```text
[화면] syn.$w.transactionAction('LD01')
   v
[transact] <TransactionID>.json 계약 확인 -> 인증 -> GlobalID 부여 -> 로그
   v
[dbclient] <TransactionID>.xml 의 LD01 SQL 실행
   v
[transact] Outputs 정의대로 변환해 응답 -> [화면] 출력 컨트롤에 채움
```

## 식별자 규칙

| 값 | 항목 | 예 |
|---|---|---|
| ApplicationID | 애플리케이션 | `HDS` |
| ProjectID | 업무 프로젝트 | `BOD` |
| TransactionID | 화면·거래 | `BOD010` |
| ServiceID / SQL `statement id` | 화면의 기능 하나 | `LD01` |
| `datasource` | 서버에 등록된 데이터 원본 | `DB01` |

- 거래 ID는 `ApplicationID|ProjectID|TransactionID|ServiceID` 형식입니다. 예: `HDS|BOD|BOD010|LD01`.
- `BOD` 같은 ProjectID와 SQL을 실행하는 서버 모듈 `dbclient`는 서로 다른 개념입니다.
- 화면·거래 계약·SQL 계약의 ID는 항상 같아야 합니다. ID를 바꾸면 세 곳을 함께 바꿉니다.

## 기능 ID(ServiceID) 규칙

`기능구분 1자리 + 명령구분 1자리 + 순번 2자리`로 4자리를 만듭니다. 예: `LD01` = List + Database + 01.

| 기능구분 | 의미 | | 명령구분 | 의미 |
|---|---|---|---|---|
| I | INSERT | | D | Database 명령 |
| U | UPDATE | | F | Function(서버 함수) 실행 |
| D | DELETE | | A | RESTful API 호출 |
| G | 단일 행 조회 | | T | Task(배치 작업) |
| L | 목록 조회 | | | |
| M | CRUD 복합 | | | |
| N | 알림 전달 | | | |
| R | 폐기·명령 취소 | | | |
| Z | 관리 목적 실행 | | | |

- 이 이름 규칙과 계약의 `CommandType`은 별개입니다. 서버 라우팅은 계약의 실제 `CommandType`으로 결정됩니다.
- 한 화면의 기능이 99개를 넘으면 화면이나 기능을 나누는 리팩터링을 제안합니다.
- 기존 프로젝트가 다른 순서(명령구분 먼저 등)를 쓰고 있으면 기존 관례를 따르고 여기에 적어 둡니다: `<예외 규칙>`

## 파일 배치

```text
contracts/
├─ wwwroot/<AppID>/<ProjectID>/<TransactionID>.html   화면
├─ wwwroot/<AppID>/<ProjectID>/<TransactionID>.js     화면 스크립트
├─ transact/<AppID>/<ProjectID>/<TransactionID>.json  거래 계약
└─ dbclient/<AppID>/<ProjectID>/<TransactionID>.xml   SQL 계약
```

- 위는 기본 배포본의 예제 배치입니다. 이 프로젝트의 실제 경로는 `<계약 경로>`입니다.
- IDE로 만든 프로젝트는 확장자가 다릅니다. 거래는 `.txn`(JSON), SQL은 `.dbc`(XML)입니다. 확장자는 내부 형식과 무관하므로 기존 파일의 확장자를 일괄 변경하지 않습니다.
- 소스 저장소의 원본과 서버가 읽는 실행 경로가 다를 수 있습니다. 수정했는데 결과가 그대로면 실행 중인 계약 경로부터 확인합니다.
- 화면은 파일을 직접 열지 말고 서버 주소로 접속합니다. 예: `http://localhost:8421/view/BOD/BOD010.html`

## 새 화면(기능) 추가 절차

1. TransactionID와 ServiceID를 정하고 기존 ID와 겹치지 않는지 확인합니다.
2. SQL 계약에 `statement`를 추가하고 DB 클라이언트에서 SQL을 먼저 단독 실행해 봅니다.
3. 거래 계약에 같은 ServiceID의 서비스를 추가합니다. 조회는 `TransactionScope: false`로 둡니다.
4. 화면 HTML에 `syn-datafield`를 달고, 화면 스크립트 `transaction`에 입출력을 선언합니다.
5. 브라우저에서 새로고침한 뒤 조회·저장을 실제로 실행해 응답을 확인합니다.

기존 화면을 고칠 때도 같은 순서로 세 곳(화면·거래·SQL)의 ID를 대조합니다.

## 화면에서 거래 호출

```js
transaction: {
    LD01: {
        inputs: [{ type: 'Row', dataFieldID: 'MainForm' }],
        outputs: [{ type: 'Grid', dataFieldID: 'Board' }]
    }
}

syn.$w.transactionAction('LD01', { message: '조회 중...' });
```

- `transactionAction`은 결과 데이터를 반환하는 Promise가 아닙니다. `await`한 값을 결과로 쓰지 말고 출력 매핑과 `callback`으로 처리합니다.
- 입력은 HTML의 `syn-datafield`와 거래 설정의 `dataFieldID`를 맞춥니다. 출력도 같은 방식입니다.
- 클라이언트 옵션(`authorize` 등)은 서버의 인증·공개 거래 정책을 대신하지 않습니다.
- 모든 오류가 `callback`으로 전달되지는 않습니다. 응답의 `errorText`와 서버 로그를 함께 확인합니다.

## 편집 규칙

- 파일은 UTF-8로 저장하고 기존 줄바꿈(EOL) 관례를 유지합니다.
- JSON·XML 계약은 저장 전에 문법(따옴표, 태그 닫힘)을 확인합니다.
- HTML과 같은 이름의 JS는 함께 확인합니다.
- View Designer가 쓰는 `data-designer-*` 속성은 지우거나 별도 파일로 옮기지 않습니다. 단, `data-designer-id`와 `data-studio-node`는 캔버스 전용이라 저장 원본에 남기지 않습니다.
- 기존 파일을 고칠 때는 요청과 무관한 서식 변경이나 이름 변경을 섞지 않습니다.

## 보안과 설정

- 비밀번호, 인증 키, API 토큰, 연결 문자열의 실제 값을 계약·예제·코드·로그에 남기지 않습니다. 자리표시자(`<데이터베이스 연결 문자열>`)를 씁니다.
- 값을 암호화해야 하면 `handstack encrypt --format=connectionstring --value="..."`처럼 CLI를 사용합니다. 데이터 원본은 서버에 등록된 ID(`DB01` 등)로만 참조합니다.
- 거래의 `Authorize: false`는 인증 없이 호출 가능하다는 뜻입니다. 새 거래는 인증을 요구(`true`)하는 것을 기본으로 하고, `false`로 두려면 이유를 사용자에게 설명합니다. 일반적으로 등록·수정·삭제는 인증을 요구하고 목록·상세 조회만 공개합니다.
- 오류를 피하려고 `AllowRequestTransactions`, `PublicTransactions`, `RequestOriginApiAccess` 같은 서버 보안 설정을 넓히지 않습니다.
- 설정은 `appsettings.json`(호스트), `module.json`(모듈), 환경 변수, 실행 인자 순으로 계층화되어 있습니다. 환경별 값(연결 문자열, 외부 주소)은 프리셋을 바꿔도 자동으로 바뀌지 않으므로 각 환경 파일을 직접 확인합니다.
- 설정 파일 변경은 반드시 사용자 확인 후 진행하고, OS별 설정 파일은 서버를 재시작해야 반영됩니다.

## 문제가 생기면

앞 단계가 정상으로 확인된 뒤에 다음 단계로 넘어갑니다.

1. 브라우저 Network 탭: 요청이 나갔는가, HTTP 상태는 무엇인가. 200이어도 응답에 오류가 있을 수 있습니다.
2. 응답 본문의 `message`, `acknowledge`, `errorText`
3. 거래 이력의 GlobalID로 실패한 ServiceID 추적
4. 모듈별 로그(transact, dbclient, function)의 SQL 오류와 계약 문법 오류

| 증상 | 먼저 볼 것 |
|---|---|
| 거래 설정·계약을 찾지 못함 | 화면 JS의 거래 이름, JSON의 `ServiceID`, XML의 `statement id` 대조 |
| 오류는 없는데 목록이 비어 있음 | 응답 본문에 데이터가 있는지. 있으면 `syn-datafield`와 `outputs[].dataFieldID` |
| 수정했는데 그대로임 | 브라우저 캐시, 서버가 읽는 계약 경로, 계약 감시·캐시 설정 |
| `no such table` | 연결된 DB 파일과 `datasource` 대조. 운영·기존 데이터가 있는 DB에서 초기화 계약을 실행하지 않습니다 |

## 작업 후 확인

1. 화면을 새로고침하고 Network 탭에서 새 파일이 요청됐는지 봅니다.
2. 계약을 수정했다면 거래를 다시 실행해 응답이 바뀌었는지 봅니다.
3. 화면 ↔ 거래 계약 ↔ SQL 계약의 ID, `dataFieldID`, `statement id`를 한 번 더 대조합니다.
4. 공유 계약이나 SQL을 고쳤다면 같은 계약을 쓰는 다른 화면의 조회·등록·삭제도 확인합니다. 회귀 목록: `<프로젝트의 회귀 확인 항목>`
5. 실행하지 못한 확인은 "미실행"으로 보고하고 통과했다고 쓰지 않습니다.

## 하지 말 것

- 문서에 없는 HandStack API, 옵션, 설정 키를 지어내지 않습니다.
- 기존 계약 파일을 다른 확장자로 일괄 변환하지 않습니다.
- 서버 모듈 설정(`module.json`, `appsettings`)과 운영 연결 정보를 사용자 확인 없이 바꾸지 않습니다.
- 예제 값(`HDS`, `BOD010`)을 실제 프로젝트 값처럼 복사해 두지 않습니다.
- 운영 DB나 기존 데이터가 있는 환경에서 초기화·삭제 성격의 계약(`ZD01` 등)을 실행하지 않습니다.
- 실제 비밀 값을 만들어 내거나 로그·응답에서 복사해 파일에 남기지 않습니다.
~~~~

## 하위 폴더용 AGENTS.md

### contracts/dbclient/AGENTS.md

~~~~markdown
# SQL 계약(dbclient)

- 파일 하나는 화면 하나(TransactionID)의 SQL을 담습니다. 파일 이름은 화면·거래 계약과 같게 둡니다.
- `header`의 application/project/transaction/datasource 값이 화면·거래 계약과 일치해야 합니다.
- `statement id`는 기능 ID 규칙(`기능구분+명령구분+순번`)을 따르고 파일 안에서 중복되지 않게 합니다.
- datasource는 서버에 등록된 ID만 씁니다. 연결 문자열을 계약에 적지 않습니다.
- 입력 값은 SQL에 문자열로 이어 붙이지 말고 `@이름` 파라미터와 `<param>`으로 선언합니다. 모든 `<param>`에 `type`과 `length`를 씁니다.
- DB 공급자마다 SQL 문법과 파라미터 타입이 다릅니다. 작성 후 실제 공급자에서 실행해 검증하고, 공급자별 규칙은 추측하지 말고 `search_docs`로 dbclient 문서를 확인합니다.

## 구조

```xml
<?xml version="1.0" encoding="UTF-8"?>
<mapper xmlns="contract.xsd">
    <header>
        <application>HDS</application>
        <project>BOD</project>
        <transaction>BOD012</transaction>
        <datasource>DB01</datasource>
        <use>Y</use>
        <desc>게시글 조회·수정·삭제</desc>
    </header>
    <commands>
        <statement id="GD01" seq="0" use="Y" timeout="0" desc="게시글 조회">
            <![CDATA[
SELECT B.ID, B.Title FROM Board B WHERE B.ID = @ID;
            ]]>
            <param id="@ID" type="String" length="-1" value="" />
        </statement>
    </commands>
</mapper>
```

- 런타임 쿼리 ID의 마지막 항목은 `id`와 두 자리로 채운 `seq`를 합친 값입니다. `id="GD01"`, `seq="0"`이면 `HDS|BOD|BOD012|GD0100`으로 요청합니다.
- `timeout`이 음수이면 서버의 `DefaultCommandTimeout`이 적용됩니다.
- 삭제·갱신 SQL에는 반드시 `WHERE` 조건이 있어야 합니다. 조건 없는 `UPDATE`/`DELETE`는 만들지 않습니다.
~~~~

### contracts/transact/AGENTS.md

~~~~markdown
# 거래 계약(transact)

- `ApplicationID`, `ProjectID`, `TransactionID`, `Services[].ServiceID`를 화면 스크립트의 `transaction` 키, SQL 계약의 `statement id`와 맞춥니다.
- 출력 정의(`ModelID`, `Type`)의 순서와 형식은 화면의 출력 매핑과 일치해야 합니다.
- 인증·공개 여부는 계약과 서버 설정으로 정합니다. 화면 쪽 옵션으로 우회하지 않습니다.

## 구조

```json
{
    "ApplicationID": "HDS",
    "ProjectID": "BOD",
    "TransactionID": "BOD010",
    "Services": [
        {
            "ServiceID": "LD01",
            "Authorize": true,
            "ReturnType": "Json",
            "CommandType": "D",
            "TransactionScope": false,
            "Inputs": [{ "ModelID": "Dynamic", "Fields": [], "Type": "Row" }],
            "Outputs": [{ "ModelID": "Dynamic", "Fields": [], "Type": "Grid" }]
        }
    ]
}
```

| 필드 | 규칙 |
|---|---|
| `Authorize` | `false`는 인증 없이 호출 가능합니다. 이유를 설명할 수 없는 `false`는 두지 않습니다. |
| `CommandType` | 실행할 모듈을 정합니다. 거래의 성격이 아닙니다. |
| `TransactionScope` | 조회는 `false`, 여러 테이블을 함께 바꾸는 저장에만 `true`입니다. |
| `Inputs`/`Outputs` | 화면의 입출력 컨트롤 종류와 맞춥니다. 예: 조건 `Row`, 목록 `Grid`, 상세 `Form` |

| CommandType | 실행 모듈 |
|---|---|
| `D` | dbclient (SQL) |
| `G` | graphclient |
| `F` | function |
| `C` | command |
| `P` | prompter |

- 거래 계약 파일은 JSON입니다. 현재 `transact` 로더는 `.json`과 `.txn` 확장자를 읽습니다.
- `AllowRequestTransactions`, `PublicTransactions`, `RoutingCommandUri`는 서버 설정입니다. 계약을 고치다가 바꾸지 말고 사용자에게 확인합니다.
~~~~

### wwwroot 화면 폴더의 AGENTS.md

~~~~markdown
# 화면(wwwroot)

- 화면 객체 이름은 `$<TransactionID>`입니다. 예: `$BOD010`. 화면의 업무 로직은 이 객체 하나에 모읍니다.
- 필요한 절만 선언합니다: `extends`, `config`, `prop`, `hook`, `event`, `transaction`, `method`.
- 거래 연결은 `transaction.<ServiceID>`에 선언하고 `syn.$w.transactionAction('<ServiceID>')`로 호출합니다.
- 입력·출력 컨트롤은 `syn-datafield`로 식별하고 거래 설정의 `dataFieldID`와 맞춥니다.
- 화면 메타데이터(`pageMappings` 등)는 HTML이 아니라 화면 스크립트를 기준으로 합니다.
- 조회 버튼은 `event`, 화면 진입 시 첫 조회는 `hook.pageLoad`에 둡니다.

```js
'use strict';
let $BOD010 = {
    hook: {
        pageLoad() {
            syn.$w.transactionAction('LD01');
        }
    },
    event: {
        btnSearch_click(evt) {
            syn.$w.transactionAction('LD01');
        }
    },
    transaction: {
        LD01: {
            inputs: [{ type: 'Row', dataFieldID: 'MainForm' }],
            outputs: [{ type: 'Grid', dataFieldID: 'Board' }]
        }
    },
    method: {}
};
```

- 요청을 중단하려면 `beforeTransaction`이 `false`를 반환하게 합니다. 이때 `afterTransaction`에 중단 이유가 전달됩니다.
- 화면에 실제 사용자 데이터나 토큰을 하드코딩하지 않습니다.
~~~~
