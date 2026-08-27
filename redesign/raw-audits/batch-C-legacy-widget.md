# Raw audit — Batch C: "Self-bundled Widget (Legacy)" group (21 pages)

> Agent-produced Phase 1 audit, unedited in substance. Verdicts are provisional inputs, not decisions.

## Legacy hub pages (both untracked/new, part of in-flight restructure)

### `Legacy/SelfBundled.mdx` — new
- Entry hub for the legacy path; install content delegated to `/snippets/quickstart.jsx` (currently correct for the legacy stack: `@layerswap/widget`, `@layerswap/wallets`, `zustand@4.5.7`, CSS import) — no static fallback; silently breaks if snippet is repurposed.
- Orphaned zustand explainer sentence; typo "dependant"; troubleshooting card links straight to NextPolyfills instead of an index.
- Verdict: keep as legacy (designed entry point).

### `Legacy/Migration.mdx` — new
- Migration how-to, thorough: package swap, provider-tree → single component, full `walletProviders` → `walletProvidersConfig`/`walletDefaults` mapping, bundler-workaround deletion list, behavioral differences (CDN auto-updates, one-widget-per-page, prop reference-equality, CSP).
- Gaps: custom `WalletProvider` users get "talk to the Layerswap team" with **no contact link**; `npm uninstall zustand` lacks a caution; several claims need verification against widget-react source (identical callbacks, config compat, npm-major=protocol-channel, wagmi types-only peer, deposit `methods={['deposit_address']}` equivalence).
- Verdict: keep — single most valuable page in the group.

## Wallet Management (hub modified w/ legacy banner; children unchanged, **no banners**)

### `WalletManagement.mdx` — modified (banner added)
- Heavy duplication: three "Quick Start Examples" restate NativeWalletPackages / PartialIntegration / CustomWalletManagement (~40 lines near-identical to PartialIntegration Step 3); ecosystems list duplicates NativeWalletPackages.
- Import-source inconsistency: `@layerswap/wallets` vs individual `@layerswap/wallet-*` (never explained).
- Code bug: `useChainConfigs(settings.networks)` called before the loading guard (settings undefined) — same pattern in PartialIntegration.
- Verdict: keep as legacy but slim (cut quick-start examples).

### `NativeWalletPackages.mdx` — unchanged
- **Package-name contradiction (accuracy):** ecosystems section says `@layerswap/wallet-immutable-passport` / `wallet-immutablex`; the same page's package list, provider pages, and NextTranspilePackages say `wallet-imtbl-passport` / `wallet-imtbl-x`. One set is wrong.
- First two examples omit `config={{ apiKey, version }}` on `LayerswapProvider`; installs omit zustand (vs pins elsewhere); says "recommended approach for most integrations" — contradicts legacy framing; no legacy banner.
- Verdict: keep as legacy; fix names + banner.

### `PartialIntegration.mdx` — unchanged
- Import inconsistency (`@layerswap/wallets` vs `@layerswap/wallet-evm` for same functions); same settings-loading bug; `WidgetLoading` used before import; no banner; **never mentions the new-model equivalent (`wagmiConfig` prop / WagmiConfig page)** — search-landing risk.
- Verdict: keep as legacy; add banner + WagmiConfig pointer.

### `CustomWalletManagement.mdx` — unchanged
- Interface declared as a function type but examples annotate hooks returning the object — one is wrong.
- Truncated example doesn't satisfy its own required-fields table.
- Contains the **corrected** version of the Dynamic Labs example that StarknetWithDynamics duplicates (~200 lines verbatim; this copy has `ready: true` + `disconnectWallets`, the other omits them).
- Documents the one pattern Migration declares "not supported in CDN model" — highest legacy-only value.
- External flags: cloud.walletconnect.com (Reown rebrand redirect), GitHub `dev-monorepo` branch-pinned example links (×3), vercel demo.
- Verdict: keep as legacy; make canonical Dynamic example; merge StarknetWithDynamics into it.

## Ten provider pages (all unchanged, none has a legacy banner, none has a frontmatter description)

Shared skeleton ≈70–75% boilerplate overall; 6 pages (Bitcoin, Solana, Starknet, Fuel, Tron, ImmutableX) are ~90–95% template — only package/factory names + dep list differ. Verbatim WalletConnect block on EVM/Solana/Starknet. Install code fences mislabeled ` ```typescript ` instead of ` ```bash `.

