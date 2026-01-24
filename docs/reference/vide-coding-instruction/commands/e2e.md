---
description: Playwright를 사용하여 E2E 테스트를 생성하고 실행합니다. 테스트 여정을 생성하고, 테스트를 실행하며, 스크린샷/비디오/트레이스를 캡처하고 아티팩트를 업로드합니다.
---

# e2e

E2E 명령어 (E2E Command)

이 명령어는 **e2e-runner** 에이전트를 호출하여 Playwright를 사용한 E2E(End-to-End) 테스트를 생성, 유지 관리 및 실행합니다.

## 이 명령어가 하는 일

1. **테스트 여정 생성** - 사용자 흐름에 대한 Playwright 테스트 생성
2. **E2E 테스트 실행** - 여러 브라우저에서 테스트 실행
3. **아티팩트 캡처** - 실패 시 스크린샷, 비디오, 트레이스 캡처
4. **결과 업로드** - HTML 보고서 및 JUnit XML
5. **불안정한(Flaky) 테스트 식별** - 불안정한 테스트 격리

## 사용 시점

다음 경우에 `/e2e`를 사용하세요:
- 핵심 사용자 여정 테스트 (로그인, 거래, 결제)
- 다단계 흐름이 끝까지 작동하는지 검증
- UI 상호작용 및 탐색 테스트
- 프론트엔드와 백엔드 간의 통합 검증
- 프로덕션 배포 준비

## 작동 방식

e2e-runner 에이전트는 다음을 수행합니다:

1. **사용자 흐름 분석** 및 테스트 시나리오 식별
2. POM(Page Object Model) 패턴을 사용하여 **Playwright 테스트 생성**
3. 여러 브라우저(Chrome, Firefox, Safari)에서 **테스트 실행**
4. 스크린샷, 비디오, 트레이스로 **실패 캡처**
5. 결과 및 아티팩트와 함께 **보고서 생성**
6. **불안정한 테스트 식별** 및 수정 권장

## 사용 예시

```
User: /e2e 마켓 검색 및 조회 흐름을 테스트해 줘

Agent (e2e-runner):
# E2E 테스트 생성: 마켓 검색 및 조회 흐름

## 식별된 테스트 시나리오

**사용자 여정:** 마켓 검색 → 결과 보기 → 마켓 클릭 → 상세 정보 보기

**테스트 커버리지:**
1. 마켓 페이지로 이동
2. 시맨틱 검색 수행
3. 검색 결과 검증
4. 첫 번째 결과 클릭
5. 마켓 상세 페이지 로드 검증
6. 차트 렌더링 검증

## 생성된 테스트 코드

```typescript
// tests/e2e/markets/search-and-view.spec.ts
import { test, expect } from '@playwright/test'
import { MarketsPage } from '../../pages/MarketsPage'
import { MarketDetailsPage } from '../../pages/MarketDetailsPage'

