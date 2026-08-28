# Release Env Fingerprint — polish round 1 handoff

## Outcome

All findings in `.factory/review-1.md` are resolved. The implementation repair
is commit `bfb7fea` on `main` and is deployed at:

<https://release-env-fingerprint.sociobot.in>

The risograph proof-sheet visual system is preserved. The landing screen now
states the job, user, first action, action result, and three tested facts. On a
390 × 844 viewport, all of that appears above the fold.

The browser sample at `/?demo=1` and `/demo` is a dedicated DOM-only sandbox.
It opens with five computed differences, not canned output. It has a persistent
banner, Reset demo, and Start for real. Edits change the result, reset restores
the sample, and leaving discards edits. `refp demo` uses the real capture,
signature verification, and comparison code in a new OS temporary directory.

The site now builds real Demo, Privacy, and Terms documents with route-specific
metadata. Unknown paths return the designed proof-sheet 404 with HTTP 404.
Route changes focus and announce the h1; Back restores focus and scroll.

## Claims

`.factory/claims.json` contains 17 unique promises. Each has exactly one
`@claim:<id>` branch in `site/claims.mjs`. `npm test` runs all claim tests.
Coverage includes:

- all four difference classes and exit 2;
- signature tamper rejection and raw-value absence;
- exact/prefix/host rules and project-keyed approved-value hashes;
- real browser sample output, reset, discard, privacy, and offline reload;
- real CLI demo isolation and one-document JSON output;
- direct command execution without shell expansion;
- fresh-root CLI installation and both release build artifacts.

## Verification evidence

Working tree and clean clone both passed:

    npm ci
    npm test
    npm run lint
    npm run build
    cargo package --manifest-path cli/Cargo.toml

Clean clone: `/tmp/refp-polish-clean-zoxDCf/repo` at `bfb7fea`.

Measured results:

- Rust: 8 unit tests and 4 CLI integration tests passed.
- Claims: all 17 tagged commands passed from the clean clone.
- Browser: first screen, computed demo, routes/status, focus/history, 390/640/
  1440 px bounds, privacy, offline, reduced motion, console, and axe passed.
- Built assets: 17,157 B JS; 17,634 B CSS; 178,612 B hero image.
- Standalone axe 4.10.3: 0 violations on live `/`, `/?demo=1`, `/privacy`,
  and `/terms`.
- Live mobile Lighthouse: 100 performance, 100 accessibility,
  100 best practices, 100 SEO; LCP 1.7 s, CLS 0, TBT 60 ms.
- `verify-url.sh` on the live root: HTTP 200, zero console errors, title,
  `lang=en`, one h1, main landmark, alt text, and labeled buttons passed.
- Live cold Playwright: valid routes returned 200, unknown returned 404,
  demo 5 → edited 0 → reset 5, sentinel discarded, empty browser storage,
  same-origin requests only, offline reload passed, valid-route console clean.

Evidence files are in `.factory/evidence/polish-1/`. The per-finding map is
`.factory/polish-1.md`.

## Deployment

The work-order build output is `dist/site`. It was uploaded to the existing
Azure Static Web App production environment after `bfb7fea` was pushed. No
DNS, billing, secrets, or package registry settings were changed. The custom
domain and managed TLS were re-used.

## Known gaps and next steps

None in the acceptance scope. Do not publish the Rust package from this worker;
the factory owns registry credentials.
