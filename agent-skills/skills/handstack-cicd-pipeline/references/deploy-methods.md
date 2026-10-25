# 배포 방식

배포 방식별 명세(명령, 목록 형식, updater 옵션, 이미지 구조)의 대표 문서는 사이트의 `twelvefactor/빌드-릴리즈-실행/업데이트-패키지-배포`와 `twelvefactor/빌드-릴리즈-실행/Docker-ack-이미지`다. 이 문서는 방식을 고르는 기준과 함정만 둔다. 문서와 소스가 다르면 소스(`4.Tool/CLI/updater`, `4.Tool/CLI/publish-package`, `1.WebHost/ack`)를 따른다.

## 목차
1. 폴더 반영 (복사·미러링 + 재시작)
2. 업데이트 패키지 (publish-package → deploy → updater)
3. Docker (ack 이미지)
4. 방식 간 비교와 선택

표기: **[소스 확인]** 소스에서 확인, **[문서]** 문서 기준, **[읽기]** 코드를 읽은 해석(실행 미검증).

## 1. 폴더 반영 (복사·미러링 + 재시작)

단일 서버(IIS 호스팅, 서비스, 프로세스 관리자)에서 업무 모듈 변경분을 `HANDSTACK_HOME`에 반영하는 가장 흔한 방식이다.

순서:
1. 소스를 고정 작업 경로로 동기화한다(러너 임시 폴더에 의존하지 않기 위해). `robocopy <원본> <작업경로> /E /R:2 /W:3`, 종료 코드 8 이상이면 실패 처리.
2. **서비스를 정지**한다(IIS 앱 풀 정지, 서비스/프로세스 정지). 파일 잠김을 피하는 목적이다. 정지 명령 실패가 배포를 막지 않게 `|| exit /b 0` 같은 처리를 했다면 로그에 남긴다.
3. 모듈 빌드 후 산출물을 복사한다: 모듈 DLL·`module.json`, `Contracts`, `wwwroot`, `Settings`, 리포트 서식 등.
4. 환경 설정을 적용한다: `handstack configuration --appsettings=<프리셋>`(CLI), 화면 설정 파일 복사.
5. (필요 시) 산출 폴더에서 정적 리소스 번들링.
6. 서비스를 시작하고 8단계 확인(헬스체크, 대표 거래).

주의:
- **미러링 범위**: 모듈 전용 폴더(`modules/{모듈}/Contracts`, `modules/{모듈}/wwwroot`)는 미러링(`/MIR`)해도 되지만, 여러 모듈이 같이 쓰는 `HANDSTACK_HOME/contracts`는 `/E`(추가 복사)만 쓴다. 한 모듈의 `/MIR`이 다른 모듈의 계약을 지운다. **[읽기]** 실제 업무 프로젝트의 복사 스크립트에서 공유 `contracts`를 `/mir`로 동기화하는 사례가 있다.
- 복사 후 서버가 계약을 다시 읽는지(파일 감시, `refresh`, 재시작)를 확인한다.
- 환경 설정 덮어쓰기는 **대상 환경과 같은 이름의 파일**만 사용한다. 개발 설정 파일을 복사하는 운영 잡은 의도된 것인지 확인한다.
- 빌드 서버와 실행 서버가 같으면 빌드 중 실행 폴더가 바뀐다. 분리하거나 5단계 격리 스모크를 거친 산출물만 복사한다.
- 롤백을 위해 반영 전에 `app`, `modules/{모듈}`, `contracts`, 환경 설정의 사본을 만든다.

## 2. 업데이트 패키지 (publish-package → deploy → updater)

여러 서버에 버전 단위로 배포하고 증분 업데이트를 하는 방식이다. 흐름은 `publish` → `publish-package make`/`deploy-diff`/`compress` → `deploy` 업로드 → `updater` 적용이다.

