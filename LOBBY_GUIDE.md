# 🌐 Lobby Realtime - Guide Utilisateur

> Archive de l’ancienne architecture. Le [README](README.md#connexion-et-sauvegarde) décrit la version actuelle.

## 🎮 Qu'est-ce que le Lobby Realtime ?

Le **Lobby Realtime** est un espace public où vous pouvez voir tous les joueurs connectés en temps réel et les rejoindre pour jouer ensemble.

## 🚀 Accès au Lobby

### Depuis le Jeu

1. Cliquez sur le bouton **🌐 Lobby** en haut à droite de l'écran
2. Le panneau du lobby s'ouvre automatiquement

### États de Connexion

- **⏳ Connexion...** : En cours de connexion au serveur
- **✅ Connecté au lobby** : Prêt à jouer !
- **❌ Déconnecté** : Problème de connexion (vérifier internet)

## 👥 Liste des Joueurs

### Informations Affichées

Pour chaque joueur dans le lobby :
- **Avatar** : Emoji du joueur
- **Nom** : Pseudo du joueur
- **Statut** :
  - 🏠 **Code de salle** : Le joueur héberge une partie
  - 🟢 **Auto** : Acceptation automatique des connexions
  - 🔵 **Manuel** : Demande d'accès requise

### Actions Disponibles

**🔗 Rejoindre** : Se connecter directement à ce joueur

## 🏠 Créer une Salle

1. Cliquez sur **🏠 Créer une Salle** en bas du lobby
2. Votre salle est créée automatiquement
3. Votre code de salle apparaît dans votre profil
4. Les autres joueurs peuvent vous rejoindre

## 🎯 Rejoindre un Joueur

### Méthode 1 : Via le Lobby

1. Ouvrez le lobby (🌐 Lobby)
2. Trouvez le joueur dans la liste
3. Cliquez sur **🔗 Rejoindre**
4. Connexion P2P directe établie

### Méthode 2 : Via Code

1. Le joueur vous partage son code de salle
2. Entrez le code dans le champ de saisie
3. Cliquez sur "Rejoindre"

## 🔄 Actualisation

- **Automatique** : Le lobby se met à jour en temps réel
- **Manuelle** : Cliquez sur **🔄 Actualiser** pour forcer une mise à jour

## ⚙️ Paramètres

### Mode d'Acceptation

Dans votre profil, vous pouvez choisir :

**🔵 Manuel (Recommandé)**
- Vous recevez une demande avant chaque connexion
- Vous pouvez accepter ou refuser
- Plus de contrôle

**🟢 Automatique**
- Les joueurs se connectent directement
- Pas de demande d'accès
- Plus rapide mais moins de contrôle

### Visibilité

Par défaut, votre présence est publique dans le lobby. Pour la masquer :
1. Fermez le lobby
2. Votre présence reste active mais vous n'apparaissez plus comme "disponible"

## 🔔 Notifications

### Quand vous recevez une notification :

- **Nouvelle connexion** : Un joueur a rejoint votre salle
- **Demande d'accès** : Un joueur veut rejoindre (mode manuel)
- **Joueur parti** : Un joueur a quitté votre salle

## 📊 Statistiques

Le compteur en haut du lobby affiche :
- **"X joueur(s) en ligne"** : Nombre total de joueurs disponibles

## 🐛 Problèmes Fréquents

### "Aucun joueur dans le lobby"

**Causes possibles** :
1. Vous êtes le premier joueur connecté
2. Problème de connexion au serveur
3. Firewall bloque Supabase

**Solutions** :
1. Attendez quelques secondes
2. Cliquez sur **🔄 Actualiser**
3. Vérifiez votre connexion internet

### "Connexion échouée"

**Causes possibles** :
1. Le joueur s'est déconnecté
2. Problème réseau
3. Firewall bloque PeerJS

**Solutions** :
1. Réessayez dans quelques secondes
2. Demandez au joueur de créer une nouvelle salle
3. Utilisez un code de salle à la place

### Le lobby ne s'affiche pas

**Solutions** :
1. Rechargez la page (F5)
2. Videz le cache du navigateur
3. Vérifiez la console (F12) pour les erreurs

## 🎓 Astuces

### Pour les Hôtes

1. **Mode Auto** : Activez-le si vous jouez avec des amis de confiance
2. **Partagez votre code** : Plus facile que de chercher dans le lobby
3. **Nom clair** : Utilisez un pseudo reconnaissable

### Pour les Joueurs

1. **Vérifiez le mode** : 🟢 Auto = connexion instantanée
2. **Plusieurs tentatives** : Si une connexion échoue, essayez un autre joueur
3. **Lobby actif** : Gardez le lobby ouvert pour voir les nouveaux joueurs

## 🔐 Confidentialité

### Données Visibles

Dans le lobby public, les autres joueurs voient :
- ✅ Votre pseudo
- ✅ Votre avatar
- ✅ Votre code de salle (si vous en hébergez une)
- ✅ Votre mode d'acceptation
- ❌ Votre email (jamais affiché)
- ❌ Votre score (pas affiché dans le lobby)

### Sécurité

- Connexions P2P directes (pas de serveur intermédiaire)
- Chiffrement WebRTC natif
- Aucune donnée de jeu n'est stockée côté serveur

## 📱 Mobile

Le lobby est **100% responsive** et fonctionne sur :
- 📱 Smartphones (iOS, Android)
- 📲 Tablettes
- 💻 Ordinateurs

## ⌨️ Raccourcis Clavier

- **Échap** : Fermer le lobby
- **F5** : Actualiser le lobby
- **Ctrl+L** : Ouvrir/Fermer le lobby (à implémenter)

## 🆘 Support

En cas de problème :
1. Consultez la [documentation de la version actuelle](README.md#connexion-et-sauvegarde)
2. Vérifiez les [problèmes connus](README.md#troubleshooting)
3. Ouvrez une issue sur GitHub

---

**Bon jeu !** 🎮🙏
