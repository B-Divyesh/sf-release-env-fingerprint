# Release Env Fingerprint — polish round 2 handoff

## Outcome

Perfection-loop round 2 is complete. All findings in `.factory/review-2.md`
and the cumulative `.factory/review-1.md` / `.factory/polish-1.md` audit are
closed. Product repair commit `c22bc3640fb2e39399f18732e812e8ed712824e0`
is pushed to `origin/main` and deployed at
<https://release-env-fingerprint.sociobot.in>.

The repair puts the computed five-row result in the first demo viewport, adds
a real CLI-generated terminal recording, completes 404 metadata/shared chrome,
standardizes release-setting copy, fixes the last vague action, keeps all
first-screen facts visible, and ships a tested GitHub Actions path. The
existing risograph proof-sheet identity and static-site/CLI artifact classes
are unchanged.

## Verification

Clean clone: `/tmp/refp-polish2-clean-hU77TO/repo` at `c22bc36`.

    npm ci
    npm test
    npm run lint
    npm run build
    npm audit --audit-level=high
    cargo package --manifest-path cli/Cargo.toml

All passed. `npm test` ran all 18 exact claim commands plus typecheck, 8 Rust
unit tests, 4 CLI integration tests, recording freshness, static metadata and
budget checks, browser routes/history/focus, mobile layout, privacy, offline,
reduced motion, console checks, and axe integration. The package contains 11
files and is 20.1 KiB compressed. The build reports 16,997 B JavaScript,
19,049 B CSS, and a 178,612 B hero image.

Standalone live axe found zero violations on home, demo, privacy, terms, and
404. The live factory URL verifier returned 200 with no browser errors, one
`h1`, `lang=en`, one `main`, complete image text, and labeled buttons. Live
Lighthouse scored 99 performance, 100 accessibility, 100 best practices, and
100 SEO; FCP 0.8 s, LCP 1.7 s, TBT 80 ms, CLS 0.

Cold live Playwright checks confirmed:

- Root, demo, privacy, and terms return 200 with distinct titles and complete
  social metadata; an unknown URL returns the shared-chrome page with 404.
- Final first-screen facts land at 801.94 px on 390×844 and 891.84 px on
  1440×900.
- Final computed demo rows land at 817.45 px and 846.5 px respectively.
- Five initial rows, real edited results, reset, discard, focus, and offline
  reload all work.
- Cookies, localStorage, sessionStorage, and IndexedDB remain empty; comparison
  makes no request and every observed load request is same-origin.
- The deployed terminal recording byte-matches its CLI-generated source.
- Valid routes produced zero console errors and no tested viewport overflowed.

Evidence and the full finding map are in `.factory/polish-2.md` and
`.factory/evidence/polish-2/`.

## Deploy and next steps

The work-order configuration was used:

    npm ci && npm run build:site
    /opt/fleet/lib/deploy-static.sh release-env-fingerprint /work/repo/dist/site

Azure Static Web Apps deployment `2c5626da-6b68-4cd2-9a17-4d661147cb52`
completed successfully. The custom domain returned the new asset hashes during
the cold check.

Known gaps: none. Registry publication and release tagging remain factory
release operations, not product defects.
