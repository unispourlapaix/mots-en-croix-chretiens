-- Script pour corriger la table profiles existante
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Supprimer la contrainte incorrecte sur id (si elle existe)
DO $$ 
BEGIN
    -- Supprimer la contrainte de clé étrangère incorrecte sur id
    ALTER TABLE public.profiles 
    DROP CONSTRAINT IF EXISTS profiles_id_fkey;
    
    RAISE NOTICE 'Contrainte incorrecte profiles_id_fkey supprimée';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Contrainte déjà supprimée ou inexistante';
END $$;

-- 2. Ajouter le DEFAULT à la colonne id si elle n'en a pas
DO $$ 
BEGIN
    ALTER TABLE public.profiles 
    ALTER COLUMN id SET DEFAULT gen_random_uuid();
    
    RAISE NOTICE 'DEFAULT ajouté à la colonne id';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Erreur: %', SQLERRM;
END $$;

-- 3. S'assurer que la bonne contrainte existe sur user_id
DO $$ 
BEGIN
    -- Ajouter la contrainte si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_user_id_fkey'
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Contrainte profiles_user_id_fkey ajoutée';
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Erreur: %', SQLERRM;
END $$;

-- 2. Vérifier la structure de la table
SELECT 
    column_name, 
    data_type, 
    column_default, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Si la table a des problèmes, la recréer (ATTENTION: ceci supprime les données!)
-- Décommentez seulement si nécessaire:
/*
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    username TEXT NOT NULL UNIQUE,
    email TEXT,
    game_prefix TEXT DEFAULT 'mots-en-croix-chretiens',
    game_level INTEGER DEFAULT 1,
    game_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 50),
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les profils sont publics en lecture"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Les utilisateurs peuvent créer leur profil"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur profil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);
*/
