#!/usr/bin/env node
/**
 * DejaVu API v1 documentation migration
 *
 * Run from the root of dejaVu-documentation:
 *   node scripts/sync-api-v1-docs.mjs
 *
 * The script updates the existing Mintlify OpenAPI contract and creates
 * the missing endpoint pages. It is intentionally local-only: review the
 * diff, run Mintlify validation, then commit/push normally.
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const openapiPath = path.join(root, "api-reference", "openapi.json");
const docsJsonPath = path.join(root, "docs.json");

if (!fs.existsSync(openapiPath) || !fs.existsSync(docsJsonPath)) {
  throw new Error("Run this script from the root of dejaVu-documentation.");
}

const spec = JSON.parse(fs.readFileSync(openapiPath, "utf8"));
const docs = JSON.parse(fs.readFileSync(docsJsonPath, "utf8"));

spec.info.description =
  "API publique DejaVu V1 pour intégrer la collection, l’historique, les favoris, les notes, la watchlist, le scrobble, les listes, les chaînes, les connecteurs et les fonctions d’intégration.";

spec.security = [{ ApiKeyHeader: [] }, { BearerAuth: [] }];

delete spec.paths["/collection/batch"];
delete spec.components.securitySchemes.ApiKeyQuery;

spec.components.securitySchemes.ApiKeyHeader = {
  type: "apiKey",
  in: "header",
  name: "x-api-key",
  description:
    "Clé API DejaVu. pk_* = lecture seule ; sk_* = lecture et écriture.",
};

spec.components.securitySchemes.BearerAuth = {
  type: "http",
  scheme: "bearer",
  description:
    "Clé API DejaVu envoyée dans Authorization: Bearer <key>.",
};

spec.components.securitySchemes.SessionCookie = {
  type: "apiKey",
  in: "cookie",
  name: "better-auth.session_token",
  description:
    "Session utilisateur DejaVu utilisée par l’approbation du Device Flow dans le navigateur.",
};

for (const [route, item] of Object.entries(spec.paths)) {
  for (const [method, operation] of Object.entries(item)) {
    if (!["get", "post", "put", "patch", "delete"].includes(method) || !operation) continue;

    if (route === "/auth/device/approve") {
      operation.security = [{ SessionCookie: [] }];
    } else if (
      ["/auth/device/code", "/auth/device/token", "/auth/device/verify",
       "/auth/device/qr", "/connectors"].includes(route)
    ) {
      operation.security = [];
    } else {
      operation.security = [{ ApiKeyHeader: [] }, { BearerAuth: [] }];
    }
  }
}

spec.components.schemas.DeviceCodeRequest = {
  type: "object",
  properties: {
    client_id: { type: "string", maxLength: 64 },
    client_name: { type: "string", maxLength: 64 },
  },
};

spec.components.schemas.DeviceCodeResponse = {
  type: "object",
  required: [
    "device_code",
    "user_code",
    "verification_uri",
    "verification_uri_complete",
    "expires_in",
    "interval",
  ],
  properties: {
    device_code: { type: "string" },
    user_code: { type: "string" },
    verification_uri: { type: "string", format: "uri" },
    verification_uri_complete: { type: "string", format: "uri" },
    expires_in: { type: "integer", example: 300 },
    interval: { type: "integer", example: 5 },
  },
};

spec.components.schemas.DeviceTokenRequest = {
  type: "object",
  required: ["device_code", "grant_type"],
  properties: {
    device_code: { type: "string" },
    grant_type: {
      type: "string",
      enum: ["urn:ietf:params:oauth:grant-type:device_code"],
    },
  },
};

spec.components.schemas.DeviceTokenResponse = {
  type: "object",
  required: ["access_token", "token_type", "expires_in"],
  properties: {
    access_token: { type: "string" },
    token_type: { type: "string", example: "Bearer" },
    expires_in: { type: "integer", example: 7776000 },
  },
};

spec.components.schemas.MediaResolveRequest = {
  type: "object",
  properties: {
    imdbId: { type: "string" },
    imdb_id: { type: "string" },
    tmdbId: { oneOf: [{ type: "integer" }, { type: "string" }] },
    tmdb_id: { oneOf: [{ type: "integer" }, { type: "string" }] },
    type: { type: "string", enum: ["movie", "tv", "episode"] },
    title: { type: "string" },
    year: { oneOf: [{ type: "integer" }, { type: "string" }] },
    tvShowId: { oneOf: [{ type: "integer" }, { type: "string" }] },
    seasonNumber: { oneOf: [{ type: "integer" }, { type: "string" }] },
    episodeNumber: { oneOf: [{ type: "integer" }, { type: "string" }] },
  },
};

spec.components.schemas.MediaStatusRequest = {
  type: "object",
  required: ["items"],
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["movie", "tv", "episode"] },
          id: { type: "integer" },
          tmdbId: { type: "integer" },
          tmdb_id: { type: "integer" },
          seasonNumber: { type: "integer" },
          season_number: { type: "integer" },
          season: { type: "integer" },
          episodeNumber: { type: "integer" },
          episode_number: { type: "integer" },
          episode: { type: "integer" },
        },
      },
    },
  },
};

spec.components.schemas.ConnectorSubmission = {
  type: "object",
  required: ["name", "domains", "definition"],
  properties: {
    name: { type: "string" },
    domains: { type: "array", maxItems: 10, items: { type: "string" } },
    definition: {
      type: "object",
      description:
        "Doit notamment contenir definition.extractors. Les sélecteurs ne doivent pas utiliser de wildcard universel.",
    },
  },
};

spec.components.schemas.KodiImportRequest = {
  type: "object",
  required: ["importSessionId", "chunk", "totalChunks"],
  properties: {
    source: { type: "string" },
    importSessionId: { type: "string" },
    chunk: { type: "integer", minimum: 1 },
    totalChunks: { type: "integer", minimum: 1 },
    options: { type: "object" },
    movies: { type: "array", maxItems: 250 },
    tvShows: { type: "array", maxItems: 250 },
    episodes: { type: "array", maxItems: 250 },
    playlists: { type: "array" },
    favorites: { type: "array", maxItems: 250 },
  },
};

spec.components.schemas.SuccessResponse = {
  type: "object",
  required: ["success"],
  properties: {
    success: { type: "boolean" },
    data: { description: "Données retournées par l’opération" },
  },
};

spec.components.schemas.PaginatedSuccessResponse = {
  type: "object",
  required: ["success", "data", "pagination"],
  properties: {
    success: { type: "boolean" },
    data: { type: "array", items: {} },
    pagination: { $ref: "#/components/schemas/Pagination" },
  },
};

for (const name of ["List", "ListInput"]) {
  if (spec.components.schemas[name]?.properties?.visibility) {
    spec.components.schemas[name].properties.visibility.enum = [
      "PRIVATE",
      "PUBLIC",
      "SHARED",
    ];
  }
}
if (spec.components.schemas.ListInput) {
  spec.components.schemas.ListInput.properties.kind = {
    type: "string",
    enum: ["media", "episode"],
  };
}
if (spec.components.schemas.ListItemInput) {
  spec.components.schemas.ListItemInput.properties.type.enum = [
    "movie",
    "tv",
    "episode",
  ];
}

spec.components.responses.Unauthorized.description =
  "Authentification requise. Utilisez le header x-api-key ou Authorization: Bearer <key>.";

spec.paths["/auth/device/code"].post.requestBody = {
  required: false,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/DeviceCodeRequest" },
    },
  },
};
spec.paths["/auth/device/code"].post.responses = {
  200: {
    description: "Codes générés",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/DeviceCodeResponse" },
      },
    },
  },
  429: { description: "Trop de demandes depuis cette adresse IP." },
  500: { description: "Erreur serveur" },
};

spec.paths["/auth/device/token"].post.requestBody = {
  required: true,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/DeviceTokenRequest" },
    },
  },
};
spec.paths["/auth/device/token"].post.responses = {
  200: {
    description: "Jeton d’accès délivré",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/DeviceTokenResponse" },
      },
    },
  },
  400: { description: "Requête invalide, autorisation en attente, expirée ou invalide." },
  403: { description: "Demande refusée par l’utilisateur." },
  429: { description: "Trop de polling pour ce device_code." },
  500: { description: "Erreur serveur" },
};

spec.paths["/auth/device/verify"].get.responses["400"] = {
  description: "Code manquant, déjà utilisé ou expiré.",
};
delete spec.paths["/auth/device/verify"].get.responses["404"];

spec.paths["/auth/device/approve"].post.description =
  "Appelé depuis le compte utilisateur. Requiert la session DejaVu du navigateur.";
spec.paths["/auth/device/approve"].post.responses["400"] = {
  description: "Code invalide ou expiré.",
};
delete spec.paths["/auth/device/approve"].post.responses["404"];

spec.paths["/auth/device/qr"] = {
  get: {
    tags: ["Auth"],
    summary: "Obtenir le QR code d’un appareil",
    description:
      "Retourne un PNG contenant l’URL de vérification associée à un user_code encore en attente.",
    operationId: "getDeviceQr",
    security: [],
    parameters: [
      { name: "user_code", in: "query", required: true, schema: { type: "string" } },
    ],
    responses: {
      200: {
        description: "Image PNG",
        content: { "image/png": { schema: { type: "string", format: "binary" } } },
      },
      400: { description: "user_code invalide" },
      404: { description: "Code introuvable ou expiré" },
      429: { description: "Trop de demandes" },
    },
  },
};

spec.paths["/channels"] = {
  get: {
    tags: ["Channels"],
    summary: "Lister les chaînes",
    operationId: "getChannels",
    parameters: [
      { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
      { name: "pageSize", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
      {
        name: "type",
        in: "query",
        schema: {
          type: "string",
          enum: ["UNIVERSE", "EDITORIAL", "PLATFORM", "THEMATIC", "CREATOR", "AWARDS", "FRANCHISE"],
        },
      },
      { name: "scope", in: "query", schema: { type: "string", enum: ["mine", "following"] } },
    ],
    responses: {
      200: {
        description: "Liste paginée",
        content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedSuccessResponse" } } },
      },
      400: { description: "Paramètres invalides" },
      500: { description: "Erreur serveur" },
    },
  },
};

spec.paths["/channels/{id}"] = {
  get: {
    tags: ["Channels"],
    summary: "Récupérer une chaîne",
    operationId: "getChannel",
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    responses: {
      200: {
        description: "Chaîne",
        content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } },
      },
      404: { description: "Chaîne introuvable" },
      500: { description: "Erreur serveur" },
    },
  },
};

spec.paths["/connectors"] = {
  get: {
    tags: ["Connectors"],
    summary: "Lister les connecteurs approuvés",
    description: "Endpoint public utilisé par l’extension navigateur.",
    operationId: "getConnectors",
    security: [],
    responses: {
      200: {
        description: "Connecteurs approuvés",
        content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } },
      },
      304: { description: "Aucune modification depuis l’ETag fourni" },
      500: { description: "Erreur serveur" },
    },
  },
};

spec.paths["/connectors/submit"] = {
  post: {
    tags: ["Connectors"],
    summary: "Soumettre un connecteur",
    description: "Soumet un connecteur pour revue. Limite : 5 soumissions par heure et par utilisateur.",
    operationId: "submitConnector",
    requestBody: {
      required: true,
      content: {
        "application/json": { schema: { $ref: "#/components/schemas/ConnectorSubmission" } },
      },
    },
    responses: {
      201: {
        description: "Connecteur soumis",
        content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } },
      },
      400: { description: "Données invalides" },
      429: { description: "Limite atteinte" },
      500: { description: "Erreur serveur" },
    },
  },
};

spec.paths["/kodi/import"] = {
  post: {
    tags: ["Kodi"],
    summary: "Importer une bibliothèque Kodi",
    operationId: "importKodi",
    requestBody: {
      required: true,
      content: { "application/json": { schema: { $ref: "#/components/schemas/KodiImportRequest" } } },
    },
    responses: {
      200: {
        description: "Lot importé",
        content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } },
      },
      400: { description: "Lot ou paramètres invalides" },
      500: { description: "Erreur serveur" },
    },
  },
};

spec.paths["/media/resolve"] = {
  post: {
    tags: ["Media"],
    summary: "Résoudre un média",
    description:
      "Recherche un média à partir d’un IMDb ID, d’un TMDB ID et type, d’un titre/année ou du contexte d’un épisode.",
    operationId: "resolveMedia",
    requestBody: {
      required: true,
      content: { "application/json": { schema: { $ref: "#/components/schemas/MediaResolveRequest" } } },
    },
    responses: {
      200: {
        description: "Média résolu",
        content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } },
      },
      400: { description: "Identifiants ou contexte invalides" },
      404: { description: "Média introuvable" },
      500: { description: "Erreur serveur" },
    },
  },
};

spec.paths["/media/status"] = {
  post: {
    tags: ["Media"],
    summary: "Récupérer le statut utilisateur de médias",
    description: "Retourne le statut utilisateur pour un lot de films, séries ou épisodes.",
    operationId: "getMediaStatus",
    requestBody: {
      required: true,
      content: { "application/json": { schema: { $ref: "#/components/schemas/MediaStatusRequest" } } },
    },
    responses: {
      200: {
        description: "Statuts retournés",
        content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } },
      },
      400: { description: "Aucun élément valide" },
      500: { description: "Erreur serveur" },
    },
  },
};

for (const tag of [
  ["Channels", "Chaînes et univers accessibles à l’utilisateur."],
  ["Connectors", "Connecteurs utilisés par l’extension navigateur."],
  ["Kodi", "Import de bibliothèques Kodi."],
  ["Media", "Résolution et statut de médias."],
]) {
  if (!spec.tags.some((t) => t.name === tag[0])) {
    spec.tags.push({ name: tag[0], description: tag[1] });
  }
}

fs.writeFileSync(openapiPath, JSON.stringify(spec, null, 2) + "\n");

const apiGroups = docs.navigation.tabs.find((t) => t.tab === "API reference")?.groups ?? [];
const addGroup = (group, pages) => {
  if (!apiGroups.some((g) => g.group === group)) apiGroups.push({ group, pages });
};

const auth = apiGroups.find((g) => g.group === "Auth");
if (auth && !auth.pages.includes("api-reference/auth/request-device-qr")) {
  auth.pages.splice(1, 0, "api-reference/auth/request-device-qr");
}

addGroup("Media", [
  "api-reference/media/resolve-media",
  "api-reference/media/get-media-status",
]);
addGroup("Channels", [
  "api-reference/channels/get-channels",
  "api-reference/channels/get-channel",
]);
addGroup("Connectors", [
  "api-reference/connectors/get-connectors",
  "api-reference/connectors/submit-connector",
]);
addGroup("Kodi", ["api-reference/kodi/import"]);

docs.navigation.tabs.find((t) => t.tab === "API reference").groups = apiGroups;
fs.writeFileSync(docsJsonPath, JSON.stringify(docs, null, 2) + "\n");

const pages = {
  "api-reference/auth/request-device-qr.mdx": `---
title: "Obtenir le QR code d'un appareil"
openapi: "GET /auth/device/qr"
---
`,
  "api-reference/media/resolve-media.mdx": `---
title: "Résoudre un média"
openapi: "POST /media/resolve"
---
`,
  "api-reference/media/get-media-status.mdx": `---
title: "Récupérer le statut de médias"
openapi: "POST /media/status"
---
`,
  "api-reference/channels/get-channels.mdx": `---
title: "Lister les chaînes"
openapi: "GET /channels"
---
`,
  "api-reference/channels/get-channel.mdx": `---
title: "Récupérer une chaîne"
openapi: "GET /channels/{id}"
---
`,
  "api-reference/connectors/get-connectors.mdx": `---
title: "Lister les connecteurs approuvés"
openapi: "GET /connectors"
---
`,
  "api-reference/connectors/submit-connector.mdx": `---
title: "Soumettre un connecteur"
openapi: "POST /connectors/submit"
---
`,
  "api-reference/kodi/import.mdx": `---
title: "Importer une bibliothèque Kodi"
openapi: "POST /kodi/import"
---
`,
};

for (const [relative, content] of Object.entries(pages)) {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

console.log("OpenAPI + Mintlify navigation updated.");
console.log(`OpenAPI paths: ${Object.keys(spec.paths).length}`);
console.log(
  `OpenAPI operations: ${Object.values(spec.paths).reduce(
    (n, p) => n + Object.keys(p).filter((m) => ["get", "post", "put", "patch", "delete"].includes(m)).length,
    0
  )}`
);
console.log("Next: run your Mintlify dev/build checks and review git diff.");
