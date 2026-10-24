# 화면 스크립트 규칙

공식 지침(`information/resource/HandStack-화면-JavaScript-작성-지침`, `tutorial/화면동작과-거래연결/*`)과 업무 화면 수백 개에서 반복되는 관례, `syn.js` 소스 확인 결과를 합친 것이다.

## 목차
1. 객체 골격
2. hook 목록
3. 셸 버튼 연결
4. 조회·저장·삭제 표준 흐름
5. AUIGrid 조작
6. 팝업과 화면 간 통신
7. 직접 거래 호출
8. 알림·검증·공통 헬퍼
9. 크기 조정
10. 파일 형식

## 1. 객체 골격

```javascript
'use strict';
let $BOD010 = {
    config: {
        actionButtons: [{
            command: 'refresh', icon: 'refresh', text: '새로고침',
            action(evt) { location.reload(); }
        }]
    },

    prop: {
        activeRow: null,
        adjustHeight: 145
    },

    transaction: {
        LD01: {
            inputs: [{ type: 'Row', dataFieldID: 'MainForm' }],
            outputs: [{ type: 'Grid', dataFieldID: 'DataList' }]
        },
        MD01: {
            inputs: [{ type: 'List', dataFieldID: 'DataList' }],
            outputs: [{ type: 'Form', dataFieldID: 'Exception' }]
        }
    },

    hook: {
        frameEvent(eventName, jsonObject) {
            if (eventName == 'buttonCommand') {
                switch (jsonObject.actionID) {
                    case 'search': $this.method.search(); break;
                    case 'save': $this.method.save(); break;
                }
            }
        },
        pageLoad() { $this.method.search(); },
        pageResizing(dimension) { },
        beforeTransaction(transactConfig) { },
        afterTransaction(error, functionID, responseData, additionalData) { }
    },

    event: {
        btnSearch_click() { $this.method.search(); },
        grdList_afterSelectionEnd(elID, rowIndex, columnIndex, dataField, value) { }
    },

    method: {
        search() { syn.$w.transactionAction('LD01'); },
        save() { syn.$w.transactionAction('MD01'); }
    }
}
```

- 객체 이름은 `$` + 파일명이다. `$this`는 현재 화면 객체의 전역 별칭이다.
- 절 순서 관례: `extends`(필요 시) → `config` → `prop` → `transaction` → `hook` → `event` → `method`. 모든 절이 필수는 아니다. `transaction`이 `hook` 뒤에 오는 화면도 있다 — 기존 화면의 순서는 바꾸지 않는다.
- 화면 전용 상태는 `prop`, 서버에서 받은 저장소 값은 `$this.store.{dataSourceID}`.
- 한 거래 안의 설정 키: `inputs`, `outputs`(항목에 `clear: false` 선택), `callback`, `noProgress`, `functionID`(거래 키와 서버 서비스 ID가 다를 때), `options`(거래 호출 옵션 덮어쓰기).

## 2. hook 목록

| hook | 호출 시점·용도 |
|---|---|
| `pageLoad()` | 화면과 컨트롤 초기화가 끝난 뒤 한 번. 초기값 채우기, 첫 조회. `async`도 가능 |
| `pageFormInit()` / `pageComplete()` | 폼 초기화·로드 완료 시점의 추가 훅(필요한 화면만) |
| `pageResource(localeID)` | 다국어 리소스 적용 |
| `pageResizing(dimension)` | 셸 탭/창 크기 변경. `dimension`은 `windowWidth`, `windowHeight`, `tabWidth`, `tabHeight` |
| `pageVisible()` / `pageClosed()` | 셸 탭이 보일 때 / 닫히기 직전. `pageClosed`가 `false`를 반환하면 탭 닫기를 막는다(미저장 보호) |
| `frameEvent(eventName, jsonObject)` | 셸→화면 통지. `buttonCommand`(`actionID`: `search`/`save`/`delete`/`print`/`export`), `darkModeChanging`, `storegeChanging`, `sessionDestroy` |
| `beforeTransaction(transactConfig)` | 요청 전. `transactConfig.functionID`로 분기해 Flag 보정·검증. **`false` 반환 시 요청 중단** |
| `afterTransaction(error, functionID, responseData, additionalData, correlationID)` | 응답 반영 후(callback 규칙은 binding-rules 4절) |
| `outputDataBinding(functionID, responseFieldID, outputData)` | 출력 바인딩 직전 훅. 동적 열 생성처럼 출력 데이터를 가공할 때 |
| `beforeTrigger(elID, action, response)` / `afterTrigger(...)` | `triggerConfig`로 실행되는 컨트롤 동작(행 추가/삭제 등) 전후. **`false` 반환 시 취소** |
| `payLoadProperty(transactionID, functionID)` | 요청에 추가 속성을 싣는 훅 |

