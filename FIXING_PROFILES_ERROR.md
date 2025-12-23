# 🔧 Correction de l'erreur "profiles_id_fkey"

## Problème
L'erreur suivante apparaît lors de la création automatique d'un profil :
```
insert or update on table "profiles" violates foreign key constraint "profiles_id_fkey"
Key is not present in table "users"
```

## Cause
La table `profiles` a une contrainte de clé étrangère **incorrecte** sur la colonne `id` au lieu de `user_id`. Cela empêche l'insertion de nouveaux profils car PostgreSQL essaie de vérifier que l'`id` auto-généré existe dans `auth.users`, ce qui n'a aucun sens.

## Solution

### Étape 1 : Corriger la table (OBLIGATOIRE)
Exécutez ces commandes dans l'éditeur SQL de Supabase :

```sql
-- Supprimer la contrainte incorrecte
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Ajouter le DEFAULT pour l'auto-génération de l'id
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- S'assurer que la bonne contrainte existe sur user_id
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

### Étape 2 : Créer manuellement votre profil
Après avoir corrigé la table, créez votre profil :

```sql
INSERT INTO public.profiles (user_id, username, game_prefix)
VALUES ('dac990f0-9d0f-4f84-a73a-661adedaccc9', 'emmanuelpayet_dac990', 'CWORD');
```

### Alternative : Utiliser le script de correction
Exécutez simplement le fichier `sql/fix_profiles_table.sql` dans l'éditeur SQL de Supabase. Il fait tout automatiquement.

## Vérification
Après correction, vérifiez que la structure est correcte :

```sql
SELECT 
    column_name, 
    data_type, 
    column_default, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;
```

La colonne `id` devrait avoir :
- `column_default`: `gen_random_uuid()`
- `is_nullable`: `NO`

## Test
1. Déconnectez-vous du jeu
2. Rafraîchissez la page
3. Reconnectez-vous
4. Le profil devrait se créer automatiquement

## Support
Si le problème persiste, vérifiez :
- Les permissions RLS (Row Level Security) sur la table `profiles`
- Les logs d'erreur dans la console Supabase
- Que votre utilisateur a les droits d'insertion sur la table
