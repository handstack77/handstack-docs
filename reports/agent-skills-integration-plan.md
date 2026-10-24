# HandStack 에이전트 스킬 통합 계획

`C:\tmp\handstack-skill`(범용 개발자 스킬 14개, 가이드, 점검 도구)을 `handstack-docs`에 통합하고 문서와 함께 개선하는 계획입니다. 이 문서는 1단계(구조·규칙·검증 체계 확정)를 구체적으로 정의하고, 진행하면서 상태를 갱신합니다.

## 방향

- **문서가 단일 원본입니다.** 구문·옵션·기본값·식별자·설정 키는 `docs/`의 대표 문서에만 둡니다. 스킬은 판단 절차와 점검 순서, 흔한 실수를 담고 대표 문서로 연결합니다.
- **범용 프로젝트입니다.** 특정 업무 저장소의 경로·모듈·업무 ID를 스킬에 넣지 않습니다. 그런 정보는 각 프로젝트의 `AGENTS.md`/`CLAUDE.md`에 둡니다.
- **언어·용어 규칙은 `CONTRIBUTING.docs.md` 하나로 합칩니다.**
- 같은 이름의 프로젝트 전용 스킬은 범용 스킬로 대체합니다.

## 대상 구조

```
handstack-docs/
├─ docs/ai/                  사람이 읽는 문서 "AI 에이전트로 개발하기" (2단계 이후)
├─ agent-skills/             에이전트가 읽는 원본 (사이트 본문 아님)
│  ├─ skills/<이름>/         SKILL.md, references/, scripts/ (점검 도구는 스킬 안에 둠)
│  ├─ guides/                사용 가이드·템플릿 (2단계에서 docs/ai로 이동)
│  ├─ scripts/               validate_bundle.py, package_bundle.py, check_doc_refs.py, check.mjs
│  ├─ tests/
│  ├─ config/banned-terms.txt
│  ├─ Install-Skills.ps1
│  ├─ MERGE-MAP.md           문서·스킬 병합 판정표
│  └─ README.md
└─ build/ 또는 static/       배포용 zip은 빌드가 생성 (저장소에 커밋하지 않음)
```

- 폴더명에 `bin`, `build`, `publish`를 쓰지 않습니다. `.gitignore`가 가립니다.
- 도구들이 `skills/`, `guides/`, `scripts/`, `tests/`의 상대 위치를 전제로 하므로 원래 이름을 유지합니다.
- 분석 자료(`analysis/`)의 zip과 JSON은 산출물이고 비공개 표현이 들어 있을 수 있어 저장소에 넣지 않습니다.

## 문서와 스킬의 역할 분담

| 내용 | 둘 곳 |
|---|---|
| 구문, 옵션, 기본값, 식별자 표, 설정 키 | docs 대표 문서. 스킬은 링크만 둠 |
| 판단 절차, 점검 순서, 흔한 실수, 중단 조건 | 스킬 `SKILL.md` |
| 사람용 학습, 역할별 가이드, 쿡북 | `docs/ai/` |
| 복사해 쓰는 파일 | `agent-skills/guides/templates/` |

스킬의 "문서 확인" 절은 `docs/` 기준 문서 경로(확장자 없음)를 인용합니다. 검증기가 그 경로가 실제 존재하는지 확인합니다.

## 금지어 두 층

기존 목록을 `docs/`에 실제로 돌려 본 결과를 기준으로 나눴습니다. 공개 문서에는 회사 주소(라이선스), 예제 코드, IDE 설명, 개발자 PC 경로 예시, 업무 ID 예시가 이미 정당하게 들어 있습니다.

| 층 | 대상 | 적용 범위 |
|---|---|---|
| `[all]` | docs에서 적중이 0건인 비공개 전용 표현 (그룹웨어·내부 업무 제품명 등) | `agent-skills/` + `docs/` 전체. 위반 시 오류 |
| `[skills]` | 나머지 기존 표현 (회사명, 공개 제품명, 업무 ID 패턴, 개발자 PC 경로 등) | `agent-skills/`만. 패턴 뒤 `;except=스킬이름`으로 스킬별 예외 가능 |

목록 파일은 `agent-skills/config/banned-terms.txt`입니다. 새 표현을 `[all]`에 넣기 전에 docs에서 적중이 없는지 확인합니다.

## 1단계 작업

