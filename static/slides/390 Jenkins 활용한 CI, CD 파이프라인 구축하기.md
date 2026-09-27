---
marp: true
theme: gaia
_class: lead
footer: QCN
paginate: true
backgroundColor: #fff
---

<style>
:root {
  font-family: Pretendard;
  --border-color: #303030;
  --text-color: #0a0a0a;
  --bg-color-alt: #dadada;
  --mark-background: #ffef92;
}

h1 {
  border-bottom: none;
  font-size: 1.6em;
}

h2 {
  border-bottom: none;
  font-size: 1.3em;
}

h3 {
  font-size: 1.1em;
}

h4 {
  font-size: 1.05em;
}

h5 {
  font-size: 1em;
}

h6 {
  font-size: 0.9em;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  color: var(--text-color);
}

code:not([class*="language-"]) {
  font-family: D2Coding;
  color: #000;
  vertical-align: text-bottom;
  background-color: rgba(100, 100, 100, 0.2);
}

section {
  padding: 1rem;
  border-bottom: 1px solid #000;
  background-image: linear-gradient(to bottom right, #f7f7f7 0%, #d3d3d3 100%);
}

section > h2 {
  border-bottom: 4px solid #17344f;
}

section table {
    margin: auto;
    margin-top: 1rem;
    font-size: 28px;
}

section::after {
  font-size: 0.75em;
  content: attr(data-marpit-pagination) " / " attr(data-marpit-pagination-total);
}

img[alt~="center"] {
  display: block;
  margin: 0 auto;
}

blockquote {
  font-size: 26px;
  border-left: 8px solid var(--border-color);
  background: var(--bg-color-alt);
  margin: 0.5em;
  padding: 0.5em;
}

blockquote::before,
blockquote::after {
    content: '';
}

mark {
  background-color: var(--mark-background);
  padding: 0 2px 2px;
  border-radius: 4px;
  margin: 0 2px;
}

section.tinytext>p,
section.tinytext>ul,
section.tinytext>blockquote {
  font-size: 0.65em;
}

/* Long examples are paginated; keep reference text readable. */
section.reference-page { justify-content: flex-start; }
section.reference-page pre,
section.reference-page marp-pre,
section.reference-page pre code,
section.reference-page marp-pre code { font-size: 24px; line-height: 1.25; }
section.reference-page table { font-size: 25px; }
section.reference-page img { max-height: 440px; max-width: 100%; object-fit: contain; }
</style>

# Jenkins 활용한 CI, CD 파이프라인 구축하기

Jenkins에서 빌드와 원격 작업을 분리하고, 권한·로그·결과물로 실행을 검증합니다.


<!--
발표: 첫 화면의 목표를 말한 뒤 핵심 개념과 예제로 진행합니다. 확인 질문 뒤에는 답할 시간을 주고, 마지막 완료 기준을 남겨 질문을 받습니다.
발표 구성 참고: MIT OpenCourseWare, Patrick Winston, How to Speak (2018), https://ocw.mit.edu/courses/res-tll-005-how-to-speak-january-iap-2018/pages/how-to-speak/
-->

---

## Windows 서버에 필요한 권장 프로그램 목록 (1/2)

<!-- _class: reference-page -->



아래 파일명은 교육 환경의 고정 버전 예시입니다. 새 설치에서는 대상 런타임·Jenkins 지원 Java 버전을 먼저 확인합니다.

[.NET](https://dotnet.microsoft.com/download) · [Jenkins 설치](https://www.jenkins.io/doc/book/installing/) · [Node.js](https://nodejs.org/en/download) · [Git](https://git-scm.com/downloads)

- dotnet-hosting-10.0.100-win.exe

- dotnet-sdk-10.0.100-win-x64.exe

- Git-2.50.1-64-bit.exe

---

## Windows 서버에 필요한 권장 프로그램 목록 (2/2)

<!-- _class: reference-page -->



- jenkins.msi

- node-v22.17.0-x64.msi

- npp.8.8.3.Installer.x64.exe

- OpenJDK21U-jdk_x64_windows_hotspot_21.0.7_6.msi

- VSCodeUserSetup-x64-1.101.2.exe

- WinSCP-6.5.2-Setup.exe

---

## 프로그램 한번에 설치하기 (1/3)

`winget`을 사용하여 개발에 필요한 기본 프로그램들을 한번에 설치합니다.

> `winget --version`으로 사용 가능 여부를 확인합니다. OS·App Installer 설치 상태에 따라 다릅니다. [공식 설치 조건](https://learn.microsoft.com/windows/package-manager/winget/)을 참고합니다.

배치 파일 생성: 관리자 권한으로 CMD 또는 PowerShell을 실행하고 다음 명령어로 `winget-packages.json` 파일을 생성합니다.

```bash
notepad winget-packages.json
```

---

## 프로그램 한번에 설치하기 (2/3) · 세부 1/3

<!-- _class: reference-page -->



설치 목록 붙여넣기: 메모장이 열리면 아래 JSON 내용을 전체 복사하여 붙여넣고 저장합니다.

---

## 프로그램 한번에 설치하기 (2/3) · 세부 2/3

<!-- _class: reference-page -->



```json
{
    "$schema": "https://aka.ms/winget-packages.schema.2.0.json",
    "Sources": [
    {
        "Packages": [
        { "PackageIdentifier": "Git.Git" },
        { "PackageIdentifier": "Notepad++.Notepad++" },
        { "PackageIdentifier": "TortoiseGit.TortoiseGit" },
        { "PackageIdentifier": "OpenJS.NodeJS.LTS" },
        { "PackageIdentifier": "Microsoft.DotNet.SDK.10" },
        { "PackageIdentifier": "WinSCP.WinSCP" },
        { "PackageIdentifier": "Microsoft.VisualStudioCode" },
        { "PackageIdentifier": "Microsoft.WindowsTerminal" }
        ]
```

<!-- 이어지는 코드 조각입니다. 앞뒤 페이지를 순서대로 읽으며 전체 예제의 일부임을 설명합니다. -->

---

## 프로그램 한번에 설치하기 (2/3) · 세부 3/3

<!-- _class: reference-page -->



```json
    },
    {
        "Packages": [
          { "PackageIdentifier": "9NRWMJP3717K" }
        ]
    }
    ]
}
```

<!-- 이어지는 코드 조각입니다. 앞뒤 페이지를 순서대로 읽으며 전체 예제의 일부임을 설명합니다. -->

---

## 프로그램 한번에 설치하기 (3/3)

일괄 설치 실행: winget-packages.json 저장 후 명령 프롬프트에서 다음 명령어를 실행하여 목록의 모든 프로그램을 설치합니다.

```bash
winget import --import-file winget-packages.json
```
> [대상 .NET 버전의 Hosting Bundle 확인](https://dotnet.microsoft.com/download/dotnet)
> [jenkins.msi 다운로드](https://www.jenkins.io/download/thank-you-downloading-windows-installer-stable/)

---

## Jenkins 설치 및 초기 설정 (1/2) · 세부 1/2 (1/2)

<!-- _class: reference-page -->



Jenkins 설치 전 JAVA_HOME 환경변수를 설정합니다.
> 예) 관리자 권한으로 명령 프롬프트에서 실행
> ```bash
> setx JAVA_HOME "C:\Program Files\Microsoft\jdk-21.0.7.6-hotspot\"
> ```



---

## Jenkins 설치 및 초기 설정 (1/2) · 세부 1/2 (2/2)

<!-- _class: reference-page -->



- Jenkins 다운로드 및 설치
  - 설치 중 JDK 경로를 묻는 단계에서 이전 단계에서 확인한 `JAVA_HOME` 경로 입력
  - 설치 완료 후 관리도구 > `서비스`에서 Jenkins 서비스 실행 확인

---

## Jenkins 설치 및 초기 설정 (1/2) · 세부 2/2

<!-- _class: reference-page -->



- Jenkins 초기 환경 설정
    - 웹 브라우저에서 `http://localhost:8080` 접속

---

## Jenkins 설치 및 초기 설정 (2/2) · 세부 1/2 (1/2)

<!-- _class: reference-page -->



처음 Jenkins 을 실행 할 때 다음과 같이 입력

- 초기 관리자 비밀번호 확인

```bash
type C:\ProgramData\Jenkins\.jenkins\secrets\initialAdminPassword
```



---

## Jenkins 설치 및 초기 설정 (2/2) · 세부 1/2 (2/2)

<!-- _class: reference-page -->



- 플러그인 설치: `Install suggested plugins` 선택

- 관리자 계정 생성
    - 계정명: `handstack`, 암호: `[Strong@Passw0rd]`
    - 이름: `handstack`, 이메일 주소: `handstack@handstack.kr`

---

## Jenkins 설치 및 초기 설정 (2/2) · 세부 2/2

<!-- _class: reference-page -->



- Instance Configuration
    - Jenkins URL은 기본값 `http://localhost:8080/`으로 두고 저장

---

## Jenkins 프로젝트: HandStack-Build (1/4) · 세부 1/2

<!-- _class: reference-page -->



- 프로젝트 생성
  - `New Item` 클릭 > 이름 `HandStack-Build` 입력 > `Freestyle project` 선택

- 소스 코드 관리 설정
  - `Source Code Management` 탭 > `Git` 선택
  - Repository URL: `https://github.com/handstack77/handstack.git`
  - Credentials: `none` (공개 저장소)
  - Branch Specifier: `*/master`

---

## Jenkins 프로젝트: HandStack-Build (1/4) · 세부 2/2

<!-- _class: reference-page -->



> 소스는 `C:\ProgramData\Jenkins\.jenkins\workspace\HandStack-Build`에 다운로드됩니다. 그래서 `C:/workspace/handstack` 와 같이 작업 실행 할 때 소스를 일반 디렉토리로 복사합니다.

---

## Jenkins 프로젝트: HandStack-Build (2/4) · 세부 1/2

<!-- _class: reference-page -->



- Build Steps (최초 설치)

> 아래 복사·정리 스크립트는 파일을 덮어쓰거나 삭제할 수 있습니다. 전용 작업 폴더에서 원본·대상 절대 경로를 확인하고 백업 후 사용합니다.
  - `Add build step` > `Execute Windows batch command`
  - 아래 스크립트로 Jenkins 작업 공간의 소스를 `C:/workspace/handstack`으로 복사

---

## Jenkins 프로젝트: HandStack-Build (2/4) · 세부 2/2

<!-- _class: reference-page -->



```bash
chcp 65001

echo Copying HandStack source files...
robocopy "%WORKSPACE%" "C:/workspace/handstack" /E /R:2 /W:3

if %ERRORLEVEL% LEQ 7 (
    echo Files copied successfully!
    exit /b 0
) else (
    echo Copy failed with error code: %ERRORLEVEL%
    exit /b 1
)
```

- 저장 후 `Build Now` 실행

---

## Jenkins 프로젝트: HandStack-Build (3/4)

- 최초 설치 후 수동 작업
  - 빌드가 성공하면, 명령 프롬프트에서 `C:/workspace/handstack` 경로로 이동 후 `install.bat`를 실행하여 빌드 환경을 구성합니다.
  - 빌드가 완료 되면 `C:/workspace/build/handstack` 경로에 `install.bat`, `package.json` 파일을 복사합니다.
  - `C:/workspace/build/handstack` 경로로 이동 후 `install.bat`를 실행하여 실행 환경을 구성합니다.

> `winget`을 사용할 수 없는 환경에서는 install.bat의 의존성을 확인하고 공식 설치 프로그램으로 준비합니다. OS 이름만으로 설치 가능 여부를 판단하지 않습니다.

---

## Jenkins 프로젝트: HandStack-Build (4/4)

- Build Steps 설정

`Add build step` → `Execute Windows batch command`

```bash
chcp 65001
SET HANDSTACK_HOME=C:/workspace/build/handstack
SET HANDSTACK_SRC=C:/workspace/handstack
cd /d C:/workspace/handstack
call build.bat || exit /b 0
```

---

## 잠깐, 구분해 보기

원격 TASK_COMMAND를 그대로 실행해도 될까요?

<!--
질문 후 잠시 기다립니다. 답이 없으면 앞에서 본 예제를 다시 가리킵니다.
확인할 답: 허용할 명령·인자와 작업 경로를 제한하고 Jenkins 실행 계정의 권한을 최소화해야 합니다.
다음 주제로 넘어가기 전에 차이를 청중의 표현으로 한 번 확인합니다.
-->

---

## Jenkins 프로젝트: wwwroot-Task (1/4) · 세부 1/2

<!-- _class: reference-page -->



원격에서 wwwroot의 `task.bat`를 호출합니다. 호출 권한을 제한하고 TASK_COMMAND·TASK_SETTING·TASK_ARGUMENTS는 서버의 허용 목록으로 검증합니다. 임의 문자열을 셸 명령으로 실행하지 않습니다.

- API Token 발급
  - Jenkins Dashboard > `사용자 아이콘` > `Configure` > `API Token`
  - `Add new Token` 클릭 후 이름(`wwwroot-Task`) 입력
  - `Generate` 후 생성된 토큰 복사/보관

---

## Jenkins 프로젝트: wwwroot-Task (1/4) · 세부 2/2

<!-- _class: reference-page -->



- 프로젝트 생성
  - `New Item` > `wwwroot-Task` > `Freestyle project`
  - `이 빌드는 매개변수가 있습니다` 체크
  - 매개변수 추가 (모두 String 타입)
    - `TASK_COMMAND`
    - `TASK_SETTING`
    - `TASK_ARGUMENTS`

---

## Jenkins 프로젝트: wwwroot-Task (2/4)

이전에 했던 2 과정을 동일하게 적용합니다.

- Jenkins 프로젝트: HandStack-Build (1/4)
- Jenkins 프로젝트: HandStack-Build (2/4)

---

## Jenkins 프로젝트: wwwroot-Task (3/4)

- Build Steps 설정

`Add build step` → `Execute Windows batch command`

```bash
chcp 65001
SET HANDSTACK_HOME=C:/workspace/build/handstack
SET HANDSTACK_SRC=C:/workspace/handstack
cd C:/workspace/handstack/2.Modules/wwwroot
task.bat "%TASK_COMMAND%" "%TASK_SETTING%" "%TASK_ARGUMENTS%"
```

---

## Jenkins 프로젝트: wwwroot-Task (4/4)

Jenkins 에 등록된 wwwroot-Task 작업 빌드를 CLI 에서 원격으로 실행하고 결과를 모니터링합니다.

이것을 응용해서 업무에 따라 다양한 시나리오에 필요한 배포 업무를 자동화 합니다.

```bash
node wwwroot-task.js [TASK_COMMAND] [TASK_SETTING] [TASK_ARGUMENTS]
node wwwroot-task.js "copy"
node wwwroot-task.js "www"
node wwwroot-task.js "syn"
node wwwroot-task.js --help
```

[wwwroot-task.js Node.js 파일 다운로드](assets/wwwroot-task.js)

---

## Jenkins 추가 설정 (1/2)

<!-- _class: reference-page -->



한글 로그 인코딩을 설정합니다. 외부 요청 수락은 별도 선택 사항입니다.

> `0.0.0.0`은 모든 인터페이스에 노출합니다. 기본 실습은 localhost로 제한하고, 외부 접근은 TLS·방화벽·인증·권한을 준비한 뒤 허용합니다.

- 관리자 권한으로 `C:\Program Files\Jenkins\jenkins.xml` 파일 열기

---

## Jenkins 추가 설정 (2/2)

<!-- _class: reference-page -->



`jenkins.xml`의 `<arguments>` 예시입니다. 외부 공개 조건은 앞 페이지를 확인합니다.

```xml
<arguments>
  -Dfile.encoding=UTF-8 -Xrs -Xmx256m
  -Dhudson.lifecycle=hudson.lifecycle.WindowsServiceLifecycle
  -jar "C:\Program Files\Jenkins\jenkins.war"
  --httpListenAddress=0.0.0.0 --httpPort=8080
  --webroot="%ProgramData%\Jenkins\war"
</arguments>
```

- `서비스` 관리창에서 Jenkins 서비스 재시작

---

## 파이프라인의 완료 기준

- 서비스 계정·JDK·SDK와 작업 경로를 확인합니다.
- HandStack-Build 결과를 확인한 뒤 wwwroot-Task를 분리해 시험합니다.
- API 토큰·입력 인자·외부 접근을 제한하고 빌드 로그와 복구 방법을 남깁니다.

<!--
질문을 받는 동안 이 확인 기준을 화면에 남깁니다. 청중이 자신의 업무에 적용할 다음 행동 하나를 고르게 합니다.
-->
