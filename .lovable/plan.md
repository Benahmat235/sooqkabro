## Phase 2 — Design Shoppe sur les pages existantes

Le PDF couvre 40 écrans Shoppe (Settings hub, Profil, Adresse, Paiements, Langue/Pays/Devise, Activité/Vouchers/Commandes, Chat support, Avis/Notation, Suivi commande, Delete account).

Comme **SooqKabro est une marketplace de petites annonces (pas e-commerce)**, j'adapte le langage visuel Shoppe sans copier les concepts non pertinents (panier, paiements, devises USD, adresse de livraison, vouchers, tracking colis). Je redesigne d'abord les pages existantes qui ont un équivalent direct dans Shoppe, en conservant la palette **SooqKabro** (bleu Tchad, or, Cairo, FCFA, RTL) et les composants pills/blobs créés en phase 1.

### Mapping écrans Shoppe → pages SooqKabro existantes

| Shoppe | Page existante | Action |
|---|---|---|
| Settings hub (p.15-16) | `AccountPage.tsx` — onglet Settings | Refonte liste groupée Personal / Shop / Account |
| Your Profile (p.14) | `AccountPage.tsx` — édition profil | Avatar circulaire + champs pills + "Save Changes" |
| Language (p.5) | Sheet Langue | Liste radio FR/EN/AR style Shoppe |
| Country (p.6) | Sheet Ville (Tchad — 13 villes) | Liste alphabétique avec lettre d'index |
| Delete account (p.2) | Confirm dialog | Modal centré icône ⚠️ + 2 boutons pills |
| Chat / Customer Care (p.23-34) | `MessagesPage.tsx` + détail conversation | Bulles arrondies, header avatar + "Typing...", cartes commande/voucher → cartes **annonce** |
| Rate Service (p.22, 35, 36) | `RateSellerDialog.tsx` | 5 étoiles XL + textarea pill + écran "Done!" |
| My Activity / Hello (p.17, 21, 38, 40) | `AccountPage.tsx` — header + onglet Stats | Header "Hello, {prénom}!" + carte stats mensuelle + carrousel "Vus récemment" |
| Order History / Recently viewed (p.37) | `FavoritesPage.tsx` + section "Vus récemment" | Liste verticale avec image carrée + titre + référence annonce |

### Écrans Shoppe **ignorés** (hors périmètre marketplace)
- Shipping Address (p.7-8), Payment Methods (p.9-13), Edit/Add Card, Currency USD/EUR, Vouchers (p.18-20), Sizes US/EU/UK, Order tracking colis (p.39).

### Nouveaux composants UI partagés

| Fichier | Rôle |
|---|---|
| `components/ui/section-list.tsx` | Liste groupée style iOS (titre section + items chevron) — réutilisé Settings & Account |
| `components/ui/list-item.tsx` | Ligne "label + valeur + chevron" cliquable |
| `components/chat/ChatBubble.tsx` | Bulle message arrondie (variant sent/received) avec timestamp |
| `components/chat/ChatHeader.tsx` | Header avatar + nom + statut "Typing…/En ligne" + back |
| `components/chat/ListingCardInChat.tsx` | Carte annonce intégrée dans la conversation (remplace voucher/order Shoppe) |
| `components/account/ActivityCard.tsx` | Carte stats mensuelle dégradée (vues / messages / favoris reçus) |
| `components/account/HelloHeader.tsx` | Header "Hello, {prénom}!" + avatar + cloche notifications |
| `components/RatingDoneScreen.tsx` | État succès "Merci pour votre avis" 5 étoiles animées |

### Fichiers modifiés

| Fichier | Changement |
|---|---|
| `pages/AccountPage.tsx` | Refonte complète : `HelloHeader` + onglet **Activité** (ActivityCard + Vus récemment + Mes annonces récentes) + onglet **Paramètres** (SectionList groupée Personal/Shop/Account) ; remplace les 4 boutons actuels |
| `pages/MessagesPage.tsx` | Liste conversations style Shoppe (avatar + last message + timestamp + badge unread) ; vue détail conversation = `ChatHeader` + `ChatBubble[]` + composer pill |
| `components/RateSellerDialog.tsx` | Refonte étoiles XL + textarea "Say it!" + écran final "Done!" |
| `pages/FavoritesPage.tsx` | Restyle header pill + grille cartes carrées arrondies |
| `pages/EditListing.tsx` | Champs pills + bouton "Save Changes" full-width (cohérence form Shoppe) |
| `i18n/translations.ts` | Ajout clés: `account.hello`, `account.activity`, `chat.typing`, `chat.online`, `rating.done`, `rating.thanks`, `settings.personal`, `settings.shop`, `settings.account`, `settings.deleteWarning` |

### Détails design Shoppe → SooqKabro

- **SectionList** : fond `bg-card`, padding `px-5 py-4`, titre section uppercase `text-[11px] text-muted-foreground tracking-wider`, séparateurs `border-b border-border/40`, chevron `lucide ChevronRight`.
- **Bulles chat** : `rounded-3xl px-4 py-2.5`, sent = `bg-primary text-primary-foreground rounded-br-md`, received = `bg-muted rounded-bl-md`. Timestamp `text-[10px] text-muted-foreground` sous chaque groupe.
- **Composer chat** : input pill `h-12 rounded-full bg-muted` + icônes pièce-jointe/emoji à gauche + bouton send circulaire `bg-primary`.
- **Rate dialog** : 5 étoiles `h-10 w-10` cliquables avec animation `scale + fill` au tap, textarea `rounded-3xl min-h-[120px] p-4 bg-muted`, bouton "Next" pill full-width.
- **Delete account confirm** : `AlertDialog` centré, icône warning dans cercle `bg-destructive/10`, 2 boutons `flex-1` pills (Cancel outline + Delete destructive).
- **HelloHeader** : padding généreux `px-5 pt-6 pb-4`, avatar `h-12 w-12 ring-2 ring-primary/20`, titre `text-2xl font-extrabold`, sous-titre date du jour.
- **ActivityCard** : `rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 p-5`, grille 3 colonnes (Vues / Messages / Favoris), grand chiffre `text-3xl font-extrabold text-primary`.

### Hors périmètre

- Pas de Home/Listing detail/Categories/Search/Publish — ces écrans sont déjà refondus ou seront traités en phase ultérieure (sur demande).
- Pas de paiement/panier/livraison/vouchers — non applicable au modèle marketplace P2P.
- Pas de modification de la logique métier (RLS, hooks, edge functions).

### Validation

Après implémentation : screenshots des 4 routes refondues (`/compte`, `/messages`, `/favoris`, dialog rating ouvert) pour comparer avec les pages Shoppe correspondantes.
