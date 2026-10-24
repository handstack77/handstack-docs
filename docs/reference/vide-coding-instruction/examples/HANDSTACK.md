# HANDSTACK.md

HandStack 기본 배포본의 게시판 샘플(`BOD010`)에서 발췌한 코드 스타일 예시입니다. AI 에이전트에게 "이 스타일을 따르라"고 보여 줄 때 쓰고, 프로젝트 지침 전체 템플릿은 [AGENTS.md](/docs/reference/vide-coding-instruction/examples/AGENTS)와 [CLAUDE.md](/docs/reference/vide-coding-instruction/examples/CLAUDE) 예시를 쓰세요. 파일 위치와 식별자는 [식별자와 파일 경로](/docs/reference/식별자와-파일-경로), 화면 호출 구문은 [거래 호출](/docs/reference/거래-호출)을 따릅니다.

샘플 원본은 소스 저장소의 `1.WebHost/ack/AppTempletes/handstack.apps.board`(화면 `wwwroot/view/BOD/`, 거래 `transact/BOD/`, SQL `dbclient/BOD/`)에 있습니다. 기본 배포본에서는 `contracts/wwwroot/HDS/BOD/`, `contracts/transact/HDS/BOD/`, `contracts/dbclient/HDS/BOD/`로 복사되어 쓰입니다.

:::note 이 예시를 복사할 때
아래 코드는 서로 이름이 맞물립니다. 화면의 `syn-datafield`와 JS의 `dataFieldID`, 컨트롤의 `belongID`와 거래 ID(`LD01`), 거래 계약의 `ServiceID`와 SQL의 `statement id`를 함께 바꾸세요. 하나만 바꾸면 요청이 가지 않거나 값이 비어 전달됩니다.
:::

## 1. 화면 JavaScript

`wwwroot/view/BOD/BOD010.js`에서 발췌했습니다.

```javascript
'use strict';
let $BOD010 = {
    transaction: {
        LD01: {
            inputs: [{ type: 'Row', dataFieldID: 'MainForm' }],
            outputs: [{ type: 'Grid', dataFieldID: 'Board' }]
        }
    },

    hook: {
        pageLoad() {
            syn.$w.transactionAction('LD01');
        }
    },

    event: {
        btnSearch_click(evt) {
            syn.$w.transactionAction('LD01');
        }
    }
}
```

- 객체 이름 `$BOD010`은 파일 이름과 같습니다. 객체 속성은 `config`, `prop`, `transaction`, `hook`, `event`, `method`를 쓰며 필요한 것만 둡니다. 샘플 `BOD010`은 `transaction`, `hook`, `event`, `method`만 씁니다. 순서는 관례이고, 같은 모듈의 이웃 화면을 따르세요.
- 이벤트 핸들러 이름은 `{컨트롤ID}_{이벤트}`입니다. HTML에서 `syn-events`로 이벤트를 선언해야 호출됩니다.
- `inputs`의 `dataFieldID`는 HTML의 `<form syn-datafield="MainForm">`과 같아야 하고, `outputs`의 `dataFieldID`는 그리드의 `syn-datafield`와 같아야 합니다.
- 훅 시그니처와 호출 시점은 [화면 스크립트 구조](/docs/tutorial/화면동작과-거래연결/화면-스크립트-구조)와 [화면 JavaScript 작성 지침](/docs/information/resource/HandStack-화면-JavaScript-작성-지침)이 정본입니다.

## 2. 화면 HTML

`wwwroot/view/BOD/BOD010.html`에서 핵심만 줄였습니다.

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="visibility: hidden;">
    <form autocomplete="off" id="form1" syn-datafield="MainForm">
        <button type="button" id="btnSearch" syn-events="['click']" class="btn btn-secondary">조회</button>

        <input id="txtTitle" syn-datafield="Title" syn-options="{editType: 'text', belongID: ['LD01']}" type="text" class="form-control" maxlengthB="256">

        <syn_grid id="grdBoard" syn-datafield="Board" syn-options="{
            height: 420
            , columns: [
                ['ID', '게시글 ID', 100, false, 'text', false, 'center']
                , ['Title', '제목', 400, false, 'text', false, 'left']
                , ['Author', '작성자', 100, false, 'text', true, 'center']
            ]
            , readOnly: true
        }" syn-events="['afterSelectionEnd']"></syn_grid>
    </form>
    <script src="/js/syn.loader.js"></script>
