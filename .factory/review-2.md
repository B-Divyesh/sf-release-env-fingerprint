# Adversarial first-read review 2

- Live URL: <https://release-env-fingerprint.sociobot.in>
- Reviewed: 2026-08-28 UTC
- Source: `c407bee2e0fe4688a5fa21fb6acc5659436775ed`
- Viewports: 390 × 844 and 1440 × 900, fresh Chromium contexts
- Verdict: **FAIL**

The first screen now answers what the product does, who it is for, and what to
click. All 17 registered claim tests pass. Three blocking and eight minor
findings remain; this review requires zero findings.

## Findings

### F-2-1 / review-1 B2 — BLOCKING: the demo is still not visible as a working product on its first screen

**Quote/location:** After **Try it with sample data**, mobile shows “Demo —
sample data, nothing is saved,” “See release differences before installing,”
and “The completed sample is ready below.” At 390 × 844 the first input starts
at y=1,101 and the result at y=1,878. At 1440 × 900 they start at y=1,247 and
y=1,611. The landing “sample run” is static `<pre>` text; there is no
self-hosted terminal recording.

**Why:** Neither first post-click viewport contains realistic input or an
observable result. This half-fixes B2, which also required a recording of the
real CLI.

**Fix:** Put a compact computed five-row result and named sample environments
under the banner, above the editor. Add a captioned recording generated from
`refp demo`. Test that a sample row and the result are within both viewports.

### F-2-2 / review-1 M1 — BLOCKING: the 404 lacks required social metadata

**Quote/location:** Live `/does-not-exist-review-2` returns the designed 404
with a title, description, canonical, favicon, and Apple icon, but no `og:*` or
`twitter:*` fields. `site/public/404.html` confirms the omission.

**Why:** M1 required complete metadata on every route, so it remains half-fixed.

**Fix:** Add route-specific OG and Twitter fields using the product social
card, and extend the static metadata test to parse `404.html`.

### F-2-3 / review-1 M3 — BLOCKING: “Try sample” remains a vague action

**Quote/location:** Header action on every route: “Try sample.”

**Why:** It does not name the result. Review 1 already flagged the earlier
“Try it” label, so the action-copy repair is incomplete.

**Fix:** Use **Open sample comparison** or **Try it with sample data** and test
the same label on every route.

### F-2-4 — MINOR: workflow headings fail out of context

**Quote/location:** “Capture,” “Sign,” and “Compare.”

**Why:** A screen-reader heading list does not identify the objects.

**Fix:** **Capture release settings**, **Sign the fingerprint**, and **Compare
environments**.

### F-2-5 — MINOR: one concept has three names

**Quote/location:** “release configuration,” “release settings,” and title text
“release config.”

**Why:** The terminology rule requires one word for one concept.

**Fix:** Use **release settings** in the h1, workflow, footer, README, and title:
“Release Env Fingerprint — compare release settings.”

### F-2-6 — MINOR: “project-keyed hash” is unexplained jargon

**Quote/location:** README: “Only approved non-secret values receive a
project-keyed hash.”

**Fix:** “Only values marked non-secret are hashed with the project key.”

### F-2-7 — MINOR: “schema identifier” is unnecessary jargon

**Quote/location:** README: “Each fingerprint has variable names, inferred
types, a schema identifier, and a signature.”

**Fix:** Replace “schema identifier” with **format version** and align the
registered claim wording.

### F-2-8 — MINOR: the README contains an unlisted process claim

**Quote/location:** “Every public promise is registered in
`.factory/claims.json`.” No claim entry covers this assertion.

**Why:** This is itself a promise that a verifier could rely on.

**Fix:** Use “See `.factory/claims.json` for the claim test registry,” or add a
registered test that extracts public copy and proves coverage.

### F-2-9 — MINOR: desktop hides the three first-screen facts

**Quote/location:** At 1440 × 900 the facts end at y=935, y=935, and y=973, so
none is fully visible. All three fit at 390 × 844.

**Fix:** Reduce desktop hero spacing/type size or move the facts beside the
action. Add a bound assertion for the final fact at 1440 × 900.

### F-2-10 — MINOR: 404 chrome is inconsistent

**Quote/location:** Valid routes use the SVG brand, four header links, footer
one-liner, source link, legal links, and build ID. The 404 uses “◉ REFP,” two
header links, and omits the footer one-liner and source link.

**Fix:** Generate the 404 from the shared site chrome while preserving its
proof-sheet body and HTTP 404 status.

