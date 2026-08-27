# Open review markers

> Canonical register for every visible `🚧 Needs review` topic in the production tree. Multiple callouts may point to one marker because the same unresolved policy affects several journeys. Release classes come from `18-release-blocker-table.md`.

| ID | Topic | Production page(s) | Class | Status / safe wording |
|---|---|---|---|---|
| M1 | Homepage summary claim | — | Resolved | **RESOLVED 2026-08-07** — count-free opening copy. |
| M2 / M19 | Official support channel | `get-started/what-is-layerswap`, `widget/troubleshooting`, `widget/advanced/migrate-to-widget-react`, `resources/support` | SHIP-MARKED (S-7) | Telegram developer community is linked; official escalation URL remains marked. |
| M3 | Hosted Page key and branding requirements | `get-started/choose-your-integration`, `hosted-page/setup`, `resources/partner-dashboard` | SHIP-MARKED (S-8) | All instructed setups are safe; unkeyed/branding policy is not asserted. |
| M4 | Funding-methods concept missing | `concepts/funding-methods` | BLOCK (B-16) | **RESOLVED 2026-08-11** — page created and chooser linked. |
| M5 / M10 | Quote validity and rate guarantee | `api/quickstart`, `concepts/routes-quotes-limits`, `resources/production-checklist` | SHIP-MARKED (S-1) | No expiry is invented; pages advise refreshing before creation. |
| M6 / M11 / M13 | Refund address, over-max, and refund preconditions | `concepts/swap-lifecycle`, `concepts/routes-quotes-limits`, `api/quickstart`, `api/errors`, `resources/production-checklist` | SHIP-MARKED (S-2) | Observable statuses and transactions are documented; policy remains marked. |
| M7 | `reference_id` idempotency | `api/quickstart`, `hosted-page/track-completion`, `resources/production-checklist` | SHIP-MARKED (S-3) | Correlation is documented; deduplication is not claimed. |
| M8 / M14 / M21 | Polling cadence, rate limits, pagination | `api/quickstart`, `api/track-swaps`, `concepts/swap-lifecycle`, `resources/production-checklist` | SHIP-MARKED (S-3) / POST (P-1) | Conservative/backoff guidance only; no fabricated numbers. |
| M9 | Production checklist missing | `resources/production-checklist` | Resolved / SHIP-MARKED policy gaps | **RESOLVED 2026-08-11** — checklist created; Q2.4 gaps remain visible. |
| M12 | Widget 10 statuses vs API 7 | `concepts/swap-lifecycle` | SHIP-MARKED (S-5) | Seven spec statuses are canonical; three Widget-only values are called out. |
| M15 | Package/version publication | `widget/add-deposits-to-your-wallet`, `widget/quickstart`, `widget/how-it-works` | VERIFY@REL (V-1/V-4) | Assumed 2.0.0; release-day package/channel check required. |
| M16 | Deposit method descriptions | `widget/deposit-widget`, `widget/add-deposits-to-your-wallet` | SHIP-MARKED (S-9) | Identifiers are documented; missing Polymarket UX sentence remains marked. |
| M17 | `mountDepositWidget` export | `widget/vanilla-js`, `widget/add-deposits-to-your-wallet` | VERIFY@REL (V-3) | Example is visibly conditional until the released export exists. |
| M18 | Production CDN and CSP | `widget/how-it-works`, `widget/troubleshooting`, `resources/production-checklist` | BLOCK (ENG-1) / VERIFY@REL (V-2) | Docs consistently use `cdn.layerswap.io`; loader and live manifest must match. |
| M20 | Enrich OpenAPI vs maintain prose | generated `api-reference` plus `api/*` guides | POST (P-1) | Generated reference remains untouched; essential behavior lives in prose for this release. |
| M22 | Product terminology validation | `concepts/funding-methods`, `concepts/glossary`, `widget/initial-values` | SHIP-MARKED (S-12) | “Funding method” and “Deposit tab” are applied consistently and visibly marked. |
| M23 | Gasless and Depository specifics | `concepts/funding-methods`, `api/funding/gasless`, `api/funding/depository` | SHIP-MARKED (S-6) | Only spec/source-verified structure is stated. |
| M24 | Webhook contract | `api/webhooks`, `api/quickstart`, `resources/production-checklist` | SHIP-MARKED (S-4) | Svix verification and defensive receiver behavior documented; delivery guarantees marked. |
| M25 | Solana memo program | `api/funding/networks/solana` | Resolved | **RESOLVED 2026-08-24** — PR #32 verified the top-level SPL Memo program and `metadata.sequence_number` behavior against the app and current API. |
| M26 | Hosted Page completion/redirect | `hosted-page/track-completion` | SHIP-MARKED (S-11) | Verified backend correlation options documented; browser redirect contract not claimed. |
| M27 | iframe CSP / `frame-ancestors` | `hosted-page/setup` | SHIP-MARKED (S-15) | Basic embed is shown; production-origin permission must be tested. |
| M28 | Product security scope | `concepts/security` | SHIP-MARKED (S-17) | Audit and loader facts only; custody/recovery claims intentionally omitted. |
| M29 | Per-network funding-method support | `concepts/funding-methods` | SHIP-MARKED | Starknet/TON transfer-only claim added 2026-08-25 on team authority (PR #32); marked pending API/product confirmation. |

Related non-content decision: docs theme `#E05B8A` vs brand `#FF3272` remains S-16 and is not rendered as a page marker.
