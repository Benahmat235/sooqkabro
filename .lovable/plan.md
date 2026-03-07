

# 🇹🇩 TchadMarket — Plateforme de Petites Annonces pour le Tchad

## Vision
Une plateforme de petites annonces moderne, mobile-first, adaptée au marché tchadien — inspirée d'OpenSooq avec les spécificités locales (FCFA, villes tchadiennes, opérateurs locaux).

---

## Phase 1 — MVP (Ce qu'on construit maintenant)

### 1. Page d'accueil
- Barre de recherche proéminente
- Grille de catégories avec icônes colorées (style OpenSooq)
- Annonces récentes / à la une
- Sélecteur de ville (N'Djaména par défaut)
- Design mobile-first, chargement rapide

### 2. Catégories complètes
Toutes les 10 catégories avec sous-catégories :
- Véhicules & Transports, Immobilier, Téléphones & Tablettes
- Emploi & Formation, Services, Animaux & Élevage
- Mode & Beauté, Maison & Meubles, Électronique, Alimentation

### 3. Pages de listing d'annonces
- Filtres par ville, prix (en FCFA), catégorie
- Vue liste et vue grille
- Tri par date, prix
- Pagination

### 4. Page détail d'une annonce
- Photos en carrousel
- Description, prix en FCFA
- Localisation (ville + quartier)
- Bouton appeler (+235) et bouton WhatsApp
- Annonces similaires

### 5. Publier une annonce
- Formulaire avec sélection de catégorie/sous-catégorie
- Upload de photos (jusqu'à 5)
- Prix en FCFA, localisation, numéro de téléphone (+235, 8 chiffres)
- Validation des champs

### 6. Authentification
- Inscription / Connexion (email + mot de passe)
- Profil utilisateur simple avec ses annonces

### 7. Localisation tchadienne
- 13 villes principales + quartiers de N'Djaména
- Devise FCFA partout
- Indicatif +235 avec validation

### 8. Recherche
- Recherche par mots-clés
- Filtres par catégorie, ville, fourchette de prix

---

## Phase 2 — Améliorations futures (non incluses dans cette version)
- Messagerie interne entre utilisateurs
- Support multilingue (Arabe tchadien, Anglais)
- Notifications push
- Application Android native (PWA ou Capacitor)
- Système de favoris
- Annonces sponsorisées
- Panneau d'administration
- Intégration paiement mobile (Orange Money, Airtel Money)

---

## Design & UX
- **Style** : Coloré et visuel comme OpenSooq, avec couleurs inspirées du drapeau tchadien (bleu, jaune, rouge)
- **Mobile-first** : Interface optimisée pour smartphone
- **Performance** : Images optimisées, chargement léger pour les connexions lentes
- **Langue** : Français comme langue principale

## Stack technique
- **Frontend** : React + TypeScript + Tailwind CSS
- **Backend** : Supabase (base de données, authentification, stockage photos)
- **Données** : Catégories, villes et quartiers pré-configurés

