# handstack-patterns

Handstack 아키텍처 및 개발 패턴

Handstack 프레임워크는 프론트엔드(View)와 백엔드(Contract/XML)가 명확히 분리된 구조를 가집니다.

## 아키텍처 개요

### 1. View (프론트엔드)
- **위치:** `src/view/{Project}/{Module}/{ID}.js` 및 `.html`
- **기술:** HTML, JavaScript (ES6+), `syn` 라이브러리
- **구조:**
  - `HTML`: `syn_auigrid`, `syn_data` 등 커스텀 태그를 사용하여 UI 구성
  - `JS`: 전역 객체 `$CDM010` (ID와 동일) 내에 설정 및 로직 정의

### 2. Contract (백엔드)
- **위치:** `src/Contracts/dbclient/HDS/{Module}/{ID}.xml`
- **기술:** XML, SQL (MSSQL/T-SQL 기반)
- **구조:** `<statement>` 태그 내에 SQL 쿼리 정의 및 `<param>`으로 입력 매개변수 매핑

## 상세 구조

### View (JS) 객체 구조
`src/view/.../CDM010.js` 예시:

```javascript
let $CDM010 = {
    // 1. 설정 및 데이터 소스
    config: {
        dataSource: { ... },
        actionButtons: [ ... ]
    },

    // 2. 상태 관리 (React의 state와 유사)
    prop: {
        groupCode: null,
        activeRow: null
    },

    // 3. 트랜잭션 매핑 (중요)
    transaction: {
        LD01: { inputs: [...], outputs: [...] }, // 조회
        MD01: { inputs: [...], outputs: [] }     // 저장/수정
    },

    // 4. 생명주기 및 훅
    hook: {
        pageLoad() { ... },
        afterTransaction(error, functionID, response) { ... }
    },

    // 5. UI 이벤트 핸들러
    event: {
        btnSearch_click() { ... }
    },

    // 6. 비즈니스 로직
    method: {
        search() { syn.$w.transactionAction('LD01'); }
    }
}
```

### Contract (XML) 구조
`src/Contracts/.../CDM010.xml` 예시:

```xml
<mapper>
    <header>
        <application>HDS</application>
        <transaction>CDM010</transaction>
    </header>
    <commands>
        <!-- 조회 쿼리 -->
        <statement id="LD01">
            <![CDATA[ SELECT * FROM BaseCode WHERE ... ]]>
        </statement>

        <!-- 동적 쿼리 (MyBatis와 유사) -->
        <statement id="MD01">
            <if test="(Flag == 'C')">
                <![CDATA[ INSERT INTO ... ]]>
            </if>
            <param id="@GroupCode" type="String" />
        </statement>
    </commands>
</mapper>
```

## 데이터 흐름

1. **View**: `syn.$w.transactionAction('LD01')` 호출
2. **Framework**: `transaction` 설정에 따라 `LD01` ID를 가진 요청 전송
3. **Contract**: XML 파일에서 `id="LD01"`인 statement 실행
4. **View**: `hook.afterTransaction`에서 결과 처리 및 그리드 바인딩

## 개발 시 주의사항

- **ID 일치**: JS 파일명, 객체명(`$ID`), XML 파일명, XML 내 `transaction` 태그가 모두 일치해야 함.
- **Statement ID**: JS의 `transaction` 객체 키와 XML의 `statement id`가 정확히 일치해야 함.
- **SQL 문법**: T-SQL 문법을 따르며, 동적 쿼리 처리를 위해 `<if>` 태그 활용 가능.
