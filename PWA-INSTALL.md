# 📱 Configuration PWA - Installation Web App

## 🌐 Configuration du Domaine

### Identifiant Unique
L'application utilise un identifiant unique basé sur le domaine pour éviter les conflits:
- **ID de l'app**: `/` (relatif au domaine)
- **Scope**: `/` (toute l'application)
- **Start URL**: `/` (page d'accueil)

### Fichiers Requis
```
/
├── index.html              # Page principale
├── manifest.json           # Manifeste PWA
├── service-worker.js       # Service Worker
├── css/
├── js/
└── icons/                  # Icônes PWA (à créer)
    ├── icon-72.png
    ├── icon-96.png
    ├── icon-128.png
    ├── icon-144.png
    ├── icon-152.png
    ├── icon-180.png
    ├── icon-192.png
    ├── icon-384.png
    └── icon-512.png
```

## 🎨 Génération des Icônes

### Option 1: Utiliser icon-generator.html
1. Ouvrir `icon-generator.html` dans le navigateur
2. Clic droit sur chaque SVG > "Enregistrer l'image sous"
3. Convertir en PNG avec un outil en ligne ou ImageMagick
4. Redimensionner aux tailles nécessaires

### Option 2: Outil en ligne
Utiliser [RealFaviconGenerator.net](https://realfavicongenerator.net/) avec ces paramètres:
- **Image source**: Logo avec croix rose/blanc
- **Background**: Gradient rose (#ff85c1 → #ff69b4)
- **Plateforme**: iOS, Android, Windows

### Option 3: ImageMagick (ligne de commande)
```bash
# Créer le dossier icons
mkdir icons

# Générer toutes les tailles à partir d'un SVG ou PNG haute résolution
convert icon-source.png -resize 72x72 icons/icon-72.png
convert icon-source.png -resize 96x96 icons/icon-96.png
convert icon-source.png -resize 128x128 icons/icon-128.png
convert icon-source.png -resize 144x144 icons/icon-144.png
convert icon-source.png -resize 152x152 icons/icon-152.png
convert icon-source.png -resize 180x180 icons/icon-180.png
convert icon-source.png -resize 192x192 icons/icon-192.png
convert icon-source.png -resize 384x384 icons/icon-384.png
convert icon-source.png -resize 512x512 icons/icon-512.png

# Favicons
convert icon-source.png -resize 32x32 icons/favicon-32x32.png
convert icon-source.png -resize 16x16 icons/favicon-16x16.png
```

## 🚀 Déploiement

### 1. Hébergement Recommandé

#### GitHub Pages
```bash
# Pousser sur GitHub
git push origin master

# Activer GitHub Pages
# Settings > Pages > Source: master branch
# URL: https://votreusername.github.io/mots-en-croix-chretiens/
```

#### Netlify
1. Connecter le repo GitHub
2. Build settings: Aucun build nécessaire
3. Publish directory: `/`
4. Deploy!

#### Vercel
```bash
npm install -g vercel
vercel
```

### 2. Configuration HTTPS
**Important**: PWA nécessite HTTPS (sauf localhost)
- GitHub Pages: HTTPS automatique
- Netlify: HTTPS automatique
- Vercel: HTTPS automatique
- Domaine personnalisé: Configurer SSL/TLS

### 3. Domaine Personnalisé (Optionnel)

#### Avec GitHub Pages
```
# Créer un fichier CNAME à la racine
echo "mots-croix.votredomaine.com" > CNAME
git add CNAME
git commit -m "Ajout domaine personnalisé"
git push
```

#### Configurer DNS
```
Type: CNAME
Name: mots-croix (ou @)
Value: votreusername.github.io
```

## 📲 Installation de l'App

### Android (Chrome)
1. Ouvrir le site sur Chrome mobile
2. Menu (⋮) > "Ajouter à l'écran d'accueil"
3. OU: Bannière automatique "Installer l'application"
4. OU: Bouton "📱 Installer l'Application" dans l'interface

### iOS (Safari)
1. Ouvrir le site sur Safari
2. Bouton Partage (⬆️)
3. "Sur l'écran d'accueil"
4. Confirmer

### Desktop (Chrome, Edge)
1. Icône d'installation dans la barre d'adresse
2. OU: Menu > "Installer Mots En Croix Chrétiens"
3. L'app apparaît dans le menu Démarrer/Applications

## ✅ Vérification de l'Installation PWA

### Chrome DevTools
1. Ouvrir DevTools (F12)
2. Onglet "Application"
3. Vérifier:
   - ✅ Manifest (pas d'erreurs)
   - ✅ Service Worker (actif et en cours d'exécution)
   - ✅ Icônes (toutes les tailles chargées)

### Lighthouse
1. DevTools > Lighthouse
2. Sélectionner "Progressive Web App"
3. Générer le rapport
4. Objectif: Score > 90

### Test d'installation
1. Ouvrir en navigation privée
2. Vérifier le bouton "Installer"
3. Tester l'installation
4. Vérifier le mode offline (désactiver le réseau)

## 🔧 Troubleshooting

### Le bouton "Installer" n'apparaît pas
- ✅ Vérifier HTTPS (obligatoire sauf localhost)
- ✅ Vérifier manifest.json (pas d'erreurs)
- ✅ Vérifier Service Worker enregistré
- ✅ Toutes les icônes présentes
- ✅ Visiter le site au moins 30 secondes

### Service Worker ne s'enregistre pas
- Vérifier la console pour les erreurs
- Vérifier le chemin: `/service-worker.js`
- Vérifier le scope dans manifest.json
- Désinstaller l'ancien Service Worker si nécessaire

### Icons 404
- Créer le dossier `icons/`
- Générer toutes les tailles d'icônes
- Vérifier les chemins dans manifest.json

### L'app ne fonctionne pas offline
- Vérifier que le Service Worker cache les fichiers
- Vérifier CACHE_NAME dans service-worker.js
- Tester avec DevTools > Application > Service Workers > Offline

## 📊 Analytics (Optionnel)

### Ajouter Google Analytics
```html
<!-- Dans index.html, avant </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## 🔄 Mises à Jour

### Version du Cache
Incrémenter `CACHE_NAME` dans `service-worker.js`:
```javascript
const CACHE_NAME = 'mots-croix-v1.0.1'; // Nouvelle version
```

### Forcer la mise à jour
```javascript
// Les utilisateurs verront une notification
// "🎉 Nouvelle version disponible !"
```

## 📱 Statistiques PWA

Une fois déployé, suivre:
- Nombre d'installations
- Temps passé dans l'app
- Utilisation offline
- Taux de rétention

## 🎯 Checklist Finale

- [ ] Icônes générées (toutes tailles)
- [ ] manifest.json configuré
- [ ] Service Worker actif
- [ ] HTTPS activé
- [ ] Test installation Android
- [ ] Test installation iOS
- [ ] Test installation Desktop
- [ ] Test mode offline
- [ ] Score Lighthouse > 90
- [ ] Domaine configuré (optionnel)