프레임워크가 호출하는 훅은 위 표와 `pageMatch(classInfix)`(반응형 중단점 변경), `windowLoad`, `extendLoad`다. 일부 화면이 쓰는 `controlInit`, `pageInit` 같은 이름은 해당 모듈의 셸/도메인 코드가 호출하는지 확인한 뒤 사용한다. `config.pageMappings`는 View Designer가 저장하는 거래 매핑 원본이며 `syn.$w.transactionExchange(colGroupID)`가 사용한다.

## 3. 셸 버튼 연결

- 셸 상단의 조회/저장/삭제/인쇄/내보내기 버튼은 **메뉴 항목의 `functions`(또는 `FnSearch/FnSave/…`)가 켜져 있을 때만 활성화**되고, 클릭하면 `frameEvent('buttonCommand', {actionID})`가 화면에 전달된다. 메뉴 설정과 화면의 `switch(actionID)`가 짝이다.
- 화면 고유 버튼은 `config.actionButtons`에 `{command, icon(Tabler 아이콘 이름), text, class, hidden, disabled, keyName, action(evt)}`로 등록한다. 셸이 이 목록으로 버튼을 그린다. 같은 동작의 버튼을 HTML에도 중복으로 만들지 않는다.
- `syn.$w.addUIButton`/`triggerUICommand`는 동적으로 셸 버튼을 추가·실행할 때 쓴다(기존 호출 사례를 따른다).

## 4. 조회·저장·삭제 표준 흐름

```javascript
hook: {
    beforeTransaction(transactConfig) {
        if (transactConfig.functionID == 'MD01') {
            const grid = 'grdList';
            if (syn.uicontrols.$auigrid.checkEditValue(grid) == false) {
                return false;
            }
        }
    },

    afterTransaction(error, functionID, responseData, additionalData) {
        if ($object.isNullOrUndefined(error) == false) {
            syn.$l.eventLog('$this.hook.afterTransaction', `${functionID}: ${JSON.stringify(error)}`, 'Warning');
            return;
        }

        if (functionID == 'LD01') {
            syn.uicontrols.$auigrid.selectCell('grdList', 0, 'Code');
        }
        else if (functionID == 'MD01') {
            if ($string.toBoolean($this.store.Exception.Error) == false) {
                syn.$w.notify('success', '저장 되었습니다');
                $this.method.search();
            }
            else {
                syn.$w.alert($this.store.Exception.Message);
            }
            syn.uicontrols.$data.clear('srcException');
        }
    }
},

event: {
    btnDelete_click() {
        const name = syn.uicontrols.$auigrid.getDataAtCell('grdList', $this.prop.activeRow, 'Name');
        if ($string.isNullOrEmpty(name) == false) {
            const alertOptions = $object.clone(syn.$w.alertOptions);
            alertOptions.icon = 'question';
            alertOptions.buttonType = '3';
            syn.$w.alert(`'${name}'을(를) 삭제하시겠습니까?`, '삭제 확인', alertOptions, (result) => {
                if (result == 'Yes') {
                    syn.$w.transactionAction('DD01');
                }
            });
        }
    }
}
```

- 저장 성공 판정은 `Exception.Error`처럼 서버가 약속한 필드로 한다. 값은 `'N'`/`'Y'` 문자열이거나 SQL 오류 번호(숫자)일 수 있어 `$string.toBoolean`을 거친다(`'N'`이나 `'0'`을 JS 참/거짓으로 직접 판정하지 않는다). 서버 계약이 `Exception` 출력을 쓰지 않으면 `error` 인자와 빈 결과를 따로 처리한다.
- 저장 후에는 코드 캐시가 바뀌었다면 `syn.$w.codeCacheClear()`, 재조회, 선택 행 복원(`getRowIndexByValue` 후 `selectCell`) 순으로 처리한다.
- 삭제는 확인 대화상자를 거치고, 부모 키가 있으면 키가 비었을 때 호출하지 않는다.

