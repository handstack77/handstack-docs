---
sidebar_position: 90
---

# PowerShell 명령어 가이드

Microsoft 의 PowerShell 은 Windows, macOS, Linux를 모두 지원하며 .NET 기반의 강력한 성능을 갖춘 오픈 소스 차세대 크로스 플랫폼 자동화 및 구성 프레임워크입니다.

- 성능: Windows 전용 버전(5.1)보다 훨씬 빠르고 효율적인 데이터 처리가 가능합니다.
- 호환성: 기존 Windows PowerShell 모듈과 높은 호환성을 유지하면서 최신 오픈 소스 기술을 결합했습니다.
- 범용성: 서버 관리, 클라우드 운영, 간단한 스크립팅까지 모든 환경에서 표준으로 사용됩니다.

아래 표는 Windows PowerShell 5.1과 PowerShell 7의 주요 차이를 정리한 것입니다.

| **구분** | **Windows PowerShell 5.1** | **PowerShell 7 (PowerShell Core)** |
| ---------- | -------------------------- | ---------------------------------- |
| **기반 플랫폼** | .NET Framework | .NET Core 3.1 (이후 .NET 5 이상) |
| **지원 OS** | Windows 전용 | Windows, macOS, Linux 지원 |
| **개발 방식** | 클로즈드 소스 (독점 개발) | 오픈 소스로 공개 개발 |
| **업데이트** | 제한적인 업데이트 (주로 보안 패치) | 지속적인 기능 추가 및 업데이트 |
| **모듈 호환성** | 최신 모듈 일부 미지원 (호환성 제약) | 최신 .NET Core용 모듈과의 호환성 향상 |
| **성능** | 기본 수준 성능 | 일부 작업에서 향상된 성능 (병렬 등) |

## 설치 방법 (Windows, macOS, Linux)

- Windows: winget install -e --id=Microsoft.PowerShell
- macOS: brew install --cask powershell
- Ubuntu: sudo apt install -y powershell

설치 후 PowerShell 7 실행하기 위해 명령 프롬프트 또는 터미널 에서 `pwsh` 명령어를 입력합니다.

```bash
pwsh
```

## 주요 명령어

PowerShell은 명령줄 셸이자 스크립팅 언어로, **명령어(Cmdlet)**의 문법과 사용 방법이 기존의 Windows 명령 프롬프트(cmd)나 리눅스 쉘과 다소 차이가 있습니다.

PowerShell 프롬프트에서 명령어를 실행하는 방법은 다른 셸과 유사하게 명령어 이름을 입력하고 Enter를 치면 됩니다. 단, PowerShell Cmdlet은 대소문자를 구분하지 않으므로 Get-Process나 get-process 모두 동일하게 동작합니다. 또한 **긴 명령 이름은 축약형 별칭(alias)**이 존재하는 경우가 많습니다. 예를 들어 Get-ChildItem 명령은 디렉터리 내용을 나열하는 기능으로, 리눅스의 ls나 Windows의 dir과 유사한 역할인데, PowerShell에서는 ls나 dir 자체를 Get-ChildItem의 **별칭(alias)**으로 미리 제공하여 익숙한 사용자 경험을 제공합니다. 즉, PowerShell에서 ls를 입력하면 내부적으로 Get-ChildItem이 실행되어 현재 폴더의 목록이 출력됩니다. 이처럼 cd(Set-Location), rm(Remove-Item), mkdir(New-Item) 등 많이 쓰이는 명령은 직관적인 별칭을 갖고 있어 편리합니다.

POSIX 표준으로 사용되는 주요 명령어는 다음과 같습니다. 터미널 작업으로 시스템 관리를 자동화하기 위해 기본적으로 알아두어야 하는 명령어 입니다.

