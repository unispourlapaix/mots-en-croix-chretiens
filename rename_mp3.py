import os
import glob

gospel_path = r"c:\Users\dream\Documents\GitHub\mots-en-croix-chretiens\public\gospel"
os.chdir(gospel_path)

# Supprimer le doublon avec espace
doublon = "Le torrent de l'Arnon.mp3"
if os.path.exists(doublon):
    os.remove(doublon)
    print(f"Supprimé: {doublon}")

# Renommer tous les MP3 avec apostrophes
for filename in glob.glob("*.mp3"):
    new_name = filename.replace("'", "-").replace("'", "-")
    
    if filename != new_name:
        os.rename(filename, new_name)
        print(f"✓ {filename} → {new_name}")

print("\n✅ Terminé!")
