-- Ajout de la colonne visible sur la table missions
-- Une mission créée est invisible par défaut jusqu'à validation par l'admin

ALTER TABLE public.missions
ADD COLUMN IF NOT EXISTS visible boolean DEFAULT false;

-- Les missions existantes sont rendues visibles pour ne pas casser l'affichage actuel
UPDATE public.missions SET visible = true WHERE visible IS NULL;

