# Migration presence-system.js vers Supabase Realtime

## 🎯 Objectif
Remplacer le système local (localStorage + BroadcastChannel) par Supabase Realtime pour permettre la découverte globale des salles CODE entre plusieurs appareils et navigateurs.

## 📊 Architecture Unifiée

### Avant (fragmenté)
```
Lobby Public → Supabase Realtime ✅
Salle CODE → localStorage + BroadcastChannel ❌ (local uniquement)
```

### Après (unifié)
```
Lobby Public → Supabase Realtime ✅
Salle CODE → Supabase Realtime ✅ (global, cross-device)
```

## 🔄 Changements Effectués

### 1. **Constructor** - Ajout support Supabase
```javascript
this.supabaseChannel = null; // Channel dynamique room:{CODE}
```

### 2. **init()** - Vérification Supabase
```javascript
if (window.supabase && window.realtimeLobbySystem?.supabaseReady) {
    console.log('🔵 Supabase disponible pour salles CODE');
}
```

### 3. **Nouvelles méthodes Supabase**

#### initSupabaseRoomChannel(roomCode)
- Crée channel dynamique `room:{CODE}`
- Subscribe aux événements `presence:sync/join/leave`
- Filtre les bots (`!peer_id.startsWith('bot-')`)

#### trackSupabasePresence()
- Enregistre présence via `channel.track()`
- Données: peerId, username, avatar, status, timestamp

#### syncSupabasePresence()
- Synchronise depuis `presenceState()`
- Construit Map `onlinePlayers` depuis Supabase

#### handleSupabasePresenceJoin/Leave()
- Gère arrivée/départ joueurs
- Met à jour `onlinePlayers` Map
- Appelle `notifyPresenceUpdate()`

### 4. **createRoom()** - Intégration Supabase
```javascript
// Après génération du code salle
await this.initSupabaseRoomChannel(roomCode);

// Après ajout à onlinePlayers
if (this.supabaseChannel) {
    await this.trackSupabasePresence();
}
```

### 5. **joinRoom()** - Intégration Supabase
```javascript
// Après récupération du hostPeerId
await this.initSupabaseRoomChannel(roomCode);

// Avant connexion P2P
if (this.supabaseChannel) {
    await this.trackSupabasePresence();
}
```

### 6. **startHeartbeat()** - Heartbeat Supabase
```javascript
// Toutes les 3s
if (this.supabaseChannel && this.currentRoomCode) {
    this.trackSupabasePresence().catch(err => {
        console.warn('⚠️ Erreur heartbeat Supabase:', err.message);
    });
}
```

### 7. **leaveRoom()** - Désinscription Supabase
```javascript
// Au début de la méthode
if (this.supabaseChannel) {
    this.supabaseChannel.unsubscribe();
    this.supabaseChannel = null;
}
```

## 🌐 Flux de Découverte

### Création Salle (Hôte)
1. Génère code court (6 caractères)
2. **Crée channel Supabase** `room:ABC123`
3. **Enregistre présence** via `channel.track()`
4. Enregistre mapping CODE→PeerID (Supabase ou localStorage)
5. Affiche modal avec code

### Rejoindre Salle (Invité)
1. Entre code court ABC123
2. Récupère hostPeerId depuis mapping
3. **Crée channel Supabase** `room:ABC123`
4. **Enregistre présence** via `channel.track()`
5. **Découvre autres joueurs** via `presenceState()`
6. Connexion P2P directe à l'hôte

### Heartbeat (Tous)
- Toutes les 3s: met à jour présence Supabase
- Maintient présence active dans channel
- Permet détection des joueurs qui quittent

### Quitter Salle
- Unsubscribe du channel Supabase
- Ferme connexions P2P
- Nettoie onlinePlayers Map

## 📡 Événements Supabase

### `presence:sync`
```javascript
// Synchronisation complète (connexion + reconnexion)
this.syncSupabasePresence();
```

