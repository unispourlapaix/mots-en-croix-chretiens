# 🎮 Guide Multijoueur - Système de Lobby

## 🌐 Fonctionnement

Le système de multijoueur utilise **WebRTC P2P** (peer-to-peer) pour les connexions directes entre joueurs, sans serveur central.

### Architecture

```
Joueur A (Créateur)  ←→  PeerJS Server  ←→  Joueur B (Rejoignant)
     ↓                                            ↓
   Code: ABC123  ──────────────────────→  Entre: ABC123
     ↓                                            ↓
   [Connexion P2P directe établie]
```

## 👥 Liste "Joueurs en Ligne"

### Ce qui est affiché

La liste montre les joueurs **sur le même navigateur** (onglets multiples) :
- ✅ Vous-même
- ✅ Autres onglets ouverts  
- ✅ Bots IA actifs

### Ce qui n'est PAS affiché

- ❌ Joueurs sur d'autres navigateurs
- ❌ Joueurs sur d'autres appareils
- ❌ Joueurs sur Internet

**Raison** : Le système P2P nécessite un mécanisme de découverte centralisé (Supabase Realtime, serveur lobby) qui n'est pas activé par défaut pour rester 100% gratuit.

## 🏠 Comment Jouer Ensemble ?

### Méthode 1 : Codes de Salle (Recommandé)

#### 1️⃣ Créateur
1. Cliquer sur **"🎮 Créer Partie"**
2. Un code court s'affiche (ex: `ABC123`)
3. Partager ce code par SMS, email, Discord, etc.

#### 2️⃣ Rejoignant(s)
1. Cliquer sur **"🎮 Rejoindre"**
2. Entrer le code reçu
3. Connexion P2P directe établie ✅

### Méthode 2 : Même Navigateur (Multi-Onglets)

Si deux joueurs ouvrent l'app dans **2 onglets du même navigateur** :
1. Chaque onglet est visible dans "Joueurs en Ligne"
2. Clic sur **"🚪 Rejoindre"** pour connecter

Utile pour :
- Tester le multijoueur
- Jouer en local avec famille

## 📋 États de Connexion

### 🟢 Mode Auto (🔓 Ouvert)
- Les joueurs peuvent rejoindre directement
- Pas de demande d'autorisation
- Idéal pour jouer entre amis

### ✋ Mode Manuel (🔒 Privé)
- Les joueurs doivent demander l'accès
- L'hôte accepte/refuse chaque demande
- Idéal pour contrôler qui entre

## 🔧 Troubleshooting

### "Aucun joueur en ligne"

**Normal !** C'est le comportement attendu si :
- Vous êtes seul
- Personne n'est sur le même navigateur
- Les autres sont sur Internet (pas de découverte automatique)

**Solution** : Utilisez les **codes de salle** 🏠

### "Impossible de rejoindre"

Causes possibles :
1. **Code invalide** : Vérifier le code (6 caractères)
2. **Code expiré** : Les codes expirent après 24h
3. **Salle pleine** : Maximum 8 joueurs par salle
4. **Hôte déconnecté** : L'hôte a fermé l'app

### "Connexion PeerJS échoue"

Si l'erreur CORS PeerJS persiste :
1. Recharger la page (F5)
2. Vider le cache navigateur
3. Le système bascule automatiquement vers un serveur fallback après 5s

## 🚀 Activation Lobby Global (Optionnel)

Pour voir **tous** les joueurs en temps réel (cross-browser) :

### Option A : Supabase Realtime

1. Activer Realtime dans Supabase Dashboard
2. Créer une table `online_players` :
```sql
CREATE TABLE online_players (
    peer_id TEXT PRIMARY KEY,
    username TEXT,
    avatar TEXT,
    last_seen TIMESTAMPTZ DEFAULT NOW()
);
```

3. Modifier [room-system.js](js/room-system.js) pour utiliser Realtime :
```javascript
// Écouter les joueurs en ligne
supabase
    .channel('online')
    .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'online_players' 
    }, (payload) => {
        this.handlePlayerPresence(payload.new);
    })
    .subscribe();
```

**Coût** : Gratuit jusqu'à 200 connexions simultanées

### Option B : Serveur Lobby PeerJS

Déployer un serveur Node.js qui :
1. Collecte les peer IDs
2. Broadcast la liste à tous
3. Les clients se connectent en P2P après découverte

Voir [LOBBY_SYSTEM.md](LOBBY_SYSTEM.md) pour plus de détails.

## 📊 Performance

### Latence
- **P2P direct** : 20-100ms (excellent)
- **Via serveur TURN** : 100-300ms (si NAT strict)

### Bande Passante
- **Chat texte** : ~1 KB/s (négligeable)
- **État de jeu** : ~5 KB/s par connexion
- **8 joueurs** : ~40 KB/s total

### Limite Gratuite
Le système est **100% gratuit** en utilisant :
- PeerJS Cloud (serveur signaling)
- Google STUN (traversée NAT)

## 🎯 Résumé

✅ **Ce qui fonctionne out-of-the-box** :
- Codes de salle (cross-device/cross-browser)
- Multi-onglets même navigateur
- Bots IA

❌ **Ce qui nécessite configuration** :
- Lobby global automatique
- Découverte cross-browser sans code

💡 **Recommandation** : 
Utiliser les **codes de salle** - Simple, gratuit, fiable !

---

**Besoin d'aide ?** Voir aussi :
- [MULTIPLAYER-MODE.md](MULTIPLAYER-MODE.md) - Architecture complète
- [REFONTE_P2P_SIMPLE.md](REFONTE_P2P_SIMPLE.md) - Détails P2P
- [PRESENCE_SYSTEM.md](PRESENCE_SYSTEM.md) - Système de présence
