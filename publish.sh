#!/bin/bash

# publish.sh win Debug

# win, linux, osx
os_mode=$1
if [ -z "$os_mode" ]; then os_mode=win; fi

# Debug, Release
configuration_mode=$2
if [ -z "$configuration_mode" ]; then configuration_mode=Debug; fi

# x64, x86, arm64
arch_mode=$3
if [ -z "$arch_mode" ]; then arch_mode=x64; fi

echo "os_mode: $os_mode, configuration_mode: $configuration_mode, arch_mode: $arch_mode"

npm run build

rm -rf publish/$os_mode-$arch_mode/handstack-docs
dotnet build handstack-docs.csproj --configuration $configuration_mode --arch $arch_mode --os $os_mode --output publish/$os_mode-$arch_mode/handstack-docs
