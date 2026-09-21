# REPETITION — Comptoir de la Bordure -> Static Web App jetable.
#
#   .\deployer.ps1            -> build + deploiement
#   .\deployer.ps1 -Ouvrir    -> idem, puis ouvre le navigateur
#
# La vraie demo (portail-resistance / RG-DEMO-PP) n'est JAMAIS touchee.

param([switch]$Ouvrir)

$ErrorActionPreference = 'Stop'

$Nom = 'portail-repetition'
$Rg  = 'RG-REPETITION'
$Url = 'https://polite-tree-0aa7ae810.3.azurestaticapps.net/'

Push-Location $PSScriptRoot
try {
  Write-Host "1/3  Construction (tsc --noEmit && vite build) ..." -ForegroundColor Cyan
  npm run build
  if ($LASTEXITCODE -ne 0) { throw "Le build a echoue - rien n'est parti en ligne." }

  Write-Host "`n2/3  Deploiement (REPETITION) ..." -ForegroundColor Cyan
  $token = az staticwebapp secrets list --name $Nom --resource-group $Rg `
             --query "properties.apiKey" -o tsv
  if (-not $token) { throw "Jeton introuvable - la SWA de repetition existe-t-elle encore ?" }

  $env:SWA_CLI_DEPLOYMENT_TOKEN = $token
  npx --yes @azure/static-web-apps-cli@latest deploy .\dist --env production --no-use-keychain
  $env:SWA_CLI_DEPLOYMENT_TOKEN = $null
  if ($LASTEXITCODE -ne 0) { throw "Le deploiement a echoue." }

  Write-Host "`n3/3  Verification ..." -ForegroundColor Cyan
  Start-Sleep -Seconds 8
  $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 40
  Write-Host "     HTTP $($r.StatusCode) - $([math]::Round($r.Content.Length/1KB,1)) Ko" -ForegroundColor Green
  Write-Host "`n     $Url`n" -ForegroundColor Green

  if ($Ouvrir) { Start-Process $Url }
}
finally { Pop-Location }
