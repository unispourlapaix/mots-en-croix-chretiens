# Liste des fichiers à renommer manuellement
$renameMappings = @{
    "C'est-mon-Jesus-he.mp3" = "C-est-mon-Jesus-he.mp3"
    "Dis-moi-Oui-Aujourd'hui.mp3" = "Dis-moi-Oui-Aujourd-hui.mp3"
    "Dis-moi-Oui-Aujourd'hui1.mp3" = "Dis-moi-Oui-Aujourd-hui1.mp3"
    "Elle-m'a-dit-Il-est-vivant-Il-est-Dieu-puissant-notre-roi-sauveur.mp3" = "Elle-m-a-dit-Il-est-vivant-Il-est-Dieu-puissant-notre-roi-sauveur.mp3"
    "Il-m'a-choisi-pour-porter-la-bonne-nouvelle.mp3" = "Il-m-a-choisi-pour-porter-la-bonne-nouvelle.mp3"
    "J'ai-besoin-de-toi.mp3" = "J-ai-besoin-de-toi.mp3"
    "J'ai-soif-de-cet-amour1.mp3" = "J-ai-soif-de-cet-amour1.mp3"
    "J'ai-trouve-un-tresor.mp3" = "J-ai-trouve-un-tresor.mp3"
    "Je-n'ai-point-honte-de-l'evangile.mp3" = "Je-n-ai-point-honte-de-l-evangile.mp3"
    "La-vie-eternelle-t'appelle.mp3" = "La-vie-eternelle-t-appelle.mp3"
    "Le torrent de l'Arnon.mp3" = "Le-torrent-de-l-Arnon-v2.mp3"
    "Le-torrent-de-l'Arnon.mp3" = "Le-torrent-de-l-Arnon.mp3"
    "L'Amour-pour-les-autres.mp3" = "L-Amour-pour-les-autres.mp3"
    "L'incontestable-pouvoir-de-la-foi.mp3" = "L-incontestable-pouvoir-de-la-foi.mp3"
    "Mon-ti-cœur-l'amou.mp3" = "Mon-ti-coeur-l-amou.mp3"
    "Nuage-d'amour.mp3" = "Nuage-d-amour.mp3"
    "N'abandonne-pas.mp3" = "N-abandonne-pas.mp3"
    "N'aie-pas-peur-Je-viens-moi-meme-a-ton-secours.mp3" = "N-aie-pas-peur-Je-viens-moi-meme-a-ton-secours.mp3"
    "N'aie-pas-peur.mp3" = "N-aie-pas-peur.mp3"
    "Qu'est-ce-que-l'amour.mp3" = "Qu-est-ce-que-l-amour.mp3"
    "Qu'est-ce-que-tu-veux.mp3" = "Qu-est-ce-que-tu-veux.mp3"
    "Revetez-vous-d'Amour.mp3" = "Revetez-vous-d-Amour.mp3"
    "Sans-charite-mon-cœur-s'eteint.mp3" = "Sans-charite-mon-coeur-s-eteint.mp3"
    "Tu-m'as-cherche.mp3" = "Tu-m-as-cherche.mp3"
    "Un-tresor-d'amour-qui-te-libere.mp3" = "Un-tresor-d-amour-qui-te-libere.mp3"
}

$basePath = "C:\Users\dream\Documents\GitHub\mots-en-croix-chretiens\public\gospel"

foreach ($oldName in $renameMappings.Keys) {
    $newName = $renameMappings[$oldName]
    $oldPath = Join-Path $basePath $oldName
    $newPath = Join-Path $basePath $newName
    
    if (Test-Path $oldPath) {
        Rename-Item -Path $oldPath -NewName $newName -Force
        Write-Host "✓ Renamed: $oldName -> $newName"
    } else {
        Write-Host "✗ Not found: $oldName"
    }
}

Write-Host "`nDone!"
