# Layerswap Documentation Style Guide (Phase 12)

> Governs the writing phase. Terminology authority: `08-terminology.md`. Validated through prototypes (Phase 13); before/after examples pulled from audited pages.

## Voice & structure
1. Start from the reader's task, not the product ("To let users fund their wallet from another chain…" not "Layerswap provides…").
2. One concept per paragraph; explain before naming ("Layerswap needs to know where to send funds — the `destination_address`" not "Set destination_address").
3. State the actor for every step: *you* (integrator), *the user*, *the widget*, *Layerswap*. Never ambiguous "it".
4. Show a working example early; show the expected output/response, not just the request.
5. Describe failure states next to the happy path, not in a separate far-away page (link the deep dive).
6. Every action page ends with an explicit next step.
7. Sentences short; no filler ("simply", "easily", "seamlessly" banned).

## Claims policy (Non-assumption rule 4 + Q3.5)
- Concrete and sourced, or absent. Live counts come from data, never prose ("66 networks" ❌ hardcoded; interactive list / "60+ networks (live list)" pattern 🚧 approve).
- Speed/cost claims only with a mechanism ("direct routes typically settle in one block confirmation" needs backing) — otherwise cut.
- Replaced claims carry the 🚧 review marker until Babken validates.

## Requirements vs recommendations
- **Must / required** = enforced by code or API (cite behavior: "the request fails with `ROUTE_NOT_FOUND_ERROR`").
- **Should / recommended** = best practice with a stated reason.
- Unsupported behavior stated plainly + what happens: "Custom wallet providers are not supported in the CDN model — the `walletProviders` prop does not exist on `LayerswapWidget`."

## Code examples
- Complete and runnable: no undeclared variables (audit found `queryClient`, `depositAmountInBaseUnits`), no invalid placeholder syntax (`{LAYERSWAP_API_KEY}` in plain code ❌ → `const apiKey = 'YOUR_API_KEY'`).
- curl examples include the auth header when the endpoint needs one, and say so when it doesn't ("this endpoint is public").
- Correct fence languages (` ```bash ` for installs — not ` ```typescript `).
- API responses shown with the real envelope (`{"data": …}`) and real field names from live probes.
- Shared type blocks live in ONE snippet, included where needed (fixes the 190-line duplicate).
- Prop-stability pattern (`// Module scope` comment) kept consistent — it already is; preserve.

## Callouts
- `<Note>` context · `<Warning>` breakage risk · `<Tip>` optional improvement · `<Check>` verification step.
- **`<Warning title="🚧 Needs review — {category} (Q{ref})">`** = the review-marker convention (see `07-clarification-log.md`). Never ship-final; tracked in the markers checklist.
- One callout max per screen of content; if everything is a warning, nothing is.

## Naming & formatting
- Terminology per `08-terminology.md` (swap, funding method, environment, route provider, source/destination…).
- Networks: canonical id in code (`ETHEREUM_MAINNET`), display name in prose (Ethereum). Tokens: symbol uppercase.
- Addresses/hashes in examples: clearly fake or the sanctioned public-demo values.
- API fields in backticks with exact casing; the two status vocabularies always labeled ("status" vs "status filter").
- Headings: sentence case, task-oriented ("Lock the destination network", not "Destination Network Locking").

## Cross-linking (canonical-home rule)
- Every topic has ONE home; other pages link, never restate. A page may include a one-sentence orientation before the link, nothing more.
- Link text names the destination's content ("see the swap lifecycle"), never "click here" / bare "Configurations".
- Method pages link INTO Concepts; Concepts never link into method specifics except as examples.

## Error documentation pattern
For every error: what the reader sees (exact code/message incl. quirks like empty-body 400s) → what it means → what to do. Organized by observable symptom in troubleshooting; by code in reference.

## Before/after examples (from audited pages)

**Before** (introduction.mdx): "Layerswap is the most affordable cross-chain asset bridging and swapping solution…"
**After:** "Layerswap moves assets between 60+ networks and major exchanges. You can embed the flow in your app with the Widget, link out to the Hosted Page, or run everything through the API." 🚧 claim review

**Before** (api-keys.mdx): page ends after "copy the API key".
**After:** ends with: header usage example (`X-LS-APIKEY`), the public-vs-keyed endpoint note, environment rule (testnet key → testnet routes), and "Next: make your first swap →".

**Before** (webhook.mdx): "please refer to the Swap Data object" (dead reference).
**After:** inline payload example from the SwapResponse shape + 🚧 marker on retry semantics (Q2.5).
