# Uncertainty Register (post-Step-4 — code + live verification complete)

> Verification evidence: `raw-audits/verification-{loader-security,config-theme-events,live-api}.md` (code = GitHub `layerswap/layerswapapp@dev`, 2026-08-05/06; live = production API probes 2026-08-06).
> Remaining OPEN items are TEAM questions — see `04-clarification-questions.md`.

## ✅ Resolved by code/live verification

| ID | Verdict |
|----|---------|
| U-10 | **Read endpoints are public** — /networks, /quote, /sources, /destinations work with NO key; invalid key → 403 `API_KEY_FORBIDDEN`. |
| U-19 | Envelope is **`{"data": …}`-wrapped everywhere** (lifi page right, fees.mdx wrong). **No market-impact field; no quote-expiry field exist.** `avg_completion_time` = .NET TimeSpan; detailed_quote uses ms + returns an array. Undocumented quote fields: `total_fee`, `total_fee_in_usd`, `fee_discount`. |
| U-30 | Security pipeline confirmed (P-256, SHA-384 SRI fail-closed, kill switch pre-verification, 30-day TTL + 5-min skew, mount-time-only freshness). **Corrections: `ManifestError` has NO `'incompatible'` member (5 reasons only); no runtime protocol-compat check (release policy only); channel derives from remote's major, loaders are 0.1.0.** New facts: 60s resolve reuse; mixing loaders throws; console provenance line. |
| U-31 | Provider id **`imtblPassport`** / defaults key **`immutablePassport`** — both correct, asymmetry must be documented. Passport config shape: `{publishableKey, clientId, redirectUri, logoutRedirectUri}` all required. TON: both fields effectively required. |
| U-32 | Confirmed: react/react-dom `^18||^19` peers, wagmi optional types-only, ESM-only. **But "React 17 rejected at runtime" is overstated** — peer range + MF share range, no explicit check. |
| U-33 | **REFUTED in part**: host wagmi config adopted **verbatim** — widget does NOT append its EVM chains/transports. Host must include needed chains; late config dropped w/ warning; hydrate/reconnect skipped. EIP-6963 gotcha stands as README guidance. |
| U-34 | initialValues confirmed: `amount` string; alias map exact (`sourceExchangeName` > `fromExchange`); **`initialValues.theme` DEAD in widget** (presets = hosted-page query param only; 5 presets exist); `depositMethod` honors only `wallet|deposit_address`; `defaultTab` exactly `swap|cex|deposit`; `destination_address` overwritten by wallet autofill in Easy Deposit tab (claim confirmed). |
| U-35 | `polymarket` method EXISTS in `DEPOSIT_METHODS`; `defaultAmountUsd` default 1 (0 disables). Whether polymarket is a public/supported feature → TEAM. |
| U-36 | Events confirmed: 8 callbacks; onFormChange fields ALL optional (docs table wrong); `SwapStatusEvent.path` = emitting screen (only `'Processing'` today; fires only for 4 statuses); menu paths `/`, `/transactions`, `/campaigns`; onError union exactly 18 discriminants; try/catch wrapped; `unknown` publicly except two. |
| U-37 | **Border-radius table wrong**: enum selects a 6-step scale (default=medium scale); CSS vars sm/md/lg/xl/2xl/3xl/full/default. Presets: five (`light`, `default`, `ton`, `immutable`, `immutablePlay`). Colors = RGB triples confirmed. |
| U-38 | TON/Passport conditional appearance confirmed (`getDefaultProviders`); Solana id `'solana'` confirmed. |
| U-39 | widget-js: ESM-only, no UMD, remote bundles own React, `never`-typed wagmi/loading props — all confirmed. **BUT `mountDepositWidget` DOES NOT EXIST** (only `mountWidget`) — VanillaJS.mdx documents a nonexistent function; deposit-via-vanilla support → TEAM. |
| U-40 | Callback parity confirmed (8/8 identical by construction; note bundled ≥1.2.x already had the "new" two). One-widget-per-page: React = in-tree alert; vanilla = synchronous throw (different behaviors). Identity props → re-renders, NOT remounts. |
| U-41 | Legacy: `wallet-imtbl-*` names correct (`wallet-immutable-*` 404) — NativeWalletPackages' ecosystems section wrong. `wallet-module-zksync/loopring` exist on npm (published-only). zustand peer `^4.5.7` (range, not pin). `ready: boolean` REQUIRED → StarknetWithDynamics' hook is the broken copy. Paradex peer-depends on wallet-evm/starknet (does NOT re-export) → its import example wrong. WC-required-for-Solana/Starknet: unverified (minor, legacy). |
| U-42 | **Live API rejects the documented snake_case filter values AND `UserTransferPending`**; accepts case-sensitive PascalCase `Completed`/`Refunded`/`Failed`. Filter names for pending statuses unknown → TEAM (API bug or hidden naming?). |
| U-44/U-45 | API key exposure accepted by Babken (2026-08-06) — intentionally public demo keys. |
| — (new) | Error model: `{"error":{code,message,metadata}}`; binding-level 400s return EMPTY bodies; metadata typing inconsistent. |
| — (new) | No rate-limit headers; no testnet hosts; `version` query param ignored server-side (env is key-scoped per api-keys.mdx — testnet side unverified). |

