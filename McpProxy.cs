using System.Text.Json;
using Microsoft.AspNetCore.Http.Features;

namespace handstack_docs
{
    // 원격 MCP 서버(mcp/ 폴더의 Node 서버)를 사이트 주소의 /mcp 로 노출하는 프록시입니다.
    // MCP 서버는 상태를 유지하지 않는 JSON 응답만 쓰므로 SSE 스트림을 중계할 필요가 없습니다.
    public static class McpProxy
    {
        private const string RoutePath = "/mcp";
        private const long MaxRequestBodySize = 64 * 1024;

        private static readonly HttpClient httpClient = new HttpClient
        {
            Timeout = TimeSpan.FromSeconds(30)
        };

        private static readonly string[] forwardRequestHeaders =
        {
            "Accept", "Content-Type", "Origin", "Mcp-Protocol-Version", "Mcp-Session-Id"
        };

        private static readonly string[] forwardResponseHeaders =
        {
            "Content-Type", "Allow", "Retry-After", "Cache-Control", "Vary",
            "Access-Control-Allow-Origin", "Access-Control-Allow-Methods", "Access-Control-Allow-Headers", "Access-Control-Max-Age"
        };

        // 요청 제한의 기준이 되는 클라이언트 IP는 McpClientAddress 가 정합니다.
        //   forwardedMode  Auto(기본)는 호스트에 직접 접속한 상대가 신뢰 대역일 때만 X-Forwarded-For 를 믿습니다.
        //   forwardedHops  호스트 앞에 있는 신뢰하는 프록시(NPM, nginx, CDN 등)의 수입니다.
        // MCP 서버에는 판정한 클라이언트 IP 하나만 X-Forwarded-For 로 전달합니다.
        public static void Map(WebApplication app, McpUpstream upstream, McpForwardedMode forwardedMode, int forwardedHops, McpTrustedNetworks trustedNetworks)
        {
            app.Map(RoutePath, async (HttpContext context) =>
            {
                // 관리형 모드에서는 MCP 서버가 뜨는 동안(또는 재시작 중) 주소가 없습니다.
                var upstreamAddress = upstream.Address;
                if (upstreamAddress == null)
                {
                    await WriteError(context, StatusCodes.Status503ServiceUnavailable, "MCP 서버를 준비하는 중입니다. 잠시 후 다시 시도하세요.");
                    return;
                }

                var upstreamUri = new Uri(upstreamAddress, RoutePath);

                if (context.Request.ContentLength > MaxRequestBodySize)
                {
                    await WriteError(context, StatusCodes.Status413PayloadTooLarge, "요청 본문이 너무 큽니다.");
                    return;
                }

                var maxBodySize = context.Features.Get<IHttpMaxRequestBodySizeFeature>();
                if (maxBodySize != null && maxBodySize.IsReadOnly == false)
                {
                    maxBodySize.MaxRequestBodySize = MaxRequestBodySize;
                }

                using var request = new HttpRequestMessage(new HttpMethod(context.Request.Method), upstreamUri);
                if (context.Request.ContentLength > 0 || context.Request.Headers.ContainsKey("Transfer-Encoding") == true)
                {
                    request.Content = new StreamContent(context.Request.Body);
                }

                foreach (var name in forwardRequestHeaders)
                {
                    if (context.Request.Headers.TryGetValue(name, out var values) == true)
                    {
                        if (request.Headers.TryAddWithoutValidation(name, values.ToArray()) == false)
                        {
                            request.Content?.Headers.TryAddWithoutValidation(name, values.ToArray());
                        }
                    }
                }

                string? forwardedFor = context.Request.Headers.TryGetValue("X-Forwarded-For", out var forwardedHeader) == true ? string.Join(",", forwardedHeader.ToArray()) : null;
                request.Headers.TryAddWithoutValidation("X-Forwarded-For", McpClientAddress.Resolve(context.Connection.RemoteIpAddress, forwardedFor, forwardedMode, forwardedHops, trustedNetworks));

                try
                {
                    using var response = await httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, context.RequestAborted);
                    context.Response.StatusCode = (int)response.StatusCode;

                    foreach (var name in forwardResponseHeaders)
                    {
                        if (response.Headers.TryGetValues(name, out var values) == true || response.Content.Headers.TryGetValues(name, out values) == true)
                        {
                            context.Response.Headers[name] = values.ToArray();
                        }
                    }

                    await response.Content.CopyToAsync(context.Response.Body, context.RequestAborted);
                }
                catch (Exception exception) when (exception is HttpRequestException || exception is TaskCanceledException)
                {
                    if (context.RequestAborted.IsCancellationRequested == true || context.Response.HasStarted == true)
                    {
                        return;
                    }

                    // 본문 길이를 미리 알 수 없는 요청(chunked)이 제한을 넘은 경우입니다.
                    if (exception.InnerException is BadHttpRequestException badRequest)
                    {
                        await WriteError(context, badRequest.StatusCode, "요청 본문이 너무 큽니다.");
                        return;
                    }

                    // 업스트림이 꺼져 있거나 응답이 늦은 경우입니다.
                    await WriteError(context, exception is TaskCanceledException ? StatusCodes.Status504GatewayTimeout : StatusCodes.Status502BadGateway, "MCP 서버에 연결할 수 없습니다.");
                }
            });
        }

        private static async Task WriteError(HttpContext context, int statusCode, string message)
        {
            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/json; charset=utf-8";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                jsonrpc = "2.0",
                error = new { code = -32000, message },
                id = (object?)null
            }));
        }
    }
}
