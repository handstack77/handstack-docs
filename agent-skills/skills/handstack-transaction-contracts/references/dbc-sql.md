# SQL 계약(.dbc) 규칙

XML 계약이다. 공식 문서 예제는 `.xml`, IDE 프로젝트는 `.dbc`. 내용 구조는 같다. 서버 구현은 `dbclient` 모듈의 `QueryDataClient`/`DatabaseMapper`이다.

## 목차
1. 파일 구조
2. statement와 seq
3. 파라미터
4. 동적 SQL
5. 오류(Exception) 결과 관례
6. 안전한 검색 조건(<filters>)
7. 방언·데이터 원본
8. 동시성과 원자성 (소스 기준)
9. 변경 체크리스트

## 1. 파일 구조

```xml
<?xml version="1.0" encoding="UTF-8"?>
<mapper xmlns="contract.xsd">
    <header>
        <application>HDS</application>
        <project>BOD</project>
        <transaction>BOD010</transaction>
        <datasource>DB01</datasource>
        <use>Y</use>
        <desc>게시글 관리</desc>
    </header>
    <commands>
        <statement id="LD01" seq="0" desc="목록 조회">
            <![CDATA[
SELECT B.PostID, B.Title, B.CreatedAt
FROM Board B
WHERE B.Title LIKE '%' + @Title + '%'
ORDER BY B.CreatedAt DESC;
            ]]>
            <param id="@Title" type="String" length="100" value="NULL" />
        </statement>
    </commands>
</mapper>
```

- `xmlns="contract.xsd"`, header 6요소(`application/project/transaction/datasource/use/desc`)를 유지한다. 위치는 `Contracts/dbclient/{App}/{Project}/{TransactionID}.dbc`.
- SQL 본문은 **항상 CDATA**로 감싼다(`<`, `&` 오류 방지). 동적 요소(`<if>`, `<filters>`, `<pretreatment>`)는 CDATA 바깥에 둔다.
- `datasource`는 서버 `DataSource`에 등록된 ID다. statement 단위 `datasource="…"` 덮어쓰기가 가능하다. 연결 문자열은 계약에 쓰지 않는다.
- **header `<use>`**: `N`이면 그 파일의 모든 statement를 로드하지 않는다. header의 `application/project/transaction`을 비우면 폴더·파일명(`{App}/{Project}/{ID}`)에서 보완한다. 선택 요소 `<isolation>`(예: `ReadCommitted`, `Serializable`)은 트랜잭션 격리 수준이다.
- statement 속성(선택): `desc`, `modified`, `timeout`(초, 0=기본값), `native`(공급자 네이티브 파라미터 경로), `datasource`(덮어쓰기), `before`/`after`/`fallback`(SQL 실행 전/후/실패 시 호출할 거래 `App|Project|Tx|Service`; before 실패 시 SQL을 실행하지 않고 오류). **dbclient는 statement의 `use`·`transactionlog` 속성을 읽지 않는다**(`transactionlog`는 graphclient·prompter 계약에서 읽는다) — 비활성화는 header `<use>` 또는 statement 삭제로 한다(function/command의 `use`는 별개).
- 기존 파일의 들여쓰기(탭/공백), 줄바꿈, BOM을 유지한다.

## 2. statement와 seq

- 서버 쿼리 ID = `ApplicationID|ProjectID|TransactionID|` + `id` + `seq`를 두 자리로 채운 값. `id="MD01" seq="1"` → `MD0101`. 화면은 `MD01`만 부른다.
- **같은 `id`의 여러 `seq`는 서비스 호출의 입력 묶음과 순서대로 짝이 된다.** 입력이 `[List A, List B]`면 `seq 0`이 A의 각 행에, `seq 1`이 B의 각 행에 실행된다. seq는 장식이 아니며 입력 순서(화면 `inputs` 순서)와 맞춰야 한다.
- `(id, seq)` 쌍은 파일 안에서 유일해야 한다. 같은 id의 seq 여러 개를 합치거나 지우지 않는다.
- **트랜잭션 범위**: `.txn`의 `TransactionScope=true`이면 한 요청의 모든 입력 묶음·statement가 **하나의 연결과 트랜잭션**을 공유한다(첫 입력 묶음이 연결을 열고 이후는 재사용). `false`이면 statement별로 자동 커밋된다.
- 한 서비스의 결과 집합 순서: 한 statement 안의 여러 `SELECT`는 선언 순서대로, 여러 seq는 seq 순서대로 반환된다. 화면 `outputs`와 같은 순서다.
- `IgnoreResult`/`BaseFieldMappings`로 앞 statement의 마지막 행을 다음 statement의 파라미터로 넘길 수 있다(문서 `reference/거래-계약-명세`의 "앞선 결과를 입력으로 전달").

