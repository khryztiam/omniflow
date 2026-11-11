[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'High')]
param(
  [string]$SchemaPath = (Join-Path $PSScriptRoot 'schema.sql')
)

$ErrorActionPreference = 'Stop'

$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
  throw 'No se encontro psql. Instala PostgreSQL Client Tools y vuelve a ejecutar el script.'
}

if ([string]::IsNullOrWhiteSpace($env:SUPABASE_TARGET_DB_URL)) {
  throw 'Define SUPABASE_TARGET_DB_URL en esta sesion con la conexion de la base destino.'
}

$resolvedSchemaPath = [System.IO.Path]::GetFullPath($SchemaPath)
if (-not (Test-Path -LiteralPath $resolvedSchemaPath -PathType Leaf)) {
  throw "No se encontro el dump de esquema: $resolvedSchemaPath"
}

if ($PSCmdlet.ShouldProcess('Base Supabase destino', "Aplicar esquema desde $resolvedSchemaPath")) {
  & $psql.Source `
    '--no-psqlrc' `
    '--set=ON_ERROR_STOP=1' `
    '--dbname' $env:SUPABASE_TARGET_DB_URL `
    '--file' $resolvedSchemaPath

  if ($LASTEXITCODE -ne 0) {
    throw "psql termino con codigo $LASTEXITCODE; la transaccion fue revertida si el servidor soporta transacciones DDL."
  }

  Write-Host "Esquema aplicado desde: $resolvedSchemaPath"
}
