$files = Get-ChildItem "C:\Users\dream\Documents\GitHub\mots-en-croix-chretiens\public\gospel\*.mp3"
foreach ($file in $files) {
    # Remplacer apostrophe typographique ' et apostrophe standard '
    $newName = $file.Name -replace "'", "-" -replace "'", "-"
    if ($newName -ne $file.Name) {
        Rename-Item -Path $file.FullName -NewName $newName -Force
        Write-Host "Renamed: $($file.Name) -> $newName"
    }
}
Write-Host "Done!"
