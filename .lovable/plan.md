## Objectif

Implémenter les recommandations du rapport pour augmenter le temps de session, en priorisant les éléments **à fort impact / faible-moyenne complexité** et **manquants** dans la base actuelle.

## État actuel (déjà présent, à ne pas refaire)

- Feed personnalisé (`usePersonalizedFeed`), favoris, badges vendeur vérifié, notes/avis, indicateur de temps de réponse, lazy loading images, skeletons, filtres, recherches récentes, alertes via follow vendeur.

## Manquant / à améliorer (scope du plan)

### 1. Carrousel « À la Une » en haut de la page d'accueil (Impact élevé / Complexité faible)
- Nouveau composant `FeaturedCarousel.tsx` au-dessus de la grille `Index.tsx`.
- Source : 5–8 annonces les plus récentes avec photo + boost (ou simplement `is_featured` / score popularité existant dans le feed perso).
- Auto-scroll toutes les 5s (pause au hover/touch), pagination dots, swipe mobile (réutiliser `embla-carousel` déjà installé via shadcn).
- Card large : image pleine largeur, titre, prix FCFA, ville, badge « À la une ».

### 2. Quick View modal sur les cartes (Impact très élevé / Complexité moyenne)
- Bouton icône « œil » en overlay sur `ListingCard` (visible au hover desktop, toujours visible mobile en coin).
- Ouvre un `Dialog` (shadcn) avec : carrousel photos, titre, prix, ville, description tronquée, bouton « Voir l'annonce complète », bouton favoris, bouton contact.
- Évite la navigation → l'utilisateur enchaîne plusieurs annonces sans quitter la liste.
- Composant : `QuickViewDialog.tsx`, intégré dans `ListingCard.tsx` via state local.

### 3. Sauvegarder une recherche + alerte (Impact élevé / Complexité moyenne)
- Bouton « 🔔 Sauvegarder cette recherche » dans `SearchPage` (à côté des filtres).
- Stockage : nouvelle table `saved_searches` (user_id, query, filters jsonb, created_at) avec RLS user-only, GRANT authenticated.
- Liste accessible depuis `AccountPage` → « Mes recherches sauvegardées ».
- (Notifications réelles = phase ultérieure ; ici on stocke et on affiche les résultats correspondants à l'ouverture.)

### 4. Section « Vus récemment » sur la home (Impact élevé / Complexité faible)
- Stockage localStorage : tableau `recently_viewed_ids` (max 12, dédupliqué, push à l'ouverture de `ListingDetail`).
- Composant `RecentlyViewedRow.tsx` : carrousel horizontal compact (réutilise `ListingCard` en taille réduite).
- Affiché sur `Index.tsx` sous le carrousel À la une, seulement si ≥ 3 items.

### 5. Micro-animations & polish (Impact moyen / Complexité faible)
- Animation cœur favori : scale + couleur (Tailwind `transition-transform active:scale-125`, ajout d'un keyframe `heart-pop`).
- Transition douce hover sur les cards (déjà partiellement présent, à harmoniser).
- Skeleton du carrousel À la une.

## Hors scope

- Gamification (badges de succès, barre profil) — moyen impact, à voir plus tard.
- Notifications push réelles pour recherches sauvegardées (nécessite Web Push + edge function dédiée).
- Refonte masonry de la grille (la grille 3-col actuelle est volontaire, voir mémoire `style/design-system`).
- Modifications backend hors `saved_searches`.

## Détails techniques

**Fichiers créés**
- `frontend/src/components/home/FeaturedCarousel.tsx`
- `frontend/src/components/listing/QuickViewDialog.tsx`
- `frontend/src/components/home/RecentlyViewedRow.tsx`
- `frontend/src/hooks/useRecentlyViewed.ts`
- `frontend/src/hooks/useSavedSearches.ts`
- `frontend/supabase/migrations/<timestamp>_add_saved_searches.sql`

**Fichiers modifiés**
- `frontend/src/pages/Index.tsx` — insère FeaturedCarousel + RecentlyViewedRow.
- `frontend/src/components/ListingCard.tsx` — bouton Quick View + animation cœur.
- `frontend/src/pages/ListingDetail.tsx` — push dans `useRecentlyViewed`.
- `frontend/src/pages/SearchPage.tsx` — bouton sauvegarder recherche.
- `frontend/src/pages/AccountPage.tsx` — entrée « Recherches sauvegardées ».
- `frontend/src/index.css` — keyframe `heart-pop`.

**Migration SQL** (avec GRANTs obligatoires)
```sql
CREATE TABLE public.saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label text NOT NULL,
  query text,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_searches TO authenticated;
GRANT ALL ON public.saved_searches TO service_role;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own searches" ON public.saved_searches
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

## Ordre d'implémentation

1. Carrousel À la une + Vus récemment (visible immédiatement sur la home).
2. Quick View modal + animation cœur (impact sur toute la grille).
3. Migration `saved_searches` + UI sauvegarde/consultation.
