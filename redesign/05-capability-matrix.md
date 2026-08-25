# Verified Capability Matrix (Phase 2 / Step 6)

> **Update 2026-08-06 (team answers, see `07-clarification-log.md`):** widget packages ship simultaneously with docs (assume published; everything jumps to 2.0.0); CDN origin = **cdn.layerswap.io** (not workers.dev); bundled widget stays supported (recommended = react/js); deposit available via widget-js (verify at release); polymarket public; playground current; testnet = key-scoped same URL. Swagger-presence now decides reference scope. Deposit Address mode deferred (may be removed). Cards below not yet rewritten — read with this update applied.

> Evidence-backed capability cards. Evidence tags: **CODE** = GitHub `layerswap/layerswapapp@dev` (verified 2026-08-05/06) · **LIVE** = production API probe (2026-08-06) · **SPEC** = swagger v2 · **DOCS** = existing prose (unverified unless also tagged) · **TEAM?** = pending answer (see `04-clarification-questions.md`).
> Anything marked TEAM? must not appear in final documentation as fact.

---

## 1. Core transfer capability

**Confirmed behavior**
- A "swap" is the API's unit of work: a transfer of a token from a source network/exchange to a destination network, executed by Layerswap after the user (or integrator) funds it. Created via `POST /api/v2/swaps`; tracked via `GET /swaps/{id}` with a 7-value documented status machine (`user_transfer_pending → ls_transfer_pending → completed`, failure branches `failed / expired / pending_refund / refunded`). [SPEC, LIVE, DOCS-synced]
- Routes are discoverable via `/networks`, `/sources`, `/destinations` (public, no key), `/limits`, `/quote`, `/detailed_quote`. 66 networks live. Route ≠ network: per-route token status/refuel comes from /sources//destinations. [LIVE]
- Cross-token routing exists (e.g. USDT→USDT0, ETH→WETH groups) — visible only via `/connections`. [LIVE]
- Funding methods for a swap: wallet transfer (integrator/user submits tx), deposit address, Depository contract (`use_depository`), gasless signature (`use_gasless`), plus widget-side `hyperliquid`/`polymarket` methods. [SPEC, CODE, DOCS]
- Quotes: `{"data":{"quote":…}}`; fee fields `blockchain_fee`, `service_fee`, `total_fee`, `total_fee_in_usd`, `fee_discount`; `min_receive_amount`, `slippage`, `rate`, `path[]` (multi-provider routes exist: `path: [{provider, order}]`). **No expiry field.** [LIVE]

**Open questions** — quote/rate guarantee model (U-48); exchange↔exchange support (U-16); statuses beyond the 7 (widget enum has 10 — U-46); same-chain swaps (untested).

**Risks** — documenting "quotes valid for a reasonable window" (undefined); fee taxonomy in fees.mdx ("market impact") has no API counterpart.

**Doc implications** — a Concepts section needs: swap object, route/quote model, funding methods compared, status machine incl. `fail_reason`, refund rules.

---

## 2. Integration method: React widget (`@layerswap/widget-react`) — NEW, unreleased

**Confirmed behavior** [CODE]
- Thin React loader; fetches the widget at runtime from a signed CDN manifest (`layerswap-widget-cdn.layerswapcdn.workers.dev/v1/manifest.json`, baked in, no public override). Verification: ECDSA P-256 detached signature over canonicalized JSON, per-chunk SHA-384 SRI (fail-closed), kill switch (pre-verification), 30-day TTL + 5-min skew (new mounts only; 60s resolve reuse).
- Host needs: `react`/`react-dom` ^18||^19 peers only; wagmi optional types-only peer; ESM-only; no CSS import; no bundler config; SSR renders `fallback` only.
- Props: `config` (apiKey optional-with-fallback, version mainnet|testnet, theme, initialValues, apiUri, settings), `callbacks` (8 events, try/catch-wrapped, `unknown`-typed publicly), `walletProvidersConfig` (include-then-exclude; excluded chains never load their SDKs), `walletDefaults` (walletConnect / ton / immutablePassport — note id is `imtblPassport`), `wagmiConfig` (adopted **verbatim** — host must include needed chains), loader props `fallback`/`onReady`/`onError` (ManifestError, 5 reasons, no `'incompatible'`).
- One widget per page: second React instance renders an in-tree alert; identity-compared props cause re-renders (not remounts).
- `LayerswapDepositWidget`: fixed destination+address, `methods` allow-list (wallet/deposit_address/hyperliquid/polymarket), `defaultAmountUsd` default 1.

