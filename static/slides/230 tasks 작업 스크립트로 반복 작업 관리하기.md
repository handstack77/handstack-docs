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
  background-image: linear-gradient(to bottom right, #f7f7f7 0%, #d3d3d3 100%);
}

section table {
    margin: auto;
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

# `tasks` 작업 스크립트로 반복 작업 관리하기

### 기본을 넘어 다음 단계로

---

## 기본 작업 여정 돌아보기

지난 한 달 동안 우리는 HandStack을 사용하여 방명록(또는 ToDo List) 프로젝트를 완성했습니다.

- **CRUD**: 데이터 생성, 조회, 수정, 삭제 기능 구현
- **UI/UX**: Tabler와 Master CSS를 이용한 화면 구성
- **API 연동**: 프론트엔드와 백엔드 간의 데이터 통신
- **디버깅**: UI와 거래 로그를 통한 문제 해결

모두 정말 수고 많으셨습니다! 여러분은 이미 풀스택 개발의 첫걸음을 성공적으로 내디뎠습니다.

---

## 개발자의 숙명: 반복 작업

프로젝트를 진행하면서 우리는 매일 같은 작업들을 반복하게 됩니다.

- 개발 서버 실행하기
- 수정한 소스 파일 복사하기
- 프로젝트 다시 빌드하기
- 캐시 정리하기
- 서버 중지 및 재시작하기

이런 작업들을 매번 명령어로 직접 입력하는 것은 번거롭고 실수할 가능성도 있습니다.

---

## 해결책: `tasks` 스크립트, 개발자의 만능 리모컨

`tasks` 스크립트는 이러한 <mark>반복적인 작업들을 미리 정의</mark>해두고, 간단한 명령어로 한 번에 실행할 수 있게 도와주는 자동화 도구입니다.

- **Windows**: `task.bat`
- **Linux/macOS**: `task.sh`

이제 우리는 긴 명령어를 외울 필요 없이, `task copy`, `task run` 과 같은 짧은 명령어로 복잡한 작업들을 처리할 수 있습니다.

---

## 주요 명령어 살펴보기

`tasks` 스크립트에 정의된 주요 명령어들입니다.

| 명령어 | 설명 | 언제 사용할까요? |
|---|---|---|
| `run` | 개발 모드로 서버를 실행합니다. | 코드를 수정하며 바로 확인하고 싶을 때 |
| `copy`| 수정한 소스 파일을 실행 폴더로 복사합니다. | UI나 계약 파일을 수정했을 때 |
| `build`| 프로젝트를 처음부터 다시 빌드합니다. | 프로젝트 구조가 크게 변경되었을 때 |
| `start`| PM2를 이용해 서버를 백그라운드로 실행합니다. | 개발이 끝나고 서버를 켜둘 때 |
| `stop` | 실행 중인 서버를 중지합니다. | 서버를 잠시 꺼야 할 때 |
| `purge`| 계약(Contracts) 캐시를 삭제합니다. | API 규칙 변경이 반영되지 않을 때 |

---

## 스크립트 엿보기 (Windows: `task.bat`)

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
    REM 'task copy' 라고 입력하면 파일들이 복사됩니다.
    robocopy %WORKING_PATH%/Contracts %HANDSTACK_SRC%/../build/handstack/contracts /e /copy:dat
    ...
)
```
- 이처럼 각 명령어에 해당하는 작업들을 미리 `if` 문으로 정의해 놓은 것입니다.

---

## 스크립트 엿보기 (Linux/macOS: `task.sh`)

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
    rsync -av $WORKING_PATH/Contracts/ $HANDSTACK_SRC/../build/handstack/contracts/
    ...
fi
```
- Windows 스크립트와 구조는 동일하며, 운영체제에 맞는 명령어를 사용합니다.

---

## 한 달, 그리고 HandStack

> 단 한 달 만에, HandStack과 함께 여러분은 백엔드와 프론트엔드를 넘나드는 풀스택 개발의 기초를 다졌습니다. 이제 다음 달에는 더욱 강력한 기능들을 함께 만들어 볼 거예요!

- 순수 웹 표준 기술(HTML, JS)과 SQL만으로 이 모든 것을 해냈습니다.
- 이것이 바로 HandStack이 제공하는 <mark>빠른 학습 속도</mark>와 <mark>높은 생산성</mark>의 힘입니다.

---

## 다음 달에는 무엇을 배울까요?

한 단계 더 나아가 실제 서비스에 필요한 고급 기능들을 구현해 봅니다.

- **사용자 인증**: 로그인, 회원가입, 권한 관리 기능
- **파일 관리**: 이미지 및 파일 업로드, 다운로드 처리
- **외부 API 연동**: 다른 서비스의 데이터를 가져와 활용하기
- **대시보드**: 데이터를 시각화하는 차트와 대시보드 만들기

더욱 흥미진진한 도전이 여러분을 기다리고 있습니다!

---


# 최종 프로젝트 시연 및 자가 평가

지난 한 달간 만든 여러분의 프로젝트를 직접 실행해보고, 스스로의 성장을 확인해 보세요.

## 수고하셨습니다