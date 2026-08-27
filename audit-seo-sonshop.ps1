# ============================================================
# Audit SEO / Indexation - sonshop.beauty
# A executer dans PowerShell (pas besoin de droits admin)
# Usage : .\audit-seo-sonshop.ps1
# ============================================================

$domain = "https://www.sonshop.beauty"
$ua     = "Mozilla/5.0 (compatible; AuditBot/1.0)"

function Write-Section($title) {
    Write-Host "`n=================================================" -ForegroundColor Cyan
    Write-Host " $title" -ForegroundColor Cyan
    Write-Host "=================================================" -ForegroundColor Cyan
}

# ------------------------------------------------------------
# 1. robots.txt
# ------------------------------------------------------------
Write-Section "1. robots.txt"
try {
    $robots = Invoke-WebRequest -Uri "$domain/robots.txt" -UserAgent $ua -UseBasicParsing
    Write-Host "Status: $($robots.StatusCode)" -ForegroundColor Green
    Write-Host $robots.Content
} catch {
    Write-Host "ERREUR : robots.txt introuvable ou inaccessible -> $($_.Exception.Message)" -ForegroundColor Red
}

# ------------------------------------------------------------
# 2. sitemap.xml (plusieurs emplacements courants)
# ------------------------------------------------------------
Write-Section "2. sitemap.xml"
$sitemapPaths = @("/sitemap.xml", "/sitemap_index.xml", "/sitemap-0.xml")
$sitemapFound = $false
foreach ($path in $sitemapPaths) {
    try {
        $sm = Invoke-WebRequest -Uri "$domain$path" -UserAgent $ua -UseBasicParsing -ErrorAction Stop
        Write-Host "Trouve : $domain$path (Status $($sm.StatusCode))" -ForegroundColor Green
        Write-Host $sm.Content.Substring(0, [Math]::Min(1000, $sm.Content.Length))
        $sitemapFound = $true
        break
    } catch {
        Write-Host "Absent : $domain$path" -ForegroundColor DarkYellow
    }
}
if (-not $sitemapFound) {
    Write-Host "ATTENTION : aucun sitemap trouve aux emplacements standards." -ForegroundColor Red
}

# ------------------------------------------------------------
# 3. HTML brut recu par un crawler (SANS JS) - le test le plus important
# ------------------------------------------------------------
Write-Section "3. HTML brut de la page d'accueil (vue d'un crawler, sans JS)"
try {
    $home = Invoke-WebRequest -Uri "$domain/" -UserAgent $ua -UseBasicParsing
    $html = $home.Content

    Write-Host "Status HTTP : $($home.StatusCode)"
    Write-Host "Taille du HTML brut : $($html.Length) caracteres"

    # Cherche le titre et la meta description dans le HTML BRUT
    $titleMatch = [regex]::Match($html, "<title>(.*?)</title>")
    $descMatch  = [regex]::Match($html, 'name="description"\s+content="([^"]*)"')
    $h1Match    = [regex]::Match($html, "<h1[^>]*>(.*?)</h1>")

    Write-Host "`n<title> trouve dans le HTML brut : $($titleMatch.Success)" -ForegroundColor $(if($titleMatch.Success){"Green"}else{"Red"})
    if ($titleMatch.Success) { Write-Host "  -> $($titleMatch.Groups[1].Value)" }

    Write-Host "meta description trouvee dans le HTML brut : $($descMatch.Success)" -ForegroundColor $(if($descMatch.Success){"Green"}else{"Red"})
    if ($descMatch.Success) { Write-Host "  -> $($descMatch.Groups[1].Value)" }

    Write-Host "<h1> trouve dans le HTML brut : $($h1Match.Success)" -ForegroundColor $(if($h1Match.Success){"Green"}else{"Red"})

    # Compte le nombre de liens produits visibles SANS JS
    $productLinks = [regex]::Matches($html, 'href="[^"]*\/products\/[^"]*"')
    Write-Host "Liens produits visibles dans le HTML brut : $($productLinks.Count)" -ForegroundColor $(if($productLinks.Count -gt 0){"Green"}else{"Red"})

    if ($productLinks.Count -eq 0 -and -not $titleMatch.Success) {
        Write-Host "`n>>> DIAGNOSTIC : le contenu semble genere UNIQUEMENT en JavaScript cote client." -ForegroundColor Red
        Write-Host ">>> Un crawler qui n'execute pas le JS (ou l'execute mal) verra une page quasi vide." -ForegroundColor Red
        Write-Host ">>> C'est tres probablement la cause principale du probleme d'indexation." -ForegroundColor Red
    } else {
        Write-Host "`n>>> Bon signe : le contenu textuel est present directement dans le HTML (SSR/pre-rendu)." -ForegroundColor Green
    }
} catch {
    Write-Host "ERREUR lors de la recuperation de la page d'accueil -> $($_.Exception.Message)" -ForegroundColor Red
}

