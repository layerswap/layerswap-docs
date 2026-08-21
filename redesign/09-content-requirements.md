# Content Requirement Inventory & Prioritized Backlog (Phases 7–8 / Step 9)

> What documentation must exist, classified by content type, with current status and priority. Not a sitemap — grouping comes in `10-ia-alternatives.md`.
> Status codes: ✔ exists-accurate · ✎ exists-needs-improvement · ⚠ exists-outdated/wrong · ⧉ duplicated · ✗ missing · ⛔ blocked (by team answer Qx.x or release).

## Introduction & orientation

| Content | Status | Priority | Notes |
|---|---|---|---|
| What Layerswap is + what you can build | ⚠ | P0 | introduction.mdx is marketing with no dev on-ramp; rewrite with concrete capabilities (66 networks live, CEX routes, funding methods) |
| Integration method chooser (all 4 surfaces incl. API) | ⧉ | P0 | Two competing pages (Integrate, IntegrationOverview); IntegrationOverview's table omits API from Get Started cards; merge into ONE |
| Getting an API key + environments | ✎ | P0 | api-keys.mdx + Q2.6 answer (key-scoped env, same URL) + dashboard screenshots (webhooks, logo, wallet branding) |

## Concepts

| Content | Status | Priority | Notes |
|---|---|---|---|
| Swap lifecycle & status machine | ✎ | P0 | Solid base; add `fail_reason`, tx-level statuses, filter-vs-response vocabulary table; fix dark-only diagram; 🚧 10-vs-7 statuses (Q2.3) |
| Routes, quotes & limits | ✗ | P0 | Scattered across fees/lifi; needs one concept page; 🚧 quote validity (Q2.1); include /connections token-group routing |
| Funding methods compared (wallet / deposit address / Depository / gasless) | ✗ | P0 | Umbrella concept missing entirely — each method documented in isolation today |
| Fees | ✎ | P1 | Fix envelope, map taxonomy to real fields (`total_fee`, `fee_discount`; no market-impact field) |
| Security model (product) | ⚠ | P1 | security.mdx nearly empty; TRAIN frozen as-is (Q3.6); Depository audit + widget CDN signing model exist as material |
| Refuel | ✗ | P2 | Field exists, never explained |
| Glossary | ✗ | P1 | Skeleton in `08-terminology.md` |

## Tutorials / quickstarts

| Content | Status | Priority | Notes |
|---|---|---|---|
| First API swap (auth → quote → create → fund → track) | ✗ | **P0 — biggest gap** | integration/API.mdx is a stub with no auth/endpoints/links (CMP-1) |
| Widget quickstart (react) | ✎ | P0 | Drafted; apply verification corrections + cdn.layerswap.io + 2.0.0 versioning ⛔release |
| Widget via widget-js | ✎ | P1 | Drafted; `mountDepositWidget` ⛔verify-at-release |
| Hosted Page setup | ✎ | P1 | Modernize params, fix broken URLs, fold iframe in (D6) |

## Integration guides (task-based)

| Content | Status | Priority | Notes |
|---|---|---|---|
| Add deposits to a wallet (Deposit Widget or API) | ✗ | P1 | Audience A's core journey; material exists piecemeal |
| Embed swaps in a dApp (theming+wallets+events end-to-end) | ✎ | P1 | Pieces drafted; needs one connected guide |
| Server-side integration (depository/gasless, Privy recipe) | ✎ | P1 | privy recipe + depository + gasless pages exist; align terminology (D1), cross-link |
| Track a transfer (events + polling + webhooks together) | ✗ | P1 | Each mechanism documented separately, never as one task |
| CEX → chain flow | ⚠ | P2 | Only prose lives in orphaned TabOptions; exchange-model documentability now confirmed (Q2.10: in swagger) |

## How-to guides

| Content | Status | Priority |
|---|---|---|
| Lock/prefill route & address (initialValues/URL params) | ✎ drafted | P0 |
| Share wagmi config | ✎ drafted (fix C1) | P1 |
| Customize theme | ✎ drafted (fix radius scales, preset list, field dedup) | P1 |
| Handle errors (API error model incl. empty-body 400s; widget two-channel errors) | ✗ | P0 |
| Handle expired/failed swaps + refunds | ✎ | P1 — 🚧 Q2.7 |
| CSP setup for the widget | ✎ drafted (⛔ cdn.layerswap.io) | P1 |

