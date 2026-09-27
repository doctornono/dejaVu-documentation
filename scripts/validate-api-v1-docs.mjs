#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const openapiPath = path.join(root, "api-reference", "openapi.json");
const docsJsonPath = path.join(root, "docs.json");

const fail = (message) => {
  console.error(`ERROR: ${message}`);
  process.exitCode = 1;
};

if (!fs.existsSync(openapiPath)) {
  fail(`Missing ${openapiPath}`);
  process.exit(1);
}

if (!fs.existsSync(docsJsonPath)) {
  fail(`Missing ${docsJsonPath}`);
  process.exit(1);
}

let spec;
let docs;

try {
  spec = JSON.parse(fs.readFileSync(openapiPath, "utf8"));
  docs = JSON.parse(fs.readFileSync(docsJsonPath, "utf8"));
} catch (error) {
  fail(`Invalid JSON: ${error.message}`);
  process.exit(1);
}

const methods = new Set(["get", "post", "put", "patch", "delete"]);
const operations = [];

for (const [route, item] of Object.entries(spec.paths ?? {})) {
  for (const [method, operation] of Object.entries(item ?? {})) {
    if (!methods.has(method)) continue;

    if (!operation?.operationId) {
      fail(`${method.toUpperCase()} ${route}: missing operationId`);
    }

    if (!operation?.responses || Object.keys(operation.responses).length === 0) {
      fail(`${method.toUpperCase()} ${route}: missing responses`);
    }

    if (!Array.isArray(operation.security)) {
      fail(`${method.toUpperCase()} ${route}: missing explicit security declaration`);
    }

    operations.push({
      method: method.toUpperCase(),
      route,
      operation,
    });
  }
}

if (spec.paths?.["/collection/batch"]) {
  fail("Obsolete /collection/batch is still present in OpenAPI");
}

const schemes = spec.components?.securitySchemes ?? {};
for (const required of ["ApiKeyHeader", "BearerAuth"]) {
  if (!schemes[required]) {
    fail(`Missing security scheme ${required}`);
  }
}

const apiTab = docs.navigation?.tabs?.find((tab) => tab.tab === "API reference");
if (!apiTab) {
  fail("Missing 'API reference' navigation tab");
  process.exit(1);
}

const pages = apiTab.groups?.flatMap((group) => group.pages ?? []) ?? [];
const endpointPages = [];

for (const relative of pages) {
  const file = path.join(root, `${relative}.mdx`);
  if (!fs.existsSync(file)) {
    fail(`Navigation page does not exist: ${relative}.mdx`);
    continue;
  }

  const content = fs.readFileSync(file, "utf8");
  const match = content.match(/^openapi:\s*["'](GET|POST|PUT|PATCH|DELETE)\s+(.+?)["']\s*$/m);

  if (match) {
    endpointPages.push(`${match[1]} ${match[2]}`);
  }
}

const operationKeys = new Set(operations.map(({ method, route }) => `${method} ${route}`));
const pageKeys = new Set(endpointPages);

for (const key of operationKeys) {
  if (!pageKeys.has(key)) {
    fail(`OpenAPI operation has no Mintlify page: ${key}`);
  }
}

for (const key of pageKeys) {
  if (!operationKeys.has(key)) {
    fail(`Mintlify page references an operation absent from OpenAPI: ${key}`);
  }
}

if (endpointPages.length !== operations.length) {
  fail(
    `Operation/page count mismatch: ${operations.length} OpenAPI operations vs ${endpointPages.length} endpoint pages`,
  );
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log(`OK: ${operations.length} OpenAPI operations`);
console.log(`OK: ${Object.keys(spec.paths ?? {}).length} OpenAPI paths`);
console.log(`OK: ${endpointPages.length} Mintlify endpoint pages`);
console.log("OK: security declarations and OpenAPI references");
console.log("OK: no obsolete /collection/batch endpoint");
