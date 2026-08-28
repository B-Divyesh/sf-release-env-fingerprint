# Release Env Fingerprint — build handoff

## What shipped

- Rust 0.1.0 single-binary CLI (`refp`) with `init`, `capture`, and `compare`.
- Direct, no-shell execution of an approved environment-export command with
  newline and NUL-delimited input support and a 16 MiB safety limit.
- Signed JSON fingerprints containing names, inferred types, presence, policy
  digest, and optional project-keyed hashes only for explicitly allowlisted
  non-secrets. Raw values are never serialized or printed.
- HMAC-SHA-256 signature verification before comparison; exit codes 0/1/2 and
  JSON output for CI automation.
- TOML rules for exact required names, required prefixes, HTTP(S) endpoint host
  allowlists, and non-secret names/prefixes.
- Static Vite documentation at `dist/site/` with a fully local comparison demo,
  drift/empty/error/offline states, keyboard support, responsive 390 px layout,
  PWA shell caching, CSP/caching config, and no analytics or external assets.
- Original 1200×800 risograph proof-sheet hero generated with the factory image
  deployment and optimized to a 178,612-byte WebP. Prompt and provenance are in
  `.factory/design.md`.
- README, changelog, security model, MIT license, design thesis, test suite, and
  ready-to-package Cargo metadata.

## Run and verify

```sh
npm install
npm test
npm run build
cargo clippy --workspace --all-targets -- -D warnings
cargo package --manifest-path cli/Cargo.toml
```

The exact production build is `npm run build`; it creates the optimized binary
at `target/release/refp` and the deployable site with `dist/site/index.html` at
its root. Registry publishing is intentionally not performed by this worker.

Verification completed on 2026-08-28:

- Rust: 4 unit + 2 CLI integration tests passed; doc tests passed.
- Browser E2E: seeded drift, empty, validation error, offline notice, keyboard
  skip link, 390 px overflow, and console checks passed.
- Axe 4.10.3: 0 serious or critical violations.
- Factory `verify-url.sh`: HTTP 200, load 539 ms, 0 console/page errors, one H1,
  `lang=en`, main landmark present, 0 missing alt attributes, 0 unlabeled buttons.
- Lighthouse 13 mobile: Performance 99, Accessibility 100, Best Practices 100,
  SEO 100; LCP 2.105 s, CLS 0, total blocking time 0 ms. INP was not available
  for the synthetic no-interaction navigation; the browser interaction suite
  completed without blocking.
- Transfer budgets: 4,580 B initial JS, 14,203 B CSS, 178,612 B hero image;
  no runtime fonts or third-party requests.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- `cargo package`: 66.0 KiB package, 18.5 KiB compressed, verification passed.

## Known gaps and next steps

- Prebuilt platform binaries and a tagged GitHub release are not created here;
  the repository is installable with Cargo today. The factory owns publishing.
- GitHub Actions is documented and the CLI behavior is integration-tested, but
  no hosted CI run was available inside this disposable worker.
- Host policies intentionally cover HTTP(S) URL variables only. Arbitrary
  connection-string parsing and cloud secret-manager integrations are explicit
  non-goals for v1.