test.describe('Market Search and View Flow', () => {
  test('user can search markets and view details', async ({ page }) => {
    // 1. Navigate to markets page
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()

    // Verify page loaded
    await expect(page).toHaveTitle(/Markets/)
    await expect(page.locator('h1')).toContainText('Markets')

    // 2. Perform semantic search
    await marketsPage.searchMarkets('election')

    // Wait for API response
    await page.waitForResponse(resp =>
      resp.url().includes('/api/markets/search') && resp.status() === 200
    )

    // 3. Verify search results
    const marketCards = marketsPage.marketCards
    await expect(marketCards.first()).toBeVisible()
    const resultCount = await marketCards.count()
    expect(resultCount).toBeGreaterThan(0)

    // Take screenshot of search results
    await page.screenshot({ path: 'artifacts/search-results.png' })

    // 4. Click on first result
    const firstMarketTitle = await marketCards.first().textContent()
    await marketCards.first().click()

    // 5. Verify market details page loads
    await expect(page).toHaveURL(/\/markets\/[a-z0-9-]+/)

    const detailsPage = new MarketDetailsPage(page)
    await expect(detailsPage.marketName).toBeVisible()
    await expect(detailsPage.marketDescription).toBeVisible()

    // 6. Verify chart renders
    await expect(detailsPage.priceChart).toBeVisible()

    // Verify market name matches
    const detailsTitle = await detailsPage.marketName.textContent()
    expect(detailsTitle?.toLowerCase()).toContain(
      firstMarketTitle?.toLowerCase().substring(0, 20) || ''
    )

    // Take screenshot of market details
    await page.screenshot({ path: 'artifacts/market-details.png' })
  })

  test('search with no results shows empty state', async ({ page }) => {
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()

    // Search for non-existent market
    await marketsPage.searchMarkets('xyznonexistentmarket123456')

    // Verify empty state
    await expect(page.locator('[data-testid="no-results"]')).toBeVisible()
    await expect(page.locator('[data-testid="no-results"]')).toContainText(
      /no.*results|no.*markets/i
    )

    const marketCount = await marketsPage.marketCards.count()
    expect(marketCount).toBe(0)
  })

  test('can clear search and see all markets again', async ({ page }) => {
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()

    // Initial market count
    const initialCount = await marketsPage.marketCards.count()

    // Perform search
    await marketsPage.searchMarkets('trump')
    await page.waitForLoadState('networkidle')

    // Verify filtered results
    const filteredCount = await marketsPage.marketCards.count()
    expect(filteredCount).toBeLessThan(initialCount)

    // Clear search
    await marketsPage.searchInput.clear()
    await page.waitForLoadState('networkidle')

    // Verify all markets shown again
    const finalCount = await marketsPage.marketCards.count()
    expect(finalCount).toBe(initialCount)
  })
})
```

## 테스트 실행

```bash
# Run the generated test
npx playwright test tests/e2e/markets/search-and-view.spec.ts

Running 3 tests using 3 workers

  ✓  [chromium] › search-and-view.spec.ts:5:3 › user can search markets and view details (4.2s)
  ✓  [chromium] › search-and-view.spec.ts:52:3 › search with no results shows empty state (1.8s)
  ✓  [chromium] › search-and-view.spec.ts:67:3 › can clear search and see all markets again (2.9s)

  3 passed (9.1s)

Artifacts generated:
- artifacts/search-results.png
- artifacts/market-details.png
- playwright-report/index.html
```

## 테스트 리포트

```
╔══════════════════════════════════════════════════════════════╗
║                    E2E Test Results                          ║
╠══════════════════════════════════════════════════════════════╣
║ Status:     ✅ ALL TESTS PASSED                              ║
║ Total:      3 tests                                          ║
║ Passed:     3 (100%)                                         ║
║ Failed:     0                                                ║
║ Flaky:      0                                                ║
║ Duration:   9.1s                                             ║
╚══════════════════════════════════════════════════════════════╝

Artifacts:
📸 Screenshots: 2 files
📹 Videos: 0 files (only on failure)
🔍 Traces: 0 files (only on failure)
📊 HTML Report: playwright-report/index.html

View report: npx playwright show-report
```

✅ E2E 테스트 스위트가 CI/CD 통합 준비 완료되었습니다!
```

## 테스트 아티팩트

테스트 실행 시 다음 아티팩트가 캡처됩니다:

**모든 테스트:**
- 타임라인과 결과가 포함된 HTML 보고서
- CI 통합을 위한 JUnit XML

**실패 시에만:**
- 실패 상태의 스크린샷
- 테스트 비디오 녹화
- 디버깅을 위한 트레이스 파일 (단계별 재생)
- 네트워크 로그
- 콘솔 로그

## 아티팩트 보기

```bash
# 브라우저에서 HTML 보고서 보기
npx playwright show-report

# 특정 트레이스 파일 보기
npx playwright show-trace artifacts/trace-abc123.zip

# 스크린샷은 artifacts/ 디렉토리에 저장됩니다
open artifacts/search-results.png
```

## 불안정한 테스트 감지

테스트가 간헐적으로 실패하는 경우:

