# git-workflow

Git 워크플로우

## 커밋 메시지 형식

```
<type>: <description>

<optional body>
```

유형(Types): feat, fix, refactor, docs, test, chore, perf, ci

참고: ~/.claude/settings.json을 통해 전역적으로 기여(Attribution) 비활성화됨.

## 풀 리퀘스트(PR) 워크플로우

PR 생성 시:
1. 전체 커밋 내역 분석 (최신 커밋만이 아님)
2. `git diff [base-branch]...HEAD`를 사용하여 모든 변경 사항 확인
3. 포괄적인 PR 요약 초안 작성
4. TODO가 포함된 테스트 계획 포함
5. 새 브랜치인 경우 `-u` 플래그와 함께 푸시

## 기능 구현 워크플로우

1. **계획 우선 (Plan First)**
   - **planner** 에이전트를 사용하여 구현 계획 수립
   - 의존성 및 리스크 식별
   - 단계별 세분화

2. **TDD 접근 방식**
   - **tdd-guide** 에이전트 사용
   - 테스트 먼저 작성 (RED)
   - 테스트 통과를 위한 구현 (GREEN)
   - 리팩토링 (IMPROVE)
   - 80% 이상 커버리지 검증

3. **코드 리뷰**
   - 코드 작성 직후 **code-reviewer** 에이전트 사용
   - 치명적(CRITICAL) 및 높음(HIGH) 수준 이슈 해결
   - 가능한 경우 중간(MEDIUM) 수준 이슈 수정

4. **커밋 & 푸시**
   - 상세한 커밋 메시지
   - 컨벤셔널 커밋 형식 준수
