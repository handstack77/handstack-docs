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

# HandStack 모듈 라이선스 관리 지침

어셈블리 서명·난독화·계약 암호화·라이선스 검증의 역할을 구분합니다.


<!--
발표: 첫 화면의 목표를 말한 뒤 핵심 개념과 예제로 진행합니다. 확인 질문 뒤에는 답할 시간을 주고, 마지막 완료 기준을 남겨 질문을 받습니다.
발표 구성 참고: MIT OpenCourseWare, Patrick Winston, How to Speak (2018), https://ocw.mit.edu/courses/res-tll-005-how-to-speak-january-iap-2018/pages/how-to-speak/
-->

---

## Eazfuscator.NET C# 프로젝트 코드 난독화

신규 모듈 개발 시, 소스 코드 보호를 위해 Eazfuscator.NET을 사용하여 코드 난독화를 적용하는 것을 권장합니다.

- 목적: 소스 코드의 가독성을 낮추어 리버스 엔지니어링을 어렵게 만듭니다.
- 설치: `https://www.gapotchenko.com/eazfuscator.net/download` 에서 평가판 설치 프로그램을 다운로드할 수 있습니다.

---

## Eazfuscator.NET 설정 1: 어셈블리 서명 (1/3)

<!-- _class: reference-page -->



라이선스 발급 및 난독화를 위해 어셈블리 서명이 필요합니다.

1. 서명 파일 생성 (`.snk`)
   - 프로젝트 루트 위치에서 모듈명과 동일하게 생성합니다.

---

## Eazfuscator.NET 설정 1: 어셈블리 서명 (2/3)

<!-- _class: reference-page -->



```bash
sn -k modulename.snk
```

2. 프로젝트 파일(`.csproj`)에 설정 추가

---

## Eazfuscator.NET 설정 1: 어셈블리 서명 (3/3)

<!-- _class: reference-page -->



```xml
<PropertyGroup>
    <SignAssembly>True</SignAssembly>
    <AssemblyOriginatorKeyFile>modulename.snk</AssemblyOriginatorKeyFile>
</PropertyGroup>
```

---

## 어셈블리 서명(Strong-Name)의 중요성

- 이름·버전·공개 키로 어셈블리 식별에 사용합니다.
- Strong Name 자체는 게시자 신뢰나 보안 경계가 아닙니다.
- GAC·버전별 병존은 .NET Framework 맥락입니다. 현대 .NET과 구분합니다.

