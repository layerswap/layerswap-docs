# Issue Register (Phase 1)

> Findings classified per the working-plan categories. Severity: 🔴 urgent · 🟠 high (blocks correct integration or publishing) · 🟡 medium · ⚪ low.
> Source detail: `raw-audits/batch-{A,B,C,D}-*.md`. Uncertainties (unanswerable from docs alone) live in `03-uncertainty-register.md`.

## 🔴 Urgent

| ID | Issue | Where |
|----|-------|-------|
| REL-1 | In-progress docs document **unpublished npm packages** (`@layerswap/widget-react`, `widget-js`, `widget-types` all 404). Merging the restructure before publish ships uninstallable instructions. | Whole widget restructure |

### Resolved
| SEC-1 | API key in refunds.mdx curl example — **accepted by Babken 2026-08-06: exposure is OK** (intentionally public/demo key). No action. | `api-reference/refunds.mdx` |
| SEC-2 | Hardcoded `DEFAULT_API_KEY` in docs snippet — **accepted, same decision**. | `snippets/networksTokens.jsx` |

## Accuracy

| ID | Sev | Issue | Where |
|----|-----|-------|-------|
| ACC-1 | 🟠 | Quote response envelope conflict: `{"quote": …}` vs `{"data": {"quote": …}}` — one is wrong | `fees.mdx` vs `lifi-integration.mdx` |
| ACC-2 | 🟠 | Immutable package names contradict across pages: `wallet-imtbl-*` vs `wallet-immutable-*` | `NativeWalletPackages.mdx` vs provider pages, `NextTranspilePackages.mdx` |
| ACC-3 | 🟠 | `imtblPassport` (provider id / deprecated config field) vs `immutablePassport` (walletDefaults key) — unconfirmed which is which | `Wallets.mdx`, `Configuration.mdx` |
| ACC-4 | 🟠 | Dynamic-example conflict: one copy omits `ready: true` + `disconnectWallets` that the other calls "Critical: widget will not function without it" | `StarknetWithDynamics.mdx` vs `CustomWalletManagement.mdx` |
| ACC-5 | 🟠 | Gasless: spec says POST /authorize is EIP-3009; prose also claims ERC-2612 permit | `gasless-swaps.mdx` vs swagger |
| ACC-6 | 🟠 | `?exclude_deposit_actions=true` used in example but absent from swagger | `refunds.mdx` |
| ACC-7 | 🟠 | ParadexProvider imports `createEVMProvider`/`createStarknetProvider` from `@layerswap/wallet-paradex` — likely copy-paste error | `ParadexProvider.mdx` (also ImtblPassport page) |
| ACC-8 | 🟠 | HowItWorks security claims (ECDSA P-256, SHA-384 SRI, 30-day validity, +5-min skew, kill switch, ManifestError reasons) unverified vs loader source | `HowItWorks.mdx` |
| ACC-9 | 🟡 | `avg_completion_time` labeled "ISO 8601" but format is .NET TimeSpan (`00:02:00`) | `lifi-integration.mdx` |
| ACC-10 | 🟡 | Solana Memo program id shown is Memo **v1**; SPL Memo v2 is standard — verify which Layerswap matches | `lifi-integration.mdx` |
| ACC-11 | 🟡 | `failed` = "below minimum" (prose) vs "outside the valid range" (spec); over-max refund path undefined | `swap-lifecycle.mdx` |
| ACC-12 | 🟡 | onFormChange payload claims all fields required strings — implausible for a partial form | `onFormChange.mdx` |
| ACC-13 | 🟡 | Example URLs are literally broken if copy-pasted (multi-line, `?` followed by `&`) | `iFrame.mdx`, `HostedPage.mdx` |
| ACC-14 | 🟡 | Invalid placeholder syntax `{LAYERSWAP_API_KEY}` / `{DYNAMIC_ENVIRONMENT_ID}` in plain code blocks | Starknet pages, StarknetPartnerDocs |
| ACC-15 | 🟡 | Code bugs in examples: `useChainConfigs(settings.networks)` before loading guard (×3 pages); `WidgetLoading` used before import; undefined `queryClient`; undeclared `depositAmountInBaseUnits` | WalletManagement hub, PartialIntegration, WagmiConfig, depository |
| ACC-16 | 🟡 | "gasless ~30-min validity" vs example `valid_before` in 2030; auth status enum exists only in prose | `gasless-swaps.mdx` |
| ACC-17 | ⚪ | "instantly deposit funds" / "completes in seconds" vs fees page's ~20-min routes | `introduction.mdx`, `fees.mdx` |

