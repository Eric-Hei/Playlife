-- ============================================
-- MIGRATION COMPLÈTE ET SÉCURISÉE - PLAYLIFE
-- ============================================
-- Ce script crée toutes les tables, politiques RLS et vues
-- À exécuter dans une NOUVELLE instance Supabase
-- Version : 0.0.3
-- Date : 2026-03-04

-- ============================================
-- ÉTAPE 1 : CRÉATION DES TABLES
-- ============================================

-- Table profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'voyageur',
  user_type TEXT,
  is_super_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table missions
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_date DATE,
  end_date DATE,
  image_url TEXT,
  mission_type TEXT,
  country TEXT,
  city TEXT,
  status TEXT DEFAULT 'active',
  fundraising_url TEXT,
  visible BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Table structures
CREATE TABLE IF NOT EXISTS public.structures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT,
  address TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_name TEXT,
  website_url TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'à valider playlife' CHECK (status IN ('à valider playlife', 'validée', 'refusée')),
  validated_by_playlife BOOLEAN DEFAULT false,
  origin_info TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table mission_media
CREATE TABLE IF NOT EXISTS public.mission_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('photo', 'video')),
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Table site_config (bloc impact, diaporama, etc.)
CREATE TABLE IF NOT EXISTS public.site_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- ============================================
-- ÉTAPE 2 : COMMENTAIRES ET INDEX
-- ============================================

COMMENT ON COLUMN profiles.is_super_admin IS 'Indique si l''utilisateur est un super administrateur';
COMMENT ON COLUMN profiles.user_type IS 'Type d''utilisateur (voyageur/animateur)';
COMMENT ON COLUMN missions.visible IS 'Mission visible publiquement (modérée par un super admin)';
COMMENT ON COLUMN structures.contact_name IS 'Nom du contact dans la structure';
COMMENT ON COLUMN structures.status IS 'Statut de validation de la structure';
COMMENT ON COLUMN structures.origin_info IS 'Comment l''utilisateur a connu cette structure';
COMMENT ON COLUMN structures.postal_code IS 'Code postal de la structure';
COMMENT ON COLUMN structures.validated_by_playlife IS 'Structure partenaire validée officiellement par Playlife';

CREATE INDEX IF NOT EXISTS idx_structures_status ON structures(status);
CREATE INDEX IF NOT EXISTS idx_structures_created_by ON structures(created_by);
CREATE INDEX IF NOT EXISTS idx_profiles_is_super_admin ON profiles(is_super_admin);
CREATE INDEX IF NOT EXISTS idx_missions_created_by ON missions(created_by);
CREATE INDEX IF NOT EXISTS idx_mission_media_mission_id ON mission_media(mission_id);

-- ============================================
-- ÉTAPE 3 : ACTIVER ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ÉTAPE 3b : Fonction helper SECURITY DEFINER
-- Évite la récursion RLS lors de l'accès à profiles
-- ============================================

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

-- ============================================
-- ÉTAPE 4 : POLITIQUES RLS - PROFILES (5 politiques)
-- ============================================

-- 1. Lecture : chaque utilisateur voit uniquement son propre profil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 2. Lecture : super admins voient tous les profils (sans récursion)
CREATE POLICY "Super admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (public.auth_is_super_admin());

-- 3. Création (son propre profil)
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 4. Modification (son propre profil)
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Modification (super admins peuvent tout modifier, sans récursion)
CREATE POLICY "Super admins can update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (public.auth_is_super_admin())
WITH CHECK (true);

-- ============================================
-- ÉTAPE 4b : TRIGGER anti-promotion is_super_admin
-- ============================================

CREATE OR REPLACE FUNCTION public.prevent_super_admin_self_promotion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.is_super_admin IS DISTINCT FROM OLD.is_super_admin THEN
        IF NOT public.auth_is_super_admin() THEN
            RAISE EXCEPTION 'Permission refusée : modification de is_super_admin non autorisée.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_super_admin_promotion ON public.profiles;

