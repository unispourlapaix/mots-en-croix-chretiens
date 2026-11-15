# 🎮 Système de Présence - Documentation Technique

> Archive de l’ancienne architecture. Le [README](README.md#connexion-et-sauvegarde) décrit la version actuelle.

## 🌐 Architecture Hybride

Le système utilise une approche **hybride** pour maximiser la réactivité locale et permettre la découverte mondiale :

### 1. Local (localStorage + BroadcastChannel)
- **Portée** : Même navigateur, tous les onglets
- **Latence** : < 10ms
- **Usage** : Synchronisation immédiate entre onglets
- **Heartbeat** : 3 secondes

### 2. Mondial (Supabase Realtime)
- **Portée** : Tous les ordinateurs du monde
- **Latence** : 100-500ms
- **Usage** : Découverte mondiale des joueurs
- **Heartbeat** : 10 secondes (économiser DB)

## 📊 Flux de Données

```
┌─────────────────┐
│   Joueur A      │
│  (Ordinateur 1) │
└────────┬────────┘
         │
         │ 1. announcePresence()
         │
         ├──────────────────────────────────────┐
         │                                      │
         │ localStorage                         │ Supabase
         │ + BroadcastChannel                   │ (online_players)
         │                                      │
         │ ┌──────────────────┐                │ ┌──────────────────┐
         └─│ Onglet 1 | Sync  │◄───3s──────────┤ │ INSERT/UPSERT    │
           │ Onglet 2 | < 10ms│                │ │ peer_id          │
           └──────────────────┘                │ │ username         │
                                                │ │ last_heartbeat   │
         ┌──────────────────────────────────────┼─┤ RLS: PUBLIC      │
         │                                      │ └────────┬─────────┘
         │                                      │          │
         │                                      │          │ Realtime
         │                                      │          │ Subscription
         │                                      │          │
         │                                      │          ▼
┌────────┴────────┐                             │ ┌──────────────────┐
│   Joueur B      │◄────────────────────────────┘ │ get_online_players()
│  (Ordinateur 2) │                                │ loadOnlinePlayers()
└─────────────────┘                                │ handleSupabaseChange()
                                                   └──────────────────┘
         │
         │ 4. Voir Joueur A dans chat bubble
         │ 5. Cliquer pour se connecter en P2P
         │
         ▼
    PeerJS Connexion Directe
    (0.peerjs.com gratuit)
```

## 🔧 Composants Clés

### PresenceSystem (js/presence-system.js)

```javascript
class PresenceSystem {
    constructor() {
        this.myPresence = null;           // Ma propre présence
        this.onlinePlayers = new Map();   // Map<peerId, playerData>
        this.heartbeatInterval = null;    // Timer heartbeat
        this.channel = null;              // BroadcastChannel local
        this.realtimeChannel = null;      // Supabase Realtime
        this.useSupabase = false;         // Mode online activé
    }
}
```

### Méthodes Principales

#### 1. `init()`
```javascript
init() {
    // Détecter si Supabase disponible
    this.useSupabase = typeof window.supabase !== 'undefined';
    
    if (this.useSupabase) {
        console.log('🌍 Mode ONLINE - Supabase Realtime activé');
        this.initSupabaseRealtime();
    } else {
        console.log('💾 Mode LOCAL - localStorage uniquement');
    }
    
    // BroadcastChannel pour sync locale
    this.channel = new BroadcastChannel('crossword_presence');
    this.channel.onmessage = (e) => this.handleChannelMessage(e.data);
    
    // Cleanup périodique
    setInterval(() => this.cleanupInactive(), 5000);
}
```

#### 2. `initSupabaseRealtime()`
```javascript
initSupabaseRealtime() {
    // S'abonner aux changements en temps réel
    this.realtimeChannel = window.supabase
        .channel('online_players_changes')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'online_players'
        }, (payload) => {
            this.handleSupabaseChange(payload);
        })
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('✅ Abonné au canal Realtime');
                this.loadOnlinePlayersFromSupabase();
            }
        });
}
```

#### 3. `announcePresence(peerId, username, avatar, acceptMode)`
```javascript
async announcePresence(peerId, username, avatar, acceptMode) {
    this.myPresence = { peerId, username, avatar, acceptMode, timestamp: Date.now() };
    
    // Sauvegarder localement
    this.saveToStorage();
    
    // Broadcast aux autres onglets
    if (this.channel) {
        this.channel.postMessage({ type: 'presence', presence: this.myPresence });
    }
    
    // Annoncer sur Supabase si disponible
    if (this.useSupabase) {
        await this.announcePresenceOnline(peerId, username, avatar, acceptMode);
    }
    
    // Démarrer heartbeat
    this.startHeartbeat();
}
```

#### 4. `announcePresenceOnline(peerId, username, avatar, acceptMode)`
```javascript
async announcePresenceOnline(peerId, username, avatar, acceptMode) {
    const { data: { user } } = await window.supabase.auth.getUser();
    
    const { error } = await window.supabase
        .from('online_players')
        .upsert({
            peer_id: peerId,
            username: username,
            user_id: user?.id || null,
            avatar: avatar,
            accept_mode: acceptMode,
            last_heartbeat: new Date().toISOString()
        }, {
            onConflict: 'peer_id'
        });
    
    if (!error) console.log('🌍 Présence annoncée sur Supabase');
}
```

#### 5. `startHeartbeat()`
```javascript
startHeartbeat() {
    let heartbeatCount = 0;
    
    this.heartbeatInterval = setInterval(async () => {
        if (!this.myPresence) return;
        
        this.myPresence.timestamp = Date.now();
        heartbeatCount++;
        
        // Heartbeat local toutes les 3s
        this.saveToStorage();
        this.channel?.postMessage({
            type: 'heartbeat',
            peerId: this.myPresence.peerId,
            timestamp: Date.now()
        });
        
        // Heartbeat Supabase toutes les 10s (économiser DB)
        if (this.useSupabase && heartbeatCount % 3 === 0) {
            await this.updateHeartbeatOnline(this.myPresence.peerId);
        }
        
        // Reload online players toutes les 15s
        if (this.useSupabase && heartbeatCount % 5 === 0) {
            await this.loadOnlinePlayersFromSupabase();
        }
    }, 3000);
}
```

#### 6. `handleSupabaseChange(payload)`
```javascript
handleSupabaseChange(payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
        case 'INSERT':
        case 'UPDATE':
            if (newRecord && newRecord.peer_id !== this.myPresence?.peerId) {
                this.onlinePlayers.set(newRecord.peer_id, {
                    peerId: newRecord.peer_id,
                    username: newRecord.username,
                    avatar: newRecord.avatar || '😊',
                    acceptMode: newRecord.accept_mode || 'manual',
                    timestamp: new Date(newRecord.last_heartbeat).getTime()
                });
                this.notifyPresenceUpdate();
                console.log('👋 Joueur en ligne:', newRecord.username);
            }
            break;
            
        case 'DELETE':
            if (oldRecord) {
                this.onlinePlayers.delete(oldRecord.peer_id);
                this.notifyPresenceUpdate();
                console.log('👋 Joueur parti:', oldRecord.username);
            }
            break;
    }
}
```

#### 7. `stop()`
```javascript
async stop() {
    // Arrêter heartbeat
    if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
    }
    
    // Broadcast déconnexion locale
    if (this.channel && this.myPresence) {
        this.channel.postMessage({
            type: 'disconnect',
            peerId: this.myPresence.peerId
        });
    }
    
    // Retirer du localStorage
    const stored = localStorage.getItem(this.storageKey);
    if (stored && this.myPresence) {
        const players = JSON.parse(stored);
        delete players[this.myPresence.peerId];
        localStorage.setItem(this.storageKey, JSON.stringify(players));
    }
    
    // Retirer de Supabase
    if (this.useSupabase && this.myPresence) {
        await this.removePresenceOnline(this.myPresence.peerId);
    }
    
    // Unsubscribe Realtime
    if (this.realtimeChannel) {
        await window.supabase.removeChannel(this.realtimeChannel);
        this.realtimeChannel = null;
    }
    
    this.myPresence = null;
}
```

## 🗄️ Schéma Base de Données

### Table `online_players`

```sql
CREATE TABLE online_players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    peer_id TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    avatar TEXT DEFAULT '😊',
    accept_mode TEXT DEFAULT 'manual',
    last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Fonctions SQL

#### `cleanup_inactive_players()`
```sql
CREATE OR REPLACE FUNCTION cleanup_inactive_players()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM online_players
    WHERE last_heartbeat < NOW() - INTERVAL '30 seconds';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
```

#### `update_player_heartbeat(p_peer_id TEXT)`
```sql
CREATE OR REPLACE FUNCTION update_player_heartbeat(p_peer_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE online_players
    SET last_heartbeat = NOW()
    WHERE peer_id = p_peer_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;
```

#### `get_online_players()`
```sql
CREATE OR REPLACE FUNCTION get_online_players()
RETURNS TABLE (
    peer_id TEXT,
    username TEXT,
    avatar TEXT,
    accept_mode TEXT,
    last_heartbeat TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        op.peer_id,
        op.username,
        op.avatar,
        op.accept_mode,
        op.last_heartbeat
    FROM online_players op
    WHERE op.last_heartbeat > NOW() - INTERVAL '30 seconds'
    ORDER BY op.last_heartbeat DESC;
END;
$$ LANGUAGE plpgsql;
```

## 🔐 Row Level Security (RLS)

```sql
ALTER TABLE online_players ENABLE ROW LEVEL SECURITY;

-- Lecture publique (tout le monde peut voir les joueurs)
CREATE POLICY "Allow public select" ON online_players
    FOR SELECT USING (true);

-- Insertion publique (tout le monde peut s'annoncer)
CREATE POLICY "Allow public insert" ON online_players
    FOR INSERT WITH CHECK (true);

-- Mise à jour publique (heartbeat)
CREATE POLICY "Allow public update" ON online_players
    FOR UPDATE USING (true);

-- Suppression publique (déconnexion)
CREATE POLICY "Allow public delete" ON online_players
    FOR DELETE USING (true);
```

## 📈 Performance & Limites

### Fréquences

| Action | Local | Supabase | Raison |
|--------|-------|----------|--------|
| Heartbeat | 3s | 10s | Économiser requêtes DB |
| Reload liste | N/A | 15s | Éviter spam, Realtime suffit |
| Cleanup inactifs | 5s | 30s | Seuil déconnexion |

### Limites Supabase Free Tier

- **500 MB** stockage : ~100 000 joueurs (5 KB/joueur)
- **2 GB** transfer/mois : ~50 000 heartbeats/mois
- **50 000** requêtes/mois : ~1 600/jour

**Estimation** : Pour 100 joueurs actifs par jour jouant 30 min en moyenne :
- Heartbeats : 100 × 180 heartbeats (30 min ÷ 10s) = 18 000/jour
- Realtime events : Gratuits (inclus)
- Total : < 20 000 requêtes/jour → OK pour free tier

## 🚀 Workflow Utilisateur

### Scénario : Alice et Bob jouent ensemble

1. **Alice ouvre le jeu (Ordinateur A)**
   ```
   PresenceSystem.init()
   → Mode ONLINE détecté
   → Subscribe Realtime channel
   → loadOnlinePlayersFromSupabase() → []
   ```

2. **Alice se connecte**
   ```
   announcePresence('alice-peer-123', 'Alice', '👸')
   → saveToStorage() local
   → announcePresenceOnline() → INSERT INTO online_players
   → startHeartbeat() → toutes les 3s local, 10s Supabase
   ```

3. **Bob ouvre le jeu (Ordinateur B)**
   ```
   PresenceSystem.init()
   → Mode ONLINE détecté
   → Subscribe Realtime channel
   → loadOnlinePlayersFromSupabase() → [Alice]
   → onlinePlayers.set('alice-peer-123', ...)
   → notifyPresenceUpdate() → Affiche Alice dans chat bubble
   ```

4. **Bob se connecte**
   ```
   announcePresence('bob-peer-456', 'Bob', '🤴')
   → INSERT INTO online_players
   → Realtime event → Alice reçoit 'INSERT' payload
   → handleSupabaseChange() → onlinePlayers.set('bob-peer-456', ...)
   → Alice voit maintenant Bob dans sa chat bubble
   ```

5. **Alice invite Bob**
   ```
   roomSystem.invitePlayer('bob-peer-456')
   → peer.connect('bob-peer-456')
   → PeerJS établit connexion P2P directe
   → Chat et jeu partagé fonctionnent
   ```

6. **Bob ferme le jeu**
   ```
   window.addEventListener('beforeunload')
   → presenceSystem.cleanup()
   → stop() → DELETE FROM online_players WHERE peer_id = 'bob-peer-456'
   → Realtime event → Alice reçoit 'DELETE' payload
   → Alice ne voit plus Bob
   ```

## 🐛 Debugging

### Logs à surveiller

**Console navigateur** :
```
✅ Système de présence initialisé
🌍 Mode ONLINE - Supabase Realtime activé
✅ Abonné au canal Realtime
👥 Joueurs en ligne chargés: 2
🌍 Présence annoncée sur Supabase
👋 Joueur en ligne: Alice
👋 Joueur parti: Bob
```

**SQL Debug** :
```sql
-- Voir tous les joueurs
SELECT * FROM online_players;

-- Voir joueurs actifs
SELECT * FROM get_online_players();

-- Compter joueurs actifs
SELECT COUNT(*) FROM online_players 
WHERE last_heartbeat > NOW() - INTERVAL '30 seconds';

-- Forcer cleanup
SELECT cleanup_inactive_players();
```

### Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `Mode LOCAL` au lieu de `Mode ONLINE` | Supabase non chargé | Vérifier `window.supabase` |
| Ne voit pas autres joueurs | RLS bloque | Vérifier politiques publiques |
| Joueurs fantômes | Cleanup pas actif | Appeler `cleanup_inactive_players()` |

## 📚 Références

- **PeerJS** : [https://peerjs.com/docs/](https://peerjs.com/docs/)
- **Supabase Realtime** : [https://supabase.com/docs/guides/realtime](https://supabase.com/docs/guides/realtime)
- **BroadcastChannel API** : [https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel)

---

**Version** : 2.0 - Système hybride local + mondial  
**Dernière mise à jour** : 2024