```bash
cat # 파일의 내용을 표준 출력(화면)으로 보여줌
cd # 현재 작업 디렉토리를 변경함
cp # 파일 또는 디렉토리를 복사함
diff # 두 파일의 내용 차이를 비교함
echo # 화면에 문자열을 출력함
history # 이전에 실행한 명령어 기록 목록을 보여줌
kill # PID를 이용하여 프로세스를 종료하거나 시그널을 보냄
ls # 현재 위치의 파일과 디렉토리 목록을 나열함
man # 명령어의 사용법(매뉴얼)을 보여줌
mkdir # 새로운 디렉토리를 생성함
mount # 디스크 장치나 파일 시스템을 특정 경로에 연결함
mv # 파일이나 디렉토리를 이동하거나 이름을 변경함
pwd # 현재 작업 중인 디렉토리의 전체 경로를 출력함
rm # 파일 또는 디렉토리를 삭제함
rmdir # 내용이 비어 있는 디렉토리만 삭제함
sleep # 지정한 시간 동안 명령어 실행을 지연(대기)시킴
sort # 텍스트 파일의 내용을 정렬하여 출력함
tee # 출력 내용을 화면에 보여주는 동시에 파일로 저장함
type # 명령어가 쉘 내부 명령어인지, 외부 파일인지 등을 확인함
where # 실행 파일(명령어)의 위치 경로를 찾음
```

> 옵션과 출력 형식은 OS/쉘에 따라 **차이가 날 수 있음**.

---

## `cat` - 파일 내용 출력

**설명**
파일의 내용을 표준 출력(stdout)으로 보여줍니다.

**주요 옵션**

* `-n` : 줄 번호 표시
* `-A` : 제어 문자 표시 (Linux/macOS)

**예시**

```sh
cat file.txt
cat -n file.txt
```

---

## `cd` - 디렉토리 이동

**설명**
현재 작업 디렉토리를 변경합니다.

**주요 옵션**

* `..` : 상위 디렉토리
* `~` : 홈 디렉토리

**예시**

```sh
cd /var/log
cd ..
cd ~
```

---

## `cp` - 파일/디렉토리 복사

**설명**
파일 또는 디렉토리를 복사합니다.

**주요 옵션**

* `-r` : 디렉토리 재귀 복사
* `-i` : 덮어쓰기 전 확인
* `-v` : 진행 상황 출력

**예시**

```sh
cp a.txt b.txt
cp -r src/ backup/
```

---

## `diff` - 파일 차이 비교

**설명**
두 파일의 차이를 비교합니다.

**주요 옵션**

* `-u` : unified diff 형식
* `-r` : 디렉토리 비교

**예시**

```sh
diff a.txt b.txt
diff -u old.txt new.txt
```

---

## `echo` - 문자열 출력

**설명**
문자열을 출력합니다.

**주요 옵션**

* `-n` : 줄바꿈 제거

**예시**

```sh
echo "Hello World"
echo -n "No newline"
```

---

## `history` - 명령 기록 출력

**설명**
이전에 실행한 명령 목록을 보여줍니다.

**주요 옵션**

* `-c` : 기록 삭제 (bash)
* `N` : 최근 N개 출력

**예시**

```sh
history
history 20
```

---

## `kill` - 프로세스 종료

**설명**
PID로 프로세스에 시그널을 보냅니다.

**주요 옵션**

* `-9` : 강제 종료(SIGKILL)
* `-15` : 정상 종료(SIGTERM)

**예시**

```sh
kill 1234
kill -9 1234
```

---

## `ls` - 디렉토리 목록

**설명**
파일과 디렉토리를 나열합니다.

**주요 옵션**

* `-l` : 상세 정보
* `-a` : 숨김 파일 포함
* `-h` : 사람이 읽기 쉬운 크기

**예시**

```sh
ls
ls -la
```

---

## `man` - 매뉴얼 페이지

**설명**
명령어의 공식 설명서를 표시합니다.

**주요 옵션**

* `-k` : 키워드 검색

**예시**

```sh
man ls
man -k network
```

---

