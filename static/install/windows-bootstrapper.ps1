#requires -Version 5.1

[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$script:DownloadDirectory = $null
$script:RestartRequired = $false

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

function Test-Administrator {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal $identity
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Get-DownloadDirectory {
    if (-not $script:DownloadDirectory) {
        $script:DownloadDirectory = Join-Path $env:TEMP ("handstack-bootstrapper-" + [Guid]::NewGuid().ToString('N'))
        New-Item -ItemType Directory -Path $script:DownloadDirectory -Force | Out-Null
    }

    return $script:DownloadDirectory
}

function Remove-DownloadDirectory {
    if ($script:DownloadDirectory -and (Test-Path -LiteralPath $script:DownloadDirectory)) {
        Remove-Item -LiteralPath $script:DownloadDirectory -Recurse -Force -ErrorAction SilentlyContinue
    }
}

function Save-InstallerFile {
    param(
        [Parameter(Mandatory)][string]$Uri,
        [Parameter(Mandatory)][string]$FileName,
        [Parameter(Mandatory)][ValidateSet('SHA256', 'SHA512')][string]$Algorithm,
        [Parameter(Mandatory)][string]$ExpectedHash
    )

    $filePath = Join-Path (Get-DownloadDirectory) $FileName
    Write-Host "  다운로드: $Uri"

    # Windows PowerShell 5.1은 Internet Explorer 엔진이 초기화되지 않은 서버에서
    # 기본 파싱이 실패하므로 -UseBasicParsing을 사용한다.
    Invoke-WebRequest -Uri $Uri -OutFile $filePath -UseBasicParsing

    $actualHash = (Get-FileHash -LiteralPath $filePath -Algorithm $Algorithm).Hash
    if ($actualHash -ne $ExpectedHash.ToUpperInvariant()) {
        throw "다운로드한 파일의 해시가 일치하지 않습니다: $FileName"
    }

    return $filePath
}

function Invoke-Installer {
    param(
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][string]$FilePath,
        [Parameter(Mandatory)][string[]]$ArgumentList
    )

    $process = Start-Process -FilePath $FilePath -ArgumentList $ArgumentList -Wait -PassThru
    if ($process.ExitCode -eq 3010) {
        $script:RestartRequired = $true
    } elseif ($process.ExitCode -ne 0) {
        throw "$Name 설치 실패 (종료 코드 $($process.ExitCode))"
    }

    Update-ProcessPath
}

function Install-DotNetSdkDirect {
    $releases = Invoke-RestMethod -Uri 'https://builds.dotnet.microsoft.com/dotnet/release-metadata/10.0/releases.json' -UseBasicParsing
    $sdkVersion = $releases.'latest-sdk'
    $sdk = $releases.releases |
        ForEach-Object { $_.sdks } |
        Where-Object { $_.version -eq $sdkVersion } |
        Select-Object -First 1
    $file = $sdk.files | Where-Object { $_.name -eq 'dotnet-sdk-win-x64.exe' } | Select-Object -First 1
    if (-not $file) {
        throw ".NET SDK $sdkVersion Windows x64 설치 파일 정보를 찾을 수 없습니다."
    }

    $installer = Save-InstallerFile -Uri $file.url -FileName "dotnet-sdk-$sdkVersion-win-x64.exe" -Algorithm SHA512 -ExpectedHash $file.hash
    Invoke-Installer -Name ".NET SDK $sdkVersion" -FilePath $installer -ArgumentList @('/install', '/quiet', '/norestart')
}

function Install-NodeJsDirect {
    # Windows PowerShell 5.1의 Invoke-RestMethod는 JSON 배열을 하나의 객체로 전달하므로
    # 변수에 담은 뒤 파이프라인으로 나열한다.
    $releases = Invoke-RestMethod -Uri 'https://nodejs.org/dist/index.json' -UseBasicParsing
    $release = $releases |
        Where-Object { $_.lts -and ($_.files -contains 'win-x64-msi') } |
        Select-Object -First 1
    if (-not $release) {
        throw 'Node.js LTS Windows x64 MSI 정보를 찾을 수 없습니다.'
    }

    $version = $release.version
    $fileName = "node-$version-x64.msi"
    $checksums = (Invoke-WebRequest -Uri "https://nodejs.org/dist/$version/SHASUMS256.txt" -UseBasicParsing).Content
    $checksumLine = $checksums -split "`n" | Where-Object { $_ -match "^([0-9a-fA-F]{64})\s+$([Regex]::Escape($fileName))\s*$" } | Select-Object -First 1
    if (-not $checksumLine) {
        throw "Node.js $version 체크섬을 찾을 수 없습니다."
    }

    $expectedHash = ($checksumLine -split '\s+')[0]
    $installer = Save-InstallerFile -Uri "https://nodejs.org/dist/$version/$fileName" -FileName $fileName -Algorithm SHA256 -ExpectedHash $expectedHash
    Invoke-Installer -Name "Node.js $version" -FilePath 'msiexec.exe' -ArgumentList @('/i', "`"$installer`"", '/qn', '/norestart')
}

function Install-GitDirect {
    $release = Invoke-RestMethod -Uri 'https://api.github.com/repos/git-for-windows/git/releases/latest' -UseBasicParsing
    $asset = $release.assets | Where-Object { $_.name -match '^Git-[0-9.]+-64-bit\.exe$' } | Select-Object -First 1
    if (-not $asset) {
        throw "Git for Windows $($release.tag_name) 64비트 설치 파일을 찾을 수 없습니다."
    }

    $digest = if ($asset.PSObject.Properties.Name -contains 'digest') { [string]$asset.digest } else { '' }
    if ($digest -notmatch '^sha256:[0-9a-fA-F]{64}$') {
        throw "Git for Windows 설치 파일의 SHA-256 정보를 찾을 수 없습니다: $($asset.name)"
    }

    $expectedHash = $digest.Substring('sha256:'.Length)
    $installer = Save-InstallerFile -Uri $asset.browser_download_url -FileName $asset.name -Algorithm SHA256 -ExpectedHash $expectedHash
    Invoke-Installer -Name "Git $($release.tag_name)" -FilePath $installer -ArgumentList @('/VERYSILENT', '/NORESTART', '/NOCANCEL', '/SP-', '/SUPPRESSMSGBOXES')
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
    Write-Host '=== HandStack 개발 환경 설치: Windows x64 ==='
    Write-Host '[1/8] 사전 조건 확인'

    if ($env:OS -ne 'Windows_NT') {
        throw 'Windows 전용 스크립트입니다.'
    }

    # Windows 10 1809·Windows Server 2019(빌드 17763) 이상을 지원한다.
    if ([Environment]::OSVersion.Version.Build -lt 17763) {
        throw "Windows 10 1809 또는 Windows Server 2019 이상이 필요합니다. 현재 빌드: $([Environment]::OSVersion.Version.Build)"
    }

    $architecture = if ($env:PROCESSOR_ARCHITEW6432) {
        $env:PROCESSOR_ARCHITEW6432
    } else {
        $env:PROCESSOR_ARCHITECTURE
    }

    if ($architecture -ne 'AMD64') {
        throw "Windows x64 전용 스크립트입니다. 현재 아키텍처: $architecture"
    }

    $useWinGet = Test-Command 'winget.exe'
    if ($useWinGet) {
        & winget.exe source update --disable-interactivity
        if ($LASTEXITCODE -ne 0) {
            throw "WinGet 원본 업데이트 실패 (종료 코드 $LASTEXITCODE)"
        }
    } else {
        # WinGet이 없는 Windows Server 2019 등에서는 공식 배포처의 설치 파일을 직접 받는다.
        Write-Host '  winget.exe가 없어 공식 배포처의 설치 파일로 설치합니다.'

        if (-not (Test-Administrator)) {
            throw 'WinGet 없이 설치하려면 관리자 권한이 필요합니다. 관리자 권한으로 PowerShell을 열어 다시 실행하세요.'
        }

        [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
    }

    Write-Host '[2/8] .NET SDK 10 GA 확인 및 설치'
    if (Test-DotNet10Ga) {
        Write-Host '  .NET SDK 10 GA가 이미 설치되어 있어 건너뜁니다.'
    } elseif ($useWinGet) {
        Install-WinGetPackage 'Microsoft.DotNet.SDK.10'
    } else {
        Install-DotNetSdkDirect
    }

    $dotnetToolsDirectory = Join-Path $HOME '.dotnet\tools'
    Add-UserPath $dotnetToolsDirectory

    Write-Host '[3/8] Node.js LTS 확인 및 설치'
    if ((Test-Command 'node.exe') -and (Test-Command 'npm.cmd')) {
        Write-Host '  Node.js가 이미 설치되어 있어 건너뜁니다.'
    } elseif ($useWinGet) {
        Install-WinGetPackage 'OpenJS.NodeJS.LTS'
    } else {
        Install-NodeJsDirect
    }

    $npmCommand = Initialize-NpmGlobalDirectory

    Write-Host '[4/8] Git 확인 및 설치'
    if (Test-Command 'git.exe') {
        Write-Host '  Git이 이미 설치되어 있어 건너뜁니다.'
    } elseif ($useWinGet) {
        Install-WinGetPackage 'Git.Git'
    } else {
        Install-GitDirect
    }

    Write-Host '[5/8] curl 확인 및 설치'
    if (Test-Command 'curl.exe') {
        Write-Host '  curl이 이미 설치되어 있어 건너뜁니다.'
    } elseif ($useWinGet) {
        Install-WinGetPackage 'cURL.cURL'
    } else {
        throw 'curl.exe를 찾을 수 없습니다. Windows 10 1803 이상에 포함된 C:\Windows\System32\curl.exe가 있는지 확인하세요.'
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
    if ($script:RestartRequired) {
        Write-Host '일부 설치 프로그램이 재부팅을 요청했습니다. 사용 전에 Windows를 다시 시작하세요.'
    }
} catch {
    Write-Error "설치 실패: $($_.Exception.Message)"
    exit 1
} finally {
    Remove-DownloadDirectory
}
