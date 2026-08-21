# Migration Plan (Phase 14 — deliverable 3 of 4)

> Exact sequence for transforming the live tree into the Model C tree without losing validated work. All work happens on `docs-redesign`; **`main` receives nothing until Batch 8 validation passes** — that is how "no half-migrated state" is guaranteed. Within the branch, new pages are staged under a hidden preview tab so every batch is previewable in `mint dev` without disturbing the old nav.
>
> Inputs: `15-production-page-map.md` (targets), `16-widget-reconciliation-map.md` (widget corrections). 🚧 markers follow the convention in `07-clarification-log.md` and are tracked in `14-open-markers.md` (update it every batch).

## Staging mechanics

1. New tree is built at its **final paths** (`get-started/`, `concepts/`, `widget/`, `hosted-page/`, `api/`, `resources/`) batch by batch.
2. During batches 1–6, docs.json keeps the current tabs AND gains a hidden tab `"New docs (staging)"` listing finished new pages — old and new coexist on the branch only, never in production.
3. Batch 7 retires old files; Batch 8 replaces the nav wholesale, adds the `redirects` array, deletes the staging + prototypes tabs, and runs full validation.
4. Every batch ends with: `mint dev` build check → internal-link check → `grep -rn "🚧 Needs review"` reconciled against `14-open-markers.md` → orphan scan (`.mdx` on disk vs docs.json).
5. One commit per batch minimum; moves+merges of a page and its redirect entry land in the same commit so history stays traceable.

## Batch 0 — Pre-flight (no reader-visible change)

- Delete `widget-react-docs-plan copy.md` (internal; content already superseded by redesign/ artifacts — confirm nothing unique remains before deleting) and `snippets/quickstart.jsx` (abandoned).
- Create `snippets/` shared blocks needed later: the ~190-line swap type block (for event pages).
- Add the hidden staging tab to docs.json.
- Sanity: `git mv` availability for case-sensitive renames on macOS (`Compatability` → `compatibility` etc. — use two-step moves where needed).

## Batch 1 — Get Started

| Op | Detail |
|---|---|
| CREATE | `get-started/what-is-layerswap` (promote prototype; homepage-brief rules; claims per Q3.5 policy) |
| CREATE | `get-started/choose-your-integration` (promote prototype; merge decision-table content from `Integrate.mdx` + `IntegrationOverview.mdx`; add API column) |
| REWRITE→MOVE | `api-keys.mdx` → `get-started/api-keys` (add key-usage half, environment rule, next-step) |
| MOVE | `networks-tokens.mdx` → `get-started/networks-and-tokens` (+ prose fallback, frontmatter) |

Old pages stay in place until Batch 7. Markers added: M2, M3 carry over from prototypes.

## Batch 2 — Concepts

| Op | Detail |
|---|---|
| CREATE | `concepts/swap-lifecycle` (promote prototype; merge `api-reference/swap-lifecycle.mdx` + `api-reference/refunds.mdx`; V1 theme-neutral Mermaid; drop `exclude_deposit_actions`) |
| CREATE | `concepts/routes-quotes-limits` (promote prototype) |
| CREATE | `concepts/funding-methods` (net-new; V3 table; resolves marker M4) |
| REWRITE→MOVE | `fees.mdx` → `concepts/fees` (envelope fix ACC-1, taxonomy from real fields) |
| REWRITE | `security.mdx` → `concepts/security` (verifiable facts only; TRAIN frozen) |
| CREATE | `concepts/glossary` (from 08-terminology skeleton, ⚠️ items marked) |

## Batch 3 — Widget (largest batch; follow `16-widget-reconciliation-map.md` row by row)

