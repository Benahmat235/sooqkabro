

## Plan : Page Découverte + Optimisation des performances

### 1. Page Découverte (`src/pages/DiscoverPage.tsx`)

Nouvelle page `/decouvrir` avec trois sections principales :

- **Annonces mises en avant** : Carrousel horizontal des annonces premium/urgentes (badge `premium` ou `urgent`), avec un design card large et visuellement distinct
- **Collections thématiques** : Sections horizontales scrollables par thème ("Bonnes affaires", "Nouveautés de la semaine", "Populaires près de chez vous"). Chaque collection filtre les listings par critères (prix bas, récentes, vues élevées)
- **Suggestions personnalisées** : Utilise le hook `usePersonalizedFeed` existant pour les utilisateurs connectés, avec fallback sur les annonces populaires pour les anonymes

Navigation : ajouter un lien "Découvrir" dans le `BottomNav` (remplacer ou ajouter à côté de l'icône existante).

### 2. Lazy Loading + Code Splitting (`src/App.tsx`)

Convertir tous les imports de pages en `React.lazy()` + `Suspense` :

```text
Index          → eager (page d'accueil, chargée immédiatement)
DiscoverPage   → lazy
CategoryPage   → lazy
ListingDetail  → lazy
SearchPage     → lazy
PublishListing → lazy
AuthPage       → lazy
AccountPage    → lazy
MyListings     → lazy
EditListing    → lazy
FavoritesPage  → lazy
MessagesPage   → lazy
AdminPage      → lazy
```

Fallback : un spinner centré simple réutilisable.

### 3. Optimisation des images

Améliorer `ListingCard.tsx` et la nouvelle page Discover :
- Ajouter `loading="lazy"` sur toutes les images (déjà en partie fait)
- Utiliser `srcSet` avec des tailles Cloudinary (`w_400` pour les cards, `w_800` pour le détail) si l'URL est Cloudinary
- Ajouter un placeholder blur (fond gris animé en skeleton pendant le chargement)

### Fichiers impactés

| Fichier | Action |
|---|---|
| `src/pages/DiscoverPage.tsx` | Nouveau — page Découverte complète |
| `src/App.tsx` | React.lazy pour toutes les pages + route `/decouvrir` |
| `src/components/BottomNav.tsx` | Ajouter lien "Découvrir" |
| `src/components/ListingCard.tsx` | Optimisation images Cloudinary + blur placeholder |
| `src/i18n/translations.ts` | Clés pour la page Découverte (fr/en/ar) |

