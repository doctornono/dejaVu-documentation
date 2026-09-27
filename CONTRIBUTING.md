# Contribuer à la documentation dejaVu API

Merci de contribuer à la documentation de l’API dejaVu v1.

## Avant de modifier une page

Vérifiez le comportement réel de l’endpoint concerné dans le dépôt dejaVu et utilisez `api-reference/openapi.json` comme contrat documentaire.

Une modification d’API doit être répercutée de façon cohérente dans :

1. l’OpenAPI canonique français ;
2. l’OpenAPI anglais ;
3. la page endpoint française ;
4. la page endpoint anglaise.

## Développement local

Installer Mintlify :

```bash
npm install -g mint
```

Lancer l’aperçu :

```bash
mint dev
```

## Validation obligatoire

Avant de pousser :

```bash
node scripts/validate-api-v1-docs.mjs
```

La validation contrôle la parité du contrat OpenAPI, la navigation FR/EN et la correspondance entre opérations et pages.

## Règles de rédaction

- Décrire le comportement réellement implémenté.
- Utiliser les noms techniques exacts de l’API.
- Ne pas traduire les routes, `operationId`, noms de propriétés, enums ou exemples techniques.
- Garder les explications concises.
- Fournir des exemples utiles lorsque le comportement le nécessite.
- Ne jamais publier de clé API ou de donnée utilisateur réelle.

## Pull requests

Une pull request doit indiquer clairement :

- les endpoints ou schémas concernés ;
- si le contrat OpenAPI a changé ;
- si les versions FR et EN ont été mises à jour ;
- le résultat de la validation locale.

Les changements purement documentaires restent compatibles avec le contrat existant ; les changements de contrat doivent être justifiés par le comportement de l’API.
