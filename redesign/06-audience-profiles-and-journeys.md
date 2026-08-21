# Audience Profiles & User Journeys (Phase 4/6 / Step 7) — PROVISIONAL

> ⚠️ Provisional: grounded in repo evidence (partner pages, integration surfaces, recipes, nav CTAs), NOT in support data or team confirmation. Question 3.1 in `04-clarification-questions.md` asks the team to rank these. Do not build IA on this until confirmed.

## Evidence available for audience inference

- Partner artifacts in repo: Immutable (gaming L2), Starknet dApps vertical, LI.FI (bridge aggregator), Privy server wallets (embedded-wallet infra), Clave/Ready/Paradex/Nostra/Linea logos on introduction page.
- Product surfaces: deposit widget (fund-a-fixed-address), CEX tab (exchange→chain), gasless/depository (smart-contract wallets), hosted page + deep-link example (mobile apps).
- Nav CTAs: "Book a demo" (evaluation traffic), Telegram dev community (integration support).
- NOT available: support tickets, analytics, search queries — requested from team.

## Provisional audience profiles (rank TBD by team)

### A. Wallet / embedded-wallet developer adding deposits & top-ups
**Context:** wallet app (mobile or embedded infra like Privy) wants users to fund accounts from other chains or CEXes. **Level:** strong app dev, moderate chain infra.
**Arrives asking:** which integration gets me deposits fastest? how do I fix the destination to my user's address? how do I know it completed? which routes/tokens?
**Decisions:** Deposit Widget vs API; wallet-signed vs deposit-address vs gasless funding.
**Needs before implementing:** destination locking (deposit widget / `destination_address` + autofill caveat), completion signals (onSwapComplete vs webhook vs polling), route coverage, failure/refund behavior.
**Common failure points:** Easy-Deposit tab overwriting destination_address; assuming quote is guaranteed; missing pending-status filter names.
**Likely path:** evaluation → integration comparison → Deposit Widget or API quickstart → status handling → production checklist.

### B. dApp / protocol frontend embedding swaps or onboarding
**Context:** DEX/game/L2 app wants "get funds onto our chain" natively (Immutable, Starknet verticals are this). **Level:** React-heavy frontend.
**Arrives asking:** can it match my brand? my wallet connection? my chain locked as destination?
**Needs:** widget quickstart, theming, wagmi sharing, lockTo/initialValues, events, CSP/security review material (How-It-Works) for their infra team.
**Failure points:** prop identity re-renders; CSP omissions; one-widget-per-page; legacy-vs-new package confusion (search landings on legacy pages).
**Path:** comparison → widget quickstart → theming/wallets → events → security page → launch.

### C. Backend/API integrator (aggregators, exchanges, platforms)
**Context:** LI.FI-style aggregator, exchange withdrawal rail, or platform with its own UI; server-side. **Level:** high; expects Stripe-grade reference.
**Arrives asking:** auth? full lifecycle? error model? deposit construction (EVM calldata / BTC OP_RETURN / Solana memo)? SLAs/rate limits? idempotency?
**Needs:** real API quickstart, complete reference with parameter docs, deposit-action construction per chain family, status machine incl. fail_reason, webhook semantics, refund rules, testnet.
**Failure points:** empty-body 400s; PascalCase status filters; no quote expiry; envelope confusion (`data`-wrapped).
**Path:** API quickstart → lifecycle → funding-method reference → webhooks → production readiness.

### D. Evaluator (PM / tech lead pre-integration)
**Context:** deciding Layerswap vs alternatives; may book a demo. **Level:** mixed.
**Arrives asking:** what does it do, which chains/CEXes, what does it cost, how much work is each integration path, is it safe?
**Needs:** concrete capability statements (no superlatives), route checker, fee explanation, integration comparison with effort estimates, security/audit facts.
**Path:** homepage → capability overview → routes → comparison → fees/security → demo or quickstart.