| 번호 | 작업 | 산출물 |
|---|---|---|
| T1.1 | 구조 확정 및 무수정 이관 | `agent-skills/` (스킬·가이드·도구·테스트를 수정 없이 이관) |
| T1.4 | 언어·용어·작성 규칙 병합 | `CONTRIBUTING.docs.md`에 스킬 작성 기준 절, 대표 문서 표 확장, 2층 금지어 |
| T1.6 | 통합 검증 | `npm run check:agent`, 문서 경로 인용 검사 |
| T1.3 | 중복 매핑표 | `agent-skills/MERGE-MAP.md` |
| T1.5 | 범용화 기준 | 프로젝트 전용 스킬 처리 방침 |
| T1.7 | MCP 인덱싱 영향 확인 | 인덱싱 범위와 전후 측정 |

순서는 규칙(T1.4)과 검증기(T1.6)를 먼저 세운 뒤 매핑표(T1.3)를 작성하는 것입니다. 판정을 기계적으로 확인하기 위해서입니다.

### 이관 방식 결정

계획 단계에서는 도구만 옮기고 검증기를 빈 폴더에서 통과시키는 것을 상정했습니다. 그러나 검증기와 테스트 54건이 스킬·가이드 파일을 직접 읽으므로, 스킬·가이드를 **수정 없이** 먼저 이관합니다. 병합과 수정은 이후 단계에서 변경 단위별로 하고, 이관 시점을 기준선으로 남깁니다.

## 완료 기준

- 구조·규칙·매핑표가 합의되고 검증 명령이 통과합니다.
- 이관 직후 검증기 오류 0건, 테스트 54건 통과(이관 전 기준선과 동일).
- 기존 사이트 빌드 결과는 달라지지 않습니다.

## 이후 단계 (개요)

1. **문서 이동**: `guides/`를 `docs/ai/`로 옮기고 사이드바·MCP 인덱싱 확인.
2. **스킬 병합**: 매핑표의 병합 판정을 변경 단위별로 적용. 스킬 안의 복제된 표·구문은 대표 문서 링크로 대체.
3. **CI 연결**: `check:agent`와 사이트 빌드를 함께 실행. 배포용 zip 빌드 생성.
4. **교체**: 사용자 환경의 프로젝트 전용 동명 스킬을 `Install-Skills.ps1 -Update -RetireSkill`로 교체.
5. **운영**: 문서 개선 절차(`prompts/docs-improvement.md`)에 "영향받는 스킬 함께 갱신" 단계 추가.

## 위험과 대응

| 위험 | 대응 |
|---|---|
| 금지어를 docs에 적용해 기존 문서가 대량으로 실패 | `[all]` 층만 docs에 적용하고 경고로 보고 |
| 문서 개편으로 스킬이 인용한 문서 경로가 깨짐 | 문서 경로 인용 검사를 `check:agent`에 포함 |
| 스킬이 대표 문서를 복제해 다시 어긋남 | 역할 분담 규칙과 매핑표로 관리 |
| 사이트 빌드 시간·MCP 인덱스 크기 증가 | T1.7에서 전후 측정 |

## 1단계 결과 (2026-10-24)

| 번호 | 상태 | 내용 |
|---|---|---|
| T1.1 | 완료 | `agent-skills/`에 스킬 14개·가이드·도구·테스트·설치기를 수정 없이 이관(79개 파일). `.gitignore`에 `__pycache__/`, `agent-skills/*.zip` 추가 |
| T1.4 | 완료 | `CONTRIBUTING.docs.md`에 "에이전트 스킬 갱신" 절과 대표 문서 표 행 추가. 금지어 2층 분리(`validate_bundle.py`가 `[all]`/`[skills]`/`;except=`와 docs 검사를 지원, 테스트 추가). 삭제된 파일(`tests/docs-navigation.mjs`, `reports/ide-documentation-source-map.md`)을 가리키던 문구 정리 |
| T1.6 | 완료 | `npm run check:agent` = 번들 검증 + 문서 경로 인용 검사(`check_doc_refs.py`, 새로 작성) + 단위 테스트 63건(기존 54 + 신규 9) |
| T1.3 | 초안 완료 | `agent-skills/MERGE-MAP.md`. 제목·키워드 대조 수준이며 줄 단위 대조와 소스 확인은 항목별로 진행 |
| T1.5 | 완료 | `agent-skills/README.md`에 범용 기준과 프로젝트 전용 스킬 교체 방법 기재 |
| T1.7 | 완료 | 아래 참조 |

