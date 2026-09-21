# Comptoir de la Bordure -> Azure Static Web App.
#
#   .\deployer.ps1                      -> deploie vers la SWA par defaut
#   .\deployer.ps1 -Ouvrir              -> idem, puis ouvre le navigateur
#   .\deployer.ps1 -Nom portail-resistance -Rg RG-DEMO-PP
#                                       -> cible une autre SWA
#
# Le nom d'hote est lu depuis Azure : aucune URL en dur, le script suit la SWA.

param(
  [string]$Nom = 'portail-repetition',
  [string]$Rg  = 'RG-REPETITION',
  [switch]$Ouvrir
)

$ErrorActionPreference = 'Stop'

Push-Location $PSScriptRoot
try {
  Write-Host "1/4  Construction (tsc --noEmit && vite build) ..." -ForegroundColor Cyan
  if (-not (Test-Path node_modules)) {
    Write-Host "     node_modules absent - npm install ..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) { throw "npm install a echoue." }
  }
  npm run build
  if ($LASTEXITCODE -ne 0) { throw "Le build a echoue - rien n'est parti en ligne." }

  Write-Host "`n2/4  Lecture de la cible Azure ..." -ForegroundColor Cyan
  $hote = az staticwebapp show --name $Nom --resource-group $Rg `
            --query "defaultHostname" -o tsv 2>$null
  if (-not $hote) {
    throw "SWA '$Nom' introuvable dans '$Rg'. Verifie 'az account show' et le tenant."
  }
  $url = "https://$hote/"
  Write-Host "     $url" -ForegroundColor DarkGray

  Write-Host "`n3/4  Deploiement ..." -ForegroundColor Cyan
  $token = az staticwebapp secrets list --name $Nom --resource-group $Rg `
             --query "properties.apiKey" -o tsv
  if (-not $token) { throw "Jeton de deploiement introuvable." }

  $argsSwa = @('deploy', '.\dist', '--env', 'production', '--no-use-keychain')
  if (Test-Path .\api) {
    # La fonction /api/conseil detient la cle Foundry : elle DOIT partir avec le
    # site. Sans ce flag, le deploiement remplace le site sans l'API et toutes
    # les routes /api repondent 500 "Backend call failure".
    $argsSwa += @('--api-location', '.\api')
  } else {
    Write-Host "     ATTENTION : dossier api absent, le site partira sans /api/conseil." -ForegroundColor Yellow
  }

  $env:SWA_CLI_DEPLOYMENT_TOKEN = $token
  npx --yes @azure/static-web-apps-cli@latest @argsSwa
  $env:SWA_CLI_DEPLOYMENT_TOKEN = $null
  if ($LASTEXITCODE -ne 0) { throw "Le deploiement a echoue." }

  Write-Host "`n4/4  Verification ..." -ForegroundColor Cyan
  Start-Sleep -Seconds 8
  $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 40
  Write-Host "     site   : HTTP $($r.StatusCode) - $([math]::Round($r.Content.Length/1KB,1)) Ko" -ForegroundColor Green

  if (Test-Path .\api) {
    # La fonction managee met une bonne minute a demarrer apres un deploiement.
    # On reessaie plutot que de conclure trop vite a un echec.
    Write-Host "     api    : demarrage de la fonction ..." -ForegroundColor DarkGray -NoNewline
    $sonde = $null
    foreach ($essai in 1..10) {
      Start-Sleep -Seconds 12
      try { $sonde = Invoke-RestMethod -Uri "$url`api/ping" -TimeoutSec 30; break }
      catch { Write-Host "." -ForegroundColor DarkGray -NoNewline }
    }
    Write-Host ""
    if ($sonde) {
      Write-Host "     api    : OK (node $($sonde.node), cle $(if ($sonde.cle_presente) {'presente'} else {'ABSENTE'}))" -ForegroundColor Green
    } else {
      Write-Host "     api    : ECHEC apres 2 min - /api/ping ne repond pas." -ForegroundColor Red
      Write-Host "              Le site est en ligne mais Expert Galaxy ne marchera pas." -ForegroundColor Red
    }
  }

  Write-Host "`n     $url`n" -ForegroundColor Green

  if ($Ouvrir) { Start-Process $url }
}
finally { Pop-Location }
