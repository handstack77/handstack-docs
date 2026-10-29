# dbclient SQL 계약 샘플

`TST010.xml`과 `TST011.xml`의 `length="-1"`은 공급자별 MAX 길이 정책을 사용합니다. 일반 바인딩과 native 바인딩 모두 입력값 전체를 전달하며, 실제 저장 한도는 컬럼 타입과 DB 설정을 따릅니다.

```xml
<param id="@Content" type="String" length="-1" value="NULL" />
```

Oracle에서 큰 LOB 값을 처리할 때는 native 계약의 타입을 `Clob`, `NClob`, `Blob`으로 명시합니다. `String` 또는 `Varchar2`가 자동으로 LOB 타입으로 바뀌지는 않습니다. 양수 `length`는 지정한 길이를 유지합니다.

상세 규칙: [dbclient 파라미터의 MAX 길이](/docs/reference/api/modules/dbclient#파라미터의-max-길이).
