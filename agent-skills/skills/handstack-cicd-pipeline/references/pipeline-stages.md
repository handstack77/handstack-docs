# 단계별 구성

## 목차
1. 변경 범위 기반 정적 점검
2. 빌드
3. 패키징
4. 격리 스모크
5. CI 도구 골격 (미검증)
6. 환경 분리
7. 흔한 실패

표기: **[소스 확인]** 프레임워크 소스·스크립트에서 확인, **[문서]** 공식 문서 기준, **[골격]** 설계 제안이며 CI 도구에서 실행 검증이 필요.

## 1. 변경 범위 기반 정적 점검

전체 화면을 매번 막지 말고 **이번 변경에 포함된 화면·계약**을 점검한다. 기존 코드의 누적된 경고가 새 변경을 막지 않도록 하기 위해서다.

1. 변경 파일 목록을 구한다(`git diff --name-only <기준>...HEAD`).
2. 화면 파일(`…/view/…/{ID}.html|js`)과 계약 파일(`…/Contracts/**`)에서 화면·거래 ID를 뽑는다(파일명이 ID).
3. 각 ID마다 `python skills/handstack-source-trace/scripts/hs_inspect.py --root <모듈 루트> --screen <ID> --fail-on ERROR`.
4. 변경 HTML마다 `python skills/handstack-screen-development/scripts/design_lint.py <파일> --fail-on ERROR`(신규 화면은 `WARN`까지).
5. 변경 JS마다 `node --check <파일>`. 변경 `.txn/.json`은 JSON 파싱, `.dbc/.xml`은 XML 파싱.
6. 파이프라인·스크립트 파일은 `python skills/handstack-cicd-pipeline/scripts/pipeline_lint.py <루트> --fail-on ERROR`.
7. 계약만 바뀐 거래도 `--screen <거래 ID>`로 계약 단독 점검이 된다(화면이 없으면 `CONTRACT_ONLY`).

점검기는 정규식 기반 근사이므로 ERROR는 사람이 소스에서 확정한다. 오탐은 `--disable`이나 이슈로 남기고 파이프라인을 우회하지 않는다.

## 2. 빌드

- 의존성 복원: 저장소의 `install.*`(npm/libman 등 포함) 또는 `dotnet restore`. **[문서]** 로컬 기본은 `env → install → build`.
- 모듈은 `dotnet build -c Release <csproj>`. 모듈 csproj의 PreBuild/PostBuild가 `HANDSTACK_HOME`을 건드리는지 먼저 읽는다. **[소스 확인]** 프레임워크 `publish.ps1`은 모듈을 `dotnet build`(publish 아님)로 산출 폴더에 출력한다.
- 러너에서는 항상 임시 홈을 지정한다: `HANDSTACK_HOME=<작업폴더>/artifacts/home`, `HANDSTACK_SRC=<소스 루트>`.
- 빌드 성공은 계약 복사·DB 접속·화면 동작의 증거가 아니다. 5절 스모크가 그 역할을 한다.

## 3. 패키징

- **정적 리소스 번들링**: 프로젝트가 번들링 도구(`bundling` 계열, minify/compress)를 쓰면 **산출 폴더에서** 실행하고 소스 폴더에는 적용하지 않는다. 원본을 보존하는 옵션(예: `--keep`)이 있으면 사용한다. 번들 대상에서 외부 라이브러리(`lib` 등)는 제외한다.
- **계약 확장자 변환**: 서버는 `.json/.xml`과 `.txn/.dbc/.bas/.cyp/.pmt/.fnc/.rpo` 표기를 모두 읽는다. 프로젝트가 변환 표기를 쓰면 `handstack contractpack`을 파이프라인에 넣는다(백업 ZIP 생성). `publicTransactions.json`은 변환 대상이 아니다.
- **전체 배포 산출물**(`publish`): `./publish.ps1 win publish Release x64`(`os: win|linux|osx`, `action: build|publish`, `configuration: Debug|Release`, `arch: x64|arm64…`). **[소스 확인]** 기본 출력은 `../publish/{os}-{arch}/handstack`, 시작 시 대상 폴더 삭제, Release는 PDB 제거, CLI 도구는 단일 파일·프레임워크 종속(`self-contained=false`). `publish-optimize`(wwwroot 최적화) 호출은 스크립트에서 주석 처리되어 있어 `PUBLISH.md`의 설명과 다르다 — 스크립트가 기준이다.
- **업데이트 패키지**(`publish-package`) **[소스 확인 + PUBLISH.md]**: `make`(전체 목록 `deploy-filelist.txt`), `deploy-diff`(이전 목록과 비교해 `deploy-diff-filelist.txt`), `runtimes-diff`, `modules-diff`, `compress`(`deploy-YYYY.MM.NNN.zip` + 같은 이름 `.txt`). 목록 한 줄은 `C|U|D|상대경로|크기|MD5|시각`. 스캔 대상은 `app`, `assemblies`, `hosts`, `tools`, `modules` 다섯 영역뿐이다.
- 산출물에는 비밀을 넣지 않는다(설정 파일의 키·연결 문자열은 환경 변수/비밀 저장소).

## 4. 격리 스모크

배포 전에 **운영과 다른 홈**에서 산출물이 실제로 뜨는지 본다.

