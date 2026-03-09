-- ============================================================
-- SECURITY HARDENING - PLAYLIFE
-- ============================================================
-- À exécuter sur une instance EXISTANTE (après MIGRATION_COMPLETE_SECURISEE.sql)
-- Priorités : P1 (profiles), P2 (missions), P3 (storage), P4 (trigger anti-promotion)
-- Date : 2026-03-06
-- ============================================================

-- ============================================================
-- ÉTAPE 0a : Trigger handle_new_user
-- Crée automatiquement le profil lors de l'inscription
-- (exécuté par postgres = BYPASSRLS, évite le problème de session)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            split_part(NEW.email, '@', 1)
        ),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'voyageur')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
    'Crée automatiquement un profil public quand un utilisateur s''inscrit. '
    'Lit full_name et role depuis raw_user_meta_data (passés lors du signUp). '
    'ON CONFLICT DO NOTHING pour être idempotent.';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ÉTAPE 0b : Fonction helper SECURITY DEFINER
-- Évite la récursion RLS lors de l'accès à la table profiles
-- ============================================================

CREATE OR REPLACE FUNCTION public.auth_is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(
        (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()),
        false
    );
$$;

COMMENT ON FUNCTION public.auth_is_super_admin() IS
    'Vérifie si l''utilisateur courant est super admin. SECURITY DEFINER pour éviter la récursion RLS.';

-- ============================================================
-- ÉTAPE 1 : PROFILES — Supprimer les politiques trop permissives
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anonymous users can view public profile info" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;

-- ============================================================
-- ÉTAPE 1b : PROFILES — Politiques restreintes
-- ============================================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;

-- Chaque utilisateur ne voit que son propre profil
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Super admins voient tous les profils (sans récursion grâce à SECURITY DEFINER)
CREATE POLICY "Super admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.auth_is_super_admin());

-- Super admins peuvent modifier n'importe quel profil
CREATE POLICY "Super admins can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.auth_is_super_admin())
WITH CHECK (true);

-- ============================================================
-- ÉTAPE 1c : VUE public_profiles — SECURITY DEFINER via propriétaire
-- Expose les données publiques aux anonymes sans accès direct à profiles
-- ============================================================

DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
SELECT
    id,
    full_name,
    avatar_url,
    role,
    user_type,
    created_at,
    updated_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

COMMENT ON VIEW public.public_profiles IS
    'Vue publique des profils (sans email ni is_super_admin). '
    'Tourne avec les droits du propriétaire (postgres = BYPASSRLS).';

-- ============================================================
-- ÉTAPE 2 : MISSIONS — Supprimer la politique trop permissive
-- ============================================================

DROP POLICY IF EXISTS "Missions are viewable by everyone" ON public.missions;

-- ============================================================
-- ÉTAPE 2b : MISSIONS — Politiques restreintes
-- ============================================================

DROP POLICY IF EXISTS "Public can view visible missions" ON public.missions;
DROP POLICY IF EXISTS "Authenticated can view visible or own missions" ON public.missions;

-- Anonymes : uniquement les missions visibles (modérées)
CREATE POLICY "Public can view visible missions"
ON public.missions FOR SELECT
TO anon
USING (visible = true);

-- Authentifiés : missions visibles + les leurs propres + tout si super admin
CREATE POLICY "Authenticated can view visible or own missions"
ON public.missions FOR SELECT
TO authenticated
USING (
    visible = true
    OR created_by = auth.uid()
    OR public.auth_is_super_admin()
);

-- ============================================================
-- ÉTAPE 2c : STORAGE — Supprimer les politiques trop permissives
-- ============================================================

DROP POLICY IF EXISTS "Mission images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload mission images" ON storage.objects;
DROP POLICY IF EXISTS "Mission creators can update their mission images" ON storage.objects;
DROP POLICY IF EXISTS "Mission creators can delete their mission images" ON storage.objects;

DROP POLICY IF EXISTS "Mission media are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload mission media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their mission media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their mission media" ON storage.objects;

-- ============================================================
-- ÉTAPE 2d : STORAGE — Politiques restreintes
-- ============================================================

CREATE POLICY "Mission images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'missions');

CREATE POLICY "Authenticated users can upload mission images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'missions'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Mission creators can update their mission images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'missions'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'missions'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Mission creators can delete their mission images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'missions'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Mission media are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'mission-media');

CREATE POLICY "Authenticated users can upload mission media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'mission-media'
    AND EXISTS (
        SELECT 1
        FROM public.missions
        WHERE missions.id::text = (storage.foldername(name))[1]
        AND (
            missions.created_by = auth.uid()
            OR public.auth_is_super_admin()
        )
    )
);

CREATE POLICY "Users can update their mission media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'mission-media'
    AND EXISTS (
        SELECT 1
        FROM public.missions
        WHERE missions.id::text = (storage.foldername(name))[1]
        AND (
            missions.created_by = auth.uid()
            OR public.auth_is_super_admin()
        )
    )
)
WITH CHECK (
    bucket_id = 'mission-media'
    AND EXISTS (
        SELECT 1
        FROM public.missions
        WHERE missions.id::text = (storage.foldername(name))[1]
        AND (
            missions.created_by = auth.uid()
            OR public.auth_is_super_admin()
        )
    )
);

