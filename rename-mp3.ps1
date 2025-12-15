# Script pour renommer les MP3 : remplacer ' et espaces par -

$gospelPath = "public\gospel"

Get-ChildItem -Path $gospelPath -Filter "*.mp3" | ForEach-Object {
    $oldName = $_.Name
    $newName = $oldName -replace "'", "-" -replace " ", "-"
    
    if ($oldName -ne $newName) {
        Write-Host "Renommer: $oldName -> $newName"
        Rename-Item -Path $_.FullName -NewName $newName
    }
}

Write-Host "`nTerminé!"
