# Renommer tous les fichiers MP3 avec apostrophes
$gospelPath = "c:\Users\dream\Documents\GitHub\mots-en-croix-chretiens\public\gospel"
Set-Location $gospelPath

# Supprimer le doublon avec espace
if (Test-Path "Le torrent de l'Arnon.mp3") {
    Remove-Item "Le torrent de l'Arnon.mp3" -Force
    Write-Host "Supprime doublon"
}

Get-ChildItem -Filter "*.mp3" | ForEach-Object {
    $oldName = $_.Name
    $newName = $oldName -replace "'", "-"
    
    if ($oldName -ne $newName) {
        Rename-Item -LiteralPath $_.FullName -NewName $newName
        Write-Host "$oldName -> $newName"
    }
}

Write-Host "Termine!"
