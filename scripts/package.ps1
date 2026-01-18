param(
  [string]$ProjectRoot = (Resolve-Path "$PSScriptRoot\\..").Path,
  [string]$OutDir = (Join-Path (Resolve-Path "$PSScriptRoot\\..").Path "dist"),
  [switch]$IncludeMvpDefaults
)

$ErrorActionPreference = "Stop"

Set-Location $ProjectRoot

if (!(Test-Path "package.json")) {
  throw "package.json not found under $ProjectRoot"
}

$manifest = Get-Content "manifest.json" -Raw -Encoding utf8 | ConvertFrom-Json
$pluginId = [string]$manifest.id
if ([string]::IsNullOrWhiteSpace($pluginId)) {
  throw "manifest.json is missing 'id'"
}

Write-Host "Building (production)..."
npm run build
if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$zipPath = Join-Path $OutDir ("{0}.zip" -f $pluginId)
if (Test-Path $zipPath) { Remove-Item -Force $zipPath }

$files = @("manifest.json", "main.js", "styles.css", "versions.json")
$optionalFiles = @()

if ($IncludeMvpDefaults) {
  $defaultsSource = $null
  if (Test-Path "mvp.defaults.public.json") {
    $defaultsSource = "mvp.defaults.public.json"
  } elseif (Test-Path "mvp.defaults.json") {
    $defaultsSource = "mvp.defaults.json"
  } else {
    throw "IncludeMvpDefaults was set but neither mvp.defaults.public.json nor mvp.defaults.json was found."
  }
  try {
    $defaults = Get-Content $defaultsSource -Raw -Encoding utf8 | ConvertFrom-Json
    $apiKey = [string]$defaults.apiKey
    if (-not [string]::IsNullOrWhiteSpace($apiKey)) {
      throw "$defaultsSource contains a non-empty apiKey. Refusing to package secrets. Remove apiKey (leave blank) and retry."
    }
  } catch {
    throw "Failed to validate mvp.defaults.json: $($_.Exception.Message)"
  }

  $optionalFiles += $defaultsSource
}

$missing = $files | Where-Object { !(Test-Path $_) }
if ($missing.Count -gt 0) {
  throw "Missing files: $($missing -join ', '). Did build finish successfully?"
}

$stage = Join-Path $OutDir $pluginId
if (Test-Path $stage) { Remove-Item -Recurse -Force $stage }
New-Item -ItemType Directory -Force -Path $stage | Out-Null

foreach ($f in $files) {
  Copy-Item -Force $f (Join-Path $stage $f)
}

foreach ($f in $optionalFiles) {
  if (Test-Path $f) {
    $destName = if ($f -eq "mvp.defaults.public.json") { "mvp.defaults.json" } else { $f }
    Copy-Item -Force $f (Join-Path $stage $destName)
  }
}

Compress-Archive -Path $stage -DestinationPath $zipPath
Write-Host ("Done: {0}" -f $zipPath)