**Open questions** — publish date/version (U-01: repo 0.1.0, npm 404); CDN origin final? (U-02); polymarket public? (U-35→TEAM).

**Risks** — docs drafted for "1.x" semantics against 0.1.0 unpublished packages; CSP snippet points customers at workers.dev.

**Doc implications** — Quickstart, How-It-Works/CSP, props reference, wallets, wagmi sharing, deposit widget, events — drafted; needs the correction list in `raw-audits/verification-*.md` applied before merge.

---

## 3. Integration method: Vanilla loader (`@layerswap/widget-js`) — NEW, unreleased

**Confirmed behavior** [CODE] — ESM npm package (no UMD/script tag); `mountWidget(target, props) → {update, destroy}`; throws server-side/falsy target; remote bundles its own React; `wagmiConfig`/`loadingComponent` excluded at type level; second concurrent mount throws; mixing with widget-react on one page throws.

**Open questions** — **`mountDepositWidget` does not exist** though drafted docs document it (U-05): coming, or is deposit React-only?

**Risks** — publishing the drafted VanillaJS page as-is documents a nonexistent function.

**Doc implications** — one page, shared security/config references with React path.

---

## 4. Integration method: Legacy bundled widget (`@layerswap/widget` + `@layerswap/wallets`)

**Confirmed behavior** [CODE, npm] — actively published (1.7.0, 2026-07-14); host bundles everything: CSS import, `LayerswapProvider`, `walletProviders` array from per-chain factories (`@layerswap/wallet-evm`, `-bitcoin`, `-solana`, `-starknet`, `-fuel`, `-ton`, `-tron`, `-paradex`, `-imtbl-passport`; npm-only legacy `-imtbl-x`, `wallet-module-zksync`, `wallet-module-loopring`); zustand `^4.5.7` peer; per-framework polyfills/transpilePackages required; custom wallet hooks via `WalletConnectionProvider` (`ready: boolean` required) — the one capability with **no new-model equivalent**.

**Open questions** — supported for new integrators or maintenance-only (U-03)?

**Risks** — "Legacy" label vs active npm publishing; ~18 pages hang on U-03; custom-provider users have no migration path except "talk to the team" (no contact link).

**Doc implications** — legacy section + migration guide exist in drafts; NativeWalletPackages' wrong `wallet-immutable-*` names need fixing whatever happens.

---

## 5. Integration method: Hosted page (layerswap.io/app URL)

**Confirmed behavior** — URL query params prefill/lock/hide the form; same param model as widget `initialValues` **plus** named `theme` presets work here (query-param path through the bridge app; presets: light/default/ton/immutable/immutablePlay) [CODE]. Legacy aliases auto-mapped (`destAddress→destination_address` etc., `sourceExchangeName` wins over `fromExchange`) [CODE].

**Open questions** — completion detection/redirect-back story (docs show a Swift deep-link example, unverified); does every initialValues param work as a query param (asserted, untested); API-key/appName attribution requirements (U-24).

**Risks** — current pages teach deprecated param names; example URLs are copy-paste-broken.

**Doc implications** — one solid page + params reference shared with iFrame; completion-tracking guidance is the big gap.

---

## 6. Integration method: iFrame

**Confirmed behavior** — same hosted-page URL embedded in an iframe; same params. [DOCS]

**Open questions** — officially recommended? (U-06 folded into U-03/comparison); wallet-connection UX inside third-party iframes (popups/blockers) undocumented; CSP/frame-ancestors requirements Layerswap-side unknown.

**Risks** — thinnest method; overlaps hosted page ~60%.

**Doc implications** — likely a section of the hosted-page docs rather than a separate method.

---

## 7. API integration (direct)

**Confirmed behavior**
- Auth: `X-LS-APIKEY` header; read endpoints public; invalid key → 403 `API_KEY_FORBIDDEN`; env is key-scoped (mainnet/testnet keys, same base URL) [LIVE + DOCS].
- Flow: routes → limits/quote → `POST /swaps` → `GET /swaps/{id}/deposit_actions` → fund (transfer / depository call_data / gasless typed-data + `POST /authorize`) → poll status or webhook. 17 operations total. [SPEC, LIVE]
- Error model: `{"error":{code,message,metadata}}`; binding-level 400s have **empty bodies** [LIVE].
- Status filter on GET /swaps: PascalCase case-sensitive; pending-state filter names broken/unknown [LIVE].
- Depository: `use_depository` → `deposit_actions` with `call_data`/`encoded_args`/`to_address`; audited (Hexens) [SPEC, DOCS].
- Gasless: `use_gasless` on quote/limits; `typed_data` sign action; `POST/GET /swaps/{id}/authorize`; `supports_gasless_deposit` per token [SPEC].
- Webhooks: dashboard-configured, Svix-signed; zero API surface in spec [DOCS].