### 검증 결과

- `npm run check:agent`: 스킬 14개, 오류 0건, 문서 경로 인용 113건 확인, 테스트 63건 통과.
- `npm run typecheck`, `npm run build` 성공. MCP 인덱스는 이관 전후가 같음(문서 387개, 청크 4,071개, 예제 234개, 문서 id·본문 동일). `agent-skills/`는 `docs/` 밖이라 인덱스에 들어가지 않습니다.
- 배포 zip(`package_bundle.py`)과 설치기 시험(`Test-InstallSkills.ps1`) 통과. 금지어 목록은 zip에 포함되지 않습니다.
- 미수행: 브라우저에서 데스크톱·모바일 메뉴 확인(사이트 화면을 바꾸지 않았음), CI 연결.

### 계획 대비 변경과 새로 알게 된 것

- 도구가 `skills/`, `guides/`, `scripts/`, `tests/`의 상대 위치를 전제로 해서 `tools/` 대신 원래 이름 `scripts/`를 유지했습니다.
- 빈 폴더가 아니라 **스킬·가이드를 수정 없이 이관**했습니다(검증기와 테스트가 이 파일들을 읽기 때문). 병합과 수정은 이후 단계의 변경 단위로 합니다.
- 금지어 층은 실측 결과로 다시 정의했습니다(위 "금지어 두 층").
- 문서 id는 Docusaurus 규칙대로 폴더 앞 번호(`5.빌드-릴리즈-실행`)를 뺀 형태입니다. 인용 검사기가 같은 규칙을 씁니다.
- 사이트에 이미 `docs/reference/vide-coding-instruction/`("AI 활용 자료", 52개 문서)이 있고, HandStack 고유 파일 5개와 프로젝트 지침 예시 3벌이 스킬과 겹칩니다. 매핑표에 반영했습니다.
- 확장자 표기가 갈립니다: SQL 계약 `.dbc`(스킬) 대 `.xml`(문서), 거래 계약 `.txn`(스킬) 대 `.json`(문서 예제). 소스는 둘 다 지원합니다. 매핑표 C1.
- 워크플로(`CommandType W`)와 거래 계약의 `ValidateRules`·`Maskings`는 docs에 한 건도 없습니다(대표 문서 신설 필요).
- `docs/ai/`를 만들면 MCP 인덱스에서 `기타` 구역으로 분류됩니다. `plugins/agent-docs/index.cjs`의 `SECTION_LABELS`에 추가해야 합니다(2단계).

### 다음 단계

1. 매핑표 C1~C4 충돌 해결 (소스 확인 포함).
2. `docs/ai/` 신설: `guides/`를 이동하고, `SECTION_LABELS`·사이드바·MCP 인덱스를 함께 반영.
3. "이동" 항목(워크플로, 거래 계약 필드, `.fnc`/`.bas`/`.cyp`/`.rpo`)부터 대표 문서 작성.
4. "병합" 항목 처리, CI 연결, zip 빌드 생성.

## 2단계 진행 (2026-10-24)

| 작업 | 상태 | 내용 |
|---|---|---|
| 충돌 C1~C4 | 완료 | 소스·샘플 계약을 확인해 대표 문서에 반영. 결과는 `agent-skills/MERGE-MAP.md` |
| 대표 문서 보강 | 완료 | `reference/식별자와-파일-경로`에 "서비스 ID 접두어 관례"와 "계약 확장자" 절 추가 |
| 구버전 AI 활용 자료 정정 | 완료 | `reference/vide-coding-instruction`의 HandStack 고유 파일 7개: 특정 프로젝트 경로·화면 ID를 대표 문서 기준(`BOD010`)으로 교체, LD/MD/ID 설명 정정, DBMS 한정 문구 정정, 기준 문서 안내 추가 |
| 가이드 이동 | 완료 | 5편과 안내 문서를 `docs/guides/ai/`로 이동(`개발-흐름-개요`, `개발자-가이드`, `운영자-가이드`, `업무-담당자-가이드`, `프롬프트-쿡북`, `index`). 작업별 가이드 표와 더보기 메뉴에 연결 |

### 계획 대비 변경

