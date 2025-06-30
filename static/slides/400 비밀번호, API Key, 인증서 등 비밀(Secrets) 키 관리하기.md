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

# 비밀번호, API Key, 인증서 등 비밀(Secrets) 키 관리하기

### ack 서버를 이용하는 간단한 KVS (Key Vault Secret) RESTFul API

---

## 왜 비밀(Secret) 관리가 필요한가?

- 소스 코드나 구성 파일에 암호, API 키 등 중요한 데이터를 저장하는 것은 보안에 매우 취약합니다.
- 개발, 테스트, 프로덕션 환경마다 다른 비밀 데이터를 사용해야 하며, 이를 안전하게 관리할 방법이 필요합니다.
- 비밀 데이터는 앱과 함께 배포되어서는 안 되며, KVS(Key Vault Secret)나 KMS(Key Management Server)와 같은 제어된 수단을 통해 접근해야 합니다.

> HandStack은 ack 서버를 통해 간단하면서도 강력한 KVS RESTFul API를 제공하여 이러한 문제를 해결합니다.

---

## HandStack KVS 인증 및 인가 방식

HandStack은 HTTP 요청 헤더를 통해 클라이언트를 식별하고 인가를 제어합니다.

- API 요청 시 특정 헤더 값을 서버로 전송합니다.
    - `HandStack-MachineID`: 클라이언트 하드웨어 고유 ID
    - `HandStack-IP`: 클라이언트 IP 주소
    - `HandStack-HostID`: 클라이언트 호스트 이름
    - `HandStack-Environment`: 실행 환경 (e.g., Development, Production)
- 서버는 수신된 헤더 값을 `handstack-secrets.json` 파일의 등록 정보와 비교하여 요청을 처리합니다.

---

## 데이터 저장 구조: `handstack-secrets.json`

모든 비밀 데이터는 ack 서버의 `handstack-secrets.json` 파일에 저장됩니다.

```json
{
    "ManagementHost": { ... },
    "Licenses": { ... },
    "Secrets": { ... }
}
```

- `ManagementHost`
  - 비밀 키를 관리(등록, 삭제)할 수 있는 관리자 클라이언트 정보를 정의합니다.

- `Licenses`
  - ack 서버에서 사용하는 상용 제품의 라이선스 키 정보를 관리합니다.

- `Secrets`
  - 각 클라이언트의 요청 조건과 일치하는 비밀 키 정보를 관리합니다.

---
<!--_class: tinytext -->
## `handstack-secrets.json` 상세 구조

```json
{
    "ManagementHost": {
        "MachineID": "[Current Hardware ID]",
        "IpAddress": "[IP 주소]",
        "HostName": "[HostName]",
        "SystemVaultKey": "[Strong@Passw0rd]"
    },
    "Licenses": {
        "[라이선스 키 고유 ID]": {
            "CompanyName": "[회사명]",
            "AuthorizedHost": "[도메인 또는 IP 주소]",
            "Key": "[라이언스 키 문자열]",
            "CreatedAt": "[발급 일시]",
            "ExpiresAt": "[만료 일시 또는 무제한 null]",
            "Environment": "[적용 환경: Development, Test, Production]",
            "SignKey": "[회사명|CreatedAt|ExpiresAt|Environment|localhost,...] sha256"
        }
    },
    "Secrets": {
        "HandStack-MachineID|HandStack-IP|HandStack-HostName": [
            { "Key": "DbPassword", "Value": "[AES256 Base64]", "IsEncryption": "Y", ... },
            { "Key": "ApiToken", "Value": "[Plain Text]", "IsEncryption": "N", ... }
        ]
    }
}
```

- `Secrets`의 키는 `MachineID`, `IP`, `HostName`을 `|`로 조합하여 사용하며, 이 값과 일치하는 클라이언트만 접근할 수 있습니다.

---

## KVS RESTFul API 소개

웹 브라우저가 아닌 클라이언트(서버 애플리케이션, CLI 도구 등)에서 다음 API를 사용하여 비밀 데이터를 안전하게 관리할 수 있습니다.

- **키 목록 API** `GET /keys`
  - 수급 가능한 전체 키 목록을 조회합니다.

- **키 등록 API** `POST /keys`
  - 새로운 키를 등록하거나 기존 키를 변경합니다.

- **키 삭제 API** `DELETE /keys/{name}`
  - 등록된 키를 삭제합니다.

- **키 수급 API** `GET /keys/{name}`
  - 특정 키의 값을 가져옵니다.

---

## 키 목록 API: `GET /keys`

ManagementHost에 등록된 관리자만 사용 가능합니다. 서버에 등록된 키 목록 전체를 조회합니다.

- **요청 예제**
```bash
curl --location "http://localhost:8421/keys" \
--header "HandStack-MachineID: [Current Hardware ID]" \
--header "HandStack-IP: [LocalIP]" \
--header "HandStack-HostName: [HostName]" \
--header "HandStack-Environment: [EnvironmentName]"
```

---

## 키 등록 API: `POST /secrets`

ManagementHost에 등록된 관리자만 사용 가능합니다. 새로운 키를 등록하거나 기존 키를 덮어씁니다.

- **요청 예제**
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

## 키 삭제 API: `DELETE /keys/{name}`

ManagementHost에 등록된 관리자만 사용 가능합니다. 지정된 이름의 키를 삭제합니다.

- **요청 예제**
```bash
curl --location --request DELETE "http://localhost:8421/keys/[name]" \
--header "HandStack-MachineID: [Current Hardware ID]" \
--header "HandStack-IP: [LocalIP]" \
--header "HandStack-HostName: [HostName]" \
--header "HandStack-Environment: [EnvironmentName]"
```

---

## 키 수급 API: `GET /keys/{name}`

서버에 등록된 비밀 키를 애플리케이션에서 사용하기 위해 호출합니다.

- **요청 예제**
```bash
curl --location "http://localhost:8421/keys/[name]" \
--header "HandStack-MachineID: [Current Hardware ID]" \
--header "HandStack-IP: [LocalIP]" \
--header "HandStack-HostName: [HostName]" \
--header "HandStack-Environment: [EnvironmentName]"
```

- 요청하는 클라이언트의 헤더 정보와 `Secrets`에 등록된 키가 일치해야 값을 반환합니다.

---
<!--_class: tinytext -->
## 애플리케이션 적용 예제 (C#)

ASP.NET Core 애플리케이션에서 HttpClient를 사용하여 ack 서버로부터 비밀 키를 가져오는 예제입니다.

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
    var content = keyItem.IsEncryption.ToBoolean() == true ? 
        keyItem.Value.DecryptAES(vaultKey) : keyItem.Value;

    return content;
}
```

---

## 요약

- HandStack의 `ack` 서버를 활용하여 소스 코드에서 민감한 정보를 분리하고 안전하게 관리할 수 있습니다.
- HTTP 헤더 기반의 간단한 인증 방식으로 클라이언트를 식별하고 접근을 제어합니다.
- 직관적인 RESTFul API를 통해 개발 및 운영 환경에서 필요한 비밀 데이터를 손쉽게 등록, 조회, 삭제, 수급할 수 있습니다.
- 이를 통해 보안성을 강화하고 애플리케이션 배포 및 관리의 효율성을 높일 수 있습니다.