## 5. AUIGrid 조작

`syn.uicontrols.$auigrid.*`(`elID`는 컨트롤 id). 자주 쓰는 것:

| 목적 | 호출 |
|---|---|
| 셀 읽기/쓰기 | `getDataAtCell(id,row,field)` / `setDataAtCell(id,row,field,v)`, `setDataAtRow` |
| 행 수·선택 | `countRows(id)`, `getActiveRowIndex(id)`, `selectCell(id,row,field)`, `getRowIndexByValue(id,field,v)` |
| 행 상태 | `getFlag(id,row)` / `setFlag(id,row,'U')`, `isUpdateData(id)` |
| 행 추가/삭제 | `insertRow(id,{values,index})`, `removeRow(id,field,row)` |
| 검증 | `checkEditValue(id)`, `checkEmptyValueCol`, `checkUniqueValueCol` |
| 열 | `propToCol`, `visibleColumns(id,[fields],bool)`, `setColumnWidth`, `changeColumnLayout` |
| 필터·정렬 | `addCondition`, `addMultiCondition`, `clearConditions`, `setSorting` |
| 크기·초기화 | `setControlSize(id,{height})`, `clear(id)`, `render(id)` |
| 내보내기 | `exportFile(id,options)`, `getGridData` |

- 편집 그리드의 행 Flag는 그리드 API를 통해서만 바꾼다. 부모/자식 구조에서 자식이 바뀌면 부모 행을 `setFlag(...,'U')`로 표시해 저장 거래가 부모도 갱신하게 하는 패턴이 흔하다(`beforeTransaction`에서 처리).
- 선택 이벤트 `afterSelectionEnd(elID, rowIndex, columnIndex, dataField, value)`에서는 이전 행과 같은지 비교하고 다를 때만 하위 조회를 호출한다.
- 그리드 `filtering` 이벤트에서는 활성 행 캐시(`prop.activeRow`)를 초기화한다. 행 번호를 영속 키로 쓰지 않는다.
- `hook.beforeTrigger`에서 부모 행이 신규(`C`)이거나 미선택이면 자식 행 추가를 막는 식으로 업무 규칙을 넣는다.

## 6. 팝업과 화면 간 통신

```javascript
let dialogOptions = $object.clone(syn.$w.dialogOptions);
dialogOptions.minWidth = 1100;
dialogOptions.minHeight = 700;
dialogOptions.caption = '상세 정보';
dialogOptions.close = true;

// iframe 화면 팝업: 쿼리스트링으로 값을 전달, 닫을 때 결과를 콜백으로 받는다
const url = `${syn.$w.proxyBasePath}/{모듈}/view/{App}/{Project}/BOD011.html?postID=${postID}`;
syn.$w.showUIDialog(url, dialogOptions, (result) => {   // options는 필수(caption·minHeight를 읽는다)
    if ($string.isNullOrEmpty(result) == false) {
        $this.method.search();
    }
});

// 같은 화면 안의 simplemodal 조각
syn.$w.showDialog(syn.$l.get('tplDetail'), dialogOptions);
```

- `showDialog(el, options, callback)`은 `syn.$w.dialogResult`로 닫을 때 결과를 보관하고, 콜백은 닫힌 뒤 호출된다. 팝업 제목 `h3`가 드래그 손잡이다.
- 팝업 화면에서 값 읽기: `syn.$r.query('postID')`. 닫기: `parent.syn.$w.closeDialog('save')`(iframe 팝업) 또는 `syn.$w.closeDialog(result)`(조각).
- 저장 성공 뒤에만 닫아 입력 내용 손실을 막는다.
- 별도 창 방식: `syn.$w.windowOpen(windowID, popupOptions)` + `popupOptions.notifyActions.push({actionID:'response', handler})`, 팝업은 `syn.$n.emit('response')`, 부모는 `syn.$n.call(windowID,'request', data)`로 데이터 전달.
- URL의 업무 경로(`/{모듈}/view/...`)는 이웃 화면의 호출 방식을 그대로 복사한다. 하드코딩한 호스트·포트를 쓰지 않는다.

## 7. 직접 거래 호출

