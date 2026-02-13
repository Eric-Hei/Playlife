# 🚀 Déploiement sur une Nouvelle Instance Supabase

Guide rapide pour déployer Playlife sur une nouvelle instance Supabase.

---

## ⚡ Démarrage rapide (5 étapes)

### 1️⃣ Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez l'URL et la clé ANON

### 2️⃣ Exécuter le script de migration

1. Ouvrez Supabase → **SQL Editor**
2. Copiez-collez le contenu de **`supabase/MIGRATION_COMPLETE_SECURISEE.sql`**
3. Exécutez le script
4. Vérifiez le message de succès ✅

### 3️⃣ Créer un super admin

1. Inscrivez-vous dans l'application avec votre email
2. Ouvrez **`supabase/set_super_admin.sql`**
3. Remplacez `michael.scott@dundermifflin.com` par votre email
4. Exécutez le script dans Supabase SQL Editor

### 4️⃣ Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon-publique-ici
```

### 5️⃣ Tester l'application

```powershell
npm install
npm run dev
```

---

## 📋 Vérification complète

### Exécuter le script de vérification

1. Ouvrez Supabase → **SQL Editor**
2. Copiez-collez le contenu de **`supabase/verification_securite.sql`**
3. Exécutez le script

### Résultat attendu :

```
✅ MISSIONS : 6 politiques (OK)
✅ PROFILES : 5 politiques (OK)
✅ VUE public_profiles : Créée (OK)
🎉 TOUT EST BON ! La sécurité est correctement configurée.
```

---

## 📚 Documentation complète

Pour plus de détails, consultez :

- **`supabase/GUIDE_INSTALLATION_NOUVELLE_INSTANCE.md`** - Guide complet étape par étape
- **`supabase/SECURITE_GUIDE.md`** - Guide de sécurité détaillé
- **`supabase/README.md`** - Index de tous les scripts SQL

---

## 🛡️ Sécurité

Le script `MIGRATION_COMPLETE_SECURISEE.sql` crée :

✅ **6 politiques RLS** sur la table `missions`
- Les utilisateurs ne peuvent modifier que leurs propres missions
- Les super admins peuvent tout modifier

✅ **5 politiques RLS** sur la table `profiles`
- Protection de l'email et du flag `is_super_admin`
- Les utilisateurs ne peuvent pas s'auto-promouvoir

✅ **Vue `public_profiles`** sans données sensibles
- Pas d'email ni de `is_super_admin` exposés

✅ **Buckets Storage** avec politiques RLS
- `avatars`, `missions`, `mission-media`

---

## 🚀 Déploiement en production

### Builder l'application

```powershell
npm run build
```

### Déployer sur Netlify

```powershell
netlify deploy --prod --dir=dist --site=playlife
```

---

## ✅ Checklist finale

- [ ] Projet Supabase créé
- [ ] Script `MIGRATION_COMPLETE_SECURISEE.sql` exécuté
- [ ] Super admin créé
- [ ] Fichier `.env` configuré
- [ ] Application testée en local
- [ ] Script `verification_securite.sql` exécuté avec succès
- [ ] Aucune alerte de sécurité dans Supabase
- [ ] Application déployée en production

---

**Version** : 0.0.2  
**Prêt pour la production** ✅

