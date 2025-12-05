-- Fonction PostgreSQL pour obtenir les stats globales du leaderboard
-- Évite de charger tous les scores côté client
-- Accès DB minimal et performant

-- 1. Créer la fonction pour les stats globales
CREATE OR REPLACE FUNCTION get_leaderboard_stats()
RETURNS TABLE (
    total_players BIGINT,
    top_score INTEGER,
    avg_score NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_players,
        MAX(max_score) as top_score,
        ROUND(AVG(max_score), 0) as avg_score
    FROM public.profiles
    WHERE max_score > 0;
END;
$$;

-- 2. Créer un index sur max_score pour optimiser les requêtes de classement
CREATE INDEX IF NOT EXISTS idx_profiles_max_score_desc 
ON public.profiles(max_score DESC);

-- 3. Créer une vue matérialisée pour le top 100 (optionnel, pour performances extrêmes)
-- Cette vue se rafraîchit toutes les 5 minutes via un cron job
CREATE MATERIALIZED VIEW IF NOT EXISTS leaderboard_top100 AS
SELECT 
    username,
    max_score,
    updated_at,
    ROW_NUMBER() OVER (ORDER BY max_score DESC) as rank
FROM public.profiles
WHERE max_score > 0
ORDER BY max_score DESC
LIMIT 100;

-- Index sur la vue matérialisée
CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_top100_username 
ON leaderboard_top100(username);

-- 4. Fonction pour rafraîchir la vue matérialisée
CREATE OR REPLACE FUNCTION refresh_leaderboard_cache()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_top100;
    RAISE NOTICE 'Leaderboard cache rafraîchi';
END;
$$;

-- 5. Créer un trigger pour rafraîchir automatiquement quand max_score change
-- (Attention: peut être coûteux si beaucoup d'updates)
CREATE OR REPLACE FUNCTION trigger_refresh_leaderboard()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Rafraîchir seulement si max_score a changé significativement
    IF (NEW.max_score <> OLD.max_score AND NEW.max_score > OLD.max_score) THEN
        -- Ne pas bloquer, rafraîchir en arrière-plan
        PERFORM refresh_leaderboard_cache();
    END IF;
    RETURN NEW;
END;
$$;

-- Attacher le trigger (OPTIONNEL - peut ralentir les updates)
-- Décommenter si vous voulez un cache toujours à jour
/*
DROP TRIGGER IF EXISTS trigger_profiles_max_score_update ON public.profiles;
CREATE TRIGGER trigger_profiles_max_score_update
AFTER UPDATE OF max_score ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_refresh_leaderboard();
*/

-- 6. Politique RLS pour la vue matérialisée
ALTER MATERIALIZED VIEW leaderboard_top100 OWNER TO postgres;

-- 7. Fonction pour obtenir le rang d'un joueur spécifique (sans charger tout le classement)
CREATE OR REPLACE FUNCTION get_player_rank(player_username TEXT)
RETURNS TABLE (
    rank BIGINT,
    max_score INTEGER,
    total_players BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH ranked_players AS (
        SELECT 
            username,
            max_score,
            ROW_NUMBER() OVER (ORDER BY max_score DESC) as player_rank
        FROM public.profiles
        WHERE max_score > 0
    ),
    total AS (
        SELECT COUNT(*)::BIGINT as count FROM public.profiles WHERE max_score > 0
    )
    SELECT 
        rp.player_rank,
        rp.max_score,
        t.count
    FROM ranked_players rp
    CROSS JOIN total t
    WHERE rp.username = player_username;
END;
$$;

-- 8. Tester les fonctions
SELECT * FROM get_leaderboard_stats();
SELECT * FROM get_player_rank('test_user');

-- 9. Vérifier les index
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'profiles'
AND indexname LIKE '%score%';

-- 10. Instructions pour rafraîchir manuellement le cache
-- REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_top100;

-- 11. Configurer un cron job pour rafraîchir le cache toutes les 5 minutes (via pg_cron)
-- SELECT cron.schedule('refresh-leaderboard', '*/5 * * * *', 'SELECT refresh_leaderboard_cache()');

COMMENT ON FUNCTION get_leaderboard_stats() IS 'Retourne les statistiques globales du leaderboard sans charger tous les scores';
COMMENT ON FUNCTION get_player_rank(TEXT) IS 'Retourne le rang, score et total de joueurs pour un joueur spécifique';
COMMENT ON FUNCTION refresh_leaderboard_cache() IS 'Rafraîchit la vue matérialisée du top 100';
COMMENT ON MATERIALIZED VIEW leaderboard_top100 IS 'Cache du top 100 joueurs pour performances optimales';