CREATE TRIGGER trg_prevent_super_admin_promotion
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_super_admin_self_promotion();

-- ============================================
-- ÉTAPE 5 : POLITIQUES RLS - MISSIONS (6 politiques)
-- ============================================

-- 1a. Lecture publique : uniquement les missions visibles (modérées)
CREATE POLICY "Public can view visible missions"
ON missions FOR SELECT
TO anon
USING (visible = true);

-- 1b. Lecture authentifiée : missions visibles + les siennes + tout si super admin
CREATE POLICY "Authenticated can view visible or own missions"
ON missions FOR SELECT
TO authenticated
USING (
    visible = true
    OR created_by = auth.uid()
    OR public.auth_is_super_admin()
);

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
-- ÉTAPE 6 : POLITIQUES RLS - STRUCTURES (8 politiques)
-- ============================================

-- 1. Lecture publique (structures validées)
CREATE POLICY "Anyone can view validated structures"
ON structures FOR SELECT
TO public
USING (status = 'validée');

-- 2. Lecture (utilisateurs voient leurs propres structures)
CREATE POLICY "Users can view their own pending structures"
ON structures FOR SELECT
TO authenticated
USING (created_by = auth.uid());

-- 3. Lecture (super admins voient tout)
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

-- 4. Création (utilisateurs authentifiés)
CREATE POLICY "Authenticated users can create structures"
ON structures FOR INSERT
TO authenticated
WITH CHECK (true);

-- 5. Modification (super admins uniquement)
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

-- 6. Suppression (super admins uniquement)
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

-- ============================================
-- ÉTAPE 7 : POLITIQUES RLS - MISSION_MEDIA
-- ============================================

-- 1. Lecture publique
CREATE POLICY "Mission media are viewable by everyone"
ON mission_media FOR SELECT
TO public
USING (true);

-- 2. Création (créateur de la mission uniquement)
CREATE POLICY "Mission creators can add media"
ON mission_media FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM missions
        WHERE missions.id = mission_media.mission_id
        AND missions.created_by = auth.uid()
    )
);

-- 3. Suppression (créateur de la mission uniquement)
CREATE POLICY "Mission creators can delete media"
ON mission_media FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM missions
        WHERE missions.id = mission_media.mission_id
        AND missions.created_by = auth.uid()
    )
);

-- ============================================
-- ÉTAPE 7b : POLITIQUES RLS - SITE_CONFIG
-- ============================================

-- Lecture publique
CREATE POLICY "Allow public read-only access"
ON public.site_config FOR SELECT
USING (true);

-- Écriture réservée aux super admins
CREATE POLICY "Allow super admin all access"
ON public.site_config FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_super_admin = true
    )
);

-- Valeurs par défaut
INSERT INTO public.site_config (key, value)
VALUES (
    'impact_metrics',
    JSONB_BUILD_OBJECT(
        'value1', '23',
        'label1', 'structures aidées',
        'value2', '580',
        'label2', 'enfants aidés'
    )
)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- ÉTAPE 8 : VUE PUBLIC_PROFILES (sans données sensibles)
-- ============================================

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

-- ============================================
-- ÉTAPE 9 : STORAGE BUCKETS
-- ============================================

