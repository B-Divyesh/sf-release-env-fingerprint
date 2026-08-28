# Adversarial first-read review 3

- Product: Release Env Fingerprint (`refp`)
- Live URL: <https://release-env-fingerprint.sociobot.in>
- Reviewed: 2026-08-28 UTC
- Source commit: `e76591a146f6a4dfb8085b059ae7b8d867cbf678`
- Viewports: fresh Chromium contexts at 390 × 844 and 1440 × 900
- Verdict: **PASS**

No blocking, major, minor, copy, claim, routing, or missed-leverage finding remains. This was a complete review, not a diff-only check.

## Cold first read, before scrolling

| Question | Answer at 390 px and 1440 px |
| --- | --- |
| What does it do? | It compares a service's release settings between environments without exposing secret values. |
| Who is it for? | Engineers shipping one service across environments. |
| What should I click first? | **Try it with sample data**, which says it will show five differences immediately. |

The evidence is explicit: “Compare release settings without exposing secrets.”, “For engineers shipping one service across environments, it shows missing, extra, and changed settings before deployment.”, “Try it with sample data”, and “See five sample differences immediately.” The three proof facts end at 802 px on mobile and 892 px on desktop. Neither viewport had horizontal overflow, console errors, or failed requests.

## Copy audit

Counts are whitespace-delimited. Commands, URLs, data rows, eyebrow labels, and navigation labels are not prose sentences. Every sentence is at or below 22 words. No banned marketing word, inconsistent product term, unexplained heading, or non-result-naming action was found.

### Landing page sentences

| Words | Sentence | Coverage/result |
| ---: | --- | --- |
| 6 | Compare release settings without exposing secrets. | `detect-config-differences`, `no-raw-values` |
| 16 | For engineers shipping one service across environments, it shows missing, extra, and changed settings before deployment. | `detect-config-differences` |
| 5 | See five sample differences immediately. | `sample-differences` |
| 6 | Works offline after the first visit. | `offline-reload` |
| 5 | Demo data is not saved. | `browser-demo-private` |
| 5 | Free under the MIT License. | `mit-license` |
| 5 | Names and types, not values. | `fingerprint-schema`, `no-raw-values` |
| 7 | Compare release settings without storing secret values. | `no-raw-values` |
| 14 | Capture a fingerprint, sign it with your project key, then compare it before deployment. | `signed-fingerprints`, `detect-config-differences` |
| 6 | Run the environment command you choose. | `direct-command` |
| 9 | Save a signed fingerprint with variable names and types. | `signed-fingerprints`, `fingerprint-schema` |
| 7 | Stop a release when the fingerprints differ. | `exit-2-difference` |
| 5 | See the comparison before installing. | Instruction |
| 9 | The isolated sample opens with five differences already marked. | `sample-differences` |
| 7 | Choose the release setting rules to enforce. | Instruction |
| 9 | The policy lists required variables and values marked non-secret. | `required-rules`, `approved-value-hashes` |
| 7 | Require a variable by its exact name. | `required-rules` |
| 8 | Require at least one variable with a prefix. | `required-rules` |
| 6 | Hash only values you mark non-secret. | `approved-value-hashes` |
| 7 | Run the sample without touching project files. | `cli-demo-isolated` |
| 11 | `refp demo` creates an isolated temporary folder with the bundled sample. | `cli-demo-isolated` |
| 7 | Recorded from the real `refp demo` command. | Recording freshness; CLI demo claims |
| 5 | The temporary path is shortened. | Presentation note |
| 6 | Compare release settings without exposing secrets. | Footer duplicate; same coverage as the first row |

The headings “Capture release settings,” “Sign the fingerprint,” and “Compare environments” make sense in isolation. The actions “Try it with sample data,” “Open sample comparison,” “Compare fingerprints,” “Reset demo,” “Start for real,” and “Copy install command” name their outcomes or are the required demo boundary controls.

### README sentences

