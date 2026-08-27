# ⛔ DO NOT DEPLOY — redirect verification required

> **Delete this file only after every box below is checked.** Its presence in the PR
> is the signal that this branch is not ready to merge/deploy.

This branch (`docs-redesign`) restructures the entire docs site: **57 old pages are
deleted** (`introduction`, `fees`, `api-keys`, everything under `integration/UI/**`,
`api-reference/**`, etc.) and replaced with the new `get-started/`, `concepts/`,
`api/`, `widget/`, `hosted-page/`, `resources/` structure. Every old URL that is
live in production today will **404** unless the `redirects` array in `docs.json`
covers it.

## Status as of 2026-08-18

- ✅ All 57 deleted pages have a redirect entry in `docs.json` (74 redirects total).
- ✅ All redirect destinations resolve to files that exist in the new structure.

## Pre-deploy checklist

- [ ] Page structure is final — **re-run the checks below after any further page
      moves/renames**, since new-structure paths may still change during review.
- [ ] Every deleted page has a redirect (re-verify against the final diff to `main`):
  ```sh
  git diff main...HEAD --name-status --diff-filter=D | awk '{print $2}' \
    | grep '\.mdx$' | sed 's/\.mdx$//' | python3 -c "
  import json, sys
  srcs = {r['source'].lstrip('/') for r in json.load(open('docs.json'))['redirects']}
  missing = [p.strip() for p in sys.stdin if p.strip() and p.strip() not in srcs]
  print('missing redirects:', len(missing)); print('\n'.join(missing))"
  ```
- [ ] Every redirect destination exists as a page:
  ```sh
  python3 -c "
  import json, os
  bad = [(r['source'], r['destination'])
         for r in json.load(open('docs.json'))['redirects']
         if not os.path.exists(r['destination'].lstrip('/') + '.mdx')]
  print('broken destinations:', len(bad))
  [print(s, '->', t) for s, t in bad]"
  ```
- [ ] `mint broken-links` (or Mintlify CI check) passes — no internal links point at
      old paths.
- [ ] Spot-check the top externally-linked old URLs on the preview deployment
      (e.g. `/introduction`, `/integration/UI/Widget/Quickstart`, `/api-keys`,
      `/fees`) and confirm they redirect instead of 404.
- [ ] Delete this file.
