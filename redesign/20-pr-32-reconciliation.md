# PR #32 reconciliation

Reviewed on 2026-08-24 against `docs-redesign`.

PR #32 adds a consumer-facing API guide and detailed deposit-action execution guidance. The redesign already has canonical homes for the API overview, end-to-end quickstart, and funding-method comparison, but it was missing most of the PR's per-network transaction detail.

## Included and adapted

| PR #32 content | Redesign destination | Decision |
|---|---|---|
| Deposit-action schema and funding-mode behavior | `api/funding/transfer` | Merged into the canonical “Execute deposit actions” overview. |
| EVM, Bitcoin, Solana, Starknet, TON, Tron, and Fuel guides | `api/funding/networks/*` | Added under an expandable “Source-network execution” group immediately after the deposit-action overview. Examples use exact base-unit integers and avoid unnecessary full-wallet implementations. |
| Stable token identification (`contract` / `group`, not symbol) | `concepts/routes-quotes-limits` and `api/quickstart` | The `group`/`contract` lookup pattern lives under Routes in the concepts page; the quickstart's route-selection step warns against hardcoded symbols (USDT → USDT0) and links there. *Correction 2026-08-24: an earlier revision of this table claimed this was already ported — it was not; added during review.* |
| Tron TRC-20 Depository flow | `api/funding/depository` | Added beside the existing EVM implementation. |
| Bitcoin `call_data` terminator and `BigInt` correction | Bitcoin network guide and hidden `lifi-integration` page | Applied in both places so the hidden partner guide is not factually stale. |
| Solana top-level memo and `metadata.sequence_number` | Solana network guide | Added and marker M25 resolved. The serialized API transaction remains the recommended path. |

## Already covered; not duplicated

| PR #32 content | Existing canonical home |
|---|---|
| Rewritten API integration overview | `api/overview` and `api/quickstart` |
| Choosing a deposit method | `concepts/funding-methods` |
| EVM Depository approve-and-submit example | `api/funding/depository` |
| End-to-end create → fund → track flow | `api/quickstart` |

## Intentionally omitted or modified

- ~~`deposit_speedup` is not promoted into the prose guides yet.~~ *Revised 2026-08-24:* the endpoint is in the live swagger (documentable per clarification 2.10), so a minimal pointer was added to `api/funding/transfer` ("Validate and track"). Deeper operational semantics remain undocumented pending verification.
- PR navigation and icon changes target the old information architecture and are replaced by the redesign's API tab structure.
- Main-branch merge changes in the PR are not replayed; this branch already incorporates or redirects their canonical content.
- ~~Long examples were shortened where they coupled the docs to wallet-specific signing APIs.~~ *Revised 2026-08-25 (Babken's direction: follow the PR):* the network guides were restored to PR breadth — per-stack tabs (viem/ethers.js/wagmi, server-side/browser/react variants), the full Bitcoin PSBT flow, the `signPsbt` hardware-wallet walkthrough, gas-estimation fallbacks, and the "Supported networks" lines. The PR's code defects stayed fixed: examples use `amount_in_base_units` instead of float conversions, the Bitcoin `network` redeclaration is resolved, and the TON examples keep the app-verified amount and response-address corrections. Also restored: the `<Steps>` "Transaction construction" walkthroughs on all six pages that had them, and the PR's shared-snippet structure — `snippets/depository-deposit-{evm,tron}.mdx` are embedded as "Funding via the Depository" sections on the EVM and Tron guides and consumed as tabs on `api/funding/depository`, so the Depository code is single-sourced.
- Manual ERC-20 deposit-address actions are handled explicitly instead of being sent as empty-data zero-value EVM transactions.

## Review corrections (2026-08-24)

A review against the PR diff and `layerswap/layerswapapp` found and fixed the following in the initial port:

- **TON native amount** — the ported example took the transfer value from the parsed `call_data.amount`; the app (`packages/wallets/adapters/ton/src/transferProvider/transactionBuilder.ts`) never reads it for native TON. The example now uses the action's `amount_in_base_units`. `call_data.amount` is documented as the Jetton amount only.
- **TON Jetton response address** — the port sent response excess to the sender; the app stores the destination address. Reverted to match the app.
- **Mutual exclusivity** — `use_depository` vs `use_deposit_address` (stated three times in the PR) was missing everywhere; added to `concepts/funding-methods`.
- **Solana resend-until-confirmed** — the PR's retry pattern was dropped silently; restored in condensed form on the Solana guide.
- **Bitcoin** — restored the PR's address-type/sighash table and the Mempool.space pointer.
- **Token identification by `contract`/`group`** — see the corrected row in "Included and adapted".

Still open: URL redirects for the PR's `api-reference/deposit-actions/*` pages if PR #32 merges to main first (Babken will revisit). All example-breadth omissions were restored on 2026-08-25 per Babken's direction — see the revised bullet above.

*2026-08-25:* the Starknet/TON transfer-only claim was added to `concepts/funding-methods` on team authority with a 🚧 needs-review marker (M29).

## Verification

- `jq empty docs.json`
- `git diff --check`
- `mintlify broken-links` with the live OpenAPI source
- `mintlify validate` strict build validation
