---
slug: 프로그램-설치-스크립트-만들기
title: 프로그램 설치 스크립트 만들기
authors: [handstack77]
tags: [handstack]
---

최근 HandStack 을 실행하기 위한 필수 프로그램 설치 및 종속 라이브러리를 다운로드 하고 번들링을 구성하는 install 배치 스크립트에 버그가 있다는 피드백을 받고 이번 기회에 버그도 잡을 겸, 다음의 클린 설치 운영체제에서 설치 스크립트 점검하고 개선되었습니다.

- Windows 10
- Windows 11
- Ubuntu 22.04
- macOS 11 (Big Sur): Intel CPU
- macOS 14 (Sonoma): Arm CPU

개발 환경과 실행 환경에 필요한 필수 프로그램과 도구를 설치하는 과정은 각 운영 체제의 관리 정책과 버전에 따른 보안 수준에 따라 설치 프로그램을 만들때 각 운영 체제의 특성과 설치 절차를 이해하는 것을 필요로 합니다.

사실 제공되는 install 설치 스크립트는 설치 프로그램 이라기 보다 매뉴얼 작업에 가까운 설치 과정인데, Windows, macOS, Linux에 따라 인스톨러를 개발하는 것은 시간과 비용면에서 부담스럽고 좀 더 동일한 설치 경험을 제공해야 향후 유지보수에 도움이 될거라는 판단이 들었습니다.

Linux 서버를 다루는 분들은 패키지 매니저를 사용하는 CLI (Command-Line Interface) 명령으로 필요한 프로그램을 설치하는 것이 익숙하실 겁니다. Windows나 macOS 에서는 GUI (Graphical User Interface) 방식의 설치 관리자를 이용한 설치가 편하실거구요.

그런데 점차 Windows, macOS 에서도 업무에 필요한 대부분의 프로그램을 패키지 매니저를 사용하여 설치 하는 것이 일반화 되고 있습니다. 

Windows에서는 `winget`, macOS에서는 `Homebrew`, Linux에서는 `apt-get` 와 같은 CLI 명령으로 자동화된 설치 프로세스를 수행하게 되는데 한번 적응되면 편리하게 사용할 수 있습니다.

> 제가 Windows 기반에서 HandStack 을 개발하는 데 필요한 개발 및 도구 프로그램을 설치하는 스크립트를 추가로 정리했습니다. 매번 공식 웹 사이트가 가서 프로그램을 받고 설치하고 하는 과정없이 명령 프롬프트에서 동일한 프로그램을 빠르게 설치합니다. 자세한 내용은 [Winget 추천 개발 도구 설치하기](https://handstack.kr/docs/information/resource/Winget-추천-개발-도구-설치하기) 문서를 확인하세요.

개선된 프로그램 설치 스크립트는 [빠른 시작](https://handstack.kr/docs/startup/빠른-시작)에서 확인 가능합니다.

---

한 주간의 여정 (2024-04-15 ~ 2024-04-19)

- 의미 없는 alpha, beta 릴리즈 삭제
- publish, install 설치 스크립트 기능 개선
- 버그 수정 및 안정성 기능 개선
- 화면 개발 프로젝트 템플릿 추가
- libman.json 에 정의된 파일을 압축 파일로 제공
- 번들링 기본값 변경
- HandStack CLI 기능 개발자 문서 추가
- publish 과정에 HandStack CLI 추가
- assetsCachingID 적용 기준 수정
- 공통/화면 브라우저 캐시 적용 기능 분리