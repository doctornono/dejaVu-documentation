# API V1 Documentation Audit

Date: 2026-09-27

## Scope

Deep content audit of the dejaVu API v1 documentation repository, covering the canonical French and English OpenAPI documents, Mintlify navigation, all 39 API operations, all 39 French endpoint pages, all 39 English endpoint pages, introduction and authentication pages, endpoint security declarations, documented query parameters and examples, French/English consistency, and obsolete starter content.

## Contract baseline

- 24 API routes.
- 39 OpenAPI operations.
- 29 OpenAPI schemas.
- French and English OpenAPI operation sets are aligned.
- French and English endpoint navigation each expose all 39 operations.
- OpenAPI references on endpoint pages match the canonical routes.

## Findings

### 1. English endpoint content was not production-ready

The English endpoint pages contained substantial mixed French/English prose and, in several cases, malformed hybrid titles.

**Action:** all 39 English endpoint pages were rewritten in consistent technical English while preserving exact OpenAPI method/path references and technical identifiers.

### 2. Device approval authentication was documented incorrectly

The device approval endpoint is protected by the authenticated dejaVu session cookie (SessionCookie), not by an API key and not as a public endpoint.

**Action:** both French and English pages now explicitly document session authentication and provide a session-cookie example.

### 3. Device QR and verification examples omitted a required parameter

GET /auth/device/qr and GET /auth/device/verify require the user_code query parameter.

**Action:** both French and English pages now show ?user_code=... and explicitly mention the parameter.

### 4. Channel authentication was documented incorrectly

GET /channels and GET /channels/{id} require API-key/Bearer authentication according to the OpenAPI contract.

**Action:** both French and English pages now describe authenticated access consistently.

### 5. Dashboard and profile examples contained undeclared query parameters

The previous examples for GET /dashboard and GET /me included page and pageSize, although those operations do not define query parameters.

**Action:** dashboard and profile examples now use the actual parameterless endpoints.

### 6. Write operations were underspecified in prose

Several endpoint pages only said that authentication was required, without making the read/write key distinction explicit.

**Action:** English write-operation pages now state that write access requires the permissions associated with a secret key (sk\_), consistent with the OpenAPI error contract.

## Structural verification

The existing validator continues to enforce exact OpenAPI operation parity, exact French/English operation parity, exact schema-set parity, explicit operation security declarations, complete endpoint-page coverage, absence of obsolete /collection/batch, absence of starter/duplicate files, and dejaVu branding/navbar constraints.

The validator was strengthened with content-level checks for:

- French prose accidentally present in English endpoint pages;
- contradictions between page authentication claims and OpenAPI security;
- undocumented query parameters used in examples.

## Mintlify configuration

The repository remains intentionally API-focused. Mintlify is the documentation renderer, not the subject of the documentation.

The navigation uses French and English language sections and the canonical OpenAPI contract. Mintlify supports language-partitioned navigation and OpenAPI-backed endpoint pages. citeturn0search2turn0search3

## Result

The repository now has a clean FR/EN endpoint reference with the OpenAPI contract as the technical source of truth and content-level regression checks for the main classes of documentation drift discovered during this audit.
