# Perfection loop — polish round 1

- Candidate: `dbc258c242cb2fb9800b3829767defe8c0117d1a`
- Review source: `c91be30b5d3dfbc2e610b7ef9137c9ca3749ef68`
- Repair commit deployed: `bfb7fea`
- Live audit: 2026-08-28 11:13 UTC
- Live URL: <https://release-env-fingerprint.sociobot.in>

## Evidence keys

- `BROWSER`: `site/e2e.mjs`, run by `npm test`; covers first screen,
  computed demo results, reset/errors, route status/title/canonical, focus,
  history, mobile bounds, privacy, offline, reduced motion, console, and axe.
- `STATIC`: `site/test.mjs`; covers metadata/assets/budgets, real route files,
  404 configuration, cache versioning, headers, and claim-tag uniqueness.
- `LIVE`: `.factory/evidence/polish-1/live-check.json`; root/demo/privacy/terms
  returned 200, unknown returned 404, computed/reset/discard/offline/privacy/
  focus/mobile checks passed, and valid routes had zero console errors.
- `HOME-M`: `.factory/evidence/polish-1/live-home-mobile.png`.
- `DEMO-M`: `.factory/evidence/polish-1/live-demo-mobile.png`.
- `404-M`: `.factory/evidence/polish-1/live-404-mobile.png`.
- `HOME-D`: `.factory/evidence/polish-1/home-desktop.png`.
- `DEMO-D`: `.factory/evidence/polish-1/demo-desktop.png`.
- `A11Y`: `.factory/evidence/polish-1/axe-live.json`; standalone axe,
  0 violations on `/`, `/?demo=1`, `/privacy`, and `/terms`.
- `LIGHTHOUSE`: `.factory/evidence/polish-1/lighthouse-live.json`; live mobile
  scores 100 performance, 100 accessibility, 100 best practices, 100 SEO;
  LCP 1.7 s, CLS 0, TBT 60 ms.

## Blocking and major findings

| ID | Change made | Evidence |
| --- | --- | --- |
| B1 | Replaced the first screen with a six-word job headline, a 16-word audience sentence, one sample action with its result, and three registered facts. Mobile now shows the sample action instead of Install in the header. | `BROWSER`; `HOME-M`, `HOME-D`; `LIVE` at `/`. |
| B2 | Made `?demo=1` and `/demo` dedicated isolated screens. They open with five computed differences, a sticky banner, Reset demo, and Start for real. `refp demo` uses bundled files in a new OS temp directory and the real signed capture/compare path. | `@claim:sample-differences`, `@claim:browser-demo-private`, `@claim:cli-demo-isolated`; `DEMO-M`, `DEMO-D`; `LIVE` at `/?demo=1`. |
| B3 | Added 17 uniquely tagged claims. `npm test` now runs every claim command, including install/build/browser/CLI sandboxes. | `STATIC`; `npm run test:claims:all`; clean clone `/tmp/refp-polish-clean-zoxDCf/repo` passed. `LIVE` checks public browser promises. |
| B4 | Build now emits real route documents for Demo, Privacy, and Terms; removes catch-all fallback; serves a designed 404 with status 404; updates focus/announcement and Back scroll restoration. | `BROWSER`, `STATIC`; `404-M`; `LIVE` confirms 200/200/200 and unknown 404. |
| M1 | Added canonical, OG URL/title/description/image dimensions/alt, Twitter card, SVG favicon, 180 px Apple icon, and route-specific static metadata. | `STATIC`; `HOME-D`; raw live metadata checks at `/`, `/demo`, `/privacy`, `/terms`. |
| M2 | Footer now uses durable Privacy/Terms routes and shows “Built by Param Factory · version 0.1.0 · build polish-1” on every app route and the static 404. | `BROWSER`; `HOME-D`, `404-M`; `LIVE` route crawl. |
| M3 | Rewrote every flagged heading, action, error, and README sentence in plain language; invalid input is named, marked, described, and focused. | `BROWSER`; `.factory/copy-audit.md`; `HOME-M`, `DEMO-M`; `LIVE` demo interaction. |