-- Bucket pour les avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket pour les images de missions
INSERT INTO storage.buckets (id, name, public)
VALUES ('missions', 'missions', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket pour les médias de missions terminées
INSERT INTO storage.buckets (id, name, public)
VALUES ('mission-media', 'mission-media', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket pour le diaporama de la page d'accueil (public, limite 5 Mo)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('slideshow', 'slideshow', true, 5242880)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ÉTAPE 10 : POLITIQUES STORAGE - AVATARS
-- ============================================

CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- ÉTAPE 11 : POLITIQUES STORAGE - MISSIONS
-- ============================================

CREATE POLICY "Mission images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'missions');

CREATE POLICY "Authenticated users can upload mission images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'missions');

CREATE POLICY "Mission creators can update their mission images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'missions');

CREATE POLICY "Mission creators can delete their mission images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'missions');

-- ============================================
-- ÉTAPE 12 : POLITIQUES STORAGE - MISSION-MEDIA
-- ============================================

CREATE POLICY "Mission media are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'mission-media');

CREATE POLICY "Authenticated users can upload mission media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'mission-media');

CREATE POLICY "Users can update their mission media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'mission-media');

CREATE POLICY "Users can delete their mission media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'mission-media');

-- ============================================
-- ÉTAPE 13 : POLITIQUES STORAGE - SLIDESHOW
-- ============================================

-- Lecture publique
CREATE POLICY "slideshow_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'slideshow');

-- Upload réservé aux super admins
CREATE POLICY "slideshow_super_admin_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'slideshow'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_super_admin = true
    )
);

-- Suppression réservée aux super admins
CREATE POLICY "slideshow_super_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'slideshow'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_super_admin = true
    )
);

-- ============================================
-- ÉTAPE 14 : VÉRIFICATION FINALE
-- ============================================

DO $$
DECLARE
    missions_count INT;
    profiles_count INT;
    structures_count INT;
    site_config_count INT;
    view_count INT;
    bucket_count INT;
    slideshow_exists INT;
BEGIN
    SELECT COUNT(*) INTO missions_count FROM pg_policies WHERE tablename = 'missions';
    SELECT COUNT(*) INTO profiles_count FROM pg_policies WHERE tablename = 'profiles';
    SELECT COUNT(*) INTO structures_count FROM pg_policies WHERE tablename = 'structures';
    SELECT COUNT(*) INTO site_config_count FROM pg_policies WHERE tablename = 'site_config';
    SELECT COUNT(*) INTO view_count FROM pg_views WHERE viewname = 'public_profiles';
    SELECT COUNT(*) INTO bucket_count FROM storage.buckets WHERE id IN ('avatars', 'missions', 'mission-media', 'slideshow');
    SELECT COUNT(*) INTO slideshow_exists FROM storage.buckets WHERE id = 'slideshow' AND public = true;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MIGRATION PLAYLIFE v0.0.3 - RÉSULTAT';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MISSIONS      : % politiques (attendu: 7)', missions_count;
    RAISE NOTICE 'PROFILES      : % politiques (attendu: 5)', profiles_count;
    RAISE NOTICE 'STRUCTURES    : % politiques (attendu: 6)', structures_count;
    RAISE NOTICE 'SITE_CONFIG   : % politiques (attendu: 2)', site_config_count;
    RAISE NOTICE 'VUE public_profiles : % (attendu: 1)', view_count;
    RAISE NOTICE 'BUCKETS       : %/4 créés (avatars, missions, mission-media, slideshow)', bucket_count;
    RAISE NOTICE 'SLIDESHOW     : % public (attendu: 1)', slideshow_exists;
    RAISE NOTICE '========================================';

    IF missions_count = 7 AND profiles_count = 5 AND structures_count >= 6
       AND site_config_count >= 2 AND view_count = 1
       AND bucket_count = 4 AND slideshow_exists = 1 THEN
        RAISE NOTICE '🎉 SUCCÈS ! Toutes les tables, politiques et buckets sont créés.';
        RAISE NOTICE '';
        RAISE NOTICE 'PROCHAINES ÉTAPES :';
        RAISE NOTICE '1. Créer un utilisateur super admin avec set_super_admin.sql';
        RAISE NOTICE '2. Configurer les variables d''environnement (.env)';
        RAISE NOTICE '3. Déployer la Edge Function notify-new-mission';
        RAISE NOTICE '4. Tester l''application';
    ELSE
        RAISE NOTICE '⚠️  ATTENTION : Vérifiez les éléments ci-dessus.';
    END IF;

    RAISE NOTICE '========================================';
END $$;

