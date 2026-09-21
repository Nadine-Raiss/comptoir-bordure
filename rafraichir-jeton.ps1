# Rafraichit le jeton d'acces Fabric du Quartier-Maitre.
#
#   .\rafraichir-jeton.ps1
#   .\rafraichir-jeton.ps1 -Nom portail-resistance -Rg RG-DEMO-PP
#
# POURQUOI CE SCRIPT EXISTE
# Un data agent Fabric publie n'accepte pas de cle d'API : il exige une
# identite utilisateur deleguee. Le jeton correspondant vit environ une heure.
#
# A LANCER JUSTE AVANT DE MONTER SUR SCENE. Dix secondes.

param(
  [string]$Nom = 'portail-repetition',
  [string]$Rg  = 'RG-REPETITION',
  [switch]$Tester
)

$ErrorActionPreference = 'Stop'

$UrlMcp = 'https://api.fabric.microsoft.com/v1/mcp/workspaces/' +
          'd7031bfc-b115-48d7-ace4-56601df64f30/dataagents/' +
          '492cbbe4-c5e3-4873-8787-27aaf226a7aa/agent'

Write-Host "1/3  Obtention du jeton Fabric ..." -ForegroundColor Cyan
$jeton = az account get-access-token --resource https://api.fabric.microsoft.com `
           --query accessToken -o tsv
if (-not $jeton) { throw "Jeton introuvable. Lancez 'az login' sur le tenant PHILPDEMO." }

$expire = az account get-access-token --resource https://api.fabric.microsoft.com `
            --query expiresOn -o tsv
Write-Host "     valide jusqu'a $expire" -ForegroundColor Green

Write-Host "`n2/3  Verification de l'acces au data agent ..." -ForegroundColor Cyan
$corps = @{
  jsonrpc = '2.0'; id = 1; method = 'initialize'
  params  = @{ protocolVersion = '2025-06-18'; capabilities = @{}
               clientInfo = @{ name = 'rafraichir-jeton'; version = '1.0.0' } }
} | ConvertTo-Json -Depth 6 -Compress

try {
  $r = Invoke-WebRequest -Uri $UrlMcp -Method Post -TimeoutSec 60 -UseBasicParsing `
         -Headers @{ Authorization = "Bearer $jeton"
                     Accept = 'application/json, text/event-stream' } `
         -ContentType 'application/json' -Body $corps
  Write-Host "     le Quartier-Maitre repond (HTTP $($r.StatusCode))" -ForegroundColor Green
} catch {
  throw "Le data agent ne repond pas : $($_.Exception.Message)"
}

Write-Host "`n3/3  Depot du jeton dans $Nom ..." -ForegroundColor Cyan
az staticwebapp appsettings set --name $Nom --resource-group $Rg `
  --setting-names "FABRIC_TOKEN=$jeton" "FABRIC_MCP_URL=$UrlMcp" `
  --output none
Write-Host "     depose (chiffre cote Azure, jamais dans le depot)" -ForegroundColor Green

if ($Tester) {
  Write-Host "`n     Test de bout en bout (comptez 60 a 90 s) ..." -ForegroundColor Cyan
  $hote = az staticwebapp show --name $Nom --resource-group $Rg --query defaultHostname -o tsv
  Start-Sleep -Seconds 45
  try {
    $rep = Invoke-RestMethod -Uri "https://$hote/api/quartier-maitre" -Method Post `
             -ContentType 'application/json' -TimeoutSec 150 `
             -Body (@{ question = 'Combien de produits vendus ?' } | ConvertTo-Json)
    Write-Host "     OK : $($rep.texte.Substring(0, [Math]::Min(140, $rep.texte.Length)))..." -ForegroundColor Green
  } catch {
    Write-Host "     Pas encore pret. Reessayez dans une minute." -ForegroundColor Yellow
  }
}

Write-Host "`nLe jeton expire dans environ une heure. Relancez ce script si besoin.`n" -ForegroundColor DarkGray