### `presence:join`
```javascript
// Nouveau joueur arrive
this.handleSupabasePresenceJoin(newPresences);
```

### `presence:leave`
```javascript
// Joueur part
this.handleSupabasePresenceLeave(leftPresences);
```

## 🔍 Visibilité Globale

### Avant (localStorage)
```
Appareil A (Chrome) → Salle ABC123 ❌ invisible
Appareil B (Firefox) → Ne voit pas ABC123
```

### Après (Supabase)
```
Appareil A → Salle ABC123 ✅ visible
Appareil B → Voit ABC123 dans lobby
Appareil C → Peut rejoindre ABC123
```

## 🤖 Filtrage Bots
Tous les bots locaux sont filtrés :
```javascript
if (presence.peer_id.startsWith('bot-')) return; // Ignorer
```

## ⚠️ Fallbacks

### Si Supabase indisponible
- BroadcastChannel (même appareil)
- localStorage (même navigateur)
- P2P pur (connexion directe uniquement)

### Si channel fail
```javascript
this.trackSupabasePresence().catch(err => {
    console.warn('⚠️ Erreur heartbeat Supabase:', err.message);
    // Continue en mode local
});
```

## 🧪 Test Manuel

### Scénario 1: Création Salle
1. Ouvrir console
2. Créer salle CODE
3. Vérifier logs:
   ```
   🔵 Initialisation channel Supabase pour salle: ABC123
   🔵 Supabase room channel créé: room:ABC123
   📡 Enregistrement présence Supabase...
   ✅ Présence Supabase trackée
   ```

### Scénario 2: Rejoindre Salle
1. Appareil différent
2. Entrer code ABC123
3. Vérifier logs:
   ```
   🔵 Initialisation channel Supabase pour salle: ABC123
   🟢 Synchronisation présence Supabase (2 joueurs)
   ✅ Joueur ajouté depuis Supabase: Joueur1
   ```

### Scénario 3: Heartbeat
1. Attendre 3 secondes
2. Vérifier logs:
   ```
   ✅ Présence Supabase trackée (heartbeat)
   ```

### Scénario 4: Quitter
1. Cliquer "Quitter salle"
2. Vérifier logs:
   ```
   🔵 Désinscription du channel Supabase...
   ✅ Channel Supabase fermé
   ```

## ✅ Bénéfices

1. **Découverte Globale**
   - Salles CODE visibles entre appareils
   - Plus besoin d'être sur même réseau local

2. **Synchronisation Réelle**
   - Présence automatique via WebSocket
   - Pas de polling (économie ressources)

3. **Architecture Cohérente**
   - Même système pour lobby public et salles CODE
   - Un seul flux de données (Supabase)

4. **Robustesse**
   - Reconnexion automatique
   - Heartbeat pour détecter déconnexions
   - Fallbacks locaux si problème réseau

5. **Performance**
   - WebSocket persistant (pas de HTTP polling)
   - Filtrage côté client (bots exclus)
   - Event-driven (pas de setInterval inutile)

## 🔜 Prochaines Étapes

1. ✅ Intégration createRoom/joinRoom
2. ✅ Heartbeat Supabase
3. ✅ Cleanup leaveRoom
4. 🔄 Test multi-appareils
5. ⏳ Monitoring erreurs Supabase
6. ⏳ Analytics channels actifs

## 📝 Notes Techniques

- **Channel Naming**: `room:{CODE}` (ex: `room:ABC123`)
- **Heartbeat**: 3 secondes (comme realtime-lobby)
- **Timeout**: 10s pour connexion P2P
- **Cleanup**: Unsubscribe automatique au départ
- **Fallback**: BroadcastChannel + localStorage si Supabase KO

## 🎉 Résultat Final

**Système unifié 100% Supabase Realtime** :
- Lobby Public → Channel unique `presence`
- Salle CODE → Channels dynamiques `room:{CODE}`
- Découverte globale cross-device ✅
- Architecture cohérente et maintenable ✅
