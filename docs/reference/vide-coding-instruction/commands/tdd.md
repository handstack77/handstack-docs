---
description: 테스트 주도 개발(TDD) 워크플로우를 강제합니다. 인터페이스를 스캐폴딩하고, 테스트를 '먼저' 생성한 다음, 통과하기 위한 최소한의 코드를 구현합니다. 80% 이상의 커버리지를 보장합니다.
---

# tdd

TDD 명령어 (TDD Command)

이 명령어는 테스트 주도 개발 방법론을 강제하기 위해 **tdd-guide** 에이전트를 호출합니다.

## 이 명령어가 하는 일

1. **인터페이스 스캐폴딩** - 타입/인터페이스 먼저 정의
2. **테스트 먼저 생성** - 실패하는 테스트 작성 (RED)
3. **최소 코드 구현** - 통과할 만큼만 작성 (GREEN)
4. **리팩토링** - 테스트 통과를 유지하며 코드 개선 (REFACTOR)
5. **커버리지 검증** - 80% 이상의 테스트 커버리지 보장

## 사용 시점

다음 경우에 `/tdd`를 사용하세요:
- 새로운 기능 구현 시
- 새로운 함수/컴포넌트 추가 시
- 버그 수정 시 (버그를 재현하는 테스트 먼저 작성)
- 기존 코드 리팩토링 시
- 핵심 비즈니스 로직 구축 시

## 작동 방식

tdd-guide 에이전트는 다음을 수행합니다:

1. 입력/출력에 대한 **인터페이스 정의**
2. **실패할 테스트 작성** (아직 코드가 없으므로)
3. **테스트 실행** 및 올바른 이유로 실패하는지 검증
4. 테스트를 통과시키기 위한 **최소 구현 작성**
5. **테스트 실행** 및 통과 검증
6. 테스트 통과를 유지하며 코드 **리팩토링**
7. **커버리지 확인** 및 80% 미만일 경우 테스트 추가

## TDD 주기

```
RED → GREEN → REFACTOR → REPEAT

RED:      실패하는 테스트 작성
GREEN:    통과하기 위한 최소한의 코드 작성
REFACTOR: 코드 개선, 테스트 통과 유지
REPEAT:   다음 기능/시나리오
```

## 사용 예시

```
User: /tdd 마켓 유동성 점수를 계산하는 함수가 필요해

Agent (tdd-guide):
# TDD 세션: 마켓 유동성 점수 계산기

## 1단계: 인터페이스 정의 (SCAFFOLD)

```typescript
// lib/liquidity.ts
export interface MarketData {
  totalVolume: number
  bidAskSpread: number
  activeTraders: number
  lastTradeTime: Date
}

export function calculateLiquidityScore(market: MarketData): number {
  // TODO: Implementation
  throw new Error('Not implemented')
}
```

## 2단계: 실패하는 테스트 작성 (RED)

```typescript
// lib/liquidity.test.ts
import { calculateLiquidityScore } from './liquidity'

