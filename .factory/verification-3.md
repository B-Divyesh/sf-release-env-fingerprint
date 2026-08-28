# Independent product verification — PASS

| Field | Evidence |
| --- | --- |
| Candidate | `bb83541d8b923c08412ff1567610d8ea27092201` |
| Live URL | <https://release-env-fingerprint.sociobot.in/> |
| Work order | `release-env-fingerprint-verify-3` |
| Verified | 2026-08-28 UTC |
| Result | **PASS — candidate satisfies the acceptance contract** |

No release-blocking or lower-severity product defect was found. This was a
fresh verification of the candidate and live deployment; the earlier
deployment-only failure was not assumed to remain valid or repaired.

## Checkout and quality gates

The supplied checkout started clean at the exact candidate SHA. `origin/main`
also resolved to the candidate during verification. Generated `node_modules/`,
`target/`, and `dist/` paths are ignored; no product source was changed.

Environment: Node 22.23.2, npm 10.9.8, rustc/cargo 1.98.0, Playwright 1.58.2
with the factory Chromium.

| Command | Fresh result |
| --- | --- |
| `npm ci` | PASS; 21 packages installed, 22 audited, 0 vulnerabilities |
| `npm audit --audit-level=high` | PASS; 0 vulnerabilities |
| `npm test` | PASS; strict TypeScript check, 4 Rust unit tests, 2 CLI integration tests, doc tests, static budgets, and browser suite |
| `npm run lint` | PASS; Rust formatting and clippy with warnings denied |
| `npm run build` | PASS; release CLI and exact production site written to `dist/site/` |
| `cargo package --manifest-path cli/Cargo.toml` | PASS; 66.3 KiB package, 18.6 KiB compressed, Cargo package verification passed |

The production site build emitted the content-derived service-worker cache
`refp-shell-22baba54b7fd2883` with six shell resources.

## Packaged CLI and real job-to-be-done

The packed crate at
`target/package/release-env-fingerprint-0.1.0` was installed into an empty
Cargo prefix and exercised from a separate empty consumer directory. The
installed binary reported `refp 0.1.0`; `--help` documented the three commands,
JSON mode, arguments, and purpose.

Independent scenarios passed:

- `init --json` created the key and policy with mode 0600. Re-initialization
  returned exit 1 and preserved the existing material.
- Matching production/staging captures compared with exit 0 even when an
  unallowlisted database secret changed but retained its type.
- A seeded candidate with missing, extra/context-only, renamed, type-changed,
  allowlisted resolved-value changes, and a disallowed endpoint host produced
  complete JSON and exit 2. This directly covers the brief's release gate.
- Empty, boolean, integer, number, HTTP URL, JSON, string, multiline, and
  non-UTF-8 values were classified without persisting their bytes.
- Exactly 16 MiB of command output was accepted. Output above 16 MiB, empty
  output, malformed records, duplicate names, invalid names, a blank
  environment label, and a failing approved command returned exit 1 and wrote
  no fingerprint.
- Attempting to reuse an existing output returned exit 1 and preserved its
  SHA-256 (`9d13224e09ca869e6a5fd373a38b0eb54e18ee984e9e0fcb29556c44ddc59c66`).
- Artifact tampering and comparison with another project key were rejected
  with exit 1 before drift was trusted.
- Concurrent captures to separate outputs both succeeded and compared cleanly.
- Machine-readable output remained valid JSON for success, drift, and error
  cases, with documented exit codes 0, 2, and 1 respectively.

## Privacy and security

Seeded database credentials, alternate secret values, a full allowlisted URL,
an endpoint path/query, multiline bytes, non-UTF-8 bytes, and command stderr
containing a sentinel secret were absent from fingerprints, stdout, and error
JSON. Only explicitly allowlisted non-secrets had hashes. Capturing the same
safe value with two project keys produced different hashes, confirming the
project-keyed salt boundary.

