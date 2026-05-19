# SooqKabro - Plan d'améliorations frontend Phase 2

## Objectif
Améliorer l'expérience utilisateur principale de SooqKabro pour rendre la recherche, la consultation et la publication d'annonces plus rapides, plus claires et plus fiables, surtout sur mobile.

## Priorités

### 1. Cartes d'annonces
Objectif : rendre chaque annonce plus lisible et plus facile à comparer.

- Mettre le prix plus en évidence.
- Stabiliser le ratio image pour éviter les sauts de mise en page.
- Afficher clairement ville, quartier et date.
- Renforcer les badges utiles : nouveau, urgent, vérifié.
- Améliorer les états image manquante, chargement et erreur.
- Rendre le bouton favori plus visible sans gêner l'image.

Fichiers probables :
- `frontend/src/components/ListingCard.tsx`
- `frontend/src/components/ListingCardList.tsx`
- `frontend/src/components/Skeletons.tsx`
- `frontend/src/lib/quality.ts`

Critères d'acceptation :
- Une carte reste lisible sur mobile étroit.
- Le prix, la localisation et l'image sont identifiables en moins d'une seconde.
- Les textes longs ne cassent pas la carte.

### 2. Recherche et filtres mobile
Objectif : permettre aux utilisateurs de trouver vite une annonce pertinente.

- Transformer les filtres mobile en drawer ergonomique.
- Ajouter des chips de filtres actifs.
- Garder les filtres dans l'URL pour le partage et le retour navigateur.
- Ajouter tri par date, prix et pertinence.
- Améliorer l'historique et les suggestions de recherche.

Fichiers probables :
- `frontend/src/pages/SearchPage.tsx`
- `frontend/src/components/FilterPanel.tsx`
- `frontend/src/components/Header.tsx`
- `frontend/src/hooks/useSearchHistory.ts`

Critères d'acceptation :
- Les filtres actifs sont visibles et supprimables rapidement.
- Rafraîchir la page conserve la recherche.
- L'interface reste utilisable à une main sur mobile.

### 3. Page détail annonce
Objectif : augmenter la confiance et faciliter le contact vendeur.

- Améliorer la galerie photo avec navigation claire.
- Ajouter une barre de contact sticky sur mobile.
- Mettre en avant appel, message et WhatsApp si disponible.
- Ajouter un bloc vendeur plus rassurant : note, ancienneté, téléphone vérifié.
- Améliorer les annonces similaires et produits co-consultés.
- Rendre le signalement accessible mais discret.

Fichiers probables :
- `frontend/src/pages/ListingDetail.tsx`
- `frontend/src/components/ContactActions.tsx`
- `frontend/src/components/PhoneDisplay.tsx`
- `frontend/src/components/SimilarProducts.tsx`
- `frontend/src/components/CoViewedProducts.tsx`

Critères d'acceptation :
- Le contact vendeur reste accessible sans scroller inutilement sur mobile.
- La galerie fonctionne avec plusieurs images et avec une seule image.
- Les informations de confiance sont visibles avant le contact.

### 4. Accueil
Objectif : faire de la page d'accueil un point d'entrée efficace vers les annonces.

- Donner plus de poids à la recherche principale.
- Ajouter des raccourcis vers catégories populaires.
- Afficher les annonces récentes proches de l'utilisateur.
- Rendre le CTA publier visible mais non envahissant.
- Mieux gérer les états vide, chargement et hors ligne.

Fichiers probables :
- `frontend/src/pages/Index.tsx`
- `frontend/src/components/CategoryGrid.tsx`
- `frontend/src/components/CategoryNav.tsx`
- `frontend/src/components/PublishCTA.tsx`

Critères d'acceptation :
- L'utilisateur comprend immédiatement comment chercher ou publier.
- Les catégories sont scannables sur mobile.
- Les sections ne ressemblent pas à une landing page marketing.

### 5. Confiance, sécurité et accessibilité
Objectif : réduire les risques perçus et rendre l'app plus robuste.

