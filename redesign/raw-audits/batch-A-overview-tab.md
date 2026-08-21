# Raw audit — Batch A: Overview tab + standalone tabs (11 pages)

> Agent-produced Phase 1 audit, unedited. Verdicts are provisional inputs, not decisions.
> Git state: all 11 pages committed & clean (the in-flight widget restructure does not touch them).

## 1. `introduction.mdx`
- **Frontmatter:** "Introduction" / "Learn about Layerswap and find quick answers to your questions"
- **Audience:** mixed — developer/partner evaluating, but end-user marketing tone. **Type:** marketing.
- **Issues:** unsupported superlatives ("most affordable", "lowest possible fees", "blockchains that aren't supported elsewhere", "instantly deposit funds" — fees.mdx itself says some routes take ~20 min); typos ("cost-efficent", "onbaording"); Typeform link with leftover placeholder `#name=xxxxx`; description promises FAQ that doesn't exist; **zero internal links** — dead end for developers; hardcoded "70+ blockchains / 15+ exchanges" counts will drift.
- **Links:** external partner sites only (ready.co, paradex.trade, immutable.com, linea, getclave, nostra, typeform, layerswap.io/help, x.com). No internal links.
- **Verdict:** rewrite — first page has no developer on-ramp.

## 2. `Integrate.mdx`
- **Frontmatter:** "Integrate Layerswap" / no description.
- **Audience:** developer evaluating. **Type:** conceptual router page (Widget / API / iFrame / Hosted page cards).
- **Issues:** duplicates `integration/UI/IntegrationOverview.mdx` (two competing "choose your integration" pages); inconsistent hrefs (absolute vs relative); raw inline SVG icon vs named icons; vague copy ("prebuilt, optimized gateway", "easily and securely"); no comparison criteria (effort, control, key requirements); typo "embeding".
- **Verdict:** keep with edits + dedup against IntegrationOverview.

## 3. `api-keys.mdx`
- **Frontmatter:** "Partner Dashboard" / registration + API keys description. Slug says `api-keys`, title says "Partner Dashboard" — sidebar/URL disagree.
- **Audience:** integrating developer. **Type:** thin how-to.
- **Issues:** typo "Enviorments"; **never shows how to use the key** (no header name, no sample request); no testnet base URL/dashboard clarity; dead end (no next step); bare unlinked URL `https://layerswap.io/dashboard`; ambiguous whether keys are per-app or per-org.
- **Verdict:** keep with edits — add "use the key" half + next step.

## 4. `fees.mdx`
- **Frontmatter:** "Fees" / fee structure + API retrieval.
- **Audience:** developer. **Type:** conceptual + reference.
- **Concepts:** Layerswap fee / bridge expenses / market impact; sweeping fees; refuel; slippage; `/v2/quote`, `/v2/detailed_quote`.
- **Issues:** curl example has **no auth header** — unknown if quote requires key; "market impact" has no visible API counterpart (`blockchain_fee`+`service_fee` only); vague "completes in seconds"; response envelope `{"quote": ...}` **conflicts with lifi-integration.mdx's** `{"data": {"quote": ...}}`; end-user UI guidance ("hover over the fee indicator") inside a dev doc; example rate will drift.
- **Links:** `/api-reference/swaps/get-quote`, `get-detailed-quote` (generated slugs, verify at build).
- **Verdict:** keep with edits.

## 5. `networks-tokens.mdx`
- **Frontmatter:** "Supported Networks &amp; Tokens".
- **Type:** interactive reference (React embed → `GET /api/v2/networks`); no prose at all.
- **Issues:** **`snippets/networksTokens.jsx` hardcodes `DEFAULT_API_KEY` in client-visible source** — exposure/rotation question; no explanation that a listed network ≠ a live route; no programmatic-access pointers; empty for text/LLM consumers; dead end.
- **Verdict:** keep with edits (prose fallback + API pointers + key question).

## 6. `security.mdx`
- **Frontmatter:** 'Security' / empty description.
- **Type:** 2-paragraph marketing/conceptual.
- **Issues:** no actual security model (custody, in-flight funds, refund guarantees, bug bounty); "processed billions of dollars… showcasing its robustness and safety" — volume ≠ safety; "trustless" (TRAIN) undefined and describes an "upcoming" product — stale-risk as of Aug 2026; doesn't link `/api-reference/depository` where the audited contract lives; empty SEO description.
- **Links:** hexens.io, hexens.io/audit-reports/layerswap-depository-mar-2026, docs.train.tech.
- **Verdict:** rewrite (or merge until a real security model section exists).

