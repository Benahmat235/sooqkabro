# SooqKabro Mobile (Flutter)

Application mobile native (Android + iOS) du marketplace SooqKabro pour le Tchad, **partageant entièrement le backend Supabase** du site web (`/app/frontend`).

## ✨ Fonctionnalités implémentées

- 🔐 **Auth** : Connexion / inscription / mot de passe oublié (Supabase Auth)
- 🏠 **Accueil** : Hero, grille de catégories, annonces récentes, pull-to-refresh
- 🧭 **Découvrir** : Feed d'annonces complet
- 🗂️ **Catégories** : 10 catégories avec sous-catégories filtrables
- 🔍 **Recherche** : Recherche debounce avec filtres
- ❤️ **Favoris** : Ajout/retrait, persistance Supabase
- 📝 **Publication** : Wizard mono-page avec upload multi-images (jusqu'à 8), édition d'annonces
- 💬 **Messagerie** : Conversations + temps réel via Supabase Realtime
- 👤 **Compte** : Profil, mes annonces, sélecteur de langue
- 🛡️ **Admin** : Modération (bloquer / activer / supprimer)
- 🌍 **i18n** : FR / EN / AR avec **support RTL natif** pour l'arabe
- 🎨 **Design** : Reproduit fidèlement le design Tailwind du site (palette drapeau du Tchad : bleu, or, terracotta)

## 🏗️ Architecture

```
lib/
├── core/
│   ├── config/        # AppConfig (URL Supabase, clés)
│   ├── i18n/          # Translations + LocaleProvider
│   ├── supabase/      # Client Supabase
│   ├── theme/         # AppTheme, couleurs, spacing
│   ├── utils/         # Formatters (prix FCFA)
│   └── router.dart    # GoRouter (routes protégées)
├── data/              # Categories / Cities statiques
├── models/            # Listing, Profile
├── providers/         # Riverpod (auth, listings, favorites)
├── screens/
│   ├── auth/
│   ├── home/          # Home, Discover, Shell+BottomNav
│   ├── category/
│   ├── search/
│   ├── listing/       # Detail, MyListings, Edit
│   ├── publish/
│   ├── favorites/
│   ├── messages/      # List + Conversation temps réel
│   ├── account/
│   ├── seller/
│   └── admin/
└── widgets/           # ListingCard, ListingCardSkeleton
```

## 🚀 Build & Lancement

> ⚠️ Le container actuel est sur architecture **aarch64 (ARM64)** et les binaires Android SDK distribués par Google sont x86_64. Le build APK doit donc être effectué sur **une machine de développeur (Mac/Linux x86_64/Windows)** ou via **CI/CD**.

### Pré-requis (machine développeur)

- Flutter SDK ≥ 3.41.5 ([install](https://docs.flutter.dev/get-started/install))
- Android Studio (pour Android) ou Xcode (pour iOS, macOS uniquement)
- JDK 17

### Installation des dépendances

```bash
cd /app/mobile
flutter pub get
```

### Lancement en développement

```bash
# Sur émulateur/device Android connecté
flutter run

# Sur simulateur iOS (macOS uniquement)
flutter run -d ios
```

### Build APK Android (release)

```bash
flutter build apk --release
# Output : build/app/outputs/flutter-apk/app-release.apk
```

### Build App Bundle (Google Play)

```bash
flutter build appbundle --release
# Output : build/app/outputs/bundle/release/app-release.aab
```

### Build iOS (macOS uniquement)

```bash
flutter build ios --release
# Puis ouvrir ios/Runner.xcworkspace dans Xcode pour archiver
```

### CI/CD recommandé

GitHub Actions workflow exemple :

```yaml
name: Build Mobile
on: [push, workflow_dispatch]
jobs:
  android:
    runs-on: ubuntu-latest  # x86_64
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: 'temurin', java-version: '17' }
      - uses: subosito/flutter-action@v2
        with: { flutter-version: '3.41.9', channel: 'stable' }
      - run: cd mobile && flutter pub get && flutter build apk --release
      - uses: actions/upload-artifact@v4
        with:
          name: sooqkabro-android
          path: mobile/build/app/outputs/flutter-apk/app-release.apk
```

## 🔧 Configuration Supabase

Les credentials sont en dur dans `lib/core/config/app_config.dart` et **pointent sur le même projet Supabase que le site web** (`bwvtfosrbbkawieanrjd.supabase.co`). Aucune duplication de backend.

Storage bucket attendu : `listings` (public-read).

## 🎨 Système de design

- **Police** : Inter via `google_fonts` (mêmes choix que le web)
- **Couleurs** : portées depuis `/app/frontend/src/index.css` (variables CSS HSL → Color Dart)
- **Composants** : Material 3, thème personnalisé `AppTheme.light()` et `AppTheme.dark()`

## 🌍 Internationalisation

Les traductions sont copiées 1:1 depuis `/app/frontend/src/i18n/translations.ts`. Pour ajouter une clé, modifier les deux fichiers en parallèle.

L'arabe active automatiquement `TextDirection.rtl` au niveau racine.

## ✅ Tests

```bash
flutter test
flutter analyze
```

## 📌 Notes techniques

- **Riverpod 2.x** pour la gestion d'état (auth, listings, favorites)
- **GoRouter** avec redirection auto vers `/auth` sur routes protégées
- **Supabase Realtime** pour les messages (channel `messages:<conv_id>`)
- **CachedNetworkImage** pour le cache des images
- **Image upload** : `image_picker` → upload binaire vers `listings` storage Supabase
