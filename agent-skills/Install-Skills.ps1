[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [ValidateSet('Both', 'ClaudeCode', 'CodexCLI')]
    [string]$Tool = 'Both',
    [ValidateSet('Project', 'User')]
    [string]$Scope = 'Project',
    [string]$ProjectRoot = $PSScriptRoot,
    [string[]]$Skill,
    [switch]$Update,
    [string[]]$RetireSkill
)

$ErrorActionPreference = 'Stop'
$sourceRoot = Join-Path $PSScriptRoot 'skills'
$available = @(Get-ChildItem -LiteralPath $sourceRoot -Directory |
    Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'SKILL.md') })
if ($available.Count -eq 0) {
    throw '설치할 스킬이 없습니다.'
}
if ($Skill) {
    foreach ($name in $Skill) {
        if ($name -notin $available.Name) {
            throw "알 수 없는 스킬: $name"
        }
    }
    $available = @($available | Where-Object { $_.Name -in $Skill })
}

if ($Scope -eq 'User') {
    $basePath = [Environment]::GetFolderPath('UserProfile')
} else {
    if (-not (Test-Path -LiteralPath $ProjectRoot -PathType Container)) {
        throw "프로젝트 폴더가 없습니다: $ProjectRoot"
    }
    $basePath = (Resolve-Path -LiteralPath $ProjectRoot).Path
}
$targets = @()
if ($Tool -in @('Both', 'ClaudeCode')) { $targets += [pscustomobject]@{ Root = (Join-Path $basePath '.claude/skills'); Backup = (Join-Path $basePath '.claude/skills-backup') } }
if ($Tool -in @('Both', 'CodexCLI')) { $targets += [pscustomobject]@{ Root = (Join-Path $basePath '.agents/skills'); Backup = (Join-Path $basePath '.agents/skills-backup') } }
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'

function Get-SkillFiles([string]$Root) {
    $map = @{}
    foreach ($file in Get-ChildItem -LiteralPath $Root -File -Recurse) {
        $relative = $file.FullName.Substring($Root.TrimEnd('\', '/').Length + 1)
        $map[$relative] = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
    }
    return $map
}

$plan = @()
foreach ($target in $targets) {
    foreach ($source in $available) {
        $targetPath = Join-Path $target.Root $source.Name
        $state = 'New'
        if (Test-Path -LiteralPath $targetPath) {
            if (-not (Test-Path -LiteralPath $targetPath -PathType Container)) {
                throw "스킬 대상이 폴더가 아닙니다: $targetPath"
            }
            $left = Get-SkillFiles $source.FullName
            $right = Get-SkillFiles $targetPath
            $same = $left.Count -eq $right.Count
            foreach ($key in $left.Keys) {
                if (-not $right.ContainsKey($key) -or $right[$key] -ne $left[$key]) { $same = $false }
            }
            if ($same) {
                $state = 'Same'
            } elseif ($Update) {
                $state = 'Replace'
            } else {
                throw "다른 내용의 기존 스킬을 보존하기 위해 설치를 중단했습니다(교체하려면 -Update): $targetPath"
            }
        }
        $plan += [pscustomobject]@{ Source = $source.FullName; Target = $targetPath; State = $state; Backup = $target.Backup; Name = $source.Name }
    }
    if ($RetireSkill) {
        foreach ($legacy in $RetireSkill) {
            if ($legacy -notmatch '^[a-z0-9]+(-[a-z0-9]+)*$') { throw "스킬 이름 형식이 올바르지 않습니다: $legacy" }
            $legacyPath = Join-Path $target.Root $legacy
            $skillFile = Join-Path $legacyPath 'SKILL.md'
            if ((Test-Path -LiteralPath $skillFile) -and ((Get-Content -LiteralPath $skillFile -Raw) -match "(?m)^name:\s*$([regex]::Escape($legacy))\s*$")) {
                $plan += [pscustomobject]@{ Source = $null; Target = $legacyPath; State = 'Retire'; Backup = $target.Backup; Name = $legacy }
            }
        }
    }
}

foreach ($item in $plan) {
    switch ($item.State) {
        'Same' { Write-Output "동일한 스킬: $($item.Target)" }
        'New' {
            if ($PSCmdlet.ShouldProcess($item.Target, 'HandStack 개발 스킬 복사')) {
                New-Item -ItemType Directory -Path (Split-Path -Parent $item.Target) -Force | Out-Null
                Copy-Item -LiteralPath $item.Source -Destination $item.Target -Recurse
                Write-Output "설치 완료: $($item.Target)"
            }
        }
        'Replace' {
            if ($PSCmdlet.ShouldProcess($item.Target, '기존 스킬을 백업하고 교체')) {
                $backupPath = Join-Path (Join-Path $item.Backup $stamp) $item.Name
                New-Item -ItemType Directory -Path (Split-Path -Parent $backupPath) -Force | Out-Null
                Move-Item -LiteralPath $item.Target -Destination $backupPath
                Copy-Item -LiteralPath $item.Source -Destination $item.Target -Recurse
                Write-Output "교체 완료: $($item.Target) (백업: $backupPath)"
            }
        }
        'Retire' {
            if ($PSCmdlet.ShouldProcess($item.Target, '이전 이름의 스킬을 백업 폴더로 이동')) {
                $backupPath = Join-Path (Join-Path $item.Backup $stamp) $item.Name
                New-Item -ItemType Directory -Path (Split-Path -Parent $backupPath) -Force | Out-Null
                Move-Item -LiteralPath $item.Target -Destination $backupPath
                Write-Output "이전 스킬 이동: $($item.Target) -> $backupPath"
            }
        }
    }
}