</body>
</html>
```

- `<body style="visibility: hidden;">`와 `/js/syn.loader.js`는 로더 전제입니다.
- 입력 컨트롤은 `syn-datafield`(전송 필드 이름)와 `belongID`(어느 거래의 입력으로 수집될지)가 모두 있어야 서버로 값이 전달됩니다.
- 그리드 컬럼은 배열 튜플이며 `[필드, 헤더, 너비, 숨김, 타입, 읽기전용, 정렬]` 순서입니다(객체형은 해석되지 않습니다). 예제 UI 컴포넌트 선택(`syn_grid`, `syn_auigrid` 등)은 프로젝트의 기존 화면을 따르세요.
- 버튼과 그리드에 `syn-events`를 선언하지 않으면 `btnSearch_click` 같은 핸들러가 호출되지 않습니다.
- 마크업과 클래스 규칙은 [화면 HTML 작성 지침](/docs/information/resource/HandStack-화면-HTML-작성-지침)이 정본입니다.

## 3. 거래 계약

`transact/BOD/BOD010.json`(IDE 프로젝트는 `BOD010.txn`)에서 발췌했습니다. 서비스 하나가 화면의 거래 하나(`LD01`)에 대응합니다.

```json
{
    "Comment": "게시글 목록 거래",
    "Services": [
        {
            "ServiceID": "LD01",
            "Authorize": false,
            "ReturnType": "Json",
            "CommandType": "D",
            "TransactionScope": false,
            "Inputs": [
                { "ModelID": "Dynamic", "Fields": [], "TestValues": [], "DefaultValues": [], "Type": "Row", "BaseFieldMappings": [], "ParameterHandling": "Rejected" }
            ],
            "Outputs": [
                { "ModelID": "Dynamic", "Fields": [], "Type": "Grid" }
            ]
        }
    ],
    "Models": []
}
```

샘플은 입문용이라 `Authorize`가 `false`입니다. 업무 계약에 그대로 복사하지 말고 [거래 계약 명세](/docs/reference/거래-계약-명세)의 접근 제어를 따르세요.

## 4. SQL 계약

`dbclient/BOD/BOD010.xml`(IDE 프로젝트는 `BOD010.dbc`)에서 발췌했습니다.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<mapper xmlns="contract.xsd">
    <header>
        <datasource>DB01</datasource>
        <use>Y</use>
        <desc>게시판 Board 테이블 DDL 및 게시글 조회</desc>
    </header>
    <commands>
        <statement id="LD01" seq="0" use="Y" timeout="0" desc="분류, 기간, 제목을 기준으로 게시글 조회">
            <![CDATA[
SELECT B.ID, B.Category, B.Title, B.Author, B.DatePosted
FROM Board B
WHERE B.DatePosted BETWEEN @StartDate AND (@EndDate || '23:59:59')
    AND CASE WHEN @Title = '' THEN @Title ELSE B.Title END LIKE ('%' || @Title || '%')
ORDER BY B.ID DESC;
            ]]>
            <param id="@Title" type="String" length="-1" value="" />
            <param id="@StartDate" type="String" length="-1" value="" />
            <param id="@EndDate" type="String" length="-1" value="" />
        </statement>
    </commands>
</mapper>
```

- `header`의 `datasource`는 서버에 등록한 데이터 원본 ID(`DB01`)입니다. 애플리케이션·프로젝트·거래 ID는 계약 폴더 경로와 파일 이름이 정합니다.
- SQL은 데이터 원본의 DBMS 문법입니다. 샘플은 SQLite라 문자열 결합이 `||`이고, 같은 코드를 다른 DBMS에 옮기면 `CONCAT` 등 방언을 확인해야 합니다.
- 파라미터는 항상 `@Param` 바인딩으로 쓰고 `<param>`으로 선언합니다. `value=""`은 값이 없을 때의 기본값입니다.
- 저장 서비스에서 `Flag`(`C`/`U`/`D`)로 분기하는 `<if test>` 패턴은 [SQL 계약 작성](/docs/tutorial/dbclient-SQL계약/CRUD-계약-작성)을 보세요.
