-- ============================================
-- CORRECTION : Colonne user_type dans profiles
-- ============================================
-- PROBLÈME : La colonne user_type est définie comme un ENUM dans la base
-- de données existante, mais le code envoie des valeurs TEXT ('voyageur',
-- 'animateur'). Cela cause l'erreur :
-- "invalid input value for enum user_type: voyageur"
--
-- SOLUTION : Convertir la colonne en TEXT simple (comme dans la migration)
-- ============================================

-- Étape 1 : Supprimer la vue qui dépend de la colonne
DROP VIEW IF EXISTS public.public_profiles;

-- Étape 2 : Convertir la colonne de ENUM vers TEXT
ALTER TABLE public.profiles
  ALTER COLUMN user_type TYPE TEXT USING user_type::TEXT;

-- Étape 3 : Recréer la vue avec security_invoker
CREATE VIEW public.public_profiles
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

GRANT SELECT ON public.public_profiles TO anon, authenticated;

COMMENT ON VIEW public.public_profiles IS 'Vue publique des profils sans données sensibles (email, is_super_admin) - SECURITY INVOKER';

-- Vérification après modification
DO $$
DECLARE
    col_type TEXT;
BEGIN
    SELECT data_type INTO col_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'user_type';

    IF col_type = 'text' THEN
        RAISE NOTICE '✅ Colonne user_type convertie en TEXT avec succès.';
    ELSE
        RAISE EXCEPTION '❌ Erreur : la colonne est toujours de type %', col_type;
    END IF;
END $$;

