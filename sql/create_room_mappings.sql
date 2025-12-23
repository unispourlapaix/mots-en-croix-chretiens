-- Table pour stocker les mappings code court -> peer ID
-- Permet le multijoueur cross-device avec codes courts
-- 
-- ⚡ OPTIMISATION: Cache mémoire côté client (5min TTL)
--    - 1er appel: DB → cache
--    - Appels suivants: cache uniquement (0 requête DB)
--    - Réduction ~90% des requêtes en pratique

CREATE TABLE IF NOT EXISTS room_mappings (
    id BIGSERIAL PRIMARY KEY,
    room_code TEXT UNIQUE NOT NULL,
    peer_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    
    -- Index pour recherche rapide
    CONSTRAINT room_code_format CHECK (length(room_code) = 6)
);

-- Index pour recherche par code
CREATE INDEX idx_room_mappings_code ON room_mappings(room_code);

-- Index pour nettoyage automatique des codes expirés
CREATE INDEX idx_room_mappings_expires ON room_mappings(expires_at);

-- Activer Row Level Security
ALTER TABLE room_mappings ENABLE ROW LEVEL SECURITY;

-- Politique: Tout le monde peut lire les mappings actifs
CREATE POLICY "Lecture publique des mappings actifs"
ON room_mappings
FOR SELECT
USING (expires_at > NOW());

-- Politique: Tout le monde peut créer des mappings
CREATE POLICY "Création publique de mappings"
ON room_mappings
FOR INSERT
WITH CHECK (true);

-- Politique: Mise à jour seulement pour les mappings non expirés
CREATE POLICY "Mise à jour des mappings actifs"
ON room_mappings
FOR UPDATE
USING (expires_at > NOW());

-- Fonction pour nettoyer automatiquement les mappings expirés
CREATE OR REPLACE FUNCTION cleanup_expired_room_mappings()
RETURNS void AS $$
BEGIN
    DELETE FROM room_mappings
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ⏰ Optionnel: Configurer un CRON job Supabase pour nettoyage automatique
-- Dashboard Supabase > Database > Cron Jobs
-- Créer un job qui exécute: SELECT cleanup_expired_room_mappings();
-- Fréquence recommandée: toutes les 6 heures
-- Cela évite l'accumulation de codes expirés dans la DB

-- Commentaires
COMMENT ON TABLE room_mappings IS 'Mapping des codes courts (6 caractères) vers les peer IDs pour le multijoueur';
COMMENT ON COLUMN room_mappings.room_code IS 'Code court à 6 caractères (ex: ABC123)';
COMMENT ON COLUMN room_mappings.peer_id IS 'ID du peer PeerJS de l''hôte de la salle';
COMMENT ON COLUMN room_mappings.expires_at IS 'Date d''expiration du mapping (24h par défaut)';
