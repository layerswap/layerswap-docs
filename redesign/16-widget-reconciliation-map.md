# Widget Reconciliation Map (Phase 14 — deliverable 2 of 4)

> Maps the already-rewritten widget-react docs (workstream A) into the approved Model C structure — page by page, with the exact correction list each page must absorb before it ships. **The rewrite is the primary factual source; nothing here discards validated technical work.** Corrections come from `raw-audits/verification-*.md` (code-verified) and `07-clarification-log.md` (team-decided).
>
> Disposition codes: **INTACT** = content survives ~as-is, path/nav change only · **INTACT+FIX** = survives with listed corrections · **MERGE→** = absorbed into named target · **SPLIT** = content divides across targets · **RETIRE** = removed with redirect.

## Global corrections (apply to every page they touch)

| ID | Correction | Source of truth |
|----|-----------|----------------|
| G1 | Every CDN/CSP reference: `layerswap-widget-cdn.layerswapcdn.workers.dev` → **`cdn.layerswap.io`** | Q1.2. Engineering dependency ENG-1 (loader `DEFAULT_MANIFEST_URL`) tracked in blocker table |
| G2 | Versioning prose: all packages release at **2.0.0**; "1.x → /v1/manifest.json" channel claims re-derived at release (likely /v2) | Q1.1/Q1.3 — verify-at-release |
| G3 | "Legacy" framing → "Self-bundled Widget — Advanced"; banners say "recommended alternative" not "deprecated" | Q1.3 |
| G4 | `version` prop described with **environment** vocabulary (D7): "environment is selected by your API key; `version` must match" | 08-terminology |
| G5 | Named theme presets do NOT work via widget `initialValues.theme` (dead field) — hosted-page query param only | U-34 |
| G6 | ManifestError has exactly **5** reasons — no `'incompatible'`; no runtime protocol-compat check | U-30 |
| G7 | Install/import examples: verify package names + versions at release (npm currently 404 for widget-react/js/types) | REL-1 |

## Current-model pages (the workstream-A rewrite)