## 7. `brand-assets.mdx`
- **Type:** reference; self-contained; clear task.
- **Issues:** brand pink `#FF3272` vs docs-theme primary `#E05B8A` — canonical color unclear; inconsistent asset coverage per section (PNG-only vs PNG+SVG); ~24 `/images/brand/*` paths unverified; audience mismatch with "About Layerswap" group.
- **Verdict:** keep with edits.

## 8. `DepositAddress.mdx` (visible standalone tab)
- **Frontmatter:** `mode: "custom"` only — **no title, no description**.
- **Type:** interactive demo (live deposit widget snippet → production API, hardcoded demo addresses); zero prose.
- **Issues:** unlabeled full-page app inside docs; unclear whether real mainnet funds move; invisible to text/LLM consumers; naming collision: `DepositAddress.mdx` vs `Widget/DepositWidget.mdx` vs `Widget/EasyDeposit.mdx` — three "deposit" artifacts, relationships undefined.
- **Verdict:** relocate/rework (frame as explicit demo with prose, or fold into Playground concept).

## 9. `Playground.mdx`
- **Frontmatter:** `mode: "custom"` only — no title/description. Iframe → playground.layerswap.io.
- **Issues:** no prose bridge ("configure → copy config into `<LayerswapWidget config>`"); no fallback/open-in-new-tab link; silently breaks if playground is down; empty for text consumers. (Answers U-04 partially: playground IS deployed at playground.layerswap.io — whether it reflects widget-react props still to verify.)
- **Verdict:** keep with edits.

## 10. `lifi-integration.mdx` (hidden tab, noIndex)
- **Frontmatter:** 'Layerswap API — Integration Guide for LI.FI'.
- **Type:** partner memo — how-to + reference hybrid. Covers route discovery, quote, swap creation, deposit actions (EVM depository / **Bitcoin OP_RETURN** / **Solana memo**), status polling, LI.FI field mapping.
- **Issues:** **no authentication mentioned anywhere**; conversational commitments baked in ("we can add fee/duration ranges if needed"); "quotes are valid for a reasonable window" — undefined where precision matters most; duplicates depository.mdx (deposit actions) and fees.mdx (quote) with **conflicting response envelope**; `avg_completion_time` mislabeled "ISO 8601" (it's a .NET TimeSpan, `00:02:00`); Solana Memo program id shown is **Memo v1** (`Memo1Uhk…`), not SPL Memo v2 (`MemoSq4g…`) — verify against layerswapapp on GitHub; only place Bitcoin/Solana deposit mechanics are documented — general content trapped in a hidden partner page.
- **Verdict:** split — promote general deposit-action mechanics to public API docs; keep/retire LI.FI-specific remainder.

## 11. `changelog/api.mdx` (hidden tab)
- **Issues:** single entry dated **2024-11-27**, and it's about the docs page itself, not the API; real API changes since (gasless, depository, refunds) have no entries; abandoned-changelog trust risk.
- **Verdict:** remove or commit to maintaining.

## Cross-page observations (Batch A)
- **Duplication:** Integrate vs IntegrationOverview; lifi §3 vs depository.mdx; lifi quote vs fees.mdx (conflicting envelopes); brand assets nav+footer.
- **Terminology:** swap/bridge/transfer/deposit interchangeable, no glossary; "swap" means both the API object and the on-chain exchange; "Partner Dashboard" vs `api-keys` slug; fee taxonomy prose vs API fields mismatch; two pinks; two similarly-named config pages (`Widget/Configuration` + `UI/Configurations`).
- **New uncertainty candidates:** does `/v2/quote` (and networks/sources/destinations) require an API key?; is the hardcoded snippet API key intentionally public?; Memo v1 vs v2 program id; current custody/trust model pre-TRAIN; TRAIN still "upcoming"?; actual quote validity window; real generated OpenAPI slugs; does DepositAddress demo move real funds?; Typeform placeholder intentional?; which quote envelope is correct?; canonical brand pink; brand asset files exist?
