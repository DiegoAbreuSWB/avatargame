# Roda a suíte de testes nos dois renderizadores. Uso: .\tests\run.ps1 [all|moves|cpu|matchups] [--pairs 6]
param([string]$Mode = "all")
$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
Push-Location $root
Write-Host "== 2D =="; node tests/run.js $Mode @args; $a = $LASTEXITCODE
Write-Host "== 3D =="; node tests/run.js $Mode --3d @args; $b = $LASTEXITCODE
Pop-Location
if ($a -ne 0 -or $b -ne 0) { Write-Host "FALHOU"; exit 1 } else { Write-Host "OK"; exit 0 }
