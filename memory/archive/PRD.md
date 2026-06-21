# PRD - SooqKabro Platform Enhancement

## Vision
Transformer SooqKabro en une plateforme de petites annonces professionnelle, sécurisée et intelligente, devenant la référence au Tchad pour le commerce entre particuliers.

## Objectifs Stratégiques
1. **Sécurité & Confiance** : Protéger les données utilisateurs et créer un environnement sûr
2. **Intelligence Artificielle** : Utiliser des algorithmes pour améliorer l'expérience et détecter les fraudes
3. **Expérience Utilisateur** : Interface moderne et fluide qui facilite les transactions
4. **Croissance** : Augmenter l'engagement utilisateur et le nombre de transactions

---

## PHASE 1 : SÉCURITÉ CRITIQUE (Priorité Immédiate)
**Durée estimée : 1-2 sessions**
**Impact : CRITIQUE - Protection des données utilisateurs**

### 1.1 Row Level Security (RLS) - Supabase
- [ ] Activer RLS sur table `otp_codes` avec politique restrictive
- [ ] Sécuriser table `user_roles` (admin uniquement)
- [ ] Implémenter RLS sur `listings` (propriétaires uniquement)
- [ ] Sécuriser `favorites` (utilisateur propriétaire)
- [ ] Protéger `seller_reviews` avec politiques appropriées
- [ ] Sécuriser `listing_images` et `listing_views`
- [ ] Masquer les numéros de téléphone (visible uniquement en conversation)

### 1.2 Rate Limiting & Anti-Spam
- [ ] Rate limiting sur endpoints d'authentification (5 tentatives/IP/5min)
- [ ] Rate limiting sur création d'annonces (10/jour/utilisateur)
- [ ] Rate limiting sur messages (30/heure/utilisateur)
- [ ] Captcha sur inscription et publication
- [ ] Détection de comportements suspects (multiples comptes, spam)

### 1.3 Renforcement Authentification
- [ ] Politique de mot de passe forte (8+ caractères, complexité)
- [ ] Vérification email obligatoire avant publication
- [ ] Invalidation des sessions au changement de mot de passe
- [ ] Logging des événements de sécurité

---

## PHASE 2 : ALGORITHMES INTELLIGENTS
**Durée estimée : 2-3 sessions**
**Impact : ÉLEVÉ - Valeur ajoutée pour utilisateurs**

### 2.1 Système de Recommandations Personnalisées
- [ ] Algorithme collaborative filtering basé sur :
  * Historique de navigation (listing_views)
  * Favoris de l'utilisateur
  * Catégories préférées
  * Localisation géographique
- [ ] Feed personnalisé "Pour Vous" sur page d'accueil
- [ ] Suggestions "Produits Similaires" sur page détail
- [ ] ML: Embedding des annonces pour similarité sémantique

### 2.2 Détection Fraude & Spam Automatique
- [ ] Détection de contenu dupliqué (images + texte)
- [ ] Analyse de patterns suspects :
  * Même téléphone sur multiples comptes
  * Prix anormalement bas (potentiel arnaque)
  * Publication massive en peu de temps
  * Mots-clés spam dans descriptions
- [ ] Système de scoring de confiance vendeur
- [ ] Flags automatiques pour modération admin
- [ ] Blocage temporaire automatique des comptes suspects

### 2.3 Pricing Intelligence
- [ ] Analyse des prix du marché par catégorie/ville
- [ ] Suggestion de fourchette de prix à la publication
- [ ] Alertes "prix trop bas" (potentiel arnaque)
- [ ] Badges "Bon prix" / "Prix élevé" sur annonces
- [ ] Historique des prix par catégorie

### 2.4 Optimisation Classement des Annonces (SEO Interne)
- [ ] Score de qualité des annonces basé sur :
  * Nombre et qualité des photos
  * Complétude de la description
  * Réactivité du vendeur
  * Note vendeur
  * Engagement (vues, favoris, messages)
- [ ] Boost des annonces récentes et actives
- [ ] Pénalité pour annonces anciennes ou inactives
- [ ] Promotion d'annonces de vendeurs vérifiés

### 2.5 Algorithmes Supplémentaires
- [ ] Recherche sémantique intelligente (typo, synonymes)
- [ ] Auto-complétion intelligente basée sur popularité
- [ ] Détection de langue automatique (FR/AR)
- [ ] Compression et optimisation automatique d'images

---

## PHASE 3 : REFONTE UI/UX PROFESSIONNELLE
**Durée estimée : 3-4 sessions**
**Impact : ÉLEVÉ - Expérience utilisateur premium**

