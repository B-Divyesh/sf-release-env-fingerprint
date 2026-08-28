# Release Env Fingerprint repair handoff

## Outcome

Repair round 1 resolves B1–B4 from review-1 while keeping the risograph proof
sheet visual system. The landing screen now names engineers shipping one
service across environments, uses Try it with sample data as its primary
action, and says that the click shows five differences.

Repair implementation commit: 0df472d85e270f2af21273c57186db6e3446999d.
Published-package sample repair: ef3761ef6fa904513227799b6cde05b9e935ead2.

The browser sandbox is available at /?demo=1 and /demo. It immediately renders
the sample result, has the persistent Demo — sample data, nothing is saved
banner, Reset demo, and Start for real. It uses no browser storage. The CLI now
ships examples and implements refp demo with a new temporary workspace and the
real capture/compare flow.

The static site has browser-routed /demo, /privacy, /terms, and designed 404
experiences; per-route title, description, canonical, focus/announcement,
legal links, sitemap entries, social card, apple icon, and platform 404
response override are present.

## Verification

Run in this repair workspace:

    npm ci
    npm test
    npm run lint
    npm run build
    cargo package --manifest-path cli/Cargo.toml --allow-dirty

Results:

- npm test passed: TypeScript, 6 Rust tests, Vite/static budgets, browser
  routes/demo/mobile/privacy/offline/keyboard/console checks, and Playwright
  axe serious/critical check.
- Initial assets: JavaScript 14,273 B, CSS 15,986 B, hero 178,612 B.
- All ten registered claim commands passed:
  sample-differences, signed-fingerprints, no-raw-values,
  browser-demo-private, offline-reload, mit-license, cli-demo-isolated,
  exit-2-difference, policy-rules, and approved-value-hashes.
- npm run lint passed with rustfmt and clippy warnings denied.
- npm run build completed with target/release/refp and dist/site.
- cargo package completed with allow-dirty for the release-ready package check.
- A fresh shallow clone of pushed main ran npm ci and npm test successfully.
- verify-url.sh against the local preview returned HTTP 200 with no console
  errors, title, lang, one h1, main landmark, and no missing image alt.
- Playwright axe integration found no serious or critical violations. The
  standalone axe CLI was also invoked but its Selenium runner could not locate
  a Chrome binary in this container; this is an environment limitation, not a
  product failure.

## Demo and claims

See .factory/demo.md for sandbox behavior and .factory/claims.json for the
one-test-per-claim commands. The browser privacy test checks same-origin
requests plus cookies, localStorage, sessionStorage, and IndexedDB from a
fresh context. The offline claim starts fresh, installs the service worker,
then reloads offline and observes the completed sample comparison.

## Release and deployment

The static deployment artifact is dist/site. Push the repair commit on main;
the work order static deployment consumes that artifact configuration. No
secrets, DNS, billing, package publishing, or other infrastructure was
changed.

## Known gaps

None in the product acceptance scope. The CLI demo leaves its temporary sample
directory in place intentionally and prints its exact path so the visitor can
inspect or remove it.
