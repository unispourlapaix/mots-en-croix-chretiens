# 🔧 Refonte P2P Simplifiée - Architecture Stable

## 🎯 Objectif
Système P2P **simple, stable, sans doublons** pour connexions cross-browser.

---

## ❌ Problèmes Actuels

### 1. Instabilité
- `createHostPeer()` **recrée le peer** → Déconnexions
- Peer ID change à chaque action → Doublons
- `destroy()` puis `new Peer()` → Connexions perdues

### 2. Doublons
- Refresh page → Nouveau peer ID → Ancien reste
- localStorage + P2P → Double entrée
- Cleanup trop lent (30s)

### 3. Complexité
- Trop de systèmes: localStorage, BroadcastChannel, P2P
- `room-CODE` vs peer aléatoire → Confusion
- Sync multi-couches → Bugs

---

## ✅ Architecture Simplifiée

### Principe de Base
**1 Joueur = 1 Peer ID (fixe pendant la session)**

```
Joueur A → Peer ID: abc123 (ne change JAMAIS)
Joueur B → Peer ID: def456 (ne change JAMAIS)
```

### Flux Créer Salle

```javascript
// HÔTE
1. A déjà un peer: abc123
2. Génère CODE: XYZ789
3. Enregistre: localStorage["room_XYZ789"] = {host: "abc123", username: "JoueurA"}
4. Partage CODE: XYZ789
5. Écoute connexions entrantes sur abc123
```

**Pas de recréation de peer !**

### Flux Rejoindre Salle

```javascript
// INVITÉ
1. B déjà un peer: def456
2. Entre CODE: XYZ789
3. Lit: localStorage["room_XYZ789"] → host = "abc123"
4. Connexion P2P: peer.connect("abc123")
5. Handshake: {type: "join", from: "def456", username: "JoueurB"}
```

**Connexion directe au peer existant !**

---

## 🔄 Code Simplifié

### presence-system.js

```javascript
class PresenceSystem {
    // CRÉER SALLE - SIMPLE
    async createRoom() {
        const myPeerId = window.simpleChatSystem.peer.id;
        if (!myPeerId) throw new Error('Peer non initialisé');
        
        const code = this.generateRoomCode();
        
        // Registre simple
        const room = {
            code: code,
            hostPeerId: myPeerId,
            hostUsername: this.myPresence.username,
            createdAt: Date.now()
        };
        
        localStorage.setItem(`room_${code}`, JSON.stringify(room));
        this.currentRoomCode = code;
        
        console.log('🏠 Salle créée:', code);
        console.log('📍 Host Peer ID:', myPeerId);
        
        // Modal avec code
        this.showRoomCodeModal(code);
        
        // Mode auto
        window.roomSystem?.setAcceptMode('auto');
        
        return code;
    }
    
    // REJOINDRE SALLE - SIMPLE
    async joinRoom(code) {
        const myPeerId = window.simpleChatSystem.peer.id;
        if (!myPeerId) throw new Error('Peer non initialisé');
        
        code = code.toUpperCase().trim();
        
        // Lire registre
        const roomData = localStorage.getItem(`room_${code}`);
        if (!roomData) {
            throw new Error('Salle introuvable');
        }
        
        const room = JSON.parse(roomData);
        const hostPeerId = room.hostPeerId;
        
        console.log('🚪 Rejoindre salle:', code);
        console.log('🎯 Connexion à l\'hôte:', hostPeerId);
        
        // Connexion P2P directe
        const conn = window.simpleChatSystem.peer.connect(hostPeerId, {
            reliable: true,
            metadata: {
                type: 'room_join',
                code: code,
                peerId: myPeerId,
                username: this.myPresence.username
            }
        });
        
        return new Promise((resolve, reject) => {
            let timeout = setTimeout(() => {
                reject(new Error('Timeout connexion'));
            }, 10000);
            
            conn.on('open', () => {
                clearTimeout(timeout);
                console.log('✅ Connecté à la salle !');
                
                // Ajouter aux connexions
                this.connectedPeers.set(hostPeerId, conn);
                window.simpleChatSystem.connections.set(hostPeerId, conn);
                
                // Handshake
                conn.send({
                    type: 'hello',
                    peerId: myPeerId,
                    username: this.myPresence.username
                });
                
                this.currentRoomCode = code;
                window.roomSystem?.setAcceptMode('auto');
                
                resolve(conn);
            });
            
            conn.on('data', (data) => this.handleMessage(data, conn));
            conn.on('error', reject);
        });
    }
    
    // GESTION MESSAGES - SIMPLE
    handleMessage(data, conn) {
        if (!data.type) return;
        
        switch(data.type) {
            case 'hello':
                // Nouvel invité se présente
                this.onlinePlayers.set(data.peerId, {
                    peerId: data.peerId,
                    username: data.username,
                    timestamp: Date.now()
                });
                
                // Répondre avec notre info
                conn.send({
                    type: 'welcome',
                    peerId: this.myPresence.peerId,
                    username: this.myPresence.username
                });
                
                // Notifier autres membres
                this.broadcastToRoom({
                    type: 'member_joined',
                    peerId: data.peerId,
                    username: data.username
                }, conn.peer);
                
                this.notifyUI();
                break;
                
            case 'welcome':
                // Hôte répond
                this.onlinePlayers.set(data.peerId, {
                    peerId: data.peerId,
                    username: data.username,
                    timestamp: Date.now()
                });
                this.notifyUI();
                break;
                
            case 'member_joined':
                // Autre membre rejoint
                this.onlinePlayers.set(data.peerId, {
                    peerId: data.peerId,
                    username: data.username,
                    timestamp: Date.now()
                });
                this.notifyUI();
                break;
        }
    }
    
    // BROADCAST - SIMPLE
    broadcastToRoom(message, excludePeerId = null) {
        this.connectedPeers.forEach((conn, peerId) => {
            if (peerId !== excludePeerId && conn.open) {
                conn.send(message);
            }
        });
    }
    
    // UI UPDATE - SIMPLE
    notifyUI() {
        if (!window.roomSystem) return;
        
        // Clear puis repopulate
        window.roomSystem.availablePlayers.clear();
        
        // Moi
        window.roomSystem.availablePlayers.set('me', {
            username: this.myPresence.username,
            isMe: true
        });
        
        // Autres
        this.onlinePlayers.forEach((player, peerId) => {
            window.roomSystem.availablePlayers.set(peerId, {
                username: player.username,
                isMe: false
            });
        });
        
        // Refresh UI
        window.roomSystem.updateAvailablePlayersList();
        window.roomSystem.updateChatBubble();
    }
}
```