### F-2-11 — MINOR: the brief's GitHub Actions path is absent

**Quote/location:** The brief says “support POSIX shell and GitHub Actions
first.” There is no workflow example or README Actions snippet.

**Why:** CI-to-production comparison is the stated job, so a ready CI path is
the obvious missing integration.

**Fix:** Ship and test `examples/github-actions.yml` with install, capture,
compare, exit-2 handling, and a GitHub Secrets project key. AI is not warranted
for this deterministic security tool.

## Cold first read

| Question | 390 × 844 | 1440 × 900 |
| --- | --- | --- |
| What does it do? | Compares release configuration across environments and finds missing, extra, or changed settings without exposing secrets. | Same; the proof-sheet art reinforces comparison. |
| Who is it for? | Engineers shipping one service through several environments. | Same. |
| What should I click first? | **Try it with sample data**. | Same, although dark **Install the CLI** competes visually. |

All three questions are answerable. Mobile includes the action note and three
facts. Desktop omits the facts from the first viewport (F-2-9). Neither had
horizontal overflow or a console error.

## Copy audit

Whitespace-delimited counts follow. Commands/data rows are excluded. No
sentence exceeds 22 words or uses a banned marketing adjective. Averages are
7.5 words on the landing page and 8.5 in the README.

### Landing-page sentences

| ID | Words | Sentence | Result |
| --- | ---: | --- | --- |
| L01 | 6 | “Compare release configuration without exposing secrets.” | F-2-5 |
| L02 | 16 | “For engineers shipping one service across environments, it shows missing, extra, and changed settings before deployment.” | Pass |
| L03 | 5 | “See five sample differences immediately.” | Pass |
| L04 | 6 | “Works offline after the first visit.” | Pass |
| L05 | 5 | “Demo data is not saved.” | Pass |
| L06 | 5 | “Free under the MIT License.” | Pass |
| L07 | 6 | “Compare configuration without storing secret values.” | F-2-5 |
| L08 | 14 | “Capture a fingerprint, sign it with your project key, then compare it before deployment.” | Pass |
| L09 | 6 | “Run the environment command you choose.” | Pass |
| L10 | 9 | “Save a signed fingerprint with variable names and types.” | Pass |
| L11 | 7 | “Stop a release when the fingerprints differ.” | Pass |
| L12 | 5 | “See the comparison before installing.” | Pass |
| L13 | 9 | “The isolated sample opens with five differences already marked.” | Pass; F-2-1 is placement |
| L14 | 6 | “Choose the configuration rules to enforce.” | Pass |
| L15 | 9 | “The policy lists required variables and approved non-secret values.” | Pass |
| L16 | 7 | “Require a variable by its exact name.” | Pass |
| L17 | 8 | “Require at least one variable with a prefix.” | Pass |
| L18 | 6 | “Hash only values you mark non-secret.” | Pass |
| L19 | 7 | “Run the sample without touching project files.” | Pass |
| L20 | 11 | “`refp demo` creates an isolated temporary folder with the bundled sample.” | Pass |
| L21 | 7 | “Demo files remain in a temporary folder.” | Pass |
| L22 | 6 | “Compare release settings without exposing secrets.” | F-2-5 |

### Landing headings and actions

| Type | Words | Label | Result |
| --- | ---: | --- | --- |
| h1 | 6 | “Compare release configuration without exposing secrets.” | Clear; F-2-5 terminology |
| h2 | 6 | “Compare configuration without storing secret values.” | Clear; F-2-5 terminology |
| h3 | 1 | “Capture” | F-2-4 |
| h3 | 1 | “Sign” | F-2-4 |
| h3 | 1 | “Compare” | F-2-4 |
| h2 | 5 | “See the comparison before installing.” | Pass |
| h2 | 6 | “Choose the configuration rules to enforce.” | Pass |
| h2 | 7 | “Run the sample without touching project files.” | Pass |
| Header action | 2 | “Try sample” | F-2-3 |
| Header action | 3 | “Install the CLI” | Pass |
| Primary action | 5 | “Try it with sample data” | Pass; adjacent result text |
| Button | 3 | “Copy install command” | Pass |

### README sentences

