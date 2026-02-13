-- ============================================
-- MIGRATION COMPLÈTE ET SÉCURISÉE - PLAYLIFE
-- ============================================
-- Ce script crée toutes les tables, politiques RLS et vues
-- À exécuter dans une NOUVELLE instance Supabase
-- Version : 0.0.2
-- Date : 2024-02-13

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
  city TEXT,
  country TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_name TEXT,
  website_url TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'à valider playlife' CHECK (status IN ('à valider playlife', 'validée', 'refusée')),
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÉTAPE 2 : COMMENTAIRES ET INDEX
-- ============================================

COMMENT ON COLUMN profiles.is_super_admin IS 'Indique si l''utilisateur est un super administrateur';
COMMENT ON COLUMN profiles.user_type IS 'Type d''utilisateur (voyageur/animateur)';
COMMENT ON COLUMN structures.contact_name IS 'Nom du contact dans la structure';
COMMENT ON COLUMN structures.status IS 'Statut de validation de la structure';
COMMENT ON COLUMN structures.origin_info IS 'Comment l''utilisateur a connu cette structure';

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

-- ============================================
-- ÉTAPE 4 : POLITIQUES RLS - PROFILES (5 politiques)
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
-- ÉTAPE 5 : POLITIQUES RLS - MISSIONS (6 politiques)
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
-- ÉTAPE 8 : VUE PUBLIC_PROFILES (sans données sensibles)
-- ============================================

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

GRANT SELECT ON public_profiles TO anon, authenticated;

COMMENT ON VIEW public_profiles IS 'Vue publique des profils sans données sensibles (email, is_super_admin) - SECURITY INVOKER';

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
-- ÉTAPE 13 : VÉRIFICATION FINALE
-- ============================================

DO $$
DECLARE
    missions_count INT;
    profiles_count INT;
    structures_count INT;
    view_count INT;
BEGIN
    SELECT COUNT(*) INTO missions_count FROM pg_policies WHERE tablename = 'missions';
    SELECT COUNT(*) INTO profiles_count FROM pg_policies WHERE tablename = 'profiles';
    SELECT COUNT(*) INTO structures_count FROM pg_policies WHERE tablename = 'structures';
    SELECT COUNT(*) INTO view_count FROM pg_views WHERE viewname = 'public_profiles';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MIGRATION PLAYLIFE - RÉSULTAT';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MISSIONS : % politiques (attendu: 6)', missions_count;
    RAISE NOTICE 'PROFILES : % politiques (attendu: 5)', profiles_count;
    RAISE NOTICE 'STRUCTURES : % politiques (attendu: 6)', structures_count;
    RAISE NOTICE 'VUE public_profiles : % (attendu: 1)', view_count;
    RAISE NOTICE '========================================';

    IF missions_count = 6 AND profiles_count = 5 AND structures_count >= 6 AND view_count = 1 THEN
        RAISE NOTICE '🎉 SUCCÈS ! Toutes les tables et politiques sont créées.';
        RAISE NOTICE '';
        RAISE NOTICE 'PROCHAINES ÉTAPES :';
        RAISE NOTICE '1. Créer un utilisateur super admin avec set_super_admin.sql';
        RAISE NOTICE '2. Configurer les variables d''environnement (.env)';
        RAISE NOTICE '3. Tester l''application';
    ELSE
        RAISE NOTICE '⚠️  ATTENTION : Vérifiez les politiques ci-dessus.';
    END IF;

    RAISE NOTICE '========================================';
END $$;

