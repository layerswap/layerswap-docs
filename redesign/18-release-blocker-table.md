# Release Blocker Table (Phase 14 — deliverable 4 of 4)

> Every unresolved item — the 20 open 🚧 markers from `14-open-markers.md`, plus engineering dependencies, accuracy fixes, and pending decisions — classified per Phase 10:
>
> **BLOCK** = must resolve before the redesign ships (wrong instructions / broken examples / invalid URLs / nav) · **VERIFY@REL** = assumed-true per team answers, must be re-checked the day docs+packages ship (Q1.1: simultaneous) · **SHIP-MARKED** = ships with a visible 🚧 marker; docs stay safe and useful without the claim · **POST** = post-release improvement.
>
> "Resolver" = who/what closes it. Marker IDs reference `14-open-markers.md`; page paths are the NEW tree (`15-production-page-map.md`).

## Release blocking (BLOCK)

| ID | Item | Page(s) | Resolver |
|----|------|---------|----------|
| ENG-1 | Loader `DEFAULT_MANIFEST_URL` must point at **cdn.layerswap.io** before publish; docs already written against that origin (Q1.2). Docs and code must match or every CSP instruction is wrong. | widget/how-it-works, widget/troubleshooting | Engineering |
| B-1 | `workers.dev` origin removed from every page (grep gate = 0 hits) | widget tree | Batch 3/8 (us) |
| B-2 | ACC-2/U-41: `wallet-immutable-*` package names (404 on npm) corrected to `wallet-imtbl-*` | widget/advanced/native-wallet-packages | Batch 3 (us) |
| B-3 | ACC-7/U-41: Paradex import example (package doesn't re-export the factories) | widget/advanced/wallet-providers | Batch 3 (us) |
| B-4 | ACC-4/U-41: stale Dynamic example missing required `ready: true` — must not survive anywhere (3 copies → 1 corrected) | widget/advanced/custom-wallet-management | Batch 3 (us) |
| B-5 | ACC-15 code bugs: undefined `queryClient`, `WidgetLoading` before import, `useChainConfigs` before load guard (×3), undeclared `depositAmountInBaseUnits` | wagmi-config, advanced pages, api/funding/depository | Batches 3/5 (us) |
| B-6 | ACC-1/U-19: quote envelope corrected to `{"data":…}` everywhere; no "market impact" field claims | concepts/fees, concepts/routes-quotes-limits, api pages | Batch 2/5 (us) |
| B-7 | U-42/U-47: status-filter examples use case-sensitive PascalCase with the mapping table; documented snake_case filter values (which 400) must not survive | api/track-swaps (canonical), concepts/swap-lifecycle | Batch 5 (us) |
| B-8 | ACC-13: copy-paste-broken example URLs (multi-line, `?` + `&`) | hosted-page/setup | Batch 4 (us) |
| B-9 | ACC-14: invalid `{PLACEHOLDER}` syntax in plain code blocks | any surviving Starknet/Dynamic content | Batch 3 (us) |
| B-10 | U-37: wrong borderRadius table replaced with code-verified 6-step scales | widget/theme-reference | Batch 3 (us) |
| B-11 | U-36/ACC-12: onFormChange "all required strings" table corrected to all-optional | widget/events/on-form-change | Batch 3 (us) |
| B-12 | G6/U-30: ManifestError `'incompatible'` member removed (5 reasons only); overstated "React 17 rejected at runtime" softened | widget/how-it-works, compatibility, troubleshooting | Batch 3 (us) |
| B-13 | U-34: dead `initialValues.theme` removed/marked; presets documented as hosted-page-only | widget/configuration, theming, hosted-page/setup | Batch 3/4 (us) |
| B-14 | ACC-5: gasless spec conflict — document EIP-3009 per swagger; drop/mark ERC-2612 | api/funding/gasless | Batch 5 (us) |
| B-15 | Q2.10 sweep: `exclude_deposit_actions` removed (not in swagger); nothing spec-absent presented as supported | concepts/swap-lifecycle, all API pages | Batches 2/5 (us) |
| B-16 | M4: `concepts/funding-methods` page written (P0 gap; chooser and API funding pages depend on it) | concepts/funding-methods | Batch 2 (us) |
| B-17 | CMP-1/CMP-2: api/overview + get-started/api-keys actually teach auth header + base URL + environments | api/overview, get-started/api-keys | Batches 1/5 (us) |
| B-18 | Unsupported superlatives removed per Q3.5 ("most affordable", "billions processed", hardcoded counts, "instantly", "completes in seconds") — replacements 🚧-marked | what-is-layerswap, concepts/security, api/overview | Batches 1–6 (us) |
| B-19 | Full nav swap + redirects array ships atomically; `widget-react-docs-plan copy.md` + `snippets/quickstart.jsx` deleted; prototypes tab removed | docs.json | Batch 8 (us) |
| B-20 | DUP-1/2/3/4/5/7 duplication merges completed (competing canonical pages must not co-exist in nav) | per reconciliation map | Batches 1–7 (us) |

## Verify at release (VERIFY@REL) — day-of-ship checklist

| ID | Item | Page(s) | What to check |
|----|------|---------|---------------|
| V-1 (REL-1, M15) | `@layerswap/widget-react` / `widget-js` / `widget-types` published; install commands work; versions = 2.0.0 line (Q1.1/Q1.3) | widget/quickstart, vanilla-js, compatibility, add-deposits guide | `npm view` each package |
| V-2 (M18) | `cdn.layerswap.io` live and serving the manifest; CSP snippet works against production | widget/how-it-works, troubleshooting | curl manifest; test app with documented CSP |
| V-3 (M17, Q1.4) | `mountDepositWidget` exists in released widget-js (absent from code 2026-08-06) | widget/vanilla-js, add-deposits guide | released package types/exports |
| V-4 (G2) | Versioning/channel prose: "2.x → /v2/manifest.json" (or actual) — channel derives from remote's major | widget/how-it-works, advanced/self-bundled | released loader source |
| V-5 | Playground (playground.layerswap.io) reflects released widget-react config shape (Q1.6) | widget/playground, theming | manual pass |
| V-6 | Self-bundled 2.0.0: zustand peer range, polyfill guidance, `wallet-module-*` names still accurate after the major | widget/advanced/* | npm + release notes |
| V-7 | onError 19-type union & event payloads unchanged in released types (hand-maintained mirror, DX-2) | widget/events/* | released widget-types |

## Ship with visible 🚧 marker (SHIP-MARKED)

| ID | Item | Page(s) | Resolver | Why safe to ship |
|----|------|---------|----------|------------------|
| S-1 (M5, M10 / Q2.1, U-48) | Quote validity / rate-guarantee model | api/quickstart, concepts/routes-quotes-limits | Team (API) | Docs state "no expiry field; refresh before create" without inventing a window |
| S-2 (M6, M11, M13 / Q2.7, U-17) | Refund rules, `refund_address` requirement, over-max deposit path | concepts/swap-lifecycle, api/quickstart, api/errors | Team (API) | Lifecycle documents the observable states; rules marked |
| S-3 (M7, M8, M9, M21 / Q2.4, U-11) | `reference_id` idempotency, polling cadence, rate limits, versioning policy | api/quickstart, api/track-swaps, resources/production-checklist | Team (API) | Guidance says "poll conservatively" + marker; no fabricated numbers |
| S-4 (Q2.5, U-12) | Webhook event list, retries, ordering, payload guarantees | api/webhooks | Team (API) | Verified parts (dashboard config, Svix, payload shape from SwapResponse) documented; gaps marked |
| S-5 (M12 / Q2.3, U-46) | 10 vs 7 statuses | concepts/swap-lifecycle | Team (API) | 7 spec statuses documented as canonical; marker notes widget enum |
| S-6 (Q2.8/2.9, U-18/U-14) | Gasless specifics (validity window, auth status enum) & Depository claims | api/funding/gasless, api/funding/depository, concepts/funding-methods | Team | Spec-verified structure documented; claims marked |
| S-7 (M2, M19 / Q3.8) | Official support link | resources/support, migrate-to-widget-react, troubleshooting | Babken | Telegram dev community is real; placeholder marked |
| S-8 (M3) | Unkeyed hosted-page usage / branding key requirements | get-started/choose-your-integration, hosted-page/setup | Product | Documented paths all use a key; open question marked |
| S-9 (M16) | hyperliquid/polymarket one-line descriptions | widget/deposit-widget | Product | Methods listed as supported (Q1.5); description marked |
| S-11 | Hosted-page completion/redirect story | hosted-page/track-completion | Team (product) | Verified workarounds documented; absence stated plainly |
| S-12 (Q3.7, ⚠️ D1–D9) | Terminology decisions await Babken's validation | glossary + first-use sites | Babken review pass | Decisions internally consistent; marked for review |
| S-13 (Q3.5) | Replaced marketing claims | what-is-layerswap, concepts/security | Babken review pass | Concrete statements shipped; replacements marked |
| S-14 (Q3.2) | Partner orphan retirements (Immutable/Starknet partner URLs) | redirects | Babken/BD | Redirects preserve URLs; git preserves content |
| S-15 | iframe `frame-ancestors`/CSP requirements Layerswap-side | hosted-page/setup | Engineering | Embed basics verified; CSP marked |
| S-16 | Docs theme color `#E05B8A` vs brand `#FF3272` family | docs.json | Babken | Cosmetic |
| S-17 | Custody, in-flight handling, and recovery guarantees | concepts/security | Product/security | Verified audit and loader facts remain useful without broader claims |

## Nav-visible decisions — resolved 2026-08-11

| ID | Decision | Resolution |
|----|----------|------------|
| D-A (Q3.4) | Hide the `DepositAddress` tab (frozen live demo with prod API)? | **Hide.** Keep the file and preserve the explanation in the clarification log. |
| D-B | Changelog: commit to maintaining, or retire? | **Keep hidden.** Do not delete it; revisit maintenance after release. |
| D-C | Partner-logo wall on the homepage? | **Omit.** Keep the homepage focused on orientation and routing. |
| D-D | "Deposit tab" replaces "Easy Deposit" naming? (D2 ⚠️) | **Use “Deposit tab.”** Retain “Easy Deposit” only where needed to explain old terminology. |

## Post-release (POST)

| ID | Item |
|----|------|
| P-1 (M20, CMP-5) | Enrich swagger parameter/schema descriptions (engineering) vs maintaining prose tables — decide and execute |
| P-2 | Generate event/type reference from `widget-types` (kills the hand-maintained mirrors, DX-2) |
| P-3 | Additional task guides: CEX → chain flow (exchange models are swagger-documentable per Q2.10), embed-swaps-in-a-dApp end-to-end, refuel deep-dive |
| P-4 | Non-⭐ visuals: V7 theme-scale graphic, V8 error-decision flow (blocked on Q2.4/2.7 anyway) |
| P-5 | More troubleshooting scenarios: no-quote/route, deposit-sent-swap-pending (needs `deposit_speedup` semantics) |
| P-6 | README replacement (stock Mintlify starter), SEO metadata pass (og:description still says "swapping & bridging accessible to everyone") |
| P-7 | Changelog backfill if D-B = maintain; versioning/deprecation policy page once Q2.4 answered |
| P-8 | LI.FI page fate (Q3.3) and Deposit Address product docs (Q3.4) when product decides |
| P-9 | Audience-ranking validation once support/analytics data exists (Q3.1) |

## Marker cross-check

M1 ✅resolved · M2→S-7 · M3→S-8 · M4→**B-16** · M5→S-1 · M6→S-2 · M7/M8/M9→S-3 · M10→S-1 · M11→S-2 · M12→S-5 · M13→S-2 · M14→S-3 · M15→V-1 · M16→S-9 · M17→V-3 · M18→V-2 · M19→S-7 · M20→P-1 · M21→S-3/P-1 · M25 ✅resolved by PR #32 integration. All markers are accounted for in `14-open-markers.md`.
