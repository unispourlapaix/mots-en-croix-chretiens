# 🏠 Système de Salle Unifiée

## Vue d'ensemble

Le système de salle unifiée lie automatiquement le **chat** et le **jeu** dans une seule salle créée par l'utilisateur numéro 1 (l'hôte).

## Architecture

### Composants principaux

1. **lobby-tabs.js** : Interface du lobby avec liste des joueurs
2. **simple-chat.js** : Système P2P de chat et gestion des salles
3. **game.js / multiplayer-race.js** : Système de jeu multijoueur

### Flux de connexion

```
┌─────────────────────────────────────────────────────────────┐
│  UTILISATEUR #1 (Hôte)                                      │
│  ─────────────────────                                      │
│  1. Ouvre le lobby                                          │
│  2. Clique sur un joueur disponible                         │
│  3. invitePlayer(peerId) → Crée connexion P2P               │
│  4. Crée automatiquement une SALLE UNIFIÉE                  │
│     - roomId = peer ID de l'hôte                            │
│     - Chat activé                                           │
│     - Jeu activé                                            │
│  5. Envoie invitation au joueur #2                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    Invitation P2P
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  UTILISATEUR #2 (Invité)                                    │
│  ─────────────────────                                      │
│  1. Reçoit invitation via handleGameInvite()                │
│  2. Modal : "X vous invite dans sa salle ! Accepter ?"      │
│  3a. ACCEPTE → invite_accepted                              │
│      - Rejoint la salle unifiée                             │
│      - Chat connecté                                        │
│      - Jeu synchronisé                                      │
│  3b. REFUSE → invite_declined                               │
│      - Connexion fermée                                     │
└─────────────────────────────────────────────────────────────┘
```

## Code principal

### 1. Création de la salle (Hôte)

**Fichier** : `js/lobby-tabs.js`

```javascript
async invitePlayer(peerId) {
    // Connexion P2P
    const conn = window.simpleChatSystem.peer.connect(peerId, {
        metadata: {
            type: 'game_invite',
            from: window.simpleChatSystem.currentUser,
            roomId: window.simpleChatSystem.peer.id // Mon peer ID = roomId
        }
    });
    
    conn.on('open', () => {
        // Créer la salle unifiée
        const roomId = window.simpleChatSystem.peer.id;
        
        // Enregistrer la connexion
        window.simpleChatSystem.connections.set(peerId, conn);
        window.simpleChatSystem.roomCode = roomId;
        window.simpleChatSystem.isHost = true;
        
        // Ajouter le joueur à la salle
        window.simpleChatSystem.roomPlayers.set(peerId, {
            username: player.username,
            peer_id: peerId,
            isHost: false
        });
        
        // Envoyer invitation
        conn.send({
            type: 'game_invite',
            from: window.simpleChatSystem.currentUser,
            roomId: roomId,
            message: "Invitation dans ma salle !"
        });
    });
}
```

### 2. Réception de l'invitation (Invité)

**Fichier** : `js/simple-chat.js`

```javascript
handleGameInvite(conn, data) {
    // Modal de confirmation
    CustomModals.showConfirm(
        '🏠 Invitation de jeu',
        `${data.from} vous invite dans sa salle ! Accepter ?`,
        async () => {
            // ACCEPTER
            conn.send({
                type: 'invite_accepted',
                from: this.currentUser
            });
            
            // Rejoindre la salle unifiée
            this.connections.set(conn.peer, conn);
            this.roomCode = data.roomId;
            this.isHost = false;
            
            // Ajouter les joueurs
            this.roomPlayers.set(conn.peer, {
                username: data.from,
                peer_id: conn.peer,
                isHost: true
            });
            
            this.showMessage(`🏠 Vous avez rejoint la salle de ${data.from}`, 'system');
        },
        () => {
            // REFUSER
            conn.send({ type: 'invite_declined', from: this.currentUser });
        }
    );
}
```

## Fonctionnalités de la salle unifiée

### Chat

- **Envoi de messages** : `broadcastChatMessage(text)`
- **Réception** : Automatique via événement P2P `data`

```javascript
// Envoyer un message dans la salle
window.simpleChatSystem.broadcastChatMessage("Bonjour !");

// Les autres joueurs reçoivent via handleGameInvite → conn.on('data')
if (msgData.type === 'chat_message') {
    this.showMessage(msgData.message, 'user', msgData.from);
}
```

### Jeu

- **Synchronisation complète** : `broadcastGameSync()`
- **Mise à jour partielle** : `broadcastGameUpdate(updateData)`

