# Production journey validation (2026-08-11)

> Walkthrough performed after the Batch 8 navigation and redirect swap. “Pass” means the reader can reach a safe next action without relying on a retired page or an invented product claim. Visible release markers remain governed by `14-open-markers.md` and `18-release-blocker-table.md`.

| Journey / audience | Walked path | Result |
|---|---|---|
| A — wallet / embedded-wallet deposits | What is Layerswap → Choose your integration → Add deposits to your wallet → Deposit Widget → lifecycle → production checklist | **PASS.** Fixed destination, funding methods, completion verification, testnet, and release checks are connected. Polymarket copy and `mountDepositWidget` stay marked. |
| B — React dApp Widget | Choose your integration → Widget quickstart → initial values → wallets/wagmi → theming → events → How the Widget works → production checklist | **PASS.** The path covers destination locking, host wagmi ownership, CSP, error channels, prop stability, and one-Widget behavior. ENG-1 remains the external release blocker. |
| C — backend/API integrator | API overview → API quickstart → routes/fees/lifecycle → transfer/Depository/gasless → tracking → webhooks/errors → production checklist | **PASS.** Auth, envelopes, empty-body 400s, per-chain funding, filter vocabulary, and failure states are reachable. Unpublished policy is visibly marked. |
| D — evaluator | What is Layerswap → live networks/tokens → Choose your integration → routes/fees/security → quickstart/demo | **PASS.** Unsupported volume/count/speed superlatives are absent; live-data and audit/security facts replace them. Logo wall intentionally omitted. |
| E — existing integrator | Old bookmarked Widget URL → redirect → Self-bundled Widget — Advanced / migration guide → provider/build references → support | **PASS.** Self-bundled remains supported, old paths redirect, and custom-provider limitations are explicit. Changelog remains hidden pending ownership. |
| F — support-driven end user | What is Layerswap / Explorer → Resources / Support → lifecycle and transaction visibility | **PASS WITH SCOPE NOTE.** Developer docs route diagnostic cases to Explorer/support; they do not pretend to be an end-user help center. A separate help-center decision remains outside this release. |
| G — AI / text consumer | What is Layerswap → prose network fallback + API pointers → concept glossary → prose quickstarts/references | **PASS.** JS embeds have prose fallbacks and machine-readable endpoint pointers; canonical terms and response shapes are in text. |
| Hosted/mobile flow | Choose your integration → Hosted Page setup → link/redirect/iframe → Track completion | **PASS WITH MARKER.** Canonical URL construction and verified server-side correlation work; no redirect-back/browser callback is invented. |
| Troubleshooting | Widget symptom → Troubleshooting / How the Widget works; API symptom → Errors / Track swaps / lifecycle | **PASS.** Search-landed advanced build fixes carry scope banners; release and product-policy gaps remain marked. |

## Gate summary

- Six production tabs only; Deposit Address, LI.FI, and changelog files remain hidden by omission.
- 74 redirect destinations checked by Mintlify.
- No broken internal links, anchors, or snippet links.
- No production `.mdx` reference to the old workers.dev CDN.
- Older Hosted Page aliases appear only in the alias table and the Partner Dashboard compatibility note.
- Remaining reader-visible review topics are reconciled in `14-open-markers.md` and classified in `18-release-blocker-table.md`.
