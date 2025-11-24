# 💕 Mots En Croix Chrétiens - PWA

> Jeu de mots croisés chrétiens avec un design kawaii rose élégant, optimisé pour mobile HD portrait et installable en tant qu'application web progressive.

![Version](https://img.shields.io/badge/version-1.0.0-ff69b4)
![PWA](https://img.shields.io/badge/PWA-ready-success)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Fonctionnalités

- 🎮 **8 Niveaux** de difficulté croissante
- 🌍 **3 Langues** : Français, English, Español
- 💕 **Design Rose Kawaii** élégant et moderne
- 📱 **Optimisé Mobile HD** en mode portrait
- 🔌 **Mode Offline** avec Service Worker
- 📲 **Installable** comme application native
- ✨ **Animations** douces et ludiques
- 🎯 **Système de Score** avec indices
- ⌨️ **Navigation Clavier** supportée

## 🚀 Installation Rapide

### Option 1: Télécharger et Ouvrir
1. Télécharger le projet
2. Ouvrir `index.html` dans un navigateur

### Option 2: Serveur Local (Recommandé pour PWA)

**Avec Python:**
```bash
python -m http.server 8000
# Ou double-cliquer sur dev.bat
```

**Avec Node.js:**
```bash
npx http-server -p 8000
# Ou double-cliquer sur dev-node.bat
```

Puis ouvrir: http://localhost:8000

### Option 3: Déployer en Ligne

**GitHub Pages:**
```bash
git push origin master
# Activer Pages dans Settings
```

**Netlify/Vercel:** Connecter le repo et déployer

## 📱 Installer l'Application

### Android
1. Ouvrir sur Chrome mobile
2. Cliquer "📱 Installer l'Application"
3. Ou Menu > "Ajouter à l'écran d'accueil"

### iOS
1. Ouvrir sur Safari
2. Bouton Partage ⬆️
3. "Sur l'écran d'accueil"

### Desktop
1. Icône d'installation dans la barre d'adresse
2. Ou cliquer le bouton "📱 Installer l'Application"

## 🎨 Design

- **Palette**: Roses pastels (#ff69b4, #ff85c1, #ffb6d9)
- **Background**: Gradient blanc rosé
- **Animations**: Sparkle ✨ et Heartbeat 💕
- **Responsive**: 3 breakpoints (desktop, mobile, petit mobile)
- **Grille**: Adaptative 32px → 30px → 26px

## 🏗️ Structure du Projet

```
mots-en-croix-chretiens/
├── index.html              # Page principale
├── manifest.json           # Manifeste PWA
├── service-worker.js       # Service Worker
├── css/
│   └── styles.css         # Styles rose kawaii
├── js/
│   ├── config.js          # Configuration
│   ├── i18n.js            # Traductions
│   ├── gameData.js        # Niveaux et mots
│   └── game.js            # Logique du jeu
├── icons/                 # Icônes PWA (à générer)
├── screenshots/           # Captures d'écran
├── STRUCTURE.md           # Documentation structure
├── DESIGN.md              # Documentation design
└── PWA-INSTALL.md         # Guide installation PWA
```

## 🌍 Ajouter une Langue

1. **Dans `js/i18n.js`**: Ajouter les traductions UI
2. **Dans `js/gameData.js`**: Ajouter les niveaux traduits
3. Le sélecteur de langue s'ajoutera automatiquement

## 🎯 Configuration PWA

### Générer les Icônes
1. Ouvrir `icon-generator.html`
2. Télécharger les SVG
3. Convertir en PNG (72, 96, 128, 144, 152, 180, 192, 384, 512px)
4. Placer dans `/icons/`

### Vérifier l'Installation
- Chrome DevTools > Application > Manifest
- Chrome DevTools > Application > Service Workers
- Lighthouse > Progressive Web App (score > 90)

## 🔧 Technologies

- **HTML5** - Structure
- **CSS3** - Styles et animations
- **JavaScript Vanilla** - Logique
- **Service Worker** - Mode offline
- **PWA Manifest** - Installabilité

## 📚 Documentation

- [STRUCTURE.md](STRUCTURE.md) - Architecture modulaire
- [DESIGN.md](DESIGN.md) - Guide du design rose kawaii
- [PWA-INSTALL.md](PWA-INSTALL.md) - Configuration PWA complète

## 🤝 Contribution

Les contributions sont bienvenues!
- Nouvelles langues
- Nouveaux niveaux
- Améliorations du design
- Corrections de bugs

## 📜 Licence

Ce projet est sous licence **MIT** - voir le fichier [LICENSE](LICENSE) pour plus de détails.

Tu es libre de :
- ✅ Utiliser ce code dans tes projets
- ✅ Modifier le code comme tu veux
- ✅ Distribuer le code
- ✅ Utiliser ce code commercialement

**Seule condition** : Mentionner Emmanuel.gallery comme source originale.

## 💝 Crédits

- **Créé par** : [Emmanuel.gallery](https://emmanuel.gallery)
- **Concept** : Jeu de mots croisés bibliques pour encourager la foi
- **But** : Promouvoir l'amour, la paix et l'unité à travers la Parole de Dieu

## 📧 Contact

Pour toute question ou suggestion :
- 🌐 Site web : [emmanuel.gallery](https://emmanuel.gallery)
- 📧 Email : emmanuelpayet888@gmail.com

---

*"Que la Parole de Christ habite en vous avec richesse" - Colossiens 3:16*

🙏 **Made with 💕 by Dream** 🙏

## ✨ Fonctionnalités

- 🎮 **7 clics pour commencer** - Découvre des messages d'encouragement avant de jouer
- 📖 **8 niveaux progressifs** - Des mots bibliques de plus en plus challengeants
- 💯 **Système de points** - Gagne des points en complétant les niveaux
- 💡 **Système d'indices** - Besoin d'aide ? Utilise un indice (coûte 5 points)
- ⌨️ **Navigation au clavier** - Utilise les flèches directionnelles pour te déplacer
- 📱 **100% Responsive** - Joue sur mobile, tablette ou ordinateur
- 🎨 **Design moderne** - Interface colorée et agréable

## 🎯 Comment jouer

1. **Clique 7 fois sur "Jouer"** pour révéler les messages d'encouragement
2. **Complète la grille** en cliquant sur les cases et en tapant les lettres
3. **Utilise les indices** (horizontal ➡️ et vertical ⬇️) pour trouver les mots
4. **Vérifie tes réponses** avec le bouton "✅ Vérifier"
5. **Passe au niveau suivant** quand tu as 100% de réussite !

### 🎮 Contrôles

- **Souris** : Clique sur une case pour écrire
- **Clavier** : Utilise les flèches ⬆️⬇️⬅️➡️ pour naviguer
- **Lettres** : Tape directement les lettres dans les cases

## 🚀 Installation

### Option 1 : Utilisation directe

1. Télécharge le fichier `index.html`
2. Ouvre-le dans ton navigateur
3. C'est tout ! Pas besoin de serveur

### Option 2 : Cloner le projet

```bash
git clone https://github.com/ton-username/mots-en-croix-chretiens.git
cd mots-en-croix-chretiens
```

Ouvre ensuite `index.html` dans ton navigateur préféré.

## 📋 Niveaux

Le jeu contient **8 niveaux** avec des mots bibliques :

- **Niveau 1-2** : Mots courts et fondamentaux (JESUS, AMOUR, FOI, PAIX)
- **Niveau 3-4** : Mots intermédiaires (RESURRECTION, BENEDICTION, MIRACLE)
- **Niveau 5-6** : Mots avancés (PERSEVERANCE, REDEMPTION, TRANSFORMATION)
- **Niveau 7-8** : Mots experts (TRANSFIGURATION, RECONCILIATION, GLORIFICATION)

## 🛠️ Technologies utilisées

- **HTML5** - Structure
- **CSS3** - Design et animations
- **JavaScript Vanilla** - Logique du jeu (pas de framework !)

## 🎨 Personnalisation

Tu peux facilement personnaliser le jeu :

### Ajouter tes propres mots

Modifie le tableau `levelData` dans le code JavaScript :

```javascript
{
    words: [
        { word: "TON_MOT", clue: "Ta description", start: [2, 2], direction: "horizontal" },
        // Ajoute d'autres mots...
    ]
}
```

### Changer les couleurs

Modifie les variables CSS dans la section `<style>` :

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

## 📱 Compatibilité

- ✅ Chrome / Edge
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ✅ Navigateurs mobiles (iOS, Android)

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésite pas à :

1. 🍴 Fork le projet
2. 🌟 Créer une branche (`git checkout -b feature/amelioration`)
3. 💾 Commit tes changements (`git commit -m 'Ajout d'une fonctionnalité'`)
4. 📤 Push vers la branche (`git push origin feature/amelioration`)
5. 🔃 Ouvrir une Pull Request

## 📜 Licence

Ce projet est sous licence **MIT** - voir le fichier [LICENSE](LICENSE) pour plus de détails.

Tu es libre de :
- ✅ Utiliser ce code dans tes projets
- ✅ Modifier le code comme tu veux
- ✅ Distribuer le code
- ✅ Utiliser ce code commercialement

**Seule condition** : Mentionner Emmanuel.gallery comme source originale.

## 💝 Crédits

- **Créé par** : [Emmanuel.gallery](https://emmanuel.gallery)
- **Concept** : Jeu de mots croisés bibliques pour encourager la foi
- **But** : Promouvoir l'amour, la paix et l'unité à travers la Parole de Dieu

## 🌟 Support

Si tu aimes ce projet :
- ⭐ Mets une étoile sur GitHub
- 🔗 Partage-le avec tes amis
- 💌 Envoie tes suggestions et idées

## 📧 Contact

Pour toute question ou suggestion :
- 🌐 Site web : [emmanuel.gallery](https://emmanuel.gallery)
- 📧 Email : emmanuelpayet888@gmail.com

---

*"Que la Parole de Christ habite en vous avec richesse" - Colossiens 3:16*

🙏 Fait avec amour pour la gloire de Dieu 🙏