describe('calculateLiquidityScore', () => {
  it('should return high score for liquid market', () => {
    const market = {
      totalVolume: 100000,
      bidAskSpread: 0.01,
      activeTraders: 500,
      lastTradeTime: new Date()
    }

    const score = calculateLiquidityScore(market)

    expect(score).toBeGreaterThan(80)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('should return low score for illiquid market', () => {
    const market = {
      totalVolume: 100,
      bidAskSpread: 0.5,
      activeTraders: 2,
      lastTradeTime: new Date(Date.now() - 86400000) // 1 day ago
    }

    const score = calculateLiquidityScore(market)

    expect(score).toBeLessThan(30)
    expect(score).toBeGreaterThanOrEqual(0)
  })

  it('should handle edge case: zero volume', () => {
    const market = {
      totalVolume: 0,
      bidAskSpread: 0,
      activeTraders: 0,
      lastTradeTime: new Date()
    }

    const score = calculateLiquidityScore(market)

    expect(score).toBe(0)
  })
})
```

## 3단계: 테스트 실행 - 실패 확인 (FAIL)

```bash
npm test lib/liquidity.test.ts

FAIL lib/liquidity.test.ts
  ✕ should return high score for liquid market (2 ms)
    Error: Not implemented

1 test failed, 0 passed
```

✅ 예상대로 테스트 실패함. 구현 준비 완료.

## 4단계: 최소 코드 구현 (GREEN)

```typescript
// lib/liquidity.ts
export function calculateLiquidityScore(market: MarketData): number {
  // Handle zero volume edge case
  if (market.totalVolume === 0) {
    return 0
  }

  // Calculate component scores (0-100 scale)
  const volumeScore = Math.min(market.totalVolume / 1000, 100)
  const spreadScore = Math.max(100 - (market.bidAskSpread * 1000), 0)
  const traderScore = Math.min(market.activeTraders / 10, 100)

  // Recent activity bonus
  const hoursSinceLastTrade = (Date.now() - market.lastTradeTime.getTime()) / (1000 * 60 * 60)
  const recencyScore = Math.max(100 - (hoursSinceLastTrade * 10), 0)

  // Weighted average
  const score = (
    volumeScore * 0.4 +
    spreadScore * 0.3 +
    traderScore * 0.2 +
    recencyScore * 0.1
  )

  return Math.min(Math.max(score, 0), 100) // Clamp to 0-100
}
```

## 5단계: 테스트 실행 - 통과 확인 (PASS)

```bash
npm test lib/liquidity.test.ts

PASS lib/liquidity.test.ts
  ✓ should return high score for liquid market (3 ms)
  ✓ should return low score for illiquid market (2 ms)
  ✓ should handle edge case: zero volume (1 ms)

3 tests passed
```

✅ 모든 테스트 통과!

## 6단계: 리팩토링 (IMPROVE)

```typescript
// lib/liquidity.ts - 상수와 더 나은 가독성으로 리팩토링됨
const WEIGHTS = {
  VOLUME: 0.4,
  SPREAD: 0.3,
  TRADERS: 0.2,
  RECENCY: 0.1,
} as const

const SCALE_FACTORS = {
  VOLUME: 1000,
  SPREAD: 1000,
  TRADERS: 10,
  RECENCY_PENALTY: 10,
} as const

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function calculateLiquidityScore(market: MarketData): number {
  if (market.totalVolume === 0) return 0

  const volumeScore = Math.min(market.totalVolume / SCALE_FACTORS.VOLUME, 100)
  const spreadScore = clamp(100 - (market.bidAskSpread * SCALE_FACTORS.SPREAD), 0, 100)
  const traderScore = Math.min(market.activeTraders / SCALE_FACTORS.TRADERS, 100)

  const hoursSinceLastTrade = (Date.now() - market.lastTradeTime.getTime()) / (1000 * 60 * 60)
  const recencyScore = clamp(100 - (hoursSinceLastTrade * SCALE_FACTORS.RECENCY_PENALTY), 0, 100)

  const weightedScore =
    volumeScore * WEIGHTS.VOLUME +
    spreadScore * WEIGHTS.SPREAD +
    traderScore * WEIGHTS.TRADERS +
    recencyScore * WEIGHTS.RECENCY

  return clamp(weightedScore, 0, 100)
}
```

## 7단계: 테스트 여전히 통과하는지 검증

```bash
npm test lib/liquidity.test.ts

PASS lib/liquidity.test.ts
  ✓ should return high score for liquid market (3 ms)
  ✓ should return low score for illiquid market (2 ms)
  ✓ should handle edge case: zero volume (1 ms)

3 tests passed
```

✅ 리팩토링 완료, 테스트 여전히 통과함!

## 8단계: 커버리지 확인

```bash
npm test -- --coverage lib/liquidity.test.ts

File           | % Stmts | % Branch | % Funcs | % Lines
---------------|---------|----------|---------|--------
liquidity.ts   |   100   |   100    |   100   |   100

Coverage: 100% ✅ (Target: 80%)
```

✅ TDD 세션 완료!
```

## TDD 모범 사례

**DO:**
- ✅ 구현 전 반드시 테스트를 '먼저' 작성하세요
- ✅ 구현 전 테스트를 실행하고 '실패'하는지 확인하세요
- ✅ 테스트를 통과시키기 위한 최소한의 코드를 작성하세요
- ✅ 테스트가 통과된(Green) 후에만 리팩토링하세요
- ✅ 엣지 케이스와 에러 시나리오를 추가하세요
- ✅ 80% 이상의 커버리지를 목표로 하세요 (중요 코드는 100%)

**DON'T:**
- ❌ 테스트 전에 구현 코드를 작성하지 마세요
- ❌ 각 변경 후 테스트 실행을 건너뛰지 마세요
- ❌ 한 번에 너무 많은 코드를 작성하지 마세요
- ❌ 실패하는 테스트를 무시하지 마세요
- ❌ 구현 세부 사항을 테스트하지 마세요 (동작을 테스트하세요)
- ❌ 모든 것을 모킹(Mocking)하지 마세요 (통합 테스트 선호)

## 포함할 테스트 유형

**유닛 테스트** (함수 레벨):
- 행복한 경로(Happy path) 시나리오
- 엣지 케이스 (비어있음, null, 최대값)
- 에러 조건
- 경계값

**통합 테스트** (컴포넌트 레벨):
- API 엔드포인트
- 데이터베이스 작업
- 외부 서비스 호출
- 훅을 사용하는 React 컴포넌트

**E2E 테스트** (`/e2e` 명령어 사용):
- 핵심 사용자 흐름
- 다단계 프로세스
- 풀 스택 통합

## 커버리지 요구사항

- 모든 코드에 대해 **최소 80%**
- 다음 항목에 대해서는 **100% 필수**:
  - 금융 계산
  - 인증 로직
  - 보안 중요 코드
  - 핵심 비즈니스 로직

## 중요한 참고 사항

**필수 (MANDATORY)**: 테스트는 반드시 구현 '전'에 작성되어야 합니다. TDD 주기는 다음과 같습니다:

1. **RED** - 실패하는 테스트 작성
2. **GREEN** - 통과하도록 구현
3. **REFACTOR** - 코드 개선

절대 RED 단계를 건너뛰지 마세요. 테스트 없이는 절대 코드를 작성하지 마세요.

## 다른 명령어와의 통합

- 무엇을 만들지 이해하기 위해 먼저 `/plan` 사용
- 테스트와 함께 구현하기 위해 `/tdd` 사용
- 빌드 에러 발생 시 `/build-and-fix` 사용
- 구현을 리뷰하기 위해 `/code-review` 사용
- 커버리지를 검증하기 위해 `/test-coverage` 사용

## 관련 에이전트

이 명령어는 다음 위치의 `tdd-guide` 에이전트를 호출합니다:
`~/.claude/agents/tdd-guide.md`

그리고 다음 위치의 `tdd-workflow` 스킬을 참조할 수 있습니다:
`~/.claude/skills/tdd-workflow/`
