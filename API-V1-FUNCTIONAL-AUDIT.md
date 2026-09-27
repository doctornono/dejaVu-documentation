# Audit fonctionnel des 39 endpoints API v1

Date de contrôle : 27 septembre 2026

## Méthode

Chaque opération OpenAPI a été confrontée aux handlers réels `app/api/v1/**/route.ts` du dépôt DejaVu.

Le contrôle porte sur :
- méthode et chemin ;
- authentification ;
- paramètres query/path ;
- champs de requête ;
- valeurs autorisées ;
- pagination ;
- résolution des épisodes ;
- codes d'erreur explicitement renvoyés ;
- comportements particuliers visibles dans le code.

## Résultat

**39 opérations contrôlées.**

### Authentification / Device Flow

| Endpoint | Contrôle |
|---|---|
| POST /auth/device/code | Conforme : body optionnel, client_id/client_name, expiration 5 min, polling 5 s |
| POST /auth/device/token | Conforme : device_code + grant_type, erreurs OAuth, token Bearer, expiration 90 jours |
| GET /auth/device/verify | Conforme : user_code, endpoint public |
| POST /auth/device/approve | Conforme : user_code et session navigateur DejaVu |
| GET /auth/device/qr | Conforme : user_code, image PNG, endpoint public |

### Données utilisateur

| Endpoint | Contrôle |
|---|---|
| GET /me | Conforme |
| GET /collection | Conforme après ajout des contraintes de tri/pagination |
| POST /collection | Conforme |
| DELETE /collection | Conforme |
| GET /history | Corrigé : pageSize documenté |
| POST /history | Corrigé : résolution épisode par id ou contexte série/saison/épisode |
| DELETE /history | Corrigé : suppression épisode par id ou contexte épisode |
| GET /favorites | Corrigé : pagination documentée |
| POST /favorites | Conforme |
| DELETE /favorites | Conforme |
| GET /ratings | Corrigé : pagination documentée |
| POST /ratings | Corrigé : contexte saison/épisode complété |
| DELETE /ratings | À compléter avec le même contexte conditionnel que POST |
| GET /watchlist | Corrigé : pagination documentée |
| POST /watchlist | Conforme |
| DELETE /watchlist | Conforme |
| GET /scrobble | Corrigé : type, pagination et minimal documentés |
| POST /scrobble | Corrigé : id/tmdbId et contexte épisode documentés |
| DELETE /scrobble | Corrigé : contexte épisode documenté |
| GET /upnext | Corrigé : suppression du paramètre obsolète limit et ajout page/pageSize/minimal |

### Dashboard

| Endpoint | Contrôle |
|---|---|
| GET /dashboard | Conforme |
| GET /dashboard/widget | Corrigé : pageSize ajouté ; types de widgets vérifiés dans le handler |

### Lists

| Endpoint | Contrôle |
|---|---|
| GET /lists | Corrigé : pagination et minimal documentés |
| POST /lists | Conforme : kind media/episode et visibilité PRIVATE/PUBLIC/SHARED |
| GET /lists/{id}/items | Corrigé : pageSize documenté |
| POST /lists/{id}/items | Corrigé : épisodes et contexte série/saison/épisode documentés |
| DELETE /lists/{id}/items | Corrigé : type episode et paramètre id réel documentés |

### Channels / Connectors

| Endpoint | Contrôle |
|---|---|
| GET /channels | Conforme : pagination, type et scope |
| GET /channels/{id} | Conforme |
| GET /connectors | Conforme : public, ETag et 304 |
| POST /connectors/submit | Conforme : name/domains/definition, maximum 10 domaines, extractors et limitation des wildcards |

### Kodi / Media

| Endpoint | Contrôle |
|---|---|
| POST /kodi/import | Conforme : import par chunks, options et lots limités |
| POST /media/resolve | Conforme : IMDb/TMDB/titre/contexte épisode |
| POST /media/status | Corrigé : batch movie/tv/episode et variantes de contexte |

## Points fonctionnels importants désormais explicités

### Épisodes

Les endpoints concernés acceptent désormais dans l'OpenAPI le choix entre :
- ID TMDB de l'épisode ;
- ou contexte `tvShowId + seasonNumber + episodeNumber`.

Cela concerne notamment : history, scrobble, ratings, list items, media resolve et media status.

### Pagination

Les endpoints paginés utilisent désormais explicitement `page` et `pageSize`, avec `pageSize` limité à 100 dans les handlers concernés.

### Scrobble

La documentation indique que lorsque la progression atteint **90 % ou plus**, l'élément est marqué comme vu et la progression est supprimée.

### Device Flow

Le contrat documente `grant_type=urn:ietf:params:oauth:grant-type:device_code`, le polling, les erreurs OAuth et le token retourné sous forme Bearer.

## Points restant à traiter

L'audit fonctionnel des paramètres est maintenant effectué. Il reste une deuxième couche de qualité documentaire :

1. vérifier les exemples de requêtes des 39 pages ;
2. ajouter des exemples de réponses réalistes là où OpenAPI n'en fournit pas ;
3. vérifier les codes d'erreur affichés par chaque page contre le handler ;
4. documenter les limites/rate limits pertinentes ;
5. exécuter des appels réels avec une clé API de test pour valider les exemples ;
6. effectuer le build Mintlify final.

L'OpenAPI reste la source structurée utilisée par Mintlify pour générer la référence endpoint.