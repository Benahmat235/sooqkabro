## Phase 3 — Refonte de la page d'accueil au style Shoppe

Après les Settings, Messages, Favoris et Rate dialog (phases précédentes), j'applique le langage Shoppe à la page d'accueil et au header, qui restent les écrans les plus visibles. Palette **SooqKabro** conservée (bleu Tchad, or, Cairo, FCFA, RTL).

### Mapping Shoppe → SooqKabro Home

| Shoppe | SooqKabro |
|---|---|
| "Hello, {name}!" + avatar + bell (p.17, 21, 38) | Nouveau `HelloHeader` en haut du Home (remplace top-bar météo/prière) |
| Search bar pill arrondie | Refonte search bar → `rounded-full h-12` pleine largeur |
| Sections horizontales scrollables (p.17, 37) | Sections catégories → carrousel horizontal scroll-snap au lieu de grilles |
| Cartes produit carrées arrondies (p.21) | `ListingCard` variant `square` : `rounded-3xl`, image carrée, infos compactes |
| Section "Recently viewed" (p.37) | Carrousel "Vus récemment" basé sur `useCoViewedListings` |
| Activity card gradient (p.17) | Carte stats utilisateur connecté (mes annonces / favoris / vues) |

### Fichiers modifiés

| Fichier | Changement |
|---|---|
| `components/account/HelloHeader.tsx` *(nouveau)* | "Hello, {prénom}! 👋" + avatar `h-11 w-11 ring-2 ring-primary/20` + cloche notifications, padding `px-4 pt-5 pb-3` |
| `components/Header.tsx` | Search bar : grid pill `rounded-full h-11`, ville → bouton pill compact, bouton search → cercle `bg-primary`. Suppression top-bar météo/prière (déjà cachée mobile). Logo recentré. |
| `components/ListingCard.tsx` | Ajout prop `variant?: "default" \| "square"`. Variant `square` : `rounded-3xl`, ratio `aspect-square`, badges plus petits, cœur en haut-droite, prix sous l'image (pas overlay). |
| `pages/Index.tsx` | Insérer `HelloHeader` (si user connecté) en haut. Convertir sections catégories en carrousels horizontaux `flex overflow-x-auto snap-x` avec `ListingCard variant="square"`. Garder "Pour vous / Récents" en grille 2-col mobile. Conserver `PublishCTA` et `CategoryGrid`. Retirer le widget Estimateur de Prix (hors design Shoppe, déjà signalé "hors périmètre"). |
| `i18n/translations.ts` | Ajout : `home.hello`, `home.greetingMorning/Afternoon/Evening`, `home.recentlyViewed`, `home.discover` |

### Détails design

- **HelloHeader** : "Hello, Ahmed 👋" en `text-xl font-extrabold`, sous-titre "Que cherchez-vous aujourd'hui ?" `text-xs text-muted-foreground`. Avatar à droite, cliquable → `/compte`. Cloche avec badge unread.
- **Search bar Shoppe** : input `rounded-full bg-muted h-11 pl-11`, icône loupe absolue à gauche, bouton ville pill compact `rounded-full h-9 px-3 bg-muted` au-dessus.
- **ListingCard square** : `rounded-3xl overflow-hidden bg-card`, image `aspect-square`, cœur cercle blanc en overlay top-right, footer texte sous image avec titre 1 ligne + prix `font-extrabold text-primary`.
- **Carrousel** : `flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-3 px-3`, chaque carte `w-[140px] shrink-0 snap-start`.
- **Section header** : titre `text-base font-extrabold` + bouton "Voir tout →" pill `text-xs text-primary`.

### Hors périmètre

- Pas de modification de `CategoryGrid` (déjà cohérent avec design mobile-first).
- Pas de changement de la logique de fetch (`useListings`, `useCoViewedListings`).
- Pas de Listing Detail / Publish / Search redesign (peuvent suivre en phase 4 si demandé).
- Le top-bar météo/prière desktop reste en place pour les écrans `sm:` ; seul l'affichage mobile change.

### Validation

Screenshot du `/` en viewport mobile (384×654) après implémentation pour comparer avec écrans Shoppe p.17, 21, 37.
