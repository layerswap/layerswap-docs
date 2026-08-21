# Homepage Content Brief (Phase 10)

> Requirements for the docs landing page ("What is Layerswap" in the Get Started tab). Copy is written LAST (Phase 15, after everything it must summarize exists). This brief is the approval artifact.

## Purpose
Orient a first-time visitor in under a minute: what Layerswap does, whether their route/use case is covered, and which integration path to take — then hand them to the chooser or a quickstart.

## Primary audience
Developer evaluating (profile D) shading into developers ready to integrate (A–C). Not end users (they get routed to the app/help).

## Visitor questions the page must answer, in order
1. What does this let me build? (move assets between chains and exchanges, inside my product or via Layerswap's UI)
2. Does it cover my networks/tokens? (live data — 66 networks today; link the interactive list; never a hardcoded count in prose)
3. How do I integrate, and how much work is each option? (chooser: Widget / Hosted Page / API — one line + effort signal each)
4. What does it cost and can I trust it? (fees concept link; Depository audit; widget signing model — concrete facts only)
5. Where do I start right now? (primary action)

## Mandatory information
- One-sentence concrete definition (uses agreed terminology from `08-terminology.md`: swap, source/destination, funding methods).
- The three integration surfaces with the recommended default visible (Widget react/js).
- Environment note: mainnet/testnet by API key.
- Live route data pointer (interactive networks embed or /networks reference).

## Primary action
**"Choose your integration"** (the single chooser page). Secondary: Widget quickstart directly (largest audience), API quickstart, Book a demo (existing CTA), Telegram dev community.

## Proof requirements (Q3.5 policy: concrete or absent, 🚧-marked replacements)
- ✅ Allowed: audited Depository (Hexens link), signed-CDN widget delivery, live network/route counts pulled from data, real fee example from /quote.
- ❌ Banned: "most affordable", "lowest fees", "instant", "blockchains not supported elsewhere", "billions processed", hardcoded "70+"/"90+" counts. Where a claim is wanted anyway → 🚧 marker for Babken.

## Visual requirements
- Integration chooser cards (consistent icon system — replace the inline-SVG one-offs).
- Optionally ONE diagram: the swap flow at a glance (quote → create → fund → track) — shared with Concepts, not homepage-specific (canonical-home rule).
- No decorative partner-logo wall unless product wants it (current one links out and strands visitors) 🚧.

## Sections to avoid
FAQ promises ("quick answers"), TRAIN/roadmap content (frozen per Q3.6), end-user support content, anything method-specific beyond the chooser cards.

## Unresolved before final copy
- 🚧 Claim replacements (Q3.5), partner-logo decision, docs theme color alignment (#E05B8A vs #FF3272 family).