## Reference

| Content | Status | Priority | Notes |
|---|---|---|---|
| OpenAPI (17 ops) | ✎ | P0 | Zero param descriptions in spec — either enrich spec (preferred, engineering) or carry prose tables; swagger-presence rule adopted (Q2.10) |
| Widget props (`config`, callbacks, walletDefaults…) | ✎ drafted | P0 | Apply corrections (imtblPassport asymmetry, Passport shape, dead initialValues.theme) |
| initialValues / URL params | ✎ drafted | P0 | + legacy aliases table |
| Event payloads + onError union (19 types) | ✎ drafted | P1 | Source re-check corrected the earlier 18 count; dedup the type dump and consider generation |
| Theme reference (ThemeData, CSS vars, radius scales) | ⚠ drafted | P1 | Radius table wrong — fix from code |
| Status & error code tables | ✗ | P0 | error codes (ROUTE_NOT_FOUND_ERROR…) documented nowhere |
| Self-bundled widget reference | ✎ | P2 | Keep per Q1.3 ("Advanced"); fix package names, collapse 6 boilerplate provider pages |
| Webhooks | ⚠ | P1 | Rewrite from existing info; 🚧 payload/events/retries (Q2.5) |

## Troubleshooting (by symptom)

| Content | Status | Priority |
|---|---|---|
| Widget won't load (ManifestError table, CSP, provenance line) | ✎ drafted | P1 |
| No quote / route unavailable | ✗ | P1 |
| Deposit sent, swap pending | ✗ | P1 — 🚧 deposit_speedup semantics |
| Wallet issues (EIP-6963 duplicates, one-widget-per-page alert) | ✎ drafted | P2 |
| Legacy build errors (polyfills) | ✔ keep under Advanced | P2 |

## Operational & policy

| Content | Status | Priority |
|---|---|---|
| Production checklist | ✗ | P1 — 🚧 rate limits/idempotency (Q2.4) |
| Support & escalation | ✗ | P1 — 🚧 link placeholder (Q3.8) |
| Versioning/deprecation policy | ✗ | P2 — 🚧 Q2.4 |
| Changelog | ⚠ | P2 — backfill or delete (one stale 2024 entry) |
| Brand assets | ✔ | P2 — colors code-confirmed (#FF3272) |

## Content to remove / relocate / stop maintaining
- `Widget/Widget.mdx` stub → remove.
- `StarknetPartnerDocs` + `StarknetWithDynamics` → collapse into CustomWalletManagement's corrected copy (3 copies → 1), redirects. 🚧 Q3.2.
- `ImmutablePartnerDocs` → fold into Advanced section or remove; 🚧 Q3.2.
- `TabOptions`/`EasyDeposit` orphans → merge (preserve CEX prose) into flows/initialValues docs.
- `exclude_deposit_actions` in refunds.mdx → remove (not in swagger, Q2.10).
- `DepositAddress` tab → freeze, 🚧 deferred (Q3.4).
- `lifi-integration` → keep hidden as-is, 🚧 (Q3.3).
- `widget-react-docs-plan copy.md` → delete from repo before publish.
- `snippets/quickstart.jsx` → delete (abandoned).

## Priority summary
- **P0 (understanding + first integration):** intro rewrite, single integration chooser, API-key/environments, first-API-swap tutorial, lifecycle+statuses (both vocabularies), routes/quotes concept, funding-methods concept, error-model how-to, widget quickstart corrections, props/initialValues reference, status+error code tables.
- **P1 (production):** task guides (wallet deposits, dApp embed, tracking), webhooks rewrite, refunds, fees fix, CSP, production checklist, security page, glossary, theme/events reference fixes.
- **P2 (scale/maintenance):** Advanced (self-bundled) cleanup, CEX guide, refuel, changelog decision, versioning policy, generated references.
