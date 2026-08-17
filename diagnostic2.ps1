# =========================================================
# Script de diagnostic UrbanBeauty - PARTIE 2
# Usage : PS> cd C:\UrbanBeauty ; .\diagnostic2.ps1
# Complete le fichier diagnostic_output.txt (ajoute a la suite)
# =========================================================

$root = "C:\UrbanBeauty"
$frontend = Join-Path $root "frontend"
$backend  = Join-Path $root "backend"
$outFile  = Join-Path $root "diagnostic_output.txt"

Add-Content -Path $outFile -Value "`n`n`n=== DIAGNOSTIC PARTIE 2 - $(Get-Date) ==="

function Write-Section {
    param([string]$title, [scriptblock]$block)
    Add-Content -Path $outFile -Value "`n`n########################################"
    Add-Content -Path $outFile -Value "### $title"
    Add-Content -Path $outFile -Value "########################################"
    try {
        $result = & $block
        if ($result) {
            $result | Out-String | Add-Content -Path $outFile
        } else {
            Add-Content -Path $outFile -Value "(aucun resultat)"
        }
    } catch {
        Add-Content -Path $outFile -Value "ERREUR: $($_.Exception.Message)"
    }
}

Set-Location $frontend

Write-Section "20. Contenu COMPLET de Checkout.jsx" {
    Get-Content "src\pages\cart\Checkout.jsx" -Raw -ErrorAction SilentlyContinue
}

Write-Section "21. getAvailablePaymentMethods (definition complete)" {
    Get-ChildItem -Recurse -Include *.jsx,*.js -Path "src" | Select-String -Pattern "getAvailablePaymentMethods" -Context 15,15 -CaseSensitive:$false
}

Write-Section "22. Section Groupage complete dans AdminSettings.jsx (lignes 260-300)" {
    Get-Content "src\pages\admin\AdminSettings.jsx" -ErrorAction SilentlyContinue | Select-Object -Skip 259 -First 45
}

Write-Section "23. Contenu de constants.js" {
    Get-Content "src\utils\constants.js" -ErrorAction SilentlyContinue
}

Set-Location $backend

Write-Section "24. Recherche CONGO_GROUPAGE cote backend (compteur eventuel)" {
    Get-ChildItem -Recurse -Include *.js -Path "src" | Select-String -Pattern "CONGO_GROUPAGE" -CaseSensitive:$false -Context 3,3
}

Write-Section "25. Recherche 'groupage' cote backend (routes/controllers/services)" {
    Get-ChildItem -Recurse -Include *.js -Path "src" | Select-String -Pattern "groupage" -CaseSensitive:$false | Select-Object Path, LineNumber, Line
}

Write-Section "26. Modele Order dans schema.prisma (champs destination/quantite)" {
    Select-String -Path "prisma\schema.prisma" -Pattern "model Order " -Context 0,40 -ErrorAction SilentlyContinue
}

Write-Section "27. Routes commandes (orders) existantes" {
    Get-ChildItem -Recurse -Include *.js -Path "src\modules\orders" -ErrorAction SilentlyContinue | Select-String -Pattern "router\.(get|post|put|patch)" -CaseSensitive:$false
}

Set-Location $root
Write-Host "`nTermine ! Nouvelles sections ajoutees a : $outFile" -ForegroundColor Green
Write-Host "Copie-colle a nouveau le contenu complet a Claude." -ForegroundColor Yellow
