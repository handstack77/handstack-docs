using System.Collections.Concurrent;
using System.Diagnostics;
using System.Net;
using System.Runtime.InteropServices;
using Microsoft.AspNetCore.StaticFiles;

namespace handstack_docs
{
    public class Program
    {
        public static void Main(string[] args)
        {
            int port = 8080;
            if (args.Length > 0)
            {
                try
                {
                    port = int.Parse(args[0]);
                }
                catch
                {
                    Console.WriteLine($"매개변수 port 확인 필요");
                }
            }

            var builder = WebApplication.CreateBuilder(args);
            builder.WebHost.UseKestrel(options =>
            {
                options.Listen(IPAddress.Any, port);
            });

            // MarpService를 싱글톤으로 등록
            builder.Services.AddSingleton<MarpService>();
            builder.Services.AddHostedService<MarpBackgroundService>();

            // MCP 서버: 배포 폴더에 mcp/ 가 있으면 호스트가 직접 실행합니다.
            var mcpLaunch = McpLaunch.Resolve(AppContext.BaseDirectory);
            var mcpUpstream = new McpUpstream(mcpLaunch.ExternalAddress);
            if (mcpLaunch.Mode == McpMode.Managed)
            {
                builder.Services.AddSingleton(mcpLaunch);
                builder.Services.AddSingleton(mcpUpstream);
                builder.Services.AddHostedService<McpServerService>();
            }

            var app = builder.Build();

            string buildPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "wwwroot");
            if (Directory.Exists(buildPath) == true)
            {
                app.UseDefaultFiles(new DefaultFilesOptions
                {
                    DefaultFileNames = new List<string> { "index.html" }
                });

                // 설치 스크립트는 기본 MIME 매핑에 없으므로 다운로드 파일로 제공합니다.
                var contentTypeProvider = new FileExtensionContentTypeProvider();
                contentTypeProvider.Mappings[".ps1"] = "application/octet-stream";
                contentTypeProvider.Mappings[".sh"] = "application/octet-stream";
                app.UseStaticFiles(new StaticFileOptions
                {
                    ContentTypeProvider = contentTypeProvider
                });
            }
            else
            {
                Console.WriteLine($"buildPath: {buildPath} 확인 필요");
            }

            // /mcp 는 MCP 서버(mcp/ 폴더의 Node 서버)로 프록시합니다.
            Console.WriteLine($"MCP: {mcpLaunch.Message}");
            if (mcpLaunch.Mode != McpMode.Disabled)
            {
                // 요청 제한의 기준이 되는 클라이언트 IP: 설정이 없으면(Auto) 호스트에 직접 접속한 상대가
                // 루프백·사설망·이 호스트와 같은 서브넷일 때만 앞단 프록시(NPM, nginx 등)의 X-Forwarded-For 를 믿습니다.
                //   HANDSTACK_MCP_TRUST_FORWARDED_FOR  true 항상 믿음 / false 믿지 않음 / (없음) 자동
                //   HANDSTACK_MCP_FORWARDED_HOPS       신뢰하는 프록시 수. CDN + NPM 처럼 둘이면 2 (기본 1)
                //   HANDSTACK_MCP_TRUSTED_PROXIES      자동 판단에 추가로 신뢰할 IP/CIDR (쉼표 구분)
                string? trustSetting = Environment.GetEnvironmentVariable("HANDSTACK_MCP_TRUST_FORWARDED_FOR");
                McpForwardedMode forwardedMode = McpForwardedMode.Auto;
                if (string.Equals(trustSetting, "true", StringComparison.OrdinalIgnoreCase) == true)
                {
                    forwardedMode = McpForwardedMode.Always;
                }
                else if (string.Equals(trustSetting, "false", StringComparison.OrdinalIgnoreCase) == true)
                {
                    forwardedMode = McpForwardedMode.Never;
                }

                int forwardedHops = int.TryParse(Environment.GetEnvironmentVariable("HANDSTACK_MCP_FORWARDED_HOPS"), out var hops) == true && hops > 0 ? hops : 1;
                var trustedNetworks = new McpTrustedNetworks((Environment.GetEnvironmentVariable("HANDSTACK_MCP_TRUSTED_PROXIES") ?? "").Split(',', StringSplitOptions.RemoveEmptyEntries));
                foreach (var invalid in trustedNetworks.InvalidEntries)
                {
                    Console.WriteLine($"HANDSTACK_MCP_TRUSTED_PROXIES 의 항목을 무시합니다(IP 또는 CIDR 형식이 아님): {invalid}");
                }

                string forwardedDescription = forwardedMode switch
                {
                    McpForwardedMode.Always => "X-Forwarded-For 를 항상 신뢰",
                    McpForwardedMode.Never => "X-Forwarded-For 를 신뢰하지 않음(접속 IP 사용)",
                    _ => $"자동 - 접속한 상대가 {trustedNetworks.Describe()}에 있을 때만 X-Forwarded-For 신뢰"
                };
                Console.WriteLine($"MCP: 클라이언트 IP 판정: {forwardedDescription}, 프록시 단수 {forwardedHops}");

                McpProxy.Map(app, mcpUpstream, forwardedMode, forwardedHops, trustedNetworks);
            }

