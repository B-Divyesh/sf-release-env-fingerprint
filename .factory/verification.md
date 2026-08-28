# Independent product verification — FAIL

| Field | Evidence |
| --- | --- |
| Candidate | `a21135d267e757fb70d3f1d6c6fcd6a629762b5c` |
| Live URL | <https://release-env-fingerprint.sociobot.in/> |
| Work order | `release-env-fingerprint-verify-2` |
| Verified | 2026-08-28 UTC |
| Result | **FAIL — do not promote this candidate** |

The signed CLI is useful and its core release-gate behavior passed independent
testing. The live deployment also byte-matches the candidate build. The release
nevertheless fails the acceptance contract: primary content/actions are clipped
at 390 px, and the advertised PWA offline/update behavior is not dependable.

## Defects

### P1 — mobile layout clips primary content and actions

At a 390×844 viewport, the document reports no horizontal overflow only because
`main` has `overflow: hidden`. Its actual `scrollWidth` is 882 px against a 390
px `clientWidth`.

- `.hero-copy` is 861.7 px wide and ends at x=881.7.
- The `h1` ends at x=740; the lede ends at x=678.9; the hero art ends at
  x=704.9.
- Both install boxes are 500 px wide. Their Copy buttons occupy x=430–518, so
  they are entirely outside the 390 px viewport.
- The final CTA's child is also 861.7 px wide.
- An element-boundary audit found 15 descendants clipped outside the viewport.
- The full-page 390 px screenshot visibly truncates the hero and final CTA.

The same hidden 882 px main width remains at a 640 px CSS viewport (the usual
reflow proxy for 200% zoom on a 1280 px display). This violates the mobile,
responsive, touch, and 200% text-resize requirements and makes a primary action
unavailable to touch users.

Reproduction:

1. Open the live URL with a 390×844 viewport.
2. Inspect `main.scrollWidth`, `.hero-copy.getBoundingClientRect()`, and either
   `.copy-button.getBoundingClientRect()`.
3. Observe 882, right edge 881.7, and button x=430–518 respectively while the
   visible viewport ends at x=390.

### P1 — PWA shell fails a clean offline reload and can serve stale releases

After a first live visit and service-worker activation, `refp-shell-v1`
contained only `/`, `proof-sheet.webp`, `fingerprint.svg`, and
`manifest.webmanifest`. It did not contain the hashed JS or CSS.

After clearing only the browser HTTP cache, switching offline, and reloading:

- `/assets/index-Uo0UJGj-.js` and `/assets/style-BrnuDsrm.css` failed with
  `net::ERR_FAILED` and console errors;
- clicking Compare did nothing; the result remained “No comparison yet.”

The apparent ordinary offline reload passes only while the separate HTTP cache
still happens to hold those assets. This contradicts the page's “cached demo
still works locally” claim.

Update handling also fails. The worker uses the fixed cache name
`refp-shell-v1` and cache-first responses. In a controlled localhost test using
the exact candidate build and service worker, the server changed from an HTML
marker `v1` to `v2`; `registration.update()` plus reload still returned `v1`.
An HTML-only deployment for which `sw.js` bytes do not change can therefore
leave existing clients on the old release indefinitely.

### P2 — Compare drops keyboard focus

The Compare handler disables the focused button while work runs. Chromium then
moves focus to `BODY`; focus is not restored to the button, error, or result.
After a duplicate-variable error, a keyboard-only user needed 19 Tab presses to
reach the baseline field again. The error is correctly announced with
`role="alert"`, but recovery is unnecessarily disruptive.

### P2 — several mobile targets are below 44×44 CSS px

At 390 px, measured visible targets included:

- brand/home link: 102.8×36 px;
- Source: 46.8×20.1 px;
- Privacy: 54.6×20.1 px;
- Terms: 39×20.1 px.

This misses the supplied 44×44 touch-target baseline.

### P2 — hashed assets are not cached immutably

The live HTML, hashed JS/CSS, image, manifest, and service worker all return the
same `Cache-Control: public, must-revalidate, max-age=30`. Hashed assets should
have long-lived immutable caching under the supplied performance contract.

### P3 — visible brand label and accessible name do not match

Lighthouse's `label-content-name-mismatch` audit identifies the header brand:
visible text is `REFP`, while `aria-label="Release Env Fingerprint home"` does
not contain that visible label. This can make speech-input activation fail even
though Lighthouse's weighted accessibility score remains 100.

## Clean-checkout gates

Testing ran in a separate detached worktree created directly at the candidate
SHA. The original checkout remained unchanged until this report was written.

