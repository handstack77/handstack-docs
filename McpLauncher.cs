using System.ComponentModel;
using System.Diagnostics;
using System.Net;
using System.Net.Sockets;

namespace handstack_docs
{
    // McpProxy 가 요청을 넘길 MCP 서버 주소입니다. 서버가 뜨기 전이나 재시작 중에는 null 입니다.
    public class McpUpstream
    {
        private volatile Uri? address;

        public McpUpstream(Uri? address = null)
        {
            this.address = address;
        }

        public Uri? Address
        {
            get { return address; }
            set { address = value; }
        }
    }

    public enum McpMode
    {
        // /mcp 를 열지 않습니다.
        Disabled,
        // HANDSTACK_MCP_UPSTREAM 에 지정된 이미 실행 중인 서버로 프록시만 합니다.
        External,
        // 사이트 호스트가 mcp/ 폴더의 Node 서버를 직접 실행하고 감시합니다.
        Managed
    }

    // 환경 변수와 배포 폴더를 보고 MCP 서버를 어떻게 제공할지 정합니다.
    //   HANDSTACK_MCP_ENABLED=false   MCP 기능을 끕니다.
    //   HANDSTACK_MCP_UPSTREAM        이미 실행 중인 서버 주소. 지정하면 External 모드입니다.
    //   HANDSTACK_MCP_DIR             mcp 폴더 위치 (기본: 실행 폴더의 mcp)
    //   HANDSTACK_NODE                node 실행 파일 경로 (기본: PATH 에서 검색)
    public class McpLaunch
    {
        private const string ScriptRelativePath = "bin/serve.mjs";

        public McpMode Mode { get; private set; } = McpMode.Disabled;
        public string Message { get; private set; } = "";
        public Uri? ExternalAddress { get; private set; }
        public string NodePath { get; private set; } = "";
        public string McpDirectory { get; private set; } = "";
        public string ScriptPath { get; private set; } = "";

        public static McpLaunch Resolve(string baseDirectory)
        {
            var launch = new McpLaunch();

            if (string.Equals(Environment.GetEnvironmentVariable("HANDSTACK_MCP_ENABLED"), "false", StringComparison.OrdinalIgnoreCase) == true)
            {
                launch.Message = "HANDSTACK_MCP_ENABLED=false 이므로 /mcp 를 열지 않습니다.";
                return launch;
            }

            string? external = Environment.GetEnvironmentVariable("HANDSTACK_MCP_UPSTREAM");
            if (string.IsNullOrWhiteSpace(external) == false)
            {
                if (Uri.TryCreate(external, UriKind.Absolute, out var externalUri) == true)
                {
                    launch.Mode = McpMode.External;
                    launch.ExternalAddress = externalUri;
                    launch.Message = $"/mcp -> {externalUri} (실행 중인 서버로 프록시)";
                }
                else
                {
                    launch.Message = $"HANDSTACK_MCP_UPSTREAM 값이 올바른 주소가 아닙니다: {external}";
                }
                return launch;
            }

            string mcpDirectory = Environment.GetEnvironmentVariable("HANDSTACK_MCP_DIR") ?? Path.Combine(baseDirectory, "mcp");
            string scriptPath = Path.Combine(mcpDirectory, ScriptRelativePath);
            if (File.Exists(scriptPath) == false)
            {
                launch.Message = $"{mcpDirectory} 에 MCP 서버가 없어 /mcp 를 열지 않습니다.";
                return launch;
            }

            if (Directory.Exists(Path.Combine(mcpDirectory, "node_modules", "@modelcontextprotocol")) == false)
            {
                launch.Message = $"{mcpDirectory} 에 node_modules 가 없습니다. 'npm ci --omit=dev' 를 실행하세요. /mcp 를 열지 않습니다.";
                return launch;
            }

            string? nodePath = FindNode();
            if (nodePath == null)
            {
                launch.Message = "node 실행 파일을 찾을 수 없어 /mcp 를 열지 않습니다. Node.js 18 이상을 설치하거나 HANDSTACK_NODE 를 지정하세요.";
                return launch;
            }

            launch.Mode = McpMode.Managed;
            launch.McpDirectory = mcpDirectory;
            launch.ScriptPath = scriptPath;
            launch.NodePath = nodePath;
            launch.Message = $"/mcp -> {scriptPath} (호스트가 직접 실행: {nodePath})";
            return launch;
        }

        private static string? FindNode()
        {
            string? configured = Environment.GetEnvironmentVariable("HANDSTACK_NODE");
            if (string.IsNullOrWhiteSpace(configured) == false)
            {
                return File.Exists(configured) == true ? configured : null;
            }

            string fileName = OperatingSystem.IsWindows() == true ? "node.exe" : "node";
            foreach (var directory in (Environment.GetEnvironmentVariable("PATH") ?? "").Split(Path.PathSeparator, StringSplitOptions.RemoveEmptyEntries))
            {
                try
                {
                    string candidate = Path.Combine(directory.Trim('"'), fileName);
                    if (File.Exists(candidate) == true)
                    {
                        return candidate;
                    }
                }
                catch (ArgumentException)
                {
                    // PATH 에 잘못된 문자가 섞인 항목은 건너뜁니다.
                }
            }
            return null;
        }
    }

    // mcp/bin/serve.mjs 를 자식 프로세스로 실행하고, 죽으면 다시 띄우며, 호스트가 종료될 때 함께 끕니다.
    public class McpServerService : BackgroundService
    {
        private static readonly HttpClient healthClient = new HttpClient
        {
            Timeout = TimeSpan.FromSeconds(2)
        };

        private readonly McpLaunch launch;
        private readonly McpUpstream upstream;
        private readonly string baseDirectory;

