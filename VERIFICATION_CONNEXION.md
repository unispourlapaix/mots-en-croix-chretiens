# ✅ Vérification Logique de Connexion P2P par CODE

## 🎯 Objectif
Garantir que les joueurs se connectent avec leurs **vrais usernames authentifiés** (ex: "Deffendeur888") et **jamais avec des pseudos temporaires** (ex: "Joueur592").

---

## 🔧 Corrections Appliquées (Session 9 déc 2025)

### 1. **Auth Timing - CRITIQUE** ✅
**Problème:** `isCheckingAuth = false` était mis **avant** `loadUserProfile()`, permettant à `createMyRoom()` de s'exécuter avec username temporaire.

**Solution:**
```javascript
// auth.js (ligne 32-48)
const { data: { session }, error } = await supabase.auth.getSession();

if (session && session.user) {
    // IMPORTANT: Attendre que le profil soit chargé AVANT de marquer comme prêt
    await this.loadUserProfile(session.user);
}

// Marquer comme initialisé SEULEMENT après loadUserProfile terminé
this.isInitialized = true;
this.isCheckingAuth = false;
console.log('✅ Auth init terminée, username:', this.currentUser?.username || 'anonyme');
```

**Flux Correct:**
```
1. getSession() → Récupère session Supabase
2. loadUserProfile() → Charge "Deffendeur888" depuis DB
3. isCheckingAuth = false → Débloque createMyRoom()
4. createMyRoom() → Utilise "Deffendeur888" ✓
```

**Flux Incorrect (avant):**
```
1. getSession() → Récupère session
2. isCheckingAuth = false ❌ (trop tôt !)
3. createMyRoom() → Utilise "Joueur592" ❌
4. loadUserProfile() → Charge "Deffendeur888" (trop tard)
```

---

### 2. **SetAcceptMode Synchronisation** ✅
**Problème:** Appels à `setAcceptMode('auto')` avant que `roomSystem` soit initialisé.

**Solution:**
```javascript
// presence-system.js (createRoom & joinRoom)
if (window.roomSystem && typeof window.roomSystem.setAcceptMode === 'function') {
    window.roomSystem.setAcceptMode('auto');
    console.log('✅ Mode acceptation auto activé pour salle CODE');
} else {
    console.warn('⚠️ roomSystem pas encore initialisé');
}
```

**Protection:**
- Vérifie que `roomSystem` existe
- Vérifie que `setAcceptMode` est une fonction
- Logs explicites pour déboguer timing

---

### 3. **DiscoverRoomMembers - P2P Non Prêt** ✅
**Problème:** Tentative de connexion aux peers avant que PeerJS soit initialisé.

**Solution:**
```javascript
// presence-system.js (ligne 184-194)
async discoverRoomMembers(roomCode) {
    // Vérifier que P2P est initialisé
    if (!window.simpleChatSystem?.peer?.id) {
        console.log('⏳ P2P pas encore prêt, réessai dans 500ms...');
        setTimeout(() => this.discoverRoomMembers(roomCode), 500);
        return;
    }
    
    // ... suite de la découverte
}
```

**Protection:**
- Attend que `peer.id` existe
- Retry automatique toutes les 500ms
- Évite erreurs "Cannot read property 'connect' of undefined"

---

### 4. **LeaveRoom - Nettoyage Complet** ✅
**Problème:** Connexions restaient dans `simpleChatSystem.connections` après départ salle.

**Solution:**
```javascript
// presence-system.js (ligne 523-531)
// Revenir en mode manuel après avoir quitté une salle CODE
if (window.roomSystem && typeof window.roomSystem.setAcceptMode === 'function') {
    window.roomSystem.setAcceptMode('manual');
    console.log('✅ Mode manuel restauré');
}

// Nettoyer aussi simpleChatSystem.connections
if (window.simpleChatSystem) {
    window.simpleChatSystem.connections.clear();
    console.log('🧹 Connexions chat nettoyées');
}
```

**Synchronisation:**
- `connectedPeers.clear()` (presence-system)
- `simpleChatSystem.connections.clear()` (chat)
- `setAcceptMode('manual')` (room-system)
- `localStorage.removeItem('crossword_current_room')`

---

