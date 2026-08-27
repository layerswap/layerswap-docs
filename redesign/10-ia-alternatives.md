# Information Architecture Alternatives (Phase 9 / Step 10)

> Three candidate structures, compared. **Recommendation at the end — requires team selection before the final sitemap (Phase 14 gate).** Constraint carried from Q1.3: self-bundled widget is "Advanced", not legacy. Mintlify tabs+groups are the mechanism.

---

## Model A — By integration method (closest to today)

```
Tabs: Overview | Widget | Hosted Page | API | Advanced (self-bundled)
```
Overview: intro, chooser, api-keys, fees, security, networks. Widget: quickstart, how-it-works, config, wallets, theming, events, deposit widget, widget-js, troubleshooting. API: quickstart, lifecycle, funding methods, gasless/depository, webhooks, reference. Hosted: setup+params (+iframe).

- **Strengths:** matches how users self-identify once they've chosen; minimal migration from current nav; method-specific quickstarts stay shallow.
- **Weaknesses:** shared concepts (lifecycle, routes, fees, statuses) have no home → duplicated into each tab or orphaned in Overview; the un-decided visitor must pick a tab before understanding anything; production/troubleshooting content fragments per method.
- **Sample path (wallet dev):** Overview→chooser→Widget tab→Deposit Widget→…but status-handling concepts live in the API tab. Cross-tab jumping.

## Model B — By user task

```
Tabs: Start | Add deposits | Embed swaps | Build with the API | Operate
```
Task-first guides pulling method content inline.

- **Strengths:** mirrors the journeys (J1–J6); best first-visit experience for the three main audiences.
- **Weaknesses:** heavy duplication of technical substance (widget config appears under both "Add deposits" and "Embed swaps"); reference material has no natural home; scales poorly as products are added; hardest migration (every URL moves).
- **Sample path (API integrator):** Build with the API → linear. But a dApp dev wanting theming digs through a task guide to find a reference table.

## Model C — Hybrid: shared foundation + method sections + task guides (RECOMMENDED)

```
Tab: Get Started      → What is Layerswap · Choose your integration (ONE chooser) ·
                        API keys & environments · Supported networks & routes
Tab: Concepts         → Swap lifecycle & statuses · Routes, quotes & limits ·
                        Funding methods · Fees · Security · Glossary
Tab: Widget           → Quickstart (react) · How it works & CSP · Configuration ·
                        Initial values · Wallets & wagmi · Theming · Events ·
                        Deposit Widget · JavaScript package · Troubleshooting
                        └ Advanced: self-bundled widget (+migration, providers, polyfills)
Tab: Hosted Page      → Setup & URL params (+iframe section) · Completion tracking 🚧
Tab: API              → Quickstart · Funding a swap (per method: transfer/depository/gasless) ·
                        Tracking & webhooks · Errors & troubleshooting · Recipes ·
                        Endpoints (OpenAPI)
Tab: Resources        → Production checklist · Support 🚧 · Changelog · Brand assets
Guides (cross-cutting, grouped inside the method tabs or a Guides group in Get Started):
  wallet deposits · dApp embed · track a transfer · CEX→chain
```

- **Strengths:** concepts written once, linked everywhere (fixes the duplication that produced today's drift bugs); un-decided visitors get Start+Concepts; decided visitors deep-link into their method tab; reference lives beside its method; production content has a home; smallest URL churn after Model A.
- **Weaknesses:** requires disciplined cross-linking; "where do guides live" needs a rule (proposal: guides live in the tab of their primary surface, cross-linked from Start).
- **Sample paths:**
  - Wallet dev: Start→chooser→Widget→Deposit Widget→(link) Concepts/lifecycle→Resources/checklist. One tab switch.
  - API integrator: Start→API quickstart→funding→tracking→endpoints. Linear.
  - Evaluator: Start→What is→networks→chooser→fees/security. No method commitment needed.

## Evaluation matrix

| Criterion | A | B | C |
|---|---|---|---|
| First-time discoverability | ○ | ● | ● |
| Decisions demanded of visitor | many | few | few |
| Multi-audience support | ○ | ● | ● |
| Duplication risk | high | highest | **low** |
| Maintenance | ○ | ✗ | ● |
| API-reference fit | ● | ✗ | ● |
| Method distinctions clarity | ● | ○ | ● |
| Migration cost from current URLs | lowest | highest | moderate |
| Scales to new products (TRAIN, Deposit Address mode) | ○ | ○ | ● |

## ✅ DECIDED — Babken, 2026-08-06

**Model C approved** with all sub-decisions:
1. Shared Get Started + Concepts for orientation/common knowledge; implementation organized by method (Widget / Hosted Page / API).
2. iFrame folded into Hosted Page — presented as **"link, redirect or embed"** with a dedicated iframe subsection for embedding-specific setup/limitations.
3. Nav label: **"Self-bundled Widget — Advanced"** (never "Legacy" while supported).
4. Task guides live in their primary method section, cross-linked from the Get Started chooser and related pages — one canonical home per guide, no separate Guides tree.
5. Governing rule: **every topic has ONE canonical home** to prevent duplication and drift.

The Phase 9 completion gate is satisfied; final sitemap (Phase 14) may proceed after prototypes.

## Original recommendation (for the record)

**Model C**, with these explicit choices:
1. One chooser page (kills the Integrate/IntegrationOverview duplicate); it compares ALL surfaces incl. API and links each quickstart.
2. Concepts tab owns lifecycle/routes/fees/funding-methods — method tabs never restate them, only link.
3. Self-bundled widget = "Advanced" group inside the Widget tab (per Q1.3), with the migration guide at its top.
4. Playground stays inside the Widget tab; DepositAddress tab hidden pending Q3.4; LI.FI stays hidden (Q3.3); changelog decision deferred to Resources.
5. Redirect plan required for: Configurations→initial-values, Compatability→compatibility, orphan removals, any tab restructuring — drafted in Phase 14.

**Open for team:** approve Model C (or request changes); confirm "Advanced" label; confirm iframe folding into Hosted Page; confirm guides placement rule.
