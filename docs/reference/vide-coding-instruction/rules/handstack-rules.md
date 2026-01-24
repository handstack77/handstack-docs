# handstack-rules

Handstack 개발 규칙

Handstack 기반 프로젝트 개발 시 준수해야 할 규칙입니다.

## 파일 명명 규칙

- **View 파일**: `{모듈ID}{번호}.js`, `{모듈ID}{번호}.html` (예: `CDM010.js`)
- **Contract 파일**: `{모듈ID}{번호}.xml` (예: `CDM010.xml`)
- **JS 객체명**: 파일명과 동일하게 `$` 접두사 사용 (예: `let $CDM010 = { ... }`)

## 코드 스타일 (JavaScript)

### 1. 객체 구조 순서
유지보수성을 위해 JS 객체 속성은 다음 순서를 따릅니다:
1. `config`: 그리드, 버튼 등 정적 설정
2. `prop`: 페이지 상태 변수
3. `transaction`: 입출력 매핑
4. `hook`: 생명주기 메서드 (`pageLoad`, `pageResizing`, `afterTransaction`)
5. `event`: UI 이벤트 (`_click`, `_filtering`)
6. `method`: 사용자 정의 함수

### 2. 트랜잭션 ID 규칙
- **LD** (Load): 조회용 (예: `LD01`, `LD02`)
- **MD** (Modify/Manage): 저장/수정/삭제용 (예: `MD01`)
- **ID** (Insert/Init): 초기화 또는 단건 입력용
- **DD** (Delete): 삭제 전용 (선택적)

### 3. 변수 명명
- **syn 라이브러리 사용**: `syn.$w`, `syn.$l`, `syn.uicontrols` 등 프레임워크 제공 객체 사용
- **로컬 상태 접근**: `$this.prop`, `$this.store` 등을 통해 접근

## 코드 스타일 (XML/SQL)

### 1. 파라미터 정의
- 모든 입력 파라미터는 `<param>` 태그로 명시적 정의
- `type`, `length` 속성 필수 작성
- 예: `<param id="@CodeID" type="String" length="10" value="NULL" />`

### 2. CDATA 사용
- SQL 문은 반드시 `<![CDATA[ ... ]]>`로 감싸서 특수 문자 오류 방지

### 3. 동적 쿼리
- 조건부 쿼리는 `<if test="...">` 태그 사용
- Flag 값(`C`: 생성, `U`: 수정, `D`: 삭제)에 따른 분기 처리 권장

## 보안 및 성능

- **SQL Injection 방지**: 반드시 `@Param` 형태의 바인딩 변수 사용 (문자열 연결 금지)
- **N+1 문제**: `LD` 쿼리에서 가능한 조인을 사용하여 한 번에 데이터 조회 권장
- **그리드 페이징**: 대용량 데이터 조회 시 페이징 처리 필수 고려
