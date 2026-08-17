# =========================================================
# Script de diagnostic UrbanBeauty
# A executer depuis N'IMPORTE OU (il se place lui-meme dans les bons dossiers)
# Usage : PS> cd C:\UrbanBeauty ; .\diagnostic.ps1
# Resultat : un seul fichier "diagnostic_output.txt" a la racine C:\UrbanBeauty
# =========================================================

$root = "C:\UrbanBeauty"
$frontend = Join-Path $root "frontend"
$backend  = Join-Path $root "backend"
$outFile  = Join-Path $root "diagnostic_output.txt"

# Reset du fichier de sortie
"=== DIAGNOSTIC URBANBEAUTY - $(Get-Date) ===" | Out-File -FilePath $outFile -Encoding utf8

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

Write-Section "1. 'livraison express' dans Checkout.jsx" {
    Select-String -Path "src\pages\cart\Checkout.jsx" -Pattern "livraison express" -CaseSensitive:$false -Context 5,5
}

Write-Section "2. Liens WhatsApp existants (src)" {
    Get-ChildItem -Recurse -Include *.jsx,*.js -Path "src" | Select-String -Pattern "wa\.me|whatsapp" -CaseSensitive:$false | Select-Object Path, LineNumber, Line
}

Write-Section "3. Liens mailto existants (src)" {
    Get-ChildItem -Recurse -Include *.jsx,*.js -Path "src" | Select-String -Pattern "mailto:" -CaseSensitive:$false | Select-Object Path, LineNumber, Line
}

Write-Section "4. Page/route contact" {
    Get-ChildItem -Recurse -Include *.jsx,*.js -Path "src" | Select-String -Pattern "Nous contacter|contact-page|/contact" -CaseSensitive:$false | Select-Object Path, LineNumber, Line
}

Write-Section "5. Contenu de whatsapp.utils.js" {
    Get-Content "src\utils\whatsapp.utils.js" -ErrorAction SilentlyContinue
}

Write-Section "6. 'express' dans Checkout.jsx (contexte)" {
    Select-String -Path "src\pages\cart\Checkout.jsx" -Pattern "express" -CaseSensitive:$false -Context 8,8
}

Write-Section "7. 'express' dans tout src" {
    Get-ChildItem -Recurse -Include *.jsx,*.js -Path "src" | Select-String -Pattern "express" -CaseSensitive:$false | Select-Object Path, LineNumber, Line
}

Write-Section "8. Bloc JSX destinations (Checkout.jsx, lignes 590-660)" {
    Get-Content "src\pages\cart\Checkout.jsx" -ErrorAction SilentlyContinue | Select-Object -Skip 589 -First 80
}

Write-Section "9. Numero whatsapp/phone dans constants.js" {
    Select-String -Path "src\utils\constants.js" -Pattern "whatsapp|phone|PHONE|221" -CaseSensitive:$false -ErrorAction SilentlyContinue
}

Write-Section "10. Fichiers .env (WHATSAPP / PHONE)" {
    Get-ChildItem -Path $frontend -Filter ".env*" -Force -ErrorAction SilentlyContinue | ForEach-Object {
        "--- $($_.Name) ---"
        Get-Content $_.FullName | Select-String -Pattern "WHATSAPP|PHONE"
    }
}

Write-Section "11. Numero dans Footer.jsx" {
    Select-String -Path "src\components\layout\Footer.jsx" -Pattern "wa\.me|\+221|221[0-9]{7,9}|whatsapp" -CaseSensitive:$false -ErrorAction SilentlyContinue
}

Write-Section "12. Numero dans Contact.jsx" {
    Select-String -Path "src\pages\shop\Contact.jsx" -Pattern "wa\.me|\+221|221[0-9]{7,9}|whatsapp" -CaseSensitive:$false -ErrorAction SilentlyContinue
}

Write-Section "13. Champs whatsapp/phone/contact_number/numero dans AdminSettings.jsx" {
    Select-String -Path "src\pages\admin\AdminSettings.jsx" -Pattern "whatsapp|phone|contact_number|numero" -CaseSensitive:$false -ErrorAction SilentlyContinue
}

Write-Section "14. Bouton Mobile Money (recherche large)" {
    Get-ChildItem -Recurse -Include *.jsx,*.js -Path "src" | Select-String -Pattern "mobile\s*money|MobileMoney|orange\s*money|wave" -CaseSensitive:$false | Select-Object Path, LineNumber, Line
}

Write-Section "15. Section Groupage (recherche large)" {
    Get-ChildItem -Recurse -Include *.jsx,*.js -Path "src" | Select-String -Pattern "groupage" -CaseSensitive:$false | Select-Object Path, LineNumber, Line
}

Set-Location $backend

Write-Section "16. enum OrderStatus (schema.prisma)" {
    Select-String -Path "prisma\schema.prisma" -Pattern "enum OrderStatus" -Context 0,15 -ErrorAction SilentlyContinue
}

Write-Section "17. Contenu de email.utils.js" {
    Get-Content "src\utils\email.utils.js" -ErrorAction SilentlyContinue
}

Write-Section "18. Config mail (smtp/sendgrid/resend/nodemailer)" {
    Get-ChildItem -Recurse -Include *.js -Path "src\config" -ErrorAction SilentlyContinue | Select-String -Pattern "mail|smtp|sendgrid|resend|nodemailer" -CaseSensitive:$false
}

Write-Section "19. Champs whatsapp/phone/contact_number/numero (settings.service.js)" {
    Select-String -Path "src\modules\settings\settings.service.js" -Pattern "whatsapp|phone|contact_number|numero" -CaseSensitive:$false -ErrorAction SilentlyContinue
}

Set-Location $root
Write-Host "`nTermine ! Resultats ecrits dans : $outFile" -ForegroundColor Green
Write-Host "Colle le contenu de ce fichier a Claude pour la suite." -ForegroundColor Yellow
