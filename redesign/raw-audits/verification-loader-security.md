# Verification — Widget loader/security claims vs `layerswap/layerswapapp` (branch `dev`, 2026-08-06)

> Source of truth: GitHub `dev` branch (default; fresher than `dev-monorepo`). Note: plan path `react/src/remoteWidgetHost.tsx` doesn't exist — React loader is `packages/widget/react/src/LayerswapWidget.tsx`; remote lives in `apps/widget-cdn/src/`.

## Confirmed (docs claims that check out)

| Claim | Evidence |
|---|---|
| Manifest URL baked in, no public override | `js/src/manifest.ts:119` `DEFAULT_MANIFEST_URL = 'https://layerswap-widget-cdn.layerswapcdn.workers.dev/v1/manifest.json'`. **Nuance:** `globalThis.__LAYERSWAP_WIDGET_MANIFEST__`/`__VERIFY__` build/test seams exist (loader.ts:7-31) — docs must say "no *supported/public* override", not "not configurable via globals" |
| Kill switch | loader.ts:82-84 — checked BEFORE signature verification; honored even with verification off |
| ECDSA P-256 detached sig, baked-in SPKI key, SHA-256 over canonicalized JSON | manifest.ts:97-98, 147-169, 179-201. WebCrypto-unavailable → surfaces as `'signature'` |
| 30-day validity (publish-pipeline default `LAYERSWAP_MANIFEST_TTL_DAYS`) + 5-min skew; expiry affects only new mounts | manifest.ts:224, 234-239; build-manifest.mjs:38. Missing `expiresAt` also → `'stale'` |
| Per-chunk SHA-384 SRI, fail-closed | js/src/sri.ts — patches script src/setAttribute; unknown chunks under a registered prefix blocked with unmatchable hash |
| CDN origin current: `layerswap-widget-cdn.layerswapcdn.workers.dev` | manifest.ts:119. `cdn.layerswap.io` future-planned (comments + wrangler.toml). Test blob only on stale branches |
| Unreachable manifest/CORS → `ManifestError('fetch')` | manifest.ts:267-275 (the widget README's own failure table row claiming raw `TypeError` is stale — plan §3.2 was right) |
| Peers: react/react-dom `^18 || ^19`; wagmi optional **types-only** peer; widget-js has no peers | react/package.json:46-50,63-67; `import type` only |
| ESM-only, no CJS/UMD, both loaders | package.json `type: module`, exports without `require` |
| widget-js throws server-side + on falsy target; handle `{update, destroy}` | mount.ts:5-11, 47-62 |
| `wagmiConfig`/`loadingComponent` typed `never` in widget-js | types config.ts:34, 113-118 + type tests |
| Remote bundles own React for vanilla hosts | mount.ts:29-30, runtime.ts:11-14 |
| Loader props `fallback`/`onReady`/`onError`; onReady once per mount; onError from error boundary w/ ManifestError | LayerswapWidget.tsx:39-50, 64-66, 126-131 |
| Only react/react-dom shared as MF singletons from host | LayerswapWidget.tsx:81-94; vanilla shares nothing |
| Callback parity old↔new (all 8 names identical by construction) | core callbackProvider.tsx:7-16 = types config.ts:85-94; but onSwapStatusChange/onMenuNavigationChange already existed in bundled widget ≥1.2.x — "new" only vs ≤1.0.x |
| One-widget-per-page | React path: module-global counter, 2nd instance renders in-tree alert (LayerswapProvider.tsx:69-93). Vanilla path: 2nd `mount()` **throws synchronously** (widget-cdn mount.tsx:14-37) — different behaviors, docs should distinguish |
| Props compared by identity | Re-renders/provider-list rebuilds (useMemo deps), **not remounts** — docs should say perf concern, not remount |

## REFUTED / corrections required in draft docs

| # | Correction |
|---|---|
| R1 | **`ManifestError` union is 5 members: `'fetch' | 'parse' | 'signature' | 'kill-switch' | 'stale'` — there is NO `'incompatible'`** (manifest.ts:216-221). Drop it from HowItWorks + plan §3.2. `'stale'` covers both expired and missing-expiry |
| R2 | **No runtime protocol-compatibility check exists.** `channel` field is informational; mapping to `/v1/` is release policy, not enforced code. Channel derives from `@layerswap/widget` (remote) major, NOT the loader's own version — and loaders are currently `0.1.0`, so "npm major 1.x → /v1" is ahead of reality |
| R3 | **`mountDepositWidget` does NOT exist** — only `mountWidget`. VanillaJS.mdx and the plan document a nonexistent function. (Deposit via vanilla = TBD — team question: is deposit supported in widget-js at all?) |
| R4 | **React 17 "rejected at runtime" — overstated.** No `React.version` check; enforcement = peer range + MF `requiredVersion: '^18 || ^19'` without `strictVersion`, and the remote consumes with `requiredVersion: false`. Docs should say "requires React 18/19 (peer + share range)", not "explicitly rejected" |
| R5 | `fallback` isn't "typed never" in widget-js — it simply doesn't exist on WidgetProps (React-loader-only prop) |

## New facts docs should add (missed by drafts)

- **60-second resolve reuse** (`RESOLVE_REUSE_MS`, loader.ts:44-76): kill-switch/expiry can take up to ~1 min to affect new mounts; failures never cached.
- Mixing widget-js and widget-react on one page → `initRemote` throws on differing share configs (runtime.ts:47-55) — concrete backing for the "don't mix" advice.
- Console provenance line on every successful load: `[layerswap/widget-js] widget <version> (<sha>, built <ts>)` — troubleshooting gold.
- Failed load recoverable by remount (fresh `lazy()` per mount).
- `WalletProviderId` = `evm | starknet | fuel | paradex | bitcoin | ton | solana | tron | imtblPassport` — **id IS `imtblPassport`** (resolves half of ACC-3; walletDefaults key checked by the other agent).
- README CSP block (workers.dev origin, style-src unsafe-inline, WC relays, layerswap.io flags/Polymarket relay) exists at react/README.md:132-168 — docs CSP should mirror it.
- Loader packages still 0.1.0 and unpublished (re-confirms U-01/REL-1).
