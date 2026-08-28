# Release Env Fingerprint — adversarial review handoff

## Outcome

Work order `release-env-fingerprint-review-1` is complete at source commit
`6ac5933fe60d3bb0862a15f477bf73a57c51045a`. The verdict is **FAIL**. The full
first-read, copy, demo, claims, structure, accessibility, and routing evidence
is in `.factory/review-1.md`.

No product code was changed. This handoff and the new review are the only
tracked changes.

## Blocking findings

1. The first screen does not name the intended user or provide one clear
   “Try it with sample data” action.
2. The CLI has no `demo` command, bundled `examples/`, isolated demo flow,
   persistent banner, reset, or start-for-real path.
3. The required `.factory/claims.json` is absent; all public claims are
   unlisted and have no one-claim/one-test mapping.
4. `/demo`, `/privacy`, `/terms`, and unknown paths all return the home page
   with HTTP 200 and the home title; there is no real routing or designed 404.

## Verification performed

- Opened the live site cold in fresh Chromium contexts at 390 × 844 and
  1440 × 900 and recorded the unscrolled copy and controls.
- Exercised the seeded browser comparison, clear/reload behavior, browser
  storage, same-origin request boundary, service worker, and offline reload.
- Ran `refp demo` and `refp --demo` in an empty temporary directory; both were
  rejected with exit 2 and created no files.
- Cloned the reviewed commit to `/tmp/refp-review-clone-4DmMH0/repo`, then ran
  `npm ci && npm test`; all Rust, site, and browser tests passed.
- Ran `/opt/fleet/lib/verify-url.sh` against the live URL; it passed and found
  no console errors.
- Ran `npx @axe-core/cli` with matching Chrome/ChromeDriver 145; it reported
  zero violations.
- Crawled all landing links. Hash targets exist and the external source link
  returned 200, but required policy/demo routes do not exist.
- Probed root, required routes, and a random missing path; all returned the
  home page with status 200.

## Positive evidence retained

The core seeded comparison works, offline reload works after the first visit,
no demo input reached cross-origin requests or persistent user-data stores,
the clean-clone suite passes, and the risograph proof-sheet identity is
distinct. These passes do not resolve the four release blockers.

## Next steps

Implement the four blocking fixes in review order, then add and run every
tagged claim test from a fresh clone. Re-run the same cold mobile/desktop,
CLI-demo, route, link, offline/privacy, and accessibility checks before seeking
a new verdict.
