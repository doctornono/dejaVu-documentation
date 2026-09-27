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
const englishOpenapiPath = path.join(root, "api-reference", "en", "openapi.json");
if (!fs.existsSync(englishOpenapiPath)) { fail(`Missing ${englishOpenapiPath}`); process.exit(1); }
let englishSpec;
try { englishSpec = JSON.parse(fs.readFileSync(englishOpenapiPath, "utf8")); }
catch (error) { fail(`Invalid English OpenAPI JSON: ${error.message}`); process.exit(1); }

const operationSignature = (value) => Object.entries(value.paths ?? {}).flatMap(([route,item]) =>
  Object.keys(item ?? {}).filter((method) => methods.has(method)).map((method) => `${method.toUpperCase()} ${route}`)
).sort();
const schemaNames = (value) => Object.keys(value.components?.schemas ?? {}).sort();
if (JSON.stringify(operationSignature(spec)) !== JSON.stringify(operationSignature(englishSpec))) {
  fail("English OpenAPI operation set differs from canonical OpenAPI");
}
if (JSON.stringify(schemaNames(spec)) !== JSON.stringify(schemaNames(englishSpec))) {
  fail("English OpenAPI schema set differs from canonical OpenAPI");
}
if (englishSpec.openapi !== spec.openapi || englishSpec.info?.version !== spec.info?.version) {
  fail("English OpenAPI version metadata differs from canonical OpenAPI");
}
if (englishSpec.info?.title !== "DejaVu API V1") fail("English OpenAPI title is not English/canonical");

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


const forbiddenPaths = [
  "README-APPLY.md",
  "essentials/imdb.mdx",
  "snippets/snippet-intro.mdx",
  "ai-tools",
  "images/hero-dark.png",
  "images/hero-light.png",
  "images/checks-passed.png",
  "api-reference/collection/batch-add-to-collection.mdx",
  "scripts/validate-api-docs.mjs"
];
for (const relative of forbiddenPaths) {
  if (fs.existsSync(path.join(root, relative))) fail(`Obsolete starter/duplicate file remains: ${relative}`);
}
if (docs.colors?.primary !== "#7B2820" || docs.colors?.light !== "#7B2820" || docs.colors?.dark !== "#7B2820") {
  fail("DejaVu primary colors are not configured consistently");
}
if (docs.navbar?.links?.length) fail("Navbar contains extra links; keep only the primary DejaVu CTA");
if (docs.navbar?.primary?.label !== "Ouvrir DejaVu") fail("Missing primary DejaVu navbar CTA");
\nif (process.exitCode) process.exit(process.exitCode);
console.log(`OK: ${operations.length} OpenAPI operations`);
console.log(`OK: ${Object.keys(spec.paths ?? {}).length} OpenAPI paths`);
console.log(`OK: ${french.keys.length} French endpoint pages`);
console.log(`OK: ${english.keys.length} English endpoint pages`);
console.log("OK: security declarations and OpenAPI references");
console.log("OK: no obsolete /collection/batch endpoint");
