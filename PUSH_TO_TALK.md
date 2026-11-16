# 🎤 Push-to-Talk (Appuyer pour Parler)

## Changement Effectué

Le système de micro a été transformé en **Push-to-Talk** (appuyer pour parler) pour simplifier l'utilisation.

## 🔒 Sécurité - Code de Salle Unique

Le système utilise maintenant un **code de salle unique** :
- ✅ Une personne crée une salle et partage le code
- ✅ Tous les amis rejoignent avec LE MÊME code
- ✅ Tous dans la même salle peuvent se parler
- ✅ Plus simple et plus intuitif
- ✅ Idéal pour jouer en famille ou entre amis

## Comment Ça Marche

### Étapes
1. **Créez une salle** (bouton ☰ → "Créer une Nouvelle Salle")
2. **Partagez le code** avec vos amis/famille (clic pour copier)
3. **Vos amis rejoignent** en collant le code
4. **Maintenez le bouton 🎤** pour parler
5. **Relâchez** pour couper le micro

### 🖱️ Sur Ordinateur
1. **Maintenez le bouton 🎤 appuyé** avec la souris pour parler
2. **Relâchez** pour couper automatiquement le micro

### 📱 Sur Mobile/Tablette
1. **Maintenez le bouton 🎤 appuyé** avec votre doigt pour parler
2. **Relâchez** pour couper automatiquement le micro

## Avantages

✅ **Plus simple** - Plus besoin de chercher le bouton mute/unmute  
✅ **Plus sûr** - Le micro est coupé par défaut  
✅ **Plus rapide** - Parlez seulement quand nécessaire  
✅ **Idéal pour les jeunes** - Pas de risque de laisser le micro ouvert  

## Fonctionnement Technique

### Modifications Apportées

1. **index.html**
   - Suppression du popup vocal avec 3 boutons (mute, deafen, quitter)
   - Ajout de la classe `push-to-talk` au bouton vocal
   - Modification du titre: "Maintenir appuyé pour parler"

2. **js/voice-ui.js**
   - Remplacement des événements `click` par:
     - `mousedown/mouseup/mouseleave` (souris)
     - `touchstart/touchend/touchcancel` (tactile)
   - Nouvelles méthodes:
     - `handlePushToTalkStart()` - Active le micro
     - `handlePushToTalkEnd()` - Coupe le micro
   - Le bouton reste toujours visible (pas de grisé)

3. **js/voice-chat.js**
   - **Système de code de salle unique** - Tous partagent le même code
   - Suppression des vérifications individuelles d'amis
   - Validation que l'utilisateur est dans une salle (roomCode)
   - Le salon vocal utilise le même `roomCode` que le chat P2P
   - Tous les joueurs dans la salle peuvent se parler

4. **js/simple-connect.js**
   - Interface transformée en "Créer/Rejoindre Salle"
   - Méthode `createRoom()` - Crée une salle avec code unique
   - Méthode `joinRoomByCode()` - Rejoint avec le code de salle
   - Méthode `copyRoomCode()` - Copie le code pour partager
   - Affichage des joueurs connectés dans la salle

5. **css/styles.css**
   - Nouvelle classe `.speaking` pour feedback visuel
   - Animation `pulse-speaking` avec effet lumineux vert
   - Le bouton devient vert 🟢 et pulse quand on parle
   - Le bouton reste rose 🌸 quand muet
   - Styles pour `.quick-create-btn` et `.quick-join-btn`

## Comportement Visuel

| État | Apparence | Description |
|------|-----------|-------------|
| **Inactif** | 🎤 Rose | Micro coupé (défaut) |
| **Appuyé** | 🎤 Vert pulsant | En train de parler |
| **Première fois** | 🎤 Gris | Pas encore rejoint le vocal |

## Sécurité

- Le micro est **toujours coupé par défaut**
- Impossible de laisser le micro ouvert par accident
- **Code de salle unique** - Tous partagent le même code
- Seuls ceux qui ont le code peuvent rejoindre
- Parfait pour les jeunes utilisateurs
- Contrôle total sur quand on parle et avec qui

## Notes

- La première fois que vous appuyez sur 🎤, le système rejoint automatiquement le salon vocal
- **Important** : Vous devez d'abord être dans une salle (créer ou rejoindre avec un code)
- Ensuite, chaque appui active/désactive temporairement le micro
- Compatible avec tous les navigateurs modernes (Chrome, Firefox, Safari, Edge)
- Fonctionne aussi bien sur mobile que sur ordinateur
- Le vocal utilise la même connexion P2P que le chat (pas de serveur intermédiaire)
- Un seul code pour toute la salle - Partagez-le avec tous vos amis !

## Exemple d'Utilisation

**Maman crée une salle :**
1. Clic sur ☰
2. "Créer une Nouvelle Salle"
3. Clic sur le code pour le copier
4. Envoyer le code par WhatsApp/SMS aux enfants

**Les enfants rejoignent :**
1. Clic sur ☰
2. Coller le code dans "Rejoindre une Salle"
3. Clic sur "Rejoindre"
4. Maintenir 🎤 pour parler !

Tout le monde est dans la même salle avec le même code !

---

**Date de mise en œuvre:** 10 janvier 2026  
**Version:** 2.0 - Système Push-to-Talk