## `mkdir` - 디렉토리 생성

**설명**
새 디렉토리를 만듭니다.

**주요 옵션**

* `-p` : 상위 디렉토리까지 생성

**예시**

```sh
mkdir test
mkdir -p a/b/c
```

---

## `mount` - 파일 시스템 마운트

**설명**
디스크 또는 파일 시스템을 연결합니다.

**주요 옵션**

* `-t` : 파일 시스템 타입
* `-o` : 옵션 지정

**예시**

```sh
mount
mount /dev/sdb1 /mnt
```

---

## `mv` - 파일/디렉토리 이동·이름 변경

**설명**
파일을 이동하거나 이름을 변경합니다.

**주요 옵션**

* `-i` : 덮어쓰기 전 확인
* `-v` : 진행 상황 출력

**예시**

```sh
mv a.txt b.txt
mv file.txt dir/
```

---

## `pwd` - 현재 디렉토리 출력

**설명**
현재 작업 디렉토리 경로를 출력합니다.

**예시**

```sh
pwd
```

---

## `rm` - 파일 삭제

**설명**
파일 또는 디렉토리를 삭제합니다.

**주요 옵션**

* `-r` : 디렉토리 재귀 삭제
* `-f` : 강제 삭제

**예시**

```sh
rm file.txt
rm -rf temp/
```

---

## `rmdir` - 빈 디렉토리 삭제

**설명**
내용이 없는 디렉토리만 삭제합니다.

**예시**

```sh
rmdir empty_dir
```

---

## `sleep` - 실행 지연

**설명**
지정한 시간 동안 실행을 멈춥니다.

**주요 옵션**

* `s`, `m`, `h` : 초 / 분 / 시간

**예시**

```sh
sleep 5
sleep 1m
```

---

## `sort` - 텍스트 정렬

**설명**
입력된 텍스트를 정렬합니다.

**주요 옵션**

* `-r` : 역순
* `-n` : 숫자 기준

**예시**

```sh
sort names.txt
sort -nr scores.txt
```

---

## `tee` - 출력 분기 저장

**설명**
출력을 파일과 화면에 동시에 기록합니다.

**주요 옵션**

* `-a` : 파일에 이어쓰기

**예시**

```sh
ls | tee list.txt
ls | tee -a list.txt
```

---

## `type` - 명령어 종류 확인

**설명**
명령어가 내부/외부/alias인지 확인합니다.

**예시**

```sh
type ls
type cd
```

---

## `where` - 명령 위치 검색

**설명**
실행 파일의 경로를 찾습니다.
(Linux/macOS에선 `which`가 더 일반적)

**예시**

```sh
where git
which git
```

## 명령어 실행 (Cmdlet 구조와 실행 방법)

PowerShell의 명령어는 Cmdlet이라 불리며, 동사-명사(Verb-Noun) 형식의 이름을 갖습니다. 예를 들어 "Get-Process"는 Get(가져오기) 동사와 Process(프로세스) 명사가 결합되어 “프로세스를 가져오는” 기능을 하는 명령어입니다. 이러한 Verb-Noun 작명법으로 명령의 기능을 유추하기 쉽고, 관련 있는 명령어들을 그룹화해줍니다. 자주 사용되는 동사로는 Get(조회), Set(설정), New(생성), Remove(삭제), Start(시작), Stop(중지) 등이 있으며, 명사는 파일(File), 프로세스(Process), 서비스(Service) 등 관리 대상 자원을 나타냅니다.

PowerShell Cmdlet은 명령줄 인자와 옵션(매개변수)을 지원합니다. 명령어 뒤에 -를 붙여 매개변수 이름과 값을 지정할 수 있습니다. 예를 들어 Get-Process -Name notepad처럼 특정 프로세스 이름을 지정하거나, Get-ChildItem -Path C:\Windows -Recurse처럼 옵션을 사용해 재귀적으로 하위 폴더까지 나열할 수 있습니다. 매개변수는 순서와 상관없이 -Name 값 형태로 명시하며, 일부 매개변수는 약어를 사용할 수도 있습니다.

