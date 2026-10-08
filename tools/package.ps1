# Empacota o jogo em dist/avatar-arena-<versão>.zip para itch.io / GitHub Pages / distribuição.
# Uso: .\tools\package.ps1 [-Version 0.5.0]
param([string]$Version = "0.5.0")
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$dist = Join-Path $root "dist"
$stage = Join-Path $dist "avatar-arena"
if (Test-Path $stage) { Remove-Item -Recurse -Force $stage }
New-Item -ItemType Directory -Force $stage | Out-Null
foreach ($item in @("index.html", "css", "js", "icons", "manifest.webmanifest", "sw.js", "README.md")) {
  Copy-Item -Recurse -Force (Join-Path $root $item) (Join-Path $stage $item)
}
$zip = Join-Path $dist "avatar-arena-$Version.zip"
if (Test-Path $zip) { Remove-Item -Force $zip }
Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $zip
Remove-Item -Recurse -Force $stage
Write-Host "Pacote gerado: $zip"