**Open questions** — U-11 (rate limits/idempotency/versioning), U-12 (webhook semantics), U-13 (testnet story), U-14 (broader depository guarantees), U-17 (refund rules), U-18 (gasless specifics), U-42/U-47 (filter names), U-43 (which spec features are public), U-48 (quote validity). Solana memo id (2.11) was resolved by the PR #32 verification integrated on 2026-08-24.

**Risks** — entry page currently teaches none of this (CMP-1); parameter descriptions absent from swagger so prose carries everything.

**Doc implications** — P0: real API quickstart, auth page, lifecycle+refunds, deposit-actions reference per funding method, error model incl. empty-body 400s, webhook rewrite.

---

## 8. Wallet support (new model)

**Confirmed behavior** [CODE] — 9 provider ids (`evm, starknet, fuel, paradex, bitcoin, ton, solana, tron, imtblPassport`); include/exclude filtering; credentials via `walletDefaults` (WC projectId required-ish with built-in fallback; TON needs tonApiKey+manifestUrl; Passport needs 4 required fields); TON/Passport appear only when configured; EVM (+Passport) eager, others lazy-load; host wagmi config adopted verbatim, ignored if evm excluded; NetworkType enum also includes cosmos/starkex/zksynclite/hyperliquid (API-side) beyond the 9 wallet providers.

**Doc implications** — wallets page + wagmi page drafted; needs C1 correction (chain merging) and Passport shape added.

---

## 9. Theming & customization (new model)

**Confirmed behavior** [CODE] — `config.theme: ThemeData`; RGB-triple strings; deep-merge over `default` preset (but LayerswapProvider merges shallowly — subtle); borderRadius enum selects 6-step scales; CSS vars `--ls-colors-*`, `--ls-border-radius-{sm..3xl,full,default}`; `header.{hideMenu,hideTabs,hideWallets}`; `hidePoweredBy`; `enablePortal`/`enableWideVersion`; 5 named presets exist but **only via hosted-page query param**, not widget `initialValues`.

**Open questions** — `hidePoweredBy` policy (3.9); playground currency (U-04).

**Doc implications** — Colors/ThemeConfiguration field-ownership dedup; correct radius scales; playground link once verified.

---

## 10. Form prefill/lock ("initialValues" / URL params)

**Confirmed behavior** [CODE] — full modern field list (amount is **string**); legacy alias auto-map; `depositMethod` honors only `wallet|deposit_address`; `defaultTab`: `swap|cex|deposit`; `destination_address` overwritten by wallet autofill in the Easy Deposit tab (deposit widget is the way to lock it); `externalId` → swap `reference_id`.

**Doc implications** — Initial Values page (drafted) is close; needs C4/C5 corrections; the tab/flow story (swap vs cex vs deposit) needs one owned page — the CEX-flow explanation currently lives only in an orphan.

---

## 11. Observability & lifecycle handling (integrator-side)

**Confirmed behavior** — widget events (onSwapCreate/StatusChange/Complete/Error with 19-type union after source re-check) [CODE]; API polling `GET /swaps/{id}`, `by_transaction_hash` [SPEC/LIVE]; webhooks via Svix [DOCS]; explorer exists [layerswap.io/explorer]; console provenance line for widget build [CODE].

**Open questions** — webhook payload/events/retries (U-12); `deposit_speedup` (U-43); support escalation (3.8).

**Doc implications** — "track a transfer" guide spanning widget events + API polling + webhooks; troubleshooting by observable symptom.

---

## Summary table

| Capability | Verification level | Blocking questions |
|---|---|---|
| Core swap + routes + quotes | HIGH (live-probed) | quote validity (U-48) |
| widget-react | HIGH (code) | publish (U-01), CDN origin (U-02) |
| widget-js | HIGH (code) | deposit support (U-05) |
| Legacy bundled widget | HIGH (code+npm) | support status (U-03) |
| Hosted page | MEDIUM | completion tracking, param coverage |
| iFrame | LOW | recommendation status |
| API direct | HIGH (spec+live) | 10 team items (§7) |
| Wallet support | HIGH (code) | — |
| Theming | HIGH (code) | hidePoweredBy policy |
| Webhooks | LOW (prose only) | U-12 |
| Exchange routes | LOW (spec models only) | U-16 |
| Gasless | MEDIUM (spec-verified structure) | U-18 |
| Depository | MEDIUM | U-14 |
