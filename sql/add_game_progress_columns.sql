-- Script pour ajouter les colonnes de progression du jeu à la table profiles
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Ajouter les colonnes de progression si elles n'existent pas
DO $$ 
BEGIN
    -- Ajouter la colonne email
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN email TEXT;
        
        RAISE NOTICE 'Colonne email ajoutée';
    ELSE
        RAISE NOTICE 'Colonne email existe déjà';
    END IF;

    -- Ajouter la colonne game_level
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'game_level'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN game_level INTEGER DEFAULT 1;
        
        RAISE NOTICE 'Colonne game_level ajoutée';
    ELSE
        RAISE NOTICE 'Colonne game_level existe déjà';
    END IF;

    -- Ajouter la colonne game_score
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'game_score'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN game_score INTEGER DEFAULT 0;
        
        RAISE NOTICE 'Colonne game_score ajoutée';
    ELSE
        RAISE NOTICE 'Colonne game_score existe déjà';
    END IF;

    -- Ajouter la colonne game_prefix
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'game_prefix'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN game_prefix TEXT DEFAULT 'mots-en-croix-chretiens';
        
        RAISE NOTICE 'Colonne game_prefix ajoutée';
    ELSE
        RAISE NOTICE 'Colonne game_prefix existe déjà';
    END IF;

    -- Ajouter la colonne updated_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        
        RAISE NOTICE 'Colonne updated_at ajoutée';
    ELSE
        RAISE NOTICE 'Colonne updated_at existe déjà';
    END IF;
    
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Erreur: %', SQLERRM;
END $$;

-- Créer un index sur email pour les recherches
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Mettre à jour les enregistrements existants avec game_prefix si vide
UPDATE public.profiles 
SET game_prefix = 'mots-en-croix-chretiens' 
WHERE game_prefix IS NULL OR game_prefix = 'CWORD';

-- Vérifier que les colonnes ont bien été ajoutées
SELECT 
    column_name, 
    data_type, 
    column_default, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND column_name IN ('email', 'game_level', 'game_score', 'game_prefix', 'updated_at')
ORDER BY ordinal_position;