3a. **Moves with corrections** (INTACT/INTACT+FIX rows): quickstart, how-it-works, configuration, initial-values (absorbing EasyDeposit + TabOptions), wallets, wagmi-config, theme-reference, events tree (kebab-case slugs + shared snippet), deposit-widget, vanilla-js, compatibility, playground.
3b. **Merges**: 3 customization pages → `widget/theming`.
3c. **Creates**: `widget/troubleshooting` (promote prototype + one-per-page/EIP-6963/provenance sections), `widget/add-deposits-to-your-wallet` (promote prototype).
3d. **Advanced group**: move SelfBundled/Migration with G3 reframe; move+slim wallet-management, native-wallet-packages (ACC-2 fix), partial-integration, custom-wallet-management (canonical Dynamic copy); build merged `wallet-providers` (10→1, ACC-7 fix); build merged `build-troubleshooting` (3→1).
3e. **Global passes over the batch**: G1 cdn.layerswap.io grep (`grep -rn "workers.dev"` must return zero in new tree), G2 version prose flagged verify-at-release, G4 environment wording, G5 dead `initialValues.theme`.

Validation extra: every code fence in moved pages compiles conceptually against `layerswapapp` (Phase-11 spot check happens per batch, full sweep in Batch 8).

## Batch 4 — Hosted Page

| Op | Detail |
|---|---|
| CREATE (merge) | `hosted-page/setup` ← `integration/UI/HostedPage.mdx` + `integration/UI/iFrame.mdx`. Canonical param names in ALL examples; legacy-alias table (single home); fix multi-line/`?`+`&` broken URLs (ACC-13); 5 named presets; iframe subsection with wallet-popup caveat + 🚧 frame-ancestors unknowns |
| CREATE | `hosted-page/track-completion` (verified workarounds only; 🚧 redirect/callback story) |

## Batch 5 — API