## Copy finding map

| ID | Change made | Evidence |
| --- | --- | --- |
| C01 | Headline is “Compare release configuration without exposing secrets.” | `HOME-M`; `LIVE` `/`. |
| C02 | Audience sentence says it finds missing, extra, and changed settings before deployment. | `@claim:detect-config-differences`; `HOME-M`; `LIVE` `/`. |
| C03 | Workflow heading says “Compare configuration without storing secret values.” | `@claim:no-raw-values`; `HOME-D`; `LIVE` `/`. |
| C04 | Workflow now names capture, signature, variable names/types, and comparison. | `@claim:fingerprint-schema`; `HOME-D`; `LIVE` `/`. |
| C05 | Sign step says the fingerprint is signed and stores names/types; policy text says only marked non-secrets are hashed. | `@claim:signed-fingerprints`, `@claim:approved-value-hashes`; `HOME-D`; `LIVE` `/`. |
| C06 | Compare step says “Stop a release when the fingerprints differ.” | `@claim:exit-2-difference`; `HOME-D`; `LIVE` `/`. |
| C07 | Sample heading says it shows five differences and the result is already rendered. | `@claim:sample-differences`; `DEMO-M`; `LIVE` `/?demo=1`. |
| C08 | Replaced “release gates” with the direct comparison and exit behavior. | `@claim:exit-2-difference`; `DEMO-D`; live demo. |
| C09 | Policy heading is “Choose the configuration rules to enforce.” | `HOME-D`; `LIVE` `/`. |
| C10 | Removed subjective shell/script wording; CLI help scopes JSON behavior precisely. | `@claim:json-output`; `HOME-D`; live install section. |
| C11 | Replaced “Make drift fail early” with result-naming release comparison copy. | `@claim:detect-config-differences`; `HOME-D`; `LIVE` `/`. |
| C12 | Error names the list and line, sets `aria-invalid`/`aria-describedby`, announces the error, and focuses the faulty textarea. | `BROWSER`; `DEMO-M`; live demo. |
| C13 | README compound sentence was split into short, claim-tagged statements. | `.factory/copy-audit.md`; `@claim:fingerprint-schema`, `@claim:signed-fingerprints`. Live copy matches. |
| C14 | Removed the unneeded three-code compound claim; retained and tested the sample’s exit 2 behavior. | `@claim:exit-2-difference`; `DEMO-D`; live demo. |
| C15 | README test instructions are short commands; exact suite evidence is in handoff instead of marketing copy. | clean-clone `npm test`; `HOME-D`; live site. |
| C16 | Removed the future prebuilt-binary promise. | stale-copy `rg` check; `HOME-D`; live site has no promise. |
| C17 | Removed internal “repository worker” language. | stale-copy `rg` check; `HOME-D`; live site. |
| C18 | Uses “approved non-secret value” and “project-keyed hash” consistently. | `@claim:approved-value-hashes`; `DEMO-D`; live demo. |
| C19 | README says the command after `--` runs directly without shell expansion. | `@claim:direct-command`; `HOME-D`; live workflow. |

## Unlisted-claim finding map