| ID | Words | Sentence | Result |
| --- | ---: | --- | --- |
| R01 | 9 | “Compare release settings across environments without recording raw values.” | F-2-5 |
| R02 | 13 | “It is for engineers shipping one service through local, CI, staging, and production.” | Pass |
| R03 | 5 | “Open the isolated browser sample:” | Pass |
| R04 | 9 | “It immediately shows five differences and saves no edits.” | Pass; F-2-1 is placement |
| R05 | 9 | “The repository installs one `refp` executable with working help.” | Pass |
| R06 | 4 | “From a local clone:” | Pass |
| R07 | 11 | “The command creates a fresh temporary workspace without changing project files.” | Pass |
| R08 | 10 | “It exits 2 because the sample fingerprints have five differences.” | Pass |
| R09 | 6 | “For a single JSON document, run:” | Pass |
| R10 | 10 | “`refp` runs the command after `--` directly without shell expansion.” | Pass |
| R11 | 11 | “The CLI finds missing, extra, type, and approved non-secret value differences.” | Pass |
| R12 | 8 | “It exits 2 when the sample fingerprints differ.” | Pass |
| R13 | 10 | “The policy enforces exact required variable names and required prefixes.” | Pass |
| R14 | 11 | “It accepts exact hosts and approved subdomains without recording full URLs.” | Pass |
| R15 | 8 | “Only approved non-secret values receive a project-keyed hash.” | F-2-6 |
| R16 | 13 | “Each fingerprint has variable names, inferred types, a schema identifier, and a signature.” | F-2-7 |
| R17 | 3 | “Tampering is rejected.” | Pass |
| R18 | 6 | “Raw environment values are not recorded.” | Pass |
| R19 | 7 | “Every public promise is registered in `.factory/claims.json`.” | F-2-8 |
| R20 | 8 | “Run one claim from a clean checkout with:” | Pass |
| R21 | 9 | “The browser sample works offline after its first visit.” | Pass |
| R22 | 8 | “The project is free under the MIT License.” | Pass |
| R23 | 10 | “The build produces `target/release/refp` and the static site in `dist/site`.” | Pass |
| R24 | 8 | “Preview the built site with `npm run preview`.” | Pass |
| R25 | 9 | “Deploy the contents of `dist/site` as a static site.” | Pass |
| R26 | 7 | “Create a package without publishing it with:” | Pass |
| R27 | 8 | “The site has no analytics or third-party requests.” | Pass |
| R28 | 9 | “Browser demo edits use no cookies or browser storage.” | Pass |
| R29 | 12 | “Review fingerprints before sharing them because they include variable names and types.” | Pass |
| R30 | 9 | “See `SECURITY.md` for the threat model and reporting guidance.” | Pass |
| R31 | 5 | “Free under the MIT License.” | Pass |

README headings—“Release Env Fingerprint,” “Install the CLI,” “Try the bundled
sample,” “Compare release settings,” “Configuration policy,” “Product promises
and tests,” “Develop and test refp,” “Privacy and security,” and “License”—pass
the out-of-context check. The README has no buttons.

## Demo and sandbox

- One click opened `/?demo=1` with the persistent required banner, **Reset
  demo**, and **Start for real**.
- Five computed rows appeared without another click: `NODE_ENV`,
  `PUBLIC_API_ORIGIN`, `LOG_LEVEL`, `PUBLIC_API_URL`, and `DEBUG`.
- Editing both inputs produced a real zero-difference result. Reset restored the
  samples and five rows. Leaving discarded the sentinel edit.
- Cookies, localStorage, sessionStorage, and IndexedDB stayed empty. The only
  cache was the same-origin app shell. Compare/reset made no request; all load
  requests were same-origin.
- After first load, an intercepted offline reload showed the offline notice and
  five computed rows.
- Release `refp demo`, invoked from empty
  `/tmp/refp-review2-cli-cwd-1K9R7g`, exited 2, printed five differences, made
  six files only under `/tmp/refp-demo-5842-1787916920235186056`, and left its
  invocation directory empty.

## Claims

Every exact command in `.factory/claims.json` ran separately after `npm ci` in
clean clone `/tmp/refp-review2-clean-2QbXqu/repo`.

