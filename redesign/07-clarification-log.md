# Clarification Log (Phase 3)

> Answers from Babken (product), 2026-08-06, responding to `04-clarification-questions.md`. "MARK" = leave visibly flagged for future review in the rendered docs (see marker convention at the bottom).

## 1. Widget release

| Q | Answer | Final? | Documentation consequences |
|---|--------|--------|---------------------------|
| 1.1 Publish timing | **Docs and packages ship simultaneously** — docs may assume packages are published. | Yes | REL-1 unblocked as a writing constraint; verify install commands at release time. |
| 1.2 CDN origin | **Final URL will be `cdn.layerswap.io`.** | Yes | HowItWorks CSP + all origin references must use `cdn.layerswap.io`, NOT the workers.dev origin currently baked into code and drafts. Engineering dependency: loader's `DEFAULT_MANIFEST_URL` must be updated before publish — docs and package must match. |
| 1.3 Bundled widget fate | **Not legacy.** It stays supported and updated. Recommended path = `widget-react`/`widget-js` (clients get updates automatically without npm bumps). **All existing packages get a 2.0.0 major update.** | Yes | Rename "Self-bundled Widget (Legacy)" group → e.g. "Self-bundled Widget (Advanced)"; soften "legacy" banners to "recommended alternative" framing; keep pages. **Versioning prose must match 2.0.0 reality** — drafted "1.x → /v1/manifest.json" likely becomes "2.x → /v2/…" (channel derives from `@layerswap/widget` major). Verify at release. |
| 1.4 Deposit via widget-js | **Yes, available.** | Yes | `mountDepositWidget` doesn't exist in code yet (verified 2026-08-06) — presumably lands before release. Keep it documented; MARK verify-at-release. |
| 1.5 Polymarket method | **Public.** | Yes | Document `polymarket` in Deposit Widget methods; needs a sentence on what it does (drafting gap remains). |
| 1.6 Playground | **Reflects widget-react.** | Yes | Link playground from Quickstart/Theming. |

## 2. API behavior

| Q | Answer | Final? | Consequences |
|---|--------|--------|--------------|
| 2.1 Quote validity model | Unanswered — later. | No | MARK in docs wherever quote timing is implied. |
| 2.2 Status filter values | "Get the values from the layerswapapp codebase." | Pending code check | Follow-up verification launched (how the app/explorer calls GET /swaps). |
| 2.3 10 vs 7 statuses | Check later. | No | MARK on lifecycle page. |
| 2.4 Rate limits / idempotency / versioning | Later. | No | MARK production-readiness sections. |
| 2.5 Webhooks | Use existing docs' data; MARK missing parts (payload schema, event list, retries). | Partial | Webhook page rewrite proceeds with what exists + explicit marked gaps. Dashboard screenshot provided (see 3.11). |
| 2.6 Testnet | **Confirmed: environment is key-scoped on the same base URL; a testnet key returns testnet routes.** | Yes | Document plainly in auth/quickstart. Resolves U-13. |
| 2.7 Refund rules | Later. | No | MARK. |
| 2.8 Gasless specifics | Later. | No | MARK (EIP-3009 vs 2612, status enum, window). |
| 2.9 Depository claims | Later. | No | MARK. |
| 2.10 Spec-only features | **"If they are not in swagger, do not document them."** Inverse rule adopted: swagger presence = documentable. | Yes | `/connections`, `/transaction_status`, `deposit_speedup`, `refuel`, `slippage`, exchange models etc. ARE in swagger → documentable. `exclude_deposit_actions` is NOT in swagger → remove from refunds page. Webhook prose exempt per 2.5. |
| 2.11 Solana memo id | "Whichever the frontend puts is what the backend uses." | Pending code check | Follow-up verification launched (memo program id in layerswapapp frontend). |

## 3. Product & positioning