## 3. 파라미터

```xml
<param id="@PostID"  type="String"   length="32"  value="NULL" />
<param id="@Amount"  type="Decimal"  length="-1"  value="NULL" />
<param id="@SortNo"  type="Int32"    length="-1"  value="NULL" />
<param id="@RowID"   type="String"   length="32"  value="@SUID" />
```

- `id`는 `@이름`(Cypher는 `$이름`). 화면 필드 이름 = 파라미터 이름(`@` 제외)이다. 대소문자까지 맞춘다.
- `type`: 관례적으로 `String`(대부분), `Int32`/`Int64`/`Decimal`/`DateTime`/`Date`, 공급자에 따라 `VarChar`/`NVarChar`. `length`는 문자열 길이, 길이 제한이 없으면 `-1`. 길이를 실제 컬럼보다 크게 두지 않는다.
- 파라미터 선택 속성: `required`, `direction`(`Input` 기본), `test`(IDE 테스트 값), `transform`.
- **기본값 `value`**: 요청에 값이 없거나 비어 있을 때 쓰인다.
  - `"NULL"` — 요청에 파라미터가 아예 없으면 **바인딩하지 않고**, 빈 문자열로 오면 **빈 문자열**을 바인딩한다(DB `NULL`이 아니다). 그래서 숫자·날짜 열에 넣을 때 `CASE WHEN @SortNo = '' THEN NULL ELSE @SortNo END`를 쓴다.
  - 특수 토큰: `@SUID`(순차 ID 32자리), `@GUID`, `@NOW`, `@UTCNOW`, `@TRUE`, `@FALSE`, `@DBNULL`(진짜 DB NULL).
  - 그 외 문자열은 그 값 자체가 기본값.
- **서버 주입 변수 `@$이름`**: 인증 토큰의 `Variable` 항목(예: 회사 번호, 사용자 번호)은 서버가 모든 입력 묶음에 `$이름` 필드로 추가한다(`<param id="@$CompanyNo" …/>`로 선언해 사용). 같은 이름을 클라이언트가 보내도 서버 값으로 대체되므로, **사용자·회사 같은 권한 범위 값은 화면 hidden 값 대신 이 변수를 쓰는 것이 안전**하다. 어떤 키가 토큰에 들어 있는지는 로그인 발급 코드로 확인한다. 정책 클레임은 `#` 접두사 필드로 같은 방식으로 주입된다.
- SQL에서 쓰는 모든 `@Param`을 선언한다. 선언되지 않은 파라미터는 바인딩되지 않아 실행 시 "변수 선언 필요" 오류가 난다. 반대로 SQL이 쓰지 않는 파라미터는 지운다.
- `@Flag`는 선언하지 않는다. 그리드 행의 `Flag`(C/U/D/R)는 `<if test>` 조건에서 이름 `Flag`로 직접 참조한다.

## 4. 동적 SQL

```xml
<statement id="MD01" seq="0">
    <if test="(Flag == 'C')"><![CDATA[INSERT INTO Board (PostID, Title, CreatedAt) VALUES (@PostID, @Title, GETDATE());]]></if>
    <if test="(Flag == 'U')"><![CDATA[UPDATE Board SET Title = @Title WHERE PostID = @PostID;]]></if>
    <if test="(Flag == 'D')"><![CDATA[DELETE FROM Board WHERE PostID = @PostID;]]></if>
    <param id="@PostID" type="String" length="32" value="NULL" />
    <param id="@Title"  type="String" length="200" value="NULL" />
</statement>

<statement id="LD02" seq="0">
    <![CDATA[SELECT * FROM Board B WHERE 1 = 1]]>
    <if test="(SearchType != '')"><![CDATA[ AND B.Type = @SearchType]]></if>
    <![CDATA[ ORDER BY B.CreatedAt DESC]]>
    <param id="@SearchType" type="String" length="10" value="NULL" />
</statement>
```

