-- Ajouter la colonne user_id si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'user_id'
    ) THEN
        -- La colonne n'existe pas, l'ajouter
        ALTER TABLE public.profiles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE;
        
        -- Créer l'index
        CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'game_prefix'
    ) THEN
        -- Ajouter game_prefix si elle n'existe pas
        ALTER TABLE public.profiles ADD COLUMN game_prefix TEXT DEFAULT 'mots-en-croix-chretiens';
    END IF;
END $$;

-- Table des profils utilisateurs (sera créée seulement si elle n'existe pas)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    username TEXT NOT NULL UNIQUE,
    game_prefix TEXT DEFAULT 'mots-en-croix-chretiens',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Index pour rechercher par username
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politique: Tout le monde peut lire les profils publics
DROP POLICY IF EXISTS "Les profils sont publics en lecture" ON public.profiles;
CREATE POLICY "Les profils sont publics en lecture"
    ON public.profiles FOR SELECT
    USING (true);

-- Politique: Les utilisateurs peuvent créer leur propre profil
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leur profil" ON public.profiles;
CREATE POLICY "Les utilisateurs peuvent créer leur profil"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent mettre à jour leur propre profil
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leur profil" ON public.profiles;
CREATE POLICY "Les utilisateurs peuvent mettre à jour leur profil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Créer le profil avec le username des metadata
    INSERT INTO public.profiles (user_id, username, game_prefix)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'User' || substr(NEW.id::text, 1, 8)),
        'mots-en-croix-chretiens'
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
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