점검·함정:
- `publish.*`는 대상 폴더와 홈의 `contracts`를 삭제하므로 **격리된 `HANDSTACK_HOME`에서 실행**한다. 기본 산출물에는 `hosts/`(agent·deploy·forbes)가 없다(`publish.ps1`에서 해당 게시가 주석 처리됨). **[소스 확인]**
- `--publishpath`는 `…/publish/win-x64`가 아니라 `…/publish/win-x64/handstack` 자체여야 한다. 다음 배포의 `--prevfile`은 diff 목록이 아니라 **전체 목록 `deploy-filelist.txt`**이므로 매 배포마다 보관한다.
- 표준 ZIP은 `app`, `assemblies`, `hosts`, `tools`, `modules` 다섯 영역만 만든다. `contracts/`와 루트 파일(`install.*`, `THIRD-PARTY-NOTICES.md`)은 포함되지 않으므로 계약은 별도 방식(폴더 반영, 계약 동기화)으로 배포한다.
- **`deploy`의 `ManagementKey`가 비어 있으면 업로드가 인증 없이 허용된다**(키 미설정이면 필터가 통과). 운영은 키를 환경 변수로 주입하고 업로드 경로를 내부망이나 승인된 러너로 제한한다. **[소스 확인]**
- 적용 중 오류가 나면 종료 코드 1로 끝나고 **`ack`를 다시 띄우지 않으며 자동 복원도 하지 않는다**(`backup/<시각>/<버전>/`에서 수동 복원). 실패 시 실행 중이던 프로세스가 이미 종료된 상태일 수 있으므로 모니터링과 재기동 절차를 둔다. **[소스 확인 + 읽기]**
- 매니페스트의 `mandatory`는 현재 소스에서 쓰인다. `true`이고 `--ack-process-id`가 있으면 updater가 적용 직전에 `ack`를 강제 종료하고, `false`이면 `ack`를 종료하지도 재기동하지도 않는다(파일 잠금과 재시작 순서는 파이프라인 책임). `PUBLISH.md`의 "`mandatory` 미사용" 서술은 낡았다. `health-url`은 받지만 업데이트 후 헬스체크는 하지 않으니 헬스 체크는 파이프라인이 한다. **[소스 확인]**
- 실행 중인 `ack`에서 updater를 띄우는 `/manifest?launch=true`는 `AppSettings:IsAutoUpdate=true`(기본 `false`)가 전제이고 아니면 `403`이다. 그 설정을 사용자 요청 없이 켜지 않는다. **[소스 확인]**
- `deploy`의 `DefaultChannel`/`DefaultPlatform`은 읽지 않는다. 같은 버전을 다시 올리면 기존 항목을 대체한다는 서술은 `PUBLISH.md` 기준이며 코드에서 직접 확인하지 못했다.

## 3. Docker (ack 이미지)

`1.WebHost/ack/Dockerfile`은 빌드 단계에서 `ack`, CLI, 기본 모듈 6개(`dbclient`, `function`, `logger`, `repository`, `transact`, `wwwroot`), `contracts`, `assemblies`를 시드에 만들고, `docker-entrypoint.sh`가 시작할 때 시드를 `HANDSTACK_HOME`(`/handstack`)으로 복사한 뒤 `dotnet ack.dll`을 실행한다. **[소스 확인]**

핵심 주의:
- **시드 복사는 대상 폴더가 비어 있을 때만** 일어난다(`app`, `modules`, `contracts`, `assemblies`, `node_modules` 각각). 이미 채워진 볼륨에는 새 이미지의 `ack`/모듈/계약이 복사되지 않으므로 **이미지 교체만으로 앱이 업데이트되지 않는다.** 볼륨 내용을 명시적으로 교체하거나, 새 볼륨을 쓰거나, `updater`/폴더 반영 방식을 병행하는 정책을 정한다.
- `graphclient`, `command`, `prompter`, `forwarder`는 이미지에 없다. 쓰려면 이미지를 고치거나 홈의 `modules/`에 직접 넣는다.
- `1.WebHost/ack/docker-compose.yml`은 홈 전체를 `/handstack` 한 곳에 마운트한다(`HANDSTACK_HOME_HOST` 필수, `ACK_ENVIRONMENT=P`, 포트 8421). 개별 볼륨(`contracts`, `log`, `modules`, `sqlite`, `storage`)을 따로 마운트하는 구성은 저장소 루트의 구형 `docker-compose.yml` 것이다.
- 저장소 루트의 `Dockerfile`은 `aspnet:8.0`을 쓰고 `releases/latest` ZIP을 내려받는 구형 구성이다. 대상 프레임워크(net10.0)와 맞지 않고 버전이 고정되지 않아 재현되지 않는다. 새 배포에는 `1.WebHost/ack/Dockerfile` 계열을 쓰거나, 업무 모듈용 Dockerfile을 만든다면 기반 이미지를 대상 TargetFramework와 맞추고 버전을 고정한다(`pipeline_lint.py`의 `docker-base`, `docker-unpinned`).
- 비밀은 `--env-file`/오케스트레이터 비밀로 주입하고 이미지에 굽지 않는다. 컨테이너 로그: `docker logs --tail 300 -f <이름>`.

## 4. 방식 간 비교와 선택

| 질문 | 폴더 반영 | 업데이트 패키지 | Docker |
|---|---|---|---|
| 서버 수 | 1~소수 | 다수 | 다수/오케스트레이션 |
| 계약·정적 파일만 자주 변경 | 적합 | `contracts` 제외라 별도 필요 | 볼륨 내용 교체 필요 |
| 롤백 | 백업 복원 | 백업 폴더 수동 복원 | 이전 이미지 + 이전 볼륨 |
| 재현성 | 스크립트 의존 | 버전 ZIP | 이미지 태그 |
| 위험 지점 | 공유 `/MIR`, 설정 혼재 | 업로드 키 공백, 적용 중 실패 | 볼륨 시드 규칙, 기반 이미지 버전 |

선택 후에는 그 방식의 롤백을 한 번 리허설한다(비운영 환경).
