# Raw audit — Batch D: API Integration tab + OpenAPI spec (7 pages + swagger)

> Agent-produced Phase 1 audit, unedited in substance. All 7 pages committed & clean.

## ⚠️ URGENT (independent of the redesign)
`api-reference/refunds.mdx` contains a **real-looking API key in a curl example**: `X-LS-APIKEY: bwDJw8c1mesRyWfO3WrOB7iE48xAkVEI5QWlgnNFHnwH/...` plus a real swap ID and tx hashes. In git history since ≤2026-07-15. **Rotate the key and redact the example regardless of whether it's still live.**
(Related, lower severity: `snippets/networksTokens.jsx` hardcodes `DEFAULT_API_KEY` — see Batch A.)

## Page-by-page

### `integration/API.mdx` — tab entry page (last touched 2025-04)
- Conceptual overview, 6-step pseudo-quickstart, **no code, no links at all**.
- Never introduces auth (`X-LS-APIKEY`), key acquisition (api-keys page in a different tab, unlinked), base URL, testnet, versioning. Names no real endpoints; skips quote/limits step entirely.
- Marketing filler: "handles millions of dollars in transactions every day".
- Verdict: **rewrite** as a real quickstart (auth → base URL → quote → create → deposit → status).

### `api-reference/depository.mdx` (2026-06)
- Strongest page in the set. Structure verified against swagger (`use_depository` on CreateSwapRequest; deposit-action fields on TransferDepositActionModel all real).
- Unverifiable-from-spec claims to confirm: `use_depository`/`use_deposit_address` mutual exclusivity, "unsupported depository" error, `NotWhitelisted` revert, Tron TRC20-only.
- Code nit: viem snippet uses undeclared `depositAmountInBaseUnits`.
- Verdict: keep with edits.

### `api-reference/gasless-swaps.mdx` (2026-07, newest)
- Central claims verified in spec (`use_gasless` params, `/authorize` endpoints, request/typed-data fields, `supports_gasless_deposit`).
- **Spec mismatch:** spec's POST /authorize says EIP-3009 only; page also claims ERC-2612 permit.
- Prose-only (no spec backing): authorization status enum (Initiated/Published/Completed/Expired/Insufficient/Rejected), ~30-min validity (example shows `valid_before` in 2030 — contradictory), one-auth-per-swap, EIP-1271.
- Settlement-path narrative (paymaster vs Depository vs solver) potentially confusing across pages.
- Verdict: keep with edits.

### `api-reference/swap-lifecycle.mdx` (2026-07)
- **Prose statuses match spec exactly** (7/7, wording synced) — good.
- Gaps: never mentions `fail_reason`; transaction-level statuses (`pending/initiated/completed`) and types (`input/output/refuel/refund`) documented in spec but absent from prose; "failed = below minimum" vs spec's "outside the valid range" (over-max refund path unknown); Retries node dead-ends with no escalation path.
- Mermaid diagram hard-codes dark background — breaks light mode.
- Verdict: keep with edits.

### `api-reference/refunds.mdx` (2026-07)
- ⚠️ committed API key (above).
- Uses `?exclude_deposit_actions=true` — **not in swagger** (undocumented or dead param).
- "refund address required when route involves a swap provider" unverifiable; tension with lifecycle's "without refund_address → keeps retrying".
- Refund facts split inconsistently between this page and swap-lifecycle (e.g. "refund < gas fee ⇒ no refund" only on lifecycle).
- Verdict: keep with edits (urgent redaction); consider merging into swap-lifecycle.

### `api-reference/webhook.mdx` (2024-12, stalest)
- Frontmatter description is copy-pasted from another page and typo'd: "Describes the mainnet and tesnet enviorments".
- "refer to the **Swap Data object**" — no such page/anchor anywhere. No payload example, no event list, no retry/timeout/ordering semantics, no test/replay. Svix verification pointer only.
- No webhook endpoints in swagger (dashboard-only config) → this thin page is the entire webhook documentation.
- Verdict: **rewrite**.

