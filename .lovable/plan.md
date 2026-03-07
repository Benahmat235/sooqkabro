

## Plan : Intégration de 3 APIs (Numverify, IP Geolocation, Cloudinary)

### 1. Vérification de téléphone (Numverify)

**Approche** : Créer une Edge Function `validate-phone` qui appelle l'API Numverify côté serveur. Appel déclenché en `onBlur` du champ téléphone.

- **Secret requis** : `NUMVERIFY_API_KEY` (à demander à l'utilisateur via le tool `add_secret`)
- **Edge Function** `supabase/functions/validate-phone/index.ts` : reçoit `{ phone }`, appelle `http://apilayer.net/api/validate?access_key=...&number=...&country_code=TD`, retourne `{ valid, carrier, line_type }`
- **UI** : Ajouter un état `phoneValid: null | boolean` + indicateur visuel (coche verte / croix rouge) à côté du champ téléphone dans :
  - `AuthPage.tsx` (inscription)
  - `PublishListing.tsx` (publication)
- Bloquer la soumission si `phoneValid === false`

### 2. Géolocalisation IP (ip-api.com)

**Approche** : Appel client-side gratuit à `http://ip-api.com/json/?fields=city` au chargement de la page d'accueil. Pas besoin de clé API.

- **Fichier** : Créer un hook `src/hooks/useGeoLocation.ts` qui fetch l'API et mappe la ville retournée vers un `city.id` de `cities.ts`
- **Index.tsx** : Utiliser le hook pour initialiser `selectedCity` avec la ville détectée au lieu de `"all"`, tout en permettant le changement manuel
- Mapping `ip-api city name` → `cities.id` (ex: "N'Djamena" → "ndjamena", "Moundou" → "moundou")
- Fallback silencieux sur `"all"` si l'API échoue

### 3. Optimisation d'images (Cloudinary)

**Approche** : Edge Function `upload-image` qui reçoit l'image, l'envoie à Cloudinary via l'Upload API, et retourne l'URL optimisée.

- **Secrets requis** : `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- **Edge Function** `supabase/functions/upload-image/index.ts` :
  - Reçoit l'image en `multipart/form-data` ou base64
  - Upload vers Cloudinary avec transformations (`w_800,c_limit,q_auto,f_auto`)
  - Retourne l'URL optimisée `secure_url`
- **PublishListing.tsx** : Remplacer l'upload direct vers le storage par un appel à la Edge Function. Afficher un spinner par photo pendant le traitement
- **ListingCard.tsx / ListingDetail.tsx** : Les images seront automatiquement optimisées car les URLs stockées en DB seront déjà des URLs Cloudinary avec transformations
- Le bucket `listing-photos` existant ne sera plus utilisé pour les nouvelles images

### Ordre d'exécution

1. Demander les secrets API (Numverify + Cloudinary) — **bloquant**
2. Implémenter la géolocalisation IP (aucun secret nécessaire)
3. Implémenter la validation téléphone (après réception du secret)
4. Implémenter Cloudinary (après réception des secrets)

### Fichiers impactés

| Fichier | Modification |
|---|---|
| `supabase/functions/validate-phone/index.ts` | Nouveau — validation Numverify |
| `supabase/functions/upload-image/index.ts` | Nouveau — upload Cloudinary |
| `supabase/config.toml` | Ajouter les 2 nouvelles fonctions |
| `src/hooks/useGeoLocation.ts` | Nouveau — détection ville par IP |
| `src/pages/Index.tsx` | Utiliser `useGeoLocation` pour `selectedCity` |
| `src/pages/AuthPage.tsx` | Ajout validation téléphone avec indicateur visuel |
| `src/pages/PublishListing.tsx` | Validation téléphone + upload via Cloudinary |

