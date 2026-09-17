# Clarification Questions for the Layerswap Team (Phase 3 / Step 5)

> Everything answerable from code or the live API has already been verified (see `raw-audits/verification-*.md`). These are only the questions that need a human owner. Each states why it matters. Please answer inline; answers get logged with owner + date in the clarification log.

## 1. Widget release (blocking the docs restructure merge) — owner: widget/release

1.1. **When do `@layerswap/widget-react` and `@layerswap/widget-js` publish to npm, and at what version?** Repo versions are `0.1.0`; npm 404s; the drafted Quickstart/Migration docs describe installing them and reference `1.x → /v1/manifest.json` semantics. *Docs cannot merge before publish, and the versioning prose must match the actual first published major.*

1.2. **Is `layerswap-widget-cdn.layerswapcdn.workers.dev` the final production CDN origin?** It's the default baked into `manifest.ts` today, and the drafted How-It-Works page tells customers to hard-code it into their CSPs. If `cdn.layerswap.io` is planned before/near launch, every partner CSP would need updating. *Decides the CSP snippet we publish.*

1.3. **Is the bundled `@layerswap/widget` path still supported for new integrators, or legacy-only?** Nav already labels it "Legacy", yet npm publishing is active (1.7.0, July 2026) and one page still says "recommended approach for most integrations". *Determines ~18 pages and all "recommended" wording.*

1.4. **Is deposit supported from `@layerswap/widget-js`?** The drafted VanillaJS page documents `mountDepositWidget`, but only `mountWidget` exists in code. *Either the function is coming, or the page documents vapor.*

1.5. **Is the `polymarket` deposit method a public, supported feature?** It's in `DEPOSIT_METHODS` and the CSP references a Polymarket relayer proxy, but no doc explains it. *Document it or exclude it from the methods list we publish.*

1.6. **Does playground.layerswap.io reflect the widget-react config shape?** *Quickstart/Theming want to link it; a stale playground would teach the old model.*

## 2. API behavior — owner: backend

2.1. **What is the quote/rate guarantee model?** The live `/quote` response has **no expiry/deadline field**, docs say "quotes are valid for a reasonable window". When a user deposits 10 minutes after quoting, what rate applies? *This is the single most important unanswered question for API integrators.*

2.2. **`GET /swaps?statuses=` — what are the correct filter values for pending states?** Live testing: `Completed`/`Refunded`/`Failed` work; `user_transfer_pending`, `UserTransferPending`, and all case variants return empty-body 400s. *Either an API bug or hidden naming; docs can't state the mapping today.*

2.3. **Can the API return the widget-core `created` status?** *The lifecycle page and every integrator's status handler depend on the complete list.*

2.4. **Rate limits: do any exist, at what thresholds, keyed how?** No headers are emitted. **Is `reference_id` an idempotency key for `POST /swaps`?** **What's the v2 versioning/deprecation policy?** *Production-readiness docs.*

2.5. **Webhooks: exact payload schema, event trigger list, and retry/timeout/ordering semantics (Svix defaults or custom?).** Current page references a "Swap Data object" that doesn't exist anywhere. *Webhook page rewrite is blocked on this.*

2.6. **Testnet: confirm environment is key-scoped on the same base URL, and describe what a testnet key returns** (which testnet networks/routes?). Live probes show no testnet hosts and a server-ignored `version` param. *First-integration journey.*

2.7. **Refunds:** is `refund_address` validated/required at create time when the route involves a swap provider (error shape?); is an over-maximum deposit refunded or does it stay `failed`; does `exclude_deposit_actions` on `GET /swaps/{id}` actually do anything? *Failure-handling docs.*

2.8. **Gasless:** does `POST /authorize` accept ERC-2612 permits or EIP-3009 only (spec says 3009-only, prose says both)? What is the canonical authorization status enum and the real validity window (docs say ~30 min; the example shows a 2030 timestamp)? Is EIP-1271 supported? *Gasless page accuracy.*

2.9. **Depository claims to confirm:** `use_depository`/`use_deposit_address` mutual exclusivity + error; `NotWhitelisted` revert semantics; Tron TRC20-only restriction. *Marked unverified in the strongest API page.*

2.10. **Which spec-visible features are public/supported vs internal** (should prose document them or should they be hidden from the swagger): `/connections`, `/transaction_status`, `POST /deposit_speedup`, `refuel`, `slippage`, `force_user_execution`, `use_new_deposit_address`, `RewardModel`, exchange source/destination + OAuth models. *Decides reference scope. If exchange routes are public, they're a headline capability that's currently undocumented.*

2.11. **Which Solana Memo program does deposit matching use** — legacy Memo v1 (`Memo1Uhk…`, as the LI.FI page says) or SPL Memo v2? (Backend code; not in the frontend repo.) *Wrong id = missed deposits for integrators.*

## 3. Product & positioning — owner: product/BD

3.1. **Who are the docs' primary audiences, in priority order?** (wallets adding deposits / dApps embedding swaps / exchanges / aggregators like LI.FI / evaluating PMs?) Do we have support-ticket or telegram-question data to ground this? *Drives the entire information architecture (Phase 4).*

3.2. **Are the Immutable and Starknet partner-doc URLs (`…/ImmutablePartnerDocs`, `…/StarknetPartnerDocs`) still shared with partners?** Both are orphaned; the Immutable one teaches the old widget under a "new version" label. *Remove vs redirect vs rewrite.*

3.3. **Is the LI.FI integration still active, and can its general content (Bitcoin OP_RETURN + Solana memo deposit mechanics — currently documented nowhere else) be promoted into the public API docs?*

3.4. **The "Deposit Address" top-level tab embeds a live widget hitting production with zero prose — does it move real funds, and who is it for?** *Currently an unlabeled app inside the docs.*

3.5. **Which marketing claims are we willing to substantiate or drop:** "most affordable", "lowest fees", "billions processed", "70+ blockchains" (live count: 66), "90+ sources", "instant"? *Non-assumption rule: replace with concrete, maintainable statements.*

3.6. **Is TRAIN still "upcoming", and what should a real Security page say about today's custody/trust model?** (Who controls funds in flight? What guarantees exist?)

3.7. **Terminology decisions needed** (Phase 5 will formalize; flagging the worst now): the word "deposit" currently names five different things (Easy Deposit tab, Deposit Widget component, Deposit Address tab/flow, `depositMethod`, Depository contract). And is the canonical product verb "swap", "bridge", or "transfer"? *Every page depends on this.*

3.8. **Support channels to document** (Telegram only? email? SLA?) — the Migration page currently says "talk to the Layerswap team" with no link.

3.9. **Is removing "Powered by Layerswap" (`hidePoweredBy`) allowed for all integrators or gated by agreement?**

3.10. **Canonical brand pink: `#FF3272` (brand-assets page) or `#E05B8A` (docs theme)?**

3.11. **Partner Dashboard: besides API keys and webhooks, what else do integrators configure there?** (Decides the dashboard page's scope; also 1.1's key-per-environment story.)
