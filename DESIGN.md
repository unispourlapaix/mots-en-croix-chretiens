# 🌸 Design Rose Kawaii - Mobile HD Portrait

## 🎨 Palette de Couleurs

### Couleurs Principales
- **Rose Primaire**: `#ff69b4` (Hot Pink)
- **Rose Clair**: `#ff85c1`
- **Rose Pastel**: `#ffb6d9`
- **Rose Pâle**: `#ffc0cb` (Pink)
- **Rose Très Pâle**: `#ffc0dd`

### Couleurs de Fond
- **Gradient Principal**: `#fff5f7` → `#ffe8f0` → `#ffd9e8`
- **Fond Conteneur**: `rgba(255, 255, 255, 0.95)`
- **Fond Sections**: `#fff5f7` → `#ffe8f0`

### Couleurs de Texte
- **Texte Principal**: `#4a4a4a`
- **Texte Rose**: `#ff69b4`
- **Texte Rose Clair**: `#ff85c1`

## 📱 Optimisations Mobile HD Portrait

### Breakpoints
- **Mobile Standard**: ≤ 768px
- **Petit Mobile**: ≤ 400px

### Tailles de Grille
- **Desktop/Tablette**: 32px × 32px (10×10)
- **Mobile Standard**: 30px × 30px
- **Petit Mobile**: 26px × 26px

### Dimensions Adaptées
- Conteneur max: 450px
- Padding réduit: 25px → 20px → 15px
- Border-radius: 30px → 25px
- Gaps optimisés: 3px → 2px

## ✨ Éléments Kawaii

### Emojis Décoratifs
- **Étoile**: ✨ (animation sparkle, rotation 180°)
- **Cœur**: 💕 (animation heartbeat)
- Positionnés aux coins du conteneur

### Animations
1. **sparkle** (2s, infinite)
   - Rotation 180° avec échelle 1.2
   - Opacity 0.6 ↔ 1

2. **heartbeat** (1.5s, infinite)
   - Échelle: 1 → 1.15 → 1 → 1.1 → 1

3. **kawaii-pulse** (0.6s)
   - Échelle 1.15 avec rotation 5°
   - Glow rose: `rgba(255, 105, 180, 0.6)`

4. **floatIn** (1s)
   - Translate Y: 50px → 0
   - Opacity: 0 → 1

## 🎯 Éléments Stylisés

### Boutons
- **Play Button**: Gradient rose, border blanc, shadow rose
- **Language Buttons**: Fond rose pâle, border rose, active = gradient
- **Control Buttons**: Gradient rose pastel, border blanc

### Grille
- Background: Gradient rose pâle
- Cellules: Border rose, shadow subtile
- Focus: Border rose foncé avec glow
- Correct: Gradient rose avec animation kawaii-pulse
- Blocked: Gradient gris

### Sections d'Indices
- Background: Gradient rose très pâle
- Border: Rose transparent
- Clues: Border-left rose, hover effect

### Ombres
- Conteneur: `rgba(255, 182, 193, 0.3)`
- Boutons: `rgba(255, 105, 180, 0.4)`
- Cellules: `rgba(255, 192, 203, 0.2)`

## 📲 Meta Tags & PWA

### Viewport
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

### Theme Color
```html
<meta name="theme-color" content="#ff69b4">
```

### Manifest
- Orientation: portrait
- Display: standalone
- Background: `#fff5f7`
- Theme: `#ff69b4`

## 💡 Expérience Utilisateur

### Améliorations Mobile
1. **Tactile optimisé**: Tailles de touch-target ≥ 30px
2. **Scroll fluide**: Padding et margins optimisés
3. **Feedback visuel**: Animations sur hover/active
4. **Lisibilité**: Tailles de police adaptatives
5. **Navigation**: Clavier supporté avec focus visible

### Accessibilité
- Contraste texte/fond respecté
- Focus visible avec outline rose
- Touch targets suffisamment grands
- Animations non-bloquantes

## 🎀 Style Guide

### Typographie
- **Font Family**: Segoe UI, Helvetica Neue, Arial
- **Titres**: 700 (Bold), letter-spacing: 0.5px
- **Boutons**: 600-700 (Semi-Bold à Bold)
- **Corps**: 500 (Medium)

### Espacement
- **Gap buttons**: 8-10px
- **Padding cards**: 15-20px
- **Margin sections**: 20-25px

### Border Radius
- **Containers**: 25-30px
- **Buttons**: 25-50px
- **Cards**: 12-20px
- **Cells**: 6-8px

## 🌟 Effet Visuel Général

Le design crée une ambiance:
- **Douce et accueillante** avec les roses pastels
- **Élégante** avec le fond blanc et les ombres subtiles
- **Ludique** avec les animations kawaii
- **Moderne** avec les gradients et borders arrondis
- **Optimisée mobile** avec des tailles adaptées au tactile

## 🔮 Prochaines Améliorations Possibles

1. Ajouter des confettis roses lors de la victoire
2. Animations de particules kawaii
3. Sons doux et mignons (optionnel)
4. Mode sombre rose (dark kawaii)
5. Thèmes personnalisables
6. Avatars kawaii pour les utilisateurs
