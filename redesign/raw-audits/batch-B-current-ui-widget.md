# Raw audit — Batch B: Current UI/Widget docs (25 in-nav pages + 5 orphans)

> Agent-produced Phase 1 audit, unedited in substance. This batch covers the in-flight widget-react restructure surface.

## Getting Started / decision pages

### `integration/UI/IntegrationOverview.mdx` — MODIFIED (rewritten for new model)
- Now a 6-row decision table (Widget React / VanillaJS / Deposit / iFrame / Hosted / API) + CDN/signed-manifest highlights.
- Issues: iFrame "named themes" claim — accepted preset names documented nowhere; "90+ sources" unverified number; raw inline SVG card icon; Get Started cards omit Hosted Page despite the table.
- Verdict: keep with edits.

### `integration/UI/Configurations.mdx` — MODIFIED (rewrite → "Initial Values")
- Retitled "Initial Values"; reorganized (Routing/Locking/Hiding/Flow/Attribution); `destAddress`→`destination_address`; `amount` number→string; added `swapId`, `sameAccountNetwork`, `hideDepositMethod`, `theme`, legacy-aliases table.
- Issues: slug still `Configurations` vs sibling `Widget/Configuration` — one-letter nav collision; `theme` preset values undocumented; `depositMethod` accepted values undocumented; links to orphaned EasyDeposit; per-surface param applicability asserted not evidenced.
- Verdict: keep with edits; fix naming pair.

### `integration/UI/iFrame.mdx` — UNCHANGED (not yet migrated)
- Uses **legacy alias params** (`destAddress`, `asset`) that the new Initial Values page says not to use; example URLs literally broken if copy-pasted (multi-line, leading `&` after `?`); stale "Widget requires installation and configuration" framing; no description; destAddress note duplicated verbatim on HostedPage.
- Verdict: light rewrite.

### `integration/UI/HostedPage.mdx` — UNCHANGED
- Same legacy params + broken URL formatting + duplicated note; mixes old (`asset`) and new (`toAsset`) names on one page; Swift deep-link example unverified.
- Verdict: keep with edits.

## New-model widget pages

### `Widget/Quickstart.mdx` — MODIFIED (full rewrite)
- Old interactive QuickstartEmbed page → install/render/gotchas/versioning for `@layerswap/widget-react`. Flagship page.
- Issues: wagmi "types-only peer", React 18/19, versioning semantics (`1.x → /v1/manifest.json`, no public build pinning) — all need code confirmation; `snippets/quickstart.jsx` now abandoned on disk; one-widget-per-page warning has 3 differing phrasings across pages.
- Verdict: keep; verify package facts. **Blocked by npm publish (packages 404).**

