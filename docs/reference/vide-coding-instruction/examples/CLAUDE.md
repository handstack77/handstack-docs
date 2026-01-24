# CLAUDE.md

프로젝트 CLAUDE.md 예시

이것은 프로젝트 레벨의 CLAUDE.md 파일 예시입니다. 프로젝트 루트 디렉토리에 배치하세요.

## 프로젝트 개요

[프로젝트에 대한 간단한 설명 - 기능, 기술 스택 등]

## 핵심 규칙

### 1. 코드 조직화

- 적은 수의 큰 파일보다 다수의 작은 파일을 지향함
- 높은 응집도, 낮은 결합도 유지
- 파일당 보통 200-400 라인, 최대 800 라인 제한
- 타입이 아닌 기능/도메인별로 조직화

### 2. 코드 스타일

- 코드, 주석, 문서에 이모지 사용 금지
- 항상 불변성 유지 - 객체나 배열을 직접 수정하지 말 것
- 프로덕션 코드에 console.log 금지
- try/catch를 사용한 적절한 에러 처리
- Zod 등을 사용한 입력 유효성 검사

### 3. 테스트

- TDD: 테스트를 먼저 작성할 것
- 최소 80% 이상의 커버리지 유지
- 유틸리티에 대한 유닛 테스트 작성
- API에 대한 통합 테스트 작성
- 핵심 흐름에 대한 E2E 테스트 작성

### 4. 보안

- 하드코딩된 비밀 정보 금지
- 민감한 데이터는 환경 변수 사용
- 모든 사용자 입력 검증
- 파라미터화된 쿼리만 사용
- CSRF 보호 활성화

## 파일 구조

```
src/
|-- app/              # Next.js app router
|-- components/       # 재사용 가능한 UI 컴포넌트
|-- hooks/            # 커스텀 React 훅
|-- lib/              # 유틸리티 라이브러리
|-- types/            # TypeScript 정의
```

## 주요 패턴

### API 응답 형식

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
```

### 에러 처리

```typescript
try {
  const result = await operation()
  return { success: true, data: result }
} catch (error) {
  console.error('작업 실패:', error)
  return { success: false, error: '사용자 친화적인 메시지' }
}
```

## 환경 변수

```bash
# 필수 항목
DATABASE_URL=
API_KEY=

# 선택 항목
DEBUG=false
```

## 사용 가능한 명령어

- `/tdd` - 테스트 주도 개발 워크플로우
- `/plan` - 구현 계획 수립
- `/code-review` - 코드 품질 리뷰
- `/build-fix` - 빌드 에러 수정

## Git 워크플로우

- 컨벤셔널 커밋: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- main 브랜치에 직접 커밋 금지
- PR 생성 시 리뷰 필수
- 머지 전 모든 테스트 통과 필수