## Completeness

| ID | Sev | Issue | Where |
|----|-----|-------|-------|
| CMP-1 | 🟠 | **Zero-to-first-swap path broken at the start**: API tab entry has no auth header, base URL, endpoint names, or links; `X-LS-APIKEY` must be reverse-engineered from curl examples on other pages | `integration/API.mdx` |
| CMP-2 | 🟠 | api-keys page never shows how to USE a key (header name, sample request, testnet base URL) | `api-keys.mdx` |
| CMP-3 | 🟠 | Webhooks: no payload example, no event list, no retry/timeout/ordering, dead "Swap Data object" reference; only webhook doc that exists | `webhook.mdx` |
| CMP-4 | 🟠 | LI.FI guide (the only doc of BTC OP_RETURN / Solana memo deposits) mentions **no authentication at all** and is hidden | `lifi-integration.mdx` |
| CMP-5 | 🟠 | Swagger: **zero parameter descriptions** across all 17 operations; key schemas bare (SwapQuoteModel 17 props / TransferDepositActionModel 15 props / CreateSwapRequest — 0 descriptions) | OpenAPI spec |
| CMP-6 | 🟡 | Spec features with no prose anywhere: /sources, /destinations, /connections, /transaction_status, deposit_speedup, GET /swaps filters, `reference_id`, `refuel`, `slippage`, exchange models/OAuth, `fail_reason` | spec vs prose |
| CMP-7 | 🟡 | `polymarket` deposit method accepted but never explained anywhere | `DepositWidget.mdx` |
| CMP-8 | 🟡 | Named theme presets, `depositMethod` values, `SwapStatusEvent.path`, menu-navigation path values — accepted values undocumented | Configurations, DepositWidget, event pages |
| CMP-9 | 🟡 | Security page has no security model (custody, in-flight funds, recovery, bug bounty) | `security.mdx` |
| CMP-10 | 🟡 | Immutable Passport `walletDefaults` config shape undocumented | `Wallets.mdx` |
| CMP-11 | ⚪ | No rate limits, idempotency, or versioning policy documented anywhere | all API docs |

## Duplication

| ID | Sev | Issue |
|----|-----|-------|
| DUP-1 | 🟠 | Dynamic Labs example exists in **three copies** (CustomWalletManagement ✓corrected, StarknetWithDynamics ✗stale, StarknetPartnerDocs ✗orphan) — and two of them contradict on a "critical" field |
| DUP-2 | 🟠 | ~190-line swap type dump duplicated verbatim on onSwapCreate + onSwapComplete |
| DUP-3 | 🟡 | Tab/locking facts spread across 4 pages (TabOptions, Configurations, ThemeConfiguration, EasyDeposit) |
| DUP-4 | 🟡 | Theme field docs owned by both Colors and ThemeConfiguration (the `logo` addition had to be made twice in this very restructure) |
| DUP-5 | 🟡 | Two "choose your integration" pages: `Integrate.mdx` vs `IntegrationOverview.mdx` |
| DUP-6 | 🟡 | LI.FI guide duplicates depository.mdx (deposit actions) and fees.mdx (quote) — with drift already visible (ACC-1) |
| DUP-7 | 🟡 | 6 of 10 provider pages ~90–95% boilerplate (~70–75% duplication across the set); WalletConnect block verbatim ×3 |
| DUP-8 | ⚪ | iFrame ⇄ HostedPage ~60% identical incl. verbatim Note; 3 phrasings of "one widget per page"; "remount to recover" ×2 |

## Terminology

