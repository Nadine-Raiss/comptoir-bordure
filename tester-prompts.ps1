# Teste plusieurs formulations sur le data agent Fabric et chronometre.
#
#   .\tester-prompts.ps1
#
# Sert a choisir la question qu'on posera sur scene : celle qui donne la
# reponse la plus nette, dans le temps le plus court.

$UrlMcp = 'https://api.fabric.microsoft.com/v1/mcp/workspaces/' +
          'd7031bfc-b115-48d7-ace4-56601df64f30/dataagents/' +
          '492cbbe4-c5e3-4873-8787-27aaf226a7aa/agent'

$questions = @(
  'Combien de sabres laser vendus ?',
  'Combien de sabres laser avons-nous vendus, et combien en reste-t-il en stock ?',
  'Fais le point sur les sabres laser : ventes, chiffre d''affaires et stock par base.'
)

$jeton = az account get-access-token --resource https://api.fabric.microsoft.com --query accessToken -o tsv
if (-not $jeton) { throw "Jeton indisponible. Lancez az login." }

function Mcp($methode, $params, $id) {
  $corps = @{ jsonrpc = '2.0'; method = $methode }
  if ($params) { $corps.params = $params }
  if ($null -ne $id) { $corps.id = $id }

  $r = Invoke-WebRequest -Uri $UrlMcp -Method Post -TimeoutSec 200 -UseBasicParsing `
         -Headers @{ Authorization = "Bearer $jeton"
                     Accept = 'application/json, text/event-stream' } `
         -ContentType 'application/json' `
         -Body ($corps | ConvertTo-Json -Depth 10 -Compress)

  $brut = $r.Content
  if ($brut -match '(?m)^data:') {
    $brut = (($brut -split "`n" | Where-Object { $_ -match '^data:' }) `
              | ForEach-Object { $_ -replace '^data:\s*', '' }) -join ''
  }
  if ([string]::IsNullOrWhiteSpace($brut)) { return $null }
  try { return $brut | ConvertFrom-Json } catch { return $null }
}

foreach ($q in $questions) {
  Write-Host "`n===================================================" -ForegroundColor Cyan
  Write-Host " $q" -ForegroundColor Cyan
  Write-Host "===================================================" -ForegroundColor Cyan

  $chrono = [Diagnostics.Stopwatch]::StartNew()
  try {
    Mcp 'initialize' @{ protocolVersion = '2025-06-18'; capabilities = @{}
                        clientInfo = @{ name = 'test'; version = '1' } } 1 | Out-Null
    Mcp 'notifications/initialized' $null $null | Out-Null
    $outils = Mcp 'tools/list' @{} 2
    $outil = $outils.result.tools[0]
    $arg = [string](($outil.inputSchema.properties.PSObject.Properties.Name) | Select-Object -First 1)

    # Une table de hachage a cle dynamique ne se serialise pas toujours :
    # on construit un dictionnaire de chaines explicite.
    $arguments = New-Object 'System.Collections.Specialized.OrderedDictionary'
    $arguments.Add($arg, [string]$q)

    $appel = Mcp 'tools/call' @{ name = [string]$outil.name; arguments = $arguments } 3
    $chrono.Stop()

    $texte = ($appel.result.content | ForEach-Object { $_.text }) -join "`n"
    Write-Host "`n[$([math]::Round($chrono.Elapsed.TotalSeconds,1)) s]" -ForegroundColor Green
    Write-Host $texte
  } catch {
    $chrono.Stop()
    Write-Host "ECHEC apres $([math]::Round($chrono.Elapsed.TotalSeconds,1)) s : $($_.Exception.Message)" -ForegroundColor Red
  }
}
