-- Table pour tracker les joueurs en ligne (découverte mondiale)
CREATE TABLE IF NOT EXISTS public.online_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    peer_id TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    avatar TEXT DEFAULT '😊',
    accept_mode TEXT DEFAULT 'manual',
    last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT peer_id_length CHECK (char_length(peer_id) >= 5)
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_online_players_peer_id ON public.online_players(peer_id);
CREATE INDEX IF NOT EXISTS idx_online_players_user_id ON public.online_players(user_id);
CREATE INDEX IF NOT EXISTS idx_online_players_heartbeat ON public.online_players(last_heartbeat);

-- RLS (Row Level Security)
ALTER TABLE public.online_players ENABLE ROW LEVEL SECURITY;

-- Politique: Tout le monde peut lire les joueurs en ligne
DROP POLICY IF EXISTS "Tout le monde peut voir les joueurs en ligne" ON public.online_players;
CREATE POLICY "Tout le monde peut voir les joueurs en ligne"
    ON public.online_players FOR SELECT
    USING (true);

-- Politique: Les utilisateurs peuvent ajouter leur présence
DROP POLICY IF EXISTS "Les utilisateurs peuvent annoncer leur présence" ON public.online_players;
CREATE POLICY "Les utilisateurs peuvent annoncer leur présence"
    ON public.online_players FOR INSERT
    WITH CHECK (true); -- Permet même aux non-authentifiés de s'annoncer

-- Politique: Les utilisateurs peuvent mettre à jour leur heartbeat
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leur heartbeat" ON public.online_players;
CREATE POLICY "Les utilisateurs peuvent mettre à jour leur heartbeat"
    ON public.online_players FOR UPDATE
    USING (true); -- Permet de mettre à jour le heartbeat

-- Politique: Permettre la suppression (pour cleanup)
DROP POLICY IF EXISTS "Permettre la suppression des joueurs inactifs" ON public.online_players;
CREATE POLICY "Permettre la suppression des joueurs inactifs"
    ON public.online_players FOR DELETE
    USING (true);

-- Fonction pour nettoyer automatiquement les joueurs inactifs (> 30 secondes)
CREATE OR REPLACE FUNCTION public.cleanup_inactive_players()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.online_players
    WHERE last_heartbeat < NOW() - INTERVAL '30 seconds';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour mettre à jour le heartbeat
CREATE OR REPLACE FUNCTION public.update_player_heartbeat(p_peer_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.online_players
    SET last_heartbeat = NOW()
    WHERE peer_id = p_peer_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les joueurs en ligne (actifs dans les 30 dernières secondes)
CREATE OR REPLACE FUNCTION public.get_online_players()
RETURNS TABLE (
    peer_id TEXT,
    username TEXT,
    avatar TEXT,
    accept_mode TEXT,
    last_heartbeat TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        op.peer_id,
        op.username,
        op.avatar,
        op.accept_mode,
        op.last_heartbeat
    FROM public.online_players op
    WHERE op.last_heartbeat > NOW() - INTERVAL '30 seconds'
    ORDER BY op.last_heartbeat DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer un job pour nettoyer automatiquement (pg_cron si disponible)
-- Sinon, le cleanup sera fait côté client
COMMENT ON TABLE public.online_players IS 'Table pour tracker les joueurs en ligne en temps réel via PeerJS';
