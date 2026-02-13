# 📁 Dossier Supabase - Playlife

Ce dossier contient tous les scripts SQL et guides pour configurer votre instance Supabase.

---

## 🚀 Pour une NOUVELLE instance Supabase

### Fichiers à utiliser (dans l'ordre) :

1. **`MIGRATION_COMPLETE_SECURISEE.sql`** ⭐
   - Script complet et sécurisé
   - Crée toutes les tables, politiques RLS, vues et buckets Storage
   - **À exécuter en premier** dans une nouvelle instance

2. **`set_super_admin.sql`**
   - Promouvoir un utilisateur en super admin
   - Remplacez `michael.scott@dundermifflin.com` par votre email

3. **`verification_securite.sql`**
   - Vérifier que tout est correctement configuré
   - Affiche le nombre de politiques par table

4. **`GUIDE_INSTALLATION_NOUVELLE_INSTANCE.md`** 📖
   - Guide complet étape par étape
   - Checklist de déploiement

---

## 🔧 Pour une instance EXISTANTE (correction de sécurité)

### Si vous avez des problèmes de sécurité :

1. **`force_cleanup_security.sql`**
   - Nettoie et recrée toutes les politiques RLS
   - Supprime dynamiquement toutes les anciennes politiques

2. **`fix_security_definer_view.sql`**
   - Corrige l'alerte `security_definer_view` sur `public_profiles`

3. **`verification_securite.sql`**
   - Vérifier que tout est correct après les corrections

---

## 📚 Fichiers de référence

### Guides et documentation

- **`SECURITE_GUIDE.md`** 📖
  - Guide complet de sécurité
  - Exemples de code
  - Cas d'usage
  - Tableau récapitulatif des permissions

- **`GUIDE_INSTALLATION_NOUVELLE_INSTANCE.md`** 📖
  - Installation complète d'une nouvelle instance
  - Checklist de déploiement

### Scripts de dépannage (optionnels)

- **`force_cleanup_security.sql`** 🔧
  - Nettoyage dynamique de toutes les politiques
  - Utile si vous avez des politiques en double

- **`fix_security_definer_view.sql`** 🔧
  - Correction de l'alerte `security_definer_view`
  - Recrée la vue `public_profiles` avec `security_invoker`

---

## 🛡️ Résumé de la sécurité

### Tables et politiques RLS

| Table | Politiques | Description |
|-------|-----------|-------------|
| **missions** | 6 | Utilisateurs = leurs missions uniquement |
| **profiles** | 5 | Protection email et is_super_admin |
| **structures** | 6 | Validation par super admin |
| **mission_media** | 3 | Créateur de mission uniquement |

### Vue publique

- **`public_profiles`** : Vue sans données sensibles (email, is_super_admin)

### Buckets Storage

- **`avatars`** : Photos de profil
- **`missions`** : Images de missions
- **`mission-media`** : Photos/vidéos de missions terminées

---

## ✅ Checklist de vérification

Après avoir exécuté les scripts, vérifiez :

- [ ] **MISSIONS** : 6 politiques
  - Missions are viewable by everyone
  - Authenticated users can create missions
  - Users can update their own missions
  - Users can delete their own missions
  - Super admins can update all missions
  - Super admins can delete all missions

- [ ] **PROFILES** : 5 politiques
  - Authenticated users can view all profiles
  - Anonymous users can view public profile info
  - Users can insert their own profile
  - Users can update their own profile
  - Super admins can update all profiles

- [ ] **STRUCTURES** : 6 politiques minimum

- [ ] **VUE public_profiles** : Créée avec `security_invoker = true`

- [ ] **BUCKETS Storage** : 3 buckets créés (avatars, missions, mission-media)

- [ ] **Aucune alerte** de sécurité dans Supabase Database Advisors

---

## 🆘 Aide et dépannage

### Problème : Trop de politiques

**Symptôme** : Vous avez plus de 6 politiques sur missions ou plus de 5 sur profiles

**Solution** :
```sql
-- Exécutez force_cleanup_security.sql
```

### Problème : Alerte security_definer_view

**Symptôme** : Alerte dans Database Advisors sur `public_profiles`

**Solution** :
```sql
-- Exécutez fix_security_definer_view.sql
```

### Problème : Impossible de modifier une mission

**Symptôme** : Erreur "permission denied" lors de la modification

**Vérification** :
1. Vérifiez que vous êtes le créateur de la mission
2. Vérifiez que la politique "Users can update their own missions" existe
3. Vérifiez que `created_by` correspond à votre `auth.uid()`

---

## 📞 Contact

Pour toute question sur la configuration Supabase, consultez :
- `SECURITE_GUIDE.md` - Guide de sécurité complet
- `GUIDE_INSTALLATION_NOUVELLE_INSTANCE.md` - Guide d'installation

---

**Version** : 0.0.2  
**Dernière mise à jour** : 2024-02-13

