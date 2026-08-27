# Source Inventory (Phase 0)

> Working artifact for the docs redesign. Status: **draft — in progress**.
> Last updated: 2026-08-06. Everything marked "to verify" has not yet been confirmed against a live source.

## Confirmed sources

| # | Source | Location | What it can explain | Reliability | Freshness | Access status |
|---|--------|----------|--------------------|------------:|----------:|---------------|
| 1 | Docs repo (this repo) | `layerswap-docs` (Mintlify, deployed to docs.layerswap.io) | Current documented model; navigation; page inventory | Medium (docs ≠ product truth) | Mixed — repo is **mid-migration** (uncommitted widget-react restructure, ~27 modified + 9 new files) | Full |
| 2 | Widget migration plan | `widget-react-docs-plan copy.md` (repo root, untracked) | New widget architecture (`@layerswap/widget-react`, `@layerswap/widget-js`, CDN Module Federation remote, signing/security model); page-level migration map; open decisions | High (written from `layerswapapp` code with file/line refs) | 2026, current | Full |
| 3 | `layerswap/layerswapapp` monorepo | github.com/layerswap/layerswapapp | Widget/loader/types source of truth: `packages/widget/{react,js,types,core}`, `examples/widget-react-host`, `apps/widget-playground`, `apps/widget-cdn` | High | Current on GitHub (**local checkouts may be stale — always read from GitHub**) | Public repo |
| 4 | API reference (OpenAPI) | `https://api.layerswap.io/swagger/v2/swagger.json` (embedded in docs via docs.json) | Endpoint behavior, schemas, auth headers, status enums | High | Live | Public |
| 5 | Live app | layerswap.io/app | User-facing behavior, terminology, actual flows | High | Current | Public |
| 6 | Explorer | layerswap.io/explorer | Transfer/status visibility, swap lifecycle in practice | High | Current | Public |
| 7 | Dev community | t.me/layerswap_dev | Recurring integration questions, support pain points | Medium (anecdotal) | Current | Public; needs manual review |
| 8 | Public roadmap | layerswap.ducalis.io/layerswap-roadmap | Product direction; what's stable enough to document | Medium | To verify | Public |
| 9 | Git history (this repo) | `git log` | Recent doc corrections = known accuracy pain points (e.g. `refund_pending → pending_refund` status fix, gasless swaps addition, Depository deposit flow, LI.FI Solana fixes) | High | Current | Full |

## Sources referenced but not yet catalogued

| Source | Why needed | Access status |
|--------|-----------|---------------|
| Partner Dashboard | API key issuance flow; what partners actually configure | URL and access to verify |
| npm registry (`@layerswap/widget-react`, `@layerswap/widget-js`, `@layerswap/widget`, `@layerswap/wallets`) | **Checked 2026-08-06:** widget-react / widget-js / widget-types all 404; `@layerswap/widget@1.7.0` + `@layerswap/wallets@1.7.0` live (2026-07-14) | Confirmed |
| Production CDN origin for widget remote | Docs-in-progress now cite `layerswap-widget-cdn.layerswapcdn.workers.dev` (plan referenced an older test blob — origin moved once already) | **Team confirmation required** |
| Widget playground | Deployed at playground.layerswap.io (iframed in Playground.mdx); whether it reflects widget-react config shape unverified | Public; to verify |
| Support tickets / analytics / search queries | Audience discovery (Phase 4), prioritization (Phase 8) | Not available in repo — **needs team** |
| Known partner implementations (Immutable, Starknet partners, LI.FI, Privy recipe) | Real integration journeys | Partially visible in docs (orphaned partner pages, lifi-integration.mdx, recipes/privy-wallets.mdx) |
| Testnet environment (base URLs, sandbox keys) | First-integration journey | To verify — docs mention `version: 'testnet'`; API-side testnet story unclear |
| Deposit Address / Depository product docs & code | Whether "Depository"/"Deposit Address" is a separate product or an API feature | To verify against code + team |

## Known in-flight work (must not be double-audited or clobbered)

- Uncommitted widget-react restructure per `widget-react-docs-plan copy.md`: rewritten Quickstart/Compatability/DepositWidget/Customization/EventCallbacks pages; new Configuration, HowItWorks, VanillaJS, WagmiConfig, Wallets, onSwapStatusChange, onMenuNavigationChange pages; new `Legacy/` group (SelfBundled, Migration); docs.json nav updated. ~641 insertions / 604 deletions vs HEAD.
- Open decisions listed in that plan (§5): fate of bundled `@layerswap/widget` path; production CDN origin; npm publish status; playground deployment; typed `initialValues`; per-chain wallet configurability; stale `@deprecated` JSDoc.

## Orphaned pages (on disk, absent from docs.json navigation)

- `integration/UI/Widget/Widget.mdx`
- `integration/UI/Widget/EasyDeposit.mdx`
- `integration/UI/Widget/TabOptions.mdx`
- `integration/UI/Widget/ImmutablePartnerDocs.mdx`
- `integration/UI/Widget/StarknetPartnerDocs.mdx`

Hidden nav tabs: `lifi-integration` (hidden), `changelog/api` (hidden). `DepositAddress` tab is visible (`hidden: false`).