Chain-specific substance exists on exactly 4 pages:
- **TonProvider** — `tonApiKey` via Telegram `@tonapibot`, rate limits, full `tonconnect-manifest.json` reference. **Still relevant to new model** (`walletDefaults.ton`).
- **ImmutablePassportProvider** — Immutable Hub setup, `redirectUri`/`ImtblRedirectPage` flow. **Still relevant** (`walletDefaults.immutablePassport`). Import-source question: `createEVMProvider` from `@layerswap/wallet-imtbl-passport`.
- **EVMProvider** — zkSync/Loopring modules (imported from `@layerswap/wallets` while basic usage imports `@layerswap/wallet-evm`); PartialIntegration link.
- **ParadexProvider** — EVM+Starknet dependency note; **likely-wrong imports**: `createEVMProvider, createStarknetProvider, createParadexProvider` all from `@layerswap/wallet-paradex`.

Dubious claims: Solana & Starknet pages say WalletConnect config is *required* — plausibly optional; EVM `getDefaultProviders()` "ships with zkSync + Loopring" — verify.

Verdicts: TON + ImmutablePassport keep (relocate credential halves to new-model docs); EVM keep; the other 6 (and arguably Paradex) merge into one provider-matrix table with zero information loss.

## Starknet vertical (both modified)

### `Starknet/Starknet.mdx` — modified (banner + link fixes)
- Only Starknet-specific substance: `initialValues { to: 'STARKNET_MAINNET', lockTo: true }`, sample theme palette, testnet config. ~100-line Theme Configuration section duplicates Customization pages; overlaps StarknetProvider + SelfBundled.
- `apiKey: {LAYERSWAP_API_KEY}` invalid-syntax placeholder (×2 across the two pages); `/images/starknetEarnTheme.svg` existence unverified.
- Verdict: keep only if Starknet is an active partner vertical; else merge unique bits and remove.

### `Starknet/StarknetWithDynamics.mdx` — modified (one link change; **no banner** — gap)
- Near-verbatim duplicate of CustomWalletManagement's Dynamic example, and **internally duplicates itself** (same hook shown twice on the page).
- **Accuracy conflict:** its hook omits `ready: true` and `disconnectWallets` — CustomWalletManagement calls `ready` "Critical: the widget will not function without it". One is wrong.
- `useMemo` dep bug (fixed in the other copy); invalid placeholders; leftover personal-repo iframe title "arentant/…".
- Verdict: remove/merge into CustomWalletManagement.

## Troubleshooting (all three modified — legacy banner added only)

- **VitePolyfills** — accurate for scope; incidental config noise. Keep as legacy (error-message-searchable).
- **NextPolyfills** — webpack-only; no Turbopack note (Next 15+ dev defaults to Turbopack where `webpack()` is ignored) — real gap for anyone still on this path. Keep.
- **NextTranspilePackages** — lists `@layerswap/wallet-module-zksync` / `wallet-module-loopring`, packages documented nowhere else (EVMProvider names them as exports of `@layerswap/wallets`) — verify existence. Its `wallet-imtbl-*` spelling supports the view that NativeWalletPackages' `wallet-immutable-*` names are wrong. Keep.

## Cross-page observations (Batch C)
- ~70–75% of provider-page content is boilerplate; 6 pages collapsible into one matrix.
- Migration.mdx coverage is strong; one hole: no contact mechanism for unsupported custom-provider users, and CustomWalletManagement has no forward-pointer.
- StarknetWithDynamics is a stale duplicate whose staleness is dangerous (missing "critical" field).
- Child pages lack legacy banners (only hubs/troubleshooting got them) — search-landing risk.

## Uncertainty candidates (Batch C)
1. Bundled path support status for new integrators (drives "recommended approach" wording). [= U-03]
2. Correct Immutable package names (`wallet-imtbl-*` vs `wallet-immutable-*`).
3. Do `@layerswap/wallet-module-zksync`/`-loopring` exist as npm packages?
4. Is `zustand@4.5.7` pin still required / peer dep at all?
5. Is WalletConnect config truly required for Solana/Starknet providers?
6. Is `ready: true` required in `WalletConnectionProvider`?
7. Are Paradex/ImtblPassport cross-imports real re-exports or copy-paste errors?
8. External-link longevity: `dev-monorepo` branch links (×6), cloud.walletconnect.com, vercel demo, docs.ton.org deep path, starknetEarnTheme.svg.
9. Verify Migration claims against widget-react source (callbacks/config/wagmi peer/npm-major semantics).
