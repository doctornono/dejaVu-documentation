# dejaVu API Documentation

Documentation officielle de l’API publique **dejaVu v1**.

dejaVu est un service de suivi de films et séries. Cette documentation décrit le contrat HTTP public permettant d’intégrer dejaVu dans des applications, extensions et clients comme Kodi.

## Contenu

- **API Reference** : 39 opérations réparties sur 24 routes.
- **OpenAPI** : contrat canonique disponible en français et en anglais.
- **Authentification** : clés API et Device Flow.
- **Intégrations** : connecteurs navigateur et import Kodi.
- **Médias** : résolution d’identifiants et récupération des statuts utilisateur.

La documentation est disponible en **français** et en **anglais**.

## Contrat OpenAPI

Le fichier de référence français est :

`api-reference/openapi.json`

La version anglaise est :

`en/api-reference/openapi.json`

Les deux contrats doivent conserver exactement le même ensemble d’opérations et de schémas. Les identifiants techniques, routes, `operationId`, propriétés et valeurs d’exemple restent inchangés entre les langues.

## Développement local

Le site utilise [Mintlify](https://mintlify.com/) comme moteur de documentation.

Installer la CLI :

```bash
npm install -g mint
```

Lancer l’aperçu local depuis la racine du dépôt :

```bash
mint dev
```

## Validation

La validation contractuelle est centralisée dans :

```bash
node scripts/validate-api-v1-docs.mjs
```

Elle vérifie notamment :

- la validité des deux OpenAPI et de `docs.json` ;
- la parité FR/EN des opérations et des schémas ;
- la présence des pages correspondant aux 39 opérations ;
- la cohérence OpenAPI ↔ pages Mintlify ;
- les déclarations d’authentification ;
- l’absence de l’ancien endpoint `/collection/batch`.

GitHub Actions exécute cette validation sur les pushes vers `main` et les pull requests.

## Organisation

```text
api-reference/
  openapi.json          # contrat OpenAPI canonique

fr/api-reference/
  *.mdx                 # référence française

en/api-reference/
  *.mdx                 # référence anglaise
  openapi.json          # contrat OpenAPI anglais

scripts/
  validate-api-v1-docs.mjs

docs.json               # navigation et identité du site
```

## Contribution

Les changements de contrat API doivent être répercutés dans l’OpenAPI, les pages françaises et anglaises, puis validés avant publication.

Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour le workflow de contribution.

## dejaVu

- Site : https://dejavu.plus
- API : documentation de la version publique v1
- Dépôt : https://github.com/doctornono/dejaVu

Le site de documentation est publié avec Mintlify ; le contenu de ce dépôt reste centré sur **l’API dejaVu**, et non sur la documentation du produit Mintlify.
