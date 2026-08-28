# Perfection loop — polish round 2

- Candidate: `c407bee2e0fe4688a5fa21fb6acc5659436775ed`
- Review source: `67bbc089d2b8f06f27cee3ba31d1a6a31dc2c4b8`
- Product repair: `c22bc3640fb2e39399f18732e812e8ed712824e0`
- Live URL: <https://release-env-fingerprint.sociobot.in>
- Cold live audit: 2026-08-28 12:22 UTC
- Result: **PASS — no finding remains open**

## Evidence keys

- `FULL`: `npm test` in clean clone
  `/tmp/refp-polish2-clean-hU77TO/repo`; runs typecheck, 8 Rust unit tests,
  4 CLI integration tests, recording freshness, static checks, browser checks,
  axe integration, and all 18 claim commands.
- `CLAIMS`: all 18 individual commands from `.factory/claims.json`, invoked by
  `npm run test:claims:all` in that clean clone.
- `LIVE`: `.factory/evidence/polish-2/live-check.json`.
- `LAYOUT`: `.factory/evidence/polish-2/layout-local.json` plus the four
  `live-home-*` and `live-demo-*` screenshots.
- `META`: `site/test.mjs` and the `routes` block in `LIVE`.
- `A11Y`: `.factory/evidence/polish-2/axe-live.json`; zero violations on home,
  demo, privacy, terms, and 404. The factory URL verifier output is under
  `.factory/evidence/polish-2/verify-live/`.
- `LIGHTHOUSE`: `.factory/evidence/polish-2/lighthouse-live.json`; 99
  performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.7 s,
  TBT 80 ms, CLS 0.

## Review 2 findings

| ID | Change made | Evidence |
| --- | --- | --- |
| F-2-1 / B2 | Moved the real computed five-row verdict above the editors on both demo URLs. Named production and candidate in the `h1`. Added a captioned SVG recording generated from the real `refp demo` output, with a freshness check and reduced-motion result. | `@claim:sample-differences`; `npm run recording:check`; `LAYOUT` records final-row bottoms of 817.45 px mobile and 846.5 px desktop; `live-demo-mobile.png`; `live-demo-desktop.png`; live SVG SHA-256 matches source in `LIVE`. |
| F-2-2 / M1 | Build now generates the 404 from the same route HTML template, including route-specific title, description, canonical, all OG/Twitter fields, favicon, Apple icon, and `noindex`. | `META`; live `/missing-polish-2` returned 404 with every field; `A11Y`. |
| F-2-3 / M3 | Replaced every “Try sample” label with “Open sample comparison.” | Browser assertion on all routes in `FULL`; live cold pages in `LIVE`. |
| F-2-4 | Changed workflow headings to “Capture release settings,” “Sign the fingerprint,” and “Compare environments.” | Exact heading assertion in `site/e2e.mjs`; `FULL`. |
| F-2-5 | Standardized public copy, CLI help, title, metadata, footer, and README on “release settings.” | Stale-copy scan; title assertions in `FULL`; live title and `h1` in `LIVE`. |
| F-2-6 | Replaced “project-keyed hash” with “values marked non-secret are hashed with the project key.” | `@claim:approved-value-hashes`; README and `.factory/claims.json`. |
| F-2-7 | Replaced “schema identifier” with “format version” in README and the claim registry. | `@claim:fingerprint-schema`; README and `.factory/claims.json`. |
| F-2-8 | Replaced the registry-completeness promise with a direct link: “See `.factory/claims.json` for the claim test registry.” | `.factory/copy-audit.md`; stale-copy scan; `CLAIMS`. |
| F-2-9 | Tightened desktop hero height, spacing, and display size while retaining the asymmetric proof-sheet composition. | Desktop final fact bottom is 891.84 px at 1440×900 in `LAYOUT`; `live-home-desktop.png`. |
| F-2-10 | The 404 now renders through the shared wordmark, four-link header, footer one-liner, source/legal links, and polish-2 build ID. | Shared-chrome browser assertions in `FULL`; live 404 screenshot and route entry in `LIVE`. |
| F-2-11 | Added `examples/github-actions.yml`, README setup steps, least-privilege permissions, project-key secret handling, capture, compare, and explicit exit-2 behavior. Added a registered claim that installs the package in a fresh root and executes the real capture/compare flow in a temporary workspace. | `@claim:github-actions-example`; raw GitHub file hash matched the pushed source; `CLAIMS`. |

