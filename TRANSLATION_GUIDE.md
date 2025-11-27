# 🌍 Guide de Traduction Multilingue
## Mots En Croix Chrétiens - Translation Guide

## 📊 État Actuel des Traductions

### ✅ Complété
- **Français (fr)**: 77 niveaux - 100% ✓
- **Espagnol (es)**: 77 niveaux - 100% ✓
- **Anglais (en)**: 45 niveaux - 58%

### 🔨 En Attente
- Allemand (de): 0/77 - 0%
- Italien (it): 0/77 - 0%
- Portugais (pt): 0/77 - 0%
- Russe (ru): 0/77 - 0%
- Chinois (zh): 0/77 - 0%
- Coréen (ko): 0/77 - 0%
- Japonais (ja): 0/77 - 0%
- Arabe (ar): 0/77 - 0%
- Hindi (hi): 0/77 - 0%
- Polonais (pl): 0/77 - 0%
- Swahili (sw): 0/77 - 0%

---

## 🎯 Système de Fallback Intelligent

Le jeu utilise maintenant un système de fallback automatique:

1. **Langue sélectionnée**: Si un niveau est traduit dans la langue choisie, il s'affiche dans cette langue
2. **Fallback automatique**: Si un niveau n'est pas traduit, le jeu affiche automatiquement la version française
3. **Expérience utilisateur**: L'utilisateur peut jouer dans n'importe quelle langue, même si toutes les traductions ne sont pas encore disponibles

### Exemple
- Utilisateur choisit l'anglais (en)
- Niveaux 1-45: Affichés en anglais ✓
- Niveaux 46-77: Affichés en français (fallback automatique)

---

## 📝 Comment Ajouter des Traductions

### Structure d'un Niveau

Chaque niveau contient:
- **words**: Tableau de mots à trouver
  - **word**: Le mot en majuscules (ex: "JESUS", "LOVE", "PEACE")
  - **clue**: Indice poétique/biblique pour le mot
  - **path**: Coordonnées [row, col] du placement du mot
  - **direction**: "horizontal", "vertical", ou "bent" (courbé en L)

### Exemple de Niveau

```javascript
{
    // Level 1 - Introduction with crosswords (10x10 grid)
    words: [
        {
            word: "JESUS",
            clue: "Light that guides our steps through life's darkness",
            path: [[1,3], [2,3], [3,3], [3,4], [3,5]],
            direction: "bent"
        },
        {
            word: "LOVE",
            clue: "Divine force that transforms hearts and unites souls",
            path: [[4,0], [4,1], [4,2], [4,3]],
            direction: "horizontal"
        }
        // ... plus de mots
    ]
}
```

---

## 🔧 Ajouter une Nouvelle Langue

### Étape 1: Ouvrir gameData.js

Le fichier se trouve dans: `js/gameData.js`

### Étape 2: Ajouter une section de langue

Après la section `en: { ... }`, ajoutez votre langue:

```javascript
de: {  // Code de langue à 2 lettres
    levels: [
        {
            // Niveau 1 - Einführung mit Kreuzworträtseln (10x10 Raster)
            words: [
                {
                    word: "JESUS",
                    clue: "Licht, das unsere Schritte durch die Dunkelheit des Lebens führt",
                    path: [[1,3], [2,3], [3,3], [3,4], [3,5]],
                    direction: "bent"
                },
                {
                    word: "LIEBE",
                    clue: "Göttliche Kraft, die Herzen verwandelt und Seelen vereint",
                    path: [[4,0], [4,1], [4,2], [4,3], [4,4]],
                    direction: "horizontal"
                }
                // ... mehr Wörter
            ]
        }
        // ... plus de niveaux
    ]
}
```

### Étape 3: Respecter les Coordonnées

⚠️ **IMPORTANT**: Les coordonnées `path` doivent rester IDENTIQUES à celles de la version française!
- Ne modifiez que `word` et `clue`
- Gardez `path` et `direction` tels quels

---

## 🌟 Conseils de Traduction

### 1. Adapter la Longueur des Mots

Si le mot traduit a une longueur différente:
- Ajustez les coordonnées `path` en conséquence
- Exemple: "AMOUR" (5 lettres) → "LOVE" (4 lettres)
  - FR: `path: [[4,0], [4,1], [4,2], [4,3], [4,4]]`
  - EN: `path: [[4,0], [4,1], [4,2], [4,3]]`

### 2. Indices Poétiques

Les indices doivent être:
- **Poétiques** et **inspirants**
- **Bibliques** quand c'est pertinent
- **Adaptés culturellement** à la langue cible
- **Pas trop évidents** (gardez le défi!)

### 3. Thèmes par Niveau

Les 77 niveaux suivent une progression thématique:
1. Introduction (Jésus, Amour, Paix, Foi, Vie)
2. Vertus chrétiennes
3. Mystères de la foi
4. Dons de l'Esprit
5. Figures bibliques
6. Paraboles
7. Fruits de l'Esprit
8. Actes d'adoration
9. Paroles de Jésus
10. L'Église
... jusqu'au niveau 77