| Command | Result |
| --- | --- |
| `npm ci` | PASS; 19 packages installed, 0 audit vulnerabilities |
| `npm test` | PASS; 4 unit, 2 CLI integration, doc tests, site budgets, project browser suite |
| `cargo fmt --all -- --check` | PASS |
| `cargo clippy --workspace --all-targets -- -D warnings` | PASS |
| `npm audit --audit-level=high` | PASS; 0 vulnerabilities |
| `npm run build` | PASS; exact production release binary and `dist/site/` produced |
| `cargo package --manifest-path cli/Cargo.toml` | PASS; 66.1 KiB, 18.5 KiB compressed, package verification passed |

The repository has no configured lint or TypeScript type-check script and no
`tsconfig`. An exploratory direct `tsc --noEmit` invocation is therefore not a
project gate; it reports that `ImportMeta.dirname` in `site/vite.config.ts`
cannot be typed because Node typings are not installed. The exact Vite build
succeeds.

Environment: Node 22.23.2, npm 10.9.8, rustc/cargo 1.98.0, Playwright 1.58.2
with the supplied Chromium.

## Packaged CLI and end-to-end job

The generated crate was installed from
`target/package/release-env-fingerprint-0.1.0` into an empty Cargo prefix. The
installed binary reported `refp 0.1.0` and provided documented global options,
subcommands, exit meanings, and JSON mode.

Independent consumer scenarios all passed:

- `init --json` created key/policy files at mode 0600; a repeated init returned
  1 without changing the key.
- Matching signed captures compared with exit 0.
- Missing/extra variables, an integer→string change, and allowlisted resolved
  changes produced complete JSON and exit 2.
- Empty, boolean, integer, number, URL, JSON, and string types were inferred as
  documented.
- Required-name/prefix and disallowed-host failures returned exit 2.
- Empty output, malformed records, duplicate names, invalid names, blank
  environment labels, existing output, command failure, and output above 16
  MiB returned exit 1 and left no artifact.
- Tampering and a wrong project key were rejected before comparison.
- Two concurrent captures to separate outputs succeeded.
- Newline-containing and ordinary secret values, a database URL, and endpoint
  path/query were absent from artifact/stdout/stderr. Command stderr containing
  a seeded secret was suppressed.
- Non-allowlisted secrets had no hash. Explicit non-secrets did, and the same
  safe value produced different hashes under different project keys.
- No networking crate/API is present in the CLI source/dependency graph.

These cases cover normal release gating, seeded missing/renamed/context-only
drift, boundary input, invalid input, recovery, signature trust, POSIX command
execution, CI JSON output, and the brief's no-raw-values guarantee.

## Live deployment identity and browser evidence

`origin/main` resolved to the candidate SHA. The live HTML and every deployable
file checked had the same SHA-256 as the clean candidate production build:

- HTML; hashed JS and CSS;
- proof-sheet image and fingerprint SVG;
- web manifest and service worker;
- robots.txt and sitemap.xml.

The live HTML hash was
`b37645fee90d08c35c38c55315ace2ea258192d25abb67fb2cced82c2d841a4f`.
HTTP redirects to HTTPS and the HTTPS page returns 200.

Normal online runs at 1440×900 and 390×844 had:

- no console/page errors or failed requests;
- no third-party or post-interaction requests (four same-origin initial
  requests only);
- no cookies, Web Storage, or IndexedDB before or after entering demo values;
- one `h1`, `lang=en`, a main landmark, title, and no missing image alt;
- zero axe violations (thus zero serious/critical findings);
- a first-focus skip link with a visible 3 px, high-contrast outline;
- working duplicate-input error, correction, and drift results by keyboard;
- reduced motion with automatic scrolling disabled, a 0.01 ms animation, and
  no transform.

The CSP is restrictive and same-origin-only. Live headers also include HSTS,
`X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, and a locked
camera/microphone/geolocation Permissions Policy. No `Set-Cookie` header was
observed.

## Performance and budgets

Built uncompressed assets: 4,580 B JS, 14,203 B CSS, and 178,612 B hero WebP;
all pass the supplied per-asset budgets. Compressed live transfers were 3,777 B
HTML, 2,097 B JS, 3,918 B CSS, and 178,612 B image.

Lighthouse 13.0.1 mobile against the live URL:

| Category/metric | Result |
| --- | --- |
| Performance | 95 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| FCP / LCP | 1.0 s / 1.7 s |
| CLS / TBT | 0 / 250 ms |
| Total transfer | 186 KiB |
| INP | Not available in the synthetic navigation |

Performance thresholds pass, except for the separate immutable-caching defect
above. The product code was not modified because this was an independent QA
work order.