[Microsoft: Strong-named assemblies](https://learn.microsoft.com/dotnet/standard/assembly/strong-named)

`.snk` 파일은 공개 키와 개인 키를 포함하며, 유출 시 어셈블리 위변조가 가능해집니다.

---

> ## 주의: .snk 파일 보안
>
> `.snk` 파일은 민감한 정보이므로, 절대 공개 된 버전 관리 시스템(Git, Svn 등)에 커밋하지 마십시오.
>
> 비밀 관리 시스템이나 안전한 위치에 보관하고 필요할 때만 사용해야 합니다.
>
> 분실 시 기존 키로 재서명할 수 없습니다. 유출 시 키를 교체하고 참조·라이선스·배포 영향과 재발급 절차를 점검합니다.

---

## Eazfuscator.NET 설정 2: 빌드 이벤트 추가

프로젝트 파일(`.csproj`)에 설정을 추가하여 `Release` 빌드 시 자동으로 난독화를 적용합니다.

```xml
<PropertyGroup>
    <EazfuscatorIntegration>MSBuild</EazfuscatorIntegration>
    <EazfuscatorActiveConfiguration>Release</EazfuscatorActiveConfiguration>
    <EazfuscatorCompatibilityVersion>2025.1</EazfuscatorCompatibilityVersion>
</PropertyGroup>
```

- 라이선스로 보호할 신규 모듈의 `.csproj`에 개별적으로 추가합니다.

---

## 모듈 라이선스 키란? (1/3)

<!-- _class: reference-page -->



모듈의 허용 대상·조건을 검증하는 키입니다. 실제 사용 권리는 해당 라이선스 계약으로 정합니다.

---

## 모듈 라이선스 키란? (2/3)

<!-- _class: reference-page -->



- 역할
  - 모듈의 Contract 코드 및 설정을 암호화합니다.
  - 라이선스 키가 없으면 모듈 사용이 불가능합니다.
  - 무단 사용을 제한하는 통제 중 하나이며 복제·분석을 완전히 막지는 못합니다.

---

## 모듈 라이선스 키란? (3/3)

<!-- _class: reference-page -->



- 참고
  - HandStack 플랫폼 자체의 MIT 라이선스와는 별개입니다.
  - 서버(ack)와 클라이언트(UI) 양쪽에서 검증됩니다.

---

## 서버 측 라이선스 키 예제 (1/2)

<!-- _class: reference-page -->



`appsettings.json` 파일에 모듈별 라이선스 정보를 설정합니다. `ack` 서버가 시작될 때 이 정보를 읽어 모듈을 로드하며 검증합니다.

---

## 서버 측 라이선스 키 예제 (2/2)

<!-- _class: reference-page -->



```json
{
    "LoadModules": [ "...", "custom-api-module" ],
    "LoadModuleLicenses": {
        "custom-api-module": {
            "CompanyName": "HandStack",
            "ProductName": "CustomApiModule-v1.0.0-PROD001",
            "AuthorizedHost": "handstack.kr,www.handstack.kr",
            "Key": "NDJlNjE2Yj...(생략)...zMwMzkzMg==",
            "ExpiresAt": "2026-07-01T23:59:59.000Z",
            "Environment": "Production",
            "SignKey": "ac3263d4...(생략)...dstack-salt-value"
        }
    }
}
```

---

## 클라이언트 측 라이선스 키 예제

업무 화면이 실행될 때 JavaScript 파일에 포함된 라이선스 키를 검증합니다.

`customApiModuleLicense.js`
```js
/*!
 * Product ID: CustomApiModule-v1.0.0-PROD001
 * Authorized Domain(or IP): handstack.kr,www.handstack.kr
 * Publisher: handstack.kr
 * Expires: 2026-07-01T23:59:59.000Z
 */
/* eslint-disable */
var customApiModuleLicense = "NDJlNjE2Yj...(생략)...zMwMzkzMg==.ac3263d4...(생략)...dstack-salt-value";
if (typeof window !== "undefined") window.customApiModuleLicense = customApiModuleLicense;
```

---

## 모듈 라이선스 키 발급하기 (1/3) - 공개 키 확인 (1/2)

<!-- _class: reference-page -->



`handstack` CLI 도구를 사용하여 서명된 어셈블리의 공개 키 정보를 확인합니다.

- 경로: `handstack/4.Tool/CLI/handstack`

---

## 모듈 라이선스 키 발급하기 (1/3) - 공개 키 확인 (2/2)

<!-- _class: reference-page -->



```bash
handstack publickey --file="C:\..\modulename.dll"

어셈블리 파일 경로: ...\modulename.dll
...
공개 키 (Hex):
002400000480000094...
...
공개 키 (SHA256):
e066b046f40c9f1fd0c263265227be9e068a73be1f403e482f484fbc450148b9
...
```

이 공개 키 정보는 라이선스 생성에 사용됩니다.

---

## 모듈 라이선스 키 발급하기 (2/3) - 개발사 정보 변경 (1/2)

<!-- _class: reference-page -->



`license-manager.js`에 발급자 정보를 설정합니다. 설정만으로 법적 권리나 독점 사용권이 생기는 것은 아닙니다.

- 경로: `handstack/4.Tool/CLI/node-cli/license-cli/license-manager.js`

```js
this.saltValue = 'e066b046f40c9f1fd0c263265227be9e068a73be1f403e482f484fbc450148b9'; // 모듈 공개 키
this.publisher = 'your-company.com'; // 발행자 정보
this.allowedDomains = ['localhost', '127.0.0.1']; // 기본 허용 도메인
this.currentUser = 'your-name'; // 생성자 정보
```

---

## 모듈 라이선스 키 발급하기 (2/3) - 개발사 정보 변경 (2/2)

<!-- _class: reference-page -->



- `saltValue`: 이전 단계에서 확인한 모듈의 공개 키(SHA256)를 사용합니다.

---

## 모듈 라이선스 키 발급하기 (3/3) - `license-cli.js` 사용 (1/2)

<!-- _class: reference-page -->



`license-cli.js` 도구를 사용하여 최종 라이선스 키를 생성합니다.

- 경로: `handstack/4.Tool/CLI/node-cli/license-cli`

---

## 모듈 라이선스 키 발급하기 (3/3) - `license-cli.js` 사용 (2/2)

<!-- _class: reference-page -->



```bash
npm install

node license-cli.js create --module-id "custom-api-module" `
  --company "HandStack" `
  --product "CustomApiModule-v1.0.0-PROD001" `
  --hosts "handstack.kr,www.handstack.kr" `
  --environment "Production" `
  --expires "2026-07-01T23:59:59.000Z" `
  --gen-js --js-dir "./generated-licenses"
```

- `--gen-js`: 클라이언트용 JavaScript 라이선스 파일도 함께 생성합니다.

---

## Contract 암호화 하기

생성된 라이선스 키(어셈블리 서명 기반)를 사용하여 `dbclient`, `function`, `transact` 모듈의 Contract를 암호화합니다.

- `handstack` CLI 도구 사용
- 경로: `handstack/4.Tool/CLI/handstack`

```bash
handstack encryptcontracts `
  --file="C:\..\modulename.dll" `
  --directory="C:\..\modulename\bin\Debug\net10.0\Contracts"
```
- 어셈블리 파일에 포함된 공개 키와 토큰 키를 사용하여 암호화를 수행합니다.

---

## 암호화된 Contract 예제: dbclient (XML)

- `signaturekey`와 `encryptcommands` 필드가 추가되고, 원본 쿼리는 암호화됩니다.

```xml
<?xml version="1.0" encoding="utf-8"?>
<mapper xmlns="contract.xsd">
  <header>
    <application>HDS</application>
    <transaction>MYS010</transaction>
    <desc>MySQL 거래 테스트</desc>
    <signaturekey>b9af6de54c4bdeb3</signaturekey>
    <encryptcommands>Dooo4WTlsCFhT474P4TpZ3a8aBzCH3PdO8...(생략)...</encryptcommands>
  </header>
  <commands></commands>
</mapper>
```

---

## 암호화된 Contract 예제: transact (JSON)

- `SignatureKey`와 `EncryptServices` 필드가 추가되고, 서비스 정의가 암호화됩니다.

```json
{
  "ApplicationID": "HDS",
  "ProjectID": "BOD",
  "TransactionID": "BOD010",
  "Comment": "게시글 목록 거래",
  "Services": [],
  "Models": [],
  "SignatureKey": "b9af6de54c4bdeb3",
  "EncryptServices": "V53JUvsmh/ZpCOeEtQVMmhgMbffMykl2wO...(생략)..."
}
```

---

## 왜 소스 코드(.cs, .js, .py)는 암호화하지 않는가?

소스 코드 파일 자체를 암호화하는 것은 비효율적이며 여러 문제를 야기합니다.

- 개발 및 유지보수의 어려움 (디버깅 불가)
- 컴파일 및 실행 환경 문제 (성능 저하)
- 보안의 한계 (복호화 키 관리 문제 발생)

HandStack은 오픈소스로서 투명성과 협력을 장려합니다.

---

## 실제적인 소스 코드 보호 방법

소스 코드 자체 암호화 대신, 다음과 같은 검증된 방법을 사용합니다.

- 컴파일된 코드 배포 (.NET 어셈블리, Java JAR)
- 난독화 (Obfuscation)
  - 변수, 함수명을 변경하고 코드 흐름을 복잡하게 만들어 분석을 방해
- 핵심 로직은 서버 측에서 실행
- 법적 보호 장치 (라이선스 계약)

---

## 잠깐, 구분해 보기

브라우저의 라이선스 검증만으로 서버 기능까지 보호할 수 있을까요?

<!--
질문 후 잠시 기다립니다. 답이 없으면 앞에서 본 예제를 다시 가리킵니다.
확인할 답: 클라이언트 코드는 사용자가 제어할 수 있습니다. 서버의 검증과 배포·키 관리가 함께 필요합니다.
다음 주제로 넘어가기 전에 차이를 청중의 표현으로 한 번 확인합니다.
-->

---

## 모듈 라이선스 키 검증 흐름

1. `ack` 서버 시작
   - `appsettings.json`의 라이선스 키를 이용해 모듈 로드 시 검증

2. Contract 로드
   - 암호화된 Contract (`dbclient`, `function`, `transact`) 로드 시, 모듈의 서명 키를 이용해 복호화

3. UI 화면 실행
   - JavaScript 라이선스 키를 클라이언트 측에서 검증

---

## 직접 모듈 라이선스 키 검증하기 - CLI

`license-cli.js` 도구를 사용하여 파일에 저장된 라이선스 키를 검증할 수 있습니다.

```bash
# licenses.json 파일에 발급받은 라이선스 키를 등록
# 예시: { "handstack-ui-v1": "라이선스 키 값..." }

node license-cli.js validate `
  --module-id "handstack-ui-v1" `
  --file "./licenses.json"
```

---

## 직접 모듈 라이선스 키 검증하기 - 브라우저

1. 개발사 정보 설정
   - `handstack/4.Tool/CLI/node-cli/license-cli/demo/license-validator-browser.js` 파일의 `saltValue`, `publisher` 등을 개발사 정보로 수정합니다.

2. 데모 페이지에서 확인
   - `license-validation-demo.html` 파일에 발급받은 JS 라이선스 파일을 포함시킨 후, 브라우저에서 열어 검증 로직을 테스트할 수 있습니다.

---

## 라이선스 관리의 완료 기준

- 개인 키를 보호하고 개발사·모듈 식별 정보를 맞춥니다.
- 서버·계약·브라우저의 검증 경로를 각각 시험합니다.
- 정상 키와 만료·변조·대상 불일치 사례를 비교합니다.

<!--
질문을 받는 동안 이 확인 기준을 화면에 남깁니다. 청중이 자신의 업무에 적용할 다음 행동 하나를 고르게 합니다.
-->

