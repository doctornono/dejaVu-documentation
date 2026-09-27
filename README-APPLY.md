# DejaVu API docs — phase 2

Ce patch complète le réalignement de la documentation API v1.

## Modifications

- suppression de la page orpheline `api-reference/collection/batch-add-to-collection` de la navigation ;
- remplacement des éléments de démarrage Mintlify restants ;
- ajout d’une page d’authentification dédiée ;
- nettoyage des liens navbar `Support` / `dashboard.mintlify.com` ;
- ajout de `scripts/validate-api-docs.mjs` pour vérifier automatiquement la navigation et les invariants OpenAPI.

## Application

Copier les fichiers du dossier dans `dejaVu-documentation`, puis supprimer :

`api-reference/collection/batch-add-to-collection.mdx`

Ensuite :

```bash
node scripts/validate-api-docs.mjs
```

Puis lancer Mintlify et vérifier la navigation avant le push.

## Point important

Les écritures GitHub directes étaient bloquées dans cette session par l’intégration GitHub (HTTP 403). Le dépôt n’est donc pas présenté comme modifié à distance.
