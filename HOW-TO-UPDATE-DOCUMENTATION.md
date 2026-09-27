# HOW-TO — Mettre à jour la documentation de l’API dejaVu v1

Ce guide décrit la procédure à suivre pour modifier, compléter ou corriger la documentation publique de l’API dejaVu v1.

## 1. Comprendre la structure du dépôt

La documentation est organisée ainsi :

```text
dejaVu-documentation/
├── api-reference/
│   └── openapi.json              # contrat OpenAPI canonique
├── fr/
│   └── api-reference/
│       ├── introduction.mdx
│       ├── authentication.mdx
│       └── ...                   # pages des endpoints en français
├── en/
│   └── api-reference/
│       ├── openapi.json          # copie anglaise du contrat
│       ├── introduction.mdx
│       ├── authentication.mdx
│       └── ...                   # pages des endpoints en anglais
├── logo/
├── favicon.svg
├── scripts/
│   └── validate-api-v1-docs.mjs
├── .github/
│   └── workflows/
│       └── validate-api-v1-docs.yml
├── docs.json                     # navigation Mintlify
└── README.md
```

### Important

Le fichier OpenAPI de référence est :

```text
api-reference/openapi.json
```

La version anglaise est :

```text
en/api-reference/openapi.json
```

Ne pas recréer un ancien chemin de type `api-reference/en/openapi.json`.

---

## 2. Avant toute modification

Pour une modification liée au comportement de l’API, commencer par vérifier le dépôt principal dejaVu :

```text
https://github.com/doctornono/dejaVu
```

La documentation doit décrire **le comportement réellement implémenté**, et non un comportement souhaité ou supposé.

Vérifier notamment :

- la route réelle ;
- la méthode HTTP ;
- l’authentification ;
- les paramètres de chemin et de requête ;
- le corps de la requête ;
- les réponses ;
- les codes HTTP ;
- les schémas utilisés ;
- la pagination ;
- les contraintes particulières ;
- les tests d’intégration existants.

---

## 3. Modifier un endpoint existant

Pour une correction documentaire simple, modifier les deux pages :

```text
fr/api-reference/<...>.mdx
en/api-reference/<...>.mdx
```

Les éléments techniques doivent rester identiques dans les deux langues :

- méthode HTTP ;
- chemin ;
- `operationId` ;
- noms de propriétés JSON ;
- noms des paramètres ;
- enums ;
- valeurs techniques des exemples ;
- codes HTTP.

Seuls les textes explicatifs peuvent être traduits ou reformulés.

### Exemple

Une page française peut expliquer :

> Cette opération ajoute un média à la liste de suivi.

La page anglaise peut expliquer :

> This operation adds a media item to the watchlist.

Mais le chemin et les paramètres restent identiques.

---

## 4. Ajouter ou modifier une opération OpenAPI

Lorsqu’un endpoint est réellement ajouté ou modifié dans l’API :

### Étape 1 — modifier le contrat canonique

Modifier :

```text
api-reference/openapi.json
```

Ce fichier constitue la référence.

### Étape 2 — synchroniser la version anglaise

Reporter exactement la même structure dans :

```text
en/api-reference/openapi.json
```

Les descriptions peuvent être en anglais, mais les éléments techniques doivent rester identiques.

### Étape 3 — créer ou modifier la page française

Créer :

```text
fr/api-reference/<categorie>/<endpoint>.mdx
```

La page doit déclarer son opération avec le frontmatter :

```yaml
---
openapi: "GET /api/v1/..."
---
```

Adapter la méthode et le chemin à l’opération concernée.

### Étape 4 — créer ou modifier la page anglaise

Créer le fichier correspondant :

```text
en/api-reference/<categorie>/<endpoint>.mdx
```

avec exactement la même déclaration `openapi:`.

---

## 5. Mettre à jour la navigation Mintlify

Si une nouvelle page est créée, elle doit également être ajoutée dans :

```text
docs.json
```

Il faut ajouter la page **dans les deux langues**.

Exemple :

```json
{
  "group": "Lists",
  "pages": [
    "fr/api-reference/lists/get-lists",
    "fr/api-reference/lists/create-list"
  ]
}
```

et côté anglais :

```json
{
  "group": "Lists",
  "pages": [
    "en/api-reference/lists/get-lists",
    "en/api-reference/lists/create-list"
  ]
}
```

Le chemin dans `docs.json` est relatif à la racine du dépôt et ne comporte pas l’extension `.mdx`.

---

## 6. Ajouter un exemple de requête

Les exemples doivent être directement exploitables.

Pour un endpoint protégé, ne jamais utiliser une vraie clé API.

Exemple :

```bash
curl -X GET "https://dejavu.plus/api/v1/..." \
  -H "X-API-Key: YOUR_API_KEY"
```

Pour un Bearer token :

