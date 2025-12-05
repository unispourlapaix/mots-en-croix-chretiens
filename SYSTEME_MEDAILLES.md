# 🏆 Système de Médailles et Récompenses

## 📋 Vue d'ensemble

Le système de médailles ajoute une dimension de progression et de collection au jeu "Mots En Croix Chrétiens". Les joueurs peuvent débloquer 18 médailles différentes en fonction de leurs performances.

---

## 🎯 Types de Médailles

### 1. ⭐ Médailles de Perfection
**Objectif:** Compléter un niveau sans utiliser d'indices

- **Icône:** ⭐
- **Rareté:** Commun
- **Points:** 10
- **Comment débloquer:** Terminer n'importe quel niveau en cliquant sur "Vérifier" sans avoir utilisé le bouton "Indice"

### 2. 🌟 Médailles de Niveaux BONUS

#### Explorateur Spirituel
- **Icône:** 🌟
- **Rareté:** Rare
- **Points:** 25
- **Comment débloquer:** Compléter votre premier niveau BONUS

#### Maître du Bonus
- **Icône:** ✨
- **Rareté:** Épique
- **Points:** 50
- **Comment débloquer:** Compléter un niveau BONUS sans utiliser d'indices

### 3. 🌱 Médailles de Progression (Jalons)

| Médaille | Icône | Niveaux | Rareté | Points |
|----------|-------|---------|---------|--------|
| Premiers Pas | 🌱 | 5 | Commun | 20 |
| Marcheur Fidèle | 🌿 | 10 | Commun | 30 |
| Disciple Dévoué | 🌳 | 20 | Rare | 50 |
| Pèlerin Persévérant | ⛰️ | 40 | Épique | 100 |
| Champion de la Foi | 👑 | 77 | Légendaire | 200 |

**Comment débloquer:** Compléter le nombre de niveaux indiqué (cumulatif)

### 4. 🔥 Médailles de Streaks (Séries)

| Médaille | Icône | Série | Rareté | Points |
|----------|-------|-------|---------|--------|
| Trinitaire | 🔥 | 3 | Rare | 30 |
| Sept Dons | 💎 | 7 | Épique | 70 |
| Douze Apôtres | 💫 | 12 | Légendaire | 120 |

**Comment débloquer:** Compléter X niveaux parfaits (sans indices) CONSÉCUTIVEMENT. La série se réinitialise si vous utilisez un indice.

### 5. 🏆 Médailles Spéciales

#### Nouveau Départ
- **Icône:** 🎯
- **Rareté:** Commun
- **Points:** 5
- **Comment débloquer:** Compléter votre tout premier niveau

#### Collecteur de Trésors
- **Icône:** 🏆
- **Rareté:** Légendaire
- **Points:** 150
- **Comment débloquer:** Compléter les 9 niveaux BONUS du jeu

#### Perfection Divine
- **Icône:** 🌟
- **Rareté:** Légendaire
- **Points:** 500
- **Comment débloquer:** Compléter les 77 niveaux du jeu sans JAMAIS utiliser d'indices

---

## 🎨 Raretés et Couleurs

Les médailles ont 4 niveaux de rareté :