| ID | Result | Evidence |
| --- | --- | --- |
| `detect-config-differences` | PASS | All four difference classes |
| `sample-differences` | PASS | Five named rows; edits changed result |
| `signed-fingerprints` | PASS | Valid signature; tamper rejected |
| `no-raw-values` | PASS | Sentinel absent from files/output |
| `browser-demo-private` | PASS | Requests, storage, reset, discard |
| `offline-reload` | PASS | Controlled offline reload, five rows |
| `mit-license` | PASS | Repository and deployed license |
| `cli-demo-isolated` | PASS | Empty cwd; six temp files |
| `exit-2-difference` | PASS | Exit 2; five parsed differences |
| `required-rules` | PASS | Exact-name and prefix failures |
| `host-rules` | PASS | Exact/subdomain/lookalike matrix; URL absent |
| `approved-value-hashes` | PASS | Approved-only, project-dependent hashes |
| `fingerprint-schema` | PASS | Fields/types/signature; sentinel absent |
| `json-output` | PASS | One parseable JSON document |
| `direct-command` | PASS | Literal metacharacters; no marker file |
| `repository-install` | PASS | One installed executable; help worked |
| `build-artifacts` | PASS | Release binary and `dist/site/index.html` |

No registered test failed. F-2-8 is the only claim-like public sentence without
an entry; no other landing, demo, legal, or README claim was unlisted.

## Earlier-finding audit

Primary findings: B1 **fixed**; B2 **half-fixed, F-2-1**; B3 **fixed**; B4
**fixed**; M1 **half-fixed, F-2-2**; M2 **fixed as originally scoped**; M3
**half-fixed, F-2-3**. Live checks, not the polish assertions, established these
statuses.

Every earlier copy finding was checked: C01, C02, C03, C04, C05, C06, C07,
C08, C09, C10, C11, C12, C13, C14, C15, C16, C17, C18, and C19 are **fixed**.
The old vague headings, inaccurate error, overlong README sentences, future
binary promise, internal worker wording, and shell-boundary wording were checked
in live copy and source. F-2-4 through F-2-8 are newly observed copy issues.

Every earlier unlisted-claim finding was checked. U01, U02, U03, U04, U05,
U06, U07, U08, U09, U10, U11, U12, U13, U14, U15, U16, U17, U18, U19, U20,
U21, U22, U23, U24, U25, U26, U27, U28, U29, U30, U31, U32, U33, U34, U35,
U36, U37, U38, U39, U40, U41, U42, U43, U44, U45, U46, U47, U48, U49, U50,
U51, U52, U53, U54, U55, U56, and U57 are **fixed**. Evidence was the 17
passing claim commands plus source/live absence checks for removed wording.
F-2-8 concerns a new registry-completeness sentence, not the old U52 suite-
composition claim.

## Structure, accessibility, and identity

| Check | Result |
| --- | --- |
| Titles | Route-specific and within pattern; F-2-5 covers root terminology |
| One h1, landmarks, `lang` | Pass on root, both demo URLs, legal routes, and 404 |
| Description/canonical/favicon | Pass on every route |
| OG/Twitter/social card/Apple icon | Valid routes pass; 1200 × 630 card and 180 × 180 icon; 404 fails F-2-2 |
| 404 | Designed and HTTP 404; F-2-10 covers chrome |
| Deep links, Back, focus | Pass; h1 focus/announcement and scroll restoration confirmed |
| Links/sitemap | All internal links, license, assets, and GitHub source returned 200; sitemap lists four valid routes |
| Security | Self-only CSP, HSTS, `nosniff`, no-referrer, frame denial, permissions policy |
| Accessibility | Worker verification passed; axe 4.10.3 found zero violations on six URLs; no mobile overflow |
| Console | No errors on valid routes; only the expected failed-document message for HTTP 404 |
| Budget | JS 17,157 B (6.14 KB gzip), CSS 17,634 B, hero 178,612 B |
| Identity | Distinct warm-paper risograph proof-sheet system matches `.factory/design.md`; not a generic SaaS template |

## Missed leverage and AI

F-2-11 is the obvious missing integration. Import/export or sync adds less value
to this file-based CLI. AI would reduce auditability, so its absence is correct.
Source contains no model call, provider key, Azure endpoint, or decorative AI
copy.

## Verification record

- Clean clone at `c407bee`: all 17 claim commands, `npm test`, `npm run lint`,
  and `npm run build` passed.
- `npm test`: 8 Rust unit tests, 4 CLI integration tests, static budgets, and
  browser demo/routes/privacy/offline/focus/reduced-motion/axe checks passed.
- `/opt/fleet/lib/verify-url.sh` passed the live root: HTTP 200, title,
  `lang=en`, one h1, main, alt text, labeled buttons, zero errors.
- Live Playwright covered cold first screens, demo state, storage/network,
  offline, metadata/status, links, focus/Back, console, and axe.

## What would make this perfect

Resolve F-2-1 through F-2-11, then repeat the whole cold review and every claim
command from a new clean clone. A pass requires no remaining finding.