---

## 🚀 Approche Recommandée

### Option 1: Traduction Progressive
1. Commencez par les 10 premiers niveaux
2. Testez dans le jeu
3. Continuez par groupes de 10

### Option 2: Traduction par Thème
1. Traduisez tous les niveaux d'un même thème
2. Exemple: Tous les niveaux sur les "Fruits de l'Esprit"
3. Passez au thème suivant

### Option 3: Traduction Collaborative
1. Divisez les 77 niveaux entre plusieurs traducteurs
2. Utilisez un tableau de suivi (voir ci-dessous)
3. Combinez les traductions à la fin

---

## 📋 Tableau de Suivi des Traductions

| Niveau | Thème | FR | EN | ES | DE | IT | PT | RU | ZH | KO | JA | AR | HI | PL | SW |
|--------|-------|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
| 1 | Introduction | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 2 | Vertus | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 3 | Mystères | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 4 | Dons | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 5 | Figures | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 6 | Paraboles | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 7 | Fruits | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 8 | Adoration | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 9 | Paroles | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 10 | Église | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 11 | Vertus cardinales | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 12 | Dons spirituels | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 13 | Paroles de vie | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 14 | Chemin spirituel | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 15 | Lumière | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 16 | Fidélité | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 17 | Richesses | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 18 | Protection | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 19 | Renouveau | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 20 | Gloire finale | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 21 | BONUS: Grâce divine | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 22 | BONUS: Amour universel | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 23 | BONUS: Fraternité | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 24 | BONUS: Division vaincue | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 25 | BONUS: Lumière/Ténèbres | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 26 | BONUS: Amour universel vs haine | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 27 | BONUS: Justice et Vérité | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 28 | BONUS: Reconstruction | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 29 | Grâce pour tous | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 30 | Transformation | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 31 | Appel universel | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 32 | Restauration du meurtrier | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 33 | Pardon pour le menteur | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 34 | Miséricorde pour le voleur | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 35 | Amour inconditionnel | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 36 | Seconde chance divine | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 37 | Personne n'est trop loin | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 38 | Victoire de la grâce | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 39 | Transformation par changement | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 40 | Accepter le changement | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 41 | Changement intérieur | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 42 | Courage du changement | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 43 | Renouveau constant | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 44 | Brisement du cœur | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 45 | Renouvellement de l'esprit | ✓ | ✓ | ✓ |  |  |  |  |  |  |  |  |  |  |  |
| 46-77 | ... | ✓ |  | ✓ |  |  |  |  |  |  |  |  |  |  |  |

---

## 🧪 Tester vos Traductions

1. Ouvrez le jeu dans votre navigateur
2. Cliquez sur le bouton "☰ Menu"
3. Sélectionnez votre langue dans la section "🌍 Langue / Language"
4. Jouez les niveaux traduits
5. Vérifiez que:
   - Les mots s'affichent correctement
   - Les indices sont clairs
   - Le placement fonctionne (pas de chevauchements incorrects)

---

## 💡 Ressources Utiles

### Termes Bibliques Courants

| Français | English | Español | Deutsch | Italiano |
|----------|---------|---------|---------|----------|
| Jésus | Jesus | Jesús | Jesus | Gesù |
| Amour | Love | Amor | Liebe | Amore |
| Foi | Faith | Fe | Glaube | Fede |
| Paix | Peace | Paz | Frieden | Pace |
| Espoir | Hope | Esperanza | Hoffnung | Speranza |
| Grâce | Grace | Gracia | Gnade | Grazia |
| Vérité | Truth | Verdad | Wahrheit | Verità |
| Vie | Life | Vida | Leben | Vita |

### Références Bibliques
- Bible en ligne: https://www.biblegateway.com/ (supports 70+ languages)
- Concordance: https://www.biblestudytools.com/
- Dictionnaire biblique multilingue

---

## 🤝 Contribuer

### Format de Contribution

Lorsque vous soumettez des traductions:

1. **Indiquez clairement**:
   - Langue (code à 2 lettres)
   - Niveaux traduits (ex: 1-20)
   - Votre nom (si vous voulez être crédité)

2. **Testez** vos traductions avant de soumettre

3. **Documentez** les choix difficiles
   - Mots qui n'ont pas d'équivalent direct
   - Adaptations culturelles
   - Changements de longueur de mots

---

## 📞 Questions ?

Si vous avez des questions sur:
- La structure technique
- Les choix de traduction
- Les coordonnées de placement
- Tout autre aspect

N'hésitez pas à créer une issue sur le dépôt GitHub!

---

## 🎉 Remerciements

Merci à tous les traducteurs qui contribuent à rendre ce jeu accessible à des millions de personnes à travers le monde!

Votre travail permet de partager l'amour de Dieu et les enseignements bibliques dans de nombreuses langues. 🙏

---

**Version**: 1.0
**Dernière mise à jour**: 2025
**Créé avec**: Claude Code Pro ✨
