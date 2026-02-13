# 🔒 Guide de Sécurité Playlife

## 📋 Scripts à exécuter dans Supabase SQL Editor

### 1. Sécuriser les MISSIONS
**Fichier** : `supabase/fix_missions_security.sql`

**Ce que ça fait** :
- ✅ Les utilisateurs ne peuvent modifier/supprimer que leurs propres missions
- ✅ Les super admins peuvent tout modifier/supprimer
- ✅ Tout le monde peut voir toutes les missions (lecture publique)

### 2. Sécuriser les PROFILES
**Fichier** : `supabase/fix_profiles_security.sql`

**Ce que ça fait** :
- ✅ Crée une vue `public_profiles` sans données sensibles (email, is_super_admin)
- ✅ Les utilisateurs ne peuvent modifier que leur propre profil
- ✅ Les utilisateurs ne peuvent pas s'auto-promouvoir super admin
- ✅ Les super admins peuvent modifier tous les profils

---

## 💻 Modifications à faire dans le code frontend

### ⚠️ IMPORTANT : Utiliser `public_profiles` pour les affichages publics

#### ❌ AVANT (non sécurisé)
```typescript
// N'importe qui peut voir les emails et is_super_admin
const { data } = await supabase
    .from('profiles')
    .select('*');
```

#### ✅ APRÈS (sécurisé)
```typescript
// Pour afficher une liste de profils publics
const { data } = await supabase
    .from('public_profiles')  // ← Utiliser la vue
    .select('*');

// Pour le profil de l'utilisateur connecté (avec email)
const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
```

---

## 🔍 Cas d'usage

### 1. Afficher le profil de l'utilisateur connecté
```typescript
// ✅ OK - L'utilisateur voit son propre profil complet (avec email)
const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', auth.uid())
    .single();
```

### 2. Afficher une liste d'utilisateurs (ex: créateurs de missions)
```typescript
// ✅ OK - Utiliser public_profiles (sans email ni is_super_admin)
const { data: creators } = await supabase
    .from('public_profiles')
    .select('id, full_name, avatar_url, role');
```

### 3. Modifier son propre profil
```typescript
// ✅ OK - L'utilisateur peut modifier son profil
const { error } = await supabase
    .from('profiles')
    .update({ full_name: 'Nouveau Nom', avatar_url: '...' })
    .eq('id', user.id);

// ❌ INTERDIT - L'utilisateur ne peut pas s'auto-promouvoir
const { error } = await supabase
    .from('profiles')
    .update({ is_super_admin: true })  // ← Sera rejeté par RLS
    .eq('id', user.id);
```

### 4. Super admin : modifier un profil
```typescript
// ✅ OK - Super admin peut tout modifier
const { error } = await supabase
    .from('profiles')
    .update({ is_super_admin: true })
    .eq('id', targetUserId);
```

---

## 🛡️ Résumé de la sécurité

### Table MISSIONS
| Action | Utilisateur normal | Super Admin |
|--------|-------------------|-------------|
| Voir toutes les missions | ✅ Oui | ✅ Oui |
| Créer une mission | ✅ Oui (avec son ID) | ✅ Oui |
| Modifier sa mission | ✅ Oui | ✅ Oui |
| Modifier mission d'un autre | ❌ Non | ✅ Oui |
| Supprimer sa mission | ✅ Oui | ✅ Oui |
| Supprimer mission d'un autre | ❌ Non | ✅ Oui |

### Table PROFILES
| Action | Utilisateur normal | Super Admin |
|--------|-------------------|-------------|
| Voir profils publics (via `public_profiles`) | ✅ Oui | ✅ Oui |
| Voir son email | ✅ Oui (son profil) | ✅ Oui (tous) |
| Voir is_super_admin | ❌ Non | ✅ Oui (tous) |
| Modifier son profil | ✅ Oui | ✅ Oui |
| Modifier is_super_admin | ❌ Non | ✅ Oui |
| Modifier profil d'un autre | ❌ Non | ✅ Oui |

### Table STRUCTURES
| Action | Utilisateur normal | Super Admin |
|--------|-------------------|-------------|
| Voir structures validées | ✅ Oui | ✅ Oui |
| Voir ses structures en attente | ✅ Oui | ✅ Oui |
| Voir structures en attente d'autres | ❌ Non | ✅ Oui |
| Créer une structure | ✅ Oui | ✅ Oui |
| Modifier/Supprimer une structure | ❌ Non | ✅ Oui |

---

## ✅ Checklist de déploiement

- [ ] Exécuter `fix_missions_security.sql` dans Supabase SQL Editor
- [ ] Exécuter `fix_profiles_security.sql` dans Supabase SQL Editor
- [ ] Vérifier que les 6 politiques missions sont créées
- [ ] Vérifier que les 5 politiques profiles sont créées
- [ ] Vérifier que la vue `public_profiles` existe
- [ ] Tester : un utilisateur ne peut pas modifier la mission d'un autre
- [ ] Tester : un utilisateur ne peut pas se promouvoir super admin
- [ ] Tester : un super admin peut tout modifier

---

## 🚨 En cas de problème

Si vous voyez une erreur "policy already exists" :
1. Vérifiez les politiques existantes avec :
   ```sql
   SELECT policyname FROM pg_policies WHERE tablename = 'missions';
   SELECT policyname FROM pg_policies WHERE tablename = 'profiles';
   ```
2. Supprimez manuellement les politiques en conflit
3. Réexécutez le script

