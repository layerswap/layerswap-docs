# Verification — Follow-ups from team answers (GitHub `layerswapapp@dev`, 2026-08-06)

## 1. GET /swaps status-filter values — RESOLVED (U-42/U-47, Q2.2)

Frontend sends **PascalCase filter names distinct from response statuses**:
- `useSwapHistoryData.ts`: pending list → `statuses=PendingDeposit`; done list → `Completed, Refunded, PendingWithdrawal, PendingRefund`.
- Explorer: `statuses=Completed&statuses=PendingWithdrawal&statuses=PendingRefund&statuses=Refunded`.
- Matches live probe (Completed/Refunded/Failed accepted; snake_case and `UserTransferPending` rejected).

**Documentable mapping** (filter name → response `status`):
| Filter (query) | Response `status` |
|---|---|
| `PendingDeposit` | `user_transfer_pending` |
| `PendingWithdrawal` | `ls_transfer_pending` |
| `PendingRefund` | `pending_refund` |
| `Completed` | `completed` |
| `Refunded` | `refunded` |
| `Failed` | `failed` |
| `Expired` | `expired` (in spec's SwapStatus enum; untested live but consistent) |

Docs implication: swap-lifecycle/reference must document BOTH vocabularies + this table; filters are case-sensitive; wrong values → empty-body 400.

## 2. Solana memo program id — NOT DETERMINABLE from frontend (Q2.11 partially void)

The frontend does NOT build the deposit transaction: `packages/wallets/svm/src/transferProvider/createSvmTransfer.ts` **deserializes backend-provided `call_data`** (`Transaction.from(bytes)`). Zero memo-program references anywhere in the repo (searched both program ids, `createMemoInstruction`, spl-memo; enumerated `packages/wallets/svm/`).

So "whichever the frontend puts" = nothing; the **backend's call_data decides**. The LI.FI page's Memo-v1 claim can only be verified against backend code or a live deposit_actions sample for a Solana route. → Keep 🚧 MARK on the LI.FI page's memo section; alternatively fetch deposit_actions for a real Solana swap later.

## 3. Brand colors — RESOLVED (U-28, Q3.10)

From `packages/widget/core/src/Models/Theme.ts` + bridge logo SVG:
- **Logo/brand pink: `#FF3272`** (rgb 255,50,114) — used in `layerSwapLogo.tsx` fill and both theme presets' `logo`. **Matches brand-assets.mdx** — that page was right.
- Primary UI accent: dark theme `#CC2D5D`, light theme `#E42575`.
- The docs site theme `#E05B8A` (docs.json) matches none of these → 🚧 MARK: consider aligning docs.json primary to brand values (Babken to confirm).