| Words | Sentence | Coverage/result |
| ---: | --- | --- |
| 9 | Compare release settings across environments without storing raw values. | `no-raw-values` |
| 13 | It is for engineers shipping one service through local, CI, staging, and production. | Audience statement |
| 5 | Open the isolated browser sample. | Instruction |
| 9 | It immediately shows five differences and saves no edits. | `sample-differences`, `browser-demo-private` |
| 4 | From a local clone. | Instruction label |
| 9 | The repository installs one `refp` executable with working help. | `repository-install` |
| 11 | The command creates a fresh temporary workspace without changing project files. | `cli-demo-isolated` |
| 10 | It exits 2 because the sample fingerprints have five differences. | `exit-2-difference` |
| 7 | For a single JSON document, run. | Instruction |
| 10 | `refp` runs the command after `--` directly without shell expansion. | `direct-command` |
| 10 | The CLI finds missing, extra, type, and marked non-secret value differences. | `detect-config-differences` |
| 8 | It exits 2 when the sample fingerprints differ. | `exit-2-difference` |
| 10 | The policy enforces exact required variable names and required prefixes. | `required-rules` |
| 11 | It accepts exact hosts and approved subdomains without recording full URLs. | `host-rules` |
| 11 | Only values marked non-secret are hashed with the project key. | `approved-value-hashes` |
| 12 | Each fingerprint has variable names, inferred types, a format version, and a signature. | `fingerprint-schema` |
| 3 | Tampering is rejected. | `signed-fingerprints` |
| 5 | Raw environment values are not recorded. | `no-raw-values` |
| 8 | See `.factory/claims.json` for the claim test registry. | Direct reference |
| 8 | Run one claim from a clean checkout with. | Instruction |
| 10 | The browser sample works offline after its first visit. | `offline-reload` |
| 7 | The project is free under the MIT License. | `mit-license` |
| 8 | Copy `examples/github-actions.yml` into your project as `.github/workflows/refp.yml`. | Instruction |
| 6 | Add `REFP_PROJECT_KEY` to GitHub Secrets. | Instruction |
| 6 | Commit `refp.toml` and a reviewed `fingerprints/production.refp.json`. | Instruction |
| 13 | The workflow installs `refp`, captures CI release settings, and compares them with production. | `github-actions-example` |
| 9 | It reports release differences with exit code 2. | `github-actions-example` |
| 11 | The build produces `target/release/refp` and the static site in `dist/site`. | `build-artifacts` |
| 7 | Preview the built site with `npm run preview`. | Instruction |
| 8 | Deploy the contents of `dist/site` as a static site. | Instruction |
| 9 | Create a package without publishing it with. | Instruction |
| 8 | The site has no analytics or third-party requests. | `browser-demo-private` |
| 8 | Browser demo edits use no cookies or browser storage. | `browser-demo-private` |
| 11 | Review fingerprints before sharing them because they include variable names and types. | `fingerprint-schema` |
| 9 | See `SECURITY.md` for the threat model and reporting guidance. | Direct reference |
| 6 | Free under the MIT License. | `mit-license` |

The current terminology is consistent: `release settings`, `fingerprint`, `difference`, `value marked non-secret`, and `project key`. All claim-like copy on the landing page and README maps to `.factory/claims.json`; no unlisted claim was found.

## Demo and sandbox

The first-screen action reaches `/?demo=1` in one click. In a fresh 390 px context it immediately rendered five realistic rows for `NODE_ENV`, `PUBLIC_API_ORIGIN`, `LOG_LEVEL`, `PUBLIC_API_URL`, and `DEBUG`; the final row ended at 815 px. The persistent banner reads “Demo — sample data, nothing is saved” and exposes **Reset demo** and **Start for real**.

After changing the candidate to `ONLY=value`, the computed result changed to six differences. Reset restored both bundled inputs, five differences, and focus to the demo heading. Start for real discarded a sentinel and opened the CLI installation section.

Network interception observed five initial same-origin static requests and zero requests caused by editing or comparing. Cookies, localStorage, sessionStorage, and IndexedDB remained empty. After one online visit, an offline reload showed the offline notice and the same five-row result. The CLI demo is covered by its isolated-temp-dir claim and uses the real signed capture/compare flow.