## Cumulative review 1 findings

| IDs | Change retained and rechecked | Evidence |
| --- | --- | --- |
| B1 | The first screen still has a six-word job `h1`, a 16-word audience sentence, one sample action with an adjacent outcome, and three registered facts. | `live-home-mobile.png`, `live-home-desktop.png`; first/final fact bounds in `LIVE`; `CLAIMS`. |
| B2 | Demo isolation remains DOM-only in the browser and OS-temp-only in the CLI, with immediate computed data, persistent banner, reset, discard, and offline behavior. Round two also adds the real CLI recording. | `@claim:sample-differences`, `@claim:browser-demo-private`, `@claim:offline-reload`, `@claim:cli-demo-isolated`; `LIVE`. |
| B3 | `.factory/claims.json` contains 18 unique claims and each exact command is run separately. | `CLAIMS`; `site/all-claims.mjs`; clean-clone `FULL`. |
| B4 | Demo, privacy, terms, and 404 remain real static routes; History API navigation restores focus and scroll; unknown URLs return HTTP 404. | `FULL`; route status/title entries in `LIVE`. |
| M1 | Complete route metadata remains on all valid routes and is now complete on the 404. | `META`; `LIVE`. |
| M2 | Every rendered route, including 404, has durable legal/source links and the version/build footer. | `FULL`; `LIVE`. |
| M3 | All flagged headings, actions, errors, and README sentences remain in plain words; round two closes the remaining vague header label. | `.factory/copy-audit.md`; `FULL`. |
| C01, C02, C03, C04, C05, C06, C07, C08, C09, C10, C11, C12, C13, C14, C15, C16, C17, C18, C19 | The item-by-item round-one rewrites in `.factory/polish-1.md` remain present. Round two additionally standardizes “release settings,” expands the three workflow headings, and removes the remaining hash/format jargon. | `.factory/copy-audit.md`; stale-copy scan; exact heading/error browser assertions in `FULL`; `CLAIMS`; cold live copy in `LIVE`. |
| U01, U02, U03, U04, U05, U06, U07, U08, U09, U10, U11, U12, U13, U14, U15, U16, U17, U18, U19, U20, U21, U22, U23, U24, U25, U26, U27, U28, U29, U30, U31, U32, U33, U34, U35, U36, U37, U38, U39, U40, U41, U42, U43, U44, U45, U46, U47, U48, U49, U50, U51, U52, U53, U54, U55, U56, U57 | Every earlier unlisted claim remains either removed or represented by its observable claim test exactly as mapped in `.factory/polish-1.md`. Round two adds the GitHub Actions claim and upgrades it from source inspection to a real installed CLI flow. | All 18 entries in `CLAIMS`; privacy/network/storage and live public-copy checks in `LIVE`; build/package checks in clean-clone `FULL`. |

The controller supplied no additional finding beyond this cumulative review.

## Other gates

- `npm run lint`: pass in the clean clone.
- `npm run build`: pass; release binary and `dist/site` produced.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- `cargo package --manifest-path cli/Cargo.toml`: pass; 11 files,
  75.7 KiB unpacked and 20.1 KiB compressed.
- Static budgets: JS 16,997 B, CSS 19,049 B, hero 178,612 B.
- Catalog sentence is verb-first and 73 characters.
- No AI feature was added; deterministic comparison is the appropriate tool.

