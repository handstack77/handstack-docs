using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Text.RegularExpressions;

namespace handstack_docs
{
    // X-Forwarded-For 를 어떻게 다룰지 정합니다.
    public enum McpForwardedMode
    {
        // 사이트 호스트에 직접 접속한 상대가 신뢰 대역(McpTrustedNetworks)일 때만 헤더를 믿습니다. (기본)
        Auto,
        // 항상 헤더를 믿습니다. 호스트가 인터넷에 직접 노출되어 있지 않을 때만 쓰세요.
        Always,
        // 헤더를 믿지 않고 접속 IP만 씁니다.
        Never
    }

    // 앞단 프록시(NPM, nginx 등)가 있을 수 있는 네트워크 대역입니다.
    // 루프백·사설망·링크 로컬과 이 호스트의 네트워크 카드가 속한 서브넷, 그리고 추가로 지정한 대역을 포함합니다.
    public class McpTrustedNetworks
    {
        private static readonly string[] defaultNetworks =
        {
            "127.0.0.0/8", "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "169.254.0.0/16",
            "::1/128", "fc00::/7", "fe80::/10"
        };

        // 네트워크 카드의 서브넷이 너무 넓으면(잘못된 설정 등) 신뢰 범위가 커지므로 이보다 짧은 접두사는 무시합니다.
        private const int MinLocalPrefixLengthV4 = 16;
        private const int MinLocalPrefixLengthV6 = 48;

        private static readonly TimeSpan localRefreshInterval = TimeSpan.FromMinutes(10);

        private readonly List<(byte[] Network, int PrefixLength)> fixedNetworks = new List<(byte[], int)>();
        private readonly Func<IEnumerable<string>> localNetworkProvider;
        private readonly object syncRoot = new object();
        private List<(byte[] Network, int PrefixLength)> localNetworks = new List<(byte[], int)>();
        private DateTime localLoadedAt = DateTime.MinValue;

        // extraNetworks: HANDSTACK_MCP_TRUSTED_PROXIES 처럼 추가로 신뢰할 IP 또는 CIDR 목록
        // localNetworksOverride: 테스트용. 지정하면 실제 네트워크 카드 대신 이 목록을 "이 호스트의 서브넷"으로 씁니다.
        public McpTrustedNetworks(IEnumerable<string>? extraNetworks = null, IEnumerable<string>? localNetworksOverride = null)
        {
            localNetworkProvider = localNetworksOverride != null ? () => localNetworksOverride : ReadLocalInterfaceNetworks;

            foreach (var cidr in defaultNetworks)
            {
                TryAdd(fixedNetworks, cidr, out _);
            }

            foreach (var cidr in extraNetworks ?? Enumerable.Empty<string>())
            {
                if (string.IsNullOrWhiteSpace(cidr) == true)
                {
                    continue;
                }

                if (TryAdd(fixedNetworks, cidr.Trim(), out _) == false)
                {
                    InvalidEntries.Add(cidr.Trim());
                }
            }
        }

        // 해석하지 못해 무시한 추가 대역 항목입니다.
        public List<string> InvalidEntries { get; } = new List<string>();

        public bool Contains(IPAddress address)
        {
            address = Normalize(address);

            foreach (var network in fixedNetworks)
            {
                if (IsInside(address, network.Network, network.PrefixLength) == true)
                {
                    return true;
                }
            }

            foreach (var network in GetLocalNetworks())
            {
                if (IsInside(address, network.Network, network.PrefixLength) == true)
                {
                    return true;
                }
            }

            return false;
        }

        // 시작 로그에 보여 줄 요약입니다.
        public string Describe()
        {
            var locals = GetLocalNetworks().Select(network => $"{new IPAddress(network.Network)}/{network.PrefixLength}");
            return $"루프백·사설망, 이 호스트의 서브넷({string.Join(", ", locals)})";
        }

        private List<(byte[] Network, int PrefixLength)> GetLocalNetworks()
        {
            lock (syncRoot)
            {
                if (DateTime.UtcNow - localLoadedAt > localRefreshInterval)
                {
                    var loaded = new List<(byte[], int)>();
                    foreach (var cidr in localNetworkProvider())
                    {
                        TryAdd(loaded, cidr, out _);
                    }
                    localNetworks = loaded;
                    localLoadedAt = DateTime.UtcNow;
                }
                return localNetworks;
            }
        }

        private static IEnumerable<string> ReadLocalInterfaceNetworks()
        {
            var result = new List<string>();
            try
            {
                foreach (var networkInterface in NetworkInterface.GetAllNetworkInterfaces())
                {
                    if (networkInterface.OperationalStatus != OperationalStatus.Up || networkInterface.NetworkInterfaceType == NetworkInterfaceType.Loopback)
                    {
                        continue;
                    }

                    foreach (var unicast in networkInterface.GetIPProperties().UnicastAddresses)
                    {
                        int minimum = unicast.Address.AddressFamily == AddressFamily.InterNetwork ? MinLocalPrefixLengthV4 : MinLocalPrefixLengthV6;
                        if (unicast.PrefixLength >= minimum)
                        {
                            result.Add($"{unicast.Address}/{unicast.PrefixLength}");
                        }
                    }
                }
            }
            catch (NetworkInformationException)
            {
                // 네트워크 정보를 읽지 못하면 기본 대역만 신뢰합니다.
            }
            return result;
        }

