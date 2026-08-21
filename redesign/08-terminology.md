# Terminology Decision Document (Phase 5 / Step 8)

> Status: **decided provisionally by the docs agent per Babken's delegation (Q3.7); every decision requires his validation.** Items marked ⚠️ get a visible 🚧 review marker wherever they surface in written docs.
> Grounding: live API vocabulary, `layerswapapp@dev` code, swagger v2, current prose. Nothing here renames code/API identifiers — this governs *docs language*.

## Core decisions

### D1. The unit of work is a **swap** ⚠️
- **Decision:** "swap" is the canonical noun for the API object and the end-to-end operation (matches API paths, spec models, 90% of existing prose). "Bridge/bridging" is allowed only as a category descriptor in marketing/intro contexts ("cross-chain bridging"), never as the object ("create a bridge" ❌). "Transfer" is reserved for actual on-chain movements (the user's funding *transfer*, Layerswap's payout *transfer* — matching `TransactionModel.type: input/output`).
- **Fixes:** privy recipe ("bridge"-first), intro copy.
- **Avoid:** "transaction" as a synonym for swap (a swap *contains* transactions).
- **Signal from Babken (2026-08-07):** his approved homepage copy uses "moving assets" as the umbrella verb and "the complete transfer experience" for the embedded product. Compatible reading: generic verbs ("move assets", "transfer experience") are fine in orientation copy; "swap" remains the technical object. If he prefers "transfer" as a first-class product term, D1 flips — revalidate at terminology sign-off.

### D2. "Funding method" unifies the five "deposit" jobs ⚠️
The word "deposit" currently names five things. Decisions:

| Thing | Canonical docs name | Notes |
|---|---|---|
| How a swap gets funded (`wallet` / `deposit_address` / depository / gasless) | **funding method** | Umbrella concept term; API field stays `depositMethod`/`use_*` — docs say "funding method (the `depositMethod` param)" |
| `deposit_address` funding | **deposit address** (two words, lowercase) | The transfer-to-an-address method |
| `LayerswapDepositWidget` | **Deposit Widget** | Product name, capitalized |
| The swap widget's third tab (`defaultTab: 'deposit'`) | **Deposit tab** | Retire "Easy Deposit" as a name ⚠️ (only if product agrees the tab isn't branded that way) |
| The audited contract | **Depository** (always capitalized, "the Depository contract") | Never shorten to "deposit contract" |
| Top-level "Deposit Address" docs tab | out of scope — deferred/may be removed (Q3.4) | |

### D3. Source/destination are the concept words; from/to are parameter names
- Concepts and prose: **source** and **destination** (matches API `source_network`/`destination_network`).
- `from`/`to`/`fromAsset`/`toAsset` appear only when documenting widget/URL parameters, introduced as "the `from` parameter (source)".
- **Avoid:** legacy aliases (`destAddress`, `asset`, `destNetwork`, `sourceExchangeName`) anywhere except the aliases table. ⚠️ Note: the Partner Dashboard UI itself still shows `?destAddress=` — flag to product for eventual alignment.

### D4. Two status vocabularies, named explicitly ⚠️
- Response values (snake_case: `user_transfer_pending`…) = **swap statuses** — the canonical lifecycle language.
- Query values (PascalCase: `PendingDeposit`…) = **status filters** — documented only in the GET /swaps reference with the mapping table (see `verification-followups.md`). Prose never uses filter names as statuses.

### D5. Route / quote / limits
- **Route** = a source→destination token pair Layerswap can execute (possibly via multiple **route providers** — the `path[].provider` entries).
- **Quote** = a priced offer for an amount on a route. ⚠️ No expiry semantics documented until Q2.1 is answered — docs must not say "valid for X".
- **Limits** = per-route min/max (`/limits`).
- **Avoid:** "solver" (currently used, never defined) — say **route provider** unless the team wants "solver" as a first-class term ⚠️.

### D6. Integration surface names ⚠️
- **Layerswap Widget** — the embeddable UI product (one thing, delivered two ways):
  - `@layerswap/widget-react` — "the React package" / recommended
  - `@layerswap/widget-js` — "the JavaScript package" (for Vue/Angular/Svelte/plain DOM); never "CDN widget", never "script tag"
  - `@layerswap/widget` — "the self-bundled widget" (supported, advanced; NOT "legacy" per Q1.3)
- **Hosted Page** — layerswap.io/app via configured URL. **iFrame embedding is documented as a variant of the Hosted Page**, not a separate method (it's the same URL in a frame) ⚠️.
- **API integration** — direct v2 API usage.
- Nav group "Self-bundled Widget (Legacy)" → **"Self-bundled Widget (Advanced)"** ⚠️.

### D7. "Environment", not "version", for mainnet/testnet ⚠️
- The `config.version: 'mainnet' | 'testnet'` prop collides with package/protocol versioning (both on core pages today). Concept word: **environment** ("environment is selected by your API key; the widget's `version` prop must match the key's environment").
- "Version/versioning" reserved for packages, the CDN channel, and API v2.

### D8. People words
- The reader is **you**; generically, an **integrator**. "Partner" only in product-name contexts (**Partner Dashboard**) and BD prose. The **user** is always the end user moving funds. Layerswap actions are attributed to **Layerswap** (never "we" in reference pages).

### D9. Smaller rulings
- **Refuel** = optional destination gas top-up (define on first use; it's an API field).
- **Deposit actions** = the API's instructions for funding a swap (`deposit_actions`) — keep, it's the API name.
- **Environment names**: networks by canonical id (`ETHEREUM_MAINNET`) in code samples, display name ("Ethereum") in prose.
- **iFrame** spelling: "iframe" in prose (HTML element), "IFrame" never; page titles use "Embedding in an iframe" ⚠️.
- **Explorer** = layerswap.io/explorer (capitalized product name).
- Brand pink `#FF3272` (code-verified); docs theme `#E05B8A` divergence flagged ⚠️.

## Slug/naming corrections carried from the audit (structural, need redirects) ⚠️
- `integration/UI/Configurations` ("Initial Values") vs `Widget/Configuration` one-letter pair → propose slugs `initial-values` and `configuration`.
- `Compatability` → `Compatibility`.
- These land in the Phase 14 migration/redirect plan, not now.

## Glossary skeleton (to become a public page in Phase 15)
swap · route · route provider · quote · limits · funding method · deposit address · deposit actions · Depository · gasless deposit · refuel · source/destination · swap status vs status filter · environment (mainnet/testnet) · Widget (react/js/self-bundled) · Hosted Page · Partner Dashboard · Explorer · reference_id/externalId · refund/refund address