- `<if test="(표현식)">`의 변수는 `@` 없이 요청 필드 이름(`Flag`, `SearchType`)이다. 표현식은 **Dynamic LINQ**로 평가된다 — `and`/`or`(→`&&`/`||`), `==`/`!=`, 작은따옴표 문자열(→큰따옴표), `#`는 `$`로 치환된다. 빈 값 검사는 `!= ''`. 객체 파라미터는 `Obj.Prop`로 참조한다. 표현식 오류는 statement 실행 실패로 이어지니 단순하게 쓴다.
- `<bind name="X" value="표현식"/>`은 `if`/SQL에서 쓸 임시 변수를 만든다. `<foreach collection="List" item="i" open="(" close=")" separator=",">…</foreach>`는 JSON 배열 파라미터를 풀어 `IN (…)` 목록 등을 만든다(요소는 `${i}`/`#{i}`로 참조).
- C/U/D를 한 statement에 모으는 저장 패턴이 표준이다. 서버는 행마다 Flag에 맞는 분기만 실행한다. 행 Flag `R`(조회 상태)은 아무 분기에도 걸리지 않으므로 변경 없는 행은 실행되지 않는다.
- `<pretreatment resultType="Row">`는 본 SQL 전에 조회를 실행해 결과 컬럼을 `<if test>`에서 `pUSERID` 같은 이름으로 참조하게 한다(존재 여부 검사 후 INSERT/UPDATE 분기).
- `<outputmeta value="Col:string|길이;…">`는 결과 컬럼 메타를 선언한다(프롬프트/함수 결과에도 쓰임). 반환 컬럼을 바꾸면 함께 고친다.
- **SQL 본문 치환 토큰**: `@Param`은 DB 파라미터 **바인딩**(안전)이다. 반면 `#{Name}`은 값을 이스케이프(`'`→`''`)한 **문자열 리터럴로 SQL에 직접 삽입**하고, `${Name}`은 **무가공 텍스트로 삽입**한다(`$`로 시작하는 서버 변수는 이스케이프 없음). `${}`는 SQL 인젝션 위험이므로 허용 목록으로 검증된 식별자에만 제한적으로 쓰고, 값은 `@Param`을 쓴다.
- 문자열 접합으로 식별자(테이블·컬럼·정렬 방향)를 만들지 않는다. 고정 선택지는 `<if test="(SortType == 'D')">` 분기로 SQL을 나눈다.

## 5. 오류(Exception) 결과 관례

업무 규칙 위반(중복 키 등)을 예외 대신 결과로 돌려주는 계약은 `TRY/CATCH`로 감싼 뒤 항상 아래 5개 컬럼의 1행을 **첫 결과 집합**으로 반환한다.

```sql
DECLARE @ErrorStack NVARCHAR(4000) = '', @ErrorMessage NVARCHAR(1000) = '',
        @ErrorNumber INT = 0, @ErrorSeverity INT = 0, @ErrorType NVARCHAR(1000) = '';
BEGIN TRY
    INSERT INTO Board (PostID, Title) VALUES (@PostID, @Title);
END TRY
BEGIN CATCH
    SELECT @ErrorNumber = ERROR_NUMBER(), @ErrorSeverity = ERROR_SEVERITY(),
           @ErrorMessage = CONCAT(@PostID, N' 키가 이미 있습니다.'),
           @ErrorStack = ERROR_MESSAGE(), @ErrorType = 'Line: ' + CAST(ERROR_LINE() AS VARCHAR(10));
END CATCH;
SELECT @ErrorNumber AS Error, @ErrorSeverity AS Level, @ErrorMessage AS Message, @ErrorStack AS StackTrace, @ErrorType AS TypeMember;
```

- 화면은 `{type:'Form', dataFieldID:'Exception'}` 출력과 `syn_data(dataSourceID:'Exception', storeType:'Form')`로 받는다. 성공은 `Error`가 0(또는 `'N'`)이다.
- 사용자에게 보이는 `Message`에 키 값은 넣어도 토큰·연결 문자열·전체 개인정보는 넣지 않는다. `StackTrace`는 로그용이다.
- 이 관례를 쓰는 서비스에서는 Exception 집합이 첫 출력이다. 빈 결과·정상·실패 모두 같은 개수의 집합을 돌려준다.

## 6. 안전한 검색 조건(<filters>)