# ------------------------------------------------------------
# 4. Donnees structurees JSON-LD
# ------------------------------------------------------------
Write-Section "4. Donnees structurees (Schema.org / JSON-LD)"
try {
    $jsonLd = [regex]::Matches($html, '<script type="application/ld\+json">(.*?)</script>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    Write-Host "Blocs JSON-LD trouves : $($jsonLd.Count)" -ForegroundColor $(if($jsonLd.Count -gt 0){"Green"}else{"Red"})
    foreach ($block in $jsonLd) {
        Write-Host $block.Groups[1].Value.Substring(0, [Math]::Min(300, $block.Groups[1].Value.Length))
        Write-Host "---"
    }
    if ($jsonLd.Count -eq 0) {
        Write-Host "ATTENTION : aucune donnee structuree (Product, Organization, WebSite) detectee." -ForegroundColor Red
    }
} catch {
    Write-Host "Impossible d'analyser le JSON-LD." -ForegroundColor Red
}

# ------------------------------------------------------------
# 5. Balise canonical
# ------------------------------------------------------------
Write-Section "5. Balise canonical"
$canonicalMatch = [regex]::Match($html, 'rel="canonical"\s+href="([^"]*)"')
if ($canonicalMatch.Success) {
    Write-Host "Canonical trouve : $($canonicalMatch.Groups[1].Value)" -ForegroundColor Green
} else {
    Write-Host "Aucune balise canonical detectee (recommande pour eviter le duplicate content www / non-www)." -ForegroundColor DarkYellow
}

# ------------------------------------------------------------
# 6. Headers HTTP (cache, redirections, serveur)
# ------------------------------------------------------------
Write-Section "6. Headers HTTP"
try {
    $headers = Invoke-WebRequest -Uri "$domain/" -UserAgent $ua -UseBasicParsing
    $headers.Headers.GetEnumerator() | ForEach-Object { Write-Host "$($_.Key): $($_.Value)" }
} catch {
    Write-Host "Impossible de recuperer les headers." -ForegroundColor Red
}

# ------------------------------------------------------------
# 7. Redirection www vs non-www + HTTP vs HTTPS
# ------------------------------------------------------------
Write-Section "7. Coherence des URLs (www / non-www / http / https)"
$variants = @(
    "http://sonshop.beauty",
    "https://sonshop.beauty",
    "http://www.sonshop.beauty",
    "https://www.sonshop.beauty"
)
foreach ($v in $variants) {
    try {
        $r = Invoke-WebRequest -Uri $v -UserAgent $ua -UseBasicParsing -MaximumRedirection 0 -ErrorAction Stop
        Write-Host "$v -> Status $($r.StatusCode) (pas de redirection)" -ForegroundColor DarkYellow
    } catch {
        $resp = $_.Exception.Response
        if ($resp) {
            $status = [int]$resp.StatusCode
            $location = $resp.Headers["Location"]
            Write-Host "$v -> Status $status, redirige vers : $location" -ForegroundColor Green
        } else {
            Write-Host "$v -> ERREUR : $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# ------------------------------------------------------------
# 8. DNS
# ------------------------------------------------------------
Write-Section "8. Resolution DNS"
try {
    Resolve-DnsName -Name "sonshop.beauty" -Type A | Format-Table -AutoSize
    Resolve-DnsName -Name "sonshop.beauty" -Type CNAME -ErrorAction SilentlyContinue | Format-Table -AutoSize
} catch {
    Write-Host "Erreur DNS : $($_.Exception.Message)" -ForegroundColor Red
}

Write-Section "FIN DE L'AUDIT"
Write-Host "Copiez-collez la sortie complete si vous voulez que je l'analyse en detail." -ForegroundColor Cyan