| Q | Answer | Final? | Consequences |
|---|--------|--------|--------------|
| 3.1 Audience data | **No support/analytics data exists.** | Yes | Audience ranking = our judgment; keep profiles provisional; MARK for validation. |
| 3.2 Partner orphan pages | Not recognized ("donno what you are talking about"). | Effectively yes | Nobody is tracking these URLs → treat as forgotten. Provisional plan: fold/remove with redirects; MARK for confirmation. |
| 3.3 LI.FI page fate | Not known yet. | No | Keep hidden as-is; MARK. Don't promote its content yet. |
| 3.4 Deposit Address mode | Explained: for users who can't connect a wallet (e.g. funds on an exchange); funds sent to the deposit address are auto-detected and swapped based on the last created swap. **But leave for future work — may be excluded entirely.** | Deferred | Do NOT invest in DepositAddress tab docs now; MARK the tab for future decision. Keep the explanation in this log as source material. |
| 3.5 Marketing claims | Decide ourselves; **MARK VISUALLY in the rendered docs** so they're identifiable for review. | Delegated | Adopt review-marker convention (below). Replace superlatives with concrete statements + marker. |
| 3.6 TRAIN | Still upcoming. Existing mention (security.mdx) stays as-is; add nothing new. | Yes | Freeze TRAIN content at current state. |
| 3.7 Terminology | Decide ourselves; MARK all decisions for Babken's review/validation. | Delegated | Phase 5 terminology doc proceeds with decisions + markers. |
| 3.8 Support link | MARK a placeholder in the UI; Babken adds the link later. | Deferred | Use marked placeholder wherever escalation/contact is needed (incl. Migration page's "talk to the team"). |
| 3.9 hidePoweredBy | **Allowed for everyone.** | Yes | Document without caveats. |
| 3.10 Brand color | Use whatever layerswapapp uses for logo/main colors. | Pending code check | Follow-up verification launched. |
| 3.11 Partner Dashboard scope | Screenshots provided: **Webhooks** (add/manage endpoint URLs — "Webhook events will be sent as POST requests to the specified URL") and **App settings**: App Logo upload (PNG/JPG ≤10MB) and **Wallet Integration branding** toggle — when enabled, users redirected from the partner app with pre-filled addresses (`?destAddress=0x123…`) see "Autofilled by &lt;app&gt;" + the app's logo next to the address field. | Yes | Dashboard page can document: keys per env, webhooks, app logo, wallet-integration branding. The branding toggle finally explains the `appName`/`addressSource` attribution params — link the hosted-page docs to it. Note: dashboard UI itself still uses `destAddress` naming. |

## Review-marker convention (from 3.5/3.7/3.8)

Requirement: pending items must be **visually distinct in the rendered Mintlify app** so Babken can spot them while browsing.

Convention for the writing phase:
- Inline block: `<Warning title="🚧 Needs review">…what's undecided and why…</Warning>` — renders as an orange callout, visually distinct from normal Note/Info callouts.
- Categories used in the title for scanning: `🚧 Needs review — terminology` / `— claim` / `— awaiting API answer (Qx.x)` / `— support link placeholder`.
- Every marker cross-references the question number in this log so the sweep-and-resolve pass is mechanical.
- Tracked centrally: a checklist of all markers goes in `09-open-markers.md` (created when writing starts) so none are forgotten.

## 4. Redesign navigation decisions

Recorded 2026-08-11 after review of the Phase 14 production map, reconciliation map, migration plan, and blocker table.

| Decision | Resolution | Documentation consequence |
|----------|------------|---------------------------|
| D-A — Deposit Address tab | Hide it. | Keep `DepositAddress.mdx` and its snippet on disk, but omit the tab from production navigation. |
| D-B — Changelog | Keep it hidden. | Preserve `changelog/api.mdx`; revisit ownership and backfill after release. |
| D-C — Partner-logo wall | Omit it. | The homepage remains an orientation and routing page, without a maintenance-heavy logo wall. |
| D-D — Easy Deposit naming | Use “Deposit tab.” | Use “Easy Deposit” only when mapping old terminology to the current name. |
