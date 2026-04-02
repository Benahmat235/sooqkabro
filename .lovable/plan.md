

## Plan : Copier les points forts de TipTob + Refonte de l'authentification

### Analyse comparative TipTob vs SooqKabro

| Fonctionnalité | TipTob | SooqKabro | Action |
|---|---|---|---|
| **Catégories avec images** | Images rondes/illustrées par catégorie, scrollable horizontalement | Emojis dans des carrés colorés | Copier : utiliser des images/icônes dans des cercles |
| **Sections par catégorie** | Annonces groupées par catégorie (Electronics, Fashion, Vehicles, Real Estate...) avec "Browse more" | Un seul flux "Annonces récentes" | Copier : ajouter des sections par catégorie populaire |
| **Barre de recherche hero** | Grande barre "Search Anything. Find Everything." + filtre catégorie intégré | Barre de recherche simple dans le header | Copier : ajouter une hero section avec tagline |
| **Page Discover** | Page découverte dédiée | Absent | Copier : ajouter une page Discover |
| **Prix barré + remise** | Affiche ancien prix barré + "10% OFF" | Prix simple | Copier : support prix promotionnel |
| **Bouton "Place Ads" visible** | Bouton orange proéminent dans le header | CTA banner dans le contenu | Copier : ajouter bouton "Publier" dans le header |
| **Footer complet** | Links: Terms, Privacy, Help, catégories | Absent | Copier : ajouter un footer |
| **Auth : Google + Email** | Login/Register standards | WhatsApp OTP uniquement | Refondre : Google, Email, Appel |
| **Multilingue** | English/Français/Arabe | Français uniquement | A noter pour le futur |
| **Favoris dans bottom nav** | Coeur dans la barre du bas | Page favoris existe | Deja fait |

### Travaux a realiser

#### Phase 1 : Refonte de l'authentification (priorite haute)

1. **Supprimer l'authentification WhatsApp OTP**
   - Supprimer l'Edge Function `whatsapp-otp` (ou la garder pour compatibilite mais ne plus l'utiliser dans l'UI)
   - Supprimer la table `otp_codes` ou la laisser inactive
   - Retirer les references Twilio

2. **Ajouter l'authentification Google OAuth**
   - Utiliser le systeme Google OAuth manage de Lovable Cloud (`lovable.auth.signInWithOAuth("google")`)
   - Bouton "Se connecter avec Google" sur la page d'auth

3. **Ajouter l'authentification Email + Mot de passe**
   - Formulaire classique email/mot de passe avec `supabase.auth.signUp()` et `supabase.auth.signInWithPassword()`
   - Verification email standard

4. **Ajouter l'authentification par Appel (Telephone)**
   - Utiliser `supabase.auth.signInWithOtp({ phone })` pour envoyer un SMS/Appel
   - Formulaire de saisie du numero + code OTP

5. **Refaire la page AuthPage.tsx**
   - Vue login : Email/mot de passe + bouton Google + bouton Telephone
   - Vue inscription : Email/mot de passe + bouton Google + bouton Telephone
   - Vue mot de passe oublie : par email (resetPasswordForEmail)
   - Supprimer les vues OTP WhatsApp

#### Phase 2 : Copier les points forts UI de TipTob

6. **Hero section avec tagline**
   - Ajouter "Cherchez. Trouvez. Partout. A tout moment." au-dessus de la barre de recherche
   - Filtre par categorie integre dans la barre de recherche

7. **Ameliorer les icones de categories**
   - Remplacer les emojis par des images/illustrations dans des cercles
   - Rendre le carousel scrollable horizontalement

8. **Sections d'annonces par categorie sur la page d'accueil**
   - Ajouter des sections "Electronique", "Mode", "Vehicules", "Immobilier" avec 4-8 annonces chacune
   - Bouton "Voir plus" par section

9. **Support prix promotionnel**
   - Ajouter champs `original_price` dans la DB (migration)
   - Afficher prix barre + pourcentage de remise sur les cards

10. **Bouton "Publier" dans le header**
    - Ajouter un bouton orange/primary "Publier" visible dans le header

11. **Footer**
    - Ajouter un footer avec liens : Conditions, Confidentialite, Aide, Categories

### Fichiers impactes

| Fichier | Modification |
|---|---|
| `src/pages/AuthPage.tsx` | Refonte complete : Google + Email + Telephone |
| `src/hooks/useAuth.tsx` | Adapter si necessaire pour les nouveaux providers |
| `src/pages/Index.tsx` | Hero section + sections par categorie |
| `src/components/Header.tsx` | Bouton "Publier" |
| `src/components/CategoryGrid.tsx` | Images/illustrations au lieu d'emojis, scroll horizontal |
| `src/components/ListingCard.tsx` | Support prix promotionnel |
| `src/components/Footer.tsx` | Nouveau composant |
| Migration DB | Ajouter `original_price` a la table listings |
| `supabase/functions/whatsapp-otp/` | Deprecie (garde mais non utilise) |

### Details techniques pour l'authentification

- **Google** : `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })`
- **Email** : `supabase.auth.signUp({ email, password })` + `supabase.auth.signInWithPassword({ email, password })`
- **Telephone** : `supabase.auth.signInWithOtp({ phone })` — necessite activation du provider Phone dans Cloud
- **Mot de passe oublie** : `supabase.auth.resetPasswordForEmail(email)` + page `/reset-password`
- Configurer l'auto-confirm email si demande par l'utilisateur (non active par defaut)

