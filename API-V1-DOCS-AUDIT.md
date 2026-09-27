# Audit documentation API v1 — DejaVu

## Constats vérifiés

### Routes actuelles

Le dépôt `doctornono/dejaVu` contient actuellement 24 fichiers `route.ts` sous `app/api/v1/`, couvrant notamment :

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
- media resolve
- media status

### Documentation actuelle

Le `api-reference/openapi.json` du dépôt de documentation décrivait 17 chemins et 32 opérations.

Écarts importants :

1. `/auth/device/qr` absent.
2. `/channels` et `/channels/{id}` absents.
3. `/connectors` et `/connectors/submit` absents.
4. `/kodi/import` absent.
5. `/media/resolve` et `/media/status` absents.
6. `/collection/batch` était encore documenté alors qu'aucune route correspondante n'est présente dans `app/api/v1`.
7. `api_key` en query string était encore déclaré dans OpenAPI alors que l'API v1 actuelle accepte les clés par `x-api-key` ou `Authorization: Bearer`.
8. Le Device Token Flow documentait une enveloppe `success/data` qui ne correspond plus à la réponse réelle.
9. Le Device Token Flow exige maintenant `grant_type` en plus de `device_code`.
10. L'approbation d'un device utilise la session navigateur DejaVu, pas un Bearer API classique.
11. Les listes utilisent `SHARED` plutôt que `FRIENDS`, et le modèle de création accepte `kind`.
12. Les éléments de listes peuvent désormais être de type `episode`.

## Sources de vérité vérifiées

- Routes réelles `app/api/v1/**/route.ts`
- `lib/api-v1-helper.ts`
- tests d'intégration API v1
- `app/admin/api-test/page.tsx`, qui contient déjà un inventaire beaucoup plus complet des endpoints

## Architecture recommandée

```text
API v1
  │
  ├── tests d'intégration
  │
  ├── contrat OpenAPI
  │       ├── Mintlify
  │       └── playground
  │
  └── documentation guides FR/EN
```

Mintlify supporte directement les références OpenAPI interactives et le playground ; conserver l'OpenAPI comme contrat réduit fortement le risque de dérive.

## Correctif fourni

`scripts/sync-api-v1-docs.mjs` :

- supprime `/collection/batch`
- supprime `api_key` comme mécanisme d'authentification
- aligne les security schemes
- corrige le Device Flow
- ajoute QR, Channels, Connectors, Kodi et Media
- corrige les modèles de listes
- ajoute les pages Mintlify manquantes
- met à jour la navigation

## À faire ensuite

1. Exécuter le script dans `dejaVu-documentation`.
2. Vérifier le diff.
3. Lancer le build/dev Mintlify.
4. Tester les exemples contre une clé API de test.
5. Créer ensuite une structure FR/EN propre.
6. Ajouter une génération/validation CI pour empêcher le retour de la dérive.
