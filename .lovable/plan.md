

## Plan : Upgrade majeur de SooqKabro — UI Pro, Filtres avancés, Multilingue, Confiance

### Phase 1 : Multilinguisme (FR / EN / Arabe tchadien)

**Approche** : Créer un système i18n léger sans dépendance externe.

1. **Créer `src/i18n/translations.ts`** — Objet avec clés `fr`, `en`, `ar` contenant toutes les chaînes UI (200+ entrées : navigation, boutons, messages, catégories, filtres, auth, etc.)
2. **Créer `src/i18n/useTranslation.ts`** — Hook + Context qui stocke la langue dans `localStorage`, expose `t("key")` et `setLanguage()`
3. **Créer `src/i18n/LanguageSwitcher.tsx`** — Sélecteur compact (FR/EN/عربي) pour le Header
4. **Ajouter le support RTL** — Quand `ar` est sélectionné, ajouter `dir="rtl"` sur `<html>` et ajuster Tailwind (`rtl:` variants)
5. **Migrer toutes les pages** — Remplacer les chaînes hardcodées par `t("key")` dans : Index, AuthPage, SearchPage, CategoryPage, ListingDetail, PublishListing, AccountPage, MessagesPage, Footer, Header, BottomNav, ContactActions

### Phase 2 : Filtres avancés

6. **Enrichir `CategoryPage.tsx`** — Ajouter :
   - Filtre par quartier (dropdown dynamique basé sur la ville sélectionnée, utilisant `cities.ts`)
   - Tri par popularité (vues)
   - Filtre "Vendeurs vérifiés uniquement" (toggle)
   - Filtre par date (Aujourd'hui, 7 jours, 30 jours)
7. **Enrichir `SearchPage.tsx`** — Ajouter le même panneau de filtres (prix min/max, quartier, tri, catégorie)
8. **Créer `src/components/FilterPanel.tsx`** — Composant réutilisable avec tous les filtres, utilisé par CategoryPage et SearchPage

### Phase 3 : Auth — Ajouter Apple Sign-In

9. **Ajouter Apple OAuth** sur `AuthPage.tsx` — Bouton "Continuer avec Apple" utilisant `lovable.auth.signInWithOAuth("apple")` (géré nativement par Lovable Cloud)
10. **Supprimer l'auth par téléphone SMS** — Retirer les vues `phone` et `phone-otp` de AuthPage (conserver uniquement Email + Google + Apple)

### Phase 4 : Améliorations UI/UX professionnelles

11. **Refonte ListingCard** — Ajouter badge "Vendeur vérifié" plus visible, animation de chargement d'image (blur-up), meilleur espacement
12. **Améliorer la Hero Section** — Ajouter des statistiques dynamiques ("X annonces actives", "Y villes"), animation subtile
13. **Améliorer le Footer** — Ajouter sélecteur de langue, liens vers les catégories principales, icônes réseaux sociaux
14. **Améliorer la page de détail** — Bouton de partage natif (`navigator.share`), galerie avec thumbnails, affichage de la carte de localisation (statique)
15. **Bouton Favoris dans le BottomNav** — Remplacer l'icône "Messages" par un cœur ou ajouter un 6e item "Favoris" avec badge

### Phase 5 : Système de confiance renforcé

16. **Améliorer les avis vendeur** — Afficher la note moyenne directement sur le `ListingCard`, ajouter un résumé des avis (barres de progression 1-5 étoiles) sur la page de détail
17. **Badge de confiance enrichi** — Afficher "Vérifié", "X avis positifs", "Membre depuis X" de manière plus proéminente

### Fichiers impactés

| Fichier | Action |
|---|---|
| `src/i18n/translations.ts` | Nouveau — dictionnaire FR/EN/AR |
| `src/i18n/useTranslation.ts` | Nouveau — hook + context |
| `src/i18n/LanguageSwitcher.tsx` | Nouveau — sélecteur de langue |
| `src/components/FilterPanel.tsx` | Nouveau — filtres réutilisables |
| `src/App.tsx` | Wrapper `I18nProvider` |
| `src/pages/AuthPage.tsx` | Apple OAuth + i18n + suppression phone |
| `src/pages/Index.tsx` | i18n + stats dynamiques |
| `src/pages/CategoryPage.tsx` | Filtres avancés + i18n |
| `src/pages/SearchPage.tsx` | Filtres avancés + i18n |
| `src/pages/ListingDetail.tsx` | i18n + partage natif + galerie |
| `src/pages/PublishListing.tsx` | i18n |
| `src/pages/AccountPage.tsx` | i18n |
| `src/components/Header.tsx` | Sélecteur langue + i18n |
| `src/components/Footer.tsx` | Liens catégories + langue + i18n |
| `src/components/BottomNav.tsx` | i18n + favoris |
| `src/components/ListingCard.tsx` | Badge vérifié + blur-up + i18n |
| `src/components/ContactActions.tsx` | i18n |
| `src/index.css` | Styles RTL |

### Details techniques

- **i18n** : Pas de lib externe, contexte React simple avec `Record<string, Record<string, string>>`. La langue `ar` active `dir="rtl"` et les classes Tailwind RTL.
- **Apple Auth** : `lovable.auth.signInWithOAuth("apple", { redirect_uri: window.location.origin })` — géré nativement, aucune configuration nécessaire.
- **Filtres** : Côté client uniquement (les données sont déjà chargées via `useListings`). Filtrage par quartier utilise les données de `cities.ts`.
- **Partage natif** : `navigator.share()` avec fallback copie-lien pour les navigateurs non supportés.

