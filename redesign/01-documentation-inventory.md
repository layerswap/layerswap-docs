# Documentation Inventory (Phase 1)

> Every page in the repo, its current role, git state, and a **provisional** disposition. Verdicts are audit inputs, not decisions — nothing is renamed/moved/removed without confirmation.
> Git states: ✅ committed-clean · ✏️ modified (in-flight restructure) · 🆕 untracked-new · 👻 orphan (on disk, not in docs.json nav).
> Full per-page findings: `raw-audits/batch-{A,B,C,D}-*.md`.

## Overview tab ("About Layerswap")

| Page | State | Type | Role today | Provisional verdict |
|---|---|---|---|---|
| `introduction.mdx` | ✅ | marketing | Product positioning + partner logos | Rewrite — no internal links, superlative claims, typos |
| `Integrate.mdx` | ✅ | router | Pick Widget/API/iFrame/Hosted | Keep w/ edits; dedup vs IntegrationOverview |
| `api-keys.mdx` | ✅ | how-to (thin) | Dashboard registration → keys | Keep w/ edits; add "use the key" half + next step |
| `fees.mdx` | ✅ | concept+ref | Fee components + quote API | Keep w/ edits; auth ambiguity, envelope conflict |
| `networks-tokens.mdx` | ✅ | interactive ref | Live networks/tokens embed | Keep w/ edits; hardcoded snippet API key, no prose |
| `security.mdx` | ✅ | marketing | Audit link + TRAIN teaser | Rewrite — no actual security model |
| `brand-assets.mdx` | ✅ | reference | Logo/color downloads | Keep w/ edits; two conflicting pinks |

## Standalone tabs

| Page | State | Type | Role today | Provisional verdict |
|---|---|---|---|---|
| `DepositAddress.mdx` (visible tab) | ✅ | interactive demo | Unlabeled live deposit widget, prod API | Relocate/rework — needs prose frame; real-funds question |
| `Playground.mdx` | ✅ | interactive demo | playground.layerswap.io iframe | Keep w/ edits; add context + fallback link |
| `lifi-integration.mdx` (hidden) | ✅ | partner memo | LI.FI end-to-end API guide | Split — promote BTC/Solana deposit mechanics to public docs |
| `changelog/api.mdx` (hidden) | ✅ | changelog | One stale 2024 entry | Remove or commit to maintaining |

## UI Integration tab — current/new model

| Page | State | Model | Provisional verdict |
|---|---|---|---|
| `integration/UI/IntegrationOverview.mdx` | ✏️ | new (decision table) | Keep w/ edits |
| `integration/UI/Configurations.mdx` ("Initial Values") | ✏️ | widget+hosted+iframe | Keep w/ edits; `Configuration`/`Configurations` collision |
| `integration/UI/iFrame.mdx` | ✅ | hosted params (legacy names) | Light rewrite — legacy params, broken example URLs |
| `integration/UI/HostedPage.mdx` | ✅ | hosted params (mixed names) | Keep w/ edits |
| `Widget/Quickstart.mdx` | ✏️ | **new** widget-react | Keep (flagship); ⛔ blocked on npm publish |
| `Widget/HowItWorks.mdx` | 🆕 | new | Keep; ⛔ gate on code verification + CDN origin sign-off |
| `Widget/Configuration.mdx` | 🆕 | new | Keep; naming collision, typings to verify |
| `Widget/Wallets.mdx` | 🆕 | new | Keep; `imtblPassport` vs `immutablePassport` |
| `Widget/WagmiConfig.mdx` | 🆕 | new | Keep; fix undefined `queryClient` |
| `Widget/DepositWidget.mdx` | ✏️ | new | Keep; undocumented `polymarket` method |
| `Widget/VanillaJS.mdx` | 🆕 | new (widget-js) | Keep |
| `Widget/Compatability.mdx` | ✏️ | new | Merge candidate; misspelled slug |
| `Customization/CustomizationIntroduction.mdx` | ✏️ | new | Keep w/ edits |
| `Customization/Colors.mdx` | ✏️ | theme | Keep; de-dup field ownership vs ThemeConfiguration |
| `Customization/ThemeConfiguration.mdx` | ✏️ | new | Keep; links to orphan TabOptions; verify px/CSS vars |
| `Customization/ThemeExamples.mdx` | ✏️ | new | Keep w/ edits |
| `EventCallbacks/EventsIntroduction.mdx` | ✏️ | new | Keep |
| `EventCallbacks/onFormChange.mdx` | ✏️ | new | Keep; payload optionality |
| `EventCallbacks/onSwapCreate.mdx` | ✏️ | new | Keep; extract shared type dump |
| `EventCallbacks/onSwapComplete.mdx` | ✏️ | new | Keep; same type dump duplicated |
| `EventCallbacks/onSwapStatusChange.mdx` | 🆕 | new | Keep; explain `path` |
| `EventCallbacks/onSwapModalStateChange.mdx` | ✏️ | new | Keep + define "swap modal" |
| `EventCallbacks/onBackClick.mdx` | ✏️ | new | Keep w/ edits |
| `EventCallbacks/onMenuNavigationChange.mdx` | 🆕 | new | Keep; enumerate paths |
| `EventCallbacks/onError.mdx` | ✏️ | new | Keep; verify 18-type union vs code |

