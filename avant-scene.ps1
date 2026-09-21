# AVANT DE MONTER SUR SCENE — verification complete.
#
#   .\avant-scene.ps1                  -> depose le jeton, attend, verifie tout
#   .\avant-scene.ps1 -SansJeton       -> verifie seulement, sans toucher au jeton
#   .\avant-scene.ps1 -Nom portail-resistance -Rg RG-DEMO-PP
#
# A LANCER AU MOINS 10 MINUTES AVANT DE MONTER.
#
# POURQUOI SI TOT
# Deposer le jeton Fabric modifie les parametres de la Static Web App, ce qui
# redemarre la fonction serveur. Elle reste injoignable environ cinq minutes.
# C'est mesure, pas estime.

param(
  [string]$Nom = 'portail-repetition',
  [string]$Rg  = 'RG-REPETITION',
  [switch]$SansJeton
)

$ErrorActionPreference = 'Continue'
$echecs = @()

function Etape([string]$titre) {
  Write-Host "`n$titre" -ForegroundColor Cyan
}
function Bon([string]$message) {
  Write-Host "  OK    $message" -ForegroundColor Green
}
function Mauvais([string]$message, [string]$remede) {
  Write-Host "  ECHEC $message" -ForegroundColor Red
  Write-Host "        -> $remede" -ForegroundColor Yellow
  $script:echecs += $message
}

function Sonder([string]$adresse, [int]$secondes = 20) {
  return Invoke-RestMethod $adresse -TimeoutSec $secondes -DisableKeepAlive
}

function Poster([string]$adresse, [hashtable]$corps, [int]$secondes = 60) {
  return Invoke-RestMethod $adresse -Method Post -ContentType 'application/json' `
           -Body ($corps | ConvertTo-Json -Compress) -TimeoutSec $secondes -DisableKeepAlive
}

Write-Host "`n=============================================" -ForegroundColor White
Write-Host " QUE LES AGENTS SOIENT AVEC VOUS - controle" -ForegroundColor White
Write-Host "=============================================" -ForegroundColor White

# --- 1. le bon compte Azure ------------------------------------------------
Etape "1/6  Compte Azure"
$compte = az account show --query "{nom:name,user:user.name,tenant:tenantId}" -o json 2>$null | ConvertFrom-Json
if (-not $compte) {
  Mauvais "pas connecte a Azure" "az login  (tenant PHILPDEMO)"
} else {
  Bon "$($compte.user) sur '$($compte.nom)'"
  if ($compte.tenant -ne 'fcb99ad6-aed0-4c6b-bf46-45e705c014c5') {
    Mauvais "mauvais tenant" "az login --tenant fcb99ad6-aed0-4c6b-bf46-45e705c014c5"
  }
}

# --- 2. la Static Web App --------------------------------------------------
Etape "2/6  Static Web App"
$hote = az staticwebapp show --name $Nom --resource-group $Rg --query defaultHostname -o tsv 2>$null
if (-not $hote) {
  Mauvais "SWA '$Nom' introuvable dans '$Rg'" "verifier le nom et l'abonnement"
  Write-Host "`nControle interrompu.`n" -ForegroundColor Red
  return
}
$url = "https://$hote/"
Bon $url

# --- 3. le jeton Fabric ----------------------------------------------------
Etape "3/6  Jeton Fabric du Quartier-Maitre"
$UrlMcp = 'https://api.fabric.microsoft.com/v1/mcp/workspaces/' +
          'd7031bfc-b115-48d7-ace4-56601df64f30/dataagents/' +
          '492cbbe4-c5e3-4873-8787-27aaf226a7aa/agent'
$jeton = $null
if ($SansJeton) {
  Write-Host "  (jeton non touche, -SansJeton)" -ForegroundColor DarkGray
} else {
  $jeton = az account get-access-token --resource https://api.fabric.microsoft.com --query accessToken -o tsv 2>$null
}
if (-not $SansJeton -and -not $jeton) {
  Mauvais "jeton Fabric indisponible" "az login sur le tenant PHILPDEMO"
} elseif ($jeton) {
  # Le champ expiresOn de l'az CLI melange les fuseaux et affiche une heure
  # deja passee : on lit l'echeance directement dans le jeton.
  $charge = $jeton.Split('.')[1]
  $charge = $charge.PadRight([math]::Ceiling($charge.Length / 4) * 4, '=').Replace('-', '+').Replace('_', '/')
  $revendications = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($charge)) | ConvertFrom-Json
  $echeance = [DateTimeOffset]::FromUnixTimeSeconds($revendications.exp).LocalDateTime
  $minutes = [math]::Round(($echeance - (Get-Date)).TotalMinutes)

  az staticwebapp appsettings set --name $Nom --resource-group $Rg `
    --setting-names "FABRIC_TOKEN=$jeton" "FABRIC_MCP_URL=$UrlMcp" --output none 2>$null

  if ($minutes -lt 20) {
    Mauvais "jeton valide seulement $minutes min" "az logout puis az login, et relancer ce script"
  } else {
    Bon "depose, valide $minutes min (jusqu'a $($echeance.ToString('HH:mm')))"
  }

  if (-not $SansJeton) {
    Write-Host "`n        Le depot redemarre la fonction serveur." -ForegroundColor Yellow
    Write-Host "        Elle est injoignable environ cinq minutes. Patientez." -ForegroundColor Yellow
    foreach ($restant in 5..1) {
      Write-Host "        reprise dans $restant min ..." -ForegroundColor DarkGray
      Start-Sleep -Seconds 60
    }
  }
}