```javascript
// Synchroniser l'état complet du jeu
window.simpleChatSystem.broadcastGameSync();

// Envoyer une mise à jour (ex: lettre placée)
window.simpleChatSystem.broadcastGameUpdate({
    cellUpdate: { row: 5, col: 3, letter: 'A' }
});

// Les autres joueurs reçoivent et appliquent
if (msgData.type === 'game_sync') {
    window.game.grid = msgData.grid;
    window.game.score = msgData.score;
    window.game.renderGrid();
}
```

## Gestion des réponses

**Fichier** : `js/lobby-tabs.js`

```javascript
handleInviteResponse(peerId, username, data) {
    if (data.type === 'invite_accepted') {
        // Joueur a accepté
        window.simpleChatSystem.showMessage(
            `✅ ${username} a rejoint la salle !`,
            'system'
        );
        
        // Synchroniser le jeu si partie en cours
        if (window.game?.gameStarted) {
            const conn = window.simpleChatSystem.connections.get(peerId);
            conn.send({
                type: 'game_sync',
                level: window.game.currentLevel,
                grid: window.game.grid,
                score: window.game.score
            });
        }
    } else if (data.type === 'invite_declined') {
        // Joueur a refusé
        window.simpleChatSystem.showMessage(
            `❌ ${username} a refusé l'invitation`,
            'system'
        );
        // Nettoyer
        window.simpleChatSystem.connections.delete(peerId);
    }
}
```

## Vérifier l'état de la salle

```javascript
// Est-on dans une salle ?
if (window.simpleChatSystem.isInRoom()) {
    console.log('✅ Dans une salle unifiée');
    console.log('RoomCode:', window.simpleChatSystem.roomCode);
    console.log('Hôte ?', window.simpleChatSystem.isHost);
    console.log('Joueurs:', window.simpleChatSystem.roomPlayers.size);
}
```

## Avantages du système

1. **Simplicité** : Un seul clic pour inviter → Accepter/Refuser
2. **Unification** : Chat + Jeu dans la même salle
3. **Pas de CODE** : Plus besoin de partager des codes, connexion directe
4. **Automatique** : La salle se crée automatiquement lors de la connexion
5. **Synchronisé** : État du jeu partagé en temps réel

## Utilisation

### Côté utilisateur #1 (Hôte)

1. Ouvrir le lobby (chat bubble → Lobby Public)
2. Cliquer sur un joueur disponible (🟢 Disponible)
3. Une salle est automatiquement créée
4. Le joueur reçoit l'invitation

### Côté utilisateur #2 (Invité)

1. Recevoir la notification d'invitation
2. Cliquer "Accepter" ou "Refuser"
3. Si accepté → Rejoindre automatiquement la salle
4. Chat et jeu sont maintenant liés

## Exemples d'intégration dans le jeu

### Envoyer un changement de cellule

```javascript
// Dans game.js, quand un joueur place une lettre
if (window.simpleChatSystem?.isInRoom()) {
    window.simpleChatSystem.broadcastGameUpdate({
        cellUpdate: { row: i, col: j, letter: letter }
    });
}
```

### Envoyer un changement de score

```javascript
// Quand le score change
if (window.simpleChatSystem?.isInRoom()) {
    window.simpleChatSystem.broadcastGameUpdate({
        scoreUpdate: { score: newScore }
    });
}
```

## Déconnexion

```javascript
// Écouter la fermeture de connexion
conn.on('close', () => {
    console.log('🔌 Connexion fermée avec', username);
    // Retirer de la salle
    window.simpleChatSystem.roomPlayers?.delete(peerId);
    window.simpleChatSystem.connections?.delete(peerId);
});
```

## Résumé technique

| Aspect | Valeur |
|--------|--------|
| **Type de connexion** | WebRTC P2P via PeerJS |
| **Serveur** | peerjs.92k.de:443 |
| **ID de salle** | Peer ID de l'utilisateur #1 |
| **Transport** | Reliable DataChannel |
| **Format messages** | JSON |
| **Persistance** | Non (fermeture page = déconnexion) |

## Fichiers modifiés

- ✅ `js/lobby-tabs.js` : Ajout de `invitePlayer()`, `handleInviteResponse()`, `handleGameUpdate()`
- ✅ `js/simple-chat.js` : Modification de `handleGameInvite()`, ajout de `isInRoom()`, `broadcastChatMessage()`, `broadcastGameUpdate()`, `broadcastGameSync()`
- ✅ `js/realtime-lobby-ui.js` : Redirection de `invitePlayer()` vers `lobby-tabs.js`

---

**Date** : 21 décembre 2025  
**Statut** : ✅ Implémenté et fonctionnel