| Current page | Disposition | Target (Model C) | Page type | Required corrections & notes |
|---|---|---|---|---|
| `Widget/Quickstart.mdx` | INTACT+FIX | `widget/quickstart` | Quickstart | G1, G2, G4, G7. Link playground (Q1.6) and `get-started/api-keys`. Ends with explicit next steps (initial-values, wallets, events). |
| `Widget/HowItWorks.mdx` | INTACT+FIX | `widget/how-it-works` | Concept·Reference | G1 (CSP snippet is the highest-risk instance), G2 (channel), G6. Apply U-30 verified facts: P-256 signature, SHA-384 SRI fail-closed, kill switch pre-verification, 30-day TTL + 5-min skew (mount-time only), 60s resolve reuse, console provenance line. Add V5 diagram. Canonical home of widget delivery security — `concepts/security` links here, never restates. |
| `Widget/Configuration.mdx` | INTACT+FIX | `widget/configuration` | Reference | G4, G5 (remove/mark `initialValues.theme`), note `imtblPassport` deprecated-config-field vs `immutablePassport` defaults key asymmetry (U-31) with pointer to wallets page. Resolves `Configuration`/`Configurations` collision (TERM-4) since the other page becomes `widget/initial-values`. |
| `integration/UI/Configurations.mdx` ("Initial Values") | INTACT+FIX, absorbs 2 orphans | `widget/initial-values` | Reference·Task guide | U-34 pack: `amount` is string; `depositMethod` honors only `wallet\|deposit_address`; `defaultTab` exactly `swap\|cex\|deposit`; Easy-Deposit autofill overwrites `destination_address` (Deposit Widget is the lock); `externalId`→`reference_id`. Absorb TabOptions' unique CEX-flow prose + EasyDeposit content. Legacy aliases: awareness note only — full table lives in `hosted-page/setup`. "Easy Deposit" naming → "Deposit tab" ⚠️ (D2). |
| `Widget/Wallets.mdx` | INTACT+FIX | `widget/wallets` | Reference | U-31: document BOTH ids (`imtblPassport` provider id / `immutablePassport` defaults key); add Passport shape `{publishableKey, clientId, redirectUri, logoutRedirectUri}` (all required); TON both fields required; TON/Passport appear only when configured; EVM(+Passport) eager, others lazy. |
| `Widget/WagmiConfig.mdx` | INTACT+FIX | `widget/wagmi-config` | Task guide | C1/U-33: config adopted **verbatim** — widget does NOT append chains; host must include needed chains; late config dropped with warning. Fix undefined `queryClient` (ACC-15). EIP-6963 duplicate-wallet gotcha → cross-link troubleshooting. |
| `Customization/CustomizationIntroduction.mdx` | MERGE→ | `widget/theming` | Task guide | Becomes the intro section. |
| `Customization/Colors.mdx` | MERGE→ | `widget/theming` | Task guide | Field-by-field docs move to theme-reference (single owner, DUP-4); this keeps the how-to (RGB triples, examples). |
| `Customization/ThemeExamples.mdx` | MERGE→ | `widget/theming` | Task guide | Keep examples; replace drifting SVG mockups with playground links where possible 🚧 (visual backlog rule). |
| `Customization/ThemeConfiguration.mdx` | INTACT+FIX | `widget/theme-reference` | Reference | U-37: borderRadius = enum selecting 6-step scales (current table wrong — rebuild from code); CSS vars list incl. `--ls-border-radius-{sm..3xl,full,default}`; deep-merge over `default` preset with the shallow-LayerswapProvider caveat; fix link to orphan TabOptions → `widget/initial-values`. G5 presets note. `hidePoweredBy` documented without caveats (Q3.9). |
| `EventCallbacks/EventsIntroduction.mdx` | INTACT | `widget/events/overview` | Reference | 8 callbacks, try/catch-wrapped, `unknown`-typed publicly (U-36/U-40). Note callback parity with self-bundled ≥1.2.x. |
| `EventCallbacks/onFormChange.mdx` | INTACT+FIX | `widget/events/on-form-change` | Reference | U-36: **all payload fields optional** — current required-strings table is wrong (ACC-12). |
| `EventCallbacks/onSwapCreate.mdx` | INTACT+FIX | `widget/events/on-swap-create` | Reference | Replace inline 190-line type dump with shared snippet include (DUP-2). |
| `EventCallbacks/onSwapComplete.mdx` | INTACT+FIX | `widget/events/on-swap-complete` | Reference | Same snippet include. |
| `EventCallbacks/onSwapStatusChange.mdx` | INTACT+FIX | `widget/events/on-swap-status-change` | Reference | U-36: `path` = emitting screen (only `'Processing'` today); fires for exactly 4 statuses — enumerate. |
| `EventCallbacks/onSwapModalStateChange.mdx` | INTACT+FIX | `widget/events/on-swap-modal-state-change` | Reference | Define "swap modal" on-page. |
| `EventCallbacks/onBackClick.mdx` | INTACT | `widget/events/on-back-click` | Reference | — |
| `EventCallbacks/onMenuNavigationChange.mdx` | INTACT+FIX | `widget/events/on-menu-navigation-change` | Reference | U-36: enumerate paths `/`, `/transactions`, `/campaigns`. |
| `EventCallbacks/onError.mdx` | INTACT+FIX | `widget/events/on-error` | Reference | Source re-check on 2026-08-11 confirms 19 discriminants (the earlier audit count of 18 was off by one); flag as hand-maintained code mirror (DX-2, post-release generation candidate). |
| `Widget/DepositWidget.mdx` | INTACT+FIX | `widget/deposit-widget` | Reference | U-35: `polymarket` public (Q1.5) — needs the one-line description (M16 🚧); `defaultAmountUsd` default 1, `0` disables. |
| `Widget/VanillaJS.mdx` | INTACT+FIX | `widget/vanilla-js` | Quickstart | U-39: ESM-only, remote bundles own React, `wagmiConfig`/`loadingComponent` type-excluded, second mount throws, mixing loaders throws. **`mountDepositWidget` does not exist in code** — keep per Q1.4 with M17 verify-at-release marker; do NOT present as shipped until verified. |
| `Widget/Compatability.mdx` | INTACT+FIX (slug) | `widget/compatibility` | Reference | U-32: peer ranges real; soften "React 17 rejected at runtime" (peer range only, no explicit check). Slug fix → redirect. |
| `integration/UI/IntegrationOverview.mdx` | RETIRE (merge) | `get-started/choose-your-integration` | — | Its decision table informs the chooser; API column added (J1 fix); Get-Started cards must match the table. |

## Legacy group → Advanced group