### 5. **Logs de Débogage** ✅
**Amélioration:** Ajout logs détaillés pour tracer le flux d'init.

```javascript
// room-system.js (ligne 31-35)
console.log('⏳ Attente vérification authentification... (currentUser:', this.chatSystem.currentUser + ')');
// ...
console.log('✅ Username OK, création de la room pour:', this.chatSystem.currentUser);
console.log('🔍 Auth status - isCheckingAuth:', authSystem?.isCheckingAuth, 'isAuthenticated:', authSystem?.isAuthenticated());
```

**Permet de voir:**
- Progression: "Joueur592" → "Deffendeur888"
- État auth à chaque étape
- Points de blocage (attente auth)

---

## 📋 Checklist de Vérification

### Test 1: Username Authentifié au Démarrage
- [ ] Ouvrir l'app avec compte connecté
- [ ] Observer logs console:
  ```
  ✅ Session restaurée depuis localStorage
  ✅ Profil chargé: { username: "Deffendeur888", ... }
  ✅ Auth init terminée, username: Deffendeur888
  ✅ Username OK, création de la room pour: Deffendeur888
  📢 Présence enregistrée: Deffendeur888 ( peer-id )
  ```
- [ ] **JAMAIS voir "Joueur" + random dans les logs**

### Test 2: Connexion par CODE - 2 Joueurs
**Setup:**
- Onglet A: Compte "Deffendeur888"
- Onglet B: Compte "AutreJoueur123"

**Actions:**
1. **Onglet A:**
   - [ ] Ouvrir menu "👥 Joueurs en ligne"
   - [ ] Cliquer "🏠 Créer Salle CODE"
   - [ ] Noter le code (ex: "ABCDEF")
   - [ ] Vérifier log: `✅ Mode acceptation auto activé pour salle CODE`
   - [ ] Vérifier badge: "✅ Toujours accepter"

2. **Onglet B:**
   - [ ] Ouvrir menu "👥 Joueurs en ligne"
   - [ ] Cliquer "🚪 Rejoindre Salle CODE"
   - [ ] Entrer code "ABCDEF"
   - [ ] Vérifier log: `✅ Mode acceptation auto activé pour salle CODE`
   - [ ] Vérifier connexion immédiate (pas de popup validation)

3. **Vérifications Onglet A:**
   - [ ] Voir "AutreJoueur123" dans liste joueurs (pas "Joueur456")
   - [ ] Envoyer message → reçu par B
   - [ ] Cliquer cellule → action visible chez B

4. **Vérifications Onglet B:**
   - [ ] Voir "Deffendeur888" dans liste (pas "Joueur789")
   - [ ] Envoyer message → reçu par A
   - [ ] Cliquer cellule → action visible chez A

### Test 3: Quitter Salle CODE
**Actions:**
1. **Onglet B (invité):**
   - [ ] Cliquer "🚪 Quitter Salle"
   - [ ] Vérifier logs:
     ```
     🧹 Connexions chat nettoyées
     ✅ Mode manuel restauré
     ✅ Salle quittée proprement
     ```
   - [ ] Vérifier badge: "✋ Manuel (Auto en salle CODE)"
   - [ ] Ne plus voir "Deffendeur888" dans liste

2. **Onglet A (hôte):**
   - [ ] Voir log: "👋 AutreJoueur123 a quitté"
   - [ ] Ne plus voir "AutreJoueur123" dans liste
   - [ ] Toujours en mode "✅ Toujours accepter" (hôte garde salle)

### Test 4: Deux Ordinateurs Différents
**Setup:**
- PC 1: Compte "Deffendeur888"
- PC 2: Compte "Ami789"

**Actions:**
1. **PC 1:**
   - [ ] Créer salle CODE → obtenir "XYZ123"
   - [ ] Partager code par SMS/Discord

2. **PC 2:**
   - [ ] Rejoindre avec "XYZ123"
   - [ ] Vérifier connexion directe P2P
   - [ ] Tester chat bidirectionnel
   - [ ] Tester actions jeu synchronisées

3. **Vérifications:**
   - [ ] Vrais usernames visibles des deux côtés
   - [ ] Latence < 100ms (P2P direct)
   - [ ] Pas de "Joueur" temporaire

