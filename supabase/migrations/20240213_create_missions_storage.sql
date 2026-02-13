-- Créer le bucket de stockage pour les images de missions
INSERT INTO storage.buckets (id, name, public)
VALUES ('missions', 'missions', true)
ON CONFLICT (id) DO NOTHING;

-- Politique pour permettre aux utilisateurs authentifiés d'uploader des images
CREATE POLICY "Authenticated users can upload mission images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'missions');

-- Politique pour permettre à tout le monde de voir les images
CREATE POLICY "Anyone can view mission images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'missions');

-- Politique pour permettre aux utilisateurs de supprimer leurs propres images
CREATE POLICY "Users can delete their own mission images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'missions' AND auth.uid()::text = (storage.foldername(name))[1]);

