# test-coverage

테스트 커버리지 (Test Coverage)

테스트 커버리지를 분석하고 누락된 테스트를 생성합니다:

1. 커버리지와 함께 테스트 실행: npm test --coverage 또는 pnpm test --coverage

2. 커버리지 리포트 분석 (coverage/coverage-summary.json)

3. 80% 커버리지 임계값 미만인 파일 식별

4. 커버리지 부족 파일 각각에 대해:
   - 테스트되지 않은 코드 경로 분석
   - 함수에 대한 유닛 테스트 생성
   - API에 대한 통합 테스트 생성
   - 핵심 흐름에 대한 E2E 테스트 생성

5. 새 테스트 통과 확인

6. 전/후 커버리지 지표 표시

7. 프로젝트가 전체 커버리지 80% 이상 도달하도록 보장

다음에 집중:
- 행복한 경로(Happy path) 시나리오
- 에러 처리
- 엣지 케이스 (null, undefined, empty)
- 경계 조건
