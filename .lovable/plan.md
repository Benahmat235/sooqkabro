

## Plan : Corrections de stabilité et optimisation

### Problèmes identifiés et corrections

#### 1. Build error — `whatsapp-otp/index.ts` (ligne 269)
L'API Supabase Admin utilise `updateUserById(id, { password })` et non `updateUser(id, { password })`. Comme l'auth WhatsApp a été dépréciée, la solution la plus simple est de **supprimer entièrement la fonction edge `whatsapp-otp`** (elle n'est plus utilisée dans l'UI).

#### 2. Nom de marque — harmoniser en "SooqKabro"
- **Header.tsx** : Remplacer `Tchad<span>Market</span>` par `Sooq<span>Kabro</span>` et le logo `TC` par `SK`
- **Footer.tsx** : Idem — `SooqKabro` partout, copyright inclus
- **Header aria-label** : `SooqKabro - Accueil`

#### 3. N+1 requêtes dans `useListings.ts`
Remplacer les N requêtes individuelles `listing_views` par une **seule requête groupée** avec `supabase.rpc` ou un `GROUP BY` :
```
SELECT listing_id, COUNT(*) as view_count 
FROM listing_views 
WHERE listing_id IN (...ids) 
GROUP BY listing_id
```
Cela nécessite une **fonction RPC** car le SDK JS ne supporte pas `GROUP BY` directement. Alternative : utiliser `.in("listing_id", ids)` et compter côté client.

#### 4. Pagination dans `useListings`
Ajouter `.range(0, 49)` (50 annonces par page) à la requête de base, avec un paramètre `page` optionnel. Pour l'instant, limiter à 50 résultats pour la page d'accueil et Discover.

#### 5. Header et Footer non fixés
- **Header** : Retirer `sticky top-0 z-50` → utiliser juste `relative` (scroll normal avec la page)
- **Footer** : Retirer `pb-24` du footer (qui compensait le BottomNav). Le footer doit scroller normalement avec le contenu. Le `pb-24` reste sur le conteneur principal des pages pour le BottomNav mobile.

#### 6. Variables d'env
Le fichier `.env` est auto-géré par Lovable Cloud — il contient des clés publiques (anon key). Aucune action nécessaire, ces clés sont **publiques par design** (clé anon Supabase).

### Fichiers impactés

| Fichier | Modification |
|---|---|
| `supabase/functions/whatsapp-otp/index.ts` | Supprimer la fonction entière |
| `src/hooks/useListings.ts` | Requête groupée + pagination (limit 50) |
| `src/components/Header.tsx` | Renommer en SooqKabro + retirer `sticky top-0` |
| `src/components/Footer.tsx` | Renommer en SooqKabro + retirer padding excessif |
| `src/pages/Index.tsx` | Vérifier que le conteneur garde `pb-24` pour BottomNav |
| `src/pages/DiscoverPage.tsx` | Idem — vérifier `pb-24` |