## Claims and clean clone

`.factory/claims.json` has 18 unique entries. A clean clone at `/tmp/refp-review3-clean-Dg7Y77/repo` completed `npm ci` and `npm run test:claims:all`. The runner invoked every registry entry: `detect-config-differences`, `sample-differences`, `signed-fingerprints`, `no-raw-values`, `browser-demo-private`, `offline-reload`, `mit-license`, `cli-demo-isolated`, `exit-2-difference`, `required-rules`, `host-rules`, `approved-value-hashes`, `fingerprint-schema`, `json-output`, `direct-command`, `repository-install`, `build-artifacts`, and `github-actions-example`.

All 18 passed. Browser tests use the built sample entry point; CLI tests use a temporary directory or fresh installation as the registry documents.

## Structure, accessibility, and links

| Check | Result |
| --- | --- |
| Routes | `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` return 200 with distinct title, description, canonical, OG/Twitter data, one `h1`, and one `main`. |
| 404 | An unknown URL returns HTTP 404 with the shared proof-sheet design, correct title, and return action. |
| History | Privacy navigation focuses and announces its `h1`; Back restores the demo, focus, banner, and five rows. |
| Crawl | Rendered internal, legal, asset, and GitHub source links returned 200 where applicable; fragment-only skip links work in-page. |
| Chrome | Every route has the wordmark, four navigation links, skip link, footer one-liner, Privacy/Terms, Param Factory attribution, version, and build ID. |
| Accessibility | Fresh live sessions had no console errors or overflow; the live structure has `lang=en`, semantic landmarks, labelled controls, focus states, alt text, and reduced-motion support. |
| Identity | The warm paper, press-ink, registration-mark proof-sheet system is specific to this product and matches `.factory/design.md`, not a generic SaaS treatment. |

The 1200 × 630 social card, SVG favicon, 180 px Apple icon, robots file, sitemap, designed static 404, service worker, and same-origin CSP are present. No third-party script/font/analytics request, raw provider key, Azure endpoint, or decorative AI feature was found.

## Earlier findings recheck

I read `review-1.md`, `review-2.md`, `polish-1.md`, `polish-2.md`, the prior handoff, and both verification records. Each prior finding was rechecked on the live deployment and in source:

| Earlier IDs | Current confirmation |
| --- | --- |
| B1 | The current first screen names job, audience, one sample action, immediate outcome, and three facts. |
| B2, F-2-1 | Both demo URLs open on five computed rows above editors; banner, reset, discard, offline sample, real recording, and `refp demo` sandbox work. |
| B3 | The 18-entry registry exists, each entry has one tagged runner branch, and all commands passed clean. |
| B4 | Deep links are real documents; unknown paths return the designed HTTP 404; focus/announcement/Back work. |
| M1, F-2-2 | Valid routes and 404 have complete route-specific metadata, icon, Apple icon, and social card. |
| M2, F-2-10 | Shared chrome and durable legal/source links, attribution, version, and build ID appear everywhere, including 404. |
| M3, F-2-3–F-2-8 | The current audit finds no vague demo action, contextless workflow heading, terminology split, hash/schema jargon defect, or registry-completeness promise. |
| F-2-9 | Final facts remain inside both first viewports: 802 px mobile and 892 px desktop. |
| F-2-11 | The GitHub Actions example exists and its fresh-install capture/compare claim passed. |
| C01–C19 | Every round-one copy, error, action, and terminology repair remains in source and rendered UI. |
| U01–U57 | Every old unlisted claim remains removed or covered by one of the 18 observable tests; no recurrence was found. |

## Missed leverage

No additional feature is expected by the brief. This is a deterministic, local-first release comparison. AI, cloud sync, or another import path would not improve the stated release-gating job and would weaken the privacy boundary. The explicitly implied GitHub Actions path is present.

## What would make this perfect

Nothing actionable remains under this review contract. Preserve the first-screen copy, isolated demo boundary, claim registry, and proof-sheet identity. Add a sandbox test before publishing any future visitor-facing promise.

