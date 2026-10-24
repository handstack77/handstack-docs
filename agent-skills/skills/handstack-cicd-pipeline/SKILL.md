---
name: handstack-cicd-pipeline
description: HandStack 업무 모듈·계약·화면의 빌드, 검증, 패키징, 배포(CI/CD)를 설계·점검·개선한다. Jenkins·GitHub Actions·GitLab CI 같은 도구의 단계 구성, 모듈 빌드 후 HANDSTACK_HOME 복사·미러링, publish 산출물과 publish-package·deploy 호스트·updater 업데이트 패키지, ack Docker 이미지와 볼륨, 환경별 설정(syn.config.json·appsettings) 분리, 정적 리소스 번들링, 배포 후 스모크 확인, 릴리즈 기록과 롤백이 필요한 요청이면 사용한다. "배포 자동화", "Jenkins 잡 만들기", "파이프라인 점검", "운영 서버에 반영", "Docker로 배포", "롤백 방법" 같은 요청이며, 단순 로컬 실행 문제는 handstack-host-operations를 쓴다.
---

# HandStack CI/CD 파이프라인

HandStack의 빌드·배포는 대부분 **`HANDSTACK_HOME`이라는 실행 폴더를 바꾸는 부작용 작업**이다. 모듈 빌드 후처리, `publish`, 복사 스크립트, 컨테이너 볼륨이 모두 같은 폴더를 건드리므로, 파이프라인은 (1) 검증을 앞에 두고 (2) 빌드·테스트를 격리된 홈에서 하고 (3) 배포 방식을 하나로 정하고 (4) 기록과 롤백을 남기는 순서로 설계한다. CI 도구는 이 단계를 실행하는 껍데기일 뿐이므로 도구보다 단계와 게이트를 먼저 정한다.

## 시작 전에

1. 저장소의 `AGENTS.md`/`CLAUDE.md`와 기존 빌드·배포 스크립트(`build.*`, `publish.*`, `task.*`, `*-copy.*`, `post-build.*`, `Jenkinsfile`, `Dockerfile`)를 읽는다. **이미 운영 중인 파이프라인은 새로 만들지 않고 점검한 뒤 필요한 곳만 보완한다.**
2. 아래를 확정한다. 모르면 사용자에게 묻고, 추측으로 서버 주소나 계정을 만들지 않는다.
   - CI 도구와 러너 OS(Windows/Linux), 소스 저장소와 브랜치 전략
   - 배포 대상 형태: IIS/서비스/프로세스 관리자, 컨테이너, 업데이트 호스트(`deploy`/`updater`)
   - 환경(`ACK_ENVIRONMENT` D/S/P)별 설정 소스와 비밀 주입 방법
   - 롤백 허용 시간, 점검(무중단 여부), 승인 절차(운영은 수동 승인 권장)
3. 읽기 전용 점검기로 현황을 본다: `scripts/pipeline_lint.py <저장소 루트>` — 비밀 리터럴, 공유 폴더 미러링, 홈 삭제, 인자 없는 `handstack stop`, `publish`의 홈 격리 누락, 환경 혼재, Docker 기반 이미지 버전, 배포 호스트 키 공백을 찾는다(값은 마스킹, 결과는 후보).

## 파이프라인 단계와 게이트

각 단계는 실패하면 **다음 단계로 가지 않는다**. 명령과 CI 도구 골격은 [단계별 구성](references/pipeline-stages.md).

| # | 단계 | 내용 | 게이트 |
|---|---|---|---|
| 1 | 소스 고정 | 커밋 ID·브랜치 기록, 깨끗한 작업 폴더 | 빌드 대상 커밋이 기록됨 |
| 2 | 정적 점검 | 변경 화면·계약 점검(`hs_inspect.py`, `design_lint.py`), JSON/XML 파싱, `node --check`, `pipeline_lint.py` | ERROR 0, 비밀 0 |
| 3 | 빌드 | 의존성 복원, 모듈 Release 빌드 | 빌드 성공, 경고 정책 |
| 4 | 패키징 | 정적 리소스 번들링, 계약 확장자 변환(`contractpack`, 쓰는 경우), 필요 시 `publish` | 산출물 목록 생성 |
| 5 | 격리 스모크 | **임시 `HANDSTACK_HOME`**에 설치해 `ack` 기동, `/checkip`, 대표 거래 실행 | 응답 정상 |
| 6 | 릴리즈 기록 | 버전, 커밋, 모듈 목록, 대상 환경, 적용 설정 | 기록 저장 |
| 7 | 배포 | 선택한 방식([배포 방식](references/deploy-methods.md)), 운영은 승인 | 백업·롤백 경로 확인 |
| 8 | 배포 후 확인 | 헬스체크, 대표 거래, 로그 오류, 버전 확인 | 실패 시 자동 중단·롤백 안내 |

## 배포 방식 선택

