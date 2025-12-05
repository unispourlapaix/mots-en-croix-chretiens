# 🚀 Démarrage Rapide

## Tester Localement

### Windows
Double-cliquez sur `dev.bat` (Python) ou `dev-node.bat` (Node.js)

### Linux/Mac
```bash
python3 -m http.server 8000
# ou
npx http-server -p 8000
```

Puis ouvrir: **http://localhost:8000**

## Déploiement GitHub Pages

```bash
# Pousser les changements
git push origin master

# Sur GitHub.com
# 1. Aller dans Settings
# 2. Scrollez jusqu'à "Pages"
# 3. Source: master branch
# 4. Save
```

Votre app sera disponible sur:
`https://votreusername.github.io/mots-en-croix-chretiens/`

## Configurer le Domaine Personnalisé

### 1. Créer le fichier CNAME
```bash
echo "mots-croix.votredomaine.com" > CNAME
git add CNAME
git commit -m "Add custom domain"
git push
```

### 2. Configurer le DNS chez votre hébergeur
```
Type: CNAME
Name: mots-croix (ou www)
Value: votreusername.github.io
TTL: 3600
```

### 3. Sur GitHub
Settings > Pages > Custom domain > Entrer votre domaine > Save

⏱️ Attendre 5-15 minutes pour la propagation DNS

## Générer les Icônes PWA

### Option 1: Outil en ligne
1. Aller sur https://realfavicongenerator.net/
2. Upload une image 512x512 (croix rose sur fond rose)
3. Télécharger le package
4. Copier les icônes dans `/icons/`

### Option 2: icon-generator.html
1. Ouvrir `icon-generator.html` dans le navigateur
2. Clic droit > Enregistrer chaque SVG
3. Convertir en PNG sur https://cloudconvert.com/svg-to-png
4. Placer dans `/icons/`

### Option 3: ImageMagick
```bash
convert source.png -resize 72x72 icons/icon-72.png
convert source.png -resize 96x96 icons/icon-96.png
convert source.png -resize 128x128 icons/icon-128.png
convert source.png -resize 144x144 icons/icon-144.png
convert source.png -resize 152x152 icons/icon-152.png
convert source.png -resize 180x180 icons/icon-180.png
convert source.png -resize 192x192 icons/icon-192.png
convert source.png -resize 384x384 icons/icon-384.png
convert source.png -resize 512x512 icons/icon-512.png
```

## Vérifier la PWA

1. Ouvrir Chrome DevTools (F12)
2. Onglet "Application"
3. Vérifier:
   - ✅ Manifest: Pas d'erreurs
   - ✅ Service Worker: Actif
   - ✅ Icons: Toutes chargées
4. Onglet "Lighthouse"
5. Générer rapport PWA
6. Score cible: > 90

## Installation sur Mobile

### Android (Chrome)
1. Ouvrir le site
2. Bannière "Installer l'application" apparaît
3. OU cliquer sur "📱 Installer l'Application"
4. OU Menu (⋮) > "Ajouter à l'écran d'accueil"

### iOS (Safari)
1. Ouvrir le site
2. Bouton Partage ⬆️
3. "Sur l'écran d'accueil"
4. Confirmer

## Ajouter une Nouvelle Langue

### 1. Dans `js/i18n.js`
```javascript
translations.de = {
    gameTitle: "🙏 Christliche Kreuzworträtsel 🙏",
    // ... autres traductions
};
```

### 2. Dans `js/gameData.js`
```javascript
gameData.de = {
    levels: [
        {
            words: [
                { word: "JESUS", clue: "Unser Retter", ... },
                // ... autres mots
            ]
        }
    ]
};
```

### 3. Ajouter le nom de la langue
Dans `i18n.js`, fonction `getLanguageName()`:
```javascript
const names = {
    fr: 'Français',
    en: 'English',
    es: 'Español',
    de: 'Deutsch'  // Nouveau
};
```

C'est tout ! Le bouton de langue apparaîtra automatiquement.

## Problèmes Courants

### Service Worker ne s'enregistre pas
- ✅ Vérifier HTTPS (ou localhost)
- ✅ Vérifier le chemin: `/service-worker.js`
- ✅ Vider le cache: DevTools > Application > Clear storage

### Bouton "Installer" n'apparaît pas
- ✅ HTTPS obligatoire (sauf localhost)
- ✅ Toutes les icônes présentes
- ✅ Manifest.json valide
- ✅ Visiter le site 30+ secondes

### Icônes ne chargent pas
- ✅ Créer le dossier `/icons/`
- ✅ Générer toutes les tailles
- ✅ Vérifier les chemins dans manifest.json

## Support

📚 Documentation complète: [PWA-INSTALL.md](PWA-INSTALL.md)
🎨 Guide design: [DESIGN.md](DESIGN.md)
🏗️ Architecture: [STRUCTURE.md](STRUCTURE.md)

---

💕 **Bon développement !** 💕
