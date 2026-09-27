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

# `tasks` 작업 스크립트로 반복 작업 관리하기

task 스크립트의 실행 대상을 읽고 반복 작업을 안전하게 재현합니다.


<!--
발표: 첫 화면의 목표를 말한 뒤 핵심 개념과 예제로 진행합니다. 확인 질문 뒤에는 답할 시간을 주고, 마지막 완료 기준을 남겨 질문을 받습니다.
발표 구성 참고: MIT OpenCourseWare, Patrick Winston, How to Speak (2018), https://ocw.mit.edu/courses/res-tll-005-how-to-speak-january-iap-2018/pages/how-to-speak/
-->

---

## 기본 작업 여정 돌아보기

앞선 프로젝트에서 사용한 네 가지 작업을 기준으로 자동화 대상을 찾습니다.

- **CRUD**: 데이터 생성, 조회, 수정, 삭제 기능 구현
- **UI/UX**: Tabler와 Master CSS를 이용한 화면 구성
- **API 연동**: 프론트엔드와 백엔드 간의 데이터 통신
- **디버깅**: UI와 거래 로그를 통한 문제 해결

반복 빈도가 높고 입력·결과가 분명한 작업부터 스크립트로 옮깁니다.

---

## 개발자의 숙명: 반복 작업 (1/2)

<!-- _class: reference-page -->



프로젝트를 진행하면서 우리는 매일 같은 작업들을 반복하게 됩니다.

- 개발 서버 실행하기

- 수정한 소스 파일 복사하기

- 프로젝트 다시 빌드하기

- 캐시 정리하기

- 서버 중지 및 재시작하기

---

## 개발자의 숙명: 반복 작업 (2/2)

<!-- _class: reference-page -->



이런 작업들을 매번 명령어로 직접 입력하는 것은 번거롭고 실수할 가능성도 있습니다.

---

## `tasks` 스크립트로 실행 절차 고정하기

`tasks` 스크립트는 이러한 <mark>반복적인 작업들을 미리 정의</mark>해두고, 간단한 명령어로 한 번에 실행할 수 있게 도와주는 자동화 도구입니다.

- **Windows**: `task.bat`
- **Linux/macOS**: `task.sh`

예: `task copy`, `task run`. 실행 전 현재 폴더·대상 경로·인자를 확인합니다. 복사·캐시 삭제·서버 재시작은 실제 상태를 바꿉니다.

---

## 주요 명령어 살펴보기 (1/4)

<!-- _class: reference-page -->



`tasks` 스크립트에 정의된 주요 명령어들입니다.

---

## 주요 명령어 살펴보기 (2/4)

<!-- _class: reference-page -->



| 명령어 | 설명 | 언제 사용할까요? |
|---|---|---|
| `run` | 개발 모드로 서버를 실행합니다. | 코드를 수정하며 바로 확인하고 싶을 때 |
| `copy`| 수정한 소스 파일을 실행 폴더로 복사합니다. | UI나 계약 파일을 수정했을 때 |
| `build`| 프로젝트를 처음부터 다시 빌드합니다. | 프로젝트 구조가 크게 변경되었을 때 |

---

## 주요 명령어 살펴보기 (3/4)

<!-- _class: reference-page -->



| 명령어 | 설명 | 언제 사용할까요? |
|---|---|---|
| `start`| PM2를 이용해 서버를 백그라운드로 실행합니다. | 개발이 끝나고 서버를 켜둘 때 |
| `stop` | 실행 중인 서버를 중지합니다. | 서버를 잠시 꺼야 할 때 |
| `purge`| 계약(Contracts) 캐시를 삭제합니다. | API 규칙 변경이 반영되지 않을 때 |

---

## 주요 명령어 살펴보기 (4/4)

<!-- _class: reference-page -->



| 명령어 | 설명 | 언제 사용할까요? |
|---|---|---|
| `app`| ack 실행 명령어를 로그로 출력합니다. | 실제 실행되는 명령어를 확인하고 싶을 때 |

---