화면의 `transaction`에 정의하지 않고 다른 업무의 거래(코드 목록 등)를 즉시 호출할 때:

```javascript
syn.$w.transactionDirect({
    programID: syn.Config.ApplicationID,
    businessID: 'ABC',            // 대상 거래의 ProjectID
    transactionID: 'ABC000',      // 대상 거래의 TransactionID
    functionID: 'LD01',
    dataMapInterface: '|Grid',    // '입력형식|출력형식' (입력이 없으면 비움)
    inputObjects: [{ prop: 'GroupCode', val: 'STATUS' }]
}, (responseData, additionalData) => {
    if (responseData && responseData.length > 0) {
        const rows = responseData[0].value;
    }
});
```

- `responseData`는 `[{id, value}, …]` 형태이며 `value`가 Form이면 객체, Grid이면 배열이다.
- 대상 모듈/프로젝트에 대한 의존이 생긴다. 대상 `.txn`의 `Authorize`/`AccessScreenID`를 이 화면 ID가 통과하는지 확인하고, 다른 모듈의 계약을 이쪽으로 복제하지 않는다.
- 호출 인자 중 `businessID`가 화면 자신의 프로젝트와 다른 경우를 "모듈 간 호출"로 문서화한다.

## 8. 알림·검증·공통 헬퍼

- 알림(도메인 계층 `syn.domain.js` 정의): `syn.$w.notify(type, msg, title, options)`(비차단, type은 `debug|information|success|warning|error|fatal`, 자동 숨김 기본 3초), `syn.$w.alert(msg, title, options, callback)`(`options=$object.clone(syn.$w.alertOptions)`; `icon`은 `debug|information|success|question|warning|error|fatal`, `buttonType`은 **문자열** `'1'` OK / `'2'` OK·Cancel / `'3'` Yes·No / `'4'` Yes·No·Cancel, 콜백 결과는 `'OK'|'Cancel'|'Yes'|'No'`), `syn.$w.statusMessage(msg)`(하단 상태줄), `syn.$w.progressMessage`/`closeProgressMessage`.
- 로그: `syn.$l.eventLog(원천, 메시지, 'Warning'|'Error'|…)`. 사용자 개인정보·토큰은 로그에 넣지 않는다.
- 값 접근: `syn.$l.get(id)`(요소), `syn.$l.getValue`, `syn.$m.addClass/removeClass/setStyle`(`hidden` 토글), `syn.$r.query(name)`(URL 쿼리), `syn.$w.User`/`syn.$w.Variable`(로그인 사용자·세션 변수 — 존재하는 키는 로그인/셸 코드로 확인), `syn.Config.ApplicationID` 등.
- 문자열·객체 헬퍼: `$string.isNullOrEmpty/toBoolean`, `$object.isNullOrUndefined/clone`, `$date`, `$array`, `$number`.
- 클라이언트 검증은 서버 호출을 줄이는 용도이다. 필수값·형식·중복은 서버(SQL/함수)에서도 확인하고 업무 오류를 `Exception` 출력으로 돌려받는다.

## 9. 크기 조정

```javascript
pageResizing(dimension) {
    const height = dimension.tabHeight - $this.prop.adjustHeight;
    syn.uicontrols.$auigrid.setControlSize('grdList', { height: height < 300 ? 300 : height });
}
```

`adjustHeight`는 그리드 위 영역(헤더, 검색 카드, 여백) 높이의 합이다. 화면 구성을 바꾸면 이 값을 다시 맞춘다. 셸 탭 안에서 열리는 화면은 `tabHeight`, 단독 창은 `windowHeight`가 맞다. 팝업(iframe)에서는 셸이 호출하지 않으므로 필요하면 직접 `window` 크기를 읽는다.

## 10. 파일 형식

- 기존 파일의 인코딩(UTF-8 BOM 여부)·줄바꿈(CRLF/LF)·들여쓰기(4칸)를 유지한다.
- 파일 맨 위는 `'use strict';`.
- `==`/`!=` 비교를 쓰는 코드베이스가 많다. 기존 비교 스타일과 불리언 비교 방식(`== false`)을 따른다.
- 사용자 대면 문구는 한국어, 식별자는 영어. 신규 코드에 주석을 추가하지 않는 지침이 있으면 따른다.
