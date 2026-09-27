#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const docs = JSON.parse(fs.readFileSync(path.join(root, "docs.json"), "utf8"));
const spec = JSON.parse(fs.readFileSync(path.join(root, "api-reference", "openapi.json"), "utf8"));

const errors = [];

function walk(node, out = []) {
  if (!node) return out;
  if (Array.isArray(node)) for (const item of node) walk(item, out);
  else if (typeof node === "object") {
    if (typeof node.page === "string") out.push(node.page);
    if (Array.isArray(node.pages)) out.push(...node.pages);
    for (const [key, value] of Object.entries(node)) {
      if (key !== "page" && key !== "pages") walk(value, out);
    }
  }
  return out;
}

const pages = [...new Set(walk(docs.navigation))];

for (const page of pages) {
  const exists = [
    path.join(root, `${page}.mdx`),
    path.join(root, `${page}.md`)
  ].some(fs.existsSync);
  if (!exists) errors.push(`Navigation page missing: ${page}`);
}

if (pages.includes("api-reference/collection/batch-add-to-collection")) {
  errors.push("Stale navigation entry: /collection/batch");
}

if (!spec.openapi || !spec.info?.version || !spec.paths) {
  errors.push("Invalid OpenAPI document");
}

if (spec.paths["/collection/batch"]) {
  errors.push("Legacy OpenAPI path still present: /collection/batch");
}

if (spec.components?.securitySchemes?.ApiKeyQuery) {
  errors.push("Legacy security scheme still present: ApiKeyQuery");
}

const operations = Object.entries(spec.paths).flatMap(([route, item]) =>
  Object.keys(item)
    .filter(method => /^(get|post|put|patch|delete|head|options|trace)$/i.test(method))
    .map(method => `${method.toUpperCase()} ${route}`)
);

if (!spec.components?.securitySchemes?.ApiKeyHeader) {
  errors.push("Missing ApiKeyHeader");
}
if (!spec.components?.securitySchemes?.BearerAuth) {
  errors.push("Missing BearerAuth");
}

console.log(`OpenAPI: ${operations.length} operations / ${Object.keys(spec.paths).length} paths`);
console.log(`Navigation: ${pages.length} pages`);

if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}

console.log("API documentation consistency checks passed.");
