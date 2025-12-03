# 🗄️ Configuration de la Base de Données Supabase

## ⚠️ IMPORTANT : À faire une seule fois

La table `profiles` doit être créée dans votre base Supabase avant d'utiliser l'authentification.

---

## 📝 Étapes pour créer la table

### 1. Aller dans Supabase Dashboard

1. Ouvrir [supabase.com](https://supabase.com)
2. Se connecter à votre compte
3. Sélectionner votre projet : `dmszyxowetilvsanqsxm`

### 2. Ouvrir l'éditeur SQL

1. Dans le menu de gauche, cliquer sur **"SQL Editor"**
2. Cliquer sur **"+ New query"**

### 3. Copier-coller le script SQL

Copier **tout le contenu** du fichier [`sql/create_profiles_table.sql`](sql/create_profiles_table.sql) et le coller dans l'éditeur SQL.

Ou copier directement ce code :

```sql
-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Index pour rechercher par username
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique: Tout le monde peut lire les profils publics
CREATE POLICY "Les profils sont publics en lecture"
    ON profiles FOR SELECT
    USING (true);

-- Politique: Les utilisateurs peuvent créer leur propre profil
CREATE POLICY "Les utilisateurs peuvent créer leur profil"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Les utilisateurs peuvent mettre à jour leur profil"
    ON profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Créer le profil avec le username des metadata
    INSERT INTO public.profiles (user_id, username)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'User' || substr(NEW.id::text, 1, 8))
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le profil automatiquement
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS on_profile_updated ON profiles;
CREATE TRIGGER on_profile_updated
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
```

### 4. Exécuter le script

1. Cliquer sur le bouton **"Run"** (en bas à droite) ou utiliser `Ctrl+Enter`
2. Attendre que l'exécution soit terminée (quelques secondes)
3. Vérifier qu'il n'y a pas d'erreurs

### 5. Vérifier que la table est créée

1. Dans le menu de gauche, cliquer sur **"Table Editor"**
2. Vous devriez voir la table **`profiles`** avec les colonnes :
   - `id` (UUID)
   - `user_id` (UUID) ← **Cette colonne est cruciale !**
   - `username` (TEXT)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

---

## ✅ C'est terminé !

Maintenant, quand un utilisateur s'inscrit :
1. Supabase Auth crée le compte dans `auth.users`
2. Le trigger SQL crée automatiquement une entrée dans `profiles` avec le `username`
3. L'application peut charger le profil avec `user_id`

---

## 🔧 En cas de problème

### Erreur : "column profiles.user_id does not exist"

➡️ La table n'a pas été créée ou a été créée sans la colonne `user_id`

**Solution :**
1. Supprimer la table existante (si elle existe) :
   ```sql
   DROP TABLE IF EXISTS profiles CASCADE;
   ```
2. Réexécuter le script complet ci-dessus

### Erreur : "relation profiles already exists"

➡️ La table existe déjà

**Solutions :**
- Si elle a la bonne structure → Rien à faire
- Si elle manque des colonnes → La supprimer et recréer (voir ci-dessus)

### Vérifier la structure actuelle

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';
```

---

## 📊 Structure de la table `profiles`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Primary key (auto-généré) |
| `user_id` | UUID | Foreign key → `auth.users.id` (UNIQUE) |
| `username` | TEXT | Nom d'utilisateur (3-20 chars, unique) |
| `created_at` | TIMESTAMPTZ | Date de création |
| `updated_at` | TIMESTAMPTZ | Date de dernière modification |

### Contraintes

- `username` : 3-20 caractères, alphanumériques + underscore uniquement
- `user_id` : Unique (un seul profil par utilisateur)
- RLS activé : sécurité au niveau des lignes

### Triggers

- `on_auth_user_created` : Crée automatiquement le profil lors de l'inscription
- `on_profile_updated` : Met à jour `updated_at` automatiquement

---

**Développé avec Claude Code** 🤖✨
**Powered by Supabase** 🔥
