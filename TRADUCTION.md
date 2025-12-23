# Module de Traduction

## Structure

Le système de traduction utilise un module séparé pour faciliter l'ajout de nouvelles langues.

### Fichier principal
- `data/clues-fr.js` : Module de traduction français (langue par défaut)

### Comment ajouter une nouvelle langue

1. **Dupliquer le fichier de base**
   ```bash
   cp data/clues-fr.js data/clues-en.js
   ```

2. **Traduire les valeurs**
   - Modifier uniquement les valeurs (après les `:`)
   - Garder les clés (avant les `:`) en MAJUSCULES
   - Respecter le style poétique/philosophique

3. **Charger le fichier dans index.html**
   ```html
   <script src="data/clues-en.js"></script>
   ```

4. **Utiliser la traduction**
   ```javascript
   // Le système détectera automatiquement CLUES_EN
   gameDataManager.setLanguage('en');
   ```

### Structure du fichier de traduction

```javascript
const CLUES_FR = {
    'sagesse': {
        'MOT': 'Indice poétique en français'
    },
    'proverbes': { /* ... */ },
    'disciple': { /* ... */ },
    'veiller': { /* ... */ },
    'aimee': { /* ... */ },
    'defaults': {
        'sagesse': 'Indice par défaut si mot non trouvé'
    }
};
```

### Exemples de traduction

**Français (actuel)**
```javascript
'FOI': 'Confiance absolue en l\'invisible qui donne sens au visible'
```

**Anglais (exemple)**
```javascript
'FAITH': 'Absolute trust in the invisible that gives meaning to the visible'
```

**Espagnol (exemple)**
```javascript
'FE': 'Confianza absoluta en lo invisible que da sentido a lo visible'
```

### Conseils de traduction

1. **Style poétique** : Garder les métaphores et images
2. **Cohérence** : Maintenir le ton spirituel/philosophique
3. **Brièveté** : Max 80-100 caractères par indice
4. **Universalité** : Éviter les références trop culturellement spécifiques

### Fichiers concernés

- `data/clues-fr.js` : Module de traduction français
- `js/gameData.js` : Utilise le module via `CLUES_FR`
- `index.html` : Charge le module avant `gameData.js`
