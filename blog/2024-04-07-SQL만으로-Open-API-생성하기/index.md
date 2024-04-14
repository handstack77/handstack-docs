---
slug: SQL만으로-Open-API-생성하기
title: SQL만으로 Open API 생성하기
authors: [handstack77]
tags: [handstack]
---

공공 데이터 포털에 올라온 주요 오픈 API에 대한 프로토콜 문서를 학습하는 도중에 공공 분야 뿐만 아니라 의미 있는 데이터를 제공하는 쪽 입장에서 가지고 있는 정보를 간단하게 Open API 형태로 서비스 할 수 있는 기능이 있으면 좋겠다는 생각이 들었습니다.

그래서 본래 예정에 없었던 도메인의 데이터베이스의 정보를 Open API 형태로 서비스 할 수 있는 openapi 모듈을 개발했습니다.

openapi 모듈로 별도의 개발 없이 다양한 포맷(JSON, XML, SOAP, RSS 2.0, ATOM 1.0)들을 지원하는 Endpoint를 관리 할 수 있는데 별도의 개발 없이 5개의 테이블의 정보를 구성하여 간단하게 Open API 서비스를 구성 가능합니다.

요약하면 다음과 같습니다.

* Open API 서비스 개발 인력 없이 단기간에 구축이 가능합니다.
* SqlServer, Oracle, MySQL, PostgreSQL, SQLite DBMS의 SQL을 사용하여 도메인 데이터를 외부에 노출합니다.
* Open API 서비스 설정 변동 시 무중단 으로 실시간으로 반영됩니다.
* OWASP 10대 취약점에 대응하여 안전하게 운영이 가능합니다.

Open API 서비스를 관리하기 위해 테이블의 데이터를 추가하거나 변경해야 하는데 웹 기반의 UI는 향후 forbes 로 제공됩니다.

그 전까지는 데이터 엔티티 정보와 초기 데이터 SQL을 참고하여 데이터를 직접 관리해야 자신만의 Open API를 관리 가능합니다.

openapi 모듈은 SqlServer, SQLite 데이터베이스에서 테스트 했으며 Oracle, MySQL, PostgreSQL에서 운영 동작은 확인이 필요 할 수 있습니다.

좀 더 자세한 내용은 SQL만으로 Open API 생성하기를 참고하세요.

---

한 주간의 여정 (2024-04-01 ~ 2024-04-05)

## openapi 주요 기능
* API 서비스 관리
* 회원 정보 관리
* 서비스 키 발급
* 접근 권한 제어
* API 메타 정보 캐시 관리
* 로깅 및 거래 횟수 업데이트
* 거래 제한 조건 적용
* Json, Xml, Soap, Rss/Atom 출력 포맷 지원
* 필수 매개변수 및 기본 매개변수 적용 확인
* 공개, 비밀 키, IP 주소 접근 제어
* 기간 내 호출 수 제한 및 제한 조건 일별/월별 자동 갱신
* 응답 결과 캐싱
* 시간 단위 API 사용 통계 수집
* SqlServer, Oracle, MySQL, PostgreSQL, SQLite 데이터베이스 지원

https://github.com/handstack77/handstack