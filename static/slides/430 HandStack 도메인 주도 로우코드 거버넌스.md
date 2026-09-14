---
marp: true
theme: gaia
_class: lead
footer: HandStack 도메인 주도 로우코드 거버넌스
paginate: true
backgroundColor: #fff
---

<style>
:root {
  font-family: 'Noto Sans KR', 'Pretendard', 'Nanum Gothic', 'Malgun Gothic', sans-serif;
  --ink: #10263d;
  --navy: #17344f;
  --blue: #2563eb;
  --cyan: #0891b2;
  --green: #15803d;
  --orange: #c2410c;
  --red: #b91c1c;
  --muted: #526174;
  --line: #cbd5e1;
  --panel: rgba(255, 255, 255, 0.76);
}

section {
  padding: 1.25rem 1.55rem;
  color: var(--ink);
  background-image:
    radial-gradient(circle at 92% 8%, rgba(37, 99, 235, 0.13), transparent 25%),
    linear-gradient(145deg, #f8fafc 0%, #e8eef5 100%);
  border-bottom: 1px solid #64748b;
}

section.lead {
  background-color: #17344f !important;
  background-image:
    linear-gradient(120deg, rgba(15, 38, 61, 0.97), rgba(23, 52, 79, 0.88)),
    radial-gradient(circle at 85% 20%, #2563eb, transparent 45%) !important;
  color: #f8fafc;
}

section.lead h1,
section.lead h2,
section.lead h3 { color: #f8fafc; }

h1 { font-size: 1.75em; color: var(--navy); border-bottom: 0; }
h2 { font-size: 1.35em; color: var(--navy); border-bottom: 4px solid var(--navy); }
h3 { font-size: 1.02em; color: var(--navy); margin: 0 0 0.3em; }
p, li { line-height: 1.4; }
strong { color: var(--blue); }
section.lead strong { color: #93c5fd; }

section::after {
  font-size: 0.62em;
  content: attr(data-marpit-pagination) " / " attr(data-marpit-pagination-total);
}

blockquote {
  margin: 0.55em 0;
  padding: 0.55em 0.8em;
  border-left: 7px solid var(--blue);
  background: rgba(255,255,255,0.72);
  color: var(--ink);
}

blockquote::before,
blockquote::after { content: ''; }

table {
  width: 100%;
  margin: 0.45em auto 0;
  border-collapse: collapse;
  font-size: 0.68em;
}

th, td {
  padding: 0.34em 0.45em;
  border: 1px solid rgba(71,85,105,0.34);
  vertical-align: top;
}

th { background: rgba(23,52,79,0.12); }

.grid2, .grid3, .grid5 {
  display: grid;
  gap: 0.58rem;
  align-items: stretch;
}

.grid2 { grid-template-columns: repeat(2, 1fr); }
.grid3 { grid-template-columns: repeat(3, 1fr); }
.grid5 { grid-template-columns: repeat(5, 1fr); }

.card {
  background: var(--panel);
  border: 1px solid rgba(100,116,139,0.28);
  border-left: 6px solid var(--blue);
  border-radius: 8px;
  padding: 0.55rem 0.68rem;
  box-shadow: 0 5px 14px rgba(15,23,42,0.07);
}

.card.green { border-left-color: var(--green); }
.card.cyan { border-left-color: var(--cyan); }
.card.orange { border-left-color: var(--orange); }
.card.red { border-left-color: var(--red); }
.card p { margin: 0.2em 0; }
.flow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.28rem;
  margin: 0.65rem 0;
}

.step {
  flex: 1;
  min-height: 2.15rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 8px;
  border: 1px solid rgba(37,99,235,0.35);
  background: rgba(255,255,255,0.8);
  padding: 0.35rem;
  font-size: 0.78em;
  font-weight: 700;
}

.arrow { color: var(--blue); font-weight: 800; }
.kicker { color: var(--muted); font-size: 0.7em; letter-spacing: 0.04em; }
.small { font-size: 0.78em; }
.xsmall { font-size: 0.66em; }
.center { text-align: center; }
.right { text-align: right; }
.accent { color: var(--blue); }
.good { color: var(--green); }
.warn { color: var(--orange); }
.danger { color: var(--red); }
.metric { font-size: 1.42em; font-weight: 800; color: var(--blue); }
.label { font-size: 0.65em; color: var(--muted); }
.band {
  margin: 0.6rem 0;
  padding: 0.55rem 0.8rem;
  border-radius: 8px;
  color: white;
  background: linear-gradient(90deg, var(--navy), var(--blue));
  text-align: center;
  font-weight: 800;
}
</style>

<!-- _class: lead -->

# HandStack으로 구축하는
# 도메인 주도 로우코드 거버넌스

### 현업이 직접 만들고 IT가 안전하게 운영하는 정보화 시스템

<br />

**도메인 자율성 × 중앙 표준 × 지속 가능한 비용**

<!--
발표 스크립트: 오늘의 주제는 단순히 더 빨리 화면을 만드는 방법이 아닙니다. 업무를 가장 잘 아는 도메인 팀이 필요한 시스템을 직접 구현하면서도, 중앙 IT가 보안과 품질, 운영 통제력을 유지하는 방법을 HandStack 관점에서 살펴보겠습니다.
-->

---

## 정보화 시스템은 왜 늦고 비싸질까요?

<div class="grid3">
  <div class="card red">
    <h3>맥락 전달</h3>
    <p>도메인 지식이 요구사항 문서와 회의를 여러 번 거치며 손실됩니다.</p>
  </div>
  <div class="card orange">
    <h3>반복 구현</h3>
    <p>비슷한 CRUD, API, 화면과 배포 구성을 프로젝트마다 다시 만듭니다.</p>
  </div>
  <div class="card">
    <h3>변경 대기</h3>
    <p>작은 업무 변경도 분석·견적·개발·검수·배포 대기열에 들어갑니다.</p>
  </div>
</div>

<div class="band">초기 구축비보다 변경·연계·운영·인수인계 비용이 계속 누적됩니다</div>

<!--
발표 스크립트: 비용 문제는 개발자가 코드를 늦게 작성해서만 생기지 않습니다. 도메인 지식이 전달 과정에서 빠지고, 비슷한 기술 구성을 반복하며, 작은 변경도 중앙 대기열을 거칩니다. 이 누적 비용을 줄이려면 구현 주체와 운영 구조를 함께 바꿔야 합니다.
-->

---

## 도메인 지식과 구현 권한이 분리돼 있습니다

<div class="grid2">
  <div class="card cyan">
    <h3>도메인 팀이 가진 것</h3>
    <ul>
      <li>업무 용어와 규칙</li>
      <li>고객과 사용자의 실제 문제</li>
      <li>예외와 우선순위</li>
      <li>완료 여부를 판단하는 기준</li>
    </ul>
  </div>
  <div class="card orange">
    <h3>중앙 IT가 가진 것</h3>
    <ul>
      <li>개발·배포 환경</li>
      <li>데이터와 시스템 접근 권한</li>
      <li>보안·품질·운영 기준</li>
      <li>공통 아키텍처와 기술 자산</li>
    </ul>
  </div>
</div>

> 목표는 어느 한쪽으로 책임을 몰아주는 것이 아니라, **각자가 가진 역량이 같은 개발 흐름에서 작동하게 만드는 것**입니다.

<!--
발표 스크립트: 현업은 무엇을 만들어야 하는지 잘 알고, IT는 안전하게 만드는 방법을 압니다. 현재는 이 두 역량이 티켓과 문서를 사이에 두고 분리되어 있습니다. 로우코드 거버넌스는 개발을 현업에 떠넘기는 방식이 아니라 두 역할이 만나는 표준 경계를 만드는 일입니다.
-->

---

## 전통 개발과 일반 노코드 사이의 간극

| 관점 | 전통적인 맞춤 개발 | 일반적인 노코드 | HandStack 로우코드 |
|---|---|---|---|
| 시작 속도 | 전문 개발과 환경 구성이 필요 | 빠른 화면 조립 | 표준 프로젝트·계약으로 빠르게 시작 |
| 업무 표현 | 자유롭지만 구현량이 큼 | 제공 기능 범위에서 빠름 | HTML·JavaScript·SQL로 업무를 직접 표현 |
| 확장 | 코드로 자유롭게 확장 | 제품 기능과 플러그인에 의존 | 필요할 때 `function`으로 확장 |
| 운영 통제 | 팀 역량에 따라 달라짐 | 제품 운영 방식에 의존 | 계약·식별자·로그를 조직 표준으로 관리 |
| 기술 종속 | 선택한 스택에 종속 | 플랫폼 종속 가능성이 큼 | 표준 기술과 소스 기반으로 관리 |

<div class="band">HandStack은 자유도를 없애지 않고, 반복되는 연결 지점을 줄입니다</div>

<!--
발표 스크립트: 전통 개발은 자유롭지만 반복 구현 비용이 크고, 노코드는 빠르지만 복잡한 업무와 확장에서 제약이 생길 수 있습니다. HandStack은 표준 웹 기술과 SQL을 그대로 사용하면서 화면, 거래, 데이터 연결을 계약으로 단순화해 그 사이의 간극을 줄입니다.
-->

---

<!-- _class: xsmall -->

## HandStack이 말하는 로우코드

<div class="grid2">
  <div class="card green">
    <h3>줄이는 것</h3>
    <ul>
      <li>반복 CRUD·API 연결 코드</li>
      <li>화면별 데이터 바인딩 편차</li>
      <li>환경과 배포 방식의 편차</li>
    </ul>
  </div>
  <div class="card">
    <h3>유지하는 것</h3>
    <ul>
      <li>HTML·JavaScript·SQL 표준 기술</li>
      <li>업무 규칙과 소스의 직접 제어</li>
      <li>필요할 때 전문 코드로 확장할 선택권</li>
    </ul>
  </div>
</div>

<div class="band small">코드를 없애는 것이 아니라, 도메인 구현의 코드와 연결 지점을 줄이고 표준화합니다</div>

<!--
발표 스크립트: HandStack의 목표는 코드를 전혀 쓰지 않는 것이 아닙니다. 업무 담당자가 이해할 수 있는 화면과 SQL, 계약에 집중하게 하고, 반복되는 연결과 실행 환경은 플랫폼이 맡습니다. 복잡한 업무가 생기면 전문 개발로 자연스럽게 확장할 수도 있습니다.
-->

---

## 운영 원칙: 중앙 표준, 도메인 자율 구현

<div class="flow">
  <div class="step">업무 문제<br/>성과 기준</div><div class="arrow">→</div>
  <div class="step">도메인 모델<br/>시스템 경계</div><div class="arrow">→</div>
  <div class="step">화면·거래<br/>계약 구현</div><div class="arrow">→</div>
  <div class="step">검증·승인<br/>배포</div><div class="arrow">→</div>
  <div class="step">관측·개선<br/>폐기</div>
</div>

<div class="grid2">
  <div class="card">
    <h3>중앙 IT가 제공하는 것</h3>
    <p>공통 모듈 · 템플릿 · 보안 · 품질 · 배포 · 관측 기준</p>
  </div>
  <div class="card green">
    <h3>도메인 팀이 결정하는 것</h3>
    <p>업무 목표 · 용어 · 데이터 의미 · 규칙 · 우선순위 · 완료 조건</p>
  </div>
</div>

<div class="band">자율성은 기준이 없는 자유가 아니라, 합의된 경계 안에서의 빠른 실행입니다</div>

<!--
발표 스크립트: 중앙 IT는 매번 기능을 대신 만드는 조직에서 안전한 실행 기반을 제공하는 플랫폼 조직으로 이동합니다. 도메인 팀은 그 경계 안에서 업무 문제를 정의하고 구현합니다. 새로운 데이터나 외부 연계처럼 영향이 큰 지점에서만 전문 검토가 개입합니다.
-->

---

## 다섯 영역을 함께 운영합니다

<div class="grid5 xsmall">
  <div class="card green"><h3>1. 도메인</h3><p>목적<br/>소유자<br/>업무 경계<br/>성공 지표</p></div>
  <div class="card"><h3>2. 개발 표준</h3><p>ID<br/>디렉터리<br/>계약<br/>공통 자산</p></div>
  <div class="card cyan"><h3>3. 데이터·보안</h3><p>데이터 소유권<br/>인증·인가<br/>공개 범위<br/>비밀정보</p></div>
  <div class="card orange"><h3>4. 변경·품질</h3><p>영향도<br/>테스트<br/>승인<br/>되돌리기</p></div>
  <div class="card red"><h3>5. 운영·비용</h3><p>GlobalID<br/>사용량<br/>장애<br/>통합·폐기</p></div>
</div>

<br />

> 한 영역만 빠져도 빠른 개발은 **중복 시스템, 데이터 위험 또는 운영 비용**으로 되돌아옵니다.

<!--
발표 스크립트: 로우코드 거버넌스는 코딩 규칙만을 뜻하지 않습니다. 무엇을 왜 만드는지, 어떤 표준으로 구현하는지, 데이터는 누가 책임지는지, 어떻게 변경하고 운영할지를 함께 다뤄야 합니다. 이 다섯 영역이 연결되어야 빠른 구현이 지속 가능한 역량이 됩니다.
-->

---

## 1. 도메인 거버넌스: 만들기 전에 경계를 정합니다

| 반드시 정할 항목 | 핵심 질문 |
|---|---|
| 업무 문제 | 어떤 수작업, 지연 또는 오류를 줄이려는가? |
| 소유자와 사용자 | 누가 규칙을 결정하고 누가 사용하는가? |
| 핵심 용어 | 참여자가 같은 단어를 같은 의미로 쓰는가? |
| 포함·제외 범위 | 이번 시스템이 책임질 일과 책임지지 않을 일은 무엇인가? |
| 데이터와 연계 | 원본 데이터는 어디에 있고 누가 책임지는가? |
| 위험 | 개인정보, 금액, 승인 또는 외부 공개가 포함되는가? |
| 성공·종료 조건 | 무엇이 개선돼야 하며 언제 통합하거나 폐기할 것인가? |

<div class="band">첫 대상은 화면 1–3개, 테이블 1–2개의 독립된 CRUD 업무가 좋습니다</div>

<!--
발표 스크립트: 화면부터 만들기 시작하면 요구사항은 계속 커집니다. 먼저 업무 문제와 소유자, 시스템이 책임질 경계와 성공 지표를 정해야 합니다. 처음에는 작은 CRUD 업무를 골라 전체 수명주기를 경험하고 실제 비용 데이터를 확보하는 편이 안전합니다.
-->

---

## 2. 개발 표준: 업무 ID가 모든 자산을 연결합니다

<div class="flow">
  <div class="step">ApplicationID<br/><span class="label">애플리케이션</span></div><div class="arrow">|</div>
  <div class="step">ProjectID<br/><span class="label">도메인</span></div><div class="arrow">|</div>
  <div class="step">TransactionID<br/><span class="label">화면·업무</span></div><div class="arrow">|</div>
  <div class="step">ServiceID<br/><span class="label">실행 기능</span></div>
</div>

| 자산 | HandStack 구성 | 통제 기준 |
|---|---|---|
| 화면 | `wwwroot` HTML·JavaScript | 화면 ID, 데이터 필드와 이벤트 규칙 |
| 거래 | `transact` JSON 계약 | 인증, 입력·출력, 실행 대상과 환경 |
| 데이터 | `dbclient` XML·SQL 계약 | 데이터 소스, 파라미터와 반환 구조 |
| 전문 로직 | `function` 계약과 코드 | 로우코드 경계를 벗어나는 로직의 격리 |

> 같은 ID를 요구사항, 화면, 계약, 로그에 사용하면 변경 이유부터 운영 결과까지 추적할 수 있습니다.

<!--
발표 스크립트: HandStack의 ID 규칙은 파일 이름을 맞추기 위한 관례만이 아닙니다. 도메인, 화면, 거래, 실행 기능을 연결하는 공통 식별자입니다. 이 식별자를 요구사항과 테스트, 로그에도 사용하면 누가 무엇을 왜 변경했는지 추적하기 쉬워집니다.
-->

---

## 역할은 나누되, 같은 완료 기준을 봅니다

| 역할 | 주요 책임 | 최종 판단 |
|---|---|---|
| 도메인 책임자 | 목표, 규칙, 우선순위, 예외 정의 | 업무 가치와 완료 여부 |
| 도메인 빌더 | 데이터 모델, 화면, 거래 계약 구현 | 표준 범위 내 기능 동작 |
| 플랫폼 담당자 | 공통 모듈, 템플릿, 실행 환경 | 기술 표준과 호환성 |
| 데이터·보안 담당자 | 데이터 접근, 인증, 외부 공개 검토 | 위험 수용 여부 |
| 운영·품질 담당자 | 테스트, 배포, 로그, 장애 대응 | 운영 가능성과 복구 가능성 |

<div class="band">기능 완료 + 품질 완료 + 운영 완료 = 실제 완료</div>

<!--
발표 스크립트: 도메인 팀이 직접 만든다는 말이 모든 책임을 한 사람에게 준다는 뜻은 아닙니다. 업무 가치는 도메인 책임자가, 기술 경계와 위험은 전문 담당자가 판단합니다. 중요한 것은 모두가 기능, 품질, 운영이라는 같은 완료 기준을 보는 것입니다.
-->

---

## 모든 변경에 같은 승인을 요구하지 않습니다

| 변경 유형 | 처리 방식 |
|---|---|
| 화면 문구·기존 범위의 조회 조건 | <span class="good">도메인 자율 변경</span> + 동료 검토 |
| 표준 컴포넌트 기반 신규 화면 | <span class="good">간소화 검토</span> + 회귀 확인 |
| 신규 테이블·컬럼·데이터 구조 | <span class="warn">데이터 담당자 검토</span> |
| 공통 모듈과 계약의 호환성 변경 | <span class="warn">플랫폼 영향 분석</span> |
| 외부 시스템 연계 | <span class="warn">아키텍처·보안 검토</span> |
| 공개 거래·인증·권한 변경 | <span class="danger">보안 승인</span> |
| 운영 배포·데이터 마이그레이션 | <span class="danger">품질·운영 승인</span> |

> **낮은 위험은 빠르게, 높은 영향은 근거와 함께 검토합니다.**

<!--
발표 스크립트: 모든 변경을 중앙에서 승인하면 로우코드의 속도가 사라집니다. 반대로 데이터 구조나 권한 변경까지 자율 처리하면 위험이 커집니다. 변경 유형과 영향도에 따라 검토 수준을 나누는 것이 통제된 자율성의 핵심입니다.
-->

---

## 3. 데이터·보안: 계약을 실행 경계로 사용합니다

<div class="grid3 small">
  <div class="card cyan">
    <h3>데이터 계약</h3>
    <p><code>dbclient</code> 파라미터</p>
    <p>필요한 필드만 반환</p>
    <p>소유자·보관 기간 기록</p>
  </div>
  <div class="card orange">
    <h3>거래 접근</h3>
    <p><code>AllowRequestTransactions</code></p>
    <p><code>PublicTransactions</code> 최소화</p>
    <p>인증·화면·환경 검증</p>
  </div>
  <div class="card red">
    <h3>비밀정보</h3>
    <p>환경별 설정 분리</p>
    <p>저장소·문서 기록 금지</p>
    <p>로그와 화면 캡처 점검</p>
  </div>
</div>

<div class="flow">
  <div class="step">사용자 화면</div><div class="arrow">→</div>
  <div class="step">transact<br/>인증·계약 검증</div><div class="arrow">→</div>
  <div class="step">dbclient / function<br/>허용된 실행</div><div class="arrow">→</div>
  <div class="step">표준 응답·로그</div>
</div>

<!--
발표 스크립트: 도메인 팀이 직접 개발하더라도 데이터베이스에 임의로 접근하게 하지는 않습니다. 화면 요청은 transact 계약에서 인증과 입력·출력을 검증하고, dbclient나 function의 허용된 실행으로 전달합니다. 계약이 곧 자율 개발의 안전한 경계가 됩니다.
-->

---

## 4. 변경·품질: 빠른 구현을 안전한 반복으로 바꿉니다

<div class="flow">
  <div class="step">작은 변경</div><div class="arrow">→</div>
  <div class="step">계약·코드 검토</div><div class="arrow">→</div>
  <div class="step">정상·오류·권한 테스트</div><div class="arrow">→</div>
  <div class="step">위험도별 승인</div><div class="arrow">→</div>
  <div class="step">배포·관측</div>
</div>

<div class="grid3 small">
  <div class="card green"><h3>기능 완료</h3><p>업무 시나리오와 입력·출력 계약 충족</p></div>
  <div class="card"><h3>품질 완료</h3><p>경계값, 오류, 권한과 회귀 시나리오 확인</p></div>
  <div class="card orange"><h3>운영 완료</h3><p>배포, 로그, 복구와 담당자 인수인계 준비</p></div>
</div>

> 변경 요청에는 목적, 대상 ID, 영향 범위, 테스트 결과와 되돌리기 방법을 함께 남깁니다.

<!--
발표 스크립트: 로우코드로 구현 속도가 빨라지면 변경 횟수도 늘어납니다. 품질을 유지하려면 작은 변경, 빠른 검증, 위험도별 승인, 운영 관측의 루프가 필요합니다. 화면에서 한 번 동작한 상태가 아니라 복구와 인수인계까지 준비되어야 완료입니다.
-->

---

## 5. 운영: GlobalID로 시스템의 흐름을 봅니다

<div class="flow">
  <div class="step">화면 요청</div><div class="arrow">→</div>
  <div class="step">transact</div><div class="arrow">→</div>
  <div class="step">dbclient<br/>function</div><div class="arrow">→</div>
  <div class="step">응답</div>
</div>

<div class="center metric">GlobalID</div>
<div class="center label">같은 업무 거래를 화면부터 실행 결과까지 연결하는 추적 기준</div>

<div class="grid3 small">
  <div class="card"><h3>상태</h3><p>거래 성공률 · 응답 시간 · 반복 실패</p></div>
  <div class="card cyan"><h3>비용</h3><p>거래량 · 운영 시간 · 장애 대응 시간</p></div>
  <div class="card orange"><h3>수명주기</h3><p>사용률 · 소유자 · 통합·폐기 대상</p></div>
</div>

<!--
발표 스크립트: 운영에서는 로그를 장애가 난 뒤 찾는 파일로만 보면 안 됩니다. GlobalID로 거래 흐름을 연결하면 어느 단계가 느리거나 실패하는지 볼 수 있습니다. 거래량과 사용률까지 함께 보면 유지할 시스템과 통합하거나 폐기할 시스템도 판단할 수 있습니다.
-->

---

## 비용 절감은 총소유비용으로 증명합니다

<div class="grid2">
  <div class="card red">
    <h3>총소유비용</h3>
    <p>초기 구축비</p>
    <p>+ 요구사항 전달·반복 개발비</p>
    <p>+ 시스템 연계·변경·배포비</p>
    <p>+ 운영·장애 대응비</p>
    <p>+ 인수인계·기술 종속 비용</p>
  </div>
  <div class="card green">
    <h3>측정할 지표</h3>
    <p>최초 구현·변경 리드타임</p>
    <p>도메인 자율 처리율</p>
    <p>공통 자산 재사용률</p>
    <p>배포 실패율·평균 복구 시간</p>
    <p>월 운영 시간·실제 사용률</p>
  </div>
</div>

> 근거 없는 절감률을 먼저 약속하지 않고, 작은 업무의 실제 데이터를 도입 전후로 비교합니다.

<!--
발표 스크립트: 개발 기간이 줄었다는 주장만으로는 비용 효과를 설명하기 어렵습니다. 요구사항 전달과 반복 구현, 연계, 배포, 장애, 인수인계 비용을 함께 봐야 합니다. 첫 PoC에서 기준선을 만들고 같은 지표를 도입 후에 비교하면 HandStack의 효과를 조직의 숫자로 설명할 수 있습니다.
-->

---

## 예시: 구매 요청 업무를 직접 정보화한다면

<div class="grid2 small">
  <div class="card green">
    <h3>도메인 정의</h3>
    <p>소유자: 구매팀장</p>
    <p>ProjectID: <code>PUR</code></p>
    <p>성공 기준: 처리시간·누락·문의 감소</p>
  </div>
  <div class="card">
    <h3>업무 자산</h3>
    <p><code>PUR010</code> 요청 목록</p>
    <p><code>PUR011</code> 요청 등록</p>
    <p><code>PUR012</code> 검토·승인</p>
  </div>
</div>

<div class="flow">
  <div class="step">업무 규칙</div><div class="arrow">→</div>
  <div class="step">화면·데이터 모델</div><div class="arrow">→</div>
  <div class="step">dbclient<br/>거래 구현</div><div class="arrow">→</div>
  <div class="step">transact<br/>권한 통제</div><div class="arrow">→</div>
  <div class="step">GlobalID<br/>운영 관측</div>
</div>

<div class="band">문구·조회 조건은 자율 개선, 금액·승인·외부 연계는 전문 검토</div>

<!--
발표 스크립트: 구매 요청처럼 범위가 분명한 업무부터 시작할 수 있습니다. 구매팀이 용어와 승인 규칙을 정하고, 화면과 거래 계약을 직접 개선합니다. 다만 금액 데이터, 승인 권한, 회계 시스템 연계는 데이터와 보안 담당자의 검토를 거칩니다.
-->

---

## 성숙도는 기술 수보다 운영 방식으로 판단합니다

<div class="grid2 small">
  <div class="card red"><h3>1. 개별 실험</h3><p>개인별 구현<br/>소유자와 기준 불명확</p></div>
  <div class="card orange"><h3>2. 표준화</h3><p>ID·계약·템플릿 사용<br/>공통 검토 기준 마련</p></div>
  <div class="card"><h3>3. 통제된 자율성</h3><p>위험도별 승인<br/>도메인 자율 변경 정착</p></div>
  <div class="card green"><h3>4. 포트폴리오 최적화</h3><p>비용·품질·사용 데이터로<br/>재사용·통합·폐기 결정</p></div>
</div>

<div class="band">목표는 시스템을 많이 만드는 것이 아니라, 필요한 시스템을 지속 가능하게 운영하는 것입니다</div>

<!--
발표 스크립트: 로우코드 도구를 많이 쓰는 것이 성숙도를 의미하지는 않습니다. 소유자와 표준이 있고, 낮은 위험의 변경은 자율 처리하며, 비용과 사용 데이터를 근거로 시스템을 통합하거나 폐기할 수 있어야 합니다. 운영 방식이 성숙도의 기준입니다.
-->

---

## 작은 업무에서 시작하는 실행 순서

<div class="flow small">
  <div class="step">1<br/>업무 선정</div><div class="arrow">→</div>
  <div class="step">2<br/>기준선 측정</div><div class="arrow">→</div>
  <div class="step">3<br/>작은 PoC</div><div class="arrow">→</div>
  <div class="step">4<br/>표준화</div><div class="arrow">→</div>
  <div class="step">5<br/>자율 범위 확대</div><div class="arrow">→</div>
  <div class="step">6<br/>확장·통합·폐기</div>
</div>

1. 반복 CRUD 중심이며 소유자가 분명한 업무를 고릅니다.
2. 현재 처리시간, 변경비용과 오류 건수를 기록합니다.
3. 화면 1–3개와 격리된 데이터베이스로 전체 흐름을 검증합니다.
4. ID, 계약, 보안, 테스트와 배포 기준을 템플릿으로 남깁니다.
5. 영향도가 낮은 변경부터 도메인 팀의 자율 범위를 넓힙니다.
6. 실제 지표로 다음 도메인 확장 여부를 결정합니다.

<!--
발표 스크립트: 처음부터 전사 플랫폼을 완성하려 하지 않습니다. 소유자가 분명한 작은 업무 하나를 골라 현재 비용을 측정하고, 전체 개발과 운영 흐름을 검증합니다. 그 과정에서 만들어진 기준과 자산이 다음 업무의 시작 비용을 낮춥니다.
-->

---

<!-- _class: lead -->

# 도메인이 직접 만들고
# IT가 신뢰할 수 있게 운영합니다

### HandStack은 빠른 개발 도구를 넘어
### 조직의 정보화 역량을 축적하는 공통 시스템입니다

<br />

**작게 시작하고 · 기준을 남기고 · 측정하며 확장하세요**

<!--
발표 스크립트: HandStack이 만들고자 하는 변화는 현업과 IT의 역할을 없애는 것이 아닙니다. 도메인 팀이 업무 시스템을 직접 개선하고, IT는 안전한 표준과 운영 기반을 제공하는 구조입니다. 작은 성공에서 기준과 자산을 남기고, 실제 비용과 품질을 측정하며 확장하는 것이 시작점입니다.
-->
