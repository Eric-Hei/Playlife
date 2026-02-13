-- Script pour définir un utilisateur comme super admin
-- Remplacez l'email par celui de votre compte

-- Étape 1 : Trouver votre ID utilisateur
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'michael.scott@dundermifflin.com';

-- Étape 2 : Mettre à jour le profil pour devenir super admin
-- Copiez l'ID de l'étape 1 et remplacez 'VOTRE_ID_ICI' par cet ID
UPDATE profiles 
SET is_super_admin = true 
WHERE id = (
    SELECT id 
    FROM auth.users 
    WHERE email = 'michael.scott@dundermifflin.com'
);

-- Étape 3 : Vérifier que ça a fonctionné
SELECT p.id, p.email, p.full_name, p.is_super_admin
FROM profiles p
WHERE p.email = 'michael.scott@dundermifflin.com';

