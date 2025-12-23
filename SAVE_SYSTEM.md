# 💾 Système de Sauvegarde Dual (Local + Cloud)

## Vue d'ensemble

Le jeu utilise maintenant un **système de sauvegarde hybride** :
- **Sauvegarde locale** (localStorage) - automatique et instantanée
- **Sauvegarde cloud** (Supabase) - synchronisée pour les utilisateurs connectés

## Configuration Cloud

### 1. Ajouter les colonnes à la table `profiles`

Exécutez le script SQL dans Supabase :
```bash
sql/add_game_progress_columns.sql
```

Ce script ajoute :
- `game_level` (INTEGER) - Niveau actuel du joueur
- `game_score` (INTEGER) - Score total du joueur

### 2. Vérifier la configuration

Les colonnes doivent avoir :
- Type: INTEGER
- Default: 1 pour game_level, 0 pour game_score
- Nullable: YES

## Fonctionnement

### Sauvegarde Automatique

**Local (localStorage)** :
- Sauvegarde à chaque action :
  - Changement de niveau
  - Modification du score
  - Complétion d'un mot
  - Vérification des réponses

**Cloud (Supabase)** :
- Sauvegarde automatique à chaque `saveGame()`
- Uniquement si l'utilisateur est connecté
- Synchronisation silencieuse en arrière-plan

### Chargement Intelligent

Au démarrage du jeu :
1. Charge la sauvegarde **locale** en premier
2. Puis vérifie la sauvegarde **cloud** (après 1 seconde)
3. **Compare** les deux sauvegardes
4. **Utilise la plus avancée** (niveau ou score le plus élevé)
5. Synchronise automatiquement

### Avantages

✅ **Fiabilité** : Sauvegarde locale instantanée, pas de perte de données
✅ **Synchronisation** : Progression conservée entre appareils
✅ **Choix automatique** : Garde toujours la meilleure progression
✅ **Pas de conflit** : Le système choisit intelligemment

## Code

### Sauvegarder

```javascript
// Sauvegarde locale + cloud automatique
game.saveGame();
```

### Charger depuis le cloud

```javascript
// Appelé automatiquement au démarrage
await game.loadProgressFromCloud();
```

### Sauvegarder uniquement la progression

```javascript
// Sauvegarde complète dans profiles
await game.saveProgressToCloud();
```

## Logs

**Sauvegarde réussie** :
```
✅ Progression sauvegardée dans le cloud
```

**Chargement réussi** :
```
✅ Progression chargée depuis le cloud: { level: 5, score: 1250 }
```

**Erreurs** :
```
❌ Erreur sauvegarde progression: [message]
❌ Erreur chargement progression: [message]
```

## Sécurité

- Les données sont liées à `user_id` (authentification Supabase)
- RLS (Row Level Security) activé sur la table `profiles`
- Seul l'utilisateur peut modifier sa propre progression

## Tests

1. **Connectez-vous** au jeu
2. **Jouez** et progressez (complétez des mots, changez de niveau)
3. **Ouvrez la console** (F12) → devriez voir `✅ Progression sauvegardée dans le cloud`
4. **Fermez le navigateur**
5. **Rouvrez** → Votre progression est restaurée
6. **Connectez-vous sur un autre appareil** → Même progression !

## Migration

Les utilisateurs existants :
- Gardent leur sauvegarde locale
- Au premier chargement après connexion, la sauvegarde locale est uploadée vers le cloud
- Ensuite, synchronisation automatique

## Compatibilité

- ✅ Fonctionne avec ou sans connexion
- ✅ Sauvegarde locale toujours active
- ✅ Cloud optionnel mais recommandé
- ✅ Pas de conflit entre local et cloud
