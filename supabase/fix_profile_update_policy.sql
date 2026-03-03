-- ============================================
-- CORRECTION : Bug mise à jour profil utilisateur
-- ============================================
-- PROBLÈME : La clause WITH CHECK contenait une sous-requête sur la table
-- profiles elle-même (is_super_admin = SELECT is_super_admin FROM profiles...),
-- ce qui crée une récursion RLS dans PostgreSQL et fait échouer les UPDATE.
--
-- SOLUTION : Supprimer la sous-requête récursive. La politique USING (auth.uid() = id)
-- suffit pour empêcher un utilisateur de modifier le profil d'un autre.
-- Le champ is_super_admin n'est de toute façon pas envoyé dans le UPDATE du code frontend.
-- ============================================

-- Supprimer l'ancienne politique problématique
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Recréer sans sous-requête récursive
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Vérification
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can update their own profile'
    ) THEN
        RAISE NOTICE '✅ Politique "Users can update their own profile" recréée avec succès.';
    ELSE
        RAISE EXCEPTION '❌ Erreur : la politique n''a pas été créée.';
    END IF;
END $$;