The CLI source and resolved dependency tree contain no HTTP/network client, and
no telemetry or analytics path exists. The website made 12 observed requests
across online, update, and offline exercises, all to its own origin. It created
no cookies, localStorage, sessionStorage, or IndexedDB data before or after demo
use. No `Set-Cookie` response was observed.

Live response policy includes a same-origin CSP, HSTS, `nosniff`,
`Referrer-Policy: no-referrer`, and camera/microphone/geolocation denial.

## Deployment identity and response behavior

All ten deployable files rebuilt from the candidate byte-match the live site:
HTML, hashed JS/CSS, JS source map, service worker, WebP, SVG, manifest,
robots.txt, and sitemap. The live HTML SHA-256 is
`070dd146be4c540def006f788c572603d49867f87b1ac98e7f74cc86e486718d`.
The candidate's only change from the deployed repair commit is factory
documentation, so byte identity is the appropriate build-identity proof.

- HTTP redirects to HTTPS with 301; HTTPS returns 200.
- HTML returns `no-cache, must-revalidate`.
- `sw.js` returns `no-cache, no-store, must-revalidate`.
- Hashed JS and CSS return `public, max-age=31536000, immutable`.
- Every observed browser response returned 200 with no failed requests.

## Browser, accessibility, and PWA

Fresh independent Playwright checks ran against the live URL at 1440×900 and
390×844, with an additional 640 px reflow check in the repository suite.

- There is exactly one `h1`, `lang="en"`, a title, one main landmark, and a
  meaningful alt for the only content image.
- Both desktop and mobile have document width equal to viewport width. Primary
  content and actions remain visible; long commands scroll inside their
  designated code region.
- Every visible mobile link and button is at least 44×44 CSS px.
- The first Tab stop is the visible skip link with a 3 px teal focus outline.
  Keyboard traversal reaches every control and skips the header after using the
  skip link, with no trap.
- Keyboard activation produced the seeded drift, announced invalid input in a
  `role="alert"`, retained focus on Compare, and recovered to a matching result.
- `prefers-reduced-motion: reduce` is active: animation/transition duration is
  effectively removed, transform is stationary, and scroll behavior is auto.
- axe-core 4.10.3 reported 0 violations (therefore 0 serious/critical).
- The factory `verify-url.sh` returned HTTP 200 in 709 ms, 0 browser errors,
  correct title/lang, one H1, main present, 0 missing alts, and 0 unlabeled
  buttons.
- Independent listeners observed 0 console errors, page errors, or failed
  requests.

The live service worker controls the page and its content-addressed cache holds
`/`, hashed JS, hashed CSS, the image, icon, and manifest. A registration update
completed against a `no-store` worker. After clearing the browser HTTP cache,
an offline reload initialized the app, showed the offline status, and produced
the seeded five-difference result. The repository's production browser test
also changes served HTML under an already installed worker and confirms that
the next online navigation receives the new release.

## Performance and budgets

| Budget or metric | Result |
| --- | --- |
| Initial JS | 4,646 B uncompressed (limit 200 KiB) |
| CSS | 14,427 B uncompressed (limit 50 KiB) |
| Hero WebP | 178,612 B (limit 300 KiB) |
| Total live transfer | 190,768 B / 186 KiB |
| Lighthouse 13.0.1 mobile | Performance 90, Accessibility 100, Best Practices 100, SEO 100 |
| FCP / LCP | 1.1 s / 1.7 s |
| CLS / TBT | 0 / 400 ms |
| INP | Not available for a synthetic navigation |

The required performance score, LCP, CLS, and asset budgets pass. The demo
interaction is local and returned its result on the next animation frame with
no network work.

## Defects and disposition

No P0, P1, P2, or P3 defect was found. The earlier mobile clipping, lost focus,
undersized targets, stale/offline worker behavior, caching, and accessible-name
findings do not reproduce on this candidate. Registry publication and tagged
prebuilt binaries remain factory release tasks, not candidate defects.