| Current page | Disposition | Target | Notes |
|---|---|---|---|
| `Legacy/SelfBundled.mdx` | INTACT+FIX | `widget/advanced/self-bundled` | G3 reframe; 2.0.0 note (G2); zustand peer `^4.5.7` range. |
| `Legacy/Migration.mdx` | INTACT+FIX | `widget/advanced/migrate-to-widget-react` | Most valuable legacy page. Add support-contact placeholder 🚧 (Q3.8) for custom-provider users (no new-model equivalent — state plainly per style guide). |
| `WalletManagement/WalletManagement.mdx` | INTACT+FIX, slim | `widget/advanced/wallet-management` | Cut duplicated quick-starts; fix `useChainConfigs(settings.networks)` before-load-guard bug (ACC-15, ×3 pages). |
| `WalletManagement/NativeWalletPackages.mdx` | INTACT+FIX | `widget/advanced/native-wallet-packages` | **ACC-2/U-41: `wallet-imtbl-*` is correct; the `wallet-immutable-*` ecosystem section is wrong — fix.** Add Advanced banner. |
| `WalletManagement/PartialIntegration.mdx` | INTACT+FIX | `widget/advanced/partial-integration` | Banner + WagmiConfig pointer; `WidgetLoading`-before-import fix (ACC-15). |
| `WalletManagement/CustomWalletManagement.mdx` | INTACT — becomes canonical | `widget/advanced/custom-wallet-management` | THE Dynamic example (`ready: true` required, `disconnectWallets` present — U-41). Absorbs the two stale copies. |
| `WalletManagement/EVMProvider.mdx` | MERGE→ (substantive section) | `widget/advanced/wallet-providers` | Most substantive provider page — leads the merged page. |
| `WalletManagement/TonProvider.mdx` | MERGE→ (substantive section) | `widget/advanced/wallet-providers` | Credentials/manifest content survives intact. |
| `WalletManagement/ImmutablePassportProvider.mdx` | MERGE→ (substantive section) | `widget/advanced/wallet-providers` | Hub setup survives; fix likely-wrong imports (ACC-7 notes this page too). |
| `WalletManagement/{Bitcoin,Solana,Starknet,Fuel,Tron}Provider.mdx` | MERGE→ (matrix rows) | `widget/advanced/wallet-providers` | ~90–95% boilerplate (DUP-7): factory import + install line each; WalletConnect block appears ONCE. |
| `WalletManagement/ParadexProvider.mdx` | MERGE→ (matrix row) | `widget/advanced/wallet-providers` | **Fix ACC-7/U-41: package peer-depends on wallet-evm/starknet, does NOT re-export `createEVMProvider`/`createStarknetProvider`** — corrected import shown. |
| `WalletManagement/ImmutableXProvider.mdx` | MERGE→ (matrix row) | `widget/advanced/wallet-providers` | Pure boilerplate; note npm-published-only status. |
| `Starknet/Starknet.mdx` | RETIRE (fold unique bits) | → `widget/advanced/custom-wallet-management` | 🚧 Q3.2. Redirect; content recoverable from git if the partner vertical is active. Fix `{DYNAMIC_ENVIRONMENT_ID}` placeholder syntax (ACC-14) in whatever survives. |
| `Starknet/StarknetWithDynamics.mdx` | RETIRE | → `widget/advanced/custom-wallet-management` | The broken copy (missing required `ready: true` — ACC-4/U-41). Nothing to salvage. |
| `Troubleshooting/VitePolyfills.mdx` | MERGE→ | `widget/advanced/build-troubleshooting` | Own H2 section; banner preserved for search landings. |
| `Troubleshooting/NextPolyfills.mdx` | MERGE→ | `widget/advanced/build-troubleshooting` | Note Turbopack gap. |
| `Troubleshooting/NextTranspilePackages.mdx` | MERGE→ | `widget/advanced/build-troubleshooting` | Verify `wallet-module-*` package names against npm. |

## Orphans (widget tree)

| Orphan | Disposition | Target | Notes |
|---|---|---|---|
| `Widget/Widget.mdx` | RETIRE | redirect → `widget/quickstart` | 3-line stub. |
| `Widget/EasyDeposit.mdx` | MERGE→ | `widget/initial-values` | Deposit-tab flow + autofill caveat; in-nav Configurations already links here (STR-1) — merge heals the dangling link. |
| `Widget/TabOptions.mdx` | MERGE→ | `widget/initial-values` | **Preserve the unique "Deposit from CEX" prose** (only home of the CEX-flow explanation). ThemeConfiguration's link updated. |
| `Widget/ImmutablePartnerDocs.mdx` | RETIRE | redirect → `widget/advanced/self-bundled` | Old-model content labeled "new version" (OUT-3); 🚧 Q3.2. |
| `Widget/StarknetPartnerDocs.mdx` | RETIRE | redirect → `widget/advanced/custom-wallet-management` | 3rd Dynamic copy; fix nothing, redirect only. |

## Duplication-register outcomes (Phase 7 obligations discharged here)

| Register item | Resolution |
|---|---|
| Widget architecture / CSP / loader | ONE home: `widget/how-it-works`. Quickstart + troubleshooting + concepts/security link, never restate. |
| Wallets & wagmi | `widget/wallets` (providers/credentials) + `widget/wagmi-config` (sharing semantics); Advanced pages cover self-bundled model only, with banners pointing to the new-model pages. |
| Configuration vs initial values | `widget/configuration` = the `config` prop; `widget/initial-values` = prefill/lock fields + tab flows. One-letter collision resolved by rename. |
| Themes | how-to in `widget/theming`; every field/scale/var defined once in `widget/theme-reference`. |
| Events type dump (DUP-2) | one shared snippet, included. |
| Dynamic example ×3 (DUP-1) | one corrected copy in `widget/advanced/custom-wallet-management`. |
| Provider boilerplate ×10 (DUP-7) | one `wallet-providers` page. |
| "One widget per page" ×3 phrasings (DUP-8) | canonical statement in `widget/troubleshooting`; compatibility + vanilla-js link it. |
| Tab/locking facts ×4 pages (DUP-3) | canonical in `widget/initial-values`. |
| Self-bundled security/architecture | stays in `widget/advanced/self-bundled`; never restated in new-model pages. |
