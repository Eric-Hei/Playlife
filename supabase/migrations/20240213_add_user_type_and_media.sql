-- Ajouter le champ user_type à la table profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_type TEXT CHECK (user_type IN ('voyageur', 'animateur'));

-- Ajouter un commentaire pour documenter le champ
COMMENT ON COLUMN profiles.user_type IS 'Type d''utilisateur: voyageur ou animateur/enseignant';

-- Créer une table pour stocker les médias (photos/vidéos) des missions terminées
CREATE TABLE IF NOT EXISTS mission_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_mission_media_mission_id ON mission_media(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_media_created_by ON mission_media(created_by);

-- Ajouter les politiques RLS pour mission_media
ALTER TABLE mission_media ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre à tout le monde de voir les médias
CREATE POLICY "Anyone can view mission media"
ON mission_media FOR SELECT
TO public
USING (true);

-- Politique pour permettre aux utilisateurs authentifiés d'ajouter des médias à leurs missions
CREATE POLICY "Users can add media to their missions"
ON mission_media FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM missions
        WHERE missions.id = mission_media.mission_id
        AND missions.created_by = auth.uid()
    )
);

-- Politique pour permettre aux utilisateurs de supprimer leurs propres médias
CREATE POLICY "Users can delete their own mission media"
ON mission_media FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- Créer le bucket de stockage pour les avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Politique pour permettre aux utilisateurs authentifiés d'uploader leur avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Politique pour permettre à tout le monde de voir les avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Politique pour permettre aux utilisateurs de mettre à jour leur avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Politique pour permettre aux utilisateurs de supprimer leur avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Créer le bucket de stockage pour les médias de missions
INSERT INTO storage.buckets (id, name, public)
VALUES ('mission-media', 'mission-media', true)
ON CONFLICT (id) DO NOTHING;

-- Politique pour permettre aux utilisateurs authentifiés d'uploader des médias de mission
CREATE POLICY "Users can upload mission media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'mission-media');

-- Politique pour permettre à tout le monde de voir les médias de mission
CREATE POLICY "Anyone can view mission media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'mission-media');

-- Politique pour permettre aux utilisateurs de supprimer leurs propres médias de mission
CREATE POLICY "Users can delete their own mission media files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'mission-media' AND auth.uid()::text = (storage.foldername(name))[1]);

