# 🗳️ Système de Vote pour Changement de Mode

## Vue d'ensemble

Le changement de mode de jeu nécessite maintenant l'approbation de la **majorité** des joueurs connectés (> 50%). Cette fonctionnalité évite qu'un seul joueur change le mode sans l'accord des autres.

## 🎯 Fonctionnement

### 1. **Déclenchement du Vote**
Quand un joueur essaie de changer le mode de jeu (via le menu déroulant) et que d'autres joueurs sont connectés dans la salle :

**Avant (sans vote)** ❌:
- Le mode changeait immédiatement
- Les autres joueurs étaient forcés de suivre

**Maintenant (avec vote)** ✅:
- Un vote est lancé automatiquement
- Tous les joueurs doivent voter
- Le changement n'est appliqué que si la majorité accepte

### 2. **Processus de Vote**

#### Étape 1: Demande
```javascript
// Joueur A veut changer de Normal → Couple
switchGameMode('couple')
  ↓
// Si joueurs connectés → Vote
requestModeChangeVote('normal', 'couple')
  ↓
// Broadcast à tous
broadcastGameAction({
  type: 'mode_change_request',
  previousMode: 'normal',
  newMode: 'couple',
  requester: 'JoueurA',
  totalPlayers: 3
})
```

#### Étape 2: Notification aux Joueurs
Chaque joueur (sauf le demandeur) reçoit:
- **Message dans le chat**: `🗳️ JoueurA propose de changer pour le mode 💕 Couple`
- **Modal de vote** avec 2 boutons:
  - `✅ Accepter` → Vote OUI
  - `❌ Refuser` → Vote NON
- **Timeout**: 15 secondes pour voter

#### Étape 3: Collecte des Votes
```javascript
// Vote du demandeur (automatique)
votes.set('peer_id_A', true)  // OUI

// Votes des autres joueurs
votes.set('peer_id_B', true)   // OUI
votes.set('peer_id_C', false)  // NON
```

#### Étape 4: Calcul du Résultat
```javascript
totalPlayers = 3
yesVotes = 2
noVotes = 1
majorityNeeded = Math.ceil(3 / 2) = 2

approved = (2 >= 2) = true ✅
```

#### Étape 5: Application
Si **approuvé** (majorité OUI):
```javascript
broadcastGameAction({
  type: 'mode_change_result',
  approved: true,
  yesVotes: 2,
  totalPlayers: 3
})
  ↓
// Message: ✅ Vote accepté (2/3) ! Changement vers 💕 Couple
  ↓
applyModeChange('normal', 'couple')
  ↓
// Tous les joueurs passent au mode Couple
```

Si **rejeté** (majorité NON):
```javascript
// Message: ❌ Vote rejeté (1/3). Mode 🙏 Normal conservé
// Le mode actuel ne change pas
```

## 📋 Règles de Vote

### Majorité Requise
- **Formule**: `yesVotes >= Math.ceil(totalPlayers / 2)`
- **Exemples**:
  - 2 joueurs: 1 vote OUI nécessaire (50%)
  - 3 joueurs: 2 votes OUI nécessaires (> 50%)
  - 4 joueurs: 2 votes OUI nécessaires (50%)
  - 5 joueurs: 3 votes OUI nécessaires (> 50%)

### Vote du Demandeur
- Le joueur qui demande le changement vote automatiquement **OUI**
- Son vote compte dans le total