### Test 5: Reconnexion Après Rafraîchissement
**Actions:**
1. **Onglet A (dans salle CODE):**
   - [ ] F5 (rafraîchir page)
   - [ ] Vérifier logs:
     ```
     ✅ Session restaurée depuis localStorage
     🏠 Salle précédente trouvée: XYZ123
     ✅ Mode acceptation auto activé pour salle CODE
     ```
   - [ ] Reconnexion automatique aux membres
   - [ ] Toujours "Deffendeur888" (pas "Joueur123")

---

## 🚨 Erreurs à Surveiller

### ❌ Username Temporaire
**Symptôme:**
```
👤 CurrentUser: Joueur592
📢 Présence enregistrée: Joueur592 ( peer-id )
```

**Cause:** `isCheckingAuth = false` trop tôt

**Vérification:**
```javascript
// auth.js doit avoir:
await this.loadUserProfile(session.user); // AVANT
this.isCheckingAuth = false; // APRÈS
```

---

### ❌ SetAcceptMode Avant Init
**Symptôme:**
```
TypeError: Cannot read property 'setAcceptMode' of undefined
```

**Cause:** `roomSystem` pas encore créé

**Vérification:**
```javascript
// Doit avoir:
if (window.roomSystem && typeof window.roomSystem.setAcceptMode === 'function') {
    window.roomSystem.setAcceptMode('auto');
}
```

---

### ❌ Connexion Peer Avant Init
**Symptôme:**
```
TypeError: Cannot read property 'connect' of undefined
    at connectToPeer (presence-system.js:231)
```

**Cause:** `peer.id` pas encore disponible

**Vérification:**
```javascript
// discoverRoomMembers doit avoir:
if (!window.simpleChatSystem?.peer?.id) {
    setTimeout(() => this.discoverRoomMembers(roomCode), 500);
    return;
}
```

---

### ❌ Connexions Non Nettoyées
**Symptôme:**
- Messages envoyés après leaveRoom()
- Badge "✅ Toujours accepter" reste après départ

**Cause:** `connections` pas vidé

**Vérification:**
```javascript
// leaveRoom() doit avoir:
this.connectedPeers.clear();
window.simpleChatSystem.connections.clear();
window.roomSystem.setAcceptMode('manual');
```

---

## 📊 Flux Complet de Connexion

