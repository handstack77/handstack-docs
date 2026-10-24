[CmdletBinding()]
param([Parameter(Mandatory = $true)][string]$TestRoot)

$ErrorActionPreference = 'Stop'
$bundleRoot = Split-Path -Parent $PSScriptRoot
$installer = Join-Path $bundleRoot 'Install-Skills.ps1'
$expected = @(Get-ChildItem -LiteralPath (Join-Path $bundleRoot 'skills') -Directory |
    Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'SKILL.md') }).Count
$resolved = [System.IO.Path]::GetFullPath($TestRoot)
if (Test-Path -LiteralPath $resolved) { throw '테스트는 새 폴더에서만 실행합니다.' }
New-Item -ItemType Directory -Path $resolved | Out-Null

$dryRunRoot = Join-Path $resolved 'dry-run'
$successRoot = Join-Path $resolved 'success'
$conflictRoot = Join-Path $resolved 'conflict'
$updateRoot = Join-Path $resolved 'update'
foreach ($path in @($dryRunRoot, $successRoot, $conflictRoot, $updateRoot)) {
    New-Item -ItemType Directory -Path $path | Out-Null
}

& $installer -Scope Project -ProjectRoot $dryRunRoot -WhatIf | Out-Null
if ((Test-Path -LiteralPath (Join-Path $dryRunRoot '.claude')) -or
    (Test-Path -LiteralPath (Join-Path $dryRunRoot '.agents'))) {
    throw 'WhatIf가 파일을 생성했습니다.'
}

& $installer -Scope Project -ProjectRoot $successRoot | Out-Null
& $installer -Scope Project -ProjectRoot $successRoot | Out-Null
foreach ($toolRoot in @('.claude/skills', '.agents/skills')) {
    $installed = @(Get-ChildItem -LiteralPath (Join-Path $successRoot $toolRoot) -Directory)
    if ($installed.Count -ne $expected) { throw "두 도구에 스킬 $expected 개가 설치되지 않았습니다." }
}

$sentinelRoot = Join-Path $conflictRoot '.agents/skills/handstack-ide-development'
New-Item -ItemType Directory -Path $sentinelRoot -Force | Out-Null
$sentinel = Join-Path $sentinelRoot 'SKILL.md'
[System.IO.File]::WriteAllText($sentinel, 'PRESERVE_EXISTING_SKILL')
$rejected = $false
try {
    & $installer -Scope Project -ProjectRoot $conflictRoot | Out-Null
} catch {
    $rejected = $_.Exception.Message -like '*기존 스킬*'
}
if (-not $rejected) { throw '충돌 설치가 거부되지 않았습니다.' }
if ([System.IO.File]::ReadAllText($sentinel) -ne 'PRESERVE_EXISTING_SKILL') {
    throw '기존 스킬을 변경했습니다.'
}
if (Test-Path -LiteralPath (Join-Path $conflictRoot '.claude')) {
    throw '사전 검사 실패 전에 일부 스킬을 설치했습니다.'
}

$oldSkill = Join-Path $updateRoot '.claude/skills/handstack-source-trace'
New-Item -ItemType Directory -Path $oldSkill -Force | Out-Null
[System.IO.File]::WriteAllText((Join-Path $oldSkill 'SKILL.md'), 'OLD_VERSION')
$legacy = Join-Path $updateRoot '.claude/skills/retired-sample-skill'
New-Item -ItemType Directory -Path $legacy -Force | Out-Null
[System.IO.File]::WriteAllText((Join-Path $legacy 'SKILL.md'), "---`nname: retired-sample-skill`ndescription: old`n---`n")
& $installer -Scope Project -ProjectRoot $updateRoot -Tool ClaudeCode -Update -RetireSkill retired-sample-skill | Out-Null
if ((Get-Content -LiteralPath (Join-Path $oldSkill 'SKILL.md') -Raw) -like '*OLD_VERSION*') { throw '-Update가 교체하지 않았습니다.' }
$backups = @(Get-ChildItem -LiteralPath (Join-Path $updateRoot '.claude/skills-backup') -Recurse -Filter SKILL.md)
if ($backups.Count -ne 2) { throw '교체/이전 스킬의 백업이 2개가 아닙니다.' }
if (Test-Path -LiteralPath $legacy) { throw '-RetireSkill이 이전 스킬을 이동하지 않았습니다.' }
$installedAfterUpdate = @(Get-ChildItem -LiteralPath (Join-Path $updateRoot '.claude/skills') -Directory)
if ($installedAfterUpdate.Count -ne $expected) { throw '백업이 스킬 폴더 안에 섞였거나 스킬 수가 맞지 않습니다.' }
Write-Output 'PASS: WhatIf, 양쪽 설치, 동일 내용 재실행, 충돌 시 사전 중단 및 보존, -Update 백업 교체, -RetireSkill 이동'