PowerShell에서는 파이프라인(|)을 통해 여러 Cmdlet을 연결하여 복잡한 작업을 수행할 수 있습니다. 예를 들어 Get-Process | Where-Object {$_.CPU -gt 100}는 CPU 사용량이 100을 초과하는 프로세스만 필터링하여 보여줍니다. 이처럼 파이프라인을 활용하면 각 Cmdlet의 출력을 다음 Cmdlet의 입력으로 전달하여 데이터 흐름을 쉽게 제어할 수 있습니다.

**파이프라인 (|)**은 PowerShell의 강력한 기능 중 하나로, 한 명령의 출력 결과를 다음 명령의 입력으로 전달하여 일련의 처리를 수행하는 방식입니다. 리눅스/유닉스 셸의 파이프(|)와 문법상으로 같지만 **결정적인 차이는 PowerShell의 파이프라인은 문자열이 아닌 **객체(Object)를 전달한다는 것입니다. 기존 쉘에서는 명령 출력이 단순한 텍스트이지만, PowerShell에서는 .NET 객체로 주고받으므로 다음 명령에서 해당 객체의 **속성(Properties)**을 직접 활용하거나 필터링할 수 있습니다.

예를 들어, 현재 실행 중인 프로세스 중에서 메모리 사용량이 많은 상위 5개 프로세스를 보고 싶다고 가정해봅시다. PowerShell에서는 이를 파이프라인으로 간결하게 표현할 수 있습니다:

```powershell
Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 5 Name, WorkingSet
```

위 명령은 Get-Process로 모든 프로세스 정보를 가져오고, Sort-Object로 WorkingSet(메모리 사용량) 속성을 기준으로 내림차순 정렬한 뒤, Select-Object로 상위 5개의 프로세스 이름과 메모리 사용량을 출력하는 예시입니다. 각 명령 간 전달되는 데이터는 단순 문자열이 아니라 프로세스 객체이기 때문에, Sort-Object는 객체의 WorkingSet 속성 값을 인식하여 정확하게 정렬할 수 있고, Select-Object에서도 Name과 WorkingSet이라는 필드명을 지정해 추출할 수 있습니다. 이러한 객체 지향 파이프라인 덕분에, 데이터를 가공하거나 필터링하는 로직을 파이프 조합으로 손쉽게 구현할 수 있습니다.

또 다른 파이프라인 예제로, 서비스 목록에서 상태가 Running인 서비스만 필터링해보겠습니다:

```powershell
Get-Service | Where-Object {$_.Status -eq 'Running'}
```

위 명령에서 Get-Service는 서비스 객체들을 출력하고, 파이프를 통해 Where-Object에 전달됩니다. Where-Object에서 {$_.Status -eq "Running"}라는 조건식을 주었는데, 여기서 $_는 파이프로 넘어온 각 서비스 객체를 가리키며 그 Status 속성이 "Running"인 경우만 통과시킵니다. 결과적으로 현재 실행 중(Running) 상태인 서비스들만 화면에 출력됩니다.

PowerShell의 파이프라인은 객체 단위로 데이터를 주고받기 때문에, 각 Cmdlet이 처리하는 데이터의 구조와 속성을 명확히 이해하는 것이 중요합니다. 이를 통해 복잡한 데이터 처리 작업도 간결하고 효율적으로 수행할 수 있습니다.

모듈과 확장 기능 사용

PowerShell의 **모듈(Module)**은 특정 주제나 제품과 관련된 Cmdlet, 함수, DSC리소스 등을 모아 놓은 패키지입니다. 기본적으로 PowerShell은 여러 내장 모듈을 가지고 있으며(예: Microsoft.PowerShell.Management, Microsoft.PowerShell.Utility 등), 모듈을 가져오면 해당 모듈이 제공하는 Cmdlet들을 사용할 수 있게 됩니다. 모듈 불러오기는 Import-Module 명령으로 수행하며, Windows PowerShell 5.1까지는 수동으로 Import-Module이 필요했으나 PowerShell 7에선 자동 모듈 로딩이 기본 동작이라, Cmdlet을 호출하면 알아서 관련 모듈을 로드합니다.

