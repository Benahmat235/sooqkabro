## Plan : Activer les fonctionnalites reelles sur les profils (vendeur + mon compte)

### Problemes actuels


| Fonctionnalite              | Etat actuel                     | Correction                                                       |
| --------------------------- | ------------------------------- | ---------------------------------------------------------------- |
| Statut en ligne / last_seen | Simule avec `Math.random()`     | Colonne `last_seen` dans profiles, mise a jour a chaque activite |
| Bio                         | Hardcode `null`                 | Colonne `bio` dans profiles                                      |
| Abonnes (followers)         | localStorage uniquement         | Table `seller_followers` dans la base de donnees                 |
| Taux de reponse             | Calcul reel mais fallback a 95% | Garder le calcul reel, retirer le fallback fictif                |
| Delai de reponse            | Hardcode "< 1h"                 | Calculer a partir des timestamps des messages                    |


### 1. Migration base de donnees

**Ajouter colonnes a `profiles**` :

```sql
ALTER TABLE profiles ADD COLUMN last_seen TIMESTAMPTZ DEFAULT now();
ALTER TABLE profiles ADD COLUMN bio TEXT;
```

**Creer table `seller_followers**` :

```sql
CREATE TABLE seller_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(seller_id, follower_id)
);
ALTER TABLE seller_followers ENABLE ROW LEVEL SECURITY;
-- SELECT: public (pour compter)
-- INSERT: auth.uid() = follower_id
-- DELETE: auth.uid() = follower_id
```

### 2. Refonte `useSellerStats.ts`

- Lire `last_seen` et `bio` depuis profiles (ajouter ces colonnes au SELECT)
- Calculer `isOnline` : `last_seen > now() - 5 minutes`
- Calculer le delai de reponse moyen reel :
  - Pour chaque conversation du vendeur, trouver le premier message du vendeur apres le premier message de l'acheteur
  - Calculer la difference moyenne et formater ("< 1h", "< 30min", "2h", etc.)
- Retirer le fallback `responseRate || 95` → afficher 0% si aucune conversation

### 3. Refonte `useSellerFollowers.ts`

Remplacer localStorage par Supabase :

- `followerCount` : `supabase.from("seller_followers").select("id", { count: "exact" }).eq("seller_id", sellerId)`
- `isFollowing` : `supabase.from("seller_followers").select("id").eq("seller_id", sellerId).eq("follower_id", user.id).maybeSingle()`
- `toggleFollow` : INSERT ou DELETE dans `seller_followers`

### 4. Hook `useUpdateLastSeen`

Nouveau hook leger appele dans `App.tsx` :

- Met a jour `profiles.last_seen = now()` toutes les 60 secondes quand l'utilisateur est actif
- Ecoute `visibilitychange` pour mettre a jour a chaque retour sur l'onglet

### 5. Mise a jour `AccountPage.tsx`

- Afficher le taux de reponse reel et le delai moyen dans les stats
- Afficher le nombre d'abonnes reel (depuis `useSellerFollowers(user.id)`)
- Afficher le statut "En ligne" / "Derniere connexion il y a Xh" depuis `last_seen`
- Ajouter un champ bio dans le formulaire d'edition du profil

### 6. Mise a jour `SellerProfile.tsx`

- Les stats cards utilisent deja `sellerStats` et `followersData` → rien a changer dans le JSX
- Le passage aux donnees reelles se fait via les hooks refactures

### Fichiers impactes


| Fichier                           | Modification                                               |
| --------------------------------- | ---------------------------------------------------------- |
| Migration SQL                     | `last_seen`, `bio` sur profiles + table `seller_followers` |
| `src/hooks/useSellerStats.ts`     | Lire `last_seen`/`bio`, calculer delai reel                |
| `src/hooks/useSellerFollowers.ts` | Remplacer localStorage par Supabase                        |
| `src/hooks/useUpdateLastSeen.ts`  | Nouveau — ping `last_seen` toutes les 60s                  |
| `src/App.tsx`                     | Appeler `useUpdateLastSeen()`                              |
| `src/pages/AccountPage.tsx`       | Afficher abonnes, bio editable, delai reel                 |