| Rareté | Couleur | Difficulté |
|--------|---------|------------|
| Commun | Gris (#95a5a6) | Facile à obtenir |
| Rare | Bleu (#3498db) | Nécessite de l'effort |
| Épique | Violet (#9b59b6) | Difficile |
| Légendaire | Or (#f39c12) | Très rare |

---

## 📊 Interface de Collection

### Accès
1. Cliquer sur le bouton menu (☰) en haut à droite
2. Cliquer sur "🏆 Voir mes médailles"

### Statistiques Affichées
- **Médailles:** X/18 (nombre débloquées sur total)
- **Points:** Total de points gagnés
- **Complétion:** Pourcentage de médailles débloquées

### Filtres
- **Toutes:** Affiche toutes les médailles
- **Débloquées:** Affiche uniquement celles obtenues
- **Verrouillées:** Affiche celles à débloquer

### Cartes de Médailles
Chaque carte affiche :
- **Icône animée** (flottante)
- **Nom de la médaille**
- **Description**
- **Rareté** (avec couleur)
- **Points gagnés**
- **État:** Colorée si débloquée, grisée si verrouillée

---

## ✨ Animations

### Déblocage
Quand vous débloquez une médaille :
1. Un modal apparaît avec l'icône, le nom et les points
2. Animation de rotation et zoom
3. Confettis kawaii 🎉

### Dans la Collection
- **Float:** Les icônes flottent doucement
- **Sparkle:** Les médailles légendaires scintillent ✨
- **Hover:** Les cartes se soulèvent au survol

---

## 💾 Sauvegarde

- **Automatique:** Toutes les médailles sont sauvegardées localement (localStorage)
- **Persistante:** Vos médailles sont conservées même après fermeture du navigateur
- **Stats détaillées:** Le système garde l'historique de tous vos niveaux

---

## 🎮 Stratégies pour Débloquer

### Pour les Streaks
- **Attention:** Un seul indice réinitialise votre série !
- **Astuce:** Commencez par les niveaux faciles pour construire votre série
- **Objectif 12:** La médaille "Douze Apôtres" est la plus difficile

### Pour la Perfection Divine
- **Défi ultime:** 77 niveaux sans AUCUN indice
- **Planification:** Prenez votre temps, ne vous précipitez pas
- **Récompense:** 500 points + gloire éternelle ! 👑

### Pour les Niveaux BONUS
- **9 niveaux BONUS** dans le jeu (BONUS 1 à BONUS 9)
- **Trouvez-les:** Ils sont dispersés dans les 77 niveaux
- **Thématiques spéciales:** Chaque BONUS a un thème unique

---

## 🔧 Technique (Pour Développeurs)

### Architecture
```javascript
// Classe principale
class AchievementSystem {
    medals: Object          // Définition des 18 médailles
    userAchievements: Object // Médailles débloquées
    levelStats: Object      // Stats par niveau
    currentStreak: number   // Série actuelle
}
```

### Fichiers
- `js/achievements.js`: Logique complète (500 lignes)
- `js/game.js`: Intégration + UI (100 lignes ajoutées)
- `css/styles.css`: Styles + animations (250 lignes)
- `index.html`: Modal + bouton (40 lignes)

### LocalStorage
```javascript
// Clés utilisées
'christianCrosswordAchievements' // Médailles débloquées
'christianCrosswordLevelStats'   // Stats détaillées
```

### API Publique
```javascript
// Enregistrer complétion
achievementSystem.recordLevelCompletion(levelNum, hintsUsed, isBonus)

// Vérifier si débloqué
achievementSystem.isUnlocked('achievement_id')

// Obtenir stats globales
achievementSystem.getGlobalStats()

// Réinitialiser (debug)
achievementSystem.resetAllAchievements()
```

---

## 📈 Statistiques Possibles

Le système peut fournir des stats avancées :
- Taux de complétion parfaite par niveau
- Nombre moyen d'indices utilisés
- Temps moyen par niveau
- Meilleurs scores
- Progression dans le temps

---

## 🌟 Améliorations Futures Possibles

1. **Médailles saisonnières** (Noël, Pâques, etc.)
2. **Classements** (top joueurs par points)
3. **Partage social** ("J'ai débloqué X médailles !")
4. **Badges de profil** (afficher vos meilleures médailles)
5. **Défis hebdomadaires** (objectifs temporaires)
6. **Médailles secrètes** (easter eggs)
7. **Système de titres** (selon médailles débloquées)
8. **Animations 3D** pour déblocages légendaires

---

## 💡 Notes de Design

### Philosophie Kawaii
- **Icônes émotives** (pas juste des trophées génériques)
- **Couleurs douces** (pastels + dégradés)
- **Animations fluides** (jamais brusques)
- **Encouragement positif** (jamais punitif)

### Gamification Saine
- **Pas de FOMO** (peur de rater)
- **Pas de pression** (juste du plaisir)
- **Récompense l'effort** (pas la chance)
- **Célèbre les progrès** (petits et grands)

### Accessibilité
- **Responsive** (mobile + desktop)
- **Lisible** (contrastes respectés)
- **Intuitif** (navigation simple)
- **Performant** (pas de lag)

---

## 🙏 Conclusion

Le système de médailles transforme le jeu en une expérience de collection enrichissante, tout en respectant l'esprit optimiste et encourageant du projet. Chaque médaille raconte une histoire de progression spirituelle, avec des noms inspirés de la foi chrétienne (Trinitaire, Sept Dons, Douze Apôtres, etc.).

**Bon courage pour débloquer toutes les médailles ! 🏆✨**
