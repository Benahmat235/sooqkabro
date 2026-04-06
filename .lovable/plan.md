## Plan : Refonte visuelle inspiree d'OpenSooq

### 1. Header — Style OpenSooq

**Fichier** : `src/components/Header.tsx`

- Row 1 : Logo SooqKabro a droite, icones coeur (favoris) + cloche (notifications) + bouton "Publier" a gauche 
- Row 2 : Selecteur ville avec drapeau du Tchad + texte "Tchad - Toutes les villes" (dropdown)
- Row 3 : Barre de recherche pleine largeur avec bouton "Rechercher" colore a droite et icone hamburger (menu) a droite
- Supprimer le LanguageSwitcher du header (le garder dans le profile uniquement)

### 2. Categories — Grille 4 colonnes avec images

**Fichier** : `src/components/CategoryGrid.tsx`

- Remplacer le scroll horizontal d'icones par une **grille 4 colonnes** (grid-cols-4)
- Chaque categorie : carte avec **image illustrative** (emoji large ou icone SVG dans un cercle colore plus grand ~20x20) + texte en dessous
- Style : fond clair colore par categorie, coins arrondis (rounded-2xl), ombre legere
- Titre de section "SooqKabro" avec lien "Voir tout" a droite (comme OpenSooq)

### 3. BottomNav — Style OpenSooq

**Fichier** : `src/components/BottomNav.tsx`

- 5 items : Accueil (maison pleine si active), Messages (bulle avec badge), Publier (cercle orange/jaune surelevé avec +), Mes annonces (icone liste), Mon compte (silhouette)
- Remplacer "Decouvrir" par "Mes annonces" (/mes-annonces) pour coller au modele OpenSooq
- Style : fond blanc, icones noires, actif = noir gras, bouton central = cercle jaune/orange surelevé

### 4. Listings — Grille 3 colonnes mobile

**Fichier** : `src/pages/Index.tsx` + `src/components/ListingCard.tsx`

- Changer la grille de `grid-cols-1` mobile a `**grid-cols-3**` sur mobile (comme OpenSooq)
- ListingCard compact : image carree, prix en overlay en bas a gauche, coeur en haut a droite
- Texte sous l'image : description courte (ville + details), plus petit
- Sections par categorie avec sous-filtres en chips (ex: Résidentiel / Terrains / Commercial)

### 5. Footer — Plus simple

**Fichier** : `src/components/Footer.tsx`

- Simplifier : garder logo + copyright + LanguageSwitcher
- Supprimer la grille de liens (trop chargee pour mobile)
- Le footer ne doit PAS etre fixe — il scrolle avec le contenu

### Fichiers impactes


| Fichier                           | Modification                                  |
| --------------------------------- | --------------------------------------------- |
| `src/components/Header.tsx`       | Refonte 3 lignes style OpenSooq               |
| `src/components/CategoryGrid.tsx` | Grille 4 colonnes avec images                 |
| `src/components/BottomNav.tsx`    | 5 items style OpenSooq                        |
| `src/components/ListingCard.tsx`  | Version compacte pour grille 3 colonnes       |
| `src/pages/Index.tsx`             | Grille 3 colonnes mobile + sections categorie |
| `src/components/Footer.tsx`       | Simplification                                |
