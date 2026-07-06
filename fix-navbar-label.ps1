$path = ".\frontend-tech\src\components\layout\Navbar.jsx"
$content = Get-Content $path -Raw -Encoding UTF8

$content = $content -replace "Découvrir SonTech", "Découvrir Urban Beauty"
$content = $content -replace "(?<!Découvrir )SonTech", "Urban Beauty"

Set-Content -Path $path -Value $content -Encoding UTF8

Write-Host "Libelles corriges dans : $path"