| Op | Detail |
|---|---|
| REWRITE | `integration/API.mdx` → `api/overview` (auth, base URL, endpoint map — CMP-1) |
| CREATE | `api/quickstart` (promote `build-your-first-api-swap`; V2 diagram; failures inline; markers M5–M9) |
| CREATE | `api/funding/transfer` (deposit_actions reading + EVM/BTC/Solana construction promoted from `lifi-integration.mdx`; 🚧 memo id) |
| MOVE | `api-reference/depository.mdx` → `api/funding/depository` (fix `depositAmountInBaseUnits`) |
| MOVE | `api-reference/gasless-swaps.mdx` → `api/funding/gasless` (ACC-5: spec wins — EIP-3009; ACC-16 fix; 🚧 Q2.8) |
| CREATE | `api/track-swaps` (polling + **V6 filter↔status mapping table** + by_transaction_hash + webhooks-vs-polling guidance) |
| REWRITE | `api-reference/webhook.mdx` → `api/webhooks` (Svix, payload example, marked gaps per Q2.5) |
| CREATE | `api/errors` (envelope, empty-body 400s, code table) |
| MOVE | `recipes/privy-wallets.mdx` → `api/recipes/privy-wallets` (D1 terminology pass) |
| KEEP | OpenAPI group untouched (swagger source; directory stays `api-reference` so generated endpoint URLs don't churn) |

Note: `api-reference/` keeps hosting ONLY the generated endpoint pages after batch 7 — prose pages all move out.

## Batch 6 — Resources

| Op | Detail |
|---|---|
| CREATE | `resources/production-checklist` (🚧 Q2.4 markers) |
| CREATE | `resources/partner-dashboard` (from clarification 3.11) |
| CREATE | `resources/support` (Telegram + 🚧 placeholder link M2/M19) |
| MOVE | `brand-assets.mdx` → `resources/brand-assets` (single pink #FF3272) |

## Batch 7 — Retirements & cleanup

Delete (git history preserves everything; each deletion's redirect lands in Batch 8's table):

- Old chooser pair: `Integrate.mdx`, `integration/UI/IntegrationOverview.mdx`
- `introduction.mdx`, old `fees.mdx`/`security.mdx`/`api-keys.mdx`/`networks-tokens.mdx` shells
- Merged sources: customization ×3, provider pages ×10, polyfill pages ×3, `iFrame.mdx`, `HostedPage.mdx`, `api-reference/{swap-lifecycle,refunds,webhook,depository,gasless-swaps}.mdx`, `integration/API.mdx`, `recipes/` dir
- Orphans: `Widget/Widget.mdx`, `EasyDeposit.mdx`, `TabOptions.mdx`, `ImmutablePartnerDocs.mdx`, `StarknetPartnerDocs.mdx`
- Starknet pair: `Starknet/Starknet.mdx`, `Starknet/StarknetWithDynamics.mdx` (🚧 Q3.2 noted in commit message)
- Old widget tree paths (everything now under `widget/`)
- `prototypes/` directory (all promoted)
- `changelog/api.mdx` — **pending the team decision in the blocker table; if undecided at this point, keep hidden**

Explicitly NOT deleted: `DepositAddress.mdx` + `snippets/depositWidget.jsx` (frozen, tab hidden in Batch 8 pending Babken's OK), `lifi-integration.mdx` (hidden, Q3.3), `snippets/networksTokens.jsx`.

## Batch 8 — Final navigation, redirects, validation

1. Rewrite docs.json navigation: 6 tabs (Get Started · Concepts · Widget · Hosted Page · API · Resources), remove staging + prototypes tabs, hide DepositAddress tab (pending Q3.4 sign-off — if Babken objects, it stays visible with a prose frame added). Group labels per terminology: **"Self-bundled Widget — Advanced"**.
2. Theme color: keep `#E05B8A` vs align to `#FF3272` family — 🚧 decision; default = leave as-is, flag.
3. Add `redirects` array (below).
4. Full validation gate (all must pass before merge to `main`):
   - `mint dev` / Mintlify build clean; `docs.json` schema-valid
   - link check (no broken internal links; no links to retired paths)
   - orphan scan: every `.mdx` on disk is in nav, hidden-by-decision, or a snippet
   - `grep -rn "workers.dev"` → 0 hits; `grep -rn "destAddress\|sourceExchangeName"` → only alias-table + partner-dashboard note; `grep -rn "Legacy"` → only migration-context uses
   - 🚧 sweep: every marker in pages ↔ `14-open-markers.md` ↔ `18-release-blocker-table.md` agree
   - Phase-11 executable-example sweep (imports, package names, props, endpoints, envelopes) against `layerswapapp` GitHub + live swagger — anything unverifiable gets a marker, not a guess
5. Phase-14 journey walkthroughs (the 7 personas in the continuation brief) — fix breaks, then merge.

## Redirect table (docs.json `redirects`)

| Old path | New path |
|---|---|
| `/introduction` | `/get-started/what-is-layerswap` |
| `/Integrate` | `/get-started/choose-your-integration` |
| `/integration/UI/IntegrationOverview` | `/get-started/choose-your-integration` |
| `/api-keys` | `/get-started/api-keys` |
| `/networks-tokens` | `/get-started/networks-and-tokens` |
| `/fees` | `/concepts/fees` |
| `/security` | `/concepts/security` |
| `/brand-assets` | `/resources/brand-assets` |
| `/api-reference/swap-lifecycle` | `/concepts/swap-lifecycle` |
| `/api-reference/refunds` | `/concepts/swap-lifecycle` |
| `/api-reference/depository` | `/api/funding/depository` |
| `/api-reference/gasless-swaps` | `/api/funding/gasless` |
| `/api-reference/webhook` | `/api/webhooks` |
| `/integration/API` | `/api/overview` |
| `/recipes/privy-wallets` | `/api/recipes/privy-wallets` |
| `/Playground` | `/widget/playground` |
| `/integration/UI/HostedPage` | `/hosted-page/setup` |
| `/integration/UI/iFrame` | `/hosted-page/setup` |
| `/integration/UI/Configurations` | `/widget/initial-values` |
| `/integration/UI/Widget/Quickstart` | `/widget/quickstart` |
| `/integration/UI/Widget/HowItWorks` | `/widget/how-it-works` |
| `/integration/UI/Widget/Configuration` | `/widget/configuration` |
| `/integration/UI/Widget/Wallets` | `/widget/wallets` |
| `/integration/UI/Widget/WagmiConfig` | `/widget/wagmi-config` |
| `/integration/UI/Widget/DepositWidget` | `/widget/deposit-widget` |
| `/integration/UI/Widget/VanillaJS` | `/widget/vanilla-js` |
| `/integration/UI/Widget/Compatability` | `/widget/compatibility` |
| `/integration/UI/Widget/Widget` | `/widget/quickstart` |
| `/integration/UI/Widget/EasyDeposit` | `/widget/initial-values` |
| `/integration/UI/Widget/TabOptions` | `/widget/initial-values` |
| `/integration/UI/Widget/ImmutablePartnerDocs` | `/widget/advanced/self-bundled` |
| `/integration/UI/Widget/StarknetPartnerDocs` | `/widget/advanced/custom-wallet-management` |
| `/integration/UI/Widget/Customization/CustomizationIntroduction` | `/widget/theming` |
| `/integration/UI/Widget/Customization/Colors` | `/widget/theming` |
| `/integration/UI/Widget/Customization/ThemeExamples` | `/widget/theming` |
| `/integration/UI/Widget/Customization/ThemeConfiguration` | `/widget/theme-reference` |
| `/integration/UI/Widget/EventCallbacks/EventsIntroduction` | `/widget/events/overview` |
| `/integration/UI/Widget/EventCallbacks/onFormChange` | `/widget/events/on-form-change` |
| `/integration/UI/Widget/EventCallbacks/onSwapCreate` | `/widget/events/on-swap-create` |
| `/integration/UI/Widget/EventCallbacks/onSwapComplete` | `/widget/events/on-swap-complete` |
| `/integration/UI/Widget/EventCallbacks/onSwapStatusChange` | `/widget/events/on-swap-status-change` |
| `/integration/UI/Widget/EventCallbacks/onSwapModalStateChange` | `/widget/events/on-swap-modal-state-change` |
| `/integration/UI/Widget/EventCallbacks/onBackClick` | `/widget/events/on-back-click` |
| `/integration/UI/Widget/EventCallbacks/onMenuNavigationChange` | `/widget/events/on-menu-navigation-change` |
| `/integration/UI/Widget/EventCallbacks/onError` | `/widget/events/on-error` |
| `/integration/UI/Widget/Legacy/SelfBundled` | `/widget/advanced/self-bundled` |
| `/integration/UI/Widget/Legacy/Migration` | `/widget/advanced/migrate-to-widget-react` |
| `/integration/UI/Widget/WalletManagement/WalletManagement` | `/widget/advanced/wallet-management` |
| `/integration/UI/Widget/WalletManagement/NativeWalletPackages` | `/widget/advanced/native-wallet-packages` |
| `/integration/UI/Widget/WalletManagement/PartialIntegration` | `/widget/advanced/partial-integration` |
| `/integration/UI/Widget/WalletManagement/CustomWalletManagement` | `/widget/advanced/custom-wallet-management` |
| `/integration/UI/Widget/WalletManagement/{EVM,Bitcoin,Solana,Starknet,Fuel,Ton,Tron,Paradex,ImmutablePassport,ImmutableX}Provider` (10 entries) | `/widget/advanced/wallet-providers` |
| `/integration/UI/Widget/Starknet/Starknet` | `/widget/advanced/custom-wallet-management` |
| `/integration/UI/Widget/Starknet/StarknetWithDynamics` | `/widget/advanced/custom-wallet-management` |
| `/integration/UI/Widget/Troubleshooting/VitePolyfills` | `/widget/advanced/build-troubleshooting` |
| `/integration/UI/Widget/Troubleshooting/NextPolyfills` | `/widget/advanced/build-troubleshooting` |
| `/integration/UI/Widget/Troubleshooting/NextTranspilePackages` | `/widget/advanced/build-troubleshooting` |
| `/prototypes/*` (8 pages) | their production counterparts (map rows 1, 2, 5, 6, 21, 24, 38; `reference-example-get-swaps` → `/api/track-swaps`) |

## Sequencing rationale & risk notes

- **Concepts before method tabs** (Batch 2 before 3–5) so method pages can link canonical homes instead of restating — Phase-4 rule.
- **Widget before Hosted Page/API**: it's the largest validated corpus; landing it early surfaces snippet/convention issues while there's still time to adjust patterns.
- **Retirements after all creations**: no window where a topic has zero homes.
- **The nav swap is atomic** (one commit) — the only moment old URLs stop resolving internally, and the same commit ships every redirect.
- Release-time re-verification (npm versions, CDN origin live, `mountDepositWidget`, playground) is a **separate gate from the merge** — see `18-release-blocker-table.md`. If docs must merge before the package release, the merge waits: docs and packages ship simultaneously (Q1.1).
