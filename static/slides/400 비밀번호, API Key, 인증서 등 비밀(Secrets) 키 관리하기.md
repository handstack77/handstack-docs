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
</style>

# 비밀번호, API Key, 인증서 등 비밀(Secrets) 키 관리하기

KVS의 관리·수급 API를 구분하고, 비밀정보의 접근·교체·삭제를 검증합니다.


<!--
발표: 첫 화면의 목표를 말한 뒤 핵심 개념과 예제로 진행합니다. 확인 질문 뒤에는 답할 시간을 주고, 마지막 완료 기준을 남겨 질문을 받습니다.
발표 구성 참고: MIT OpenCourseWare, Patrick Winston, How to Speak (2018), https://ocw.mit.edu/courses/res-tll-005-how-to-speak-january-iap-2018/pages/how-to-speak/
-->

---

## 왜 비밀(Secret) 관리가 필요한가?

- 소스 코드나 구성 파일에 암호, API 키 등 중요한 데이터를 저장하는 것은 보안에 매우 취약합니다.
- 개발, 테스트, 프로덕션 환경마다 다른 비밀 데이터를 사용해야 하며, 이를 안전하게 관리할 방법이 필요합니다.
- 비밀 데이터는 앱과 함께 배포되어서는 안 되며, KVS(Key Vault Secret)나 KMS(Key Management Server)와 같은 제어된 수단을 통해 접근해야 합니다.

> ack의 KVS API로 키를 관리·수급합니다. 통신 보호·파일 권한·호출자 인증을 별도로 설계해야 합니다.

---

## HandStack KVS 인증 및 인가 방식 (1/2)

<!-- _class: reference-page -->



이 구현은 HTTP 헤더를 등록 정보와 비교합니다. 헤더 값은 호출자가 조작할 수 있으므로, 그 자체를 강한 신원 증명으로 신뢰하지 않습니다.

- API 요청 시 특정 헤더 값을 서버로 전송합니다.
    - `HandStack-MachineID`: 클라이언트 하드웨어 고유 ID
    - `HandStack-IP`: 클라이언트 IP 주소
    - `HandStack-HostName`: 클라이언트 호스트 이름
    - `HandStack-Environment`: 실행 환경 (e.g., Development, Production)

---

## HandStack KVS 인증 및 인가 방식 (2/2)

<!-- _class: reference-page -->



- 서버는 수신된 헤더 값을 `handstack-secrets.json` 파일의 등록 정보와 비교하여 요청을 처리합니다.

---

## 데이터 저장 구조: `handstack-secrets.json` (1/2)

<!-- _class: reference-page -->



이 예제의 비밀 데이터는 ack 서버의 `handstack-secrets.json`에 저장됩니다. 파일·백업 접근을 제한하고 TLS와 별도 인증·네트워크 통제를 적용합니다. 전문 비밀 저장소의 보호 기능과 동일하다고 가정하지 않습니다.

```json
{
    "ManagementHost": { ... },
    "Secrets": { ... }
}
```

---

## 데이터 저장 구조: `handstack-secrets.json` (2/2)

<!-- _class: reference-page -->



- `ManagementHost`
  - 비밀 키를 관리(등록, 삭제)할 수 있는 관리자 클라이언트 정보를 정의합니다.

- `Secrets`
  - 각 클라이언트의 요청 조건과 일치하는 비밀 키 정보를 관리합니다.

---

## `handstack-secrets.json` 상세 구조 (1/2)

<!-- _class: reference-page -->



```json
{
    "ManagementHost": {
        "MachineID": "[Current Hardware ID]",
        "IpAddress": "[IP 주소]",
        "HostName": "[HostName]",
        "SystemVaultKey": "[Strong@Passw0rd]"
    },
    "Secrets": {
        "HandStack-MachineID|HandStack-IP|HandStack-HostName": [
            { "Key": "DbPassword", "Value": "[AES256 Base64]", "IsEncryption": "Y", ... },
            { "Key": "ApiToken", "Value": "[Plain Text]", "IsEncryption": "N", ... }
        ]
    }
}
```