### 3.1 Design System & Identité Visuelle
- [ ] Palette de couleurs moderne et cohérente
- [ ] Typographie optimisée (lisibilité mobile)
- [ ] Système d'espacement harmonieux (4px, 8px, 16px, 24px, 32px)
- [ ] Composants UI unifiés (boutons, cards, inputs)
- [ ] Mode sombre professionnel
- [ ] Iconographie cohérente

### 3.2 Animations & Micro-interactions
- [ ] Transitions fluides entre pages (Framer Motion)
- [ ] Loading skeletons pour meilleure perception de vitesse
- [ ] Animations d'apparition des cartes (stagger effect)
- [ ] Feedback visuel sur toutes les actions (boutons, favoris, etc.)
- [ ] Animations de gestures (swipe, pull-to-refresh)
- [ ] Page transitions avec animations natives

### 3.3 Optimisation Mobile-First
- [ ] Touch targets optimisés (minimum 44px)
- [ ] Navigation bottom sheet native
- [ ] Gestes swipe pour navigation rapide
- [ ] Upload photo optimisé (compression, preview)
- [ ] Infinite scroll performant
- [ ] Offline mode basique (cache des données)
- [ ] PWA avec installation possible

### 3.4 Parcours Utilisateurs Optimisés

#### Parcours Publication
- [ ] Wizard multi-étapes avec progression visuelle
- [ ] Auto-save des brouillons
- [ ] Suggestions de catégories intelligentes
- [ ] Upload multiple avec drag & drop
- [ ] Prévisualisation avant publication
- [ ] Templates de description par catégorie

#### Parcours Recherche/Découverte
- [ ] Recherche instantanée (debounced)
- [ ] Filtres avancés avec chips visuels
- [ ] Historique de recherches
- [ ] Recherches sauvegardées avec alertes
- [ ] Cartes interactives pour recherche géographique
- [ ] Quick filters (prix, date, proximité)

#### Parcours Messagerie/Transaction
- [ ] Notifications push temps réel
- [ ] Messages templates pré-remplis ("Disponible?", "Dernier prix?")
- [ ] Partage de localisation sécurisé (rendez-vous)
- [ ] Système d'offres de prix intégré
- [ ] Statuts de transaction (intéressé, négociation, vendu)

### 3.5 Pages & Composants Clés

#### Page d'Accueil
- [ ] Hero section dynamique avec stats plateforme
- [ ] Sections personnalisées selon profil utilisateur
- [ ] Quick actions prominentes (Publier, Rechercher)
- [ ] Catégories populaires avec métriques
- [ ] Témoignages et success stories

#### Page Annonce Détail
- [ ] Galerie photo immersive (zoom, fullscreen)
- [ ] Info vendeur mise en avant (badge vérifié, note)
- [ ] Actions rapides (favoris, partager, signaler)
- [ ] Section "Produits similaires" intelligente
- [ ] Bouton CTA principal bien visible

#### Profil Vendeur
- [ ] Header professionnel (avatar, stats, badges)
- [ ] Onglets (Annonces, Avis, À propos)
- [ ] Graphiques de performance (ventes, réactivité)
- [ ] Bouton "Suivre" avec notifications

---

## PHASE 4 : CONFORMITÉ RGPD & LÉGAL
**Durée estimée : 1-2 sessions**
**Impact : ÉLEVÉ - Conformité légale**

### 4.1 Droit des Utilisateurs
- [ ] Page de confidentialité complète
- [ ] Conditions générales d'utilisation
- [ ] Consentement cookies avec banner
- [ ] Export de données personnelles (format JSON/PDF)
- [ ] Suppression de compte avec confirmation
- [ ] Historique des accès au compte

### 4.2 Protection des Données
- [ ] Chiffrement des données sensibles au repos
- [ ] Anonymisation des données supprimées
- [ ] Logs d'audit pour actions sensibles
- [ ] Politique de rétention des données
- [ ] Notification en cas de breach (template email)

---

## PHASE 5 : FONCTIONNALITÉS AVANCÉES
**Durée estimée : 2-3 sessions**
**Impact : MOYEN-ÉLEVÉ - Différenciation**

### 5.1 Monétisation
- [ ] Annonces sponsorisées (boost)
- [ ] Badges vendeur premium
- [ ] Statistiques avancées pour vendeurs
- [ ] Intégration paiement mobile (si applicable au Tchad)

### 5.2 Community & Trust
- [ ] Système de badges (vendeur actif, fiable, vérifié)
- [ ] Programme de parrainage
- [ ] Points de réputation
- [ ] Signalement avancé avec workflow modération