CREATE POLICY "Users can delete their mission media"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'mission-media'
    AND EXISTS (
        SELECT 1
        FROM public.missions
        WHERE missions.id::text = (storage.foldername(name))[1]
        AND (
            missions.created_by = auth.uid()
            OR public.auth_is_super_admin()
        )
    )
);

-- ============================================================
-- ÉTAPE 3 : TRIGGER — Bloquer l'auto-promotion is_super_admin
-- ============================================================

CREATE OR REPLACE FUNCTION public.prevent_super_admin_self_promotion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Bloquer toute modification de is_super_admin par un non-super-admin
    -- Exception : les rôles postgres et service_role peuvent toujours modifier ce champ
    --             (administration directe via SQL Editor ou service_role key)
    IF NEW.is_super_admin IS DISTINCT FROM OLD.is_super_admin THEN
        IF current_role NOT IN ('postgres', 'service_role')
           AND NOT public.auth_is_super_admin() THEN
            RAISE EXCEPTION 'Permission refusée : modification de is_super_admin non autorisée.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.prevent_super_admin_self_promotion() IS
    'Trigger qui empêche tout utilisateur non-admin de modifier le champ is_super_admin.';

DROP TRIGGER IF EXISTS trg_prevent_super_admin_promotion ON public.profiles;

CREATE TRIGGER trg_prevent_super_admin_promotion
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_super_admin_self_promotion();

-- ============================================================
-- VÉRIFICATION
-- ============================================================
DO $$
DECLARE
    fn_exists       BOOLEAN;
    trigger_exists  BOOLEAN;
    view_exists     BOOLEAN;
    own_policy      BOOLEAN;
    anon_mission    BOOLEAN;
    auth_mission    BOOLEAN;
    mission_img_policy BOOLEAN;
    mission_media_policy BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM pg_proc
        WHERE proname = 'auth_is_super_admin'
        AND pronamespace = 'public'::regnamespace) INTO fn_exists;

    SELECT EXISTS(SELECT 1 FROM pg_trigger
        WHERE tgname = 'trg_prevent_super_admin_promotion') INTO trigger_exists;

    SELECT EXISTS(SELECT 1 FROM pg_views
        WHERE viewname = 'public_profiles' AND schemaname = 'public') INTO view_exists;

    SELECT EXISTS(SELECT 1 FROM pg_policies
        WHERE tablename = 'profiles'
        AND policyname = 'Users can view own profile') INTO own_policy;

    SELECT EXISTS(SELECT 1 FROM pg_policies
        WHERE tablename = 'missions'
        AND policyname = 'Public can view visible missions') INTO anon_mission;

    SELECT EXISTS(SELECT 1 FROM pg_policies
        WHERE tablename = 'missions'
        AND policyname = 'Authenticated can view visible or own missions') INTO auth_mission;

    SELECT EXISTS(SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'Authenticated users can upload mission images') INTO mission_img_policy;

    SELECT EXISTS(SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'Authenticated users can upload mission media') INTO mission_media_policy;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'SECURITY HARDENING — VÉRIFICATION';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'auth_is_super_admin()                   : %', CASE WHEN fn_exists     THEN '✅ OK' ELSE '❌ MANQUANT' END;
    RAISE NOTICE 'Trigger anti-promotion                  : %', CASE WHEN trigger_exists THEN '✅ OK' ELSE '❌ MANQUANT' END;
    RAISE NOTICE 'Vue public_profiles (SECURITY DEFINER)  : %', CASE WHEN view_exists   THEN '✅ OK' ELSE '❌ MANQUANT' END;
    RAISE NOTICE 'Policy "Users can view own profile"     : %', CASE WHEN own_policy    THEN '✅ OK' ELSE '❌ MANQUANT' END;
    RAISE NOTICE 'Policy missions anon (visible=true)     : %', CASE WHEN anon_mission  THEN '✅ OK' ELSE '❌ MANQUANT' END;
    RAISE NOTICE 'Policy missions auth (visible+own+admin): %', CASE WHEN auth_mission  THEN '✅ OK' ELSE '❌ MANQUANT' END;
    RAISE NOTICE 'Storage mission images owner-scoped     : %', CASE WHEN mission_img_policy THEN '✅ OK' ELSE '❌ MANQUANT' END;
    RAISE NOTICE 'Storage mission-media mission-scoped    : %', CASE WHEN mission_media_policy THEN '✅ OK' ELSE '❌ MANQUANT' END;
    RAISE NOTICE '========================================';

    IF fn_exists AND trigger_exists AND view_exists AND own_policy AND anon_mission AND auth_mission AND mission_img_policy AND mission_media_policy THEN
        RAISE NOTICE '✅ SECURITY HARDENING APPLIQUÉ AVEC SUCCÈS';
    ELSE
        RAISE NOTICE '⚠️ Des éléments sont manquants — vérifiez les erreurs ci-dessus';
    END IF;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'PROCHAINE ÉTAPE : Déployer l''Edge Function notify-new-mission';
    RAISE NOTICE '========================================';
END $$;