- 위치를 `docs/ai/` 대신 **`docs/guides/ai/`**로 정했습니다. 기존 `guidesSidebar`의 자동 사이드바와 MCP의 `guides` 구역을 그대로 쓰므로 `SECTION_LABELS`나 사이드바 수정이 필요 없습니다. `CONTRIBUTING.docs.md`의 "AI 활용은 보조 자료" 원칙에도 맞습니다.
- 템플릿은 `agent-skills/guides/templates/`에 두고 문서에서 GitHub 주소로 연결했습니다. **이 주소(`handstack77/handstack-docs`의 `master`)는 `agent-skills/`를 푸시한 뒤에야 열립니다.**

### 검증

- `npm run check:agent` 통과(스킬 14개, 인용 118건, 테스트 63건), `npm run typecheck`·`npm run build` 성공.
- MCP 인덱스: 문서 387개 → 393개(새 가이드 6개, `guides` 구역). 기존 문서의 id는 그대로입니다.
- 미수행: 브라우저에서 메뉴·모바일 화면 확인, 새 대표 문서 절의 줄 단위 소스 대조(접두어 집계와 확장자 표는 소스·샘플 계약으로 확인함).

### 다음

1. "이동" 항목: 워크플로 → 거래 계약 필드(`ValidateRules`, `Maskings` 등) → `.fnc`/`.bas`/`.cyp`/`.rpo` 대표 문서 작성.
2. "병합" 항목: 화면 작성 지침 → 거래·SQL → 호스트 운영.
3. `guides/ai/`에 스킬 목록·점검 도구 문서 추가.
4. CI 연결, zip 빌드 생성.

## 3단계 진행 (2026-10-24)

### 대표 문서 작성 (docs에 없던 내용)

| 문서 | 내용 | 근거 |
|---|---|---|
| `reference/워크플로-계약` (신설) | `CommandType W`, 단계 항목과 기본값, 입력·출력 매핑, 검증 15종, 호출, 일회성 워크플로, 설계 시 확인 | `BusinessContractObject.cs` 모델·기본값, `WorkflowController.cs` |
| `reference/거래-계약-명세` (신설) | 파일 구조, 서비스 항목, 입출력 계약, `BaseFieldMappings`·`BaseFieldRelation`, 순차 거래, `Maskings`·`ValidateRules`·`FallbackTransaction`, 접근 제어 | 같은 모델, `TransactionController.cs`, `DataMapItemValidator.cs`, `ContractPackCommand.cs` |
| `reference/api/modules/function` | "단일 파일 계약 (.fnc)": 구조, 진입점 규칙, 언어별 함수, `Exception`, featureSQL, 증상표 | `FunctionMapper.ParseXmlContract` |
| `reference/api/modules/{command,graphclient,repository}` | `.bas`, `.cyp`, `.rpo` 형식 절. `PolicyPathID`(1=연, 2=연월, 3=연월일)와 확장자 미검사 등 | `CommandMapper`, `GraphMapper`, `RepositoryManager`, `StorageController` |
| `guides/ai/스킬-목록`, `guides/ai/점검-도구` (신설) | 스킬 14개, 설치, 호출 예시, 점검 스크립트 3종 | 번들 README에서 이동 |

소스 확인 중 스킬 서술을 바로잡은 것: `handstack contractpack`의 백업 ZIP은 `--options true`(`Y`, `1`)를 줄 때만 생성됩니다. 또 `transact.mdx`에는 워크플로 개요 절이 이미 있었으므로(키워드 검색은 대소문자 때문에 0건으로 보였음) 새 문서는 계약 항목 명세 역할로 연결했습니다.

### 스킬 병합

- `handstack-workflow-contracts`: `references/assertions.md` 삭제, `SKILL.md`를 판단·순서·함정 중심으로 축소(80여 줄 → 41줄).
- `handstack-function-contracts`: `references/function-patterns.md` 삭제, 진입점 규칙의 상세를 docs로 이동.
- `handstack-external-contracts`: 형식 상세를 모듈 문서로 이동하고 허용 범위 점검 중심으로 축소.
- `handstack-transaction-contracts`: `references/txn-contract.md`를 점검 순서·함정·체크리스트로 축소하고 항목 명세는 `reference/거래-계약-명세`를 인용.
- 화면 HTML·JS 규칙, 디자인 시스템, 바인딩 규칙, SQL 계약 규칙은 **유지(요약)**: 대표 문서를 이미 명시한 요약본이며 소스 확인 내용이 섞여 있어 줄이면 정보가 사라집니다. 줄 단위 대조는 하지 않았습니다.

