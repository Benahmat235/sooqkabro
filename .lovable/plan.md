
# Plan Phase 2 — Algorithmes intelligents

Implémentation progressive par étapes ordonnées du plus fort impact visible au plus complexe. Chaque étape est livrable indépendamment.

## Étape 1 — Score qualité d'annonce + boost classement (priorité 1)

Calcul d'un score 0-100 par annonce, utilisé pour le classement dans le feed et affiché aux vendeurs pour les inciter à améliorer leurs annonces.

### Critères de scoring
- Photos : nombre (5 = max), résolution
- Description : longueur, mots-clés (>50 chars = bon, >150 chars = excellent)
- Prix renseigné > 0
- Quartier renseigné
- Téléphone valide (Numverify déjà existant)
- Vendeur vérifié (`profiles.is_verified`) → bonus +15
- Note moyenne vendeur (>4★ → bonus)

### Intégration
- Calculer côté Edge Function `getPersonalizedFeed` à la volée (pas de stockage initial)
- Ajouter `qualityScore` dans la pondération du feed (nouveau ratio : 25% pop / 25% recency / 30% affinity / 20% qualité)
- Sur `MyListings.tsx` : badge "Score qualité : 75/100" + suggestions ("Ajoutez 2 photos", "Allongez la description")
- Sur `PublishListing.tsx` : indicateur live du score pendant la rédaction

## Étape 2 — Pricing intelligence

Analyse statistique des prix par catégorie pour guider acheteurs et vendeurs.

### Backend
- Nouvelle Edge Function `getPriceStats` : prend `category_id` (et optionnellement `subcategory_id`), retourne `{ min, max, p25, median, p75, count }` calculés sur `listings` publiées
- Cache 1h en mémoire pour limiter les requêtes

### Frontend
- `PublishListing.tsx` : à la sélection de catégorie, afficher fourchette suggérée ("Prix typiques : 50 000 – 150 000 FCFA, médiane 90 000")
- `ListingCard.tsx` : badge `Bon prix` (≤ p25), `Prix élevé` (≥ p75) — couleur verte / orange
- `ListingDetail.tsx` : section comparaison "Prix par rapport au marché"

## Étape 3 — Détection spam & duplicatas

Protection contre la pollution du feed.

### Anti-doublon (côté serveur)
- Trigger SQL avant `INSERT` sur `listings` : refuser si même `user_id` + même `title` + même `phone` dans les dernières 24h
- Hash SHA-256 du titre + description normalisés (lowercase, sans espaces) → colonne `content_hash`, index unique partiel par utilisateur

### Patterns suspects (Edge Function)
- Nouvelle fonction `flagSuspiciousListing` appelée après publication :
  - Plus de 5 annonces actives avec le même `phone` provenant d'utilisateurs différents → flag
  - Prix anormalement bas (< 10% médiane catégorie) → flag
- Nouvelle table `listing_flags(listing_id, reason, flagged_at, reviewed)` visible dans `AdminPage.tsx`

### Score de confiance vendeur
- Calcul à la demande dans `useSellerStats` :
  - +20 si email vérifié, +20 si téléphone vérifié, +20 si avis ≥ 4★ (avec ≥ 3 avis), +20 si compte > 30 jours, +20 si pas de flag
- Affichage badge "Vendeur de confiance 80/100" sur `SellerProfile.tsx`

## Étape 4 — Recommandations améliorées (collaborative filtering léger)

Améliore `getPersonalizedFeed` existant.

### Suggestions "Produits similaires"
- Composant `SimilarProducts.tsx` existe déjà — l'enrichir :
  - Fetch annonces de la même `subcategory_id`, ville prioritaire, ±30% du prix
  - Trier par score qualité (étape 1)

### "Vu également par d'autres acheteurs"
- Nouvelle Edge Function `getCoViewedListings(listing_id)` :
  - Trouver les `viewer_id` qui ont vu cette annonce
  - Récupérer les autres annonces vues par ces utilisateurs
  - Top 6 par fréquence

## Détails techniques par fichier

| Fichier | Modification |
|---|---|
| `frontend/supabase/migrations/<new>.sql` | Table `listing_flags`, colonne `content_hash` sur `listings`, trigger anti-doublon |
| `frontend/supabase/functions/getPersonalizedFeed/index.ts` | Ajouter calcul `qualityScore` + pondération |
| `frontend/supabase/functions/getPriceStats/index.ts` | Nouvelle fonction (publique, verify_jwt=false) |
| `frontend/supabase/functions/flagSuspiciousListing/index.ts` | Nouvelle fonction (verify_jwt=true) |
| `frontend/supabase/functions/getCoViewedListings/index.ts` | Nouvelle fonction (publique) |
| `frontend/src/lib/quality.ts` | Nouveau — fonction `computeListingQuality(listing)` partagée client/serveur |
| `frontend/src/lib/pricing.ts` | Nouveau — helpers badge bon prix / prix élevé |
| `frontend/src/pages/PublishListing.tsx` | Indicateur qualité live + fourchette de prix |
| `frontend/src/pages/MyListings.tsx` | Badge score + suggestions amélioration |
| `frontend/src/pages/ListingDetail.tsx` | Section comparaison prix marché |
| `frontend/src/components/ListingCard.tsx` | Badge "Bon prix" / "Prix élevé" |
| `frontend/src/components/SimilarProducts.tsx` | Logique enrichie (subcat + prix + ville) |
| `frontend/src/hooks/useSellerStats.ts` | Score de confiance vendeur |
| `frontend/src/pages/SellerProfile.tsx` | Badge "Vendeur de confiance" |
| `frontend/src/pages/AdminPage.tsx` | Onglet "Annonces signalées" (lecture `listing_flags`) |

## Ordre d'exécution recommandé

1. **Étape 1** (score qualité) — visible immédiatement, gros impact UX
2. **Étape 2** (pricing) — utile à la publication, simple à implémenter
3. **Étape 3** (anti-spam) — protection plateforme, nécessite migration DB
4. **Étape 4** (reco co-viewing) — amélioration progressive, dépend des données

## Hors scope (non inclus)

- ML embeddings (vectoriels) — trop lourd pour ce stade
- Auto-modération par IA — sera traité dans une phase ultérieure si besoin
- Refonte complète UI (Phase 4 du README)

## Confirmation

À l'approbation, j'exécute **l'Étape 1 en priorité** puis enchaîne dans l'ordre sauf instruction contraire.