| ID | Sev | Issue |
|----|-----|-------|
| TERM-1 | 🟠 | swap / bridge / transfer / deposit used interchangeably, no glossary; Privy recipe is "bridge"-first, everything else "swap"; "swap" also means both the API object and the on-chain exchange step |
| TERM-2 | 🟠 | **"deposit" does five jobs**: Easy Deposit tab, Deposit Widget component, DepositAddress tab, `depositMethod`, `hideDepositMethod` — plus "Depository" (contract) and "deposit address" (funding method) on the API side |
| TERM-3 | 🟠 | Status enum trap: `SwapModel.status` snake_case vs `SwapStatus` filter PascalCase with different names (`PendingDeposit` ≠ `user_transfer_pending` — mapping documented nowhere) |
| TERM-4 | 🟡 | `Configuration` vs `Configurations` — adjacent nav entries, one letter apart; iFrame/HostedPage still say "configuration parameters" for the retitled "Initial Values" page |
| TERM-5 | 🟡 | "version" = network set (`mainnet`/`testnet`) on Configuration.mdx but package/protocol version in Quickstart — both core pages |
| TERM-6 | 🟡 | Legacy params (`destAddress`, `asset`) still live in iFrame/HostedPage examples while Initial Values page deprecates them |
| TERM-7 | ⚪ | "Partner Dashboard" title vs `api-keys` slug; "partner" vs "you/integrator" voice split; "solver" used but never defined; iFrame/IFrame casing; SVM vs `'solana'` id |

## Outdated content

| ID | Sev | Issue |
|----|-----|-------|
| OUT-1 | 🟠 | Changelog has one entry (2024-11) about the docs page itself; real API changes (gasless, depository, refunds) unrecorded |
| OUT-2 | 🟠 | webhook.mdx untouched since 2024-12 with a copy-pasted typo'd description ("tesnet enviorments") |
| OUT-3 | 🟡 | ImmutablePartnerDocs: old-model instructions described as "the new version of Layerswap Widget" |
| OUT-4 | 🟡 | TRAIN described as "upcoming" — verify still true Aug 2026 |
| OUT-5 | ⚪ | cloud.walletconnect.com (Reown rebrand), docs.ton.org deep path, `dev-monorepo` branch-pinned example links (×6), README is stock Mintlify starter referencing nonexistent `mint.json` |

## Structure & discoverability

| ID | Sev | Issue |
|----|-----|-------|
| STR-1 | 🟠 | 5 orphaned pages; 2 receive links from in-nav pages (Configurations→EasyDeposit, ThemeConfiguration→TabOptions) — readers land on nav-less pages |
| STR-2 | 🟡 | api-keys lives in the Overview tab while its consumers are in API/UI tabs (unlinked from API entry page) |
| STR-3 | 🟡 | Deposit-address funding is a top-level tab (unlabeled live demo) instead of documentation; fragmentions the API story |
| STR-4 | 🟡 | Misspelled slug `Compatability` about to be re-baked into a fresh URL |
| STR-5 | 🟡 | introduction.mdx has zero internal links; Integrate/Overview Get Started cards don't match their own decision tables |
| STR-6 | ⚪ | DepositAddress/Playground pages have no frontmatter title/description (invisible to search/LLM consumers); networks-tokens has no prose fallback |

## Developer experience & visual

| ID | Sev | Issue |
|----|-----|-------|
| DX-1 | 🟡 | Mermaid lifecycle diagram hard-codes dark background — broken in light mode | 
| DX-2 | 🟡 | onError 18-type union + swap type dumps are hand-maintained code mirrors — will drift; candidates for generation |
| DX-3 | ⚪ | Code fences mislabeled (` ```typescript ` for shell installs); stray `theme={"system"}` attrs; `frameborder`/`frameBorder` mix |

## Unsupported claims (Non-assumption rule 4)

- "most affordable", "lowest possible fees", "blockchains that aren't supported elsewhere", "instantly deposit funds" (`introduction.mdx`)
- "processed billions of dollars… showcasing its robustness and safety", "trustless" undefined (`security.mdx`)
- "handles millions of dollars every day" (`integration/API.mdx`)
- "90+ sources" (`IntegrationOverview.mdx`); "70+ blockchains / 15+ exchanges" hardcoded counts (`introduction.mdx`)
- "quotes are valid for a reasonable window" (`lifi-integration.mdx`); "completes in seconds" (`fees.mdx`)
