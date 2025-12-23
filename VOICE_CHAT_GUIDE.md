# 🎤 Guide du Chat Vocal

## 📋 Vue d'ensemble

Un système de **chat vocal P2P** intégré aux salles de jeu, permettant aux joueurs de communiquer par la voix en temps réel. Utilise **WebRTC** pour des appels peer-to-peer sans serveur média coûteux.

---

## ✨ Caractéristiques

### 🎯 Fonctionnalités
- **Rooms vocales séparées** - Chaque room de chat a son propre salon vocal optionnel
- **Voice Activity Detection (VAD)** - Indicateur visuel de qui parle
- **Contrôles complets** - Mute/Unmute micro, Deafen/Undeafen son
- **P2P pur** - Pas de serveur média, connexions directes
- **Qualité HD** - Audio 48kHz avec echo cancellation et noise suppression
- **Interface kawaii** - Design cohérent avec le reste de l'app

### 🔧 Technologie
- **WebRTC MediaStream** pour l'audio
- **PeerJS** pour la signalisation (déjà utilisé pour le chat texte)
- **Web Audio API** pour la détection d'activité vocale
- **Optimisations audio** : Echo cancellation, Noise suppression, Auto gain

### 👥 Participants
- **Jusqu'à 15-20 participants** par room (limite mesh P2P)
- **Indicateurs visuels** de qui parle en temps réel
- **Avatar coloré** pour chaque participant
- **Compteur** de participants vocaux

---

## 🎮 Utilisation

### 1. Rejoindre une room de chat
D'abord, créez ou rejoignez une room de chat texte (comme d'habitude).

### 2. Rejoindre le salon vocal
1. Cliquez sur **🎤 Rejoindre le vocal**
2. Autorisez l'accès au microphone dans votre navigateur
3. Vous êtes connecté ! 🎉

### 3. Contrôles vocaux

#### 🎤 Micro (Mute/Unmute)
- Cliquez sur le bouton **🎤 Micro** pour couper/activer votre microphone
- Icône change en **🔇** quand coupé
- Les autres ne vous entendent plus quand muté

#### 🔊 Son (Deafen/Undeafen)
- Cliquez sur **🔊 Son** pour couper/activer le son des autres
- Coupe automatiquement votre micro aussi (pour éviter de parler dans le vide)
- Utile pour se concentrer sans être dérangé

### 4. Liste des participants
- Voir tous les participants vocaux
- Indicateur **🎤 Parle** quand quelqu'un parle
- Animation visuelle en temps réel
- Votre nom est marqué **(vous)**

### 5. Quitter le vocal
- Cliquez sur **🔇 Quitter le vocal**
- Vous restez dans le chat texte
- Vous pouvez rejoindre à nouveau quand vous voulez

---

## 🔒 Permissions navigateur

### Première utilisation
Au premier clic sur "Rejoindre le vocal", le navigateur demandera :
```
Autoriser l'accès au microphone ?
[Bloquer] [Autoriser]
```

**⚠️ Important** : Cliquez sur **Autoriser** sinon le vocal ne fonctionnera pas.

### Erreurs courantes

#### "Permission microphone refusée"
- Vous avez cliqué sur "Bloquer"
- **Solution** : Cliquez sur l'icône 🔒 (ou ℹ️) dans la barre d'adresse
- Changez "Microphone" de "Bloquer" à "Autoriser"
- Rechargez la page

#### "Aucun microphone détecté"
- Votre appareil n'a pas de micro
- Ou le micro est désactivé dans les paramètres système
- **Solution** : Branchez un micro ou activez-le dans les paramètres

#### "Impossible de rejoindre le salon vocal"
- Vérifiez que vous êtes dans une room de chat d'abord
- Vérifiez votre connexion internet
- Essayez de quitter et rejoindre

---

## 🌐 Compatibilité

### Navigateurs supportés
- ✅ **Chrome/Edge** (recommandé)
- ✅ **Firefox**
- ✅ **Safari** (iOS 11+)
- ✅ **Opera**

### Appareils
- ✅ **Desktop** (Windows, Mac, Linux)
- ✅ **Mobile** (Android, iOS)
- ✅ **Tablette**

### Limitations mobiles
- Sur **iOS**, l'app doit être ajoutée à l'écran d'accueil pour un meilleur support
- Certains navigateurs mobiles peuvent limiter l'audio en arrière-plan

---

## ⚡ Performance

### Bande passante
- **Upload** : ~40 kbps par participant (avec votre micro activé)
- **Download** : ~40 kbps × nombre de participants
- **Exemple** : 5 participants = ~200 kbps down / ~40 kbps up

### Recommandations
- **Connexion minimale** : 500 kbps (4G ou Wifi)
- **Optimal** : 2 Mbps+ pour 10+ participants
- **Latence** : < 200ms en P2P (excellent pour gaming)

### Nombre max de participants
- **Recommandé** : 5-10 participants
- **Maximum technique** : 15-20 participants
- Au-delà, considérer diviser en plusieurs rooms

---

## 🔧 Architecture technique

### Comment ça marche

