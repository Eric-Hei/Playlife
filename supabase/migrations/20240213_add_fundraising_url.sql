-- Ajouter le champ fundraising_url à la table missions
ALTER TABLE missions ADD COLUMN IF NOT EXISTS fundraising_url TEXT;

-- Ajouter un commentaire pour documenter le champ
COMMENT ON COLUMN missions.fundraising_url IS 'URL de la cagnotte de financement (ex: leetchi.com)';