- Uniformiser les badges vendeur et téléphone vérifié.
- Ajouter des messages anti-arnaque courts aux endroits de contact.
- Vérifier les contrastes clair/sombre.
- Ajouter ou corriger les libellés ARIA des boutons icône.
- Renforcer les états focus clavier.

Fichiers probables :
- `frontend/src/components/PhoneValidationIndicator.tsx`
- `frontend/src/components/QualityIndicator.tsx`
- `frontend/src/components/ui/button.tsx`
- `frontend/src/index.css`

Critères d'acceptation :
- Les actions icône seules ont un nom accessible.
- Le dark mode reste lisible.
- Les messages de sécurité ne bloquent pas le parcours.

## Benchmark OpenSooq Libye : 10 différences utiles à adapter

Référence observée : `https://ly.opensooq.com/en`. Le site met fortement en avant une logique de marketplace très profonde, avec catégories détaillées, autos, immobilier, emplois, services et guides prix/spécifications. Ces idées doivent être adaptées au marché tchadien, pas copiées telles quelles.

### 1. Navigation par méga-catégories plus profonde
OpenSooq expose beaucoup de niveaux : autos, immobilier, services, emplois, électronique, maison, business, sport, animaux, mode, alimentation.

Adaptation SooqKabro :
- Ajouter une vue `Toutes les catégories` avec sous-catégories groupées.
- Garder l'accueil simple, mais proposer une exploration complète depuis catégorie/recherche.
- Ajouter une recherche interne de catégorie pour éviter les listes trop longues.

Fichiers probables :
- `frontend/src/data/categories.ts`
- `frontend/src/components/CategoryGrid.tsx`
- `frontend/src/pages/CategoryPage.tsx`

### 2. Pages spécialisées Autos
OpenSooq sépare voitures, motos, location, pièces, pneus, accessoires, batteries, entretien et engins lourds.

Adaptation SooqKabro :
- Créer des filtres propres aux véhicules : marque, modèle, année, carburant, kilométrage, transmission.
- Ajouter des chips rapides : `Voitures`, `Motos`, `Pièces`, `Location`.
- Prévoir une fiche véhicule plus structurée.

Fichiers probables :
- `frontend/src/pages/PublishListing.tsx`
- `frontend/src/pages/SearchPage.tsx`
- `frontend/src/pages/ListingDetail.tsx`

### 3. Pages spécialisées Immobilier
OpenSooq distingue vente, location, résidentiel, commercial, terrains, bureaux, magasins, entrepôts.

Adaptation SooqKabro :
- Ajouter des filtres immobilier : type, surface, chambres, location/vente, quartier.
- Afficher les champs immobiliers dans les cartes et détails quand la catégorie est immobilier.
- Ajouter une section `Immobilier à N'Djaména` sur l'accueil si assez d'annonces.

Fichiers probables :
- `frontend/src/components/ListingCard.tsx`
- `frontend/src/pages/ListingDetail.tsx`
- `frontend/src/components/FilterPanel.tsx`

### 4. Guides prix et spécifications
OpenSooq met en avant des pages de prix/spécifications pour voitures, mobiles et tablettes.

Adaptation SooqKabro :
- Ajouter un module `Prix du marché` sur téléphone, véhicules et immobilier.
- Afficher une fourchette et un indicateur `Bon prix`, `Prix moyen`, `Prix élevé`.
- Ajouter une page simple de référence prix par catégorie populaire.

Fichiers probables :
- `frontend/src/hooks/usePriceStats.ts`
- `frontend/src/lib/pricing.ts`
- `frontend/src/components/QualityIndicator.tsx`

### 5. Services mieux segmentés
OpenSooq sépare construction, maintenance, transport, nettoyage, beauté, garde, événements, business, IT, éducation.

Adaptation SooqKabro :
- Détailler la catégorie `Services` avec sous-catégories locales.
- Ajouter un type d'annonce service avec zone d'intervention, disponibilité et prix indicatif.
- Rendre les cartes service différentes des cartes produit quand utile.

