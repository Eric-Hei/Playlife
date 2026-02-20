-- Ajout de la colonne postal_code à la table structures
ALTER TABLE public.structures 
ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- Commentaire pour expliquer la colonne
COMMENT ON COLUMN public.structures.postal_code IS 'Code postal de la structure';
