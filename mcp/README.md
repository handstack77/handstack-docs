# HandStack 문서 MCP 서버

HandStack 공식 문서(https://handstack.kr)를 AI 에이전트가 검색하고 섹션 단위로 읽게 하는 원격 MCP 서버입니다. Streamable HTTP(stateless, JSON 응답)로 동작하며 사이트의 `/mcp` 주소로 노출합니다. 사용자용 안내는 사이트의 [HandStack 문서 MCP 서버](https://handstack.kr/docs/guides/에이전트에-문서-연결하기) 문서를 보세요. 이 문서는 개발·운영하는 사람을 위한 안내입니다.

이 폴더는 npm으로 배포하지 않고(`private`) 사이트 배포물에 포함됩니다. 사이트 호스트(`Program.cs`)가 이 서버를 자식 프로세스로 직접 실행하므로 운영에서 따로 띄울 필요가 없습니다.

## 구조

```
docs/**/*.mdx ─(plugins/agent-docs, 사이트 빌드)─▶ build/agent/docs-index.json ─▶ wwwroot/agent/docs-index.json (배포)
                                                              │
                  MCP 서버(bin/serve.mjs) ◀───────────────────┘ 파일을 읽고 10분마다 갱신
                        ▲ 자식 프로세스로 실행·감시 (McpLauncher.cs)
                        │ 127.0.0.1:<빈 포트>
클라이언트 ─POST /mcp─▶ 사이트 호스트 (McpProxy.cs) ─────────┘
```

- 인덱스 생성: `plugins/agent-docs/` (Docusaurus 플러그인). `npm run build`가 `llms.txt`, `llms-full.txt`, 영역별 `llms-*.txt`, `agent/docs-index.json`을 함께 만듭니다. `npm run start`는 같은 파일을 개발 서버에서 제공합니다.
- 검색: `src/search.mjs` — 섹션 단위 BM25. 한글은 2-gram 토큰화.
- 도구: `src/server.mjs` (`search_docs`, `get_doc`, `list_docs`, `get_sample`), 로직은 `src/service.mjs`
- HTTP: `src/http.mjs`(요청 처리), `src/holder.mjs`(인덱스 주기 갱신), `src/cli.mjs`(옵션 해석), `src/parent-watch.mjs`(부모 프로세스 감시)
- 사이트 호스트: `McpLauncher.cs`(실행·감시), `McpProxy.cs`(`/mcp` 프록시)

## 개발

```bash
npm install
npm test                  # 고정 fixture 로 검증하므로 사이트 빌드가 필요 없습니다
```

실제 인덱스로 서버만 실행하려면 저장소 루트에서 `npm run build`를 한 뒤 다음을 실행합니다. `http://127.0.0.1:8787/mcp`에서 응답하고, 브라우저로 열면 상태 페이지가 보입니다.

```bash
HANDSTACK_DOCS_INDEX=../build/agent/docs-index.json npm start
```

### 개발 서버에서 확인

`npm run start`(사이트 개발 서버)는 `mcp/`의 MCP 서버를 자식 프로세스로 함께 실행하고 `http://localhost:3000/mcp`로 전달합니다. 브라우저로 열면 상태 페이지가 보이고, MCP 클라이언트에는 이 주소를 등록하면 됩니다.

```bash
npm install --prefix mcp      # 처음 한 번
npm run start
claude mcp add --transport http handstack-docs-dev http://localhost:3000/mcp
codex mcp add handstack-docs-dev --url http://localhost:3000/mcp   # Codex CLI
```

- 개발 서버가 만드는 `/agent/docs-index.json`(`.docusaurus/agent-docs-dev/`)을 파일로 직접 읽습니다. 문서를 저장하면 산출물이 바로 갱신되고, MCP 서버는 개발 중에 1분마다 다시 읽습니다(`HANDSTACK_DOCS_RELOAD_MINUTES`로 조정).
- 요청 제한은 두지 않습니다(`HANDSTACK_DOCS_RATE_LIMIT=0`). 개발 서버의 프록시는 운영 호스트(`McpProxy.cs`)와 달리 본문 크기 제한과 `X-Forwarded-For` 처리가 없으므로 개발 확인용으로만 쓰세요.
- 서버는 `mcp/`에 의존성이 없거나 비활성화하면 뜨지 않으며 `/mcp`는 `503`과 안내 메시지를 돌려줍니다. 개발 서버 자체는 영향을 받지 않습니다.
- 끄려면 `AGENT_DOCS_MCP=false npm run start`로 실행하거나 `docusaurus.config.ts`에서 플러그인 옵션 `{ mcp: false }`를 지정하세요.
- 개발 서버가 종료되면 MCP 서버도 함께 종료되고, 개발 서버가 강제 종료되어도 부모 감시로 정리됩니다.

MCP 서버만 따로 실행해서 개발 서버의 인덱스를 읽게 할 수도 있습니다.

```bash
HANDSTACK_DOCS_INDEX=http://localhost:3000/agent/docs-index.json npm start
```

[MCP Inspector](https://github.com/modelcontextprotocol/inspector)에서 `Streamable HTTP`로 `http://127.0.0.1:8787/mcp`에 연결하면 도구를 직접 호출해 볼 수 있습니다.

```bash
npx @modelcontextprotocol/inspector
```

## 운영

### 1. 기본: 사이트 호스트가 직접 실행

배포 폴더에 `mcp/`(`bin`, `src`, `package.json`, `node_modules`)가 있고 `node`(18 이상)를 찾을 수 있으면 사이트 호스트가 시작할 때 MCP 서버를 자동으로 실행합니다. 환경 변수를 따로 지정할 필요가 없습니다.

```bash
./publish.sh win Release x64      # npm run build, npm ci --omit=dev --prefix mcp, dotnet build
dotnet handstack-docs.dll 8080     # 시작 로그의 "MCP: ..." 줄에서 동작 모드를 확인
```

- **배포**: `publish.sh`/`publish.bat`이 `npm ci --omit=dev --prefix mcp`로 운영 의존성을 설치하고, `handstack-docs.csproj`가 실행에 필요한 파일만 출력 폴더의 `mcp/`로 복사합니다. 테스트, README, `package-lock.json`은 복사하지 않습니다. 의존성은 순수 JavaScript라 OS가 달라도 그대로 쓸 수 있습니다.
- **실행**: `127.0.0.1`의 빈 포트에 바인딩하므로 외부에서 직접 접근할 수 없습니다. `/healthz`가 응답하면 준비된 것으로 보고 그때부터 `/mcp` 요청을 넘깁니다. 준비 전에는 `/mcp`가 `503`을 돌려줍니다.
- **감시**: 서버가 죽으면 1, 2, 4, … 최대 30초 간격으로 다시 실행합니다. 1분 넘게 살아 있었다면 대기 시간을 초기화합니다. 호스트가 종료되면 함께 종료하고, 호스트가 강제 종료되어도 자식이 5초 간격으로 부모를 확인해 스스로 종료합니다.
- **인덱스**: 배포된 `wwwroot/agent/docs-index.json`을 직접 읽고 10분마다 다시 읽습니다. 새 문서를 배포하면 재시작 없이 반영됩니다.
- **자동 지정되는 값**: `HANDSTACK_DOCS_TRUST_PROXY=true`(호스트가 `X-Forwarded-For`에 실제 접속 IP를 담아 보내므로 IP별 요청 제한이 동작합니다), `HANDSTACK_DOCS_PARENT_PID`, 그리고 값이 없으면 `HANDSTACK_DOCS_INDEX`. 그 밖의 `HANDSTACK_DOCS_*` 변수는 호스트의 환경에서 그대로 상속합니다.

사이트 호스트 환경 변수는 다음과 같습니다.

| 변수 | 용도 |
|---|---|
| `HANDSTACK_MCP_ENABLED` | `false`이면 MCP 기능을 끄고 `/mcp`를 열지 않습니다 |
| `HANDSTACK_MCP_DIR` | `mcp` 폴더 위치. 기본은 실행 폴더의 `mcp` |
| `HANDSTACK_NODE` | `node` 실행 파일 경로. 기본은 `PATH`에서 검색 |
| `HANDSTACK_MCP_UPSTREAM` | 이미 실행 중인 서버 주소. 지정하면 직접 실행하지 않고 프록시만 합니다([외부 서버 모드](#2-외부-서버-모드)) |
| `HANDSTACK_MCP_TRUST_FORWARDED_FOR` | `true`이면 앞단 프록시(Nginx Proxy Manager, nginx, IIS 등)가 보낸 `X-Forwarded-For`에서 클라이언트 IP를 읽어 요청 제한에 씁니다. 앞단이 없거나 호스트가 인터넷에 직접 노출되어 있으면 켜지 마세요(헤더를 위조해 요청 제한을 우회할 수 있습니다) |
| `HANDSTACK_MCP_FORWARDED_HOPS` | 신뢰하는 프록시의 단수. 기본 `1`. CDN과 NPM이 모두 앞에 있으면 `2`처럼 지정합니다. `HANDSTACK_MCP_TRUST_FORWARDED_FOR=true`일 때만 의미가 있습니다 |

`/mcp`가 열리지 않을 때는 시작 로그의 `MCP:` 줄을 확인하세요. `mcp/`가 없는 경우, `node_modules`가 없는 경우, `node`를 찾지 못한 경우를 각각 구분해서 알려 줍니다.

프록시는 요청 본문을 64KB로 제한하고, 업스트림이 꺼져 있으면 `502`, 응답이 30초를 넘으면 `504`를 돌려줍니다.

### 2. 외부 서버 모드

MCP 서버를 호스트와 따로 운영하려면(예: 컨테이너 분리) 서버를 직접 실행하고 호스트에 주소를 알려 줍니다.

```bash
cd mcp
HANDSTACK_DOCS_INDEX=/경로/wwwroot/agent/docs-index.json \
HANDSTACK_DOCS_TRUST_PROXY=true \
HANDSTACK_DOCS_PUBLIC_URL=https://handstack.kr/mcp \
node bin/serve.mjs --port 8787

HANDSTACK_MCP_UPSTREAM=http://127.0.0.1:8787 dotnet handstack-docs.dll 8080
```

이 모드에서는 프로세스를 직접 감시해야 합니다(systemd, pm2, Windows 서비스 등). `HANDSTACK_DOCS_TRUST_PROXY=true`를 빼면 모든 요청이 호스트의 IP 하나로 보여 요청 제한이 전체 사용자에게 한꺼번에 걸립니다.

### 3. 서버 환경 변수

| 변수·옵션 | 기본값 | 용도 |
|---|---|---|
| `--port`, `HANDSTACK_DOCS_HTTP_PORT` | `8787` | 포트 |
| `--host`, `HANDSTACK_DOCS_HTTP_HOST` | `127.0.0.1` | 바인딩 주소. `0.0.0.0`으로 직접 노출할 때는 `HANDSTACK_DOCS_ALLOWED_HOSTS`를 함께 지정하세요 |
| `HANDSTACK_DOCS_ALLOWED_HOSTS` | (없음) | 허용할 `Host` 값 목록(쉼표 구분). DNS rebinding 방어. 루프백 바인딩이면 `localhost`류가 자동 허용됩니다 |
| `HANDSTACK_DOCS_ALLOWED_ORIGINS` | (없음) | 허용할 브라우저 `Origin` 목록(쉼표 구분, `*` 가능). `Origin`이 없는 일반 MCP 클라이언트는 영향이 없습니다 |
| `HANDSTACK_DOCS_RATE_LIMIT` | `60` | IP당 분당 요청 수. `0`이면 제한하지 않습니다 |
| `HANDSTACK_DOCS_TRUST_PROXY` | `false` | `true`이면 `X-Forwarded-For`의 마지막 값을 클라이언트 IP로 사용합니다. 신뢰하는 프록시 뒤에서만 켜세요 |
| `HANDSTACK_DOCS_PUBLIC_URL` | `http://localhost:<port>/mcp` | 상태 페이지에 보여 줄 공개 주소 |
| `HANDSTACK_DOCS_RELOAD_MINUTES` | `10` | 인덱스 갱신 확인 주기. `0`이면 갱신하지 않습니다 |
| `HANDSTACK_DOCS_PARENT_PID` | (없음) | 이 PID의 프로세스가 사라지면 서버도 종료합니다. 호스트가 자동으로 지정합니다 |
| `HANDSTACK_DOCS_INDEX` | `https://handstack.kr/agent/docs-index.json` | 인덱스 주소 또는 파일 경로 |

### 4. 앞단에 Nginx Proxy Manager, nginx 등이 있을 때

사이트 도메인을 사이트 호스트로 프록시하고 있다면 `/mcp`도 같은 경로로 전달되므로 MCP를 위한 설정을 따로 추가할 필요가 없습니다. `/`가 다른 곳을 가리킬 때만 `/mcp`를 **사이트 호스트의 포트**로 전달하는 location을 추가하세요. MCP 서버 자체의 포트는 `127.0.0.1`에만 열려 있어 앞단이 접근할 수 없습니다. 응답이 JSON 하나이므로 Websockets나 스트리밍 설정은 필요 없습니다.

클라이언트(사용자)별로 요청을 제한하려면 사이트 호스트에 알려 줘야 합니다. 그렇지 않으면 호스트가 보는 접속 IP가 앞단의 IP 하나뿐이라 **모든 사용자가 분당 요청 한도를 함께 씁니다.**

1. 앞단이 `X-Forwarded-For`에 클라이언트 IP를 담아 보내게 합니다. Nginx Proxy Manager와 nginx의 기본 설정(`proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`)이면 충분합니다. 이 방식은 클라이언트가 보낸 값 **뒤에** 실제 접속 IP를 덧붙이므로 마지막 값이 항상 신뢰할 수 있는 값입니다.
2. 사이트 호스트에 `HANDSTACK_MCP_TRUST_FORWARDED_FOR=true`를 지정합니다. 앞단 프록시가 둘 이상이면(예: CDN → NPM) `HANDSTACK_MCP_FORWARDED_HOPS=2`처럼 그 수를 함께 지정합니다.

호스트는 `X-Forwarded-For`를 오른쪽에서 신뢰하는 단수만큼 센 값을 클라이언트 IP로 보고, IP 형식이 아니거나 항목이 부족하면 접속 IP를 씁니다. 왼쪽 값은 클라이언트가 위조할 수 있어서 쓰지 않습니다. MCP 서버에는 이렇게 판정한 IP 하나만 전달합니다.

```nginx
location /mcp {
    proxy_pass http://사이트호스트:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_read_timeout 30s;
}
```

[외부 서버 모드](#2-외부-서버-모드)로 MCP 서버 앞에 nginx를 바로 둘 때도 같은 헤더 설정을 쓰고 서버에 `HANDSTACK_DOCS_TRUST_PROXY=true`를 지정합니다. 이때 서버는 `X-Forwarded-For`의 마지막 값을 클라이언트 IP로 씁니다.

### 보안 고려 사항

- 도구는 모두 읽기 전용이고 공개 문서만 다룹니다. 인증은 없습니다.
- 남용 방지: IP별 요청 제한, 본문 64KB 제한, 요청 30초 제한, `Origin`·`Host` 검사.
- 서버는 세션을 저장하지 않으므로 메모리가 요청 수에 따라 늘어나지 않습니다. 요청 제한 기록만 메모리에 두며 주기적으로 정리됩니다.
- MCP 서버 포트를 인터넷에 직접 열지 마세요. 호스트가 실행하는 서버는 `127.0.0.1`에만 바인딩됩니다.
- 인덱스 형식(`schema`)을 바꾸면 서버와 플러그인을 함께 올리세요.
