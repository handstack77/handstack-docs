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

# HandStack 모듈 라이선스 관리 지침

### 소스 코드 보호 및 라이선스 발급/검증

---

## Eazfuscator.NET C# 프로젝트 코드 난독화

신규 모듈 개발 시, 소스 코드 보호를 위해 Eazfuscator.NET을 사용하여 코드 난독화를 적용하는 것을 권장합니다.

- 목적: 소스 코드의 가독성을 낮추어 리버스 엔지니어링을 어렵게 만듭니다.
- 설치: `https://www.gapotchenko.com/eazfuscator.net/download` 에서 평가판 설치 프로그램을 다운로드할 수 있습니다.

---

## Eazfuscator.NET 설정 1: 어셈블리 서명

라이선스 발급 및 난독화를 위해 어셈블리 서명이 필요합니다.

1. 서명 파일 생성 (`.snk`)
   - 프로젝트 루트 위치에서 모듈명과 동일하게 생성합니다.
   ```bash
   sn -k modulename.snk
   ```

2. 프로젝트 파일(`.csproj`)에 설정 추가
   ```xml
   <PropertyGroup>
       <SignAssembly>True</SignAssembly>
       <AssemblyOriginatorKeyFile>modulename.snk</AssemblyOriginatorKeyFile>
   </PropertyGroup>
   ```

---

## 어셈블리 서명(Strong-Name)의 중요성

- 고유한 신원 보장 및 이름 충돌 방지
- 무결성 보장 (코드가 변경되지 않았음을 확인)
- 신뢰의 원천 제공
- GAC (Global Assembly Cache) 등록 시 필수 조건
- 버전 관리 및 Side-by-Side 실행 지원

`.snk` 파일은 공개 키와 개인 키를 포함하며, 유출 시 어셈블리 위변조가 가능해집니다.

---

> ## 주의: .snk 파일 보안
>
> `.snk` 파일은 민감한 정보이므로, 절대 공개 된 버전 관리 시스템(Git, Svn 등)에 커밋하지 마십시오.
>
> 비밀 관리 시스템이나 안전한 위치에 보관하고 필요할 때만 사용해야 합니다.
>
> 만약 유출되거나 분실한 경우, 해당 서명으로 된 어셈블리를 더 이상 업데이트 할 수 없으므로, 새로운 키 쌍을 생성하고 어셈블리를 다시 서명해야 합니다.

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

- 이 설정은 `qcn.qramework\modules\` 내 모든 프로젝트에 기본 적용되어 있습니다.

---

## 모듈 라이선스 키란?

모듈을 특정 고객사에게 독점적으로 사용 허가하는 고유한 암호화 키입니다.

- 역할
  - 모듈의 Contract 코드 및 설정을 암호화합니다.
  - 라이선스 키가 없으면 모듈 사용이 불가능합니다.
  - 무단 복제 및 배포를 방지하고 기술을 보호합니다.

- 참고
  - HandStack 플랫폼 자체의 MIT 라이선스와는 별개입니다.
  - 서버(ack)와 클라이언트(UI) 양쪽에서 검증됩니다.

---

## 서버 측 라이선스 키 예제

`appsettings.json` 파일에 모듈별 라이선스 정보를 설정합니다. `ack` 서버가 시작될 때 이 정보를 읽어 모듈을 로드하며 검증합니다.

<style scoped>
  marp-pre code { font-size: 22px; }
</style>

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

## 모듈 라이선스 키 발급하기 (1/3) - 공개 키 확인

`handstack` CLI 도구를 사용하여 서명된 어셈블리의 공개 키 정보를 확인합니다.

- 경로: `handstack/4.Tool/CLI/handstack`

<style scoped>
  marp-pre code { font-size: 22px; }
</style>

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

## 모듈 라이선스 키 발급하기 (2/3) - 개발사 정보 변경

`license-manager.js` 파일에 개발사 고유 정보를 설정하여 지적 재산권을 보호합니다.

- 경로: `handstack/4.Tool/CLI/node-cli/license-cli/license-manager.js`

```js
this.saltValue = 'e066b046f40c9f1fd0c263265227be9e068a73be1f403e482f484fbc450148b9'; // 모듈 공개 키
this.publisher = 'your-company.com'; // 발행자 정보
this.allowedDomains = ['localhost', '127.0.0.1']; // 기본 허용 도메인
this.currentUser = 'your-name'; // 생성자 정보
```

- `saltValue`: 이전 단계에서 확인한 모듈의 공개 키(SHA256)를 사용합니다.

---

## 모듈 라이선스 키 발급하기 (3/3) - `license-cli.js` 사용

`license-cli.js` 도구를 사용하여 최종 라이선스 키를 생성합니다.

- 경로: `handstack/4.Tool/CLI/node-cli/license-cli`

<style scoped>
  marp-pre code { font-size: 22px; }
</style>

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
  --directory="C:\..\modulename\bin\Debug\net8.0\Contracts"
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