| 방식 | 적합 | 핵심 주의 |
|---|---|---|
| 폴더 반영(복사/미러링 + 서비스 재시작) | 단일 서버, 업무 모듈·계약·정적 파일 중심 변경 | 공유 `contracts` 미러링 금지, 서비스 정지 후 복사, 설정 덮어쓰기 환경 확인 |
| `publish` + `publish-package` + `deploy` + `updater` | 여러 서버에 버전 단위 배포, 증분 업데이트 | `contracts`는 표준 패키지에 없음, 업로드 키 필수, 자동 롤백 없음 |
| Docker(`ack` 이미지) | 컨테이너 운영 | 볼륨이 비어 있을 때만 시드됨 → 이미지 교체가 기존 볼륨 내용을 갱신하지 않음 |

한 환경에는 한 방식만 쓴다. 섞으면 어느 쪽이 정본인지 알 수 없게 된다.

## 반드시 지킬 안전 규칙 (프레임워크 소스로 확인한 사실 포함)

- **`publish.*`는 대상 publish 폴더를 먼저 삭제하고 `HANDSTACK_HOME/contracts`도 삭제한다.** 그 뒤 모듈 빌드(후처리)가 다시 채운 경우에만 그 폴더를 산출물로 복사한다. 공유 홈에서 돌리지 말고 `HANDSTACK_HOME`을 작업 폴더 아래 임시 경로로 지정해서 실행한다.
- 모듈 빌드의 PostBuild가 `HANDSTACK_HOME`의 모듈 폴더를 삭제 후 복사하는 프로젝트가 많다. CI 러너의 홈과 운영 홈이 같은 경로를 가리키지 않게 한다.
- `robocopy /mir`, `rsync --delete`로 **여러 모듈이 공유하는 `contracts` 폴더**를 동기화하면 다른 모듈의 계약이 삭제된다. 모듈 전용 폴더(`modules/{모듈}/Contracts`)만 미러링하거나 공유 폴더는 `/e`(추가 복사)를 쓴다. `robocopy` 종료 코드 0~7은 성공이고 8 이상이 실패다.
- 인자 없는 `handstack stop`, `purgecontracts`, `HANDSTACK_HOME` 삭제 명령은 대상 경로를 출력해 확인한 뒤에만 실행한다.
- 배포 호스트(`deploy`)의 `ManagementKey`가 비어 있으면 **업로드 API가 인증 없이 열린다.** 운영은 키를 환경 변수로 주입하고 네트워크를 제한한다. `updater`는 매니페스트의 SHA-256·크기를 검증하고(서명 검증 로직은 보이지 않는다) 매니페스트·패키지 경로는 HTTPS와 접근 제어로 보호한다.
- 설정 파일 덮어쓰기(`syn.config.json`, `appsettings.*`)는 **배포 대상 환경 이름과 소스 파일 이름이 일치**하는지 파이프라인이 검사한다(운영 잡에서 개발 설정을 복사하는 실수를 막는다).
- 비밀(API 토큰, 계정, 키, 연결 문자열, `HostAccessID`)은 스크립트·문서·저장소에 평문으로 두지 않고 CI 비밀 저장소나 환경 변수로 주입한다. 이미 평문으로 노출된 비밀은 폐기·재발급한다.
- 운영 서버 파일을 직접 수정하지 않는다. 직접 수정이 필요했다면 릴리즈 기록에 남기고 소스에 되돌린다.

## 릴리즈 기록과 롤백

[릴리즈와 롤백](references/release-and-rollback.md)의 기록 항목(빌드 시각, 브랜치·커밋, `publish` 매개변수, 모듈 목록, 대상 환경, 적용 설정, 배포 후 확인 결과)을 매 배포마다 남긴다. 롤백은 배포 **전에** 이전 산출물·계약·설정의 백업 위치와 복원 절차를 정해 둔다. 롤백 지점은 데이터 변경(DDL/DML)과 코드가 같이 있을 때 코드만 되돌려 해결되지 않는다는 점을 계획에 적는다.

## 완료 보고에 포함

선택한 방식과 이유, 단계·게이트 표, 파이프라인 정의 파일 목록, `pipeline_lint.py` 결과와 조치, **실행하지 못한 항목**(실제 CI 실행, 운영 반영, 롤백 리허설)과 이유, 사용자가 CI 도구에서 해야 할 설정(자격 증명 등록, 잡 승인자, 러너 준비). 실행으로 검증하지 않은 YAML/Jenkinsfile은 "골격이며 도구에서 실행 검증 필요"라고 명시한다.

## 같이 쓰는 스킬

서버 실행·설정 `handstack-host-operations` · 화면·계약 점검 `handstack-source-trace`, `handstack-screen-development` · 업무 모듈 구조와 PostBuild `handstack-module-development` · 규칙 검증 `handstack-rules-and-verification` · 장애 `handstack-troubleshooting`.

## 문서

MCP `twelvefactor/빌드-릴리즈-실행/*`(빌드·릴리즈 절차, Windows 서버 호스팅, Jenkins 원격 배포 키 설정), `twelvefactor/관리작업/*`, `twelvefactor/설정/*`. 서버 저장소의 `PUBLISH.md`, `1.WebHost/ack/README.md`(Docker), `1.WebHost/deploy/README.md`, `4.Tool/CLI/updater/README.md`.
