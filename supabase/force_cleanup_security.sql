-- ============================================
-- SCRIPT DE NETTOYAGE FORCÉ (MÉTHODE RADICALE)
-- ============================================
-- Ce script supprime TOUTES les politiques de manière dynamique

-- ============================================
-- ÉTAPE 1 : SUPPRIMER TOUTES LES POLITIQUES PROFILES (DYNAMIQUE)
-- ============================================

DO $$
DECLARE
    policy_record RECORD;
BEGIN
    RAISE NOTICE 'Suppression de toutes les politiques sur la table profiles...';
    
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', policy_record.policyname);
        RAISE NOTICE 'Supprimé: %', policy_record.policyname;
    END LOOP;
    
    RAISE NOTICE 'Toutes les politiques profiles ont été supprimées.';
END $$;

-- ============================================
-- ÉTAPE 2 : SUPPRIMER TOUTES LES POLITIQUES MISSIONS (DYNAMIQUE)
-- ============================================

DO $$
DECLARE
    policy_record RECORD;
BEGIN
    RAISE NOTICE 'Suppression de toutes les politiques sur la table missions...';
    
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'missions'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON missions', policy_record.policyname);
        RAISE NOTICE 'Supprimé: %', policy_record.policyname;
    END LOOP;
    
    RAISE NOTICE 'Toutes les politiques missions ont été supprimées.';
END $$;

-- ============================================
-- ÉTAPE 3 : CRÉER LES POLITIQUES MISSIONS (6 politiques)
-- ============================================

-- 1. Lecture publique
CREATE POLICY "Missions are viewable by everyone"
ON missions FOR SELECT
TO public
USING (true);

-- 2. Création (utilisateurs authentifiés uniquement)
CREATE POLICY "Authenticated users can create missions"
ON missions FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- 3. Modification (créateur uniquement)
CREATE POLICY "Users can update their own missions"
ON missions FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- 4. Suppression (créateur uniquement)
CREATE POLICY "Users can delete their own missions"
ON missions FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- 5. Modification (super admins)
CREATE POLICY "Super admins can update all missions"
ON missions FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_super_admin = true
    )
)
WITH CHECK (true);

-- 6. Suppression (super admins)
CREATE POLICY "Super admins can delete all missions"
ON missions FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_super_admin = true
    )
);

-- ============================================
-- ÉTAPE 4 : CRÉER LES POLITIQUES PROFILES (5 politiques)
-- ============================================

-- 1. Lecture (utilisateurs authentifiés)
CREATE POLICY "Authenticated users can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- 2. Lecture (utilisateurs anonymes)
CREATE POLICY "Anonymous users can view public profile info"
ON profiles FOR SELECT
TO anon
USING (true);

-- 3. Création (son propre profil)
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 4. Modification (son propre profil, sans changer is_super_admin)
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id 
    AND is_super_admin = (SELECT is_super_admin FROM profiles WHERE id = auth.uid())
);

-- 5. Modification (super admins peuvent tout modifier)
CREATE POLICY "Super admins can update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_super_admin = true
    )
)
WITH CHECK (true);

-- ============================================
-- ÉTAPE 5 : VÉRIFICATION FINALE
-- ============================================

DO $$
DECLARE
    missions_count INT;
    profiles_count INT;
BEGIN
    SELECT COUNT(*) INTO missions_count FROM pg_policies WHERE tablename = 'missions';
    SELECT COUNT(*) INTO profiles_count FROM pg_policies WHERE tablename = 'profiles';
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RÉSULTAT FINAL';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MISSIONS : % politiques (attendu: 6)', missions_count;
    RAISE NOTICE 'PROFILES : % politiques (attendu: 5)', profiles_count;
    RAISE NOTICE '========================================';
    
    IF missions_count = 6 AND profiles_count = 5 THEN
        RAISE NOTICE '🎉 SUCCÈS ! Configuration correcte.';
    ELSE
        RAISE NOTICE '⚠️  ATTENTION : Nombre incorrect de politiques.';
    END IF;
END $$;

-- Afficher les politiques créées
SELECT 'MISSIONS' AS table_name, policyname FROM pg_policies WHERE tablename = 'missions'
UNION ALL
SELECT 'PROFILES' AS table_name, policyname FROM pg_policies WHERE tablename = 'profiles'
ORDER BY table_name, policyname;