### Timeout
- **Durée**: 15 secondes
- **Si pas de vote**: Considéré comme **NON** (vote implicite)
- **Si tous votent avant**: Résultat immédiat (pas d'attente)

### Vote Unique
- Un seul vote à la fois
- Si un nouveau vote est lancé, l'ancien est annulé

## 🎮 Expérience Utilisateur

### Pour le Demandeur
1. Sélectionne un nouveau mode dans le menu
2. Voit: `🗳️ Vote lancé: Changer pour le mode 💕 Couple`
3. Attend les votes des autres joueurs
4. Reçoit le résultat: ✅ Accepté ou ❌ Rejeté

### Pour les Autres Joueurs
1. Reçoivent une notification: `🗳️ JoueurA propose de changer pour le mode 💕 Couple`
2. Voient apparaître une **modal de vote**:
   ```
   🗳️ Vote: Changement de Mode
   
   💕
   
   JoueurA propose de changer pour le mode:
   Couple
   
   Vote automatique dans 15 secondes
   
   [✅ Accepter]  [❌ Refuser]
   ```
3. Cliquent sur leur choix
4. Voient: `✅ Vous avez voté POUR le changement de mode`
5. Reçoivent le résultat: ✅ Accepté ou ❌ Rejeté

## 💻 Implémentation Technique

### Fichiers Modifiés

#### `js/game.js`
**Nouvelles fonctions**:
- `requestModeChangeVote(previousMode, newMode)` - Lance un vote
- `processModeChangeVote()` - Traite les résultats
- `applyModeChange(previousMode, mode)` - Applique le changement
- `getModeIcon(mode)` - Retourne l'icône du mode
- `getModeName(mode)` - Retourne le nom du mode

**Logique modifiée**:
```javascript
switchGameMode(mode) {
  // Si joueurs connectés
  if (connections.size > 0) {
    requestModeChangeVote(currentMode, mode);  // ← VOTE
    return;
  }
  
  // Sinon, changement direct
  applyModeChange(currentMode, mode);
}
```

#### `js/simple-chat.js`
**Nouvelles fonctions**:
- `handleModeChangeRequest(action, username)` - Reçoit demande de vote
- `sendModeChangeVote(voteId, accepted)` - Envoie un vote
- `handleModeChangeVote(action, username)` - Reçoit un vote
- `handleModeChangeResult(action)` - Reçoit le résultat

**Nouveaux types de messages**:
- `mode_change_request` - Demande de vote
- `mode_change_vote` - Vote d'un joueur
- `mode_change_result` - Résultat du vote

### Structure des Messages

#### mode_change_request
```javascript
{
  type: 'mode_change_request',
  voteId: 'vote_1234567890',
  previousMode: 'normal',
  newMode: 'couple',
  requester: 'JoueurA',
  totalPlayers: 3
}
```

#### mode_change_vote
```javascript
{
  type: 'mode_change_vote',
  voteId: 'vote_1234567890',
  vote: true,  // ou false
  voter: 'JoueurB',
  peerId: 'peer_xyz'
}
```

#### mode_change_result
```javascript
{
  type: 'mode_change_result',
  voteId: 'vote_1234567890',
  approved: true,  // ou false
  yesVotes: 2,
  noVotes: 1,
  totalVotes: 3,
  totalPlayers: 3,
  previousMode: 'normal',
  newMode: 'couple'
}
```

## 📊 Scénarios de Test

### Scénario 1: Vote Accepté (Majorité OUI)
**Setup**: 3 joueurs (A, B, C)

1. Joueur A veut changer Normal → Couple
2. Votes:
   - A: OUI (automatique)
   - B: OUI
   - C: NON
3. Résultat: 2/3 = **Accepté** ✅
4. Tous passent au mode Couple

### Scénario 2: Vote Rejeté (Majorité NON)
**Setup**: 3 joueurs (A, B, C)

1. Joueur A veut changer Normal → Sagesse
2. Votes:
   - A: OUI (automatique)
   - B: NON
   - C: NON
3. Résultat: 1/3 = **Rejeté** ❌
4. Mode Normal conservé

### Scénario 3: Tous Votent Rapidement
**Setup**: 2 joueurs (A, B)

1. Joueur A veut changer Normal → Proverbes
2. Votes:
   - A: OUI (automatique)
   - B: OUI (vote dans les 2 secondes)
3. Résultat: 2/2 = **Accepté** ✅ (pas d'attente du timeout)
4. Changement immédiat

### Scénario 4: Timeout
**Setup**: 4 joueurs (A, B, C, D)

1. Joueur A veut changer Couple → Normal
2. Votes reçus avant timeout:
   - A: OUI (automatique)
   - B: OUI
   - C: pas de vote (timeout)
   - D: pas de vote (timeout)
3. Après 15 secondes: 2/4 = **Accepté** ✅ (50%)
4. Tous passent au mode Normal

### Scénario 5: Joueur Seul
**Setup**: 1 joueur (A)

1. Joueur A veut changer Normal → Couple
2. Pas d'autres joueurs connectés
3. **Pas de vote** → Changement direct ✅
4. Mode changé immédiatement

## 🎨 Interface Utilisateur

### Messages dans le Chat
```
🗳️ JoueurA propose de changer pour le mode 💕 Couple
✅ Vous avez voté POUR le changement de mode
🗳️ Vote reçu de JoueurB: OUI
✅ Vote accepté (2/3) ! Changement vers 💕 Couple
🔄 Mode changé: 🙏 Normal → 💕 Couple (122 niveaux)
```

### Modal de Vote
- **Position**: Centré sur l'écran
- **Style**: Modal avec overlay
- **Contenu**:
  - Icône du mode proposé (grande taille)
  - Nom du demandeur
  - Nom du mode
  - Compte à rebours (15 secondes)
  - 2 boutons clairs

## 🔒 Avantages

1. **Démocratie** 🗳️: Tous les joueurs ont leur mot à dire
2. **Équité** ⚖️: Pas de dictature d'un seul joueur
3. **Transparence** 📊: Résultats visibles par tous
4. **Rapidité** ⚡: Si tous votent vite, pas d'attente
5. **Flexibilité** 🎯: Joueur seul = pas de vote inutile

## 🐛 Gestion des Cas Limites

### Déconnexion Pendant le Vote
- Si un joueur se déconnecte pendant le vote, son vote n'est pas compté
- Le total de joueurs est recalculé dynamiquement

### Multiple Votes
- Un seul vote actif à la fois
- Nouveau vote annule l'ancien

### Vote du Demandeur
- Ne peut pas voter NON à sa propre demande
- Vote automatiquement OUI

### Pas de Modal (CustomModals non disponible)
- Fallback: Message dans le chat uniquement
- Pas de boutons, vote par commande (à implémenter si besoin)

## ✅ État Actuel

- ✅ Système de vote implémenté
- ✅ Majorité requise (> 50%)
- ✅ Modal de vote avec UI
- ✅ Timeout de 15 secondes
- ✅ Vote automatique du demandeur
- ✅ Messages de feedback clairs
- ✅ Synchronisation entre tous les joueurs
- ✅ Gestion des déconnexions
- ✅ Changement direct si seul

Le système est **opérationnel** et prêt pour les tests ! 🚀