## UI Integration tab — Legacy group

| Page | State | Provisional verdict |
|---|---|---|
| `Legacy/SelfBundled.mdx` | 🆕 | Keep as legacy hub |
| `Legacy/Migration.mdx` | 🆕 | Keep — most valuable legacy page; add contact link |
| `WalletManagement/WalletManagement.mdx` | ✏️ (banner) | Keep, slim (cut duplicated quick-starts) |
| `WalletManagement/NativeWalletPackages.mdx` | ✅ | Keep; **fix contradictory Immutable package names**, add banner |
| `WalletManagement/PartialIntegration.mdx` | ✅ | Keep; add banner + WagmiConfig pointer |
| `WalletManagement/CustomWalletManagement.mdx` | ✅ | Keep — canonical Dynamic example; absorb StarknetWithDynamics |
| `WalletManagement/EVMProvider.mdx` | ✅ | Keep (most substantive provider page) |
| `WalletManagement/BitcoinProvider.mdx` | ✅ | Merge → provider matrix (~90–95% boilerplate) |
| `WalletManagement/SolanaProvider.mdx` | ✅ | Merge → provider matrix |
| `WalletManagement/StarknetProvider.mdx` | ✅ | Merge → provider matrix |
| `WalletManagement/FuelProvider.mdx` | ✅ | Merge → provider matrix |
| `WalletManagement/TonProvider.mdx` | ✅ | Keep — credentials/manifest still relevant to new model |
| `WalletManagement/TronProvider.mdx` | ✅ | Merge → provider matrix |
| `WalletManagement/ParadexProvider.mdx` | ✅ | Merge; **likely-wrong imports** |
| `WalletManagement/ImmutablePassportProvider.mdx` | ✅ | Keep — Hub setup still relevant to new model |
| `WalletManagement/ImmutableXProvider.mdx` | ✅ | Merge/remove (pure boilerplate) |
| `Starknet/Starknet.mdx` | ✏️ (banner+links) | Keep only if active partner vertical; else merge unique bits |
| `Starknet/StarknetWithDynamics.mdx` | ✏️ (link only, **no banner**) | Remove/merge into CustomWalletManagement (stale duplicate missing "critical" `ready: true`) |
| `Troubleshooting/VitePolyfills.mdx` | ✏️ (banner) | Keep as legacy |
| `Troubleshooting/NextPolyfills.mdx` | ✏️ (banner) | Keep; note Turbopack gap |
| `Troubleshooting/NextTranspilePackages.mdx` | ✏️ (banner) | Keep; verify `wallet-module-*` package names |

## API Integration tab

| Page | State | Provisional verdict |
|---|---|---|
| `integration/API.mdx` | ✅ (2025-04) | **Rewrite** as real quickstart — no auth/base-URL/endpoints/links today |
| `api-reference/depository.mdx` | ✅ | Keep w/ edits (strongest API page) |
| `api-reference/gasless-swaps.mdx` | ✅ | Keep w/ edits; EIP-3009 vs ERC-2612 spec mismatch |
| `api-reference/swap-lifecycle.mdx` | ✅ | Keep w/ edits; add fail_reason + tx-level statuses; fix dark-only diagram |
| `api-reference/refunds.mdx` | ✅ | Keep w/ edits; **🔴 URGENT: committed API key — rotate & redact**; merge-into-lifecycle candidate |
| `api-reference/webhook.mdx` | ✅ (2024-12) | **Rewrite** — wrong typo'd description, dead "Swap Data object" reference, no payload/retry semantics |
| `recipes/privy-wallets.mdx` | ✅ | Keep w/ edits; only "bridge"-first page |
| OpenAPI embed (`api.layerswap.io/swagger/v2/swagger.json`) | live | 17 ops; good op descriptions; **zero parameter descriptions**; key schemas bare; snake_case vs PascalCase status-enum trap |

## Orphans (on disk, not in nav)

| Page | State | Provisional verdict |
|---|---|---|
| `Widget/Widget.mdx` | ✅👻 | Remove — 3-line stub, mismatched title |
| `Widget/EasyDeposit.mdx` | ✏️👻 | Relocate into nav or merge into a flows page (Configurations links to it!) |
| `Widget/TabOptions.mdx` | ✏️👻 | Merge — but its "Deposit from CEX" prose is unique, preserve it |
| `Widget/ImmutablePartnerDocs.mdx` | ✏️👻 | Old-model content labeled "new version" — relocate to Legacy or rewrite; ask if URL is live with partner |
| `Widget/StarknetPartnerDocs.mdx` | ✏️👻 | Remove after diff (3rd copy of the Dynamic example) + redirect |

## Non-page assets flagged

- `snippets/networksTokens.jsx` — hardcoded `DEFAULT_API_KEY` (exposure question)
- `snippets/quickstart.jsx` — abandoned by Quickstart rewrite, still on disk
- `snippets/depositWidget.jsx` — powers DepositAddress tab; prod API + demo addresses
- `widget-react-docs-plan copy.md` — internal plan at repo root; must not ship
- `README.md` — still the untouched Mintlify starter README (mentions `mint.json`, which doesn't exist — repo uses `docs.json`)