```
⚠️  FLAKY TEST DETECTED: tests/e2e/markets/trade.spec.ts

Test passed 7/10 runs (70% pass rate)

Common failure:
"Timeout waiting for element '[data-testid="confirm-btn"]'"

Recommended fixes:
1. Add explicit wait: await page.waitForSelector('[data-testid="confirm-btn"]')
2. Increase timeout: { timeout: 10000 }
3. Check for race conditions in component
4. Verify element is not hidden by animation

Quarantine recommendation: Mark as test.fixme() until fixed
```

## 브라우저 설정

기본적으로 여러 브라우저에서 테스트가 실행됩니다:
- ✅ Chromium (데스크톱 Chrome)
- ✅ Firefox (데스크톱)
- ✅ WebKit (데스크톱 Safari)
- ✅ Mobile Chrome (선택 사항)

브라우저를 조정하려면 `playwright.config.ts`에서 설정하세요.

## CI/CD 통합

CI 파이프라인에 추가하세요:

```yaml
# .github/workflows/e2e.yml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npx playwright test

- name: Upload artifacts
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## PMX 관련 중요 흐름 (PMX-Specific Critical Flows)

PMX의 경우 다음 E2E 테스트를 우선시하세요:

**🔴 치명적 (항상 통과해야 함):**
1. 사용자 지갑 연결 가능
2. 사용자 마켓 탐색 가능
3. 사용자 마켓 검색 가능 (시맨틱 검색)
4. 사용자 마켓 상세 정보 보기 가능
5. 사용자 거래 가능 (테스트 자금 사용)
6. 마켓 정상 해결 (resolve)
7. 사용자 자금 출금 가능

**🟡 중요:**
1. 마켓 생성 흐름
2. 사용자 프로필 업데이트
3. 실시간 가격 업데이트
4. 차트 렌더링
5. 마켓 필터링 및 정렬
6. 모바일 반응형 레이아웃

## 모범 사례

**DO:**
- ✅ 유지보수성을 위해 Page Object Model 사용
- ✅ 선택자에 data-testid 속성 사용
- ✅ 임의의 타임아웃 대신 API 응답 대기
- ✅ 핵심 사용자 여정을 끝까지(end-to-end) 테스트
- ✅ main 브랜치 병합 전 테스트 실행
- ✅ 테스트 실패 시 아티팩트 검토

**DON'T:**
- ❌ 깨지기 쉬운 선택자 사용 (CSS 클래스는 변경될 수 있음)
- ❌ 구현 세부 사항 테스트
- ❌ 프로덕션 환경에서 테스트 실행
- ❌ 불안정한 테스트 무시
- ❌ 실패 시 아티팩트 검토 건너뛰기
- ❌ 모든 엣지 케이스를 E2E로 테스트 (유닛 테스트 사용)

## 중요한 참고 사항

**PMX에 대해 중요:**
- 실제 돈이 관련된 E2E 테스트는 반드시 테스트넷/스테이징에서만 실행
- 프로덕션에 대해 거래 테스트 절대 실행 금지
- 금융 테스트에 `test.skip(process.env.NODE_ENV === 'production')` 설정
- 소액의 테스트 자금이 있는 테스트 지갑만 사용

## 다른 명령어와의 통합

- `/plan`을 사용하여 테스트할 핵심 여정 식별
- `/tdd`를 사용하여 유닛 테스트 (더 빠르고 세분화됨)
- `/e2e`를 사용하여 통합 및 사용자 여정 테스트
- `/code-review`를 사용하여 테스트 품질 검증

## 관련 에이전트

이 명령어는 다음 위치의 `e2e-runner` 에이전트를 호출합니다:
`~/.claude/agents/e2e-runner.md`

## 빠른 명령어

```bash
# 모든 E2E 테스트 실행
npx playwright test

# 특정 테스트 파일 실행
npx playwright test tests/e2e/markets/search.spec.ts

# 헤드 모드(브라우저 표시)로 실행
npx playwright test --headed

# 테스트 디버그
npx playwright test --debug

# 테스트 코드 생성
npx playwright codegen http://localhost:3000

# 보고서 보기
npx playwright show-report
```
