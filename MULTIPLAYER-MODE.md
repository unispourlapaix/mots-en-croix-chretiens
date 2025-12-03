# 🏁 Mode Course Multijoueur

## Description
Le mode Course Multijoueur permet à plusieurs joueurs de résoudre **la même grille de mots croisés** en temps réel avec un chronomètre de 5 minutes.

## Comment jouer

### 1. Rejoindre une Room
- Ouvrez le menu (☰)
- Créez ou rejoignez une room P2P
- Tous les joueurs doivent être dans la même room

### 2. Démarrer une partie
- Cliquez sur "🎮 Jouer" pour lancer une grille
- Attendez que tous les joueurs soient prêts

### 3. Lancer la course
**Méthode 1 : Bouton**
- Cliquez sur le bouton "🏁 Démarrer Course" dans le chat

**Méthode 2 : Commande**
- Tapez `/race` ou `/course` dans le chat

### 4. Jouer
- Remplissez la grille comme d'habitude
- Vos progrès sont partagés automatiquement toutes les 5 secondes
- Voyez les mises à jour des autres joueurs dans le chat
- Le timer en haut à droite affiche le temps restant

### 5. Fin de la course
**Terminer la grille :**
- Bonus de 500 pts pour le 1er
- Bonus de 300 pts pour le 2ème
- Bonus de 100 pts pour le 3ème

**Temps écoulé :**
- Le classement final s'affiche automatiquement
- Top 5 des meilleurs scores

## Points
- **10 points** par lettre correcte
- **50 points** bonus par mot complété
- **Bonus de placement** selon votre classement

## Notifications en temps réel
Le chat affiche :
- 🏁 Quand un joueur démarre/rejoint la course
- ⭐ Jalons importants (tous les 3 mots complétés)
- 🎊 Quand un joueur termine (avec temps et score)
- 👑 Classement final à la fin du timer

## Commandes Chat
- `/race` ou `/course` - Démarrer une course
- `/stop` - Arrêter la course en cours
- `/help` ou `/aide` - Afficher l'aide

## Fonctionnalités
✅ Synchronisation P2P en temps réel
✅ Timer partagé de 5 minutes
✅ Notifications de progression
✅ Classement en direct
✅ Bonus de placement
✅ Même grille pour tous
✅ Nombre illimité de joueurs

## Notes techniques
- Le système utilise PeerJS pour la communication P2P
- Les mises à jour sont envoyées toutes les 5 secondes
- La grille est la même pour tous (même niveau)
- Chaque joueur remplit sa propre grille indépendamment
- Le timer démarre au même moment pour tous