### E. Existing integrator maintaining/upgrading
**Context:** live on bundled widget or older API usage; hits deprecations. **Needs:** migration guide (exists in drafts), changelog that's actually maintained, versioning policy, support escalation path.

### F. End user / support-driven visitor
**Context:** lands on docs from app/explorer when a transfer stalls. Currently unserved (docs are integrator-oriented; introduction page half-addresses them). **TEAM decision needed:** serve here or route to a separate help center (layerswap.io/help exists).

### G. AI agents / LLM consumers
**Context:** docs.json enables copy/claude/chatgpt actions; several key pages (networks, DepositAddress, Playground) are JS-only and invisible to text consumers. **Needs:** prose fallbacks, machine-readable route data pointers, complete spec descriptions.

## Journey maps (condensed; failure branches inline)

### J1. Evaluation
Entry: homepage/search → *What can it do?* → capabilities + live routes (needs route checker or /networks pointer with prose) → *Which method?* → comparison table (effort, control, key requirements — the drafted IntegrationOverview covers UI paths only; API missing from comparison… fix) → *Cost/trust?* → fees (needs market-impact story resolved), security (needs real content) → CTA: quickstart or demo.
**Blockers today:** intro page has no links; two competing comparison pages; unsubstantiated claims.

### J2. First API integration
Get key (dashboard) → learn auth header (**currently undocumented outside curl examples**) → discover route (`/networks`, `/limits`) → quote (`/quote`, data-wrapped, no expiry — set expectations) → create swap (required fields, `refund_address` rule TBD U-17) → get deposit actions → fund (path per method: transfer / depository / gasless) → track (`GET /swaps/{id}` polling cadence?, webhook option) → handle terminal states (completed / failed+fail_reason / expired / refund pair).
**Failure branches:** ROUTE_NOT_FOUND, limits violation, empty-body 400 (binding), expired swap (6h), wrong-amount deposit.
**Blockers today:** CMP-1 (entry page), U-48 (quote validity), U-42 (filters), webhook page.

### J3. Widget integration (React)
Install (⛔ npm publish pending) → render with config → API key → initialValues/locking → wallets (filter/credentials/wagmi) → theme → events → CSP/security review → test (testnet key) → launch checklist (prop stability, one-per-page, error channels).
**Blockers today:** U-01/U-02; correction list from verification.

### J4. Hosted flow (incl. mobile deep link)
Build URL with params (canonical names!) → brand via `theme` preset (works here) → lock route/address → send user → **detect completion — currently no documented mechanism** (no redirect/callback documented; explorer/API lookup by tx hash is the workaround) → return user.
**Blockers:** completion tracking story (TEAM), param canonicalization on iFrame/HostedPage pages.

### J5. Production readiness (all methods)
Keys per env → testnet validation (story TBD U-13) → error handling (incl. empty-body 400s) → rate limits/retries (TBD U-11) → monitoring (webhooks TBD U-12; explorer) → quote-expiry handling (TBD U-48) → support escalation (TBD 3.8).
**This journey is currently almost entirely undocumented — biggest structural gap after the API quickstart.**

### J6. Troubleshooting (by observable symptom)
No quote/route → limits/route support; deposit sent but swap pending → status semantics + speedup (TBD); expired → 6h rule + refund path; refund pending → refund rules; widget won't load → ManifestError reasons + CSP + console provenance line; widget renders alert → one-per-page; wallet duplicates → EIP-6963 gotcha; build errors → legacy-only polyfills (search landing → banner + pointer).

## Implications for the content model (feeds Step 9)

1. Journeys J2 and J5 have the largest doc gaps relative to audience importance.
2. Profiles A–C each need a different *entry door* but share concepts (lifecycle, routes, fees) — argues for a shared Concepts section + per-method quickstarts (hybrid IA, to be tested in Phase 9).
3. J4's completion-tracking hole and J1's comparison duplication are product/content decisions to raise with the team alongside 3.1.