```
┌─────────────┐     WebRTC      ┌─────────────┐
│  Joueur A   │◄───────────────►│  Joueur B   │
│  🎤 Micro   │    P2P Audio    │  🔊 Audio   │
└─────────────┘                 └─────────────┘
       │                              │
       │         Mesh Network         │
       │                              │
       └─────────────┬────────────────┘
                     │
              ┌─────────────┐
              │  Joueur C   │
              │  🎤 🔊      │
              └─────────────┘
```

### Topologie Mesh
- Chaque participant se connecte **directement** à tous les autres
- Pas de serveur central = **latence minimale**
- Mais : complexité augmente avec N² connexions
- C'est pourquoi on limite à ~15 participants

### Signalisation
- Utilise le serveur **PeerJS** existant (gratuit)
- Seulement pour l'établissement de connexion
- Pas de flux média passé par le serveur

---

## 🎨 Interface utilisateur

### Design
- Style **kawaii rose** cohérent avec le jeu
- Animations douces et fluides
- Responsive mobile/desktop
- Feedback visuel clair (qui parle, qui est muté, etc.)

### Composants
1. **Voice Header** - Titre et compteur participants
2. **Voice Status** - État actuel (déconnecté / connecté / prêt)
3. **Voice Buttons** - Rejoindre / Quitter
4. **Voice Controls** - Mute / Deafen
5. **Participants List** - Liste avec avatars et indicateurs

---

## 🐛 Debug

### Console du navigateur
Ouvrez la console (F12) pour voir les logs :

```
✅ Microphone activé
📞 Appel établi avec abc123
🔊 Stream distant reçu de abc123
🎤 Micro coupé
🔇 Salon vocal quitté
```

### Erreurs communes

#### `NotAllowedError`
- Permission refusée
- Donnez l'autorisation dans le navigateur

#### `NotFoundError`
- Pas de microphone trouvé
- Branchez un micro

#### `peer-unavailable`
- Le peer n'est pas en ligne
- Normal si quelqu'un a quitté

---

## 📱 Mobile

### iOS
- Fonctionne sur Safari iOS 11+
- **Astuce** : Ajoutez l'app à l'écran d'accueil pour PWA complète
- Le micro peut se couper si l'app passe en arrière-plan

### Android
- Fonctionne sur Chrome Android
- Meilleur support d'arrière-plan que iOS
- Audio continue même en multitâche

---

## 🚀 Prochaines améliorations possibles

### Court terme
- [ ] Volume individuel par participant
- [ ] Push-to-Talk (maintenir une touche pour parler)
- [ ] Qualité audio ajustable (économie de bande passante)

### Moyen terme
- [ ] Indicateur de latence/qualité
- [ ] Enregistrement de sessions (avec consentement)
- [ ] Filtres audio fun (effets vocaux)

### Long terme
- [ ] Serveur SFU pour 50+ participants (si budget)
- [ ] Spatial audio (son 3D selon position dans le jeu)
- [ ] Transcription automatique (accessibilité)

---

## 📝 FAQ

### Q : Le vocal fonctionne sans internet ?
**R :** Non, WebRTC nécessite internet pour la signalisation et les flux P2P. Même en local, certaines étapes passent par internet.

### Q : Les conversations sont-elles enregistrées ?
**R :** Non ! Tout est P2P, rien n'est stocké sur un serveur. Quand vous quittez, tout disparaît.

### Q : Peut-on parler et jouer en même temps ?
**R :** Oui ! Le vocal est non-bloquant, vous pouvez jouer normalement tout en parlant.

### Q : La qualité audio est-elle bonne ?
**R :** Oui ! Audio 48kHz avec noise suppression et echo cancellation. Qualité comparable à Discord/Teams.

### Q : Y a-t-il un délai (latency) ?
**R :** Très faible ! P2P direct = ~50-200ms selon votre connexion. Excellent pour du gaming.

---

## 💡 Conseils

### Pour une meilleure expérience
- 🎧 **Utilisez un casque** pour éviter l'écho
- 📶 **Connexion stable** (Wifi > 4G > 3G)
- 🔇 **Mutez-vous** quand vous ne parlez pas (économise bande passante)
- 👥 **Petites rooms** (5-10 joueurs) pour meilleure qualité

### Étiquette
- 🙏 Soyez respectueux et bienveillant
- 🤝 Laissez les autres parler
- 💬 Utilisez le chat texte pour les liens/infos
- ❤️ Encouragez vos coéquipiers !

---

## 🙏 Aspect spirituel

Ce chat vocal est conçu pour favoriser la **communion fraternelle** entre joueurs chrétiens :

> *"Là où deux ou trois sont assemblés en mon nom, je suis au milieu d'eux."* - Matthieu 18:20

Utilisez-le pour :
- 🙏 **Prier ensemble** avant/après une partie
- 📖 **Partager des versets** et encouragements
- ❤️ **Bâtir des amitiés** authentiques
- 🎮 **S'amuser** dans la joie et l'amitié

---

**Que vos conversations soient édifiantes et remplies de grâce ! 💕**
