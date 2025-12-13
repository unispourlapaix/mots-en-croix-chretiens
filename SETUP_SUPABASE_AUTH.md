# 🔐 Setup Authentification Supabase

Guide pour configurer l'authentification par email avec username persistant pour le chat P2P.

---

## 📋 Prérequis

- Compte Supabase (gratuit): https://supabase.com
- Projet Supabase créé
- Clés API (disponibles dans Project Settings > API)

---

## 🚀 Configuration

### 1. Configurer les clés Supabase

Éditer [`js/config.js`](js/config.js) avec vos clés:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://votre-projet.supabase.co',
    anonKey: 'votre-anon-key-publique'
};
```

Vous trouverez ces clés dans:
**Supabase Dashboard** → **Settings** → **API** → **Project URL** et **anon/public key**

### 2. Créer la table `profiles`

Aller dans **Supabase Dashboard** → **SQL Editor** et exécuter le script SQL:

```sql
-- Copier le contenu de sql/create_profiles_table.sql
```

Ou directement depuis le fichier [`sql/create_profiles_table.sql`](sql/create_profiles_table.sql)

Ce script crée:
- ✅ Table `profiles` avec columns: `id`, `user_id`, `username`, `created_at`, `updated_at`
- ✅ Policies RLS (Row Level Security)
- ✅ Trigger automatique pour créer le profil lors de l'inscription
- ✅ Contraintes d'unicité et de format pour les usernames

### 3. Configurer l'authentification Email

Dans **Supabase Dashboard** → **Authentication** → **Providers**:

1. Activer **Email** provider
2. Configurer le template d'email (optionnel):
   - **Authentication** → **Email Templates** → **Confirm Signup**
   - **Authentication** → **Email Templates** → **Magic Link**

3. Configurer les **redirect URLs**:
   - **Authentication** → **URL Configuration**
   - **Site URL**: `http://localhost:8000` (en dev) ou votre URL de prod
   - **Redirect URLs**: Ajouter `http://localhost:8000` et votre URL de prod

---

## 🎮 Utilisation

### Workflow d'authentification

1. **L'utilisateur clique sur "💬 Chat"**
   - Si non connecté → Modal d'authentification s'affiche
   - Si connecté → Chat s'ouvre directement

2. **Formulaire d'authentification**
   - Username (3-20 caractères, alphanumériques + underscore)
   - Email
   - Soumettre → Magic link envoyé par email

3. **Vérification email**
   - L'utilisateur clique sur le lien dans l'email
   - Authentification automatique
   - Profil créé avec le username choisi
   - Chat s'ouvre automatiquement

4. **Session persistante**
   - L'utilisateur reste connecté (localStorage + cookies)
   - Username persistant affiché dans le chat
   - Bouton username non cliquable (username de compte)

### Déconnexion

Pour se déconnecter (à implémenter dans le menu):

```javascript
await authSystem.signOut();
```

---

## 🔧 Architecture Technique

### Fichiers

```
js/auth.js          - Système d'authentification (AuthSystem class)
js/chat.js          - Chat P2P intégré avec authSystem
js/supabase.js      - Client Supabase initialisé
sql/create_profiles_table.sql - Schema SQL
```

### Flow d'authentification

```
┌─────────────────┐
│ User clicks     │
│ "💬 Chat"       │
└────────┬────────┘
         │
         ▼
    ┌────────────┐
    │ Connecté ? │
    └──┬──────┬──┘
       │ Non  │ Oui
       ▼      ▼
┌──────────┐  ┌────────────┐
│ Show     │  │ Open Chat  │
│ Auth     │  │ directly   │
│ Modal    │  └────────────┘
└────┬─────┘
     │ Submit (email + username)
     ▼
┌────────────────────┐
│ supabase.auth      │
│ .signInWithOtp()   │
└────────┬───────────┘
         │ Magic link sent
         ▼
┌────────────────────┐
│ User clicks link   │
│ in email           │
└────────┬───────────┘
         │ Auto-authenticate
         ▼
┌────────────────────┐
│ Trigger SQL:       │
│ Create profile     │
│ with username      │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ onAuthStateChange  │
│ → Load profile     │
│ → Open chat        │
│ → Use username     │
└────────────────────┘
```