### 연결과 CI

- 번들 `README.md`에서 사용 예·점검 도구 상세를 사이트 문서로 옮기고 링크로 대체.
- `.github/workflows/check.yml`: 푸시(master)와 풀 리퀘스트마다 `npm run typecheck`, `npm run check:agent` 실행. 같은 검사를 WSL(Ubuntu, Python 3.14)에서 실행해 통과를 확인했으나 **GitHub에서의 실제 실행은 푸시 전에는 검증할 수 없습니다.**
- `npm run package:agent`: 검증을 통과한 뒤 `static/agent-skills/handstack-developer-skills.zip`을 만듭니다(저장소에는 커밋하지 않음). 실행 시험 후 산출물은 지웠습니다.
- `publish.sh`/`publish.bat`은 수정하지 않았습니다. zip을 사이트로 배포하려면 `npm run build` 앞에 `npm run package:agent`를 넣어야 하며, 서버에 Python 3.10 이상이 필요합니다.

### 검증

- `npm run check:agent`(스킬 14개, 문서 경로 인용 137건, 테스트 63건), `npm run typecheck`, `npm run build` 통과. Linux(WSL)에서도 검증기·인용 검사·테스트 통과.
- MCP 인덱스: 387개 → 397개. 삭제된 문서 id 없음. 새 문서 10개, 본문이 바뀐 기존 문서 15개(위 대표 문서, 정정한 AI 활용 자료 7개, 색인·안내 문서).
- 새 앵커(`#단일-파일-계약-fnc`, `#계약-확장자` 등)가 빌드 결과에 존재하며 깨진 링크·앵커 경고 없음.
- 미수행: 브라우저 화면 확인, 새 대표 문서의 줄 단위 소스 대조(모델 필드·기본값·핵심 동작은 소스로 확인함), GitHub Actions 실제 실행.

### 남은 일

- 호스트 운영·CI/CD·문제 진단·IDE 개발·모듈 통합 스킬의 문서 병합(매핑표 "스킬별 판정" 참조)
- `vide-coding-instruction`의 `handstack-patterns`·`HANDSTACK.md` 코드 예시와 화면 작성 지침의 내용 중복
- zip의 사이트 배포(`publish` 스크립트 수정 여부는 운영자 결정)

## 4단계 진행 (2026-10-24)

### zip 배포 연결

- `publish.sh`, `publish.bat`이 `npm run build` 앞에서 `npm run package:agent`를 실행합니다. 실패(검증 실패, Python 3.10 이상 없음)하면 경고만 남기고 사이트 배포를 계속합니다.
- `agent-skills/scripts/package.mjs`는 시작할 때 기존 zip을 지웁니다. 검증이 실패하면 zip이 없고 `/agent-skills/handstack-developer-skills.zip`은 404입니다(이전 zip이 배포되지 않음). 이 동작을 실제로 시험했습니다(검증을 일부러 깨뜨림 → 경고 후 계속, zip 삭제).
- 정상 경로: `package:agent` → `build` 후 `build/agent-skills/handstack-developer-skills.zip`(77개 파일) 생성, 스킬 목록 문서의 링크가 `/agent-skills/handstack-developer-skills.zip`으로 렌더링됩니다.
- Windows에서는 Microsoft Store의 `python` 스텁을 실행하면 node가 비정상 종료하므로 `py`를 먼저 찾습니다(`agent-skills/scripts/python.mjs`). Python이 없는 서버에서는 경고만 나오고 zip이 빠집니다. Linux 빌드 서버에는 Python 3.10 이상(`python3`)이 필요한지 운영자가 확인해야 합니다.
- 문서(`guides/ai/index`, `스킬-목록`, `개발자-가이드`)에 다운로드 링크를 추가했습니다. 첫 배포 전에는 404입니다.

### 남은 병합 처리

