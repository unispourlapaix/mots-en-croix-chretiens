# Mots En Croix Chrétiens - Structure Modulaire

## 📁 Structure du Projet

```
mots-en-croix-chretiens/
├── index.html                  # Page principale (nouveau)
├── christian_crossword_game.html  # Ancienne version monolithique
├── css/
│   └── styles.css             # Styles séparés
├── js/
│   ├── config.js              # Configuration globale
│   ├── i18n.js                # Système de traduction
│   ├── gameData.js            # Données des niveaux
│   └── game.js                # Logique du jeu
└── README.md

```

## 🌍 Support Multi-Langues

Le jeu supporte maintenant 3 langues :
- 🇫🇷 Français (par défaut)
- 🇬🇧 English
- 🇪🇸 Español

### Comment Ajouter une Nouvelle Langue

1. **Dans `js/i18n.js`** : Ajouter la traduction de l'interface
```javascript
translations.de = {
    gameTitle: "🙏 Christliche Kreuzworträtsel 🙏",
    gameSubtitle: "Finde ermutigende Worte und biblische Worte",
    // ... autres traductions
};
```

2. **Dans `js/gameData.js`** : Ajouter les mots et indices traduits
```javascript
gameData.de = {
    levels: [
        {
            words: [
                { word: "JESUS", clue: "Unser Retter", start: [2, 2], direction: "horizontal" },
                // ... autres mots
            ]
        }
    ]
};
```

3. **Dans `i18n.getLanguageName()`** : Ajouter le nom de la langue
```javascript
const names = {
    fr: 'Français',
    en: 'English',
    es: 'Español',
    de: 'Deutsch'  // Nouveau
};
```

## 📦 Modules

### 1. `config.js` - Configuration
Contient tous les paramètres configurables du jeu :
- Taille de la grille
- Pénalité pour les indices
- Délais d'animation
- Langue par défaut

### 2. `i18n.js` - Internationalisation
Gère les traductions de l'interface utilisateur :
- Classe `I18n` pour gérer les langues
- Méthode `t(key, replacements)` pour obtenir les traductions
- Événement `languageChanged` pour notifier les changements

### 3. `gameData.js` - Données du Jeu
Contient les niveaux, mots et indices pour chaque langue :
- Classe `GameDataManager` pour accéder aux données
- Méthodes pour obtenir les niveaux par langue

### 4. `game.js` - Logique du Jeu
Contient la classe principale `ChristianCrosswordGame` :
- Gestion de la grille
- Navigation clavier
- Vérification des réponses
- Système de score

### 5. `styles.css` - Styles
Tous les styles CSS séparés du HTML :
- Design responsive
- Animations
- Thème moderne

## 🎮 Utilisation

### Lancer le Jeu
Ouvrez simplement `index.html` dans un navigateur web.

### Changer de Langue
Cliquez sur l'un des boutons de langue en haut de la page (Français, English, Español).

## 🔧 Personnalisation

### Modifier les Paramètres du Jeu
Éditez `js/config.js` :
```javascript
const config = {
    gridSize: 10,              // Taille de la grille
    hintPenalty: 5,            // Points perdus par indice
    maxEncouragingWords: 7,    // Nombre de clics avant de démarrer
    // ...
};
```

### Ajouter des Niveaux
Éditez `js/gameData.js` et ajoutez de nouveaux objets dans le tableau `levels` :
```javascript
{
    words: [
        { 
            word: "EXAMPLE", 
            clue: "Votre indice ici", 
            start: [row, col], 
            direction: "horizontal" // ou "vertical"
        }
    ]
}
```

## 🚀 Avantages de la Structure Modulaire

1. **✅ Facilité de Traduction** : Toutes les chaînes sont centralisées dans `i18n.js` et `gameData.js`
2. **✅ Maintenabilité** : Code organisé et séparé par responsabilité
3. **✅ Réutilisabilité** : Les modules peuvent être utilisés indépendamment
4. **✅ Évolutivité** : Facile d'ajouter de nouvelles langues ou fonctionnalités
5. **✅ Testabilité** : Chaque module peut être testé séparément

## 📝 Migration depuis l'Ancienne Version

L'ancienne version monolithique (`christian_crossword_game.html`) est conservée pour référence. La nouvelle version modulaire (`index.html`) offre les mêmes fonctionnalités avec une architecture améliorée.

## 🤝 Contribution

Pour ajouter une nouvelle langue ou améliorer les traductions existantes :
1. Modifiez les fichiers `js/i18n.js` et `js/gameData.js`
2. Testez le jeu dans la nouvelle langue
3. Soumettez vos modifications

## 📄 Licence

Ce projet est un jeu éducatif chrétien open source.
