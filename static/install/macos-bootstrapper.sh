#!/usr/bin/env bash

set -Eeuo pipefail

readonly NODE_LTS_FORMULA="node@24"
readonly DOTNET_MIN_MACOS_MAJOR=14

on_error() {
    local exit_code=$?
    printf '\n설치 실패: %s번째 줄, 종료 코드 %s\n' "${BASH_LINENO[0]}" "$exit_code" >&2
    exit "$exit_code"
}
trap on_error ERR

ensure_profile_line() {
    local line=$1
    touch "$HOME/.zprofile"
    if ! grep -Fqx "$line" "$HOME/.zprofile"; then
        printf '\n%s\n' "$line" >> "$HOME/.zprofile"
    fi
}

has_dotnet_10_ga() {
    command -v dotnet >/dev/null 2>&1 || return 1
    dotnet --list-sdks 2>/dev/null | awk '
        $1 ~ /^10[.]0[.][0-9]+$/ { found = 1 }
        END { exit(found ? 0 : 1) }
    '
}

echo "=== HandStack 개발 환경 설치: macOS ==="
echo "[1/8] 사전 조건 확인 및 Homebrew 설치"

if [[ $(uname -s) != "Darwin" ]]; then
    echo "macOS 전용 스크립트입니다." >&2
    exit 1
fi

if [[ ${EUID} -eq 0 ]]; then
    echo "이 스크립트 자체를 root로 실행하지 마세요. 일반 사용자로 실행하면 필요한 경우에만 sudo 인증을 요청합니다." >&2
    exit 1
fi

macos_version="$(sw_vers -productVersion)"
if [[ ! $macos_version =~ ^[0-9]+([.][0-9]+){0,2}$ ]]; then
    echo "macOS 버전을 확인할 수 없습니다: $macos_version" >&2
    exit 1
fi

macos_major_version="${macos_version%%.*}"
if (( 10#$macos_major_version < DOTNET_MIN_MACOS_MAJOR )); then
    echo ".NET 10 SDK 설치에는 macOS $DOTNET_MIN_MACOS_MAJOR 이상이 필요합니다. 현재 버전: $macos_version" >&2
    exit 1
fi

machine_architecture="$(uname -m)"
case "$machine_architecture" in
    arm64)
        dotnet_architecture="arm64"
        homebrew_binary="/opt/homebrew/bin/brew"
        ;;
    x86_64)
        if [[ $(sysctl -in sysctl.proc_translated 2>/dev/null || true) == "1" ]]; then
            echo "Rosetta 모드로 실행 중입니다. Apple Silicon 네이티브(arm64) 모드로 다시 실행하세요:" >&2
            echo "  arch -arm64 /bin/bash ./macos-bootstrapper.sh" >&2
            exit 1
        fi
        dotnet_architecture="x64"
        homebrew_binary="/usr/local/bin/brew"
        ;;
    *)
        echo "지원하지 않는 아키텍처입니다: $machine_architecture" >&2
        exit 1
        ;;
esac

if ! xcode-select -p >/dev/null 2>&1; then
    echo "Xcode Command Line Tools가 필요합니다. 'xcode-select --install'을 실행해 설치를 마친 뒤 다시 실행하세요." >&2
    exit 1
fi

if [[ ! -x $homebrew_binary ]]; then
    NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

if [[ ! -x $homebrew_binary ]]; then
    echo "Homebrew 실행 파일을 찾을 수 없습니다: $homebrew_binary" >&2
    exit 1
fi

eval "$("$homebrew_binary" shellenv)"
homebrew_profile_line="eval \"\$($homebrew_binary shellenv)\""
ensure_profile_line "$homebrew_profile_line"
brew update

temporary_directory="$(mktemp -d)"
cleanup() {
    rm -rf -- "$temporary_directory"
}
trap cleanup EXIT

dotnet_root="$HOME/.dotnet"
dotnet_tools_directory="$dotnet_root/tools"
export DOTNET_ROOT="$dotnet_root"
export PATH="$dotnet_root:$dotnet_tools_directory:$PATH"
ensure_profile_line 'export DOTNET_ROOT="$HOME/.dotnet"'
ensure_profile_line 'export PATH="$DOTNET_ROOT:$DOTNET_ROOT/tools:$PATH"'

echo "[2/8] .NET SDK 10 GA 확인 및 설치"
if has_dotnet_10_ga; then
    echo "  .NET SDK 10 GA가 이미 설치되어 있어 건너뜁니다."
else
    dotnet_install_script="$temporary_directory/dotnet-install.sh"
    curl -fsSL https://dot.net/v1/dotnet-install.sh -o "$dotnet_install_script"
    chmod +x "$dotnet_install_script"
    "$dotnet_install_script" \
        --channel 10.0 \
        --quality ga \
        --architecture "$dotnet_architecture" \
        --install-dir "$dotnet_root"
fi

echo "[3/8] Node.js LTS 확인 및 설치"
if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
    echo "  Node.js가 이미 설치되어 있어 건너뜁니다."
else
    brew install "$NODE_LTS_FORMULA"
    node_lts_binary_directory="$(brew --prefix "$NODE_LTS_FORMULA")/bin"
    export PATH="$node_lts_binary_directory:$PATH"
    node_profile_line="export PATH=\"$node_lts_binary_directory:\$PATH\""
    ensure_profile_line "$node_profile_line"
fi

echo "[4/8] Git 확인 및 설치"
if command -v git >/dev/null 2>&1 && git --version >/dev/null 2>&1; then
    echo "  Git이 이미 설치되어 있어 건너뜁니다."
else
    brew install git
fi

echo "[5/8] curl 확인 및 설치"
if command -v curl >/dev/null 2>&1 && curl --version >/dev/null 2>&1; then
    echo "  curl이 이미 설치되어 있어 건너뜁니다."
else
    brew install curl
    curl_binary_directory="$(brew --prefix curl)/bin"
    export PATH="$curl_binary_directory:$PATH"
    curl_profile_line="export PATH=\"$curl_binary_directory:\$PATH\""
    ensure_profile_line "$curl_profile_line"
fi

echo "[6/8] gulp-cli 확인 및 설치"
if command -v gulp >/dev/null 2>&1 && gulp --version >/dev/null 2>&1; then
    echo "  gulp-cli가 이미 설치되어 있어 건너뜁니다."
else
    npm install --global gulp-cli
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
printf 'macOS:      %s (%s)\n' "$macos_version" "$machine_architecture"
printf '.NET SDK:\n%s\n' "$(dotnet --list-sdks)"
printf 'Node.js:    %s\n' "$(node --version)"
printf 'npm:        %s\n' "$(npm --version)"
printf 'PowerShell: %s\n' "$(pwsh --version)"
printf 'Git:        %s\n' "$(git --version)"
printf 'curl:       %s\n' "$(curl --version | sed -n '1p')"
printf 'gulp-cli:\n%s\n' "$(gulp --version)"
printf 'libman:     %s\n' "$(libman --version)"
echo
echo "모든 구성 요소가 설치되었습니다. 새 로그인 셸에서도 ~/.zprofile의 PATH 설정이 적용됩니다."
