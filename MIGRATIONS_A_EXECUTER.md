# Migrations à exécuter sur Supabase

## Nouvelles fonctionnalités ajoutées

### Formulaire de création de mission :
1. ✅ Remplacement de "Animateur / Éducateur" par "Animateur / Enseignant"
2. ✅ Ajout de "estimées" pour les labels des dates
3. ✅ Ajout d'un champ pour le lien de cagnotte avec message explicatif
4. ✅ Remplacement du champ URL par un bouton parcourir pour l'image (limite 5Mo)
5. ✅ Validation des dates obligatoires
6. ✅ Affichage de toutes les infos dans les blocs de mission (type, cagnotte)
7. ✅ Bloc de conseils pour récolter des dons en bas de page

### Tableau de bord utilisateur :
8. ✅ Upload d'avatar avec bouton parcourir (5Mo max)
9. ✅ Sélecteur de type d'utilisateur (voyageur / animateur-enseignant)
10. ✅ Affichage du type d'utilisateur avec badge
11. ✅ Bloc de stats "Missions terminées"
12. ✅ Calcul des "Enfants aidés" : nb missions terminées × 20
13. ✅ Grille de stats passée de 3 à 4 colonnes

## Migrations SQL à exécuter

Pour que ces fonctionnalités fonctionnent, vous devez exécuter les migrations SQL suivantes dans votre base de données Supabase :

### 1. Ajouter le champ fundraising_url

Fichier : `supabase/migrations/20240213_add_fundraising_url.sql`

```sql
-- Ajouter le champ fundraising_url à la table missions
ALTER TABLE missions ADD COLUMN IF NOT EXISTS fundraising_url TEXT;

-- Ajouter un commentaire pour documenter le champ
COMMENT ON COLUMN missions.fundraising_url IS 'URL de la cagnotte de financement (ex: leetchi.com)';
```

### 2. Créer le bucket de stockage pour les images

Fichier : `supabase/migrations/20240213_create_missions_storage.sql`

```sql
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
```

### 3. Ajouter user_type et mission_media

Fichier : `supabase/migrations/20240213_add_user_type_and_media.sql`

Cette migration ajoute :
- Le champ `user_type` à la table `profiles` (voyageur/animateur)
- La table `mission_media` pour stocker les photos/vidéos des missions terminées
- Les buckets Storage `avatars` et `mission-media` avec leurs politiques RLS

Voir le fichier complet pour tous les détails.

## Comment exécuter les migrations

### Option 1 : Via l'interface Supabase (recommandé)

1. Connectez-vous à votre projet Supabase
2. Allez dans **SQL Editor**
3. Copiez-collez le contenu de chaque fichier de migration
4. Exécutez les requêtes

### Option 2 : Via Supabase CLI

```powershell
# Appliquer toutes les migrations
supabase db push
```

## Vérification

Après avoir exécuté les migrations, vérifiez que :

1. ✅ La colonne `fundraising_url` existe dans la table `missions`
2. ✅ Le bucket `missions` existe dans Storage
3. ✅ La colonne `user_type` existe dans la table `profiles`
4. ✅ La table `mission_media` existe
5. ✅ Les buckets `avatars` et `mission-media` existent dans Storage
6. ✅ Les politiques de sécurité sont bien configurées

Vous pouvez vérifier avec ces requêtes SQL :

```sql
-- Vérifier la structure de la table missions
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'missions';

-- Vérifier la structure de la table profiles
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles';

-- Vérifier l'existence de la table mission_media
SELECT * FROM information_schema.tables WHERE table_name = 'mission_media';

-- Vérifier l'existence des buckets
SELECT * FROM storage.buckets WHERE id IN ('missions', 'avatars', 'mission-media');
```

## Ordre d'exécution

Exécutez les migrations dans l'ordre suivant :
1. `20240213_add_fundraising_url.sql`
2. `20240213_create_missions_storage.sql`
3. `20240213_add_user_type_and_media.sql`
4. `20240213_add_structure_fields_and_super_admin.sql`

---

### 4. Système de validation des structures et super admin

Fichier : `supabase/migrations/20240213_add_structure_fields_and_super_admin.sql`

Cette migration ajoute :
- Les champs nécessaires pour la validation des structures (`contact_name`, `status`, `origin_info`, `created_by`)
- Le champ `is_super_admin` à la table `profiles`
- Les politiques RLS pour la visibilité des structures selon leur statut
- Les permissions au super admin pour modifier toutes les structures et missions

Voir le fichier complet pour tous les détails.

**Important** : Après avoir exécuté cette migration, créez votre premier super admin avec :

```sql
UPDATE profiles
SET is_super_admin = true
WHERE id = 'YOUR_USER_ID';
```

Vous pouvez trouver votre ID utilisateur dans la table `auth.users` ou dans votre profil.

