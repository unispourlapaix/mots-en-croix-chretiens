# Migration PeerJS → Trystero

## 🎯 Objectif
Remplacer PeerJS par **Trystero** pour un système P2P plus robuste et décentralisé.

## ❌ Problèmes avec PeerJS
- Dépend d'un serveur signaling central (`0.peerjs.com`)
- Serveur peut tomber ou être surchargé
- Connexion fragile en localhost
- Nécessite un serveur tiers pour fonctionner

## ✅ Avantages de Trystero
- **Décentralisé** : Utilise BitTorrent trackers publics (pas de serveur central)
- **Plus robuste** : Plusieurs trackers en fallback
- **Gratuit** : Pas de serveur à héberger
- **Léger** : ~10kb vs 70kb (PeerJS)
- **Simple** : API similaire à PeerJS
- **Fiable** : Fonctionne même en localhost

## 🔧 Architecture

### Trystero Adapter (`js/trystero-adapter.js`)
Un adaptateur qui émule l'API PeerJS pour compatibilité avec le code existant.

**API compatible :**
```javascript
// Création peer (comme PeerJS)
const peer = new Peer(config);

peer.on('open', (id) => {
    console.log('Room ID:', id);
});

peer.on('connection', (conn) => {
    conn.on('data', (data) => {
        console.log('Message reçu:', data);
    });
    
    conn.send({ type: 'chat', message: 'Hello!' });
});
```

### Canaux de communication
Trystero crée des "actions" pour différents types de données :
- `chat` : Messages de chat
- `room` : Données de salle (rejoin, kick, etc.)
- `presence` : Présence des joueurs
- `race` : Données de course multijoueur

### BitTorrent Trackers
Utilise des trackers WebTorrent publics :
- `wss://tracker.openwebtorrent.com`
- `wss://tracker.btorrent.xyz`
- `wss://tracker.files.fm:7073/announce`

## 📋 Changements effectués

### 1. index.html
```html
<!-- Ancien -->
<script src="https://cdn.jsdelivr.net/npm/peerjs@1.5.2/dist/peerjs.min.js"></script>

<!-- Nouveau -->
<script type="module">
    import { joinRoom } from 'https://cdn.jsdelivr.net/npm/trystero@0.19.2/+esm';
    window.joinRoom = joinRoom;
</script>
<script src="js/trystero-adapter.js"></script>
```

### 2. Code existant
**Aucun changement nécessaire** ! L'adaptateur émule l'API PeerJS.

## 🚀 Fonctionnement

### Création de salle
```javascript
// L'adaptateur génère un room ID unique
const peer = new Peer();
peer.on('open', (roomId) => {
    console.log('Room créée:', roomId);
    // Partager ce roomId pour que d'autres rejoignent
});
```

### Rejoindre une salle
```javascript
const peer = new Peer();
const conn = peer.connect('room-id-123456');
conn.on('open', () => {
    console.log('Connecté à la salle !');
    conn.send({ type: 'chat', message: 'Salut !' });
});
```

### Broadcast
```javascript
// Envoyer à tous les peers de la room
peer.broadcast({
    type: 'presence',
    username: 'Jean',
    status: 'online'
});
```

## 🔍 Debugging

### Console logs
```
✅ Trystero chargé
✅ Adaptateur Trystero chargé - P2P décentralisé activé
🚀 Initialisation Trystero P2P...
📍 Room: room-1733990000-abc123
🆔 Peer ID: peer-1733990000-xyz789
👋 Nouveau peer connecté: peer-1733990001-def456
✅ Trystero P2P initialisé
```

### Erreurs communes
- **Room vide** : Normal au début, attendre que d'autres rejoignent
- **Tracker timeout** : Un tracker ne répond pas, les autres prennent le relais
- **Connexion lente** : WebRTC négocie, peut prendre 2-5 secondes

## 📊 Comparaison

| Critère | PeerJS | Trystero |
|---------|--------|----------|
| Serveur central | ✅ Requis | ❌ Aucun |
| Taille bundle | 70kb | 10kb |
| Fiabilité | ⚠️ Dépend du serveur | ✅ Multiple trackers |
| Localhost | ⚠️ Problématique | ✅ Fonctionne |
| Coût | Gratuit (limité) | Gratuit |
| Setup | Simple | Simple |
| WebRTC | ✅ | ✅ |

## 🧪 Tests

### Test basique
```javascript
// Dans la console
const adapter = new TrysteroAdapter();
await adapter.init('TestUser');
console.log('Room ID:', adapter.roomId);
console.log('Peer ID:', adapter.id);
```

### Test avec 2 onglets
1. **Onglet 1** : Créer une salle, noter le room ID
2. **Onglet 2** : Rejoindre avec `peer.connect(roomId)`
3. Envoyer des messages dans les deux sens

## 🎯 Prochaines étapes

1. ✅ Remplacer PeerJS par Trystero
2. ✅ Créer l'adaptateur compatible
3. 🔄 Tester le chat P2P
4. 🔄 Tester les salles multijoueur
5. 🔄 Tester les courses
6. 📝 Documenter les rooms persistantes

## 📚 Ressources

- [Trystero GitHub](https://github.com/dmotz/trystero)
- [Trystero Docs](https://github.com/dmotz/trystero#readme)
- [WebTorrent Trackers](https://github.com/ngosang/trackerslist)
