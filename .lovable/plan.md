
## Objectif

Appliquer le langage visuel des 12 écrans Shoppe à la phase d'inscription/onboarding, en gardant la palette SooqKabro existante (bleu Tchad, sable, Cairo).

## Langage visuel à reproduire

- Grandes formes organiques (blobs) bleu primary + bleu clair (accent) en haut/coin de l'écran
- Titres très larges (text-5xl/6xl) en Cairo bold, alignés à gauche
- Inputs pilule (rounded-full), fond muted, sans bordure, h-14, padding généreux
- Bouton primary pilule pleine largeur, h-14
- Lien "Cancel" texte sous le CTA
- Avatar circulaire blanc-bordé centré comme point focal
- OTP : 4 cases carrées arrondies (rounded-2xl) `bg-muted`
- Carrousel d'onboarding avec dots au bas de l'écran

## Écrans livrés

1. **OnboardingPage** (nouveau, `/onboarding`)
   - Carrousel 2 slides : "Hello" + "Ready?" (images shopping libres)
   - Dots indicator en bas, bouton "Let's Start" → `/auth`
   - Sauté si l'utilisateur a déjà vu (localStorage `sk_onboarded`)
   - Redirection depuis `/` vers `/onboarding` à la 1ère visite (logique dans `App.tsx`)

2. **AuthPage** refonte complète (`/auth`)
   - **Vue Login étape 1** : blob bleu en haut, titre "Login" + "Good to see you back ❤", champ Email pilule, bouton "Next" + "Cancel"
   - **Vue Login étape 2** : avatar de l'user récupéré via email (fallback initiales), "Hello, {name}!!", champ password pilule, bouton flèche → ; "Not you?" pour revenir
   - **Vue Register** : titre "Create Account", upload photo cercle pointillé (Camera icon, drag-drop fichier vers Cloudinary), Email, Password (avec œil), Téléphone avec drapeau 🇹🇩 (+235 préfixe lock), bouton "Done"
   - **Vue Forgot** : "Password Recovery" + avatar, message "How would you like to restore your password?" — **uniquement option Email** (constraint mémoire : pas de SMS) sous forme de carte pilule sélectionnée, bouton "Next" envoie reset password
   - Boutons Google & Apple conservés en haut (style outline pilule), divider "or"

3. **ResetPassword** (`/reset-password`) restylé
   - Avatar en haut, titre "Setup New Password", sous-titre, 2 champs pilule (password / confirmer), bouton "Save"

## Détails techniques

- Nouveau composant `<AuthBlobs />` (SVG décoratif blobs bleu) réutilisable par AuthPage / OnboardingPage / ResetPassword
- Nouveau composant `<PillInput />` wrapper de `Input` avec classes pilule h-14 muted, slot icône droite
- Nouveau composant `<PillButton />` (variant CVA dans `button.tsx`) `rounded-full h-14`
- Carrousel onboarding via `embla-carousel-react` (déjà installé via shadcn carousel)
- Étape Login 2 : appel à RPC légère `get_public_profile_by_email(email)` → renvoie `display_name + avatar_url` ; **à créer en SECURITY DEFINER avec rate-limit côté client (3/min)** pour éviter l'énumération brute. Si pas trouvé, affiche fallback "Hello !".
- Constraints respectés : aucun SMS, palette bleu Tchad + or préservée, Cairo, RTL ok (les blobs miroir via `rtl:scale-x-[-1]`)

## Fichiers touchés

- `frontend/src/pages/OnboardingPage.tsx` (nouveau)
- `frontend/src/pages/AuthPage.tsx` (refonte)
- `frontend/src/pages/ResetPassword.tsx` (restyle)
- `frontend/src/components/auth/AuthBlobs.tsx` (nouveau)
- `frontend/src/components/auth/PillInput.tsx` (nouveau)
- `frontend/src/components/ui/button.tsx` (ajout variant `pill`)
- `frontend/src/App.tsx` (route `/onboarding` + redirection 1ère visite)
- `frontend/src/i18n/translations.ts` (clés onboarding + 2-step login)
- 1 migration SQL : RPC `get_public_profile_by_email(email text)` SECURITY DEFINER
- 2 images d'onboarding : générées via imagegen (femmes shopping, fond rose/bleu) → `src/assets/`

## Non inclus (intentionnel)

- Pas d'écran OTP/SMS (interdit par la mémoire projet)
- Pas de clavier custom (les keyboards rendus dans le PDF sont natifs iOS)
- Pas de changement aux pages métier (Home, Listing, Search, etc.) — uniquement la phase d'inscription