1. 임시 홈에 `app`, 필요한 `modules`, `contracts`를 구성한다(또는 Docker 이미지를 기동).
2. 필요한 모듈만으로 `ack`를 기동한다: `ack --port=<빈 포트> --modules=wwwroot,transact,dbclient[,function…]` **[문서]**.
3. `GET /checkip` 응답, 대표 화면 정적 파일 응답(`/{모듈}/…`), 대표 조회 거래 1건(`/transact/api/transaction/execute`), 업무 모듈의 동적 함수가 있으면 그 호출 1건.
4. DB가 필요한 거래는 CI용 테스트 DB를 쓰거나 "DB 미연결 스모크"로 범위를 명시한다. 운영 DB에 연결하지 않는다.
5. 프로세스를 포트로 종료한다(`handstack stop --port=…`). 인자 없는 `stop`은 다른 인스턴스를 종료할 수 있다.
6. 이 단계 이전에 **ack 외 호스트 버전이 .NET 런타임과 맞는지**(TargetFramework와 러너/이미지)를 확인한다.

## 5. CI 도구 골격 (미검증)

도구마다 문법이 다르므로 아래는 **단계를 옮겨 적는 골격**이다. 자격 증명·러너 이름은 사용자 환경에 맞게 정한다.

```groovy
// Jenkinsfile (선언형 골격)
pipeline {
  agent { label 'build' }
  options { disableConcurrentBuilds(); timestamps() }
  environment { HANDSTACK_HOME = "${env.WORKSPACE}/artifacts/home" }   // 공유 홈 금지
  stages {
    stage('정적 점검') { steps { sh 'python skills/handstack-cicd-pipeline/scripts/pipeline_lint.py . --fail-on ERROR' } }
    stage('빌드')     { steps { sh 'dotnet build -c Release modules/<모듈>/<모듈>.csproj' } }
    stage('스모크')   { steps { sh './scripts/smoke.sh' } }     // 임시 홈에서 ack 기동 → /checkip → 대표 거래
    stage('승인')     { when { branch 'main' } steps { input message: '운영 반영?' } }
    stage('배포')     { when { branch 'main' } steps { sh './scripts/deploy.sh' } }
  }
  post { always { archiveArtifacts artifacts: 'artifacts/release-record.json', allowEmptyArchive: true } }
}
```

```yaml
# GitHub Actions (골격)
name: build
on: { pull_request: {}, push: { branches: [main] } }
jobs:
  verify:
    runs-on: windows-latest
    env: { HANDSTACK_HOME: ${{ github.workspace }}/artifacts/home }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with: { dotnet-version: '10.0.x' }
      - run: python skills/handstack-cicd-pipeline/scripts/pipeline_lint.py . --fail-on ERROR
      - run: dotnet build -c Release modules/<모듈>/<모듈>.csproj
      - run: ./scripts/smoke.ps1
  deploy:
    needs: verify
    if: github.ref == 'refs/heads/main'
    environment: production        # 승인자를 환경에 지정
    runs-on: [self-hosted, deploy]
    steps:
      - run: ./scripts/deploy.ps1
        env: { DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }} }
```

- 액션 버전·.NET SDK 버전은 사용하는 도구 문서로 확인해 고정한다.
- 원격 서버 반영이 SSH면 비밀번호 없는 키 인증(Jenkins 사용자 SSH 키 → 대상 서버 `authorized_keys`, 권한 700/600)과 `rsync` 사용 방식이 **[문서]**에 있다. `--delete`는 대상 폴더를 한정해서 쓴다.

## 6. 환경 분리

- 환경 이름은 `ACK_ENVIRONMENT`(D/S/P)와 `appsettings.{환경}.json`, 환경 변수 `AppSettings__키`로 구분한다. 우선순위와 재시작 필요 여부는 `handstack-host-operations`의 설정 계층 절.
- 화면 쪽 `syn.config.json`은 환경별 파일을 두고 배포 때 하나만 복사하는 프로젝트가 많다. 파이프라인이 `대상 환경 ↔ 복사 원본 파일명`을 검사하고, 브라우저 세션 캐시 때문에 `SystemVersion`을 올리는지 확인한다.
- 개발 편의 설정(`IsEnabledDevAutoSignIn`)은 `D` 환경에만 둔다.

## 7. 흔한 실패

| 증상 | 원인 후보 |
|---|---|
| 배포했는데 예전 화면/계약 | 서버가 읽는 경로(원본/복사본), 파일 감시 꺼짐(재시작/`refresh`), 브라우저·`syn.config.json` 캐시 |
| 복사 중 파일 잠김 | 서비스·앱 풀을 먼저 정지하지 않음, 복사 재시도(`/R:2 /W:3`) |
| 다른 모듈 계약이 사라짐 | 공유 `contracts`를 미러링 |
| 기동 시 의존 DLL 오류 | 모듈 빌드 산출물 일부만 복사, 런타임 버전 불일치 |
| 컨테이너를 새 이미지로 바꿨는데 변경 없음 | 볼륨이 비어 있지 않아 시드가 복사되지 않음([배포 방식](deploy-methods.md)) |
| 파이프라인이 매번 실패 | 기존 화면의 누적 경고를 전수 점검에 포함 → 변경 범위만 점검 |
