# Instructions pour les agents

Ce dépôt contient la documentation publique de l’**API DejaVu v1**.

## Source de vérité

- `api-reference/openapi.json` est le contrat OpenAPI canonique.
- `api-reference/en/openapi.json` doit rester structurellement aligné avec le contrat canonique.
- Les routes réelles de DejaVu et les tests d’intégration servent à vérifier le comportement de l’API.
- Les pages MDX FR et EN documentent les opérations du contrat.

## Règles obligatoires

1. Ne pas modifier une route, un `operationId`, un schéma, une propriété ou une valeur d’enum uniquement dans la documentation sans vérifier le contrat réel.
2. Toute opération OpenAPI doit avoir une page française et une page anglaise.
3. Toute page endpoint doit déclarer son opération avec le frontmatter `openapi:`.
4. Les identifiants techniques restent identiques en FR et EN : routes, méthodes HTTP, `operationId`, noms de schémas, propriétés, enums et valeurs d’exemple.
5. Les textes descriptifs peuvent être traduits.
6. Ne pas réintroduire `/collection/batch` ni `ApiKeyQuery`.
7. Ne pas ajouter de contenu de démonstration provenant du starter Mintlify.
8. Conserver l’identité visuelle DejaVu.
9. Après toute modification du contrat ou de la navigation, exécuter :
   `node scripts/validate-api-v1-docs.mjs`
10. Pour une évolution de l’API, vérifier également les routes et tests du dépôt DejaVu avant de modifier le contrat documentaire.

## Périmètre

Ce dépôt documente l’API publique DejaVu.

Il ne doit pas devenir une documentation générale de l’application DejaVu, de son administration interne ou de Mintlify.

## Style

- Français clair et technique côté FR.
- Anglais technique naturel côté EN.
- Titres courts et explicites.
- Exemples directement exécutables lorsque possible.
- Ne jamais exposer de secrets ou de clés API réelles.

## Outils

Mintlify est uniquement le moteur de publication de cette documentation. Ses exemples de démarrage, guides génériques et contenus de démonstration ne font pas partie du produit documenté.