```bash
curl -X POST "https://dejavu.plus/api/v1/..." \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

Ne jamais publier :

- une clé API réelle ;
- un token réel ;
- un cookie de session ;
- une donnée personnelle réelle ;
- une donnée provenant d’un compte utilisateur réel.

---

## 7. Respecter l’authentification

L’authentification documentée doit correspondre à OpenAPI et à l’implémentation.

dejaVu v1 utilise notamment :

- `ApiKeyHeader` ;
- `BearerAuth` ;
- le mécanisme de session nécessaire à certaines opérations du Device Flow.

Les endpoints publics doivent être documentés comme publics.

Ne pas écrire qu’une API key est nécessaire si l’opération est publique.

Inversement, ne pas présenter comme public un endpoint qui nécessite une authentification.

---

## 8. Modifier uniquement le texte d’une page

Si le contrat API ne change pas, il n’est pas nécessaire de modifier OpenAPI.

Exemples de modifications documentaires :

- correction d’une faute ;
- amélioration d’une explication ;
- ajout d’un avertissement ;
- ajout d’un exemple ;
- clarification d’un comportement déjà implémenté.

Même dans ce cas, vérifier la page anglaise si la modification concerne une information technique.

---

## 9. Modifier un schéma

Une modification de schéma est une modification du contrat.

Il faut donc synchroniser :

```text
api-reference/openapi.json
en/api-reference/openapi.json
fr/api-reference/<pages concernées>.mdx
en/api-reference/<pages concernées>.mdx
```

Vérifier en particulier :

- propriétés ;
- types ;
- propriétés obligatoires ;
- valeurs par défaut ;
- enums ;
- descriptions ;
- exemples ;
- réponses utilisant le schéma.

---

## 10. Vérifier la pagination

Lorsqu’un endpoint utilise la pagination, vérifier que la documentation correspond exactement à l’API.

Ne pas inventer de paramètres.

Par exemple, si l’API expose :

```text
?page=1&limit=20
```

la documentation ne doit pas présenter d’autres paramètres tels que :

```text
?offset=0&size=20
```

s’ils ne sont pas réellement supportés.

Le validateur détecte notamment les paramètres de requête utilisés dans les URLs d’exemple mais absents de l’opération OpenAPI.

---

## 11. Lancer la validation locale

Depuis la racine du dépôt :

```bash
node scripts/validate-api-v1-docs.mjs
```

La validation doit se terminer sans erreur.

Un résultat attendu ressemble à :

```text
OK: 39 OpenAPI operations
OK: 24 OpenAPI paths
OK: 39 French endpoint pages
OK: 39 English endpoint pages
OK: security declarations and OpenAPI references
OK: no obsolete /collection/batch endpoint
```

Le nombre d’opérations et de pages peut évoluer lorsque l’API évolue. Ce sont les valeurs actuelles de l’API v1.

---

## 12. Tester le rendu Mintlify

Pour vérifier visuellement la documentation avant de pousser :

```bash
npm install -g mint
mint dev
```

Puis ouvrir l’URL locale indiquée par Mintlify.

Vérifier au minimum :

- navigation française ;
- navigation anglaise ;
- page d’introduction ;
- page d’authentification ;
- endpoint modifié ;
- exemples de requêtes ;
- affichage des schémas ;
- liens internes.

---

## 13. Vérifier les deux langues

Toute opération doit exister dans :

```text
fr/api-reference/
en/api-reference/
```

Pour chaque endpoint, vérifier :

1. même méthode ;
2. même route ;
3. même `operationId` ;
4. mêmes paramètres ;
5. mêmes propriétés ;
6. mêmes enums ;
7. mêmes exemples techniques ;
8. même comportement d’authentification ;
9. mêmes codes HTTP importants.

La rédaction peut naturellement différer entre français et anglais.

---

## 14. Vérifier les fichiers obsolètes

Ne pas réintroduire d’anciens fichiers ou chemins.

Notamment :

```text
api-reference/en/
api-reference/collection/batch-add-to-collection.mdx
README-APPLY.md
scripts/validate-api-docs.mjs
snippets/snippet-intro.mdx
```

Le validateur contrôle plusieurs de ces anciens éléments.

---

## 15. Commit et push

Une fois la validation locale passée :

```bash
git status
git diff
git add .
git commit -m "docs: update dejaVu API documentation"
git push
```

Avant le commit, vérifier particulièrement :

```bash
git diff --check
```

pour détecter les erreurs de whitespace ou de formatage.

---

## 16. Vérifier GitHub Actions

Après le push, le workflow :

```text
.github/workflows/validate-api-v1-docs.yml
```

exécute automatiquement :

```bash
node scripts/validate-api-v1-docs.mjs
```

Le push n’est considéré comme propre qu’après vérification que le workflow est **terminé avec succès**.

Ne pas se contenter de constater que le commit est présent sur GitHub.

---

## 17. Vérifier Mintlify après publication

Après publication, vérifier au minimum :

### Français

```text
/fr/api-reference/introduction
/fr/api-reference/authentication
```

### Anglais

```text
/en/api-reference/introduction
/en/api-reference/authentication
```

Puis vérifier directement l’endpoint modifié.

---

# Procédure rapide

Pour une modification courante, la procédure minimale est :

```text
1. Vérifier l’implémentation dans doctornono/dejaVu
        ↓
2. Modifier OpenAPI si le contrat change
        ↓
3. Synchroniser api-reference/openapi.json
   et en/api-reference/openapi.json
        ↓
4. Modifier la page FR
        ↓
5. Modifier la page EN
        ↓
6. Modifier docs.json si une page est ajoutée
        ↓
7. Exécuter :
   node scripts/validate-api-v1-docs.mjs
        ↓
8. Vérifier le rendu avec mint dev si nécessaire
        ↓
9. git diff --check
        ↓
10. commit + push
        ↓
11. Vérifier GitHub Actions
        ↓
12. Vérifier Mintlify en production
```

# Règle essentielle

**Le code dejaVu définit le comportement.  
OpenAPI définit le contrat documentaire.  
Les pages FR/EN expliquent ce contrat.  
Le validateur vérifie leur cohérence.  
Mintlify publie le résultat.**

En cas de divergence, ne pas adapter la documentation pour masquer une différence avec l’API : vérifier d’abord l’implémentation et les tests du dépôt dejaVu.