---

## 🎯 Avantages

### ✅ Stabilité
- **Pas de recréation peer** → Connexions persistantes
- **1 peer ID par session** → Pas de doublons
- **Pas de destroy()** → Pas de déconnexions

### ✅ Simplicité
- **Registre localStorage simple** : `room_CODE → {host, username}`
- **Connexion directe** : `connect(hostPeerId)`
- **Handshake simple** : hello → welcome → member_joined

### ✅ Fiabilité
- **Timeout 10s** si hôte absent
- **Metadata dans connect()** pour contexte
- **onlinePlayers.clear()** puis rebuild → Pas de doublons

---

## 🧪 Test Flow

### Scénario : 2 Navigateurs

```
NAVIGATEUR A (Hôte):
1. Page load → Peer créé: abc123
2. Créer salle → CODE: XYZ789
3. localStorage["room_XYZ789"] = {host: "abc123"}
4. Écoute connexions...

NAVIGATEUR B (Invité):
1. Page load → Peer créé: def456
2. Rejoindre XYZ789
3. Lit localStorage["room_XYZ789"] → host = abc123
4. connect("abc123") → Connexion P2P
5. Envoi: {type: "hello", peerId: "def456", username: "JoueurB"}

NAVIGATEUR A reçoit:
1. Connexion entrante de: def456
2. Message: {type: "hello", ...}
3. Ajoute def456 à onlinePlayers
4. Répond: {type: "welcome", peerId: "abc123", username: "JoueurA"}
5. UI refresh → Voit JoueurB

NAVIGATEUR B reçoit:
1. Message: {type: "welcome", ...}
2. Ajoute abc123 à onlinePlayers
3. UI refresh → Voit JoueurA

RÉSULTAT:
✅ A voit B (1 fois)
✅ B voit A (1 fois)
✅ Chat fonctionne (connections.set)
```

### Après Refresh (Navigateur A)

```
PROBLÈME ANCIEN:
- Nouveau peer: xyz999
- localStorage a encore: {host: "abc123"}
- B essaie connect("abc123") → FAIL

SOLUTION:
1. Détecter refresh
2. Nettoyer registre de l'ancienne salle
3. Recréer salle avec nouveau peer ID
4. OU: Utiliser peer ID persistant (SessionStorage)
```

---

## 📝 Checklist Implémentation

- [ ] Supprimer `createHostPeer()`
- [ ] Supprimer `room-CODE` peer ID
- [ ] Simplifier `createRoom()` → registre simple
- [ ] Simplifier `joinRoom()` → connect direct
- [ ] Simplifier `handleMessage()` → 3 types
- [ ] Simplifier `notifyUI()` → clear + rebuild
- [ ] Tester 2 navigateurs
- [ ] Gérer refresh hôte (nettoyer registre)
- [ ] Désactiver localStorage sync en salle
- [ ] Commit + Push

---

## 🚀 Prochaines Étapes

1. **Implémenter version simplifiée**
2. **Tester stabilité** (créer, rejoindre, refresh)
3. **Gérer edge cases** (hôte quitte, timeout)
4. **Documenter** pour maintenance future

---

**Cette architecture élimine 90% de la complexité actuelle tout en étant plus stable ! 🎉**