외부 모듈이나 추가 기능이 필요하다면 **PowerShell 갤러리(PowerShell Gallery)**를 통해 손쉽게 설치할 수 있습니다. PowerShell 갤러리는 Microsoft가 운영하는 온라인 모듈 저장소로, 수천 개 이상의 모듈이 공유되어 있습니다. 예를 들어 ActiveDirectory 모듈, Azure용 Az 모듈, Docker 관리 모듈 등 다양한 관리 영역의 모듈을 찾아볼 수 있습니다. 모듈 설치는 Install-Module Cmdlet으로 수행하며, 관리자 권한의 PowerShell에서 Install-Module -Name 모듈명이라고 실행하면 인터넷에서 해당 모듈을 내려받아 설치합니다. (-Scope CurrentUser 옵션을 주면 일반 사용자로 개별 설치도 가능.) 설치 후 Import-Module 모듈명으로 로드하여 사용하면 됩니다.

모듈은 보통 %UserProfile%\Documents\PowerShell\Modules 경로나 시스템 전역 경로($Env:ProgramFiles\PowerShell\Modules)에 배치됩니다. Get-Module -ListAvailable 명령으로 로드 가능한 모듈 목록을 볼 수 있고, Get-Command -Module 모듈명으로 특정 모듈이 제공하는 명령 목록을 조회할 수도 있습니다.

