[CmdletBinding()]
param(
  [string[]]$Schema = @('public', 'extensions'),
  [string]$OutputPath = (Join-Path $PSScriptRoot 'schema-export.sql'),
  [switch]$Force
)

$ErrorActionPreference = 'Stop'

$supabase = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabase) {
  throw 'No se encontro Supabase CLI. Instalala y vuelve a ejecutar el script.'
}

if ([string]::IsNullOrWhiteSpace($env:SUPABASE_DB_URL)) {
  throw 'Define SUPABASE_DB_URL en esta sesion con la conexion de la base origen.'
}

if ($Schema.Count -eq 0 -or ($Schema | Where-Object { [string]::IsNullOrWhiteSpace($_) })) {
  throw 'Indica al menos un esquema valido con -Schema.'
}

$resolvedOutputPath = [System.IO.Path]::GetFullPath($OutputPath)
$outputDirectory = Split-Path -Parent $resolvedOutputPath

if ((Test-Path $resolvedOutputPath) -and -not $Force) {
  throw "El archivo ya existe: $resolvedOutputPath. Usa -Force para reemplazarlo."
}

if (-not (Test-Path $outputDirectory)) {
  New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
}

$temporaryPath = Join-Path $outputDirectory ".schema-$([guid]::NewGuid().ToString('N')).tmp.sql"

try {
  $arguments = @(
    'db',
    'dump',
    '--db-url',
    $env:SUPABASE_DB_URL,
    '--schema',
    ($Schema -join ','),
    '--file',
    $temporaryPath
  )

  & $supabase.Source @arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Supabase CLI termino con codigo $LASTEXITCODE; revisa la conexion y los permisos."
  }

  if (-not (Test-Path $temporaryPath) -or (Get-Item $temporaryPath).Length -eq 0) {
    throw 'Supabase CLI no genero un dump SQL con contenido.'
  }

  Move-Item -LiteralPath $temporaryPath -Destination $resolvedOutputPath -Force:$Force
  Write-Host "Dump de esquema generado: $resolvedOutputPath"
}
finally {
  if (Test-Path $temporaryPath) {
    Remove-Item -LiteralPath $temporaryPath -Force
  }
}