            app.Run();
        }
    }

    public class MarpService
    {
        private readonly string slidesDir;
        private readonly ConcurrentDictionary<string, DateTime> processingFiles;
        private string? marpCommand;
        private FileSystemWatcher? watcher;

        public MarpService()
        {
            slidesDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "wwwroot", "slides");
            processingFiles = new ConcurrentDictionary<string, DateTime>();
        }

        // Marp 명령어 경로 찾기
        public async Task<string> FindMarpCommandAsync()
        {
            if (!string.IsNullOrEmpty(marpCommand))
            {
                return marpCommand;
            }

            string marpCmdName = RuntimeInformation.IsOSPlatform(OSPlatform.Windows) == true ? "%APPDATA%/npm/marp.cmd" : "/usr/bin/marp";
            marpCmdName = Environment.ExpandEnvironmentVariables(marpCmdName).Replace("\\", "/");

            try
            {
                var startInfo = new ProcessStartInfo
                {
                    FileName = marpCmdName,
                    Arguments = "--version",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true
                };

                using var process = new Process { StartInfo = startInfo };
                process.Start();

                var output = await process.StandardOutput.ReadToEndAsync();
                var error = await process.StandardError.ReadToEndAsync();

                await process.WaitForExitAsync();

                if (process.ExitCode == 0 && (output.Contains("marp") || error.Contains("marp")))
                {
                    marpCommand = marpCmdName;
                    Console.WriteLine($"Marp 명령어 발견: {marpCmdName}");
                    return marpCmdName;
                }
                else
                {
                    throw new InvalidOperationException($"'{marpCmdName}' 명령어가 올바른 Marp CLI가 아니거나 실행에 실패했습니다. (종료 코드: {process.ExitCode})");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Marp 명령어 확인 중 오류 발생: {ex.Message}");
                throw new InvalidOperationException("Marp 명령어를 찾을 수 없습니다. @marp-team/marp-cli가 전역으로 설치되어 있는지 확인하세요.", ex);
            }
        }

        // 디렉토리 존재 확인 및 생성
        public void EnsureDirectoryExists()
        {
            if (!Directory.Exists(slidesDir))
            {
                Console.WriteLine($"디렉토리가 존재하지 않습니다: {slidesDir}");
                Console.WriteLine("디렉토리를 생성합니다...");
                Directory.CreateDirectory(slidesDir);
            }
            Console.WriteLine($"모니터링 디렉토리: {slidesDir}");
        }

        // Marp 명령어 실행
        public async Task<string> ExecuteMarpAsync(string mdFilePath)
        {
            try
            {
                var fileName = Path.GetFileNameWithoutExtension(mdFilePath);
                var htmlFilePath = Path.Combine(Path.GetDirectoryName(mdFilePath)!, $"{fileName}.html");

                Console.WriteLine($"Marp 실행 중: {mdFilePath}");

                var marpCmd = await FindMarpCommandAsync();

                var startInfo = new ProcessStartInfo
                {
                    FileName = marpCmd,
                    Arguments = $"\"{mdFilePath}\" -o \"{htmlFilePath}\" --no-stdin",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true,
                    WorkingDirectory = Path.GetDirectoryName(mdFilePath)
                };

                using var process = new Process { StartInfo = startInfo };

                var outputBuilder = new System.Text.StringBuilder();
                var errorBuilder = new System.Text.StringBuilder();

                process.OutputDataReceived += (sender, e) =>
                {
                    if (!string.IsNullOrEmpty(e.Data))
                    {
                        outputBuilder.AppendLine(e.Data);
                        Console.WriteLine($"DEBUG: {e.Data}");
                    }
                };

                process.ErrorDataReceived += (sender, e) =>
                {
                    if (!string.IsNullOrEmpty(e.Data))
                    {
                        errorBuilder.AppendLine(e.Data);
                        Console.WriteLine($"DEBUG: {e.Data}");
                    }
                };

                process.Start();
                process.BeginOutputReadLine();
                process.BeginErrorReadLine();

                await process.WaitForExitAsync();

                if (process.ExitCode == 0)
                {
                    Console.WriteLine($"HTML 생성 완료: {htmlFilePath}");
                    var output = outputBuilder.ToString().Trim();
                    if (!string.IsNullOrEmpty(output))
                    {
                        Console.WriteLine($"최종 출력: {output}");
                    }
                    return htmlFilePath;
                }
                else
                {
                    var error = errorBuilder.ToString().Trim();
                    Console.WriteLine($"Marp 실행 실패 (코드: {process.ExitCode}): {mdFilePath}");
                    if (!string.IsNullOrEmpty(error))
                    {
                        Console.WriteLine($"최종 오류: {error}");
                    }
                    throw new InvalidOperationException($"Marp failed with code {process.ExitCode}: {error}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Marp 명령어 실행 준비 실패: {ex.Message}");
                throw;
            }
        }

        // HTML 파일 삭제
        public void DeleteHtmlFile(string mdFilePath)
        {
            var fileName = Path.GetFileNameWithoutExtension(mdFilePath);
            var htmlFilePath = Path.Combine(Path.GetDirectoryName(mdFilePath)!, $"{fileName}.html");

            if (File.Exists(htmlFilePath))
            {
                try
                {
                    File.Delete(htmlFilePath);
                    Console.WriteLine($"HTML 파일 삭제 완료: {htmlFilePath}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"HTML 파일 삭제 실패: {htmlFilePath} - {ex.Message}");
                }
            }
            else
            {
                Console.WriteLine($"삭제할 HTML 파일이 없습니다: {htmlFilePath}");
            }
        }

        // 파일 변경 처리
        public async Task HandleFileChangeAsync(string filePath, string eventType)
        {
            // 마크다운 파일만 처리
            if (!filePath.EndsWith(".md"))
            {
                return;
            }

            // 중복 처리 방지
            var now = DateTime.Now;
            if (processingFiles.TryGetValue(filePath, out var lastProcessTime))
            {
                if ((now - lastProcessTime).TotalMilliseconds < 500)
                {
                    Console.WriteLine($"이미 처리 중인 파일: {filePath}");
                    return;
                }
            }

            processingFiles[filePath] = now;

            try
            {
                var relativePath = Path.GetRelativePath(slidesDir, filePath);
                Console.WriteLine($"\n파일 {eventType}: {relativePath}");
                Console.WriteLine($"시간: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");

                switch (eventType.ToLower())
                {
                    case "deleted":
                        DeleteHtmlFile(filePath);
                        break;
                    case "created":
                    case "changed":
                        await ExecuteMarpAsync(filePath);
                        break;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"파일 처리 중 오류 발생: {filePath} - {ex.Message}");
            }
            finally
            {
                // 일정 시간 후 처리 목록에서 제거
                _ = Task.Delay(500).ContinueWith(_ => processingFiles.TryRemove(filePath, out DateTime _));
            }
        }

        // 기존 HTML 파일 생성
        public async Task ProcessExistingFilesAsync()
        {
            Console.WriteLine("\n기존 마크다운 파일 검색 중...");

            try
            {
                var mdFiles = Directory.GetFiles(slidesDir, "*.md", SearchOption.AllDirectories);

                if (mdFiles.Length == 0)
                {
                    Console.WriteLine("기존 마크다운 파일이 없습니다.");
                    return;
                }

                Console.WriteLine($"발견된 마크다운 파일: {mdFiles.Length}개");

                foreach (var filePath in mdFiles)
                {
                    try
                    {
                        await ExecuteMarpAsync(filePath);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"기존 파일 처리 실패: {Path.GetFileName(filePath)} - {ex.Message}");
                    }
                }

                Console.WriteLine("기존 파일 처리 완료\n");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"기존 파일 검색 중 오류: {ex.Message}");
            }
        }

        // 파일 감시 시작
        public async Task StartWatchingAsync()
        {
            Console.WriteLine("Marp 파일 감시 서버 시작...\n");

            try
            {
                await FindMarpCommandAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Marp 설치 확인 실패: {ex.Message}");
                Console.WriteLine("\n해결 방법:");
                Console.WriteLine("Marp CLI를 전역으로 설치하세요: npm install -g @marp-team/marp-cli");
                return;
            }

            EnsureDirectoryExists();
            await ProcessExistingFilesAsync();

            Console.WriteLine("파일 감시 시작...");
            Console.WriteLine($"감시 디렉토리: {Path.GetFullPath(slidesDir)}");
            Console.WriteLine("대상 파일: *.md");
            Console.WriteLine("Marp 파일 감시가 활성화되었습니다.\n");

            watcher = new FileSystemWatcher(slidesDir, "*.md")
            {
                IncludeSubdirectories = true,
                EnableRaisingEvents = true,
                NotifyFilter = NotifyFilters.CreationTime | NotifyFilters.LastWrite | NotifyFilters.FileName
            };

            watcher.Created += async (sender, e) => await HandleFileChangeAsync(e.FullPath, "created");
            watcher.Changed += async (sender, e) => await HandleFileChangeAsync(e.FullPath, "changed");
            watcher.Deleted += async (sender, e) => await HandleFileChangeAsync(e.FullPath, "deleted");
            watcher.Error += (sender, e) => Console.WriteLine($"파일 감시 오류: {e.GetException().Message}");
        }

        // 파일 감시 중지
        public void StopWatching()
        {
            watcher?.Dispose();
            Console.WriteLine("파일 감시 중지");
        }
    }

    public class MarpBackgroundService : BackgroundService
    {
        private readonly MarpService marpService;

        public MarpBackgroundService(MarpService marpService)
        {
            this.marpService = marpService;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await marpService.StartWatchingAsync();

            // 서비스가 중지될 때까지 대기
            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(1000, stoppingToken);
            }

            marpService.StopWatching();
        }
    }
}
