# 🌍 Système de Découverte P2P - 100% GRATUIT

Ce jeu utilise une architecture **100% décentralisée** avec PeerJS pour la découverte mondiale des joueurs.

## 🎯 Pourquoi PeerJS pur ?

❌ **Supabase gratuit** = Limites strictes, risque de suspension  
❌ **Base de données** = Coûts serveur, maintenance  
❌ **API payante** = Limite d'utilisation

✅ **PeerJS P2P** = 0€ pour toujours, illimité, décentralisé !

## 🔧 Comment ça marche ?

### Principe des "Salles de Découverte"

Au lieu d'une base de données centralisée, le jeu utilise des **salles de rendez-vous P2P** :

1. **Chaque joueur rejoint 5 salles communes** :
   - `JESUS-CROSSWORD-ROOM-0`
   - `JESUS-CROSSWORD-ROOM-1`
   - `JESUS-CROSSWORD-ROOM-2`
   - `JESUS-CROSSWORD-ROOM-3`
   - `JESUS-CROSSWORD-ROOM-4`

2. **Quand 2 joueurs sont dans la même salle** :
   - Ils se découvrent automatiquement
   - Échangent leurs peer IDs
   - Deviennent visibles l'un pour l'autre

3. **Effet "gossip" (propagation)** :
   - Alice découvre Bob
   - Bob découvre Charles
   - Alice voit maintenant Charles aussi (via Bob)
   - **Réseau mondial sans serveur !**

## 📊 Architecture

```
Joueur A          Joueur B          Joueur C
   |                 |                 |
   |--- Room-0 ------+                 |
   |--- Room-1 ---------------------+  |
   |--- Room-2 ------+              |  |
   |                 |              |  |
   |                 |--- Room-3 ------|
   |                 |--- Room-4 ------|
   |                 |                 |
   ▼                 ▼                 ▼
Découverte      Découverte        Découverte
A ↔ B           B ↔ C             C ↔ A
```

**Résultat** : Tout le monde se voit, sans serveur central !

## ✅ Installation

**Aucune installation nécessaire !** Le système fonctionne automatiquement.

### Vérification

1. **Ouvrir le jeu dans 2 navigateurs différents**
2. **Se connecter avec 2 comptes différents**
3. **Ouvrir la console (F12)**
4. **Chercher ces messages** :
   ```
   ✅ Système de présence P2P chargé - 100% GRATUIT
   📢 Annonce présence P2P: Alice
   🔍 Rejoindre salles de découverte P2P...
   ✅ Connecté à salle 0
   ✅ Connecté à salle 1
   👋 Joueur découvert via P2P: Bob
   ```

## 🎮 Test Multi-Ordinateurs

### Ordinateur A
1. Ouvrir le jeu
2. Se connecter
3. Console : `window.presenceSystem.myPresence`
   - Devrait afficher votre `peerId`

### Ordinateur B
1. Ouvrir le jeu (même URL)
2. Se connecter avec un autre compte
3. Attendre 5-10 secondes
4. Console : `window.presenceSystem.getOnlinePlayers()`
   - Devrait afficher le joueur de l'Ordinateur A

### Si ça ne marche pas

**Problème : "Salle vide ou inexistante"**
- **Normal !** Les salles n'existent que quand quelqu'un s'y connecte
- Solution : Assurez-vous que les 2 joueurs sont connectés **en même temps**

**Problème : Ne se voient pas après 30s**
- Vérifier que PeerJS fonctionne : `window.simpleChatSystem.peer.id`
- Vérifier le firewall : PeerJS utilise WebRTC (ports UDP)
- Essayer sur un autre réseau (4G/5G au lieu de WiFi)

## 🔥 Avantages

| Caractéristique | Supabase | PeerJS P2P |
|----------------|----------|------------|
| **Coût** | Gratuit puis payant | 0€ pour toujours |
| **Limites** | 500MB, 2GB/mois | Illimité |
| **Maintenance** | Risque suspension | Aucune |
| **Latence** | 100-500ms | 50-200ms (direct) |
| **Scalabilité** | Limitée free tier | Infinie |
| **Vie privée** | Données centralisées | 100% P2P |

## 🛠️ Configuration Avancée

### Changer le nombre de salles

Par défaut : **5 salles**

**Modifier** dans `js/presence-system.js` ligne 12 :
```javascript
this.MAX_ROOMS = 10; // Plus de salles = plus de chances de découverte
```

**Trade-off** :
- ✅ Plus de salles = plus de découvertes
- ❌ Plus de connexions = plus de bande passante

### Changer le préfixe des salles

Par défaut : `JESUS-CROSSWORD-ROOM-`

**Modifier** ligne 11 :
```javascript
this.DISCOVERY_ROOM_PREFIX = 'MON-JEU-CUSTOM-'; 
```

⚠️ **Important** : Tous les joueurs doivent utiliser le **même préfixe** pour se découvrir !

### Heartbeat P2P

Par défaut : **3 secondes**

**Modifier** dans `startHeartbeat()` :
```javascript
}, 5000); // Heartbeat toutes les 5s au lieu de 3s
```

## 🐛 Dépannage

### Joueurs ne se découvrent pas

**Causes possibles** :
1. Firewall bloque WebRTC
2. Pas connectés en même temps
3. PeerJS serveur temporairement down

**Solutions** :
1. Tester sans firewall/VPN
2. Attendre 30s après connexion
3. Vérifier `peer.open` dans console

### Connexions P2P échouent

**Symptôme** : Voir les joueurs mais impossible de les inviter

**Cause** : NAT/Firewall strict

**Solution** :
- Activer UPnP sur le routeur
- Utiliser connexion 4G/5G (pas de NAT)
- Certains réseaux d'entreprise bloquent WebRTC

### Performance réseau

**Symptôme** : Lag dans le jeu partagé

**Cause** : Trop de connexions P2P actives

**Solution** :
- Réduire `MAX_ROOMS` à 3 au lieu de 5
- Fermer les onglets inutilisés
- Limiter le nombre de joueurs simultanés

## 📚 Ressources

- **PeerJS** : [https://peerjs.com](https://peerjs.com)
- **WebRTC** : [https://webrtc.org](https://webrtc.org)
- **Serveur PeerJS gratuit** : `0.peerjs.com` (CloudFlare)

## 🎉 Résumé

Le système utilise des **salles de rendez-vous P2P** au lieu d'une base de données.

**Avantages** :
- ✅ 0€ pour toujours
- ✅ Illimité
- ✅ Décentralisé
- ✅ Privé
- ✅ Résilient

**Inconvénients** :
- ⚠️ Nécessite 2+ joueurs connectés en même temps
- ⚠️ Firewall/NAT peuvent bloquer

Pour un jeu chrétien communautaire, c'est **parfait** car les joueurs jouent ensemble en temps réel ! 🙏

---

**Version** : 3.0 - P2P pur, 0 dépendance serveur  
**Dernière mise à jour** : Décembre 2024

---

**Version** : 3.0 - P2P pur, 0 dépendance serveur  
**Dernière mise à jour** : Décembre 2024