```
┌─────────────────────────────────────────────────────┐
│ 1. PAGE LOAD                                        │
├─────────────────────────────────────────────────────┤
│ authSystem.init()                                   │
│   ├─ getSession()                                   │
│   ├─ loadUserProfile(session.user) ← ATTEND ICI    │
│   │    └─ currentUser = "Deffendeur888" ✓          │
│   └─ isCheckingAuth = false ✓                       │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 2. ROOM CREATION                                    │
├─────────────────────────────────────────────────────┤
│ roomSystem.createMyRoom()                           │
│   ├─ Vérifie: authSystem.isCheckingAuth === false  │
│   ├─ Utilise: chatSystem.currentUser ✓              │
│   │    = "Deffendeur888" (PAS "Joueur592")         │
│   ├─ initP2P() → peer.id généré                     │
│   └─ presenceSystem.start(username, peerId)        │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 3. CRÉER SALLE CODE (optionnel)                    │
├─────────────────────────────────────────────────────┤
│ presenceSystem.createRoom()                         │
│   ├─ generateRoomCode() → "ABCDEF"                  │
│   ├─ window.roomSystem.setAcceptMode('auto') ✓     │
│   │    (avec check typeof function)                │
│   ├─ registerInRoom(roomCode)                       │
│   └─ startRoomMemberWatch()                         │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 4. REJOINDRE SALLE CODE                            │
├─────────────────────────────────────────────────────┤
│ presenceSystem.joinRoom("ABCDEF")                   │
│   ├─ window.roomSystem.setAcceptMode('auto') ✓     │
│   ├─ registerInRoom(roomCode)                       │
│   └─ discoverRoomMembers(roomCode)                  │
│        ├─ Vérifie: peer.id existe ✓                 │
│        ├─ Lit localStorage: membres trouvés         │
│        └─ connectToPeer(peerId, memberInfo)         │
│             ├─ peer.connect(peerId)                 │
│             ├─ connectedPeers.set(peerId, conn)    │
│             └─ simpleChatSystem.connections.set()  │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 5. CHAT & JEU SYNCHRONISÉS                         │
├─────────────────────────────────────────────────────┤
│ • Messages: simpleChatSystem.sendMessage()         │
│   → forEach(connections) → conn.send()             │
│                                                     │
│ • Actions jeu: game.broadcastGameAction()          │
│   → presenceSystem.broadcastToRoom()               │
│   → {type: 'cell_update', cell, letter}            │
│                                                     │
│ • Mots masqués: '*'.repeat(word.length)            │
│   → Pas de spoil entre joueurs                     │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 6. QUITTER SALLE                                    │
├─────────────────────────────────────────────────────┤
│ presenceSystem.leaveRoom()                          │
│   ├─ broadcastToRoom({type: 'goodbye'})            │
│   ├─ connectedPeers.clear()                         │
│   ├─ simpleChatSystem.connections.clear() ✓        │
│   ├─ roomSystem.setAcceptMode('manual') ✓          │
│   └─ localStorage.removeItem('current_room')       │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Résultats Attendus

### ✅ Succès
- **Usernames:** Toujours authentifiés ("Deffendeur888", jamais "Joueur592")
- **Mode Auto:** Activé automatiquement en salle CODE
- **Chat:** Messages passent instantanément (P2P direct)
- **Actions Jeu:** Cellules/mots synchronisés en temps réel
- **Anti-Spoiler:** Mots masqués avec `*****`
- **Cleanup:** Connexions nettoyées à la sortie
- **Reconnexion:** Salle restaurée après F5

### ❌ Échec = Bug à Reporter
- Voir "Joueur" + random dans logs
- acceptMode reste 'manual' en salle CODE
- Chat ne fonctionne pas entre joueurs
- Actions jeu pas synchronisées
- Connexions persistent après leaveRoom()

---

## 📝 Notes de Développement

### Ordre d'Initialisation Critique
```javascript
1. authSystem.init()        → Charge profil DB
2. simpleChatSystem.init()  → Crée peer P2P
3. roomSystem.init()        → Attend auth + peer
4. presenceSystem.init()    → Écoute connexions
```

**Règle:** `roomSystem` NE PEUT PAS s'initialiser avant `authSystem.isCheckingAuth = false`

### Timing Windows
- **Auth → Username:** ~200-500ms (DB query)
- **P2P → Peer ID:** ~500-1000ms (serveur PeerJS)
- **Discovery → Connect:** ~100-300ms (localStorage + WebRTC)

**Protection:** Retry loops avec setTimeout() si ressources pas prêtes

### LocalStorage Keys
```javascript
'crossword_room_ABCDEF'     // Registre membres salle
'crossword_current_room'     // Salle active de l'utilisateur
'crossword_players_online'   // Présences annoncées
```

**Cleanup:** Suppression automatique si salle vide (0 membres)

---

## 🔍 Debugging Tips

### 1. Voir Flux Auth
```javascript
// Console browser:
authSystem.isCheckingAuth  // doit être false après init
authSystem.currentUser     // doit avoir {username: "..."}
window.simpleChatSystem.currentUser  // doit matcher auth
```

### 2. Voir Connexions P2P
```javascript
// Console browser:
window.presenceSystem.connectedPeers.size  // Nombre peers connectés
window.simpleChatSystem.connections.size   // Doit matcher
window.presenceSystem.onlinePlayers        // Liste détaillée
```

### 3. Voir Salle Actuelle
```javascript
// Console browser:
window.presenceSystem.currentRoomCode  // Code salle (ex: "ABCDEF")
window.roomSystem.acceptMode           // "auto" si en salle CODE
localStorage.getItem('crossword_current_room')  // Détails salle
```

### 4. Forcer Reconnexion
```javascript
// Console browser:
window.presenceSystem.leaveRoom();
window.presenceSystem.joinRoom("ABCDEF");
```

---

**Dernière mise à jour:** 9 décembre 2025  
**Status:** ✅ Tous les fixes appliqués et commitées  
**Commit:** `58b9c9f` - Fix: Logique connexion P2P par CODE