## ✅ Resolved by team answers (Babken, 2026-08-06 — full log: `07-clarification-log.md`)

| ID | Verdict |
|----|---------|
| U-01 | Docs + packages publish **simultaneously** — docs may assume published. Verify install commands + versions at release. NOTE: all existing packages jump to **2.0.0** — versioning prose ("1.x → /v1") must be re-checked against actual release (channel likely /v2). |
| U-02 | Final CDN origin = **`cdn.layerswap.io`** — replace workers.dev everywhere in docs; engineering must update loader default before publish. |
| U-03 | Bundled widget **stays supported** (not legacy), recommended path = react/js for auto-updates. Rename "Legacy" group → "Advanced"/alternative framing. |
| U-04 | Playground reflects widget-react — link it. |
| U-05 | Deposit via widget-js **will be available** — keep `mountDepositWidget` docs; verify-at-release (doesn't exist in code as of 2026-08-06). |
| U-13 | **Testnet confirmed**: key-scoped, same base URL, testnet key → testnet routes. |
| U-15 (partial) | LI.FI fate unknown — keep hidden, MARK. Memo id → code check running. |
| U-16/U-43 | Rule adopted: **in swagger ⇒ documentable; not in swagger ⇒ do not document.** Exchange models are in swagger → documentable. `exclude_deposit_actions` NOT in swagger → drop from refunds page. |
| U-20 | No support/analytics data exists — audience ranking is our call, marked provisional. |
| U-25 | Partner orphan URLs unrecognized by team → treat as forgotten; fold/remove + redirect, MARK. |
| U-26 | Deposit Address mode explained (wallet-less funding, auto-detect on last created swap) but **deferred/may be removed** — don't invest, MARK the tab. |
| U-27 | TRAIN still upcoming; freeze existing mention, add nothing. |
| U-29 | `hidePoweredBy` allowed for everyone. |
| U-35 | Polymarket method is **public**. |
| U-42/U-47 | Filter values → code check running (2.2). |

## ⏳ Deferred by team ("mark for later") — carry visible 🚧 review markers in the docs

| ID | Topic |
|----|-------|
| U-11 | Rate limits / idempotency / versioning policy (Q2.4) |
| U-12 | Webhook payload schema, event list, retries — write from existing docs, mark gaps (Q2.5) |
| U-14 | Depository claims (Q2.9) |
| U-17 | Refund rules (Q2.7) |
| U-18 | Gasless specifics (Q2.8) |
| U-21 | Terminology — decide + mark for Babken's validation (Q3.7) |
| U-22 | Marketing claims — replace with concrete statements + mark (Q3.5) |
| U-23 | Support link — marked placeholder, Babken adds URL (Q3.8) |
| U-46 | 10 vs 7 statuses (Q2.3) |
| U-48 | Quote validity model (Q2.1) |

## 🔍 Code checks — completed (see `raw-audits/verification-followups.md`)

| ID | Verdict |
|----|---------|
| U-42/U-47 | **RESOLVED**: filter vocabulary is PascalCase and distinct from response statuses — `PendingDeposit`≙`user_transfer_pending`, `PendingWithdrawal`≙`ls_transfer_pending`, `PendingRefund`≙`pending_refund`, plus Completed/Refunded/Failed/Expired. Full mapping table captured; document both vocabularies. |
| U-15b | **Not determinable from frontend** — Solana deposit tx is deserialized from backend `call_data`; no memo code exists client-side. LI.FI memo section keeps its 🚧 mark (verify via backend or a live Solana deposit_actions sample). |
| U-28 | **RESOLVED**: brand pink = `#FF3272` (logo + theme presets — brand-assets.mdx was right); primary accents `#CC2D5D` (dark) / `#E42575` (light). Docs-site theme `#E05B8A` matches none → 🚧 mark for aligning docs.json. |
