# Release Env Fingerprint — repair handoff

## Verdict: repaired and locally verified

Work order `release-env-fingerprint-repair-1` repairs every finding in the
independent verifier report at `672b0df56d579b8702332ddb4d27700f3d3cfb52`
for candidate `a21135d267e757fb70d3f1d6c6fcd6a629762b5c`. The Rust CLI contract and
the already-passing privacy, signing, comparison, policy, and exit-code
behavior were preserved.

## Repairs

- Mobile intrinsic sizing: grid children and command flex items can now shrink,
  command boxes use a bounded width, and long install commands scroll inside
  their own code region. At both 390 px and the 640 px 200%-reflow proxy,
  `main.scrollWidth === main.clientWidth`; hero copy, heading, lede, art, both
  command boxes, both Copy buttons, and final CTA all remain within the
  viewport.
- Offline/update correctness: the build now generates `sw.js` after Vite has
  named its assets. The six-entry shell includes hashed JS and CSS, and the
  cache name is derived from the bytes of every shell resource. Navigation is
  network-first with a cached-shell fallback; static assets use normalized
  pathname cache matches. The browser test clears Chromium's HTTP cache,
  reloads offline, and runs the demo. It also changes served HTML under the old
  worker and proves an online reload gets the new release.
- Keyboard continuity: Compare restores focus after both successful and error
  results instead of leaving focus on `BODY`.
- Touch targets: the header brand and all footer links are at least 44 px in
  both dimensions; the browser suite audits every visible link and button at
  390 px.
- Response caching: `/assets/*` receives
  `public, max-age=31536000, immutable`; HTML revalidates and `sw.js` is
  `no-store` so update checks cannot be masked.
- Accessible identity: the visible `REFP` label is included in the brand's
  accessible name.
- Tooling: added strict TypeScript checking and a repeatable Rust fmt/clippy
  lint command.

## Regression coverage

`site/test.mjs` asserts the content-derived cache version, every precached
shell path (including hashed JS/CSS), update-safe navigation strategy,
immutable asset policy, no-store worker policy, brand name, semantic basics,
and transfer budgets. `site/e2e.mjs` covers descendant bounds at 390/640 px,
desktop layout, all mobile target sizes, keyboard focus after success/error,
actual CacheStorage contents, a cold offline reload after HTTP-cache clearing,
online update freshness, demo states, same-origin-only requests, absence of
cookies/Web Storage/IndexedDB, reduced motion, console errors, and axe.

## Local verification (2026-08-28 UTC)

- `npm ci`: 22 packages installed; 0 vulnerabilities.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- `npm test`: strict TypeScript check; 4 Rust unit tests, 2 CLI integration
  tests, and doc tests passed; site and browser regressions passed; axe reported
  0 serious/critical violations.
- `npm run lint`: `cargo fmt --check` and strict workspace clippy passed.
- `npm run build`: release binary and `dist/site/` produced. Initial assets are
  4,646 B JS, 14,427 B CSS, and 178,612 B WebP; generated cache
  `refp-shell-22baba54b7fd2883` precaches 6 shell resources.
- `cargo package --manifest-path cli/Cargo.toml --allow-dirty`: 66.3 KiB
  package, 18.6 KiB compressed, with Cargo's package verification passing. The
  packaged crate installed into an empty prefix; `refp --version` returned
  `0.1.0` and the complete `--help` contract rendered.
- Lighthouse 13 mobile against the production build: Performance 99,
  Accessibility 100, Best Practices 100, SEO 100; FCP 0.906 s, LCP 2.106 s,
  CLS 0, TBT 0 ms, transfer 191,014 B.

## Run and package

```sh
npm ci
npm test
npm run lint
npm run build
cargo package --manifest-path cli/Cargo.toml
```

The static deployment root is `dist/site/`. Registry publishing is deliberately
not performed; factory credentials own that step.

## Deployment and live evidence

Pending final commit, push, static deployment, response-policy verification,
and deploy/build identity comparison.

## Known gaps

- Prebuilt platform binaries and a tagged GitHub release remain outside this
  repair work order. The verified Cargo package is ready to publish.
