# Plan — Nettoyage du code de base

Passe complète sur `frontend/` couvrant les 4 axes demandés. Aucun changement fonctionnel, aucun changement de design.

## 1. Suppression des fichiers/code morts

- **`frontend/src/data/mockListings.ts`** — fixtures plus utilisées en runtime, seul `formatPrice` est encore importé (par `ListingCard.tsx` et `ListingDetail.tsx`).
  → Extraire `formatPrice` dans `frontend/src/lib/pricing.ts` (déjà le bon emplacement), supprimer le fichier `mockListings.ts`, mettre à jour les 2 imports.
- Recherche systématique d'imports/exports/variables/fonctions orphelins via `ts-prune` (run ponctuel, pas d'ajout en dépendance) et nettoyage des occurrences confirmées non utilisées.
- Supprimer les `console.log` de debug restants (garder `console.error` dans `errorHandler`).

## 2. Nettoyage de la structure du projet

Doublons à la racine du repo qui datent d'un ancien layout (le vrai code vit dans `frontend/`) :

- `src/integrations/supabase/` (racine) — doublon de `frontend/src/integrations/supabase/`. **Supprimer le dossier `src/` racine.**
- `supabase/` (racine, contient `config.toml` + `migrations/`) — doublon de `frontend/supabase/`. **Supprimer le dossier `supabase/` racine.**
- `backend/` (server.py FastAPI inutilisé : app 100% client + Edge Functions), `tests/` (vide sauf `__init__.py`), `test_reports/` (vide) — **supprimer**.
- `package.json` racine s'il ne sert qu'à pointer vers `frontend/` — vérifier puis garder ou nettoyer selon contenu.
- `memory/*.md` (5 fichiers de plans de phases passées) — **archiver** sous `memory/archive/` plutôt que supprimer, pour garder la trace.

## 3. Correction des warnings ESLint / TS

66 erreurs `@typescript-eslint/no-explicit-any` sur 13 fichiers. Remplacement par types appropriés :

- `errorHandler.ts` (4) → `unknown` + type guards.
- Catches Supabase dans pages (`AuthPage`, `ResetPassword`, `EditListing`, `PublishListing`, `MyListings`, `SellerProfile`, `AdminPage`, `AccountPage`) → `unknown` avec narrowing `error instanceof Error`.
- Listings / profils typés via `Database['public']['Tables'][...]['Row']` depuis `integrations/supabase/types.ts` (`CategoryPage`, `DiscoverPage`, `SearchPage`, `MyListings`, `AccountPage`).
- `useUpdateLastSeen` → type d'event Supabase realtime.

Objectif : `npx eslint src` → 0 erreur.

## 4. Refactor & déduplication

Petits extraits seulement (pas de refonte) :

- **`lib/formatters.ts`** *(nouveau)* — regrouper `formatPrice`, `formatDate`/`formatRelativeTime` répétés dans `MessagesPage`, `ListingDetail`, `MyListings`.
- **`lib/supabaseErrors.ts`** *(nouveau)* — helper `getErrorMessage(err: unknown): string` utilisé partout après le passage à `unknown`.
- **`hooks/useListingOwner.ts`** *(nouveau, optionnel)* — fetch profil vendeur réutilisé dans `ListingDetail` et `SellerProfile`.
- Pas de découpe de gros composants (`PublishListing` 800+ lignes, `ListingDetail`) — hors scope nettoyage.

## Détails techniques

### Fichiers supprimés
```
src/                              (racine, doublon)
supabase/                         (racine, doublon)
backend/                          (FastAPI inutilisé)
tests/                            (vide)
test_reports/                     (vide)
frontend/src/data/mockListings.ts
```

### Fichiers créés
```
frontend/src/lib/formatters.ts
frontend/src/lib/supabaseErrors.ts
memory/archive/*.md               (déplacement des 5 .md existants)
```

### Fichiers modifiés (imports + types)
13 fichiers listés par ESLint + `ListingCard.tsx` + `ListingDetail.tsx` pour `formatPrice`.

## Vérifications finales

1. `npx eslint src` → 0 erreur.
2. Build TS (auto via harness) passe.
3. Smoke visuel : `/`, `/compte`, `/messages`, `/favoris`, `/publier`, détail d'une annonce — rien ne casse.

## Hors scope

- Refonte design (déjà couverte par phases 1-3).
- Refactor des gros composants (`PublishListing`, `ListingDetail`).
- Migration backend ou changement de schéma Supabase.
- Ajout de tests.