PowerShell의 확장성은 매우 높아서, .NET 클래스 라이브러리를 직접 호출하거나(C# 어셈블리를 [System.Net.WebClient] 등으로 사용하는 식), 스크립트 모듈/이진 모듈을 직접 작성하여 배포할 수도 있습니다. 관리자들은 자신만의 모듈을 작성해 내부 배포하거나, 커뮤니티가 만든 다양한 모듈을 가져와서 기능을 확장하곤 합니다. 이러한 모듈 시스템 덕분에 PowerShell은 기본 제공 기능 외에도 필요한 기능을 얼마든지 추가하여 활용할 수 있는 유연한 도구가 됩니다.

## 자주 사용하는 명령어 예시

PowerShell에서는 수백 가지의 Cmdlet이 존재하지만, 그 중 자주 사용되는 기본 명령어들을 익혀두면 시스템 관리 및 자동화를 수월하게 시작할 수 있습니다. 초보자가 우선 학습하기 좋은 주요 Cmdlet들로 Get-Help, Get-ChildItem, Get-Process, Set-Location, New-Item, Copy-Item, Get-Service 등이 자주 언급됩니다. 아래에 몇 가지 핵심 명령어와 용도를 소개합니다:

- Get-Help: PowerShell 내장 도움말 명령어로, 특정 Cmdlet의 사용법을 보여줍니다. 예를 들어 Get-Help Get-Service라고 하면 Get-Service의 설명과 문법을 표시하고, Get-Help Get-Service -Examples라고 하면 사용 예제를 확인할 수 있습니다. (네트워크가 가능하면 -Online으로 최신 온라인 문서 참고)
- Get-Command: 시스템에 사용 가능한 모든 명령(Cmdlet, 함수, 별칭 등)을 검색합니다. 예를 들어 Get-Command *process* 하면 이름에 "process"가 들어간 명령들을 찾아줍니다. 새 모듈을 설치한 후 어떤 명령이 추가되었는지 확인할 때 유용합니다.
- Get-Service: 윈도우 서비스 목록과 상태를 가져옵니다. 실행 중인 서비스, 중지된 서비스 등의 정보를 표시하며, Get-Service -Name Spooler처럼 특정 서비스의 상태를 조회할 수도 있습니다.
- Get-Process: 현재 실행 중인 프로세스 목록을 표시합니다. 실행 중인 애플리케이션이나 백그라운드 프로세스 정보를 확인할 때 사용하며, Get-Process -Name notepad처럼 프로세스 이름으로 필터링할 수도 있습니다.
- Stop-Process: 지정한 프로세스를 강제로 종료합니다. -Name 매개변수로 프로세스 이름을, 또는 -Id로 프로세스 ID(PID)를 지정합니다. 예: Stop-Process -Name notepad (메모장 프로세스 종료). 잘못 사용할 경우 중요 프로세스를 종료할 수 있으므로 주의합니다.
- Set-Location: 현재 작업 경로(디렉토리)를 변경합니다. cd 명령과 동일한 기능이며, 예: Set-Location C:\Windows (C:\Windows 폴더로 이동). cd ..나 cd \ 등의 전형적인 명령도 그대로 사용할 수 있습니다.
- Get-ChildItem: 지정한 경로의 파일 및 폴더 목록을 나열합니다. 기본 동작은 현재 디렉터리 내용을 표시하며, ls 또는 dir의 PowerShell 대응입니다. -Recurse 옵션으로 하위 폴더까지 재귀적으로 나열하거나, -File/-Directory 옵션으로 파일만 또는 폴더만 필터링할 수 있습니다.
- New-Item: 새 파일이나 디렉토리를 생성합니다. 예: New-Item "C:\Logs\app.log" -ItemType File (파일 생성) 또는 New-Item "C:\Logs\Archive" -ItemType Directory (폴더 생성). 이외에도 레지스트리 키 생성 등 다양한 경로 유형에 사용할 수 있습니다.
- Copy-Item: 파일/디렉토리 복사에 사용됩니다. -Path 매개변수에 원본 경로를, -Destination에 대상 경로를 지정합니다. 예: Copy-Item -Path C:\Report.xlsx -Destination D:\Backup\Report.xlsx (단일 파일 복사). 디렉토리를 복사하려면 -Recurse 옵션을 추가하여 하위 내용까지 모두 복사 가능합니다.
- Remove-Item: 파일이나 폴더를 삭제합니다. rm 별칭으로도 불리며, 예: Remove-Item C:\Temp\*.log (Temp 폴더의 모든 .log 파일 삭제). 디렉토리 삭제 시 -Recurse 옵션 사용.
- Import-Module: 모듈을 로드하여 해당 모듈의 Cmdlet을 사용할 수 있게 합니다. 예: Import-Module ActiveDirectory. (PowerShell 7에서는 자동 로드가 되므로 수동 import는 특정 상황 제외하곤 적음.)
- Export-Csv: 파워쉘 객체(데이터)를 CSV 파일로 내보냅니다. 예: Get-Process | Export-Csv -Path "proc.csv" -NoTypeInformation (프로세스 목록을 CSV로 저장). 반대로 CSV를 읽을 때는 Import-Csv 사용.

이 외에도 원격 세션 명령 (Enter-PSSession, Invoke-Command), 파이프라인에서 사용하는 Where-Object/ForEach-Object, 출력 서식 지정용 Format-Table/Format-List 등 유용한 Cmdlet들이 많습니다. 필요할 때마다 Get-Help로 사용법을 참고하고, Get-Command로 검색해보면서 익혀나가면 됩니다.

## 추가 자료

- [PowerShell 공식 문서](https://learn.microsoft.com/ko-kr/powershell/)
- [비 Windows 플랫폼의 PowerShell의 차이점](https://learn.microsoft.com/ko-kr/powershell/scripting/whats-new/unix-support?view=powershell-7.5)
- [모듈 및 cmdlet의 릴리스 기록](https://learn.microsoft.com/ko-kr/powershell/scripting/whats-new/cmdlet-versions?view=powershell-7.5)