        public McpServerService(McpLaunch launch, McpUpstream upstream)
        {
            this.launch = launch;
            this.upstream = upstream;
            baseDirectory = AppContext.BaseDirectory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            int failures = 0;

            while (stoppingToken.IsCancellationRequested == false)
            {
                var startedAt = DateTime.UtcNow;
                try
                {
                    await RunOnceAsync(stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Win32Exception exception)
                {
                    // 실행 파일 자체를 시작할 수 없으면 재시도해도 같으므로 포기합니다.
                    Console.WriteLine($"[mcp] node 를 실행할 수 없어 중단합니다: {exception.Message}");
                    return;
                }
                catch (Exception exception)
                {
                    Console.WriteLine($"[mcp] 서버 실행 중 오류: {exception.Message}");
                }

                upstream.Address = null;

                // 1분 넘게 살아 있었다면 일시적인 종료로 보고 대기 시간을 초기화합니다.
                failures = DateTime.UtcNow - startedAt > TimeSpan.FromMinutes(1) ? 1 : failures + 1;
                int delaySeconds = Math.Min(30, 1 << Math.Min(failures, 5));
                Console.WriteLine($"[mcp] 서버가 종료되었습니다. {delaySeconds}초 후 다시 시작합니다.");

                try
                {
                    await Task.Delay(TimeSpan.FromSeconds(delaySeconds), stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
            }
        }

        private async Task RunOnceAsync(CancellationToken stoppingToken)
        {
            int port = FindFreePort();

            var startInfo = new ProcessStartInfo
            {
                FileName = launch.NodePath,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                // Node 는 UTF-8 로 출력하므로 기본 코드 페이지(Windows 에서는 CP949)로 읽으면 한글이 깨집니다.
                StandardOutputEncoding = System.Text.Encoding.UTF8,
                StandardErrorEncoding = System.Text.Encoding.UTF8,
                CreateNoWindow = true,
                WorkingDirectory = launch.McpDirectory
            };
            startInfo.ArgumentList.Add(launch.ScriptPath);
            startInfo.ArgumentList.Add("--host");
            startInfo.ArgumentList.Add("127.0.0.1");
            startInfo.ArgumentList.Add("--port");
            startInfo.ArgumentList.Add(port.ToString());

            // 사이트 호스트가 X-Forwarded-For 에 실제 접속 IP를 담아 보내므로, 요청 제한이 IP별로 동작하게 신뢰합니다.
            // 서버는 127.0.0.1 에만 바인딩되어 사이트 호스트 외에는 접근할 수 없습니다.
            startInfo.Environment["HANDSTACK_DOCS_TRUST_PROXY"] = "true";
            startInfo.Environment["HANDSTACK_DOCS_PARENT_PID"] = Environment.ProcessId.ToString();

            // 사이트가 서빙하는 인덱스 파일을 직접 읽습니다. 새 배포로 파일이 바뀌면 서버가 주기적으로 다시 읽습니다.
            string localIndex = Path.Combine(baseDirectory, "wwwroot", "agent", "docs-index.json");
            if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("HANDSTACK_DOCS_INDEX")) == true && File.Exists(localIndex) == true)
            {
                startInfo.Environment["HANDSTACK_DOCS_INDEX"] = localIndex;
            }

            using var process = new Process { StartInfo = startInfo };
            process.OutputDataReceived += (sender, e) =>
            {
                if (string.IsNullOrEmpty(e.Data) == false)
                {
                    Console.WriteLine($"[mcp] {e.Data}");
                }
            };
            process.ErrorDataReceived += (sender, e) =>
            {
                if (string.IsNullOrEmpty(e.Data) == false)
                {
                    Console.WriteLine($"[mcp] {e.Data}");
                }
            };

            process.Start();
            process.BeginOutputReadLine();
            process.BeginErrorReadLine();

            try
            {
                var address = new Uri($"http://127.0.0.1:{port}/");
                if (await WaitUntilReadyAsync(address, process, stoppingToken) == true)
                {
                    upstream.Address = address;
                    Console.WriteLine($"[mcp] 서버가 준비되었습니다: {address}mcp");
                }

                await process.WaitForExitAsync(stoppingToken);
            }
            finally
            {
                upstream.Address = null;
                if (process.HasExited == false)
                {
                    try
                    {
                        process.Kill(entireProcessTree: true);
                        await process.WaitForExitAsync(CancellationToken.None);
                    }
                    catch (InvalidOperationException)
                    {
                        // 이미 종료된 경우입니다.
                    }
                }
            }
        }

        // /healthz 가 응답할 때까지 기다립니다. 프로세스가 먼저 죽으면 false 를 돌려줍니다.
        private static async Task<bool> WaitUntilReadyAsync(Uri address, Process process, CancellationToken stoppingToken)
        {
            var deadline = DateTime.UtcNow.AddSeconds(30);
            while (DateTime.UtcNow < deadline && process.HasExited == false)
            {
                try
                {
                    using var response = await healthClient.GetAsync(new Uri(address, "healthz"), stoppingToken);
                    if (response.IsSuccessStatusCode == true)
                    {
                        return true;
                    }
                }
                catch (HttpRequestException)
                {
                    // 아직 포트를 열지 않았습니다.
                }
                catch (TaskCanceledException) when (stoppingToken.IsCancellationRequested == false)
                {
                    // 응답이 늦은 경우입니다.
                }

                await Task.Delay(300, stoppingToken);
            }
            return false;
        }

        private static int FindFreePort()
        {
            var listener = new TcpListener(IPAddress.Loopback, 0);
            listener.Start();
            try
            {
                return ((IPEndPoint)listener.LocalEndpoint).Port;
            }
            finally
            {
                listener.Stop();
            }
        }
    }
}