---

## `handstack-secrets.json` 상세 구조 (2/2)

<!-- _class: reference-page -->



- `Secrets`의 키는 `MachineID`, `IP`, `HostName`을 `|`로 조합하여 사용하며, 이 값과 일치하는 클라이언트만 접근할 수 있습니다.

---

## 잠깐, 구분해 보기

MachineID·IP·HostName 헤더가 같으면 요청자를 신뢰해도 될까요?

<!--
질문 후 잠시 기다립니다. 답이 없으면 앞에서 본 예제를 다시 가리킵니다.
확인할 답: 클라이언트가 보낸 헤더만으로 강한 신원을 증명할 수 없습니다. TLS·네트워크 제한·신뢰 경계를 함께 검토합니다.
다음 주제로 넘어가기 전에 차이를 청중의 표현으로 한 번 확인합니다.
-->

---

## KVS RESTFul API 소개 (1/2)

<!-- _class: reference-page -->



서버 애플리케이션·CLI에서 사용하는 관리·수급 API입니다. 아래 localhost·예제 키는 실습용이며 운영 값으로 재사용하지 않습니다.

- **키 목록 API** `GET /secrets`
  - 수급 가능한 전체 키 목록을 조회합니다.

- **키 등록 API** `POST /secrets`
  - 새로운 키를 등록하거나 기존 키를 변경합니다.

- **키 삭제 API** `DELETE /secrets/{name}`
  - 등록된 키를 삭제합니다.

---

## KVS RESTFul API 소개 (2/2)

<!-- _class: reference-page -->



- **키 수급 API** `GET /secrets/{name}`
  - 특정 키의 값을 가져옵니다.

---

## 키 목록 API: `GET /secrets`

ManagementHost에 등록된 관리자만 사용 가능합니다. 서버에 등록된 키 목록 전체를 조회합니다.

- **요청 예제**
```bash
curl --location "http://localhost:8421/secrets" \
--header "HandStack-MachineID: [Current Hardware ID]" \
--header "HandStack-IP: [LocalIP]" \
--header "HandStack-HostName: [HostName]" \
--header "HandStack-Environment: [EnvironmentName]"
```

---

## 키 등록 API: `POST /secrets` (1/2)

<!-- _class: reference-page -->



관리자 조건을 확인한 뒤 등록합니다. 같은 이름은 덮어쓰므로 대상 환경·키 이름과 교체 후 의존 서비스의 동작을 먼저 확인합니다.

- **요청 예제**

---

## 키 등록 API: `POST /secrets` (2/2)

<!-- _class: reference-page -->



```bash
curl --location 'http://localhost:8421/secrets' \
--header 'HandStack-MachineID: [Current Hardware ID]' \
--header 'HandStack-IP: [LocalIP]' \
--header 'HandStack-HostName: [HostName]' \
--header 'HandStack-Environment: [EnvironmentName]' \
--header 'Content-Type: application/json' \
--data '{
    "Key": "PlainValue",
    "Value": "Hello World Blabla",
    "IsEncryption": "N",
    "ExpiresAt": null,
    "Environment": "Development",
    "Tags": ["Test"]
}'
```

---

## 키 삭제 API: `DELETE /secrets/{name}`

관리자 조건을 확인한 뒤 지정한 키를 삭제합니다. 사용 중인 서비스 영향과 복구 수단을 확인하고 실습 키로 시험합니다.

- **요청 예제**
```bash
curl --location --request DELETE "http://localhost:8421/secrets/[name]" \
--header "HandStack-MachineID: [Current Hardware ID]" \
--header "HandStack-IP: [LocalIP]" \
--header "HandStack-HostName: [HostName]" \
--header "HandStack-Environment: [EnvironmentName]"
```

---