### 5.3 Analytics & Admin
- [ ] Dashboard admin avec métriques clés
- [ ] Rapports automatisés
- [ ] Outils de modération efficaces
- [ ] A/B testing framework

---

## Métriques de Succès

### Sécurité
- 0 violation de données
- 95%+ des tables avec RLS actif
- Temps de réponse aux incidents < 1h

### Engagement
- +50% temps passé sur plateforme
- +40% taux de publication
- +30% taux de conversion (vue → message)

### Qualité
- Score de qualité annonce > 7/10 en moyenne
- <5% de spam détecté manuellement
- 90%+ satisfaction utilisateur

### Performance
- Page load < 2s
- Time to interactive < 3s
- Core Web Vitals "Good" sur mobile

---

## Stack Technique Additionnel

### Algorithmes & ML
- **Recommandations** : Collaborative filtering, content-based
- **NLP** : Détection spam, extraction mots-clés
- **Vision** : Détection d'images dupliquées (hash perceptuel)
- **Pricing** : Régression linéaire, analyse statistique

### Sécurité
- **Rate Limiting** : Redis + middleware
- **Encryption** : bcrypt pour passwords, AES-256 pour données sensibles
- **Monitoring** : Sentry pour erreurs, logs structurés

### UI/UX
- **Animations** : Framer Motion
- **Charts** : Recharts ou Chart.js
- **Maps** : Leaflet ou Mapbox
- **Image Processing** : Sharp (backend) ou browser-image-compression

---

## Risques & Dépendances

### Risques
1. **Scope creep** : Projet très large, risque de dérive
   - Mitigation : Approche phasée stricte
2. **Performance** : Algorithmes complexes = latence
   - Mitigation : Cache, optimisation, background jobs
3. **Adoption** : Changements UI majeurs peuvent perturber
   - Mitigation : Feature flags, rollout progressif

### Dépendances Externes
- Supabase (auth, database, storage, realtime)
- Services de ML (si nécessaire pour NLP avancé)
- Service de paiement mobile (phase monétisation)

---

## Plan d'Exécution Recommandé

### Sprint 1 (Immédiat) - SÉCURITÉ CRITIQUE
Focus : Protéger les utilisateurs existants
- RLS sur toutes les tables sensibles
- Rate limiting basique
- Masquage des téléphones

### Sprint 2 - ALGORITHMES CORE
Focus : Valeur ajoutée immédiate
- Système de recommandations de base
- Détection spam automatique
- Score de qualité des annonces

### Sprint 3 - UI/UX FOUNDATION
Focus : Nouvelle identité visuelle
- Design system complet
- Refonte page d'accueil
- Animations de base

### Sprint 4 - PARCOURS OPTIMISÉS
Focus : Faciliter les actions clés
- Wizard de publication amélioré
- Recherche optimisée
- Messagerie fluidifiée

### Sprint 5 - ALGORITHMES AVANCÉS
Focus : Intelligence artificielle
- Pricing intelligence
- Optimisation du classement
- Recherche sémantique

### Sprint 6 - MOBILE & PERFORMANCE
Focus : Expérience mobile premium
- PWA
- Optimisations performance
- Offline mode

### Sprint 7 - RGPD & LÉGAL
Focus : Conformité
- Export/suppression de données
- Pages légales
- Audit de sécurité

### Sprint 8 - POLISH & LAUNCH
Focus : Finitions
- Tests utilisateurs
- Corrections bugs
- Documentation
- Communication du lancement

---

## Notes d'Implémentation

### Approach Technique
1. **Backend** : Continuer avec Supabase comme source de vérité
2. **FastAPI** : Utiliser pour algorithmes lourds (ML, pricing, recommendations)
3. **Frontend** : React avec optimisations progressives
4. **Cache** : Redis pour rate limiting et cache algorithmes

### Ordre de Priorité (si scope réduit nécessaire)
1. ⭐⭐⭐ MUST HAVE : Sécurité (RLS, rate limiting)
2. ⭐⭐⭐ MUST HAVE : Recommandations de base
3. ⭐⭐ SHOULD HAVE : Refonte UI/UX
4. ⭐⭐ SHOULD HAVE : Détection fraude
5. ⭐ NICE TO HAVE : Pricing intelligence
6. ⭐ NICE TO HAVE : RGPD complet

---

## Prochaines Étapes Immédiates

1. ✅ Validation du plan avec le client
2. ⏭️ Démarrage Phase 1 : Sécurité Critique
3. ⏭️ Configuration de l'environnement pour algorithmes
4. ⏭️ Tests de chaque phase avant passage à la suivante
