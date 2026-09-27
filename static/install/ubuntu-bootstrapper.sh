#!/usr/bin/env bash

set -Eeuo pipefail

readonly REQUIRED_UBUNTU_VERSION="26.04"
readonly DOTNET_SDK_PACKAGE="dotnet-sdk-10.0"

on_error() {
    local exit_code=$?
    printf '\n설치 실패: %s번째 줄, 종료 코드 %s\n' "${BASH_LINENO[0]}" "$exit_code" >&2
    exit "$exit_code"
}
trap on_error ERR

if [[ ${EUID} -eq 0 ]]; then
    echo "이 스크립트 자체를 root로 실행하지 마세요. 일반 사용자로 실행하면 필요한 단계에서만 sudo를 사용합니다." >&2
    exit 1
fi

if [[ ! -r /etc/os-release ]]; then
    echo "/etc/os-release를 읽을 수 없습니다." >&2
    exit 1
fi

# shellcheck disable=SC1091
source /etc/os-release
if [[ ${ID:-} != "ubuntu" || ${VERSION_ID:-} != "$REQUIRED_UBUNTU_VERSION" ]]; then
    echo "Ubuntu ${REQUIRED_UBUNTU_VERSION} 전용 스크립트입니다. 현재 환경: ${PRETTY_NAME:-알 수 없음}" >&2
    exit 1
fi

architecture="$(dpkg --print-architecture)"
if [[ $architecture != "amd64" ]]; then
    echo "이 문서는 linux-x64/amd64를 대상으로 합니다. 현재 아키텍처: $architecture" >&2
    exit 1
fi

sudo_apt() {
    sudo env DEBIAN_FRONTEND=noninteractive apt-get "$@"
}

has_dotnet_10_ga() {
    command -v dotnet >/dev/null 2>&1 || return 1
    dotnet --list-sdks 2>/dev/null | awk '
        $1 ~ /^10[.]0[.][0-9]+$/ { found = 1 }
        END { exit(found ? 0 : 1) }
    '
}

echo "=== HandStack 개발 환경 설치: Ubuntu 26.04 ==="
echo "[1/8] 사전 조건 확인 및 기본 패키지 설치"
sudo -v
sudo_apt update
sudo_apt install -y ca-certificates curl gnupg apt-transport-https

temporary_directory="$(mktemp -d)"
cleanup() {
    rm -rf -- "$temporary_directory"
}
trap cleanup EXIT

echo "[2/8] .NET SDK 10 GA 확인 및 설치"
if has_dotnet_10_ga; then
    echo "  .NET SDK 10 GA가 이미 설치되어 있어 건너뜁니다."
else
    sudo_apt install -y "$DOTNET_SDK_PACKAGE"
fi

# PowerShell과 LibMan 같은 dotnet 전역 도구는 현재 사용자의 ~/.dotnet/tools에 설치된다.
dotnet_tools_directory="$HOME/.dotnet/tools"
export PATH="$PATH:$dotnet_tools_directory"
profile_line='export PATH="$PATH:$HOME/.dotnet/tools"'
touch "$HOME/.profile"
if ! grep -Fqx "$profile_line" "$HOME/.profile"; then
    printf '\n%s\n' "$profile_line" >> "$HOME/.profile"
fi

echo "[3/8] Node.js LTS 확인 및 설치"
if command -v node >/dev/null 2>&1 && node --version >/dev/null 2>&1; then
    echo "  Node.js가 이미 설치되어 있어 건너뜁니다."
else
    nodesource_script="$temporary_directory/nodesource_setup.sh"
    curl -fsSL https://deb.nodesource.com/setup_lts.x -o "$nodesource_script"
    sudo -E bash "$nodesource_script"
    sudo_apt install -y nodejs
fi

echo "[4/8] Git 확인 및 설치"
if command -v git >/dev/null 2>&1 && git --version >/dev/null 2>&1; then
    echo "  Git이 이미 설치되어 있어 건너뜁니다."
else
    sudo_apt install -y git
fi

echo "[5/8] curl 확인 및 설치"
if command -v curl >/dev/null 2>&1 && curl --version >/dev/null 2>&1; then
    echo "  curl이 이미 설치되어 있어 건너뜁니다."
else
    sudo_apt install -y curl
fi

echo "[6/8] gulp-cli 확인 및 설치"
if command -v gulp >/dev/null 2>&1 && gulp --version >/dev/null 2>&1; then
    echo "  gulp-cli가 이미 설치되어 있어 건너뜁니다."
else
    sudo npm install --global gulp-cli
fi

echo "[7/8] Microsoft.Web.LibraryManager.Cli 확인 및 설치"
if command -v libman >/dev/null 2>&1 && libman --version >/dev/null 2>&1; then
    echo "  libman이 이미 설치되어 있어 건너뜁니다."
else
    dotnet tool install --global Microsoft.Web.LibraryManager.Cli
fi

echo "[8/8] PowerShell 확인 및 설치"
if command -v pwsh >/dev/null 2>&1 && pwsh --version >/dev/null 2>&1; then
    echo "  PowerShell이 이미 설치되어 있어 건너뜁니다."
else
    dotnet tool install --global PowerShell
fi

echo
echo "=== 설치 결과 ==="
printf 'Ubuntu:    %s\n' "$PRETTY_NAME"
printf '.NET SDK:\n%s\n' "$(dotnet --list-sdks)"
printf 'Node.js:   %s\n' "$(node --version)"
printf 'npm:       %s\n' "$(npm --version)"
printf 'PowerShell:%s\n' "$(pwsh --version)"
printf 'Git:       %s\n' "$(git --version)"
printf 'curl:      %s\n' "$(curl --version | sed -n '1p')"
printf 'gulp-cli:\n%s\n' "$(gulp --version)"
printf 'libman:    %s\n' "$(libman --version)"
echo
echo "모든 구성 요소가 설치되었습니다. 새 로그인 셸을 열면 ~/.profile의 PATH 설정도 적용됩니다."
