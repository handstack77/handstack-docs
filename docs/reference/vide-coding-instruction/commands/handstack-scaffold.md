---
description: 새로운 Handstack 모듈(View + Contract)을 스캐폴딩합니다. ID(예: CDM999)를 입력받아 JS, HTML, XML 파일을 생성합니다.
---

# handstack-scaffold

Handstack 스캐폴드 명령어 (Handstack Scaffold)

이 명령어는 **handstack-developer** 에이전트를 호출하여 새로운 모듈 개발을 위한 초기 파일들을 생성합니다.

## 사용법

`/handstack-scaffold {모듈ID}`

예: `/handstack-scaffold CDM100`

## 생성되는 파일

1. `src/view/IQA/{Group}/{ID}.js` - 로직 파일
2. `src/view/IQA/{Group}/{ID}.html` - UI 파일
3. `src/Contracts/dbclient/HDS/{Group}/{ID}.xml` - 쿼리 파일

## 프로세스

1. 모듈 ID 파싱 (예: `CDM100` -> Group: `CDM`, ID: `CDM100`)
2. 디렉토리 존재 여부 확인 및 생성
3. 표준 템플릿을 사용하여 각 파일 생성
   - JS: 기본 객체 구조 (`config`, `prop`, `transaction` 등)
   - HTML: 기본 그리드 레이아웃
   - XML: 기본 `LD01` (조회) 구문
4. 생성된 파일 경로 출력

## 템플릿 예시

**JS:**
```javascript
'use strict';
let $CDM100 = {
    config: { ... },
    // ...
};
```

**XML:**
```xml
<mapper>
    <header>
        <transaction>CDM100</transaction>
    </header>
    <commands>
        <statement id="LD01"> ... </statement>
    </commands>
</mapper>
```
