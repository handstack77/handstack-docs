# coding-style

코딩 스타일

## 불변성 (매우 중요)

항상 새로운 객체를 생성하고, 절대 기존 객체를 변경(mutate)하지 마세요:

```javascript
// 잘못됨: 변경(Mutation) 발생
function updateUser(user, name) {
  user.name = name  // 변경됨!
  return user
}

// 올바름: 불변성(Immutability) 유지
function updateUser(user, name) {
  return {
    ...user,
    name
  }
}
```

## 파일 구조화

소규모 파일 다수 > 대규모 파일 소수:
- 높은 응집도, 낮은 결합도
- 보통 200-400 라인, 최대 800 라인
- 대형 컴포넌트에서 유틸리티 분리
- 타입이 아닌 기능/도메인별로 정리

## 에러 처리

항상 에러를 포괄적으로 처리하세요:

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('작업 실패:', error)
  throw new Error('사용자 친화적인 상세 메시지')
}
```

## 입력 유효성 검사

항상 사용자 입력을 검증하세요:

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
})

const validated = schema.parse(input)
```

## 코드 품질 체크리스트

작업 완료 표시 전 확인 사항:
- [ ] 코드가 읽기 쉽고 네이밍이 잘 되어 있는가
- [ ] 함수가 작게 유지되는가 (<50 라인)
- [ ] 파일이 집중된 역할을 하는가 (<800 라인)
- [ ] 중첩이 너무 깊지 않은가 (>4 레벨)
- [ ] 적절한 에러 처리가 되어 있는가
- [ ] console.log 문이 없는가
- [ ] 하드코딩된 값이 없는가
- [ ] 변경(mutation)이 없는가 (불변 패턴 사용)
