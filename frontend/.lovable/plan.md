

## Plan : Activer les boutons Paramètres + Filtrer les avis par étoiles

### 1. Boutons Paramètres dans AccountPage

Les 4 boutons dans l'onglet "Settings" sont actuellement des `<button>` sans action. Chacun ouvrira un panneau inline (dialog/sheet) :

**Notifications** : Sheet avec des toggles (switch) pour activer/désactiver les alertes par type (Messages, Offres, Favoris, Avis, Abonnés). Stockage dans `localStorage` car pas de table dédiée.

**Langue** : Sheet affichant les 3 langues (Français, English, العربية) avec un radio selector. Au clic, change la langue via le hook `useTranslation` existant. Affiche la langue actuelle dans la description du bouton.

**Sécurité** : Sheet avec deux sections :
- Changer le mot de passe (champ ancien + nouveau + confirmer) via `supabase.auth.updateUser({ password })`
- Méthodes de connexion : affiche les providers liés (email, Google, Apple)

**Aide et support** : Sheet avec une FAQ basique (accordéon avec 5 questions courantes) + lien "Contacter le support" (mailto ou WhatsApp).

### 2. Filtrer les avis par étoiles sur SellerProfile

Dans l'onglet "Avis" du profil vendeur, ajouter une barre de filtres cliquables au-dessus de la liste :
- Chips : "Tous", "5★", "4★", "3★", "2★", "1★"
- Au clic sur un filtre, n'afficher que les avis correspondants
- Le chip actif est mis en surbrillance (bg-primary)
- État géré par un `useState<number | null>` local

### Fichiers impactés

| Fichier | Modification |
|---|---|
| `src/pages/AccountPage.tsx` | Ajouter 4 Sheets pour Notifications, Langue, Sécurité, Aide |
| `src/pages/SellerProfile.tsx` | Ajouter filtre par étoiles dans l'onglet Avis |

