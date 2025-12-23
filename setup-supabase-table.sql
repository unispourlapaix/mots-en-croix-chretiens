-- Table pour les scores du jeu Mots En Croix Chrétiens
-- À exécuter dans l'éditeur SQL de Supabase (https://dmszyxowetilvsanqsxm.supabase.co)

CREATE TABLE IF NOT EXISTS mots_croix_scores (
  id BIGSERIAL PRIMARY KEY,
  game_prefix TEXT NOT NULL DEFAULT 'mots-en-croix-chretiens',
  player_name TEXT NOT NULL,
  player_email TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes de classement
CREATE INDEX IF NOT EXISTS idx_mots_croix_scores_ranking
ON mots_croix_scores(game_prefix, score DESC, created_at DESC);

-- Index pour rechercher par email
CREATE INDEX IF NOT EXISTS idx_mots_croix_scores_email
ON mots_croix_scores(player_email);

-- Activer Row Level Security (RLS) pour la sécurité
ALTER TABLE mots_croix_scores ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Les scores sont visibles publiquement" ON mots_croix_scores;
DROP POLICY IF EXISTS "N'importe qui peut insérer un score" ON mots_croix_scores;

-- Politique: Tout le monde peut lire les scores
CREATE POLICY "Les scores sont visibles publiquement"
ON mots_croix_scores FOR SELECT
USING (true);

-- Politique: Tout le monde peut insérer des scores
CREATE POLICY "N'importe qui peut insérer un score"
ON mots_croix_scores FOR INSERT
WITH CHECK (true);

-- Commentaires pour documentation
COMMENT ON TABLE mots_croix_scores IS 'Scores du jeu Mots En Croix Chrétiens';
COMMENT ON COLUMN mots_croix_scores.game_prefix IS 'Identifiant du jeu (mots-en-croix-chretiens)';
COMMENT ON COLUMN mots_croix_scores.player_name IS 'Nom du joueur';
COMMENT ON COLUMN mots_croix_scores.player_email IS 'Email du joueur';
COMMENT ON COLUMN mots_croix_scores.score IS 'Score obtenu (en points)';
COMMENT ON COLUMN mots_croix_scores.created_at IS 'Date et heure de soumission du score';
