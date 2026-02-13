# MVP Playlife — plateforme web pour missions solidaires

## 🎯 Contexte
Playlife est une association qui envoie des packs de matériel sportif à des enfants via des structures locales et des voyageurs solidaires.  
Le MVP doit permettre à deux types d’acteurs de créer, suivre et partager des missions.  
Objectif : plateforme fluide, claire, automatisée au minimum, responsive, et intuitive.

Deux profils utilisateurs (Table `profiles`) :
1. **Voyageur solidaire** : profite d’un voyage pro ou perso pour remettre un pack Playlife à une structure locale.
2. **Animateur / Instituteur** : encadre des enfants et leur fait créer un pack destiné à d’autres enfants (anciennement "Créateur de mission").

---

## 🧱 Fonctionnalités MVP

### A) Pages Publiques & Navigation
- **Sidebar Navigation** :
    - Mon espace (Tableau de bord)
    - Mes missions
    - Structures
    - Ressources (Boîte à outils)
    - Paramètres
- **Page d’accueil** : Design moderne avec Hero, grille de ressources et concepts.

### B) Mon espace (Tableau de bord)
- **Indicateurs d'impact** :
    - Nombre de missions réalisées
    - Nombre de packs distribués
    - Estimation du nombre d'enfants aidés
- **Liste des missions** :
    - Visualisation par cartes avec barre de progression (ex: "3 étapes sur 5 complétées").
    - Tags de statut : "En cours", "Terminée".
    - Tags de profil : "Voyageur", "Animateur".
    - Actions : Modifier la mission, Voir la cagnotte, Voir le détail.

### C) Gestion des Missions
- **Processus en 5 étapes "Comment ça marche ?"** :
    1. **Créer une mission** : Définir le projet et les objectifs.
    2. **Lancer une collecte** : Créer une cagnotte en ligne pour le matériel.
    3. **Acheter le matériel** : Constituer le pack sportif auprès des partenaires.
    4. **Remettre le pack** : Livraison à une structure locale.
    5. **Partager le compte-rendu** : Photos et témoignages pour montrer l'impact.
- **Formulaire de création (Multi-étapes : 4 étapes)** :
    - **Étape 1** : Choix du type de mission (Voyageur vs Animateur).
    - **Étape 2** : Détails (Titre, Pays, Ville, Date de remise prévue, Description courte).
    - **Étapes 3 & 4** : (À définir, probablement confirmation et lien vers cagnotte).

### D) Authentification / Profil utilisateur
- **Techno** : Supabase Auth.
- **Profil** : Jean Dupont (exemple). Affichage de l'avatar et de l'email dans le header.

---

## ⚙️ Choix Techniques (Validés)
- **Framework :** React 18 + Vite.
- **Styling :** Tailwind CSS 4.0.
- **Icons :** Lucide React.
- **Base de données / Backend :** Supabase (PostgreSQL, Auth, Storage).
- **Routing :** React Router DOM v7.

---

## 📊 Structure de données (Supabase)
- `profiles` : id (uuid), full_name, role (voyageur/animateur), avatar_url.
- `missions` : id, title, description, location, country, city, target_date, progress_steps (1-5), status, created_by.
- `structures` : id, name, type, location, contact, website.

---

## ✅ État d'avancement du MVP
- [x] Architecture de base (React + Vite + Tailwind)
- [x] Navigation Multi-pages (Routing)
- [x] Connexion Supabase & Client Utility
- [x] Schéma de base de données (SQL)
- [x] Page Missions dynamique + Formulaire de création
- [x] Intégration de la charte graphique (Rose/Rouge Playlife)
- [ ] Authentification sécurisée (Email/MDP)
- [ ] Tableau de bord utilisateur complet (Cartes de progression)
- [ ] Formulaire de création en 4 étapes (actuellement simple modal)
- [ ] Section Ressources (Checklist interactive)
