# Rafraichit le jeton Entra ID utilise par /api/conseil (sans FOUNDRY_KEY).
#
# Usage :
#   .\rafraichir-jeton-expert-galaxy.ps1
#   .\rafraichir-jeton-expert-galaxy.ps1 -Nom portail-resistance -Rg RG-AI-DEMO
#   .\rafraichir-jeton-expert-galaxy.ps1 -FoundryEndpoint "https://.../responses"

param(
  [string]$Nom = 'portail-resistance',
  [string]$Rg = 'RG-AI-DEMO',
  [string]$FoundryEndpoint = 'https://DEMO-AI-PP.services.ai.azure.com/api/projects/DEMO-AI-PP/agents/Expert-Galaxy/endpoint/protocols/openai/responses'
)

$ErrorActionPreference = 'Stop'

Write-Host "1/4  Verification de la session Azure..." -ForegroundColor Cyan
$compte = az account show --query "{tenantId:tenantId, user:user.name}" -o json | ConvertFrom-Json
if (-not $compte) { throw "Connexion Azure absente. Lancez 'az login'." }
Write-Host "     Connecte en tant que $($compte.user)" -ForegroundColor DarkGray

Write-Host "`n2/4  Recuperation d'un jeton Entra ID (Azure AI Foundry)..." -ForegroundColor Cyan
$jeton = az account get-access-token `
  --scope "https://ai.azure.com/.default" `
  --query "accessToken" -o tsv
if (-not $jeton) { throw "Impossible de recuperer le jeton d'acces." }

Write-Host "`n3/4  Ecriture des parametres SWA..." -ForegroundColor Cyan
$settings = @("FOUNDRY_TOKEN=$jeton", "FOUNDRY_API_VERSION=v1")
if ($FoundryEndpoint) { $settings += "FOUNDRY_ENDPOINT=$FoundryEndpoint" }
az staticwebapp appsettings set `
  --name $Nom `
  --resource-group $Rg `
  --setting-names @settings | Out-Null

Write-Host "     Jeton mis a jour sur $Nom." -ForegroundColor Green

Write-Host "`n4/4  Sonde API..." -ForegroundColor Cyan
$hote = az staticwebapp show --name $Nom --resource-group $Rg --query "defaultHostname" -o tsv
if (-not $hote) { throw "SWA '$Nom' introuvable dans '$Rg'." }
$url = "https://$hote/"
Start-Sleep -Seconds 5
$ping = Invoke-RestMethod -Uri "${url}api/ping" -TimeoutSec 30
Write-Host "     endpoint_present=$($ping.endpoint_present)  cle_presente=$($ping.cle_presente)  jeton_present=$($ping.jeton_present)" -ForegroundColor Green
Write-Host ""
Write-Host "OK : retestez maintenant le chat Expert Galaxy." -ForegroundColor Green
Write-Host "URL : $url"