## 키 수급 API: `GET /secrets/{name}`

서버에 등록된 비밀 키를 애플리케이션에서 사용하기 위해 호출합니다.

- **요청 예제**
```bash
curl --location "http://localhost:8421/secrets/[name]" \
--header "HandStack-MachineID: [Current Hardware ID]" \
--header "HandStack-IP: [LocalIP]" \
--header "HandStack-HostName: [HostName]" \
--header "HandStack-Environment: [EnvironmentName]"
```

- 요청하는 클라이언트의 헤더 정보와 `Secrets`에 등록된 키가 일치해야 값을 반환합니다.

---

## 애플리케이션 적용 예제 (C#) (1/4)

<!-- _class: reference-page -->



ASP.NET Core 애플리케이션에서 HttpClient를 사용하여 ack 서버로부터 비밀 키를 가져오는 예제입니다.

---

## 애플리케이션 적용 예제 (C#) (2/4)

<!-- _class: reference-page -->



```csharp
// http://localhost:8421/wwwroot/api/index/get-secret?keyName=MySecret
[HttpGet("[action]")]
public async Task<string> GetSecret(string? baseUrl, string keyName)
{
    if (string.IsNullOrEmpty(baseUrl) == true)
    {
        baseUrl = Request.GetBaseUrl();
    }

    var requestUri = $"{baseUrl}/secrets/{keyName}";
    using var httpClient = new HttpClient() { Timeout = TimeSpan.FromSeconds(3) };
    using var request = new HttpRequestMessage(HttpMethod.Get, requestUri);

    // KVS 서버에 전달할 클라이언트 식별 헤더 추가
```

<!-- 이어지는 코드 조각입니다. 앞뒤 페이지를 순서대로 읽으며 전체 예제의 일부임을 설명합니다. -->

---

## 애플리케이션 적용 예제 (C#) (3/4)

<!-- _class: reference-page -->



```csharp
    request.Headers.Add("HandStack-MachineID", GlobalConfiguration.HardwareID);
    request.Headers.Add("HandStack-IP", GlobalConfiguration.ServerLocalIP);
    request.Headers.Add("HandStack-HostName", GlobalConfiguration.HostName);
    request.Headers.Add("HandStack-Environment", GlobalConfiguration.RunningEnvironment);

    using var response = await httpClient.SendAsync(request);
    response.EnsureSuccessStatusCode();

    var secretData = await response.Content.ReadAsStringAsync();
    var keyItem = JsonConvert.DeserializeObject<KeyItem>(secretData)!;

    // IsEncryption이 'Y'인 경우, 복호화하여 원본 값 반환
    string systemVaultKey = "[Strong@Passw0rd]"; // 실제로는 안전한 곳에서 로드
    var vaultKey = (systemVaultKey + "|" + keyItem.Key.PadRight(32, '0')).Substring(0, 32);
```

<!-- 이어지는 코드 조각입니다. 앞뒤 페이지를 순서대로 읽으며 전체 예제의 일부임을 설명합니다. -->

---

## 애플리케이션 적용 예제 (C#) (4/4)

<!-- _class: reference-page -->



```csharp
    var content = keyItem.IsEncryption.ToBoolean() == true ?
        keyItem.Value.DecryptAES(vaultKey) : keyItem.Value;

    return content;
}
```

<!-- 이어지는 코드 조각입니다. 앞뒤 페이지를 순서대로 읽으며 전체 예제의 일부임을 설명합니다. -->

---

## 비밀정보 관리의 기준

- 관리자와 수급 클라이언트의 권한을 분리합니다.
- 환경별 키의 등록·조회·교체·삭제와 거절 요청을 시험합니다.
- handstack-secrets.json·로그·백업의 접근 권한을 제한합니다.

<!--
질문을 받는 동안 이 확인 기준을 화면에 남깁니다. 청중이 자신의 업무에 적용할 다음 행동 하나를 고르게 합니다.
-->
