# Verification — Widget config/theme/events + legacy packages vs `layerswap/layerswapapp` (branch `dev` @ b4849a3, 2026-08-05) + npm

## Confirmed

| Claim | Evidence |
|---|---|
| `WalletProviderId` = 9 ids, Immutable id is **`imtblPassport`**, Solana is `'solana'` not `'svm'` | types/config.ts:10-19 |
| `walletDefaults` key is **`immutablePassport`** — so BOTH spellings in the docs are correct, in different places (id vs defaults key). Resolves ACC-3: not a bug, but docs must call out the asymmetry explicitly | types/config.ts:67-77 |
| Immutable Passport config shape (fills docs gap CMP-10): `{ publishableKey, clientId, redirectUri, logoutRedirectUri }` — all four required | wallets/imtblPassport/src/index.ts:5-10 |
| TON shape: `{ tonApiKey, manifestUrl }` — public type says optional, provider requires BOTH → document as effectively required | wallets/ton/src/index.ts:16-19 |
| WC: only `projectId` required publicly; EVM has a built-in fallback `DEFAULT_WC_CONFIG` | wallets/evm/src/EVMProvider/init.ts:14-20 |
| WidgetConfig fields as documented; `apiKey` optional with runtime fallback to built-in keys; `initialValues`/`settings` typed `unknown` | types/config.ts:34-61; LayerswapProvider.tsx:119 |
| Deposit props incl. **`polymarket`** method; defaults confirmed (`mode: inline`, `title/buttonLabel: 'Deposit'`, `defaultAmountUsd: 1`, 0 disables) — but type is `DepositProps` in `core/src/components/Pages/Deposit/index.tsx`, NOT types/config.ts | DEPOSIT_METHODS in depositMethods.ts:5 |
| TON/Passport providers appear only when their defaults supplied | wallets/all/src/index.ts:152,162 (`getDefaultProviders`, not the plan's nonexistent `useWalletProviders.ts`) |
| wagmiConfig ignored when `'evm'` excluded | widget-cdn/src/Widget.tsx:63-64 |
| `amount` is **string** (confirms Configurations rewrite) | InitialSettings.ts:19 |
| Legacy alias mapping exactly as documented; `sourceExchangeName` wins over `fromExchange`; asset/lockAsset direction keys off `params.to` | core/src/context/settings.tsx:61-73 |
| `destination_address` overwritten by connected-wallet autofill in the Easy Deposit tab (only the Deposit widget passes `lockDestinationAddress`) — confirms EasyDeposit.mdx claim | DepositAddressForm/index.tsx:118-132 |
| ThemeData shape + RGB-triple-string colors | types/theme.ts:11-49; Models/Theme.ts:57 |
| All 8 callbacks; SwapFormValues fields ALL optional (confirms ACC-12 — docs payload table wrong); try/catch wrapping (never rethrows); payloads `unknown` publicly except `onSwapModalStateChange(boolean)` and `onMenuNavigationChange(string)` | callbackProvider.tsx:7-16, 28-35; types/config.ts:85-94 |
| onError union: exactly **18 discriminants** with per-type extra fields (full list captured — matches docs table incl. AlertUI) | types/logEvents.ts:73 |
| `SwapStatusEvent = {type, swapId, path?}` — `path` is the emitting widget screen; today only `'Processing'`, fired only for completed/failed/expired/ls_transfer_pending | logEvents.ts:75-79; Processing.tsx:143-147 |
| `onMenuNavigationChange` paths: `"/"`, `"/transactions"`, `"/campaigns"` (fills CMP-8 item) | Menu/index.tsx, MenuList.tsx |
| Legacy: `wallet-imtbl-passport`/`wallet-imtbl-x` are the real names (`wallet-immutable-*` 404 on npm) — **NativeWalletPackages.mdx's ecosystems section is the wrong one** (ACC-2 resolved) | npm + repo |
| `wallet-module-zksync`@1.0.1 / `wallet-module-loopring`@1.2.0 exist on npm (published-only legacy; not in repo tree) | npm |
| `ready: boolean` IS required on WalletConnectionProvider — **StarknetWithDynamics.mdx's hook is the broken copy** (ACC-4 resolved) | core/src/types/wallet.ts:198 |

## Refuted — docs must change

| # | Correction |
|---|---|
| C1 | **wagmi chain merging refuted**: the widget does NOT append Layerswap EVM chains/transports to a host config — the host config is adopted **verbatim** (`initEvmProvider` early-returns). Host must include the chains it wants. Also: late-supplied config dropped with console warning; widget skips hydrate/reconnectOnMount for adopted configs ("host owns this lifecycle"). WagmiConfig.mdx and plan §3.7 need a rewrite of this section |
| C2 | **Theme presets: five** (`light`, `default`, `ton`, `immutable`, `immutablePlay`), not two. Also `LayerswapProvider` merges config.theme over default **shallowly** while ColorSchema deep-merges — subtle |
| C3 | **Border-radius docs table wrong**: each enum value selects a 6-step SCALE (sm/md/lg/xl/2xl/3xl), not one px value; `default` = the `medium` scale (4/6/8/12/16/24); `full`=9999, `none`=0. CSS vars use suffixes `sm…3xl,full,default` |
| C4 | **`initialValues.theme` is dead in the widget package** — named presets only work via query params in the bridge app (layerswap.io/app). Docs must not offer preset names for widget-react `initialValues`; widget theming = `config.theme: ThemeData`. (Hosted Page/iFrame CAN keep the `theme` query param.) |
| C5 | **`depositMethod` honors only `wallet` \| `deposit_address`** — anything else silently dropped (generateSwapInitialValues.ts:100-102). `hyperliquid`/`polymarket` are Deposit-widget method ids only. Fills CMP-8 |
| C6 | `defaultTab` honored values exactly `swap|cex|deposit`; anything else falls through |
| C7 | zustand peer is **`^4.5.7` range**, not an exact pin — soften docs wording |
| C8 | Paradex does NOT re-export EVM/Starknet factories — it **peer-depends** on `wallet-evm`/`wallet-starknet` ^1.7.0. ParadexProvider.mdx import example confirmed wrong (ACC-7 resolved) |
| C9 | Plan file references stale paths: `useWalletProviders.ts` doesn't exist (logic in `widget-cdn/src/Widget.tsx` + `wallets/all/src/index.ts`); `DepositConfig` not in types/config.ts:127-154 |

## New facts docs should add

- `walletProvidersConfig`: `include` applied first (allowlist), then `exclude`; excluded chains never dynamic-import their SDKs (bundle-size win).
- Only EVM (+ Passport when configured) load eagerly; other chains lazy-load on first connect-modal open.
- The API contract documents seven swap statuses: user_transfer_pending, ls_transfer_pending, completed, failed, expired, pending_refund, refunded. Confirm whether the widget-core `created` state is API-visible.
- `InitialSettings` internal-only fields to keep undocumented: `signature`, `timestamp`, `apiKey`, `balances`, `coinbase_redirect`.
- Immutable Passport OAuth callback subpath: `@layerswap/wallets/eager/imtbl-passport`.
- Old global DepositSettings singleton is gone — multiple `<Deposit>` instances isolated per-context (affects one-widget-per-page wording for deposit).