## 잠깐, 구분해 보기

copy와 build를 구분하지 않으면 어떤 문제가 생길까요?

<!--
질문 후 잠시 기다립니다. 답이 없으면 앞에서 본 예제를 다시 가리킵니다.
확인할 답: 실행본에 변경이 반영되지 않거나 불필요한 전체 빌드가 발생할 수 있습니다. 작업 대상과 결과를 확인합니다.
다음 주제로 넘어가기 전에 차이를 청중의 표현으로 한 번 확인합니다.
-->

---

## 스크립트 엿보기 (Windows: `task.bat`) (1/3)

<!-- _class: reference-page -->



```bat
@echo off
chcp 65001

set TASK_COMMAND=%1
...

if "%TASK_COMMAND%"=="run" (
    REM 'task run' 이라고 입력하면 이 부분이 실행됩니다.
    %HANDSTACK_CLI% configuration --ack=%HANDSTACK_ACK% --appsettings=%WORKING_PATH%/Settings/ack.%TASK_SETTING%.json
    %HANDSTACK_ACK%
)

if "%TASK_COMMAND%"=="copy" (
```

<!-- 이어지는 코드 조각입니다. 앞뒤 페이지를 순서대로 읽으며 전체 예제의 일부임을 설명합니다. -->

---

## 스크립트 엿보기 (Windows: `task.bat`) (2/3)

<!-- _class: reference-page -->



```bat
    REM 'task copy' 라고 입력하면 파일들이 복사됩니다.
    robocopy %WORKING_PATH%/Contracts %HANDSTACK_HOME%/contracts /e /copy:dat
    ...
)
```

<!-- 이어지는 코드 조각입니다. 앞뒤 페이지를 순서대로 읽으며 전체 예제의 일부임을 설명합니다. -->

---

## 스크립트 엿보기 (Windows: `task.bat`) (3/3)

<!-- _class: reference-page -->



- 이처럼 각 명령어에 해당하는 작업들을 미리 `if` 문으로 정의해 놓은 것입니다.

---

## 스크립트 엿보기 (Linux/macOS: `task.sh`) (1/3)

<!-- _class: reference-page -->



```bash
#!/bin/bash
TASK_COMMAND=$1
...

if [ "$TASK_COMMAND" == "run" ]; then
    # './task.sh run' 이라고 입력하면 이 부분이 실행됩니다.
    $HANDSTACK_CLI configuration --ack=$HANDSTACK_ACK --appsettings=$WORKING_PATH/Settings/ack.$TASK_SETTING.json
    $HANDSTACK_ACK
fi

if [ "$TASK_COMMAND" == "copy" ]; then
    # './task.sh copy' 라고 입력하면 파일들이 복사됩니다.
    rsync -av $WORKING_PATH/Contracts/ $HANDSTACK_HOME/contracts/
```

<!-- 이어지는 코드 조각입니다. 앞뒤 페이지를 순서대로 읽으며 전체 예제의 일부임을 설명합니다. -->

---

## 스크립트 엿보기 (Linux/macOS: `task.sh`) (2/3)

<!-- _class: reference-page -->



```bash
    ...
fi
```

<!-- 이어지는 코드 조각입니다. 앞뒤 페이지를 순서대로 읽으며 전체 예제의 일부임을 설명합니다. -->

---

## 스크립트 엿보기 (Linux/macOS: `task.sh`) (3/3)

<!-- _class: reference-page -->



- Windows 스크립트와 구조는 동일하며, 운영체제에 맞는 명령어를 사용합니다.

---

## 자동화의 완료 기준

- run·copy·build·start·stop·purge·app의 목적을 구분합니다.
- Windows·Linux/macOS 스크립트의 경로와 인자를 확인합니다.
- 실습 폴더에서 명령 하나를 실행하고 변경된 파일·로그를 확인합니다.

<!--
질문을 받는 동안 이 확인 기준을 화면에 남깁니다. 청중이 자신의 업무에 적용할 다음 행동 하나를 고르게 합니다.
-->
