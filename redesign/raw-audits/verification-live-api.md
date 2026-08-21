# Verification — Live API probes (2026-08-06, read-only)

> Base: https://api.layerswap.io/api/v2. Keys: public demo keys from the docs repo. No POSTs made.

## Findings keyed to uncertainty register

### U-10 — Auth on read endpoints: RESOLVED
- `/networks` and `/quote` work **without any API key** (200).
- Invalid key → **403** `{"error":{"code":"API_KEY_FORBIDDEN","message":"Api key forbidden","metadata":{"StatusCode":403}}}`. No 401 "key required" observed on read endpoints.
- Doc impact: fees.mdx's keyless curl example is actually valid; api-keys/API quickstart should state which endpoints are public vs key-required (creation presumably requires key — unverified, no POSTs made).

### U-19 — Response envelope + market impact: RESOLVED
- Everything is `{"data": ...}`-wrapped. `/quote` → `{"data":{"quote":{...},"refuel":null,"reward":null}}` — **lifi-integration.mdx is right; fees.mdx's top-level `{"quote":...}` is wrong.**
- `/swaps/{id}` → `{"data":{"deposit_actions":[],"swap":{},"quote":{},"refuel":null,"reward":null}}`.
- Quote fields actually present: requested_amount, receive_amount, min_receive_amount, fee_discount, blockchain_fee, service_fee, **total_fee, total_fee_in_usd** (undocumented), avg_completion_time, refuel_in_source, slippage, rate, path[{provider,order}].
- **No "market impact" field exists** — closest analogues: slippage, rate, min_receive_amount. fees.mdx's three-component fee taxonomy has no API counterpart for component #3.
- **No quote expiry/deadline field exists** (no expires_at/valid_until). The "quote validity window" question is now also an API-design gap, not just a docs gap.
- `avg_completion_time` = .NET TimeSpan string (`"00:00:03.6643572"`); `/detailed_quote` instead uses numeric `avg_completion_milliseconds`. Confirms ACC-9 (not ISO 8601).
- `/detailed_quote` returns `{"data":[...]}` (an ARRAY) with min/max amounts, per-provider fee breakdown in path[].

### Error model: RESOLVED (new fact)
- Singular `{"error":{code,message,metadata}}` — e.g. `ROUTE_NOT_FOUND_ERROR` (404), `API_KEY_FORBIDDEN` (403), `UNEXPECTED_ERROR` "Address is required" (400).
- `metadata.StatusCode` typing inconsistent (numeric 403 vs string "NotFound").
- **Binding-level 400s return a completely empty body** (bad enum values, missing required enum params) — integrators must handle empty-body 400s.

### U-42 — Status filter enum: RESOLVED (worse than suspected)
- `GET /swaps` requires `address` param (400 without).
- Filter accepts **exact PascalCase, case-sensitive**: `Completed`, `Refunded`, `Failed` work. Rejected with empty-body 400: `completed`, `REFUNDED`, `user_transfer_pending`, **and `UserTransferPending`** (!). Multi-word pending statuses may not be filterable at all under their documented names.
- Response `status` values are snake_case (`"refunded"`) — accepted filter values ≠ response values. Docs must document the mapping and warn; API team should be told `UserTransferPending`/`PendingDeposit` behavior needs clarification.

### U-17 (partial) — `exclude_deposit_actions`: INCONCLUSIVE
- Param accepted without error; refunds.mdx example swap exists (status `refunded`) but its `deposit_actions` is already `[]`, so responses were byte-identical. `deposit_actions` key remains present as `[]` even with the flag. Needs a live-pending swap to test properly, or team answer.

### U-13 — Testnet: PARTIALLY RESOLVED
- No separate testnet hosts (api-testnet./sandbox. variants don't resolve).
- `/networks?version=testnet` silently ignored — returns same 66 mainnet networks with or without key. Widget's `version` prop is client-side.
- Consistent with api-keys.mdx claim that environment is **key-scoped on the same base URL** — but the testnet side is unverified without a testnet key. TEAM: confirm + document.

### U-11 (partial) — Rate limits: no headers
- No `X-RateLimit-*`, no `Retry-After`, no request-id — only Cloudflare basics. Limits may exist unheadered; TEAM question stands.

### Endpoint shapes (spec-only endpoints, now characterized)
- `/health` — 200, empty body, no auth. Liveness only.
- `/sources` — `{"data":[networks]}` where tokens carry per-route `status: "active"` + `refuel`; optional `destination_network/token` filters (66→39 networks when filtered).
- `/destinations` — symmetric to /sources; refuel objects populated (e.g. ETH refuel on ZKSYNCERA_MAINNET).
- `/connections` — requires all four params (bare call = empty-body 400); returns token-group interconnectivity for a network pair (e.g. USDT→USDT0 mapping).
- 66 networks live (docs say "70+" — drifted, confirms the hardcoded-count risk).

## New doc-impacting facts (not previously in registers)
1. `total_fee`/`total_fee_in_usd`/`fee_discount` exist in quotes — undocumented.
2. Empty-body 400s on binding errors — integrator-facing footgun, undocumented.
3. `/detailed_quote` envelope is an array and uses different time units than `/quote`.
4. `USDT→USDT0` style token-group mappings via /connections — the only place cross-token routing is visible.
5. Live network count 66 vs "70+" claim.