### Intégration avec le chat

Le chat utilise `authSystem.getCurrentUser()` pour:
- Obtenir le username persistant au lieu d'un pseudo aléatoire
- Afficher "Username de votre compte" au lieu de permettre le changement
- Identifier l'utilisateur de manière unique dans les rooms P2P

```javascript
// Dans P2PChatSystem constructor
this.username = this.getUsernameFromAuth() || this.generateUsername();

// Écoute les changements d'auth
authSystem.onAuthChange((user) => {
    if (user && user.username) {
        this.username = user.username;
        this.updateUsernameInUI();
    }
});
```

---

## 🔒 Sécurité

### Row Level Security (RLS)

La table `profiles` a les policies suivantes:
- ✅ **Lecture publique**: Tout le monde peut voir les profils (username visible)
- ✅ **Création restreinte**: Seul le propriétaire peut créer son profil
- ✅ **Modification restreinte**: Seul le propriétaire peut modifier son profil

### Magic Link

- ✅ **Pas de mot de passe** stocké ou géré
- ✅ **Vérification email** obligatoire
- ✅ **Lien à usage unique** avec expiration (1h)
- ✅ **Session sécurisée** gérée par Supabase Auth

### Contraintes Username

- ✅ **Unique**: Pas de doublons
- ✅ **Format**: Alphanumériques + underscore seulement
- ✅ **Longueur**: 3-20 caractères
- ✅ **Immutable**: Ne peut pas être changé après création (pour l'instant)

---

## 📊 Tables Supabase

### Table `profiles`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key → `auth.users.id` (UNIQUE) |
| `username` | TEXT | Username unique (3-20 chars, alphanumeric + _) |
| `created_at` | TIMESTAMPTZ | Date de création |
| `updated_at` | TIMESTAMPTZ | Date de dernière modification |

### Indexes

- `idx_profiles_username` - Pour rechercher par username
- `idx_profiles_user_id` - Pour lier auth.users ↔ profiles

---

## 🧪 Tests

### Test local

1. Démarrer serveur: `python -m http.server 8000`
2. Ouvrir `http://localhost:8000`
3. Cliquer sur "💬 Chat"
4. Remplir username + email
5. Vérifier email (vérifier spam si rien)
6. Cliquer sur magic link
7. Vérifier que:
   - Chat s'ouvre automatiquement
   - Username affiché est celui choisi
   - Bouton username non cliquable

### Test production

Configurer **redirect URL** dans Supabase avec votre URL de prod:
```
https://votre-domaine.com
```

---

## 🚨 Troubleshooting

### Magic link non reçu

- Vérifier le dossier spam
- Vérifier la config SMTP dans Supabase
- Vérifier les quotas email (tier gratuit: 3 emails/h pour le même destinataire)

### Erreur "Username déjà pris"

- Le username est vérifié avant d'envoyer le magic link
- Choisir un username différent

### Session expirée

- La session expire après 7 jours par défaut
- L'utilisateur doit se reconnecter (nouveau magic link)

### Profil non créé

- Vérifier que le trigger SQL est bien créé:
  ```sql
  SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
  ```
- Vérifier les logs dans Supabase Dashboard → Database → Logs

---

## 💡 Améliorations futures

- [ ] Ajouter bouton déconnexion dans le menu
- [ ] Permettre de changer le username (avec cooldown)
- [ ] Ajouter avatar/photo de profil
- [ ] Statistiques utilisateur (messages envoyés, etc.)
- [ ] Lister les users en ligne
- [ ] Historique des rooms rejointes

---

**Développé avec Claude Code** 🤖✨
**Powered by Supabase Auth** 🔐