| 영역 | 대표 문서 (신설·보강) | 스킬 |
|---|---|---|
| ack·CLI | `reference/api/ack-프로그램`(실행 옵션, 설정 읽는 순서, 실시간 반영·재시작 키, 관리 엔드포인트, 계약 복사), `startup/HandStack-CLI-사용법`(`stop`, `contractpack`, `synusage`) | `handstack-host-operations` 축약·정정 |
| 다른 호스트 | `reference/api/운영-호스트` (rdy, agent, deploy, forbes) | 같음 |
| 배포 | `twelvefactor/…/업데이트-패키지-배포`, `twelvefactor/…/Docker-ack-이미지` | `deploy-methods.md` 축약·정정 |
| 문제 진단 | `reference/거래-오류-메시지`, `guides/문제-해결`(렌더링·반영 절), `reference/api/modules/transact`의 관리 API 공통 규칙 | `handstack-troubleshooting` 축약·정정 |
| 모듈 | `reference/api/업무-모듈-개발`, `module.json-환경설정`, `menus.json-메뉴설정` | `handstack-module-development` 참조 2개 축약 |
| 구버전 AI 자료 | `examples/HANDSTACK.md` 재작성(실제 샘플 `BOD010` 기준), `handstack-scaffold`, `handstack-developer`, `handstack-patterns`, `handstack-rules`, `handstack-dev-hooks`, `handstack-integration`, `handstack-plugins` 정정 | |
| 운영자 가이드 | 복제 표를 대표 문서 링크로 교체 | |

### 소스 확인으로 바로잡은 사실

- rdy 기본 포트는 8420(forbes와 충돌). rdy 정적 결합 모듈은 9개이고 나머지는 동적 로드.
- `handstack stop`은 인자가 없으면 모든 `ack`·`dotnet` 프로세스를 종료. `--pid`, `--port` 지원.
- 모듈 관리 API는 인증 실패 시 `401`이 아니라 `400`. 키는 로컬이면 쿼리·폼·경로·헤더, 원격이면 헤더.
- `제한된 거래 요청`은 `AllowTenantTransactionCommands`, `인증 자격 증명 확인 필요`는 `PermissionRoles` 정규식 때문. 토큰 오류는 별도 문구.
- 설정 읽는 순서는 `appsettings.{ACK_ENVIRONMENT}.json`이 환경 변수보다 뒤(우선).
- updater는 `--ack-process-id`를 받고 `mandatory`로 강제 종료·재기동을 정함(`PUBLISH.md`는 낡음). `/manifest?launch=true`는 `IsAutoUpdate=true`(기본 false)가 전제.
- deploy는 `ManagementKey`가 비면 업로드가 인증 없이 열림. agent는 키가 없으면 거부.
- `publish.ps1`은 agent·deploy·forbes 게시가 주석 처리(기본 산출물에 `hosts/` 없음).
- Docker: 시드는 디렉터리가 비어 있을 때만, 이미지 모듈은 7개, compose는 홈 전체를 `/handstack`에 마운트. 루트 `Dockerfile`은 `aspnet:8.0` 구형.
- `IsCopyContract`(기본 true)·`IsPurgeContract`(기본 false)는 모듈 `module.json` 키.

### 검증

- `npm run check:agent`(스킬 14개, 문서 경로 인용 175건, 테스트 63건), Linux(WSL)에서도 통과. `typecheck`, `build` 성공(경고 없음).
- MCP 인덱스: 387개 → 404개. 삭제된 문서 id 없음. 새 문서의 앵커를 빌드 HTML에서 확인.

### 확인하지 못했거나 남은 것

- `HostAccessID`를 실시간 반영하면 비교 값이 해시에서 원문으로 바뀌는 것으로 읽힘(소스 읽기만, 실행 미검증). 문서에 확인 필요로 표시.
- `IsPurgeContract` 삭제 조건의 세부, `/secrets` API 규칙, forbes의 전용 확장자(`.dbc` 등) 감시 여부는 확인 필요로 표시.
- `PUBLISH.md`의 `health-url`이 쓰이지 않는다는 서술은 소스에서 다시 확인하지 못함.
- IDE 소스(`qcn.winform`)가 이 디스크에 없어 IDE "외부에서 고칠 때 보존할 것" 절은 보류. 화면·바인딩·SQL 요약 참조의 줄 단위 대조, `plugins/handstack-plugins`의 구상 정리는 남음.
- GitHub Actions 실제 실행, 브라우저 화면 확인, 서버(Linux)에서 publish 실행은 하지 못했습니다.
