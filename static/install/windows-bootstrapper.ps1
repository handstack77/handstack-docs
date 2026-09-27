#requires -Version 5.1

[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

function Test-Command {
    param([Parameter(Mandatory)][string]$Name)

    return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Update-ProcessPath {
    $machinePath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    $env:Path = (@($machinePath, $userPath) | Where-Object { $_ }) -join ';'
}

function Add-UserPath {
    param([Parameter(Mandatory)][string]$Directory)

    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    $userPathEntries = @($userPath -split ';' | Where-Object { $_ })
    if ($userPathEntries -notcontains $Directory) {
        $newUserPath = (@($userPathEntries) + $Directory) -join ';'
        [Environment]::SetEnvironmentVariable('Path', $newUserPath, 'User')
    }

    Update-ProcessPath
}

function Install-WinGetPackage {
    param([Parameter(Mandatory)][string]$Id)

    & winget.exe install `
        --id $Id `
        --exact `
        --source winget `
        --accept-package-agreements `
        --accept-source-agreements `
        --disable-interactivity `
        --silent

    if ($LASTEXITCODE -ne 0) {
        throw "WinGet 패키지 설치 실패: $Id (종료 코드 $LASTEXITCODE)"
    }

    Update-ProcessPath
}

function Get-NpmCommand {
    # Node.js MSI가 PATH를 갱신한 직후에도 현재 프로세스에서 바로 보이지 않을 수 있다.
    # 먼저 레지스트리 PATH를 다시 읽고, 그래도 찾지 못하면 기본 설치 위치를 직접 사용한다.
    Update-ProcessPath

    $command = Get-Command 'npm.cmd' -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($null -ne $command) {
        return $command.Source
    }

    $defaultNpmCommand = Join-Path $env:ProgramFiles 'nodejs\npm.cmd'
    if (Test-Path -LiteralPath $defaultNpmCommand -PathType Leaf) {
        $nodeDirectory = Split-Path -Parent $defaultNpmCommand
        if (($env:Path -split ';') -notcontains $nodeDirectory) {
            $env:Path = "$nodeDirectory;$env:Path"
        }
        return $defaultNpmCommand
    }

    return $null
}

function Initialize-NpmGlobalDirectory {
    $npmCommand = Get-NpmCommand
    if (-not $npmCommand) {
        throw 'Node.js 설치 후 npm.cmd를 찾을 수 없습니다.'
    }

    # npm 11/Node.js 24의 Windows 기본 prefix가 Program Files로 잡히면 일반 사용자
    # 전역 설치가 실패할 수 있다. npm 조회 명령에 의존하지 않고 사용자 전용 위치를 쓴다.
    $npmGlobalDirectory = Join-Path ([Environment]::GetFolderPath('ApplicationData')) 'npm'
    if (-not (Test-Path -LiteralPath $npmGlobalDirectory -PathType Container)) {
        New-Item -ItemType Directory -Path $npmGlobalDirectory -Force | Out-Null
    }

    [Environment]::SetEnvironmentVariable('NPM_CONFIG_PREFIX', $npmGlobalDirectory, 'User')
    $env:NPM_CONFIG_PREFIX = $npmGlobalDirectory
    Add-UserPath $npmGlobalDirectory

    return $npmCommand
}

function Test-DotNet10Ga {
    if (-not (Test-Command 'dotnet.exe')) {
        return $false
    }

    $sdks = & dotnet.exe --list-sdks 2>$null
    return $null -ne ($sdks | Where-Object { $_ -match '^10[.]0[.][0-9]+\s' } | Select-Object -First 1)
}

try {
    Write-Host '=== HandStack 개발 환경 설치: Windows 11 x64 ==='
    Write-Host '[1/8] 사전 조건 확인'

    if ($env:OS -ne 'Windows_NT') {
        throw 'Windows 전용 스크립트입니다.'
    }

    if ([Environment]::OSVersion.Version.Build -lt 22000) {
        throw "Windows 11 전용 스크립트입니다. 현재 빌드: $([Environment]::OSVersion.Version.Build)"
    }

    $architecture = if ($env:PROCESSOR_ARCHITEW6432) {
        $env:PROCESSOR_ARCHITEW6432
    } else {
        $env:PROCESSOR_ARCHITECTURE
    }

    if ($architecture -ne 'AMD64') {
        throw "Windows x64 전용 스크립트입니다. 현재 아키텍처: $architecture"
    }

    if (-not (Test-Command 'winget.exe')) {
        throw 'winget.exe를 찾을 수 없습니다. Microsoft Store의 앱 설치 관리자(App Installer)를 설치하거나 업데이트하세요.'
    }

    & winget.exe source update --disable-interactivity
    if ($LASTEXITCODE -ne 0) {
        throw "WinGet 원본 업데이트 실패 (종료 코드 $LASTEXITCODE)"
    }

    Write-Host '[2/8] .NET SDK 10 GA 확인 및 설치'
    if (Test-DotNet10Ga) {
        Write-Host '  .NET SDK 10 GA가 이미 설치되어 있어 건너뜁니다.'
    } else {
        Install-WinGetPackage 'Microsoft.DotNet.SDK.10'
    }

    $dotnetToolsDirectory = Join-Path $HOME '.dotnet\tools'
    Add-UserPath $dotnetToolsDirectory

    Write-Host '[3/8] Node.js LTS 확인 및 설치'
    if ((Test-Command 'node.exe') -and (Test-Command 'npm.cmd')) {
        Write-Host '  Node.js가 이미 설치되어 있어 건너뜁니다.'
    } else {
        Install-WinGetPackage 'OpenJS.NodeJS.LTS'
    }

    $npmCommand = Initialize-NpmGlobalDirectory

    Write-Host '[4/8] Git 확인 및 설치'
    if (Test-Command 'git.exe') {
        Write-Host '  Git이 이미 설치되어 있어 건너뜁니다.'
    } else {
        Install-WinGetPackage 'Git.Git'
    }

    Write-Host '[5/8] curl 확인 및 설치'
    if (Test-Command 'curl.exe') {
        Write-Host '  curl이 이미 설치되어 있어 건너뜁니다.'
    } else {
        Install-WinGetPackage 'cURL.cURL'
    }

    Write-Host '[6/8] gulp-cli 확인 및 설치'
    if (Test-Command 'gulp.cmd') {
        Write-Host '  gulp-cli가 이미 설치되어 있어 건너뜁니다.'
    } else {
        & $npmCommand install --global gulp-cli
        if ($LASTEXITCODE -ne 0) {
            throw "gulp-cli 설치 실패 (종료 코드 $LASTEXITCODE)"
        }
    }

    Write-Host '[7/8] Microsoft.Web.LibraryManager.Cli 확인 및 설치'
    if (Test-Command 'libman.exe') {
        Write-Host '  libman이 이미 설치되어 있어 건너뜁니다.'
    } else {
        & dotnet.exe tool install --global Microsoft.Web.LibraryManager.Cli
        if ($LASTEXITCODE -ne 0) {
            throw "LibMan CLI 설치 실패 (종료 코드 $LASTEXITCODE)"
        }
    }

    Write-Host '[8/8] PowerShell 확인 및 설치'
    if (Test-Command 'pwsh.exe') {
        Write-Host '  PowerShell이 이미 설치되어 있어 건너뜁니다.'
    } else {
        & dotnet.exe tool install --global PowerShell
        if ($LASTEXITCODE -ne 0) {
            throw "PowerShell 설치 실패 (종료 코드 $LASTEXITCODE)"
        }
    }

    Write-Host
    Write-Host '=== 설치 결과 ==='
    Write-Host "Windows:    $([Environment]::OSVersion.VersionString)"
    Write-Host '.NET SDK:'
    & dotnet.exe --list-sdks
    Write-Host "Node.js:    $(& node.exe --version)"
    Write-Host "npm:        $(& npm.cmd --version)"
    Write-Host "PowerShell: $(& pwsh.exe --version)"
    Write-Host "Git:        $(& git.exe --version)"
    Write-Host "curl:       $((& curl.exe --version | Select-Object -First 1))"
    Write-Host 'gulp-cli:'
    & gulp.cmd --version
    Write-Host "libman:     $(& libman.exe --version)"
    Write-Host
    Write-Host '모든 구성 요소가 설치되었습니다. 새 터미널에서도 사용자 PATH 설정이 적용됩니다.'
} catch {
    Write-Error "설치 실패: $($_.Exception.Message)"
    exit 1
}
