# Production Page Map (Phase 14 — deliverable 1 of 4)

> The definitive Model C sitemap. Every current topic (incl. orphans and hidden pages) is accounted for — nothing disappears accidentally. Companion artifacts: `16-widget-reconciliation-map.md` (per-page widget dispositions), `17-migration-plan.md` (sequence + redirects), `18-release-blocker-table.md` (🚧 classification).
>
> **Audience codes** (from `06-audience-profiles-and-journeys.md`): **A** wallet/deposits dev · **B** dApp/frontend dev · **C** backend/API integrator · **D** evaluator · **E** existing integrator.
> **Action codes**: PROMOTE = prototype → production · REWRITE = existing page rewritten in place/at new path · MOVE = content survives, path changes · MERGE = absorbed into a canonical page · CREATE = net-new · RETIRE = removed with redirect · FREEZE = untouched pending team decision.
> Page **types** per Phase-6 instruction: Orientation / Concept / Quickstart / Task guide / Reference / Troubleshooting / Migration / Interactive.

---

## Tab 1 — Get Started (`get-started/`)

| # | Path — Title | Type / Audience | Action | Owns (canonical topic) & primary question | Built from | Blockers 🚧 | Linked from |
|---|---|---|---|---|---|---|---|
| 1 | `get-started/what-is-layerswap` — What is Layerswap? | Orientation / D→all | PROMOTE prototype; RETIRE `introduction.mdx` | Product definition & funding-layer framing ("what is this, what can I build?"). Concrete capabilities, live-data pointers, routing to chooser. Per homepage brief: orientation + routing, NOT an encyclopedia; no duplicated comparison table. | `prototypes/get-started/what-is-layerswap` (M1-approved copy), `introduction.mdx` (salvage: nothing verbatim — claims banned), `11-homepage-brief.md` | M2 support link; partner-logo decision; docs theme color | Nav root; every tab's overview links back |
| 2 | `get-started/choose-your-integration` — Choose your integration | Orientation / D→A,B,C | PROMOTE prototype; RETIRE `Integrate.mdx` + `integration/UI/IntegrationOverview.mdx` (kills DUP-5) | THE single method comparison (Widget / Hosted Page / API, self-bundled as advanced note) with effort signals + V4 table. "Which method should I use?" | prototype, both old chooser pages, `05-capability-matrix.md` | M3 (unkeyed hosted URL / branding requirements) | what-is-layerswap CTA; each method tab's overview |
| 3 | `get-started/api-keys` — API keys & environments | Task guide / all | REWRITE + MOVE `api-keys.mdx` | Getting a key, using it (`X-LS-APIKEY` example), public-vs-keyed endpoints, key-scoped environments (Q2.6: testnet key → testnet routes, same base URL, D7 "environment" wording). Fixes CMP-2, STR-2. | `api-keys.mdx`, capability §7, style-guide before/after | — | Both quickstarts, chooser, production checklist |
| 4 | `get-started/networks-and-tokens` — Supported networks & tokens | Reference (interactive) / D,C | MOVE + edit `networks-tokens.mdx` | Live route coverage + prose fallback + programmatic pointers (`/networks`, `/sources`, `/destinations`) for LLM/text consumers (STR-6, audience G). | `networks-tokens.mdx`, `snippets/networksTokens.jsx` (key intentionally public) | — | what-is-layerswap, routes concept |

## Tab 2 — Concepts (`concepts/`)

