# 🤖 Configuration Unisona AI

## 📋 Vue d'ensemble

Unisona peut utiliser l'intelligence artificielle (OpenAI) pour avoir des conversations naturelles avec les joueurs. Deux options sont disponibles :

### Option 1 : Clé API Globale (Recommandé pour usage familial) ✅

**Avantage :** Tous les joueurs profitent automatiquement de l'IA sans configuration.

**Configuration :**

1. Ouvre le fichier `js/unisona-ai.js`
2. À la ligne 6, remplace la constante vide par ta clé API :

```javascript
// Avant :
const DEFAULT_OPENAI_KEY = '';

// Après :
const DEFAULT_OPENAI_KEY = 'sk-proj-XXXXXXXXXXXXXXXXXXXXXXXX';
```

3. Sauvegarde le fichier
4. L'IA est maintenant active pour tous les joueurs ! 🎉

### Option 2 : Clé API Personnelle

Chaque joueur peut configurer sa propre clé API :

1. Lance le jeu
2. Tape `/config` dans le chat
3. Entre ta clé API OpenAI
4. Clique sur "Sauvegarder"

## 🔑 Obtenir une clé API OpenAI

1. Va sur [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Connecte-toi avec ton compte OpenAI
3. Clique sur "Create new secret key"
4. Copie la clé (elle commence par `sk-`)
5. ⚠️ **IMPORTANT** : Ne partage jamais ta clé publiquement !

## 💰 Coût

- **Modèle utilisé :** gpt-4o-mini (économique)
- **Coût estimé :** ~0,002$ par conversation de 10 messages
- **Limite :** 200 tokens maximum par réponse

## 🔒 Sécurité

- La clé API est stockée **localement** dans le navigateur (localStorage)
- Elle n'est **jamais envoyée** à un serveur tiers
- Seules les requêtes vers OpenAI utilisent la clé
- Si tu utilises la clé globale, garde le fichier `js/unisona-ai.js` privé

## 💬 Utilisation

Une fois configurée, Unisona répond automatiquement quand :

- Tu la mentionnes : `@unisona comment ça va ?`
- Tu utilises son nom : `Unisona aide-moi !`
- Tu poses une question : `C'est quoi un mot de 5 lettres ?`
- Tu demandes de l'aide : `aide`, `help`

## 🛠️ Commandes disponibles

| Commande | Description |
|----------|-------------|
| `/config` | Configurer/modifier la clé API |
| `/clear` | Réinitialiser l'historique de conversation |
| `/aide` | Afficher toutes les commandes |

## ❓ Dépannage

**L'IA ne répond pas :**
- Vérifie que la clé API est correcte (commence par `sk-`)
- Vérifie ta connexion internet
- Regarde la console du navigateur (F12) pour les erreurs

**Message "Clé API non configurée" :**
- Tape `/config` et entre ta clé API
- Ou configure `DEFAULT_OPENAI_KEY` dans `js/unisona-ai.js`

**Erreur "Invalid API key" :**
- La clé est incorrecte ou expirée
- Génère une nouvelle clé sur platform.openai.com

## 🎮 Mode sans IA

Si tu ne veux pas utiliser l'IA, le jeu fonctionne parfaitement sans configuration. Unisona affichera simplement des messages pré-programmés via le système de tutoriel.

---

**Bon jeu avec Unisona ! 🎉✨**
