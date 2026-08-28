# Release Env Fingerprint — independent QA handoff

## Verdict: PASS

Candidate `bb83541d8b923c08412ff1567610d8ea27092201` passes independent product
verification at <https://release-env-fingerprint.sociobot.in/> for work order
`release-env-fingerprint-verify-3`. No P0–P3 defect was found. The detailed
evidence is in `.factory/verification-3.md`.

## What was verified

- Clean install, audit, strict typecheck, Rust unit/integration/doc tests,
  formatting, clippy, exact release build, static/browser suite, Cargo package,
  and clean-prefix installation all pass.
- The packaged `refp 0.1.0` handles matching and drifted release environments,
  policy failures, malformed and boundary input, tampering, wrong keys,
  concurrency, stable JSON, documented exit codes, and recovery correctly.
- Secret-bearing values and command stderr do not leak. Hashes exist only for
  explicit non-secrets and differ by project key. No CLI network client or
  telemetry path exists.
- All ten deployable files byte-match the live deployment; live HTML SHA-256 is
  `070dd146be4c540def006f788c572603d49867f87b1ac98e7f74cc86e486718d`.
- Desktop, 390 px mobile, keyboard/focus, reduced motion, axe, console/errors,
  privacy/storage, same-origin requests, HTTPS/security headers, cache policy,
  service-worker update behavior, and cold offline reload pass.
- Lighthouse mobile: 90 Performance, 100 Accessibility, 100 Best Practices,
  100 SEO; FCP 1.1 s, LCP 1.7 s, CLS 0, TBT 400 ms, 186 KiB transferred.

## Reproduce

```sh
npm ci
npm audit --audit-level=high
npm test
npm run lint
npm run build
cargo package --manifest-path cli/Cargo.toml
cargo install --path target/package/release-env-fingerprint-0.1.0 --root /tmp/refp-consumer --locked
```

The deployment root is `dist/site/`. Registry publication is deliberately not
performed by this worker.

## Known gaps / next steps

No product gap blocks release. INP is unavailable from a navigation-only
Lighthouse run; the local demo interaction was separately exercised. Tagged
releases and prebuilt platform binaries remain factory publishing work.