### `recipes/privy-wallets.mdx` (2026-04)
- Only page using "bridge" terminology (`bridgeCall`, "Bridge ERC-20 tokens") — everything else says "swap".
- No cross-link to depository.mdx (canonical mechanism); no quote step before create; `OUTER_TRANSACTION_HASH` unexplained; hacky `type.toLowerCase().includes("transfer")` vs sibling's clean check; `ARC_TESTNET` routability to verify; GitHub example link `layerswap/examples/tree/main/privy-wallets` unverified.
- `GET /swaps/by_transaction_hash/{hash}` verified in spec.
- Verdict: keep with edits.

## OpenAPI spec audit (api.layerswap.io/swagger/v2/swagger.json)
- OpenAPI 3.0.1, "Layerswap API V2", **no info.description** (generated landing has no intro).
- **17 operations**, all tagged "Swaps" except `/health`: health, networks, sources, destinations, connections, limits, quote, detailed_quote, transaction_status, swaps (GET list/POST create), swaps/{id}, deposit_actions, authorize (POST/GET), deposit_speedup, by_transaction_hash.
- **Auth:** apiKey header `X-LS-APIKEY`, global; each op ALSO lists it as a non-required header parameter with no description — duplicated auth surface, renders confusingly.
- **Descriptions:** operations have 1–2 sentences; **parameters have zero descriptions across the board**; key schemas bare: SwapQuoteModel (17 props, 0 desc), TransferDepositActionModel (15 props, 0 desc), CreateSwapRequest (all bare). Exceptions (good): SwapModel.status enum with per-value descriptions; TransactionModel.type/.status enums described.
- **Status-enum trap:** `SwapModel.status` is snake_case (`user_transfer_pending`, `ls_transfer_pending`, …) but the GET /swaps `statuses` filter uses component `SwapStatus` in PascalCase with DIFFERENT names (`PendingDeposit`, `PendingWithdrawal`, …). Mapping documented nowhere.
- **NetworkType enum:** evm, starknet, solana, cosmos, starkex, zksynclite, ton, paradex, tron, fuel, bitcoin, hyperliquid.
- **Spec-has / prose-never-mentions:** /health, /sources, /destinations, /connections, /transaction_status, deposit_speedup, GET /swaps filters, CreateSwapRequest fields `reference_id`/`refuel`/`slippage`/`use_new_deposit_address`/`force_user_execution`, exchange models & OAuth, RewardModel, fail_reason, refuel tx type.
- **Prose-has / spec-never-confirms:** gasless status enum; ERC-2612 on /authorize; `exclude_deposit_actions`; depository error behaviors; 30-min window; Tron TRC20-only; all webhook semantics.

## Cross-page observations (Batch D)
- **Zero-to-first-swap path broken at the start**: tab entry page has no auth/base-URL/endpoints/links; developer must reverse-engineer `X-LS-APIKEY` from curl examples deep in other pages. No plain-vanilla flow page for direct-transfer/deposit-address funding (that lives in a separate top-level "Deposit Address" tab — fragmentation).
- Terminology: "swap" standard except Privy recipe ("bridge"); "solver" used but never defined; "partner" vs "you/integrator" voice split old vs new pages.

## Uncertainty candidates (Batch D)
1. Is the refunds.mdx API key live? (rotate either way)
2. Rate limits — documented nowhere.
3. Idempotency on POST /swaps — is `reference_id` an idempotency key?
4. Testnet mechanics: same host keyed by API key? Never stated on API pages.
5. v2 versioning/deprecation policy.
6. Webhook payload schema, event types, retry/timeout/ordering — Svix defaults or custom? ("Swap Data object" dead reference)
7. `exclude_deposit_actions`: real-but-missing-from-swagger, or dead?
8. /authorize: EIP-3009 only vs also ERC-2612.
9. Canonical gasless status enum + validity window.
10. `failed` semantics: below-min only vs outside-range; over-max refund path?
11. Refund-address create-time enforcement + error shape.
12. SwapStatus filter ↔ SwapModel.status mapping.
13. Depository claims (mutual exclusivity, NotWhitelisted, Tron TRC20-only, per-chain exceptions).
14. deposit_speedup, /connections, refuel, exchange routes, force_user_execution — public/supported or internal?
15. GitHub layerswap/examples/privy-wallets path exists?