Fichiers probables :
- `frontend/src/data/categories.ts`
- `frontend/src/pages/PublishListing.tsx`
- `frontend/src/components/ListingCard.tsx`

### 6. Emploi et demandeurs d'emploi séparés
OpenSooq distingue `Jobs` et `Job Seekers`.

Adaptation SooqKabro :
- Séparer offres d'emploi et profils candidats.
- Ajouter des champs emploi : secteur, contrat, expérience, salaire, ville.
- Ajouter des CTA distincts : `Publier une offre` et `Créer un profil candidat`.

Fichiers probables :
- `frontend/src/pages/PublishListing.tsx`
- `frontend/src/pages/CategoryPage.tsx`
- `frontend/src/data/categories.ts`

### 7. Business et équipements professionnels
OpenSooq a des catégories pour entreprises, équipements restaurants, médical, générateurs, solaire, construction, logistique.

Adaptation SooqKabro :
- Ajouter une catégorie `Professionnels & Equipements`.
- Mettre en avant générateurs, solaire, matériel restaurant, machines, outillage.
- Prévoir des filtres B2B : neuf/occasion, capacité, livraison, garantie.

Fichiers probables :
- `frontend/src/data/categories.ts`
- `frontend/src/components/CategoryNav.tsx`
- `frontend/src/components/FilterPanel.tsx`

### 8. Accessoires et pièces comme parcours à part entière
OpenSooq ne limite pas les catégories aux produits principaux : pièces auto, accessoires téléphone, composants PC, câbles, batteries, outils.

Adaptation SooqKabro :
- Ajouter plus de sous-catégories d'accessoires dans téléphone, électronique et véhicules.
- Permettre un filtre `Accessoires uniquement` dans certaines catégories.
- Améliorer le libellé des annonces pour éviter que les accessoires se mélangent aux produits complets.

Fichiers probables :
- `frontend/src/data/categories.ts`
- `frontend/src/pages/SearchPage.tsx`
- `frontend/src/pages/CategoryPage.tsx`

### 9. Exploration horizontale des catégories populaires
OpenSooq favorise une exploration rapide par grands univers.

Adaptation SooqKabro :
- Ajouter une barre horizontale `Univers populaires` sous la recherche.
- Afficher des entrées directes : Autos, Téléphones, Immobilier, Emploi, Services, Maison.
- Conserver des dimensions stables et des icônes simples pour mobile.

Fichiers probables :
- `frontend/src/components/CategoryNav.tsx`
- `frontend/src/pages/Index.tsx`

### 10. Parcours vendeur plus orienté type d'annonce
La profondeur des catégories OpenSooq implique une publication guidée par type d'annonce.

Adaptation SooqKabro :
- Faire choisir le type d'annonce avant le formulaire complet.
- Afficher seulement les champs pertinents selon catégorie : véhicule, immobilier, emploi, service.
- Ajouter une prévisualisation compacte avant publication.

Fichiers probables :
- `frontend/src/pages/PublishListing.tsx`
- `frontend/src/lib/quality.ts`
- `frontend/src/components/QualityIndicator.tsx`

## Ordre d'exécution recommandé

1. Corriger les cartes d'annonces.
2. Reprendre recherche et filtres mobile.
3. Améliorer la page détail annonce.
4. Ajuster l'accueil.
5. Faire la passe accessibilité et sécurité.

## Vérifications à chaque étape

- `npm run build`
- Test manuel sur largeur mobile et desktop.
- Vérification des textes longs.
- Vérification dark mode et light mode.
- Vérification des états chargement, vide et erreur.

## Notes techniques

- Préserver les patterns React, Tailwind, shadcn/ui et Framer Motion déjà présents.
- Limiter les changements par phase pour éviter de mélanger design, logique et données.
- Ne pas introduire de nouvelle librairie sauf besoin concret.
- Garder les composants adaptés à une place de marché utilitaire, pas à une landing page décorative.
