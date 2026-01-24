---
name: security-review
description: 인증 추가, 사용자 입력 처리, 비밀 정보 작업, API 엔드포인트 생성, 또는 결제/민감한 기능 구현 시 이 스킬을 사용하세요. 포괄적인 보안 체크리스트와 패턴을 제공합니다.
---

# 보안 리뷰

이 스킬은 모든 코드가 보안 모범 사례를 따르도록 보장하고 잠재적인 취약점을 식별합니다.

## 활성화 시점

- 인증 또는 인가 구현 시
- 사용자 입력 또는 파일 업로드 처리 시
- 새로운 API 엔드포인트 생성 시
- 비밀 정보 또는 자격 증명 작업 시
- 결제 기능 구현 시
- 민감한 데이터 저장 또는 전송 시
- 타사 API 통합 시

## 보안 체크리스트

### 1. 비밀 정보 관리

#### ❌ 절대 금지
```typescript
const apiKey = "sk-proj-xxxxx"  // 하드코딩된 비밀 정보
const dbPassword = "password123" // 소스 코드 내 비밀번호
```

#### ✅ 항상 준수
```typescript
const apiKey = process.env.OPENAI_API_KEY
const dbUrl = process.env.DATABASE_URL

// 비밀 정보 존재 확인
if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

#### 검증 단계
- [ ] 하드코딩된 API 키, 토큰 또는 비밀번호 없음
- [ ] 모든 비밀 정보는 환경 변수에 있음
- [ ] `.env.local`이 .gitignore에 포함됨
- [ ] git 기록에 비밀 정보 없음
- [ ] 프로덕션 비밀 정보는 호스팅 플랫폼(Vercel, Railway)에 있음

### 2. 입력 유효성 검사

#### 항상 사용자 입력 검증
```typescript
import { z } from 'zod'

// 유효성 검사 스키마 정의
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150)
})

// 처리 전 검증
export async function createUser(input: unknown) {
  try {
    const validated = CreateUserSchema.parse(input)
    return await db.users.create(validated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors }
    }
    throw error
  }
}
```

#### 파일 업로드 유효성 검사
```typescript
function validateFileUpload(file: File) {
  // 크기 확인 (최대 5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('File too large (max 5MB)')
  }

  // 타입 확인
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type')
  }

  // 확장자 확인
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0]
  if (!extension || !allowedExtensions.includes(extension)) {
    throw new Error('Invalid file extension')
  }

  return true
}
```

#### 검증 단계
- [ ] 모든 사용자 입력이 스키마로 검증됨
- [ ] 파일 업로드 제한 (크기, 타입, 확장자)
- [ ] 쿼리에 사용자 입력 직접 사용 금지
- [ ] 화이트리스트 검증 (블랙리스트 아님)
- [ ] 에러 메시지가 민감한 정보를 노출하지 않음

### 3. SQL 인젝션 방지

#### ❌ 절대 금지: SQL 연결
```typescript
// 위험 - SQL 인젝션 취약점
const query = `SELECT * FROM users WHERE email = '${userEmail}'`
await db.query(query)
```

#### ✅ 항상 준수: 파라미터화된 쿼리 사용
```typescript
// 안전함 - 파라미터화된 쿼리
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userEmail)

// 또는 raw SQL 사용 시
await db.query(
  'SELECT * FROM users WHERE email = $1',
  [userEmail]
)
```

#### 검증 단계
- [ ] 모든 데이터베이스 쿼리에 파라미터화된 쿼리 사용
- [ ] SQL 내 문자열 연결 없음
- [ ] ORM/쿼리 빌더 올바르게 사용
- [ ] Supabase 쿼리가 적절히 새니타이징 됨

### 4. 인증 및 인가

#### JWT 토큰 처리
```typescript
// ❌ 잘못됨: localStorage (XSS에 취약)
localStorage.setItem('token', token)

// ✅ 올바름: httpOnly 쿠키
res.setHeader('Set-Cookie',
  `token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`)
```

#### 인가 확인
```typescript
export async function deleteUser(userId: string, requesterId: string) {
  // 항상 인가 먼저 확인
  const requester = await db.users.findUnique({
    where: { id: requesterId }
  })

  if (requester.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    )
  }

  // 삭제 진행
  await db.users.delete({ where: { id: userId } })
}
```

#### Row Level Security (Supabase)
```sql
-- 모든 테이블에 RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 데이터만 조회 가능
CREATE POLICY "Users view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- 사용자는 자신의 데이터만 업데이트 가능
CREATE POLICY "Users update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

