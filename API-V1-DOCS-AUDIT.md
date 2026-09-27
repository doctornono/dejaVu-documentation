# Audit de la documentation API v1 — DejaVu

## État du contrat

Le dépôt documente actuellement :

- **24 routes**
- **39 opérations**
- **29 schémas OpenAPI**
- une référence française et une référence anglaise
- une authentification par `x-api-key` ou Bearer pour les opérations protégées
- un Device Flow avec ses endpoints publics et son endpoint d’approbation par session navigateur
- les intégrations Connectors et Kodi
- les opérations Channels et Media

L’ancien endpoint `/collection/batch` est absent du contrat et de la navigation.

## Parité FR / EN

La validation automatique vérifie que :

- les deux OpenAPI existent et sont valides ;
- les ensembles d’opérations sont identiques ;
- les ensembles de schémas sont identiques ;
- la version OpenAPI et la version de l’API sont identiques ;
- les 39 opérations disposent d’une page FR et d’une page EN ;
- les références `openapi:` des pages correspondent aux opérations du contrat.

## Structure documentaire

La navigation est limitée à la référence API :

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

Les anciens contenus du starter Mintlify ont été supprimés lorsqu’ils n’étaient pas utilisés par la documentation DejaVu.

## Validation

Commande locale :

```bash
node scripts/validate-api-v1-docs.mjs
```

CI :

```text
.github/workflows/validate-api-v1-docs.yml
```

Le workflow est déclenché sur les pushes vers `main` et les pull requests.

## Règle de maintenance

Lorsqu’un endpoint évolue, mettre à jour dans cet ordre :

1. comportement réel et tests dans le dépôt DejaVu ;
2. OpenAPI canonique ;
3. OpenAPI anglais ;
4. pages FR ;
5. pages EN ;
6. validation locale ;
7. CI.

Cet audit décrit l’état documentaire ; il ne remplace pas les tests fonctionnels de l’API dans le dépôt DejaVu.
