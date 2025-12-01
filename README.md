# 💕 Mots En Croix Chrétiens

> Un jeu de mots croisés bibliques avec un design kawaii élégant, optimisé mobile et installable comme application web progressive.

![Version](https://img.shields.io/badge/version-1.0.0-ff69b4)
![PWA](https://img.shields.io/badge/PWA-ready-success)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Caractéristiques

### 🎮 Gameplay
- **77 niveaux progressifs** avec mots bibliques soigneusement sélectionnés
- **Grille 15×15** avec intersections intelligentes des mots
- **7 messages d'encouragement** spirituels avant chaque partie
- **Système de points** avec bonus de réussite
- **Indices payants** disponibles (coût : 1 à 3 millions par indice)
- **Validation en temps réel** des réponses avec feedback visuel
- **Icônes kawaii** remplaçant les numéros de définitions
- **Animation cœur géométrique** pour les mots d'encouragement
- **Niveaux thématiques** : vertus, fruits de l'Esprit, armure de Dieu, transformation spirituelle

### 🌍 Multilingue
- Français 🇫🇷
- English 🇬🇧
- Español 🇪🇸

### 💕 Design Kawaii
- Palette rose pastel élégante
- Animations douces et ludiques
- Interface épurée et moderne
- Icônes spirituelles discrètes

### 📱 PWA Moderne
- Installation comme app native
- Mode offline complet
- Optimisé mobile HD portrait
- Responsive 3 breakpoints

## 🚀 Démarrage Rapide

### Option 1 : Serveur Local (Recommandé)

**Python:**
```bash
python -m http.server 8000
```

**Node.js:**
```bash
npx http-server -p 8000
```

Ouvrir : http://localhost:8000

### Option 2 : Déploiement

**GitHub Pages:** Push sur `main`, activer Pages dans Settings

**Netlify/Vercel:** Connecter le repo

## 📱 Installation Mobile

### Android (Chrome)
1. Ouvrir l'URL sur Chrome
2. Cliquer "📱 Installer l'Application"
3. Ou Menu → Ajouter à l'écran d'accueil

### iOS (Safari)
1. Ouvrir l'URL sur Safari
2. Bouton Partage ⬆️
3. Sur l'écran d'accueil

### Desktop
Cliquer l'icône d'installation dans la barre d'adresse

## 🎯 Comment Jouer

1. **Cliquez 7 fois** sur "Jouer" pour découvrir les messages
2. **Complétez la grille** en cliquant sur les cases
3. **Tapez les lettres** directement au clavier
4. **Utilisez les indices** (➡️ horizontal, ⬇️ vertical)
5. **Vérifiez** vos réponses
6. **Passez au niveau suivant** à 100% de réussite

### Contrôles
- **Souris** : Clic sur case pour saisir
- **Clavier** : Flèches ⬆️⬇️⬅️➡️ pour naviguer
- **Lettres** : Saisie directe

## 🏗️ Structure

```
mots-en-croix-chretiens/
├── index.html           # Page principale
├── manifest.json        # Manifeste PWA
├── service-worker.js    # Cache offline
├── css/
│   └── styles.css      # Design kawaii
├── js/
│   ├── config.js       # Configuration
│   ├── i18n.js         # Traductions
│   ├── gameData.js     # Niveaux
│   └── game.js         # Logique
└── icons/              # Icônes PWA
```

## 🌍 Ajouter une Langue

1. **`js/i18n.js`** : Ajouter traductions UI
2. **`js/gameData.js`** : Ajouter niveaux traduits
3. Le sélecteur apparaîtra automatiquement

## 🎨 Personnalisation

### Modifier les Mots

Dans `js/gameData.js` :

```javascript
{
  words: [
    { 
      word: "JESUS", 
      clue: "Sauveur du monde", 
      start: [2, 2], 
      direction: "horizontal" 
    }
  ]
}
```

### Changer les Couleurs

Dans `css/styles.css` :

```css
:root {
  --rose-primaire: #ff69b4;
  --rose-secondaire: #ff85c1;
}
```

## 🔧 Technologies

- HTML5
- CSS3 (Animations, Grid, Flexbox)
- JavaScript Vanilla ES6
- Service Worker API
- Web App Manifest
- LocalStorage API

## 📚 Documentation

- [STRUCTURE.md](STRUCTURE.md) - Architecture modulaire
- [DESIGN.md](DESIGN.md) - Guide design
- [PWA-INSTALL.md](PWA-INSTALL.md) - Configuration PWA

## 🤝 Contribuer

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amelioration`)
3. Commit (`git commit -m 'Ajout fonctionnalité'`)
4. Push (`git push origin feature/amelioration`)
5. Ouvrir une Pull Request

## 📜 Licence MIT

✅ Utilisation libre (personnel/commercial)  
✅ Modification autorisée  
✅ Distribution autorisée  
📝 Condition : Mentionner Emmanuel.gallery comme source

## 💝 Crédits

**Créateur** : [Emmanuel.gallery](https://emmanuel.gallery)  
**Concept** : Mots croisés bibliques pour encourager la foi  
**Mission** : Promouvoir l'amour et l'unité par la Parole

## 📧 Contact

🌐 [emmanuel.gallery](https://emmanuel.gallery)  
📧 emmanuelpayet888@gmail.com

---

*"Que la Parole de Christ habite en vous avec richesse"*  
**Colossiens 3:16**

🙏 Made with 💕 by Dream 🙏