사용자가 조건을 조합하는 검색은 SQL을 받지 않고 JSON 조건 배열을 받는다.

```xml
<statement id="LD03" seq="0">
    <![CDATA[SELECT M.* FROM Message M WHERE M.IsDeleted = 0]]>
    <filters parameter="Filters" groupLogic="AND">
        <field groupID="user"    column="M.UserID"    type="String"   operators="eq,neq" />
        <field groupID="content" column="M.Text"      type="String"   operators="eq,contains,begins_with" />
        <field groupID="created" column="M.CreatedAt" type="DateTime" operators="gte,lt" />
    </filters>
    <param id="@Filters" type="String" length="-1" value="NULL" />
</statement>
```

- `column`은 별칭을 포함한 **단일 컬럼 식별자**만(함수·식·정렬 불가). 요청은 `[{groupID, logic, operator, key, value}]`를 JSON 문자열로 `Filters`에 담는다. `key`가 비교값이다.
- 지원 연산자 `eq neq lt lte gt gte begins_with ends_with contains not_contains`, 타입 `String AnsiString Int16/32/64 Decimal Double Single Boolean Date DateTime DateTime2 DateTimeOffset Time Guid`. 파라미터 이름 `Filter_main_*`/`Filter_pre_*`는 예약이다.
- 빈 값/누락은 조건을 추가하지 않고, 미등록 그룹·허용되지 않은 연산자·형 변환 실패는 오류다. 상세는 MCP `reference/api/modules/dbclient`의 JSON 배열 필터 절.

## 7. 방언·데이터 원본

- 지원: SQL Server, Oracle, MySQL/MariaDB, PostgreSQL, SQLite. 이웃 계약과 같은 방언을 쓰고, 한 계약에서 다른 방언으로 옮기지 않는다(T-SQL `ISNULL`/`GETDATE`/`TRY…CATCH`는 SQL Server 전용).
- 파라미터 접두 `@`는 서버가 공급자별로 변환한다(Oracle은 `:`). SQL 본문에서는 계약 관례 그대로 `@`를 쓴다.
- 데이터 원본 ID(`DB01`, `QWK01` 등)는 공급자 이름이 아니다. 실제 DB 종류는 서버 설정으로 확인한다.
- 테이블 생성·초기화 같은 DDL/데이터 파괴 SQL은 요청 범위일 때만 작성하고, 운영 DB에서 실행하지 않는다.

## 8. 동시성과 원자성 (소스 기준)

- `TransactionScope: true`(.txn)이면 모든 seq가 한 연결·트랜잭션이고, 예외 없이 끝나야 커밋한다. `false`면 statement마다 자동 커밋이다.
- 격리 수준은 header `<isolation>` → 데이터 원본 설정 → `ReadCommitted` 순이다. 값은 .NET `IsolationLevel` 이름(`ReadCommitted`, `RepeatableRead`, `Serializable`, `Snapshot`…)이며, 이름이 틀리면 트랜잭션이 시작되지 않는 것으로 읽힌다.
- 롤백은 **예외·명령 오류**에서만 일어난다. 5절의 `TRY/CATCH` + `Exception` 결과 관례는 정상 응답이므로 커밋된다. 한 서비스에 변경 seq가 둘 이상이면 오류 판정 뒤에 변경이 실행되지 않게 설계하거나, 전체 취소가 필요할 때 예외를 다시 던진다.
- 집계 한도·중복 방지·재시도 안전은 `handstack-rules-and-verification`의 `references/concurrency.md`(동시성·원자성·재시도)를 따른다.

## 9. 변경 체크리스트

- [ ] `(id, seq)` 유일, seq 순서 = 화면 inputs 순서
- [ ] SQL의 모든 `@Param`이 `<param>`으로 선언됨(그리고 반대도)
- [ ] 화면 필드 이름 ↔ 파라미터 이름 일치, belongID에 거래 ID 포함
- [ ] `SELECT` 순서 = 화면 outputs 순서, Exception 집합 위치 유지
- [ ] 숫자/날짜 빈 값 처리(`value="NULL"`은 빈 문자열)
- [ ] 변경 seq가 둘 이상이면 오류 반환 뒤 쓰기가 계속되지 않음(8절)
- [ ] CDATA, XML 파싱 성공, 파일 인코딩 유지
- [ ] 값은 바인딩, 식별자는 고정 분기/`<filters>` 허용 목록
