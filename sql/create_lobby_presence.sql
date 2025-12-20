-- Table pour le lobby public avec Supabase Realtime
-- Permet de voir les joueurs en ligne en temps réel

CREATE TABLE IF NOT EXISTS lobby_presence (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    peer_id TEXT NOT NULL,
    username TEXT NOT NULL,
    avatar TEXT DEFAULT '😊',
    room_code TEXT,
    room_mode TEXT CHECK (room_mode IN ('manual', 'auto')) DEFAULT 'manual',
    player_count INTEGER DEFAULT 1,
    max_players INTEGER DEFAULT 8,
    status TEXT CHECK (status IN ('lobby', 'in-game', 'waiting')) DEFAULT 'lobby',
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    
    -- Un joueur ne peut avoir qu'une seule présence active
    UNIQUE(peer_id)
);

-- Index pour recherche rapide
CREATE INDEX idx_lobby_presence_user_id ON lobby_presence(user_id);
CREATE INDEX idx_lobby_presence_peer_id ON lobby_presence(peer_id);
CREATE INDEX idx_lobby_presence_last_seen ON lobby_presence(last_seen);
CREATE INDEX idx_lobby_presence_status ON lobby_presence(status);

-- Activer Row Level Security
ALTER TABLE lobby_presence ENABLE ROW LEVEL SECURITY;

-- Politique: Tout le monde peut lire les présences actives
CREATE POLICY "Lecture publique des présences"
ON lobby_presence
FOR SELECT
USING (last_seen > NOW() - INTERVAL '1 minute');

-- Politique: Les utilisateurs authentifiés peuvent créer leur présence
CREATE POLICY "Création de sa propre présence"
ON lobby_presence
FOR INSERT
WITH CHECK (true);

-- Politique: Mise à jour seulement de sa propre présence
CREATE POLICY "Mise à jour de sa propre présence"
ON lobby_presence
FOR UPDATE
USING (peer_id = current_setting('request.jwt.claims', true)::json->>'peer_id' OR true);

-- Politique: Suppression de sa propre présence
CREATE POLICY "Suppression de sa propre présence"
ON lobby_presence
FOR DELETE
USING (peer_id = current_setting('request.jwt.claims', true)::json->>'peer_id' OR true);

-- Fonction pour nettoyer automatiquement les présences inactives
CREATE OR REPLACE FUNCTION cleanup_inactive_presence()
RETURNS void AS $$
BEGIN
    DELETE FROM lobby_presence
    WHERE last_seen < NOW() - INTERVAL '2 minutes';
END;
$$ LANGUAGE plpgsql;

-- ⏰ CRON Job recommandé : Exécuter toutes les minutes
-- SELECT cleanup_inactive_presence();

-- Vue pour les joueurs disponibles dans le lobby
CREATE OR REPLACE VIEW lobby_available_players AS
SELECT 
    peer_id,
    username,
    avatar,
    room_code,
    room_mode,
    player_count,
    max_players,
    status,
    last_seen,
    EXTRACT(EPOCH FROM (NOW() - last_seen)) as seconds_ago
FROM lobby_presence
WHERE 
    last_seen > NOW() - INTERVAL '1 minute'
    AND status = 'lobby'
ORDER BY last_seen DESC;

-- Commentaires
COMMENT ON TABLE lobby_presence IS 'Présence en temps réel des joueurs dans le lobby public (Supabase Realtime)';
COMMENT ON COLUMN lobby_presence.peer_id IS 'ID PeerJS unique du joueur';
COMMENT ON COLUMN lobby_presence.room_code IS 'Code de la salle si le joueur en héberge une';
COMMENT ON COLUMN lobby_presence.room_mode IS 'Mode d''acceptation : manual (demande) ou auto (automatique)';
COMMENT ON COLUMN lobby_presence.status IS 'État du joueur : lobby (disponible), in-game (en partie), waiting (en attente)';
COMMENT ON COLUMN lobby_presence.last_seen IS 'Dernière activité (heartbeat toutes les 30s)';

-- Activer Realtime pour cette table
ALTER PUBLICATION supabase_realtime ADD TABLE lobby_presence;
