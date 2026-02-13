-- ============================================
-- CORRECTION DE L'ALERTE SECURITY DEFINER
-- ============================================

-- Vérifier la définition actuelle de la vue
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views
WHERE viewname = 'public_profiles';

-- Supprimer complètement la vue
DROP VIEW IF EXISTS public_profiles CASCADE;

-- Recréer la vue avec SECURITY INVOKER explicite
CREATE VIEW public_profiles 
WITH (security_invoker = true)
AS
SELECT 
    id,
    full_name,
    avatar_url,
    role,
    user_type,
    created_at,
    updated_at
FROM profiles;

-- Donner les droits de lecture
GRANT SELECT ON public_profiles TO anon, authenticated;

-- Ajouter un commentaire
COMMENT ON VIEW public_profiles IS 'Vue publique des profils sans données sensibles (email, is_super_admin) - SECURITY INVOKER';

-- Vérification finale
SELECT 
    schemaname,
    viewname,
    viewowner,
    definition
FROM pg_views
WHERE viewname = 'public_profiles';

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Vue public_profiles recréée avec SECURITY INVOKER';
    RAISE NOTICE '✅ L''alerte devrait disparaître après rafraîchissement';
    RAISE NOTICE 'ℹ️  Si l''alerte persiste, attendez quelques minutes ou rafraîchissez la page';
END $$;