        private static bool TryAdd(List<(byte[] Network, int PrefixLength)> target, string cidr, out string? error)
        {
            error = null;
            var parts = cidr.Split('/', 2, StringSplitOptions.TrimEntries);
            if (IPAddress.TryParse(parts[0], out var address) == false)
            {
                error = $"IP 주소 형식이 아닙니다: {cidr}";
                return false;
            }

            address = Normalize(address);
            var bytes = address.GetAddressBytes();
            int maxPrefix = bytes.Length * 8;
            int prefix = maxPrefix;
            if (parts.Length == 2 && (int.TryParse(parts[1], out prefix) == false || prefix < 0 || prefix > maxPrefix))
            {
                error = $"접두사 길이가 올바르지 않습니다: {cidr}";
                return false;
            }

            target.Add((bytes, prefix));
            return true;
        }

        // ::ffff:1.2.3.4 같은 IPv4 매핑 주소는 IPv4 로 바꿔 비교합니다.
        private static IPAddress Normalize(IPAddress address)
        {
            return address.IsIPv4MappedToIPv6 == true ? address.MapToIPv4() : address;
        }

        private static bool IsInside(IPAddress address, byte[] network, int prefixLength)
        {
            var bytes = address.GetAddressBytes();
            if (bytes.Length != network.Length)
            {
                return false;
            }

            int fullBytes = prefixLength / 8;
            for (int i = 0; i < fullBytes; i++)
            {
                if (bytes[i] != network[i])
                {
                    return false;
                }
            }

            int remainingBits = prefixLength % 8;
            if (remainingBits == 0)
            {
                return true;
            }

            int mask = 0xFF << (8 - remainingBits) & 0xFF;
            return (bytes[fullBytes] & mask) == (network[fullBytes] & mask);
        }
    }

    // 앞단 프록시가 보낸 X-Forwarded-* 헤더를 어떻게 쓸지 정합니다. (클라이언트 IP, 공개 주소)
    public static class McpClientAddress
    {
        // 호스트 이름(또는 IPv4)과 [IPv6], 선택적 포트만 허용합니다. 화면에 표시되는 값이므로 그 밖의 문자는 버립니다.
        private static readonly Regex hostPattern = new Regex(
            @"^(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*|\[[0-9A-Fa-f:.]+\])(?::\d{1,5})?$",
            RegexOptions.Compiled);

        // 직접 접속한 상대(peer)가 X-Forwarded-* 헤더를 믿어도 되는 프록시인지 판단합니다.
        public static bool IsTrustedForwarder(IPAddress? peer, McpForwardedMode mode, McpTrustedNetworks networks)
        {
            if (mode == McpForwardedMode.Never || peer == null)
            {
                return false;
            }
            return mode == McpForwardedMode.Always || networks.Contains(peer) == true;
        }

        // 사용자가 실제로 접속한 공개 주소(scheme, host)를 정합니다. MCP 서버의 상태 페이지가 등록 예시 주소를 보여 줄 때 씁니다.
        // 신뢰하는 프록시가 보낸 X-Forwarded-Host / X-Forwarded-Proto 가 있으면 그 값을, 아니면 호스트가 받은 요청의 값을 씁니다.
        // 값이 여러 개(프록시 여러 단)면 가장 가까운 프록시가 덧붙인 마지막 값을 씁니다.
        public static (string Scheme, string Host) ResolvePublicOrigin(string requestScheme, string requestHost, string? forwardedHost, string? forwardedProto, bool trusted)
        {
            string scheme = requestScheme;
            string host = requestHost;
            if (trusted == true)
            {
                string? forwardedHostValue = LastEntry(forwardedHost);
                if (string.IsNullOrEmpty(forwardedHostValue) == false && forwardedHostValue.Length <= 255 && hostPattern.IsMatch(forwardedHostValue) == true)
                {
                    host = forwardedHostValue;
                }

                string? forwardedProtoValue = LastEntry(forwardedProto);
                if (string.Equals(forwardedProtoValue, "http", StringComparison.OrdinalIgnoreCase) == true || string.Equals(forwardedProtoValue, "https", StringComparison.OrdinalIgnoreCase) == true)
                {
                    scheme = forwardedProtoValue!.ToLowerInvariant();
                }
            }
            return (scheme, host);
        }

        private static string? LastEntry(string? value)
        {
            return value?.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).LastOrDefault();
        }

        // peer: 사이트 호스트에 직접 접속한 상대(프록시가 있으면 프록시)
        // forwardedFor: X-Forwarded-For 헤더 값(여러 줄이면 쉼표로 이은 값)
        // hops: 호스트 앞에 있는 신뢰하는 프록시의 수. X-Forwarded-For 를 오른쪽에서 hops 번째 값을 클라이언트로 봅니다.
        //       왼쪽 값은 클라이언트가 위조할 수 있어서 쓰지 않습니다.
        public static string Resolve(IPAddress? peer, string? forwardedFor, McpForwardedMode mode, int hops, McpTrustedNetworks networks)
        {
            string remoteAddress = peer == null ? "unknown" : (peer.IsIPv4MappedToIPv6 == true ? peer.MapToIPv4() : peer).ToString();

            if (string.IsNullOrWhiteSpace(forwardedFor) == true)
            {
                return remoteAddress;
            }

            // 신뢰 대역이 아닌 곳에서 직접 들어온 요청의 헤더는 위조일 수 있으므로 무시합니다.
            if (IsTrustedForwarder(peer, mode, networks) == false)
            {
                return remoteAddress;
            }

            var entries = forwardedFor.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            int index = entries.Length - Math.Max(1, hops);
            if (index < 0)
            {
                // 기대한 만큼의 프록시를 거치지 않은 요청이므로 헤더를 믿지 않습니다.
                return remoteAddress;
            }

            // IP 형식이 아닌 값은 요청 제한 기록을 부풀릴 수 있으므로 버립니다.
            return IPAddress.TryParse(entries[index], out var clientAddress) == true ? clientAddress.ToString() : remoteAddress;
        }
    }
}