# --- 4. la fonction managee ------------------------------------------------
Etape "4/6  Fonction serveur (/api) - redemarrage en cours, jusqu'a 4 min"
$sonde = $null
foreach ($essai in 1..26) {
  try { $sonde = Sonder "${url}api/ping"; break }
  catch { Write-Host "." -NoNewline -ForegroundColor DarkGray; Start-Sleep -Seconds 10 }
}
Write-Host ""
if (-not $sonde) {
  Mauvais "/api/ping ne repond pas" ".\deployer.ps1 -Nom $Nom -Rg $Rg, puis relancer ce script"
} else {
  Bon "en ligne (node $($sonde.node))"
  if (-not $sonde.cle_presente) { Mauvais "FOUNDRY_KEY absente" "voir le README" }
}

# --- 5. Expert Galaxy ------------------------------------------------------
Etape "5/6  Expert Galaxy (Foundry)"
try {
  $chrono = [Diagnostics.Stopwatch]::StartNew()
  $r = Poster "${url}api/conseil" @{ question = 'Qui sont les Veilleurs ?' } 90
  $chrono.Stop()
  Bon "repond en $([math]::Round($chrono.Elapsed.TotalSeconds,1)) s (version $($r.version))"
} catch {
  Mauvais "ne repond pas" "verifier FOUNDRY_KEY dans les parametres de la SWA"
}

# --- 6. Quartier-Maitre ----------------------------------------------------
Etape "6/6  Quartier-Maitre (Fabric) - comptez 60 a 90 s"
try {
  $chrono = [Diagnostics.Stopwatch]::StartNew()
  $depart = Poster "${url}api/quartier-maitre" @{ question = 'Combien de produits vendus ?' } 40
  $r = $null
  while ($chrono.Elapsed.TotalSeconds -lt 170) {
    Start-Sleep -Seconds 6
    $r = Poster "${url}api/quartier-maitre" @{ id = $depart.id } 40
    if ($r.statut -ne 'en_cours') { break }
    Write-Host "." -NoNewline -ForegroundColor DarkGray
  }
  $chrono.Stop()
  Write-Host ""

  if (-not $r -or $r.statut -eq 'en_cours') {
    Mauvais "pas de reponse en 3 min" "relancer, ou basculer la demo dans Fabric"
  } elseif ($r.texte -match '1\s*198') {
    Bon "repond en $([math]::Round($chrono.Elapsed.TotalSeconds,1)) s, chiffre attendu (1 198)"
    if ($r.texte -match '(?i)alerte|rupture|stock') { Bon "l'alerte stock sort toute seule" }
    else { Write-Host "  NOTE  pas d'alerte stock cette fois - relance prevue sur scene" -ForegroundColor Yellow }
  } else {
    Write-Host "  NOTE  repond en $([math]::Round($chrono.Elapsed.TotalSeconds,1)) s mais le total differe de 1 198" -ForegroundColor Yellow
    Write-Host "        Ne pas s'y arreter sur scene : personne ne connait le vrai chiffre." -ForegroundColor DarkGray
  }
} catch {
  Mauvais "erreur pendant l'appel" "relancer .\avant-scene.ps1"
}

# --- verdict ---------------------------------------------------------------
Write-Host "`n=============================================" -ForegroundColor White
if ($echecs.Count -eq 0) {
  Write-Host " TOUT EST PRET" -ForegroundColor Green
  Write-Host "=============================================" -ForegroundColor White
  Write-Host "`n  Le site      : $url"
  Write-Host "  Le jeton     : valide environ une heure"
  Write-Host "  Sur scene    : 60 a 90 s d'attente pour le Quartier-Maitre"
  Write-Host "  A RETENIR    : deposer le jeton coupe l'API ~5 min. Lancez ce"
  Write-Host "                 script au moins 10 minutes avant de monter."
  Write-Host "  Verif rapide : .\avant-scene.ps1 -SansJeton  (ne coupe rien)`n"
  Write-Host "  Si ca casse  : git checkout secours puis .\deployer.ps1`n"
} else {
  Write-Host " $($echecs.Count) PROBLEME(S) A REGLER" -ForegroundColor Red
  Write-Host "=============================================" -ForegroundColor White
  $echecs | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
  Write-Host ""
}
