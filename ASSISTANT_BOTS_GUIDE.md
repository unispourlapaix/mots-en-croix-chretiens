# Système de Bots Assistants

## Vue d'ensemble

Le système de bots assistants fournit 4 personnages IA avec des personnalités distinctes pour interagir avec les joueurs via des annonces, conseils et encouragements.

**✨ Intégration avec les messages existants** : Le système réutilise automatiquement les messages de `welcome-ai.js` et les citations de `biblicalQuotes.js` pour une cohérence maximale.

## Les 4 Bots

### 🧙‍♂️ Originaire - Le Sage
- **Personnalité** : Sérieux, réfléchi, expérimenté
- **Rôle** : Guide spirituel et conseiller
- **Ton** : Sage et patient
- **Messages** : Proverbes, sagesse, conseils réfléchis

**Exemple** :
```
"Bienvenue, Joueur. Que la sagesse guide tes pas dans ce jeu."
"Remarquable. Ta persévérance porte ses fruits."
```

### 🌈 Origine - L'Inclusif
- **Personnalité** : Jeune, enthousiaste, positif
- **Rôle** : Ambassadeur de la communauté
- **Ton** : Inclusif et énergique
- **Messages** : Langage épicène, encouragements chaleureux

**Exemple** :
```
"Hey Joueur ! 🎉 Content·e de te voir ici ! On va s'amuser ensemble !"
"Waouh ! T'es un·e champion·ne ! Continue comme ça ! 💪"
```

### 🤖 Dreamer - Le Curieux
- **Personnalité** : Petit robot adorable, curieux, fun
- **Rôle** : Assistant technique ludique
- **Ton** : Joyeux et plein d'énergie
- **Messages** : Bips, exclamations, émerveillement

**Exemple** :
```
"Bip boop ! Joueur détecté·e ! 🤖 Je suis super content de jouer avec toi !"
"Ohhhh ! Bravo bravo ! *fait des petits sauts de joie* 🎉"
```

### 💻 Materik - L'Ingénieur
- **Personnalité** : Précis, efficace, technique
- **Rôle** : Support technique expert
- **Ton** : Professionnel et informatif
- **Messages** : Termes techniques, analyses, optimisations

**Exemple** :
```
"Bonjour Joueur. Système initialisé. Si tu as besoin d'aide technique, je suis là."
"Performance optimale détectée. Bien joué."
```

## Utilisation

### Envoyer un message manuel

```javascript
// Message de bienvenue par Origine
window.assistantBotManager.sendMessage('welcome', {
    username: 'Jean'
});

// Félicitation par Originaire
window.assistantBotManager.sendMessage('achievement', {
    username: 'Marie',
    level: 5,
    score: 1250
}, window.assistantBotManager.bots.originaire);

// Conseil technique par Materik
window.assistantBotManager.sendMessage('help', {
    tip: 'Utilise les raccourcis clavier pour gagner du temps'
}, window.assistantBotManager.bots.materik);
```

### Types de messages disponibles

1. **welcome** : Message de bienvenue
2. **achievement** : Félicitations pour un accomplissement
3. **encouragement** : Encouragement en cas de difficulté
4. **help** : Conseil ou aide
5. **announcement** : Annonce importante
6. **tip** : Astuce aléatoire

### Réagir aux événements

Le système réagit automatiquement aux événements :

```javascript
// Événement déclenché automatiquement
window.dispatchEvent(new CustomEvent('levelComplete', {
    detail: {
        username: 'Sophie',
        level: 3,
        score: 850
    }
}));
```

### Rotation automatique de tips

```javascript
// Démarrer (toutes les 10 minutes par défaut)
window.assistantBotManager.startTipRotation(10);

// Arrêter
window.assistantBotManager.stopTipRotation();
```

### Sélectionner un bot spécifique

```javascript
// Par nom
const dreamer = window.assistantBotManager.getBot('dreamer');

// Par ton/personnalité
const botSage = window.assistantBotManager.getBotForContext('achievement', 'sage');
const botFun = window.assistantBotManager.getBotForContext('encouragement', 'fun');
```

## Événements automatiques

Le système écoute ces événements :

- `playerJoinedRoom` : Nouveau joueur
- `levelComplete` : Niveau terminé
- `playerStruggling` : Joueur en difficulté

## Personnalisation

### Ajouter de nouveaux messages

Modifiez les méthodes dans `assistant-bots.js` :

```javascript
getWelcomeMessage(context) {
    const messages = {
        'Originaire': [
            'Nouveau message de bienvenue sage...'
        ],
        // ...
    };
}
```

### Créer un nouveau type de message

```javascript
case 'custom_type':
    message.text = this.getCustomMessage(context);
    break;
```

## API Complète

### AssistantBotManager

```javascript
// Obtenir un bot
.getBot(name)           // Par nom
.getRandomBot()         // Aléatoire
.getBotForContext(type, tone)  // Par contexte

// Envoyer des messages
.sendMessage(type, context, bot)
.handleGameEvent(event, data)

// Gestion de la rotation
.startTipRotation(minutes)
.stopTipRotation()

// Stats
.getBotStats()
```

## Exemples d'intégration

### Dans le chat

```javascript
if (window.assistantBotManager) {
    window.assistantBotManager.sendMessage('announcement', {
        announcement: 'Nouvelle fonctionnalité disponible !'
    });
}
```

### Pour aider un joueur bloqué

```javascript
// Détecter que le joueur utilise trop d'indices
if (this.hintsUsedThisLevel > 3) {
    window.assistantBotManager.sendMessage('encouragement', {
        username: this.playerName
    });
}
```

### Annonce de mise à jour

```javascript
window.assistantBotManager.sendMessage('announcement', {
    announcement: 'Version 2.0 disponible avec de nouveaux niveaux !'
}, window.assistantBotManager.bots.materik);
```

## Notes

- Les bots n'affectent pas le gameplay
- Rotation de tips : 1 message toutes les 10 minutes par défaut
- Les messages sont affichés dans le chat P2P
- Historique des messages conservé dans chaque bot
- Compatible avec le système de chat existant