### `Widget/HowItWorks.mdx` — NEW (untracked)
- Manifest signing, CSP, failure modes. Strongest new page.
- Issues: **CDN origin is `layerswap-widget-cdn.layerswapcdn.workers.dev`** — customers would hard-code a workers.dev origin into CSPs; needs explicit sign-off (supersedes the plan's "test blob" note — evidently moved once already). All crypto specifics (ECDSA P-256, SHA-384 SRI, 30-day validity, +5-min skew, kill switch, ManifestError reasons) must be verified against loader source. CSP names internal endpoints (`/app/api/flags`, Polymarket relayer proxy) — confirm stability.
- Verdict: keep; gate publishing on code verification of every claim.

### `Widget/Configuration.mdx` — NEW (untracked)
- Full props reference. Issues: name collision with `Configurations`; "typed as `unknown`" and `apiKey` optional-in-type claims to verify; deprecation warning says `imtblPassport` while Wallets.mdx replacement field is `immutablePassport` — **id/field inconsistency to resolve in code**; `apiUri`/`settings` "Advanced" dead ends.
- Verdict: keep; resolve naming.

### `Widget/Wallets.mdx` — NEW (untracked)
- include/exclude filtering + walletDefaults credentials. Issues: `imtblPassport` (provider id) vs `immutablePassport` (defaults key) — confirm; "TON/Passport only appear when supplied" behavioral claims to verify; Passport config shape undocumented; cloud.walletconnect.com dated (Reown rebrand).
- Verdict: keep.

### `Widget/WagmiConfig.mdx` — NEW (untracked)
- Issues: "appends every Layerswap EVM chain, your transports win" — verify; EIP-6963 duplicate-connector gotcha (`rdns`) — confirm; example uses undefined `queryClient`; legacy PartialIntegration page has no forward pointer here.
- Verdict: keep; fix `queryClient`.

### `Widget/DepositWidget.mdx` — MODIFIED (old→new rewrite)
- Issues: `methods` accepts `"polymarket"` — never explained anywhere in the docs (ties to CSP polymarket line); screenshots may show old UI; `defaultAmountUsd` default `1` to confirm.
- Verdict: keep; document/justify polymarket.

### `Widget/VanillaJS.mdx` — NEW (untracked)
- `@layerswap/widget-js` mount/update/destroy. Issues: no-UMD claim, remote-bundles-own-React, `never`-typed props — verify; only a Vue example though title names Angular/Svelte.
- Verdict: keep.

### `Widget/Compatability.mdx` — MODIFIED (gutted 200-line polyfill matrix → short "no config needed")
- Issues: **misspelled slug `Compatability` would be baked into a fresh URL**; "React 17 rejected at runtime" — verify explicit check; overlaps Quickstart bullets + HowItWorks troubleshooting ("remount to recover" near-verbatim ×2).
- Verdict: merge candidate (Quickstart "Requirements" + HowItWorks troubleshooting); if kept, fix slug + redirect.

## Customization (all MODIFIED — samples migrated to new model)

- **CustomizationIntroduction** — thin hub; same link cards duplicated twice on-page; "Remove 'Powered by Layerswap' branding" — confirm contractually allowed for all partners. Keep with edits.
- **Colors** — heavy field overlap with ThemeConfiguration (the `logo` addition had to be made on BOTH pages this change — drift proof); long Tailwind Shades tutorial; `StatusColor` PascalCase oddity unexplained. Keep; de-duplicate field ownership.
- **ThemeConfiguration** — added `logo`/`enablePortal`/`enableWideVersion`, deep-merge note, `--ls-colors-*` section. Issues: **links to orphaned TabOptions**; border-radius px table + CSS var names (`sm/md/lg/xl/full` vs prop enum `small/medium/large/extraLarge`) don't map 1:1 — verify. Keep; verify claims.
- **ThemeExamples** — static SVG mockups may not match current UI; "Minimalist Transparent Theme" byte-identical to ImmutablePartnerDocs' `immutableTheme`; integration example imports a file readers don't have. Keep with edits.

## Event Callbacks (Intro + 8 pages; 2 NEW untracked: onSwapStatusChange, onMenuNavigationChange)

- **EventsIntroduction** — MODIFIED; 8-event index + notes (referential stability, try/catch wrapping, `unknown` typing, two error channels — verify). Keep.
- **onFormChange** — payload claims all fields required strings — implausible for a partial form; fire-frequency undocumented; stray `theme={"system"}` attr on code fences (export artifact?) across siblings. Keep with edits.
- **onSwapCreate / onSwapComplete** — **identical ~190-line type dump duplicated on both pages** — extract to snippet or a "Swap object" reference page; rough formatting; verify vs API models. onSwapComplete: behavior gaps (fires on reopen of completed swap? refunds?). Keep; dedupe.
- **onSwapStatusChange** (new) — `path?: string` unexplained; only event page cross-linking swap-lifecycle (good). Keep; explain `path`.
- **onSwapModalStateChange** — never defines "the swap modal". Keep + one sentence.
- **onBackClick** — which back button? intended use? Thin. Keep with edits.
- **onMenuNavigationChange** (new) — possible `path` values unenumerated. Keep; list paths.
- **onError** — MODIFIED, substantive: full ~18-type discriminated union table + switch example. Highly code-specific, will drift; `AlertUI` odd member of an error union; some field lists end "…". Keep; verify vs code; consider generating.

## Orphaned pages (confirmed absent from docs.json)

- **`Widget/Widget.mdx`** — 3-line frontmatter-only stub, title "Wallet management" doesn't match filename. **Remove** (+ redirect if URL ranked).
- **`Widget/EasyDeposit.mdx`** — MODIFIED (migrated to new model!) yet left out of nav while Configurations links to it. Duplicates Configurations params + TabOptions recipe. Claim to verify: "`destination_address` is NOT honored in Easy Deposit flow". **Concept collision:** "Easy Deposit" (tab) vs "Deposit Widget" (component) — neither page disambiguates. Relocate into nav or merge into a flows page.
- **`Widget/TabOptions.mdx`** — MODIFIED (migrated) yet orphaned; ~70% duplication; unique content = "Deposit from CEX" flow explanation (intermediary network, manual withdrawal) — **exists nowhere else, would be lost on blind delete**. Merge into a flows page; update inbound links (ThemeConfiguration, EasyDeposit).
- **`Widget/ImmutablePartnerDocs.mdx`** — MODIFIED (one link repoint only). **Entirely old-model instructions** under a description saying "new version of Layerswap Widget" — actively misleading if URL shared with Immutable. Duplicates ThemeExamples theme + Colors/ThemeConfiguration fields. Relocate to Legacy or rewrite for widget-react if the partnership is active — team question: is this URL live in partner communications?
- **`Widget/StarknetPartnerDocs.mdx`** — MODIFIED (one link repoint). Near-total duplicate of in-nav `Starknet/StarknetWithDynamics` (which is itself a stale duplicate of CustomWalletManagement — three copies of the same Dynamic example in the repo!). 400+ lines of hook code repeated twice on the page; invalid `{DYNAMIC_ENVIRONMENT_ID}` placeholders; dev-monorepo-pinned links. Remove after diffing (+ redirect).

## Cross-page observations (Batch B)

**Duplication map:** onSwapCreate⇄onSwapComplete type dump; TabOptions⇄Configurations⇄ThemeConfiguration⇄EasyDeposit (tab/locking facts across 4 pages); Colors⇄ThemeConfiguration (field ownership); ThemeExamples⇄ImmutablePartnerDocs (theme values); StarknetPartnerDocs⇄StarknetWithDynamics⇄CustomWalletManagement (Dynamic example ×3); iFrame⇄HostedPage (~60% same); 3 phrasings of one-widget-per-page; "remount to recover" ×2.

**Terminology:** `Configuration` vs `Configurations` slugs; `imtblPassport` vs `immutablePassport`; legacy `destAddress`/`asset` still live on iFrame/HostedPage; **"deposit" doing five jobs** (Easy Deposit tab / Deposit Widget component / defaultTab:'deposit' / depositMethod / hideDepositMethod) with no disambiguation; `Compatability` misspelling; iFrame/IFrame casing; **"version" = network set on Configuration.mdx but package/protocol version on Quickstart** — same word, two meanings, both core pages.

**Navigation:** 5 orphans, 2 of which receive links from in-nav pages (readers land on nav-less pages); abandoned `snippets/quickstart.jsx`; stray `widget-react-docs-plan copy.md` at repo root must not ship; Overview's Get Started cards don't match its own decision table.

## Uncertainty candidates (Batch B)
1. Production CDN origin: workers.dev URL in CSP guidance — sign-off? custom domain imminent? [updates U-02]
2. npm publish status of widget-react/widget-js; wagmi types-only optional peer; ESM-only. [= U-01]
3. All HowItWorks security specifics vs loader source.
4. `immutablePassport` vs `imtblPassport`; TON/Passport conditional appearance.
5. wagmiConfig adoption semantics.
6. initialValues: amount string|number; alias table; hosted-page named theme presets; depositMethod values; destination_address ignored in Easy Deposit.
7. Deposit Widget: `polymarket` method public?; defaultAmountUsd default.
8. Event payloads: onFormChange optionality; SwapStatusEvent.path; menu path values; onError union vs source.
9. Border-radius px + CSS var names.
10. Partner URLs (Immutable/Starknet) still shared externally? Which Dynamic-example copy is canonical?
11. tailwindshades.app vs .com; cloud.walletconnect.com (Reown).
