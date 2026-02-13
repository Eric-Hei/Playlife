# 🚀 Guide d'Installation - Nouvelle Instance Supabase

## 📋 Prérequis

- Un compte Supabase
- Accès au SQL Editor de Supabase
- Les fichiers du projet Playlife

---

## 🔧 Étape 1 : Créer un nouveau projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez les informations suivantes :
   - **Project URL** : `https://votre-projet.supabase.co`
   - **Anon Key** : La clé publique (anon/public)
   - ⚠️ **NE PAS utiliser** la `service_role` key dans le frontend !

---

## 🗄️ Étape 2 : Exécuter le script de migration complet

1. **Ouvrez Supabase** → SQL Editor
2. **Copiez-collez** le contenu du fichier `supabase/MIGRATION_COMPLETE_SECURISEE.sql`
3. **Exécutez** le script

### Ce que fait le script :

✅ Crée 4 tables :
- `profiles` (avec is_super_admin, user_type)
- `missions` (avec fundraising_url)
- `structures` (avec status, contact_name, origin_info)
- `mission_media` (pour photos/vidéos)

✅ Crée les politiques RLS sécurisées :
- **MISSIONS** : 6 politiques (utilisateurs = leurs missions uniquement)
- **PROFILES** : 5 politiques (protection email et is_super_admin)
- **STRUCTURES** : 6 politiques (validation par super admin)
- **MISSION_MEDIA** : 3 politiques

✅ Crée la vue `public_profiles` (sans données sensibles)

✅ Crée 3 buckets Storage :
- `avatars` (photos de profil)
- `missions` (images de missions)
- `mission-media` (photos/vidéos de missions terminées)

✅ Crée les politiques Storage pour chaque bucket

### Résultat attendu :

```
========================================
MIGRATION PLAYLIFE - RÉSULTAT
========================================
MISSIONS : 6 politiques (attendu: 6)
PROFILES : 5 politiques (attendu: 5)
STRUCTURES : 6 politiques (attendu: 6)
VUE public_profiles : 1 (attendu: 1)
========================================
🎉 SUCCÈS ! Toutes les tables et politiques sont créées.

PROCHAINES ÉTAPES :
1. Créer un utilisateur super admin avec set_super_admin.sql
2. Configurer les variables d'environnement (.env)
3. Tester l'application
========================================
```

---

## 👤 Étape 3 : Créer un utilisateur super admin

### 3.1 Créer un compte utilisateur

1. Dans votre application Playlife, **inscrivez-vous** avec un email
2. Notez l'email utilisé (ex: `votre-email@example.com`)

### 3.2 Promouvoir en super admin

1. **Ouvrez** le fichier `supabase/set_super_admin.sql`
2. **Remplacez** `michael.scott@dundermifflin.com` par votre email
3. **Copiez-collez** le script dans Supabase SQL Editor
4. **Exécutez** le script

### Vérification :

Vous devriez voir dans les résultats :
```
id: <votre-uuid>
email: votre-email@example.com
full_name: Votre Nom
is_super_admin: true
```

---

## 🔐 Étape 4 : Configurer les variables d'environnement

### 4.1 Créer le fichier `.env`

Dans le dossier racine du projet, créez un fichier `.env` :

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon-publique-ici
```

### 4.2 Récupérer les valeurs

1. Dans Supabase, allez dans **Settings** → **API**
2. Copiez :
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

⚠️ **IMPORTANT** : N'utilisez JAMAIS la `service_role` key dans le frontend !

---

## ✅ Étape 5 : Tester l'application

### 5.1 Installer les dépendances

```powershell
npm install
```

### 5.2 Lancer le serveur de développement

```powershell
npm run dev
```

### 5.3 Tester les fonctionnalités

1. **Connexion** : Connectez-vous avec votre compte super admin
2. **Dashboard** : Vérifiez que vous voyez vos missions
3. **Paramètres** : Vérifiez que vous avez accès à la page Paramètres (super admin)
4. **Créer une mission** : Testez la création d'une mission
5. **Créer une structure** : Testez la création d'une structure

---

## 🛡️ Étape 6 : Vérifier la sécurité

### 6.1 Exécuter le script de vérification

1. **Ouvrez** Supabase → SQL Editor
2. **Copiez-collez** le contenu de `supabase/verification_securite.sql`
3. **Exécutez** le script

### Résultat attendu :

```
✅ MISSIONS : 6 politiques (OK)
✅ PROFILES : 5 politiques (OK)
✅ VUE public_profiles : Créée (OK)
🎉 TOUT EST BON ! La sécurité est correctement configurée.
```

### 6.2 Vérifier les alertes de sécurité

1. Dans Supabase, allez dans **Database** → **Advisors**
2. Vérifiez qu'il n'y a **aucune alerte** de type `security_definer_view`

---

## 📦 Étape 7 : Déployer en production

### 7.1 Builder l'application

```powershell
npm run build
```

### 7.2 Déployer sur Netlify

```powershell
netlify deploy --prod --dir=dist --site=playlife
```

---

## 📝 Checklist finale

- [ ] Projet Supabase créé
- [ ] Script `MIGRATION_COMPLETE_SECURISEE.sql` exécuté
- [ ] 6 politiques sur `missions`
- [ ] 5 politiques sur `profiles`
- [ ] Vue `public_profiles` créée
- [ ] 3 buckets Storage créés
- [ ] Utilisateur super admin créé
- [ ] Fichier `.env` configuré
- [ ] Application testée en local
- [ ] Aucune alerte de sécurité
- [ ] Application déployée en production

---

## 🆘 En cas de problème

### Problème : Trop de politiques

**Solution** : Exécutez `supabase/force_cleanup_security.sql` pour nettoyer et recréer les politiques.

### Problème : Alerte `security_definer_view`

**Solution** : Exécutez `supabase/fix_security_definer_view.sql`.

### Problème : Impossible de se connecter

**Vérifications** :
1. Le fichier `.env` est bien à la racine du projet
2. Les valeurs `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont correctes
3. L'utilisateur existe dans Supabase Auth

---

## 📚 Fichiers importants

- `MIGRATION_COMPLETE_SECURISEE.sql` : Script de migration complet
- `set_super_admin.sql` : Promouvoir un utilisateur en super admin
- `verification_securite.sql` : Vérifier que tout est correct
- `SECURITE_GUIDE.md` : Guide de sécurité détaillé
- `.env.example` : Template pour les variables d'environnement

---

**Bonne installation ! 🚀**

