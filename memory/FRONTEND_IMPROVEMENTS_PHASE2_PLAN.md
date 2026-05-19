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
