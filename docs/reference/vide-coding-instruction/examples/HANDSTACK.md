# HANDSTACK.md

Handstack 프레임워크의 표준 코드 예시입니다.

## 1. View (JavaScript)

`src/view/IQA/CDM/CDM010.js` 스타일:

```javascript
'use strict';
let $CDM010 = {
    config: {
        // 정적 설정 (그리드 데이터소스, 버튼 등)
        dataSource: {
            TypeOptions: {
                CodeColumnID: 'Code',
                ValueColumnID: 'Name',
                DataSource: [{ Code: 'A', Name: 'Active' }, { Code: 'I', Name: 'Inactive' }]
            }
        },
        actionButtons: [
            { command: 'search', icon: 'search', text: '조회' },
            { command: 'save', icon: 'save', text: '저장' }
        ]
    },

    prop: {
        // 상태 변수
        activeRow: null,
        selectedCode: ''
    },

    transaction: {
        // 트랜잭션 매핑
        LD01: {
            inputs: [{ type: 'Row', dataFieldID: 'SearchForm' }],
            outputs: [{ type: 'Grid', dataFieldID: 'GridList' }]
        },
        MD01: {
            inputs: [{ type: 'List', dataFieldID: 'GridList' }],
            outputs: []
        }
    },

    hook: {
        // 생명주기
        pageLoad() {
            $this.method.search();
        },
        afterTransaction(error, functionID, response) {
            if (error) {
                syn.$w.alert('에러 발생: ' + error.message);
                return;
            }
            if (functionID === 'MD01') {
                syn.$w.notify('success', '저장되었습니다.');
                $this.method.search();
            }
        }
    },

    event: {
        // UI 이벤트
        btnSearch_click() {
            $this.method.search();
        }
    },

    method: {
        // 비즈니스 로직
        search() {
            syn.$w.transactionAction('LD01');
        },
        save() {
            syn.$w.transactionAction('MD01');
        }
    }
};
```

## 2. View (HTML)

`src/view/IQA/CDM/CDM010.html` 스타일:

```html
<!DOCTYPE html>
<html>
<body>
    <form id="form1" syn-datafield="MainForm">
        <div class="page-body">
            <!-- 검색 조건 -->
            <div class="card">
                <div class="card-body">
                    <input type="text" id="txtSearch" syn-events="['keydown']" />
                    <button id="btnSearch" class="btn btn-primary">조회</button>
                </div>
            </div>

            <!-- 그리드 -->
            <syn_auigrid id="grdGrid1" syn-datafield="GridList" syn-options="{
                columns: [
                    ['Code', '코드', 100],
                    ['Name', '이름', 200]
                ]
            }"></syn_auigrid>
        </div>
    </form>
</body>
</html>
```

## 3. Contract (XML)

`src/Contracts/dbclient/HDS/CDM/CDM010.xml` 스타일:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<mapper>
    <header>
        <application>HDS</application>
        <transaction>CDM010</transaction>
        <datasource>DB01</datasource>
    </header>
    <commands>
        <!-- 조회 -->
        <statement id="LD01">
            <![CDATA[
            SELECT Code, Name, Description, CreatedAt
            FROM CommonCode
            WHERE Code LIKE CONCAT('%', @SearchText, '%')
            ]]>
            <param id="@SearchText" type="String" length="50" />
        </statement>

        <!-- 저장 (입력/수정/삭제 분기) -->
        <statement id="MD01">
            <if test="(Flag == 'C')">
                <![CDATA[
                INSERT INTO CommonCode (Code, Name) VALUES (@Code, @Name)
                ]]>
            </if>
            <if test="(Flag == 'U')">
                <![CDATA[
                UPDATE CommonCode SET Name = @Name WHERE Code = @Code
                ]]>
            </if>
            <if test="(Flag == 'D')">
                <![CDATA[
                DELETE FROM CommonCode WHERE Code = @Code
                ]]>
            </if>
            <param id="@Code" type="String" length="10" />
            <param id="@Name" type="String" length="50" />
        </statement>
    </commands>
</mapper>
```
