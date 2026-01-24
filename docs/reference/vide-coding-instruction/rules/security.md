# security

보안 가이드라인

## 필수 보안 점검

모든 커밋 전 확인 사항:
- [ ] 하드코딩된 비밀 정보 없음 (API 키, 비밀번호, 토큰)
- [ ] 모든 사용자 입력 검증됨
- [ ] SQL 인젝션 방지 (파라미터화된 쿼리 사용)
- [ ] XSS 방지 (HTML 새니타이징)
- [ ] CSRF 보호 활성화됨
- [ ] 인증/인가 검증됨
- [ ] 모든 엔드포인트에 속도 제한(Rate limiting) 적용
- [ ] 에러 메시지가 민감한 정보를 노출하지 않음

## 비밀 정보 관리

```typescript
// 절대 금지: 하드코딩된 비밀 정보
const apiKey = "sk-proj-xxxxx"

// 항상 준수: 환경 변수 사용
const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY가 설정되지 않았습니다')
}
```

## 보안 대응 프로토콜

보안 문제 발견 시:
1. 즉시 작업 중단
2. **security-reviewer** 에이전트 사용
3. 진행하기 전 치명적인(CRITICAL) 이슈 수정
4. 노출된 모든 비밀 정보 교체(Rotate)
5. 전체 코드베이스에서 유사한 문제 검토
