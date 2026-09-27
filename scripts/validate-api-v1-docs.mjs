#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const openapiPath = path.join(root, "api-reference", "openapi.json");
const docsJsonPath = path.join(root, "docs.json");
const fail = (message) => { console.error(`ERROR: ${message}`); process.exitCode = 1; };

if (!fs.existsSync(openapiPath)) { fail(`Missing ${openapiPath}`); process.exit(1); }
if (!fs.existsSync(docsJsonPath)) { fail(`Missing ${docsJsonPath}`); process.exit(1); }

let spec, docs;
try {
  spec = JSON.parse(fs.readFileSync(openapiPath, "utf8"));
  docs = JSON.parse(fs.readFileSync(docsJsonPath, "utf8"));
} catch (error) { fail(`Invalid JSON: ${error.message}`); process.exit(1); }

const methods = new Set(["get","post","put","patch","delete"]);
const operations = [];
for (const [route,item] of Object.entries(spec.paths ?? {})) {
  for (const [method,operation] of Object.entries(item ?? {})) {
    if (!methods.has(method)) continue;
    if (!operation?.operationId) fail(`${method.toUpperCase()} ${route}: missing operationId`);
    if (!operation?.responses || Object.keys(operation.responses).length === 0) fail(`${method.toUpperCase()} ${route}: missing responses`);
    if (!Array.isArray(operation.security)) fail(`${method.toUpperCase()} ${route}: missing explicit security declaration`);
    operations.push({method:method.toUpperCase(),route,operation});
  }
}
if (spec.paths?.["/collection/batch"]) fail("Obsolete /collection/batch is still present in OpenAPI");
for (const required of ["ApiKeyHeader","BearerAuth"]) if (!spec.components?.securitySchemes?.[required]) fail(`Missing security scheme ${required}`);

const languages = docs.navigation?.languages;
if (!Array.isArray(languages)) { fail("Missing multilingual navigation"); process.exit(1); }
const fr = languages.find((x) => x.language === "fr");
const en = languages.find((x) => x.language === "en");
if (!fr || !en) { fail("French or English navigation is missing"); process.exit(1); }

function getTab(language, name) {
  const tab = language.tabs?.find((x) => x.tab === name);
  if (!tab) fail(`Missing navigation tab: ${name}`);
  return tab;
}
const frTab = getTab(fr, "Référence API");
const enTab = getTab(en, "API Reference");
const operationKeys = new Set(operations.map(({method,route}) => `${method} ${route}`));

function readPages(tab, label) {
  const pages = tab?.groups?.flatMap((group) => group.pages ?? []) ?? [];
  const keys = [];
  for (const relative of pages) {
    const file = path.join(root, `${relative}.mdx`);
    if (!fs.existsSync(file)) { fail(`${label} navigation page does not exist: ${relative}.mdx`); continue; }
    const content = fs.readFileSync(file, "utf8");
    const match = content.match(/^openapi:\s*["'](GET|POST|PUT|PATCH|DELETE)\s+(.+?)["']\s*$/m);
    if (match) keys.push(`${match[1]} ${match[2]}`);
  }
  return {pages,keys};
}

const french = readPages(frTab, "French");
const english = readPages(enTab, "English");

for (const [label,set] of [["French",new Set(french.keys)],["English",new Set(english.keys)]]) {
  for (const key of operationKeys) if (!set.has(key)) fail(`OpenAPI operation has no ${label} Mintlify page: ${key}`);
  for (const key of set) if (!operationKeys.has(key)) fail(`${label} Mintlify page references an operation absent from OpenAPI: ${key}`);
}
if (french.keys.length !== operations.length) fail(`French operation/page count mismatch: ${operations.length} vs ${french.keys.length}`);
if (english.keys.length !== operations.length) fail(`English operation/page count mismatch: ${operations.length} vs ${english.keys.length}`);

if (process.exitCode) process.exit(process.exitCode);
console.log(`OK: ${operations.length} OpenAPI operations`);
console.log(`OK: ${Object.keys(spec.paths ?? {}).length} OpenAPI paths`);
console.log(`OK: ${french.keys.length} French endpoint pages`);
console.log(`OK: ${english.keys.length} English endpoint pages`);
console.log("OK: security declarations and OpenAPI references");
console.log("OK: no obsolete /collection/batch endpoint");
