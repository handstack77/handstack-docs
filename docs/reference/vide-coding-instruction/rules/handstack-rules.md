# handstack-rules

Handstack 개발 규칙

> 파일 위치·식별자·계약 확장자의 기준은 [식별자와 파일 경로](/docs/reference/식별자와-파일-경로)입니다. 프로젝트 지침 파일 예시는 [AGENTS.md](/docs/reference/vide-coding-instruction/examples/AGENTS)를 보세요.

Handstack 기반 프로젝트 개발 시 준수해야 할 규칙입니다.

## 파일 명명 규칙

- **View 파일**: `{TransactionID}.js`, `{TransactionID}.html` (예: `BOD010.js`)
- **Contract 파일**: `{TransactionID}.xml` (IDE 프로젝트는 `.dbc`) (예: `BOD010.xml`)
- **JS 객체명**: 파일명과 동일하게 `$` 접두사 사용 (예: `let $BOD010 = { ... }`)

## 코드 스타일 (JavaScript)

### 1. 객체 구조 순서
같은 모듈의 이웃 화면이 쓰는 순서를 따르는 것이 원칙이며, 다음 순서가 흔한 관례입니다. 정본 지침의 골격 주석과 예제도 문서마다 순서가 조금 다르고, 모든 속성이 필수는 아닙니다(게시판 샘플 `BOD010`은 `transaction`, `hook`, `event`, `method`만 씁니다).
1. `config`: 그리드, 버튼 등 정적 설정
2. `prop`: 페이지 상태 변수
3. `transaction`: 입출력 매핑
4. `hook`: 생명주기 메서드 (`pageLoad`, `pageResizing`, `afterTransaction`)
5. `event`: UI 이벤트 (`_click`, `_filtering`)
6. `method`: 사용자 정의 함수

### 2. 트랜잭션 ID 규칙
접두어는 관례이며 서버 라우팅은 계약의 `CommandType`이 결정합니다. 첫 글자 의미와 둘째 글자 규칙은 [서비스 ID 접두어 관례](/docs/reference/식별자와-파일-경로#서비스-id-접두어-관례)를 따릅니다.

- **GD**: 단건 조회 (예: `GD01`)
- **LD**: 목록 조회 (예: `LD01`, `LD02`)
- **ID**: 단건 등록
- **UD**: 변경
- **MD**: 저장·수정 (`Flag`로 분기하는 저장 포함, 예: `MD01`)
- **DD**: 삭제
- **ZD**: 게시판 샘플의 테이블 초기화(DDL) 같은 보조 작업

### 3. 변수 명명
- **syn 라이브러리 사용**: `syn.$w`, `syn.$l`, `syn.uicontrols` 등 프레임워크 제공 객체 사용
- **로컬 상태 접근**: `$this.prop`, `$this.store` 등을 통해 접근

## 코드 스타일 (XML/SQL)

### 1. 파라미터 정의
- 모든 입력 파라미터는 `<param>` 태그로 명시적 정의
- `type`, `length` 속성 필수 작성
- 예: `<param id="@CodeID" type="String" length="10" value="NULL" />`. `value`는 값이 없을 때의 기본값이며 게시판 샘플은 `value=""`를 씁니다

### 2. CDATA 사용
- SQL 문은 반드시 `<![CDATA[ ... ]]>`로 감싸서 특수 문자 오류 방지

### 3. 동적 쿼리
- 조건부 쿼리는 `<if test="...">` 태그 사용
- 저장은 `Flag` 값(`C`: 생성, `U`: 수정, `D`: 삭제)으로 한 statement 안에서 분기하는 방식과 statement를 나누는 방식이 모두 쓰입니다. 게시판 샘플은 statement를 나눕니다. 이웃 계약의 방식을 따르세요

## 보안 및 성능

- **SQL Injection 방지**: 반드시 `@Param` 형태의 바인딩 변수 사용 (문자열 연결 금지)
- **N+1 문제**: `LD` 쿼리에서 가능한 조인을 사용하여 한 번에 데이터 조회 권장
- **그리드 페이징**: 대용량 데이터 조회 시 페이징 처리 필수 고려
