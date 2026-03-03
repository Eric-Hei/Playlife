# Playlife — Plateforme de missions solidaires

Application web permettant à des voyageurs solidaires et des animateurs/enseignants d'organiser des missions de don de matériel sportif à destination d'enfants, via des structures locales partenaires.

---

## 🚀 Stack technique

- **Frontend** : React 18 + TypeScript + Vite
- **Styling** : Tailwind CSS 4.0
- **Routing** : React Router DOM v7
- **Backend / BDD** : Supabase (PostgreSQL, Auth, Storage)
- **Icônes** : Lucide React
- **Déploiement** : Netlify

---

## 📄 Pages

| Route | Description |
|---|---|
| `/` | Page d'accueil avec diaporama et présentation |
| `/missions` | Liste des missions + formulaire de création |
| `/structures` | Structures locales partenaires validées |
| `/impact` | Parcours Playlife et impact social |
| `/ressources` | Boîte à outils pour les utilisateurs |
| `/contact` | Informations de contact |
| `/dashboard` | Tableau de bord personnel *(authentifié)* |
| `/settings` | Administration *(super admin uniquement)* |

---

## ⚙️ Installation

### Prérequis

- Node.js ≥ 18
- Un projet [Supabase](https://supabase.com) configuré

### 1. Cloner le projet et installer les dépendances

```bash
npm install
```

### 2. Configurer les variables d'environnement

Copiez `.env.example` en `.env` et renseignez vos clés Supabase :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon-publique
```

### 3. Initialiser la base de données

Dans le SQL Editor de votre projet Supabase, exécutez dans l'ordre :

1. `supabase/MIGRATION_COMPLETE_SECURISEE.sql` — tables, RLS, vues, buckets Storage
2. `supabase/set_super_admin.sql` — promouvoir un compte en super admin (modifier l'email)
3. `supabase/verification_securite.sql` — vérifier que tout est correctement configuré

### 4. Lancer le serveur de développement

```bash
npm run dev
```

---

## 🛡️ Sécurité

- Row Level Security (RLS) activé sur toutes les tables
- Les utilisateurs n'accèdent qu'à leurs propres données
- Aucune clé sensible dans le code — tout passe par `.env`
- Vue `public_profiles` sans données sensibles (email, is_super_admin)

---

## 🚢 Déploiement

```bash
npm run build
netlify deploy --prod --dir=dist --site=playlife
```

Pour plus de détails, voir `supabase/README.md` et `DEPLOIEMENT_NOUVELLE_INSTANCE.md`.

---

## 👤 Profils utilisateurs

- **Voyageur solidaire** : profite d'un voyage pour remettre un pack sportif à une structure locale
- **Animateur / Enseignant** : encadre des enfants dans la création d'un pack destiné à d'autres enfants
- **Super admin** : accès à la page Paramètres pour gérer structures, missions et diaporama
