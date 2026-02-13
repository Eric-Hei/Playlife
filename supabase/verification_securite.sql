-- ============================================
-- SCRIPT DE VÉRIFICATION DE LA SÉCURITÉ
-- ============================================
-- Exécutez ce script dans Supabase SQL Editor pour vérifier que tout est bien configuré

-- ============================================
-- 1. VÉRIFICATION DES POLITIQUES MISSIONS
-- ============================================

SELECT '========== POLITIQUES MISSIONS ==========' AS section;

SELECT 
    policyname AS "Nom de la politique",
    cmd AS "Commande",
    roles AS "Rôles"
FROM pg_policies
WHERE tablename = 'missions'
ORDER BY policyname;

-- Compter les politiques (devrait être 6)
SELECT 
    COUNT(*) AS "Nombre de politiques missions (devrait être 6)"
FROM pg_policies
WHERE tablename = 'missions';

-- ============================================
-- 2. VÉRIFICATION DES POLITIQUES PROFILES
-- ============================================

SELECT '========== POLITIQUES PROFILES ==========' AS section;

SELECT 
    policyname AS "Nom de la politique",
    cmd AS "Commande",
    roles AS "Rôles"
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Compter les politiques (devrait être 5)
SELECT 
    COUNT(*) AS "Nombre de politiques profiles (devrait être 5)"
FROM pg_policies
WHERE tablename = 'profiles';

-- ============================================
-- 3. VÉRIFICATION DE LA VUE PUBLIC_PROFILES
-- ============================================

SELECT '========== VUE PUBLIC_PROFILES ==========' AS section;

-- Vérifier que la vue existe
SELECT 
    schemaname AS "Schéma",
    viewname AS "Nom de la vue",
    viewowner AS "Propriétaire"
FROM pg_views
WHERE viewname = 'public_profiles';

-- Vérifier les colonnes de la vue (NE DOIT PAS contenir email ni is_super_admin)
SELECT 
    column_name AS "Colonnes de public_profiles"
FROM information_schema.columns
WHERE table_name = 'public_profiles'
ORDER BY ordinal_position;

-- ============================================
-- 4. VÉRIFICATION DES POLITIQUES STRUCTURES
-- ============================================

SELECT '========== POLITIQUES STRUCTURES ==========' AS section;

SELECT 
    policyname AS "Nom de la politique",
    cmd AS "Commande",
    roles AS "Rôles"
FROM pg_policies
WHERE tablename = 'structures'
ORDER BY policyname;

-- ============================================
-- 5. RÉSUMÉ FINAL
-- ============================================

SELECT '========== RÉSUMÉ FINAL ==========' AS section;

SELECT 
    'missions' AS "Table",
    COUNT(*) AS "Nombre de politiques",
    CASE 
        WHEN COUNT(*) = 6 THEN '✅ OK'
        ELSE '❌ PROBLÈME'
    END AS "Statut"
FROM pg_policies
WHERE tablename = 'missions'

UNION ALL

SELECT 
    'profiles' AS "Table",
    COUNT(*) AS "Nombre de politiques",
    CASE 
        WHEN COUNT(*) = 5 THEN '✅ OK'
        ELSE '❌ PROBLÈME'
    END AS "Statut"
FROM pg_policies
WHERE tablename = 'profiles'

UNION ALL

SELECT 
    'structures' AS "Table",
    COUNT(*) AS "Nombre de politiques",
    CASE 
        WHEN COUNT(*) >= 5 THEN '✅ OK'
        ELSE '❌ PROBLÈME'
    END AS "Statut"
FROM pg_policies
WHERE tablename = 'structures'

UNION ALL

SELECT 
    'public_profiles (vue)' AS "Table",
    COUNT(*) AS "Nombre",
    CASE 
        WHEN COUNT(*) = 1 THEN '✅ OK'
        ELSE '❌ PROBLÈME'
    END AS "Statut"
FROM pg_views
WHERE viewname = 'public_profiles';

-- ============================================
-- 6. MESSAGE FINAL
-- ============================================

DO $$
DECLARE
    missions_count INT;
    profiles_count INT;
    view_count INT;
BEGIN
    SELECT COUNT(*) INTO missions_count FROM pg_policies WHERE tablename = 'missions';
    SELECT COUNT(*) INTO profiles_count FROM pg_policies WHERE tablename = 'profiles';
    SELECT COUNT(*) INTO view_count FROM pg_views WHERE viewname = 'public_profiles';
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RÉSULTAT DE LA VÉRIFICATION';
    RAISE NOTICE '========================================';
    
    IF missions_count = 6 THEN
        RAISE NOTICE '✅ MISSIONS : % politiques (OK)', missions_count;
    ELSE
        RAISE NOTICE '❌ MISSIONS : % politiques (devrait être 6)', missions_count;
    END IF;
    
    IF profiles_count = 5 THEN
        RAISE NOTICE '✅ PROFILES : % politiques (OK)', profiles_count;
    ELSE
        RAISE NOTICE '❌ PROFILES : % politiques (devrait être 5)', profiles_count;
    END IF;
    
    IF view_count = 1 THEN
        RAISE NOTICE '✅ VUE public_profiles : Créée (OK)';
    ELSE
        RAISE NOTICE '❌ VUE public_profiles : Non trouvée';
    END IF;
    
    RAISE NOTICE '========================================';
    
    IF missions_count = 6 AND profiles_count = 5 AND view_count = 1 THEN
        RAISE NOTICE '🎉 TOUT EST BON ! La sécurité est correctement configurée.';
    ELSE
        RAISE NOTICE '⚠️  Il y a des problèmes. Vérifiez les détails ci-dessus.';
    END IF;
    
    RAISE NOTICE '========================================';
END $$;

