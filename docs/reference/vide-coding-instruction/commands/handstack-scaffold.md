---
description: 새 화면 하나에 필요한 화면(HTML·JS), 거래 계약, SQL 계약 파일을 한 번에 만드는 Claude Code 사용자 정의 명령의 예시입니다.
---

# handstack-scaffold

새 화면 하나에 필요한 파일을 한 번에 만드는 **예시 명령**입니다. `handstack-developer` 에이전트를 호출해 초기 파일을 만들게 합니다.

:::note 이 명령의 구현체는 제공되지 않습니다
HandStack 저장소와 CLI에는 `handstack-scaffold` 명령이 없습니다. 이 문서는 Claude Code 사용자 정의 슬래시 명령으로 쓸 수 있는 프롬프트 예시입니다. 쓰려면 이 내용을 프로젝트의 `.claude/commands/handstack-scaffold.md`로 복사하고 경로와 템플릿을 프로젝트 구조에 맞게 고치세요. 프로젝트 전체를 템플릿에서 만들 때는 `handstack create` 명령([HandStack CLI](/docs/startup/HandStack-CLI-사용법))이나 IDE의 새 개발 파일 기능을 쓰세요.
:::

## 사용법

`/handstack-scaffold {화면ID}`

예: `/handstack-scaffold BOD100`

## 생성되는 파일

기본 배포본 배치([식별자와 파일 경로](/docs/reference/식별자와-파일-경로)) 기준입니다. IDE로 만든 프로젝트는 확장자가 `.txn`, `.dbc`입니다.

1. `contracts/wwwroot/HDS/{ProjectID}/{ID}.html` - 화면
2. `contracts/wwwroot/HDS/{ProjectID}/{ID}.js` - 화면 스크립트
3. `contracts/transact/HDS/{ProjectID}/{ID}.json` - 거래 계약
4. `contracts/dbclient/HDS/{ProjectID}/{ID}.xml` - SQL 계약

화면은 거래 계약 없이는 서버에 요청이 가지 않으므로 거래 계약까지 함께 만들어야 합니다.

## 프로세스

1. 화면 ID와 `ProjectID`를 정합니다. `ProjectID`는 화면 ID에서 자동으로 잘라 내지 말고 기존 프로젝트 폴더 이름을 확인해 받습니다(예: `BOD100`의 `ProjectID`는 `BOD`).
2. 같은 ID나 서비스 ID가 이미 있는지 확인하고, 디렉토리가 없으면 만듭니다.
3. 표준 템플릿으로 네 파일을 만듭니다.
   - JS: `$BOD100` 객체와 `transaction`(`LD01`), `hook.pageLoad`
   - HTML: `<form syn-datafield>`와 조회 조건, 그리드, `syn-events`가 선언된 버튼
   - 거래 계약: `ServiceID`가 `LD01`인 서비스
   - SQL 계약: `header`의 `datasource`와 `LD01` 조회 구문
4. 만든 파일 경로와 이름 대응표(`syn-datafield`/`dataFieldID`, `belongID`/`LD01`, `ServiceID`/`statement id`)를 출력합니다.

## 템플릿 예시

**JS:**

```javascript
'use strict';
let $BOD100 = {
    transaction: {
        LD01: {
            inputs: [{ type: 'Row', dataFieldID: 'MainForm' }],
            outputs: [{ type: 'Grid', dataFieldID: 'GridList' }]
        }
    },
    hook: {
        pageLoad() { syn.$w.transactionAction('LD01'); }
    }
};
```

**SQL 계약:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<mapper xmlns="contract.xsd">
    <header>
        <datasource>DB01</datasource>
        <use>Y</use>
        <desc>BOD100 조회</desc>
    </header>
    <commands>
        <statement id="LD01" seq="0" use="Y" timeout="0" desc="조회">
            <![CDATA[ SELECT ... ]]>
        </statement>
    </commands>
</mapper>
```

완성된 전체 예시는 [HANDSTACK.md](/docs/reference/vide-coding-instruction/examples/HANDSTACK)에 있습니다.
