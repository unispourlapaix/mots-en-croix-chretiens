# 🎮 Système de Présence Automatique

## ✨ Nouveau système GRATUIT et intuitif

Le jeu utilise maintenant un système de découverte automatique **100% gratuit** sans besoin de serveur externe !

## 🚀 Comment ça marche ?

### Technologie utilisée
- **BroadcastChannel API** : Communication entre onglets du même navigateur
- **localStorage** : Persistance des joueurs en ligne
- **Heartbeat** : Mise à jour automatique toutes les 3 secondes
- **Cleanup** : Suppression des joueurs inactifs (>10 secondes)

### Flux utilisateur
1. **Connectez-vous** avec votre compte
2. **Vos amis apparaissent automatiquement** dans la bulle de chat
3. **Cliquez sur "Rejoindre"** → L'ami reçoit une notification
4. **Accepter ou Refuser** la demande
5. **Commencez à jouer ensemble !**

## 🎯 Avantages

✅ **Totalement gratuit** - Pas de serveur externe requis
✅ **Aucun code à partager** - Découverte automatique
✅ **Temps réel** - Les joueurs apparaissent instantanément
✅ **Simple** - Juste accepter ou refuser
✅ **Local** - Fonctionne entre onglets du même navigateur

## 🔧 Architecture technique

### `presence-system.js`
```javascript
class PresenceSystem {
    - BroadcastChannel: Communication inter-onglets
    - localStorage: Persistance des joueurs
    - heartbeat: Mise à jour toutes les 3s
    - cleanup: Suppression joueurs inactifs
    - notifyPresenceUpdate(): Sync avec RoomSystem
}
```

### Événements
- `presence` : Un joueur annonce sa présence
- `heartbeat` : Mise à jour du timestamp
- `disconnect` : Un joueur se déconnecte

### Synchronisation
```javascript
// Dans RoomSystem
window.presenceSystem.start(username, peerId);

// Mise à jour automatique
notifyPresenceUpdate() {
    // Ajoute joueurs à availablePlayers
    // Retire joueurs déconnectés
    // Actualise la bulle chat
}
```

## 📝 Limites actuelles

⚠️ **Découverte locale uniquement**
- Fonctionne entre onglets du même navigateur
- Les joueurs sur différents ordinateurs doivent utiliser un autre moyen pour se découvrir

### Solutions futures possibles
1. **WebRTC Data Channel** avec serveur STUN gratuit
2. **Firebase Realtime Database** (gratuit jusqu'à 1GB)
3. **Socket.io** sur serveur gratuit (Render, Railway)

## 🎨 Interface utilisateur

### Bulle de chat (gauche)
- Liste des joueurs en ligne
- Recherche en temps réel
- Bouton "Rejoindre" par joueur
- Menu contextuel (⋮) : Bloquer/Signaler

### Menu Chat
- Explication du système intuitif
- Plus besoin de codes !
- Guide : Connectez-vous → Voyez vos amis → Jouez

## 🔐 Fonctionnalités sociales

- ✅ **Recherche** : Filtrer les joueurs par nom
- ✅ **Blocage** : Persistant via localStorage
- ✅ **Signalement** : Log console pour modération
- ✅ **Accept Mode** : Auto ou Manual

## 📊 État actuel

**Version** : 2.0 (Sans codes, découverte automatique)
**Statut** : ✅ Fonctionnel en local
**Prochaine étape** : Découverte entre différents ordinateurs

---

💡 **Note** : Pour jouer avec des amis sur différents ordinateurs, ils doivent ouvrir le jeu dans le même navigateur et se partager leur peerId une seule fois, puis le système de présence les synchronisera automatiquement.
