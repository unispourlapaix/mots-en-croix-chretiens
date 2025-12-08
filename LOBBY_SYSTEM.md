# 🙏 Système de Lobby "LoveJesus"

## Vue d'ensemble

Le lobby **"LoveJesus"** est un point de rencontre P2P **100% gratuit** qui permet à tous les joueurs de se découvrir automatiquement, sans codes ni serveur payant !

## 🌍 Comment ça fonctionne

### Architecture

```
┌─────────────────────────────────────────────┐
│         Lobby "LoveJesus" (PeerJS)          │
│         ID Fixe: LoveJesus                  │
│         Serveur: 0.peerjs.com (gratuit)     │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
    Joueur A  Joueur B  Joueur C
    
1. Chaque joueur se connecte au lobby "LoveJesus"
2. Le lobby broadcast la liste des joueurs
3. Les joueurs se voient automatiquement
4. Connexion P2P directe pour jouer
```

### Flux de données

1. **Joueur se connecte** → Annonce sa présence au lobby
2. **Lobby reçoit** → Ajoute à la liste + Broadcast à tous
3. **Tous les joueurs reçoivent** → Mise à jour de leur liste
4. **Heartbeat** → Toutes les 10s, chaque joueur réannonce sa présence
5. **Déconnexion** → Le lobby notifie les autres joueurs

## 🚀 Utilisation

### Pour les joueurs (automatique)

**Rien à faire !** Connectez-vous simplement et vous verrez vos amis apparaître automatiquement dans la bulle de chat.

### Pour maintenir le lobby actif (optionnel)

1. Ouvrez `lobby.html` dans un navigateur
2. Laissez la page ouverte (vous pouvez minimiser)
3. Le lobby reste actif tant que la page est ouverte

**Note**: Si personne ne maintient le lobby, PeerJS le crée automatiquement à la première connexion. Mais avoir un lobby permanent améliore la stabilité.

## 🔧 Configuration technique

### `js/presence-system.js`

Système de présence côté client :

```javascript
const LOBBY_ID = "LoveJesus"; // ID fixe du lobby

// Se connecte au lobby
connectToLobby()

// Broadcast présence toutes les 10s
setInterval(() => broadcastPresence(), 10000)

// Reçoit la liste des joueurs
handleLobbyMessage({ type: 'player_list', data: [...] })
```

### `js/lobby-server.js`

Serveur lobby (optionnel) :

```javascript
// Crée le peer avec ID fixe
new Peer("LoveJesus", { host: '0.peerjs.com' })

// Gère les connexions
peer.on('connection', handleConnection)

// Broadcast liste toutes les 5s
setInterval(() => broadcastPlayerList(), 5000)
```

## 📊 Avantages

✅ **100% Gratuit** - Utilise le serveur PeerJS cloud gratuit  
✅ **Découverte mondiale** - Les joueurs du monde entier se voient  
✅ **Pas de codes** - Plus besoin de partager des codes manuellement  
✅ **Simple** - Connexion automatique transparente  
✅ **Scalable** - PeerJS gère des milliers de connexions  
✅ **Fiable** - Infrastructure PeerJS stable et éprouvée  

## ⚠️ Limitations

- **Dépend de PeerJS Cloud** : Si le service PeerJS est down, le lobby ne fonctionne pas
- **Pas de persistance** : Si le lobby s'éteint, la liste des joueurs est perdue (mais se reconstruit rapidement)
- **Latence** : Petite latence (~1-2s) pour la découverte initiale

## 🔮 Améliorations futures possibles

1. **Lobby multi-régions** : `LoveJesus-EU`, `LoveJesus-US`, `LoveJesus-ASIA`
2. **Backup avec Firebase** : Fallback si PeerJS est indisponible
3. **Présence enrichie** : Statut (en jeu, disponible, occupé), niveau, avatar custom
4. **Matchmaking** : Trouver des joueurs de niveau similaire
5. **Salles privées** : Créer des lobbies temporaires pour groupes d'amis

## 🛠️ Déploiement du lobby permanent

### Option 1 : GitHub Pages (Recommandé)

Le fichier `lobby.html` peut être hébergé gratuitement sur GitHub Pages et restera actif tant que quelqu'un visite la page.

### Option 2 : Serveur Node.js (Avancé)

```bash
# Installer PeerJS Server
npm install peer

# Lancer le serveur
node lobby-server.js
```

### Option 3 : Vercel/Netlify (Gratuit)

Déployez `lobby.html` sur Vercel ou Netlify pour un uptime 24/7 gratuit.

## 📝 Notes de développement

- **ID Lobby fixe** : "LoveJesus" - Ne pas changer !
- **Heartbeat** : 10 secondes (ajustable)
- **Timeout** : 30 secondes sans heartbeat = déconnecté
- **Reconnexion** : Automatique après 5 secondes en cas d'erreur

## 🙏 Pourquoi "LoveJesus" ?

Un nom qui rappelle l'amour du Christ et l'esprit du jeu de mots croisés chrétiens. Un point de rencontre bienveillant pour tous les joueurs ! ✝️

---

**Créé avec ❤️ pour la communauté chrétienne**
