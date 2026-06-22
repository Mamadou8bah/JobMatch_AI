#Requires -Version 5.1
param(
    [string]$SpaceId = "mamadoubah/jobmatch",
    [string]$SourceDir = (Join-Path $PSScriptRoot ".."),
    [string]$Token = $env:HF_TOKEN
)

$ErrorActionPreference = "Stop"

if (-not $Token) {
    Write-Error "Set HF_TOKEN to your Hugging Face write token, e.g. `$env:HF_TOKEN = 'hf_...'"
}

$SourceDir = (Resolve-Path $SourceDir).Path
$TempRoot = Join-Path $env:TEMP "jobmatch-hf-space"
$CloneDir = Join-Path $TempRoot "jobmatch"

if (Test-Path $CloneDir) {
    Remove-Item $CloneDir -Recurse -Force
}
New-Item -ItemType Directory -Path $TempRoot -Force | Out-Null

$cloneUrl = "https://mamadoubah:$Token@huggingface.co/spaces/$SpaceId"
Write-Host "Cloning https://huggingface.co/spaces/$SpaceId ..."
git clone $cloneUrl $CloneDir

$excludeDirs = @(".venv", "venv", "__pycache__", ".git", "scripts")
$excludeFiles = @(".env", ".env.local")

Get-ChildItem -Path $SourceDir -Force | ForEach-Object {
    if ($excludeDirs -contains $_.Name) { return }
    if ($_.PSIsContainer) {
        Copy-Item $_.FullName (Join-Path $CloneDir $_.Name) -Recurse -Force
    } elseif ($excludeFiles -notcontains $_.Name) {
        Copy-Item $_.FullName (Join-Path $CloneDir $_.Name) -Force
    }
}

Push-Location $CloneDir
git add -A
$status = git status --porcelain
if (-not $status) {
    Write-Host "No changes to push."
    Pop-Location
    exit 0
}

git commit -m "Deploy JobMatch AI Engine"
git push origin main
Pop-Location

Write-Host ""
Write-Host "Deployed to https://huggingface.co/spaces/$SpaceId"
Write-Host "API URL: https://$($SpaceId.Replace('/', '-')).hf.space"
