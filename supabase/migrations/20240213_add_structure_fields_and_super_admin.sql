-- Ajouter les champs manquants à la table structures 
ALTER TABLE structures ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE structures ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'à valider playlife' CHECK (status IN ('à valider playlife', 'validée', 'refusée'));
ALTER TABLE structures ADD COLUMN IF NOT EXISTS origin_info TEXT;
ALTER TABLE structures ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Ajouter des commentaires pour documenter les champs
COMMENT ON COLUMN structures.contact_name IS 'Nom du contact dans la structure';
COMMENT ON COLUMN structures.status IS 'Statut de validation de la structure (à valider playlife, validée, refusée)';
COMMENT ON COLUMN structures.origin_info IS 'Comment l''utilisateur a connu cette structure ou quel est son lien avec elle';
COMMENT ON COLUMN structures.created_by IS 'ID de l''utilisateur qui a créé la structure';

-- Ajouter le champ is_super_admin à la table profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- Ajouter un commentaire
COMMENT ON COLUMN profiles.is_super_admin IS 'Indique si l''utilisateur est un super administrateur';

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_structures_status ON structures(status);
CREATE INDEX IF NOT EXISTS idx_structures_created_by ON structures(created_by);
CREATE INDEX IF NOT EXISTS idx_profiles_is_super_admin ON profiles(is_super_admin);

-- Mettre à jour les politiques RLS pour structures
-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Anyone can view structures" ON structures;
DROP POLICY IF EXISTS "Authenticated users can create structures" ON structures;

-- Nouvelle politique : tout le monde peut voir les structures validées
CREATE POLICY "Anyone can view validated structures"
ON structures FOR SELECT
TO public
USING (status = 'validée');

-- Nouvelle politique : les utilisateurs authentifiés peuvent créer des structures
CREATE POLICY "Authenticated users can create structures"
ON structures FOR INSERT
TO authenticated
WITH CHECK (true);

-- Nouvelle politique : les utilisateurs peuvent voir leurs propres structures en attente
CREATE POLICY "Users can view their own pending structures"
ON structures FOR SELECT
TO authenticated
USING (created_by = auth.uid());

-- Nouvelle politique : les super admins peuvent tout voir
CREATE POLICY "Super admins can view all structures"
ON structures FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_super_admin = true
    )
);

-- Nouvelle politique : les super admins peuvent tout modifier
CREATE POLICY "Super admins can update all structures"
ON structures FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_super_admin = true
    )
);

-- Nouvelle politique : les super admins peuvent tout supprimer
CREATE POLICY "Super admins can delete all structures"
ON structures FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_super_admin = true
    )
);

-- Nouvelle politique : les super admins peuvent modifier toutes les missions
DROP POLICY IF EXISTS "Users can update their own missions" ON missions;

CREATE POLICY "Users can update their own missions"
ON missions FOR UPDATE
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Super admins can update all missions"
ON missions FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_super_admin = true
    )
);