#### 검증 단계
- [ ] 토큰이 httpOnly 쿠키에 저장됨 (localStorage 아님)
- [ ] 민감한 작업 전 인가 확인
- [ ] Supabase에서 Row Level Security 활성화
- [ ] 역할 기반 접근 제어 구현
- [ ] 세션 관리 안전함

### 5. XSS 방지

#### HTML 새니타이징
```typescript
import DOMPurify from 'isomorphic-dompurify'

// 항상 사용자 제공 HTML 새니타이징
function renderUserContent(html: string) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
    ALLOWED_ATTR: []
  })
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```

#### 콘텐츠 보안 정책 (Content Security Policy)
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' https://api.example.com;
    `.replace(/\s{2,}/g, ' ').trim()
  }
]
```

#### 검증 단계
- [ ] 사용자 제공 HTML 새니타이징
- [ ] CSP 헤더 구성
- [ ] 검증되지 않은 동적 콘텐츠 렌더링 없음
- [ ] React의 내장 XSS 보호 사용

### 6. CSRF 보호

#### CSRF 토큰
```typescript
import { csrf } from '@/lib/csrf'

export async function POST(request: Request) {
  const token = request.headers.get('X-CSRF-Token')

  if (!csrf.verify(token)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    )
  }

  // 요청 처리
}
```

#### SameSite 쿠키
```typescript
res.setHeader('Set-Cookie',
  `session=${sessionId}; HttpOnly; Secure; SameSite=Strict`)
```

#### 검증 단계
- [ ] 상태 변경 작업에 CSRF 토큰 사용
- [ ] 모든 쿠키에 SameSite=Strict 설정
- [ ] 이중 제출 쿠키(Double-submit cookie) 패턴 구현

### 7. 속도 제한 (Rate Limiting)

#### API 속도 제한
```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 윈도우당 100회 요청
  message: 'Too many requests'
})

// 라우트에 적용
app.use('/api/', limiter)
```

#### 비용이 많이 드는 작업
```typescript
// 검색에 대한 공격적인 속도 제한
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 10, // 분당 10회 요청
  message: 'Too many search requests'
})

app.use('/api/search', searchLimiter)
```

#### 검증 단계
- [ ] 모든 API 엔드포인트에 속도 제한 적용
- [ ] 비용이 많이 드는 작업에 더 엄격한 제한 적용
- [ ] IP 기반 속도 제한
- [ ] 사용자 기반 속도 제한 (인증됨)

### 8. 민감한 데이터 노출

#### 로깅
```typescript
// ❌ 잘못됨: 민감한 데이터 로깅
console.log('User login:', { email, password })
console.log('Payment:', { cardNumber, cvv })

// ✅ 올바름: 민감한 데이터 편집(Redact)
console.log('User login:', { email, userId })
console.log('Payment:', { last4: card.last4, userId })
```

#### 에러 메시지
```typescript
// ❌ 잘못됨: 내부 세부 정보 노출
catch (error) {
  return NextResponse.json(
    { error: error.message, stack: error.stack },
    { status: 500 }
  )
}

// ✅ 올바름: 일반적인 에러 메시지
catch (error) {
  console.error('Internal error:', error)
  return NextResponse.json(
    { error: 'An error occurred. Please try again.' },
    { status: 500 }
  )
}
```

#### 검증 단계
- [ ] 로그에 비밀번호, 토큰 또는 비밀 정보 없음
- [ ] 사용자에게 일반적인 에러 메시지 제공
- [ ] 상세 에러는 서버 로그에만 기록
- [ ] 사용자에게 스택 트레이스 노출 안 함

### 9. 블록체인 보안 (Solana)

#### 지갑 검증
```typescript
import { verify } from '@solana/web3.js'

async function verifyWalletOwnership(
  publicKey: string,
  signature: string,
  message: string
) {
  try {
    const isValid = verify(
      Buffer.from(message),
      Buffer.from(signature, 'base64'),
      Buffer.from(publicKey, 'base64')
    )
    return isValid
  } catch (error) {
    return false
  }
}
```