| # | Path — Title | Type / Audience | Action | Owns & primary question | Built from | Blockers 🚧 | Linked from |
|---|---|---|---|---|---|---|---|
| 5 | `concepts/swap-lifecycle` — Swap lifecycle & statuses | Concept / A,B,C | PROMOTE prototype; MERGE `api-reference/swap-lifecycle.mdx` + `api-reference/refunds.mdx` (drop `exclude_deposit_actions` per Q2.10) | The swap object, 7 statuses + transitions + terminal states, `fail_reason`, tx-level statuses, 6h expiry, refund branch. V1 theme-neutral diagram (fixes DX-1). Filter-vocabulary mapping table lives in `api/track-swaps`; this page links. "What states can my swap be in and what do I do?" | prototype, both api-reference pages, verification-followups mapping | M12 (10v7 statuses), M13 (refund preconditions), M14 (polling cadence) | API quickstart, track-swaps, events pages, troubleshooting |
| 6 | `concepts/routes-quotes-limits` — Routes, quotes & limits | Concept / all | PROMOTE prototype | Route, route provider (not "solver", D5), quote (real envelope, fee fields; **no expiry claim** until Q2.1), limits, cross-token groups via `/connections`, source/destination terminology (D3). | prototype, capability §1, U-19 | M10 (quote expiry), M11 (over-max refund) | Quickstarts, fees, funding pages |
| 7 | `concepts/funding-methods` — Funding methods | Concept / all | **CREATE** (resolves M4 — P0 gap) | Umbrella concept: wallet transfer / deposit address / Depository / gasless (+ pointer to widget-only hyperliquid/polymarket). V3 who-signs/gas-payer/flags table. D2 terminology home. "Which funding method fits my architecture?" | capability §1/§7, depository + gasless pages, D2 | 🚧 gasless/depository cells (Q2.8/2.9) | Chooser, API funding pages, deposit-widget, add-deposits guide |
| 8 | `concepts/fees` — Fees | Concept / D,C | REWRITE + MOVE `fees.mdx` | Fee taxonomy mapped to real fields (`blockchain_fee`, `service_fee`, `total_fee`, `total_fee_in_usd`, `fee_discount`; no "market impact"), correct `{"data":…}` envelope (ACC-1), refuel definition (D9). | `fees.mdx`, U-19 live probes | — | what-is-layerswap, quotes concept |
| 9 | `concepts/security` — Security | Concept / D + security reviewers | REWRITE `security.mdx` | Product-level security facts: Depository audit (Hexens), signed-CDN widget delivery (summary; mechanics stay canonical in `widget/how-it-works`), TRAIN mention frozen as-is (Q3.6). No superlatives (CMP-9 fix). | `security.mdx`, capability §2, audit links | 🚧 custody/in-flight/recovery facts need team input — write what's verifiable, mark the rest | what-is-layerswap, how-it-works |
| 10 | `concepts/glossary` — Glossary | Reference / all | **CREATE** from `08-terminology.md` skeleton | Term definitions: swap, route, route provider, quote, limits, funding method, deposit address, deposit actions, Depository, gasless, refuel, source/destination, status vs status filter, environment, Widget variants, Hosted Page, Partner Dashboard, Explorer, reference_id/externalId. | `08-terminology.md` | ⚠️ terminology decisions await Babken validation (ship marked) | Every concept page |

## Tab 3 — Widget (`widget/`)

Full per-page reconciliation with correction lists: `16-widget-reconciliation-map.md`.

