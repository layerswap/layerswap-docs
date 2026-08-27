# Visual Documentation Backlog (Phase 11)

> Rule: every visual answers a specific user question; no decoration. Format per plan: question / audience / shows / omits / source of truth / interaction / owner / update risk. Priority ⭐ = build with prototypes.

## V1 ⭐ Swap lifecycle state diagram (REPLACE existing)
- **Question:** what states can my swap be in and what do I do in each?
- **Audience:** API + widget integrators. **Home:** Concepts/lifecycle.
- **Shows:** 7 statuses, transitions, terminal states, refund branch, expiry (6h), where `fail_reason` applies. **Omits:** transaction-level sub-statuses (table instead), internal statuses pending Q2.3.
- **Source of truth:** `SwapModel.status` spec enum. **Format:** Mermaid state diagram, **theme-neutral** (current one hard-codes dark bg — DX-1).
- **Update risk:** low (enum stable). 🚧 revisit if Q2.3 adds statuses.

## V2 ⭐ Quote-to-completion sequence
- **Question:** who does what, in what order, between my backend, the user's wallet, and Layerswap?
- **Audience:** API integrators (J2). **Home:** API quickstart.
- **Shows:** integrator ↔ API ↔ user-wallet lanes: quote → create → deposit_actions → fund → detect → payout → status/webhook. **Omits:** per-method payload details (linked).
- **Source:** verified flow (spec + live). Mermaid sequence. **Risk:** low.

## V3 ⭐ Funding methods comparison
- **Question:** which funding method fits my architecture?
- **Audience:** all integrators. **Home:** Concepts/funding-methods.
- **Shows:** wallet transfer / deposit address / Depository / gasless — who signs, gas payer, wallet needed?, chain support, API flags. **Omits:** widget-only methods detail (hyperliquid/polymarket → Deposit Widget page).
- **Format:** comparison table (not a diagram). **Source:** spec flags + code. **Risk:** medium (new methods appear) — 🚧 gasless/depository cells pending Q2.8/2.9.

## V4 ⭐ Integration chooser comparison
- **Question:** widget, hosted page, or API?
- **Home:** the single chooser page. **Shows:** effort, control, key requirement, wallet handling, update model (CDN auto vs self-bundled), per-surface next link. **Source:** capability matrix. **Risk:** low.

## V5 Widget delivery & trust diagram
- **Question (security reviewer):** what exactly loads into my page and how is it verified?
- **Home:** Widget/How-it-works. **Shows:** npm loader → manifest fetch (cdn.layerswap.io) → kill-switch → signature → SRI → MF remote; trust root = key in package. **Omits:** internal seams (globals), 60s cache nuance (prose note instead).
- **Source:** verified loader code. **Risk:** low; ⛔ update origin at release.

## V6 Status filter ↔ response mapping table
- **Question:** why does my filter value 400?
- **Home:** GET /swaps reference + lifecycle page. **Source:** `verification-followups.md` mapping. **Risk:** low.

## V7 Theme scale visualization
- **Question:** what does each `borderRadius` value actually do?
- **Home:** Theming. **Shows:** the 6-step scale per enum value (code-verified). Simple table/graphic. **Risk:** low.

## V8 Error-handling decision flow (deferred 🚧)
- Blocked on Q2.7 (refund rules) + Q2.4 (retries). Placeholder marker in error docs until answered.

## Interactive (existing, keep with fixes)
- Networks/tokens embed (add prose fallback + programmatic pointers) — home: Get Started.
- Playground iframe (add context + open-in-new-tab) — home: Widget tab.
- DepositAddress live demo — frozen pending Q3.4; not part of the redesign.

## Explicitly NOT building
Decorative architecture art, partner logo walls in docs body, per-page hero images, screenshot-heavy theming galleries (SVG mockups already drift — replace with live playground links where possible 🚧 verify current mockups vs UI at release).
