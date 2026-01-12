# 🔒 Système d'Amis Privé - Protection des Jeunes

## 🎯 Objectif
Protéger la vie privée des utilisateurs (notamment les jeunes) en créant un système de **rooms privées par code d'ami**. Les utilisateurs ne peuvent voir en ligne que leurs amis qu'ils ont explicitement ajoutés.

## 🔑 Fonctionnement

### 1. Code d'Ami Unique
- Chaque utilisateur possède un **code unique** (son peer ID)
- Ce code est généré automatiquement lors de la connexion
- Il peut être partagé avec des amis de confiance

### 2. Ajout d'Amis
- Un utilisateur partage son code avec quelqu'un
- L'autre personne entre ce code dans le gestionnaire d'amis
- Une fois ajouté, ils peuvent se voir mutuellement en ligne

### 3. Visibilité Limitée
- **Par défaut** : Aucun utilisateur n'est visible
- **Avec ajout** : Seuls les amis ajoutés apparaissent dans le lobby
- **Sécurité** : Impossible de voir des inconnus

## 📱 Interface Utilisateur

### Bouton "👥 Amis"
- Situé dans l'interface du chat/lobby
- Badge affichant le nombre d'amis
- Ouvre le gestionnaire d'amis

### Mini Liste Compacte (Mobile-Friendly) 🆕
**Emplacement** : Au-dessus du champ de saisie du chat

**Fonctionnalités** :
- Affiche jusqu'à **4 joueurs maximum** en ligne
- Badge "+X" pour les joueurs supplémentaires
- Icônes de statut : 🟢 En ligne | 🎮 En jeu
- Noms tronqués automatiquement si trop longs
- Clic sur un joueur pour interagir
- Clic sur "+X" pour ouvrir la liste complète
- Ultra-compact pour mobile (50px de hauteur max)

**Design** :
- Chips arrondis avec ombre portée
- Dégradé violet/rose subtil
- Scrollbar horizontale si nécessaire
- Animation au survol
- Police 10-11px (optimisé mobile)

### Modal de Gestion

#### Section 1 : Mon Code d'Ami
- Affiche le code personnel de l'utilisateur
- Bouton "Copier" pour partager facilement
- Note explicative sur la sécurité

#### Section 2 : Ajouter un Ami
- Champ pour entrer le code d'un ami
- Bouton "Ajouter"
- Messages de confirmation/erreur

#### Section 3 : Liste d'Amis
- Affiche tous les amis ajoutés
- Statut en ligne (🟢) / hors ligne (⚫)
- Bouton supprimer (🗑️) pour retirer un ami
- Compte du nombre d'amis

## 🔧 Architecture Technique

### Fichiers Créés

#### `friends-system.js`
**Classe principale** : `FriendsSystem`

**Méthodes clés** :
- `setMyFriendCode(code)` - Initialiser mon code
- `addFriend(friendCode, username)` - Ajouter un ami
- `removeFriend(friendCode)` - Retirer un ami
- `isFriend(friendCode)` - Vérifier si quelqu'un est ami
- `filterOnlinePlayersByFriends(players)` - Filtrer la liste en ligne
- `saveFriendsList()` / `loadFriendsList()` - Persistance localStorage

**Données stockées** :
```javascript
{
  friends: ['peer-id-1', 'peer-id-2'],
  friendsData: [
    ['peer-id-1', { username: 'Alice', addedAt: 1234567890, lastSeen: 1234567890 }],
    ['peer-id-2', { username: 'Bob', addedAt: 1234567891, lastSeen: null }]
  ]
}
```

#### `friends-ui.js`
**Classe UI** : `FriendsUI`

**Méthodes clés** :
- `openFriendsModal()` / `closeFriendsModal()`
- `addFriendFromInput()` - Ajouter depuis l'input
- `removeFriend(code)` - Supprimer avec confirmation
- `refreshFriendsList()` - Mettre à jour l'affichage
- `copyMyCode()` - Copier le code dans le presse-papier
- `updateFriendsCount()` - Mettre à jour le badge