| # | Path — Title | Type / Audience | Action | Owns & primary question | Built from | Blockers 🚧 |
|---|---|---|---|---|---|---|
| 11 | `widget/quickstart` — Quickstart (React) | Quickstart / B | MOVE `Widget/Quickstart.mdx` | Install → render → first swap for `@layerswap/widget-react`. Flagship page. | existing rewrite | verify-at-release: npm publish, 2.0.0 versions |
| 12 | `widget/how-it-works` — How the Widget works | Concept·Reference / B + security teams | MOVE `Widget/HowItWorks.mdx` | Loader → signed manifest → SRI → MF remote model; CSP requirements; kill switch; trust root. V5 diagram. Canonical home of widget delivery security (concepts/security links here). | existing page + U-30 corrections | **cdn.layerswap.io everywhere** (ENG-1); M18 verify-at-release |
| 13 | `widget/configuration` — Configuration | Reference / B | MOVE `Widget/Configuration.mdx` | The `config` prop surface: apiKey, `version` (environment, D7 wording), apiUri, settings; theme/initialValues pointers. | existing page + U-34 (dead `initialValues.theme`) | — |
| 14 | `widget/initial-values` — Initial values & flows | Reference·Task guide / A,B | MOVE `integration/UI/Configurations.mdx` (slug fix, kills TERM-4); MERGE orphans `EasyDeposit.mdx` + `TabOptions.mdx` (kills DUP-3, STR-1) | Prefill/lock field list (`amount` is string), legacy-alias awareness note (full alias table lives in hosted-page/setup), `defaultTab` flows incl. the CEX-flow prose (unique TabOptions content preserved) and the Easy-Deposit autofill-overwrite caveat, `externalId` → `reference_id`. | Configurations + both orphans + U-34 | — |
| 15 | `widget/wallets` — Wallets | Reference / B | MOVE `Widget/Wallets.mdx` | 9 provider ids, include/exclude filtering, `walletDefaults` credentials (WC/TON/Passport shapes — CMP-10), `imtblPassport` vs `immutablePassport` asymmetry (U-31). | existing page + U-31/U-38 | — |
| 16 | `widget/wagmi-config` — Sharing your wagmi config | Task guide / B | MOVE `Widget/WagmiConfig.mdx` | Verbatim-adoption semantics (U-33: host must include needed chains), fix undefined `queryClient` (ACC-15). | existing page | — |
| 17 | `widget/theming` — Theming | Task guide / B | MERGE `Customization/CustomizationIntroduction.mdx` + `Colors.mdx` + `ThemeExamples.mdx` (kills DUP-4) | How to theme: colors (RGB triples), examples, playground link, presets caveat (named presets are hosted-page-only, U-34). | 3 customization pages + U-37 | — |
| 18 | `widget/theme-reference` — Theme reference | Reference / B | MOVE `Customization/ThemeConfiguration.mdx` | Full `ThemeData` field table (single owner), corrected 6-step borderRadius scales (U-37), CSS vars, `header.*`, `hidePoweredBy` (allowed for everyone, Q3.9), `enablePortal`/`enableWideVersion`. | existing page + U-37 | — |
| 19 | `widget/events/overview` + 9 per-event pages (`on-form-change`, `on-swap-create`, `on-swap-complete`, `on-swap-status-change`, `on-swap-modal-state-change`, `on-back-click`, `on-menu-navigation-change`, `on-error`) | Reference / A,B | MOVE EventCallbacks tree (kebab-case slugs) | Callback signatures & payloads; shared type dump becomes ONE snippet (kills DUP-2); onFormChange all-optional fix; `path`/menu-path enumerations (U-36); 18-type onError union. | existing pages + U-36 | — |
| 20 | `widget/deposit-widget` — Deposit Widget | Reference / A | MOVE `Widget/DepositWidget.mdx` | `LayerswapDepositWidget`: fixed destination, `methods` allow-list incl. hyperliquid/polymarket, `defaultAmountUsd` (0 disables). | existing page + U-35 | M16 (method one-liners) |
| 21 | `widget/add-deposits-to-your-wallet` — Add deposits to your wallet | Task guide / A | PROMOTE prototype | Audience A's end-to-end journey: Deposit Widget setup → completion signals → route coverage. | prototype | M15, M16, M17 |
| 22 | `widget/vanilla-js` — JavaScript package | Quickstart / B | MOVE `Widget/VanillaJS.mdx` | `@layerswap/widget-js`: `mountWidget` API, framework notes, differences from React path; `mountDepositWidget` kept per Q1.4 with verify-at-release marker. | existing page + U-39 | **M17** (function doesn't exist in code yet) |
| 23 | `widget/compatibility` — Compatibility | Reference / B | MOVE `Widget/Compatability.mdx` (slug fix, STR-4) | Peer deps (react ^18‖^19), ESM-only, SSR behavior, framework support matrix. | existing page + U-32 | — |
| 24 | `widget/troubleshooting` — Troubleshooting | Troubleshooting / B | PROMOTE prototype `widget-wont-load` + extend | Symptom-first: won't load (ManifestError 5 reasons — no `'incompatible'`), CSP, console provenance line, one-widget-per-page (React alert vs JS throw), EIP-6963 duplicates, prop-identity re-renders. | prototype + U-30/U-40 | M18, M19 |
| 25 | `widget/playground` — Playground | Interactive / B | MOVE `Playground.mdx` + add context prose & fallback link (frontmatter for STR-6) | Live config playground (reflects widget-react per Q1.6). | existing page | verify-at-release |

### Widget → Advanced group (nav label: **"Self-bundled Widget — Advanced"**, per Q1.3 — never "Legacy")

| # | Path — Title | Type | Action | Owns | Blockers 🚧 |
|---|---|---|---|---|---|
| 26 | `widget/advanced/self-bundled` — Self-bundled widget | Orientation | MOVE `Legacy/SelfBundled.mdx`; reframe banners from "legacy" to "recommended alternative is widget-react/js (auto-updates)" | When self-bundling is right; `@layerswap/widget` + `@layerswap/wallets` install; 2.0.0 major note. | verify-at-release (2.0.0) |
| 27 | `widget/advanced/migrate-to-widget-react` — Migrate to widget-react | Migration | MOVE `Legacy/Migration.mdx` | E's upgrade path; custom-provider gap stated honestly ("no new-model equivalent — contact the team"). | M-support-link (Q3.8) |
| 28 | `widget/advanced/wallet-management` — Wallet management | Orientation | MOVE + slim (cut duplicated quick-starts; fix `useChainConfigs` guard bug ACC-15) | Self-bundled wallet architecture overview. | — |
| 29 | `widget/advanced/native-wallet-packages` — Native wallet packages | Reference | MOVE + **fix `wallet-imtbl-*` names** (U-41: `wallet-immutable-*` 404s — ACC-2) | Per-chain package list incl. npm-only zksync/loopring. | — |
| 30 | `widget/advanced/partial-integration` — Partial integration | Task guide | MOVE + banner + WagmiConfig pointer; fix load-guard bug | Subset wallet integration. | — |
| 31 | `widget/advanced/custom-wallet-management` — Custom wallet management | Task guide | MOVE; canonical Dynamic example (`ready: true` REQUIRED per U-41); absorbs `StarknetWithDynamics` + orphan `StarknetPartnerDocs` (kills DUP-1/ACC-4: 3 copies → 1) | `WalletConnectionProvider` hook contract. | 🚧 Q3.2 (partner URLs — redirects cover) |
| 32 | `widget/advanced/wallet-providers` — Wallet providers | Reference | MERGE 10 provider pages → 1 matrix page (kills DUP-7): substantive sections for EVM, TON (credentials/manifest), Immutable Passport (Hub setup); matrix rows for Bitcoin/Solana/Starknet/Fuel/Tron/Paradex/ImmutableX; **fix Paradex imports** (ACC-7/U-41: peer-deps, doesn't re-export) | Provider factory setup per chain family. | — |
| 33 | `widget/advanced/build-troubleshooting` — Build troubleshooting | Troubleshooting | MERGE `Troubleshooting/{VitePolyfills,NextPolyfills,NextTranspilePackages}.mdx` → one page with framework sections (search-landing banners preserved; note Turbopack gap; verify `wallet-module-*` names) | Polyfills/transpile fixes — self-bundled only. | — |
| 34 | `Starknet/Starknet.mdx` | — | RETIRE + redirect → `widget/advanced/custom-wallet-management`; unique partner-vertical bits folded there | — | 🚧 Q3.2 — reversible via git if team says vertical is active |

## Tab 4 — Hosted Page (`hosted-page/`)

| # | Path — Title | Type / Audience | Action | Owns & primary question | Built from | Blockers 🚧 |
|---|---|---|---|---|---|---|
| 35 | `hosted-page/setup` — Hosted Page setup | Quickstart·Reference / B, mobile devs | MERGE `integration/UI/HostedPage.mdx` + `integration/UI/iFrame.mdx` (kills DUP-8; iframe = subsection per decided IA #2: "link, redirect or embed") | When Hosted Page fits; building the URL (fix copy-paste-broken examples ACC-13); **canonical URL-params + legacy-alias table** (canonical names only in examples, TERM-6; `sourceExchangeName` > `fromExchange` precedence); the 5 named `theme` presets (work here only); iframe subsection: embed snippet, wallet-popup caveat, frame-ancestors/CSP unknowns marked. | both pages + U-34, capability §5/§6 | M3 (key/branding requirement); 🚧 iframe CSP requirements (team) |
| 36 | `hosted-page/track-completion` — Track completion | Task guide / B | **CREATE** | The J4 gap, honestly: no redirect/callback mechanism is currently documented — workarounds that ARE verified: `externalId` → swap `reference_id` + `GET /swaps` lookup, `by_transaction_hash`, Explorer deep link. Swift deep-link example only if verified. | capability §5, J4 | 🚧 completion/redirect story (TEAM — ship visibly unresolved) |

## Tab 5 — API (`api/`)

| # | Path — Title | Type / Audience | Action | Owns & primary question | Built from | Blockers 🚧 |
|---|---|---|---|---|---|---|
| 37 | `api/overview` — API overview | Orientation / C | REWRITE `integration/API.mdx` (fixes CMP-1 — the biggest single gap) | Base URL, `X-LS-APIKEY` auth, public-vs-keyed endpoints, environments pointer, endpoint map by task, envelope + error-model pointer. No unverifiable throughput claims. | capability §7, live probes | — |
| 38 | `api/quickstart` — Build your first swap | Quickstart / C | PROMOTE prototype `build-your-first-api-swap` | ONE complete path: key → route discovery → `/limits` + `/quote` → `POST /swaps` → `deposit_actions` → fund (wallet transfer) → track to terminal state. V2 sequence diagram. Failures inline where encountered (route errors at selection, empty-body 400s at create, expiry at tracking) per Phase-5 instruction. | prototype | M5–M9 (quote validity, refund_address rule, idempotency, polling cadence, prod checklist link) |
| 39 | `api/funding/transfer` + `api/funding/networks/*` — Execute deposit actions / Source-network execution | Reference·Guide / C | **CREATE**; adapt PR #32 and promote the verified BTC, Solana, EVM, Starknet, TON, Tron, and Fuel mechanics into the redesigned IA | Reading `deposit_actions`, distinguishing action types, exact base-unit handling, per-network execution, and wrong-amount behavior. | PR #32, lifi-integration mechanics, capability §7, spec | `deposit_speedup` semantics intentionally omitted pending post-release verification |
| 40 | `api/funding/depository` — Fund via the Depository contract | Reference·Guide / C | MOVE `api-reference/depository.mdx` | `use_depository`, `call_data`/`encoded_args`, audited-contract facts; fix undeclared `depositAmountInBaseUnits` (ACC-15). | existing page | 🚧 Q2.9 (Depository claims) |
| 41 | `api/funding/gasless` — Gasless deposits | Reference·Guide / C | MOVE `api-reference/gasless-swaps.mdx` | `use_gasless`, `typed_data` signing, `POST /authorize`, `supports_gasless_deposit`. Resolve ACC-5 by spec (EIP-3009); ERC-2612 claim removed or marked; fix ACC-16 validity-window contradiction. | existing page + spec | 🚧 Q2.8 (gasless specifics) |
| 42 | `api/track-swaps` — Track swaps | Reference·Guide / A,C | **CREATE** | Polling `GET /swaps/{id}`, **canonical status-filter ↔ response-status mapping table** (V6, from verification-followups; PascalCase case-sensitive filters), `by_transaction_hash`, `/transaction_status`, when to use webhooks vs polling vs widget events (the "track a transfer" task). | verification-followups, spec | M14/M21 (cadence, rate limits); 🚧 pending-filter gaps |
| 43 | `api/webhooks` — Webhooks | Reference / C | REWRITE `api-reference/webhook.mdx` (fixes CMP-3, OUT-2) | Dashboard-configured endpoints, Svix signing/verification, inline payload example from SwapResponse shape (no dead references); explicit marked gaps: event list, retries, ordering. | existing page + Q2.5 policy + dashboard screenshots (3.11) | 🚧 Q2.5 (payload/events/retries — ship visibly unresolved) |
| 44 | `api/errors` — Errors | Reference·Troubleshooting / C | **CREATE** (P0 per content requirements) | `{"error":{code,message,metadata}}` envelope, **empty-body binding 400s**, error-code table (`ROUTE_NOT_FOUND_ERROR`, `API_KEY_FORBIDDEN`, …), per-step failure signatures, symptom index (no quote / expired / stuck pending). | live probes, capability §7 | 🚧 Q2.7 refund rules where they intersect |
| 45 | `api/recipes/privy-wallets` — Privy server wallets | Task guide / C | MOVE `recipes/privy-wallets.mdx` + terminology pass (D1: swap-first, not "bridge"-first) | Server-side embedded-wallet recipe. | existing page | — |
| 46 | Endpoints (OpenAPI group, generated into `api-reference/`) | Reference / C | KEEP as-is (source: swagger v2). Swagger-presence rule governs scope (Q2.10). | Generated endpoint reference. | live spec | M20 (enrich spec vs prose — post-release), M21, CMP-5 (zero param descriptions — engineering) |

## Tab 6 — Resources (`resources/`)

| # | Path — Title | Type | Action | Owns | Blockers 🚧 |
|---|---|---|---|---|---|
| 47 | `resources/production-checklist` — Production checklist | Task guide / all | **CREATE** | Keys per environment, testnet validation, error handling, quote-refresh practice, monitoring (webhooks/Explorer), escalation. The J5 gap. | M9/Q2.4 (rate limits, idempotency — ship with markers) |
| 48 | `resources/partner-dashboard` — Partner Dashboard | Reference / all | **CREATE** from clarification 3.11 | Keys per env (links api-keys), webhook endpoint management, App Logo upload, **Wallet Integration branding** toggle (finally explains `appName`/`addressSource` attribution; note dashboard UI still shows `destAddress` ⚠️). | — |
| 49 | `resources/support` — Support | Orientation / all | **CREATE** | Telegram dev community (verified), Explorer for status checks; official support link = marked placeholder. | **M2/M19** (Q3.8 — Babken supplies link) |
| 50 | `resources/brand-assets` — Brand assets | Reference / D | MOVE `brand-assets.mdx`; single pink `#FF3272` (U-28 code-confirmed — fix the conflicting second pink) | Logos, colors. | docs-theme color alignment 🚧 (separate, docs.json) |
| 51 | Changelog (`changelog/api`, hidden) | — | **RETIRE** (one stale 2024 self-referential entry, OUT-1) unless team commits to maintaining it — decision flagged in blocker table | — | 🚧 team decision |

## Standalone / hidden surfaces

| # | Surface | Action | Why |
|---|---|---|---|
| 52 | `DepositAddress` tab (visible, unlabeled live prod-API demo) | FREEZE file; **hide the tab** pending Q3.4 ("may be excluded entirely" — don't invest). Needs Babken's OK since it's a visible change. | Deferred product; an unlabeled real-funds demo conflicts with the new IA. Explanation preserved in `07-clarification-log.md` §3.4 as future source material. |
| 53 | `lifi-integration` (hidden tab) | KEEP hidden (Q3.3); deposit-construction mechanics promoted to `api/funding/transfer` and `api/funding/networks/*`; apply PR #32's Bitcoin memo correction so hidden content is not factually stale | Team hasn't decided its fate; partner-specific framing remains isolated. |
| 54 | `🧪 Redesign Prototypes` tab | RETIRE at Phase-13 completion — every prototype promoted to a production page above | Scaffolding. |
| 55 | `Widget/Widget.mdx` (orphan 3-line stub) | RETIRE + redirect → `widget/quickstart` | Stub, mismatched title. |
| 56 | `Widget/ImmutablePartnerDocs.mdx` (orphan) | RETIRE + redirect → `widget/advanced/self-bundled` | Old-model content mislabeled "new version" (OUT-3); team doesn't track the URL (Q3.2). 🚧 marked in redirect commit for reversal if a partner link is live. |
| 57 | `Widget/StarknetPartnerDocs.mdx` (orphan) | RETIRE + redirect → `widget/advanced/custom-wallet-management` | 3rd, stale copy of the Dynamic example (DUP-1). |

## Non-page assets

| Asset | Action |
|---|---|
| `widget-react-docs-plan copy.md` | DELETE before merge (internal plan, must not ship) |
| `snippets/quickstart.jsx` | DELETE (abandoned by Quickstart rewrite) |
| `snippets/networksTokens.jsx` | KEEP (key intentionally public per Babken 2026-08-06) |
| `snippets/depositWidget.jsx` | KEEP frozen with the hidden DepositAddress tab |
| NEW `snippets/swap-type.mdx` (or similar) | CREATE — the shared 190-line swap type block, included by event pages (DUP-2 fix) |
| `README.md` | Post-release: replace stock Mintlify starter text (references nonexistent `mint.json`) |
| `docs.json` | Full rewrite in Phase 13 batch 8 (see migration plan): 6 tabs, redirects array, theme-color decision 🚧 |

## Coverage check (audit inventory → map)

Every page in `01-documentation-inventory.md` appears above: Overview tab 7/7 (rows 1–4, 8, 9, 50) · standalone tabs 4/4 (rows 25, 51–53) · UI current-model 26/26 (rows 11–25, 14) · Legacy group 21/21 (rows 26–34) · API tab 7/7 (rows 37–46) + OpenAPI · orphans 5/5 (rows 14, 55–57) · non-page assets 6/6.
