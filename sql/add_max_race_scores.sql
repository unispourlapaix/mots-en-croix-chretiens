-- Ajouter les colonnes max_score et race_score à la table profiles
-- game_score = Score de la partie en cours
-- max_score = Meilleur score jamais atteint (pour leaderboard)
-- race_score = Score en mode course multijoueur

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS max_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS race_score INTEGER DEFAULT 0;

-- Créer un index sur max_score pour les requêtes de classement
CREATE INDEX IF NOT EXISTS idx_profiles_max_score ON public.profiles(max_score DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_race_score ON public.profiles(race_score DESC);

-- Mettre à jour les données existantes : copier game_score vers max_score
UPDATE public.profiles 
SET max_score = game_score 
WHERE max_score = 0 AND game_score > 0;

-- Vérifier les nouvelles colonnes
SELECT 
    username,
    game_level,
    game_score,
    max_score,
    race_score
FROM public.profiles
ORDER BY max_score DESC
LIMIT 10;