| ID | Resolution | Evidence |
| --- | --- | --- |
| U01 | Registered the full missing/extra/type/approved-value difference claim. | `@claim:detect-config-differences`; `DEMO-M`; live demo. |
| U02 | Registered signature creation and tamper rejection. | `@claim:signed-fingerprints`; `HOME-D`; live workflow. |
| U03 | Registered and scans sentinel values from files/output. | `@claim:no-raw-values`; `HOME-M`; live privacy page. |
| U04 | Removed ambiguous “No network”; site claim is now precisely no analytics/third-party requests. | `@claim:browser-demo-private`; `DEMO-M`; `LIVE`. |
| U05 | Replaced bare “Keyed hashes” with approved non-secret behavior. | `@claim:approved-value-hashes`; `HOME-D`; live policy section. |
| U06 | Replaced “Signed JSON” with the narrower signed-fingerprint claim. | `@claim:signed-fingerprints`; `HOME-D`; live workflow. |
| U07 | Removed quantitative “0 values exposed”; retained the exact no-raw-values claim. | `@claim:no-raw-values`; `HOME-D`; live privacy. |
| U08 | Removed the unproved portable-context strip. | stale-copy `rg`; `HOME-D`; live `/`. |
| U09 | Removed “Keep the secrets where they already live”; retained file-level no-raw-values behavior. | `@claim:no-raw-values`; `HOME-D`; live `/`. |
| U10 | Removed the memory-only implementation claim. | stale-copy `rg`; `HOME-D`; live `/`. |
| U11 | Removed algorithm-heavy landing copy; retained signed and keyed-hash outcomes. | `@claim:signed-fingerprints`, `@claim:approved-value-hashes`; `HOME-D`; live `/`. |
| U12 | Registered difference exit behavior. | `@claim:exit-2-difference`; `DEMO-D`; live demo. |
| U13 | Registered request interception, storage inspection, sentinel discard, and reset. | `@claim:browser-demo-private`; `DEMO-M`; `LIVE`. |
| U14 | Registered cold offline service-worker reload and completed comparison. | `@claim:offline-reload`; `DEMO-M`; `LIVE`. |
| U15 | Replaced vague “Local processing only” with “Sample data stays in this page.” | `@claim:browser-demo-private`; `DEMO-M`; live demo. |
| U16 | Removed “Rules are reviewed as TOML”; the page shows the policy file without claiming review. | stale-copy `rg`; `HOME-D`; live policy section. |
| U17 | Removed “policy material”; scopes privacy to raw fingerprint values. | `@claim:no-raw-values`; `HOME-D`; live privacy. |
| U18 | Registered exact-name and prefix failures separately in one fixture. | `@claim:required-rules`; `HOME-D`; live policy section. |
| U19 | Registered exact/subdomain/lookalike host matrix and URL absence scan. | `@claim:host-rules`; README; live site remains aligned. |
| U20 | Registered secret hash absence and per-project hash change. | `@claim:approved-value-hashes`; `HOME-D`; live policy. |
| U21 | Removed the public “every comparison verifies” claim; signature rejection remains tested. | `@claim:signed-fingerprints`; `HOME-D`; live workflow. |
| U22 | Removed “Stable in a script”; scoped JSON to `refp --json demo`. | `@claim:json-output`; README; live CLI section. |
| U23 | Removed the public exit-0 reference. | stale-copy `rg`; `HOME-D`; live site. |
| U24 | Retained and registered exit 2 for the shipped sample. | `@claim:exit-2-difference`; `DEMO-D`; live demo. |
| U25 | Removed the public compound exit-1 reference. | stale-copy `rg`; `HOME-D`; live site. |
| U26 | Removed “JSON on every command”; implemented and tested one-document demo JSON. | `@claim:json-output`; README; live CLI section. |
| U27 | Removed the terminal’s three-part compound claim. | stale-copy `rg`; `HOME-D`; live terminal. |
| U28 | Removed “One binary” marketing; registered install output as exactly one executable. | `@claim:repository-install`; `HOME-D`; live install command. |
| U29 | Removed compound account/network/migration wording. | stale-copy `rg`; `HOME-D`; live site. |
| U30 | Replaced footer fragment with scoped Privacy route claims and a request/storage test. | `@claim:browser-demo-private`; `privacy-desktop.png`; live `/privacy`. |
| U31 | README now aligns exactly with difference and raw-value claims. | `@claim:detect-config-differences`, `@claim:no-raw-values`; `HOME-M`; live `/`. |
| U32 | README names engineers and environments in plain words. | `.factory/copy-audit.md`; `HOME-M`; live `/`. |
| U33 | Removed the four-part compound sentence; split schema/signature/raw-value behavior. | `@claim:fingerprint-schema`, `@claim:signed-fingerprints`, `@claim:no-raw-values`; live privacy. |
| U34 | README aligns with approved non-secret hashing. | `@claim:approved-value-hashes`; `HOME-D`; live policy. |
| U35 | Registered fresh-root install and working help. | `@claim:repository-install`; `HOME-D`; live install command. |
| U36 | Removed the future tagged-release promise. | stale-copy `rg`; `HOME-D`; live site. |
| U37 | Removed internal worker language. | stale-copy `rg`; README; live site. |
| U38 | Removed delimiter behavior from public copy. | stale-copy `rg`; README; live site. |
| U39 | Removed the embedded-newline preference claim. | stale-copy `rg`; README; live site. |
| U40 | Replaced every-command JSON wording with the tested demo scope. | `@claim:json-output`; README; live CLI section. |
| U41 | Replaced the three-exit-code sentence with the tested sample exit. | `@claim:exit-2-difference`; README; live demo. |
| U42 | Removed the starter-file behavior claim from public copy. | stale-copy `rg`; README; live site. |
| U43 | Registered exact required names. | `@claim:required-rules`; `HOME-D`; live policy. |
| U44 | Registered required prefixes. | `@claim:required-rules`; `HOME-D`; live policy. |
| U45 | Registered approved hashes and changed-value detection. | `@claim:approved-value-hashes`, `@claim:detect-config-differences`; `DEMO-D`; live demo. |
| U46 | Registered exact, subdomain, sibling, bare-suffix, and lookalike host cases. | `@claim:host-rules`; README; live site. |
| U47 | Host test scans fingerprints to ensure the full URL is absent. | `@claim:host-rules`; README; live privacy. |
| U48 | Registered schema, names, inferred types, and signature. | `@claim:fingerprint-schema`; `HOME-D`; live privacy. |
| U49 | Removed the project-key compound wording; retained and tested raw-value absence. | `@claim:no-raw-values`; live `/privacy`. |
| U50 | Registered literal shell-metacharacter execution and marker-file absence. | `@claim:direct-command`; README; live workflow. |
| U51 | Removed untested runtime-version compatibility copy. | stale-copy `rg`; README; live site. |
| U52 | Removed the public test-composition claim; handoff records executed gates. | clean-clone `npm test`; README; live site. |
| U53 | Registered the documented full build. | `@claim:build-artifacts`; README; live deployed artifact. |
| U54 | Build claim asserts `dist/site/index.html` and route documents. | `@claim:build-artifacts`, `STATIC`; live root/routes. |
| U55 | Replaced “registry-ready” with an imperative package command; package verification passed. | `cargo package --manifest-path cli/Cargo.toml`; README; live site. |
| U56 | Removed the broad CLI telemetry/network/account/cloud compound claim; site privacy is precisely scoped. | `@claim:browser-demo-private`; live `/privacy`. |
| U57 | Registered names/types/schema/signature disclosure and raw-value absence. | `@claim:fingerprint-schema`, `@claim:no-raw-values`; live `/privacy`. |

## Final verification

- Working tree suite: `npm test`, `npm run lint`, `npm run build`, and
  `cargo package --manifest-path cli/Cargo.toml --allow-dirty` passed.
- Clean clone `/tmp/refp-polish-clean-zoxDCf/repo` at `bfb7fea`: `npm ci`,
  `npm test`, `npm run lint`, `npm run build`, and `cargo package` passed.
- All 17 claim commands passed from that clean clone.
- Built budgets: JS 17,157 B, CSS 17,634 B, hero 178,612 B.
- Live route probe: `/`, `/?demo=1`, `/demo`, `/privacy`, `/terms` returned
  200; `/does-not-exist-polish-1` returned 404.
- `verify-url.sh` passed live; evidence is under
  `.factory/evidence/polish-1/verify-live/`.
- No review-1 finding remains unresolved.
