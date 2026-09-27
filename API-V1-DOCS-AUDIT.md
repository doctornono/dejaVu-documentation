# Audit documentation API v1 — DejaVu

## État vérifié

La documentation API v1 a maintenant été réalignée sur le contrat OpenAPI présent dans ce dépôt.

### Contrat OpenAPI

`api-reference/openapi.json` contient actuellement :

- **24 chemins**
- **39 opérations**
- **29 schémas**
- aucune référence `$ref` vers un schéma inexistant
- authentification par `ApiKeyHeader` et `BearerAuth`
- déclaration `security` explicite sur chaque opération
- cinq opérations publiques du Device Flow / Connectors sans authentification API

Les endpoints couverts comprennent notamment :

- Device Flow : code, token, verify, approve, QR
- collection
- history
- favorites
- ratings
- watchlist
- scrobble
- upnext
- dashboard
- lists et items
- profile `/me`
- channels
- connectors et soumission
- Kodi import
- media resolve/status

L'ancien endpoint `/collection/batch` n'est plus présent dans l'OpenAPI.

### Navigation Mintlify

La navigation API reference couvre les groupes :

- Introduction
- Auth
- Collection
- History
- Favorites
- Ratings
- Watchlist
- Scrobble
- Up Next
- Dashboard
- Lists
- User
- Media
- Channels
- Connectors
- Kodi

La page obsolète `collection/batch-add-to-collection` a été retirée de la navigation.

### Authentification documentée

La documentation utilise désormais :

- `x-api-key`
- `Authorization: Bearer`

La query string `api_key` n'est pas documentée comme mécanisme d'authentification.

Le Device Flow est documenté comme un flux en plusieurs étapes : création du device code, présentation du code/QR, approbation, échange contre un token, puis utilisation du token.

## Outil de synchronisation

`scripts/sync-api-v1-docs.mjs` reste l'outil de mise à jour du contrat et des pages lorsque l'API évolue.

## Validation automatique

`scripts/validate-api-v1-docs.mjs` vérifie :

- la validité JSON de l'OpenAPI et de `docs.json`
- la présence d'un `operationId` et de réponses pour chaque opération
- la présence d'une déclaration `security` explicite
- les security schemes `ApiKeyHeader` et `BearerAuth`
- l'absence de `/collection/batch`
- l'existence de chaque page référencée dans la navigation
- la correspondance bidirectionnelle OpenAPI ↔ pages Mintlify
- l'égalité du nombre d'opérations OpenAPI et de pages endpoint

## CI

`.github/workflows/validate-api-v1-docs.yml` exécute automatiquement cette validation sur :

- chaque push vers `main`
- chaque pull request vers `main`

## Prochaines vérifications

1. Laisser GitHub Actions exécuter la validation.
2. Vérifier le résultat du workflow.
3. Lancer un build Mintlify local ou depuis l'environnement de documentation.
4. Vérifier les exemples de requêtes avec une clé de test.
5. Compléter ensuite les guides pratiques FR/EN autour de l'API v1.

## Sources de vérité

L'alignement doit rester piloté par :

1. les routes réelles `app/api/v1/**/route.ts` du dépôt DejaVu ;
2. les tests d'intégration API v1 ;
3. `api-reference/openapi.json` comme contrat documentaire ;
4. les pages Mintlify et leur validation CI.

L'objectif est d'éviter toute divergence entre comportement réel, contrat OpenAPI et documentation publique.