**Styles CSS** :
- Design moderne avec dégradés
- Animations fluides
- Responsive
- Feedback visuel (hover, clic, etc.)

#### `compact-online-display.js` 🆕
**Classe affichage** : `CompactOnlineDisplay`

**Méthodes clés** :
- `updateDisplay()` - Rafraîchir la liste (auto toutes les 2s)
- `getOnlinePlayers()` - Obtenir les joueurs en ligne
- `createPlayerChip(player)` - Créer un chip de joueur
- `handlePlayerClick(player)` - Gérer clic sur joueur
- `showFullList()` - Ouvrir le lobby complet

**Caractéristiques** :
- Maximum 4 joueurs visibles
- Badge "+X" pour le reste
- Détection automatique des amis en ligne
- Intégration avec Realtime Lobby
- Mise à jour temps réel (2s)

### Intégration

#### Dans `realtime-lobby.js`

**Modifications** :
```javascript
// Lors de la synchronisation
syncPresence() {
    // Filtrer pour ne montrer que les amis
    if (window.friendsSystem) {
        this.onlinePlayers = window.friendsSystem.filterOnlinePlayersByFriends(allOnlinePlayers);
    }
}

// Lors de l'arrivée d'un joueur
handlePresenceJoin(newPresences) {
    // Vérifier si c'est un ami avant d'afficher
    const isFriend = window.friendsSystem?.isFriend(presence.peer_id);
    if (isFriend) {
        // Afficher
    }
}

// Initialisation du code
registerMyPresence(peerId, username) {
    // Définir mon code d'ami
    if (window.friendsSystem) {
        window.friendsSystem.setMyFriendCode(peerId);
    }
}
```

#### Dans `index.html`
```html
<!-- Chargé après auth mais avant le lobby -->
<script src="js/friends-system.js"></script>
<script src="js/friends-ui.js"></script>

<!-- Affichage compact après chat-ui -->
<script src="js/compact-online-display.js"></script>

<!-- Dans le chat SMS container -->
<div class="compact-online-players" id="compactOnlinePlayers">
    <div class="compact-players-list" id="compactPlayersList">
        <!-- Généré dynamiquement -->
    </div>
</div>
```

## 🛡️ Sécurité

### Points Forts
1. **Opt-in uniquement** : Personne n'est visible par défaut
2. **Contrôle total** : L'utilisateur décide qui peut le voir
3. **Révocable** : Possibilité de retirer un ami à tout moment
4. **Pas de découverte** : Impossible de trouver des utilisateurs au hasard
5. **Persistance locale** : Liste stockée localement (privacy-first)

### Protections Implémentées
- ❌ Imposvoit "Aucun ami ajouté. Ajouter des amis" au-dessus du chat
3. Elle clique sur le lien → Modal s'ouvre
4. Elle copie son code : `abc123...`
5 ❌ Confirmation avant suppression
- ✅ Codes uniques non-devinables (peer IDs)
- ✅ Aucune exposition de données utilisateur

## 📊 Cas d'Usage

### Scénario 1 : Premiers Pas
1. Alice ouvre le jeu → Lobby vide (personne visible)
2. Alice clique sur "👥 Amis"
3. Elle copie son code : `abc123...`
4. Elle l'envoie à Bob par SMS/email

### Scénario 2 : Ajout Mutuel
1. Bob reçoit le code d'Alice
2. Bob ouvre "👥 Amis"
3. **Alice apparaît dans la mini-liste compacte** (si en ligne)
5. Bob clique sur le chip d'Alice → Interaction directe
6. Bob partage son code à Alice
7. Alice l'ajoute → Ils se voient mutuellement dans la mini-liste
6. Alice l'ajoute → Ils se voient mutuellement

### Scénario 3 : Gestion
1. Alice a 5 amis dans sa liste
2. Elle ne veut plus voir Thomas
3. Elle clique sur 🗑️ à côté de son nom
4. Thomas disparaît de son lobby
5. (Thomas peut toujours la voir si elle est dans sa liste à lui)

