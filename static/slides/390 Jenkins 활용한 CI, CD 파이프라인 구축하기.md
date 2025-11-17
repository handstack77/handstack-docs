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
</style>

# Jenkins 활용한 CI, CD 파이프라인 구축하기

### Windows 서버에 Jenkins 환경 설정하기

---

## Windows 서버에 필요한 권장 프로그램 목록

다음의 프로그램 명을 검색 또는 ChatGPT 에게 물어보면 다운로드 주소를 찾을 수 있습니다.

<style scoped>
  li {font-size: 28px;}
</style>

- dotnet-hosting-10.0.100-win.exe
- dotnet-sdk-10.0.100-win-x64.exe
- Git-2.50.1-64-bit.exe
- jenkins.msi
- node-v22.17.0-x64.msi
- npp.8.8.3.Installer.x64.exe
- OpenJDK21U-jdk_x64_windows_hotspot_21.0.7_6.msi
- VSCodeUserSetup-x64-1.101.2.exe
- WinSCP-6.5.2-Setup.exe

---

## 프로그램 한번에 설치하기 (1/3)

`winget`을 사용하여 개발에 필요한 기본 프로그램들을 한번에 설치합니다.

> 참고: `winget`은 Windows 10 1809+, Windows Server 2022+ 에서 기본 제공됩니다.
> 하위 버전에서는 직접 설치해야 합니다.

배치 파일 생성: 관리자 권한으로 CMD 또는 PowerShell을 실행하고 다음 명령어로 `winget-packages.json` 파일을 생성합니다.

```bash
notepad winget-packages.json
```

---

<section class="tinytext">

## 프로그램 한번에 설치하기 (2/3)

설치 목록 붙여넣기: 메모장이 열리면 아래 JSON 내용을 전체 복사하여 붙여넣고 저장합니다.

<style scoped>
  marp-pre code {font-size: 14px;}
</style>

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
        { "PackageIdentifier": "Microsoft.DotNet.SDK.8" },
        { "PackageIdentifier": "WinSCP.WinSCP" },
        { "PackageIdentifier": "Microsoft.VisualStudioCode" },
        { "PackageIdentifier": "Microsoft.WindowsTerminal" }
        ]
    },
    {
        "Packages": [
          { "PackageIdentifier": "9NRWMJP3717K" }
        ]
    }
    ]
}
```

</section>

---

## 프로그램 한번에 설치하기 (3/3)

일괄 설치 실행: winget-packages.json 저장 후 명령 프롬프트에서 다음 명령어를 실행하여 목록의 모든 프로그램을 설치합니다.

```bash
winget import --import-file winget-packages.json
```
> [dotnet-hosting-10.0.100-win.exe 다운로드](https://dotnet.microsoft.com/en-us/download/dotnet/thank-you/runtime-aspnetcore-10.0.100-windows-hosting-bundle-installer)
> [jenkins.msi 다운로드](https://www.jenkins.io/download/thank-you-downloading-windows-installer-stable/)

---

## Jenkins 설치 및 초기 설정 (1/2)

Jenkins 설치 전 JAVA_HOME 환경변수를 설정합니다.
> 예) 관리자 권한으로 명령 프롬프트에서 실행
> ```bash
> setx JAVA_HOME "C:\Program Files\Microsoft\jdk-21.0.7.6-hotspot\"
> ```

- Jenkins 다운로드 및 설치
  - 설치 중 JDK 경로를 묻는 단계에서 이전 단계에서 확인한 `JAVA_HOME` 경로 입력
  - 설치 완료 후 관리도구 > `서비스`에서 Jenkins 서비스 실행 확인

- Jenkins 초기 환경 설정
    - 웹 브라우저에서 `http://localhost:8080` 접속

---

## Jenkins 설치 및 초기 설정 (2/2)

처음 Jenkins 을 실행 할 때 다음과 같이 입력

- 초기 관리자 비밀번호 확인
  ```bash
  type C:\ProgramData\Jenkins\.jenkins\secrets\initialAdminPassword
  ```
- 플러그인 설치: `Install suggested plugins` 선택
- 관리자 계정 생성
    - 계정명: `handstack`, 암호: `[Strong@Passw0rd]`
    - 이름: `handstack`, 이메일 주소: `handstack@handstack.kr`
- Instance Configuration
    - Jenkins URL은 기본값 `http://localhost:8080/`으로 두고 저장

---

## Jenkins 프로젝트: HandStack-Build (1/4)

- 프로젝트 생성
  - `New Item` 클릭 > 이름 `HandStack-Build` 입력 > `Freestyle project` 선택

- 소스 코드 관리 설정
  - `Source Code Management` 탭 > `Git` 선택
  - Repository URL: `https://github.com/handstack77/handstack.git`
  - Credentials: `none` (공개 저장소)
  - Branch Specifier: `*/master`

> 소스는 `C:\ProgramData\Jenkins\.jenkins\workspace\HandStack-Build`에 다운로드됩니다. 그래서 `C:/workspace/handstack` 와 같이 작업 실행 할 때 소스를 일반 디렉토리로 복사합니다.

---

## Jenkins 프로젝트: HandStack-Build (2/4)

- Build Steps (최초 설치)
  - `Add build step` > `Execute Windows batch command`
  - 아래 스크립트로 Jenkins 작업 공간의 소스를 `C:/workspace/handstack`으로 복사

<style scoped>
  marp-pre code {font-size: 14px;}
</style>

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

> 참고: Windows 10 이하, Windows Server 2019 이하에서는 `install.bat` 파일을 텍스트 편집기에서 `winget` 명령어가 실행되지 않기 때문에 관련 부분을 주석 처리해야 합니다.

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

## Jenkins 프로젝트: wwwroot-Task (1/4)

원격에서 wwwroot 모듈에 있는 `task.bat` 배치 스크립트를 동적 매개변수로 실행하여 배포 과정을 자동화합니다.

<style scoped>
  li {font-size: 24px;}
</style>

- API Token 발급
  - Jenkins Dashboard > `사용자 아이콘` > `Configure` > `API Token`
  - `Add new Token` 클릭 후 이름(`wwwroot-Task`) 입력
  - `Generate` 후 생성된 토큰 복사/보관

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

## Jenkins 추가 설정

Jenkins 빌드 로그 한글 깨짐 방지 및 외부 요청 수락 설정

- 관리자 권한으로 `C:\Program Files\Jenkins\jenkins.xml` 파일 열기
- `<arguments>` 태그 안에 옵션 추가
  - `-Dfile.encoding=UTF-8`
  - `--httpListenAddress=0.0.0.0`

<style scoped>
  marp-pre code {font-size: 14px;}
</style>

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