#### 트랜잭션 검증
```typescript
async function verifyTransaction(transaction: Transaction) {
  // 수신자 확인
  if (transaction.to !== expectedRecipient) {
    throw new Error('Invalid recipient')
  }

  // 금액 확인
  if (transaction.amount > maxAmount) {
    throw new Error('Amount exceeds limit')
  }

  // 사용자 잔액 충분 확인
  const balance = await getBalance(transaction.from)
  if (balance < transaction.amount) {
    throw new Error('Insufficient balance')
  }

  return true
}
```

#### 검증 단계
- [ ] 지갑 서명 검증됨
- [ ] 트랜잭션 세부 정보 검증됨
- [ ] 트랜잭션 전 잔액 확인
- [ ] 맹목적인 트랜잭션 서명 금지

### 10. 의존성 보안

#### 정기적인 업데이트
```bash
# 취약점 확인
npm audit

# 자동으로 수정 가능한 이슈 수정
npm audit fix

# 의존성 업데이트
npm update

# 오래된 패키지 확인
npm outdated
```

#### 잠금 파일 (Lock Files)
```bash
# 항상 잠금 파일 커밋
git add package-lock.json

# CI/CD에서 재현 가능한 빌드를 위해 사용
npm ci  # npm install 대신 사용
```

#### 검증 단계
- [ ] 의존성 최신 상태
- [ ] 알려진 취약점 없음 (npm audit clean)
- [ ] 잠금 파일 커밋됨
- [ ] GitHub에서 Dependabot 활성화됨
- [ ] 정기적인 보안 업데이트

## 보안 테스팅

### 자동화된 보안 테스트
```typescript
// 인증 테스트
test('requires authentication', async () => {
  const response = await fetch('/api/protected')
  expect(response.status).toBe(401)
})

// 인가 테스트
test('requires admin role', async () => {
  const response = await fetch('/api/admin', {
    headers: { Authorization: `Bearer ${userToken}` }
  })
  expect(response.status).toBe(403)
})

// 입력 유효성 검사 테스트
test('rejects invalid input', async () => {
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({ email: 'not-an-email' })
  })
  expect(response.status).toBe(400)
})

// 속도 제한 테스트
test('enforces rate limits', async () => {
  const requests = Array(101).fill(null).map(() =>
    fetch('/api/endpoint')
  )

  const responses = await Promise.all(requests)
  const tooManyRequests = responses.filter(r => r.status === 429)

  expect(tooManyRequests.length).toBeGreaterThan(0)
})
```

## 배포 전 보안 체크리스트

모든 프로덕션 배포 전:

- [ ] **비밀 정보**: 하드코딩된 비밀 정보 없음, 모두 환경 변수에 있음
- [ ] **입력 유효성 검사**: 모든 사용자 입력 검증됨
- [ ] **SQL 인젝션**: 모든 쿼리 파라미터화됨
- [ ] **XSS**: 사용자 콘텐츠 새니타이징됨
- [ ] **CSRF**: 보호 활성화됨
- [ ] **인증**: 적절한 토큰 처리
- [ ] **인가**: 역할 확인 적용됨
- [ ] **속도 제한**: 모든 엔드포인트에 활성화됨
- [ ] **HTTPS**: 프로덕션에서 강제됨
- [ ] **보안 헤더**: CSP, X-Frame-Options 설정됨
- [ ] **에러 처리**: 에러에 민감한 데이터 없음
- [ ] **로깅**: 민감한 데이터 로깅 안 됨
- [ ] **의존성**: 최신 상태, 취약점 없음
- [ ] **Row Level Security**: Supabase에서 활성화됨
- [ ] **CORS**: 적절히 설정됨
- [ ] **파일 업로드**: 검증됨 (크기, 타입)
- [ ] **지갑 서명**: 검증됨 (블록체인인 경우)

## 리소스

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/security)
- [Supabase Security](https://supabase.com/docs/guides/auth)
- [Web Security Academy](https://portswigger.net/web-security)

---

**기억하세요**: 보안은 선택 사항이 아닙니다. 하나의 취약점이 전체 플랫폼을 손상시킬 수 있습니다. 의심스러울 때는 안전한 쪽을 택하세요.