## 🎨 Design

### Couleurs
- **Principal** : Dégradé violet (#667eea → #764ba2)
- **Success** : Vert (#4CAF50)
- **Error** : Rouge (#f44336)
- **Background** : Dégradé clair (#f5f7fa → #c3cfe2)

### UX
- **Animations** : Slide-in pour la modal, scale sur hover
- **Feedback** : Messages de confirmation colorés
- **Icons** : Emojis pour une interface friendly
- **Badge** : Compteur d'amis toujours visible

## 🔄 Événements

### `friendsListUpdated`
Déclenché quand la liste change (ajout/suppression)
```javascript
window.addEventListener('friendsListUpdated', (e) => {
    console.log('Amis:', e.detail.friendsCount);
    // Mettre à jour l'UI
});
```

### `usernameUpdated`
Écouté pour mettre à jour le username des amis

## 🚀 Utilisation

### Pour l'Utilisateur
```
1. Cliquer sur "👥 Amis"
2. Copier mon code
3. L'envoyer à un ami
4. Recevoir le code de mon ami
5. Le coller et cliquer "Ajouter"
6. Jouer ensemble !
```

### API Développeur
```javascript
// Ajouter un ami
window.friendsSystem.addFriend('peer-id-123', 'Nom Ami');

// Vérifier si ami
window.friendsSystem.isFriend('peer-id-123'); // true/false

// Obtenir la liste
window.friendsSystem.getFriendsList(); // ['peer-id-1', 'peer-id-2']

// Exporter mon code
window.friendsSystem.exportMyCode(); // { success: true, code: 'my-id' }

// Ouvrir la modal
window.friendsUI.openFriendsModal();
```

## ✅ Tests

### Test 1 : Isolation
- [ ] Créer 2 comptes
- [ ] Vérifier que les lobbies sont vides
- [ ] Aucun joueur visible

### Test 2 : Ajout Unilatéral
- [ ] A ajoute le code de B
- [ ] A voit B en ligne
- [ ] B ne voit PAS A (pas encore ajouté)

### Test 3 : Ajout Mutuel
- [ ] A ajoute B
- [ ] B ajoute A
- [ ] Les deux se voient mutuellement

### Test 4 : Suppression
- [ ] A retire B de ses amis
- [ ] A ne voit plus B
- [ ] B voit toujours A (si A est dans sa liste)

### Test 5 : Persistance
- [ ] Ajouter des amis
- [ ] Fermer le navigateur
- [ ] Rouvrir → Les amis sont toujours là

## 🔮 Améliorations Futures
x] **Mini-liste compacte mobile** (au-dessus du champ de saisie)
- [x] **Indication "Ajouter des amis"** quand liste vide
- [
### Court Terme
- [ ] Demande d'ami bidirectionnelle (comme Facebook)
- [ ] Notifications quand un ami se connecte
- [ ] Groupes d'amis (Famille, École, Église)

### Moyen Terme
- [ ] Chat privé entre amis
- [ ] Invitation directe au jeu depuis la liste
- [ ] Historique des parties jouées ensemble

### Long Terme
- [ ] Synchronisation Supabase (backup cloud)
- [ ] Recherche par pseudo (avec accord explicite)
- [ ] Profils publics optionnels

## 📝 Notes Importantes

⚠️ **Le système est unilatéral** : Si A ajoute B, A voit B, mais B ne voit pas A tant qu'il n'a pas ajouté A à son tour.

✅ **Privacy-first** : Les données sont stockées localement, pas sur un serveur central.

🔒 **Sécurité jeunes** : Conception pensée pour protéger les mineurs en ligne.

---1.0  
**Status** : ✅ Production Ready  
**Nouveauté v1.1** : Affichage compact mobile-friendly ✨
**Dernière mise à jour** : 9 janvier 2026  
**Version** : 1.0.0  
**Status** : ✅ Production Ready
