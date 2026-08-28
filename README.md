# Release Env Fingerprint

Release Env Fingerprint (`refp`) catches configuration drift between local,
CI, staging, and production without writing environment values into an
artifact. It is for engineers who need to prove that configuration shape and
explicitly safe invariants match before deployment.

The project is deliberately not a secret manager. It runs an environment
export command you explicitly provide, keeps values in memory only, records
names and inferred types, and signs the resulting fingerprint with a
project-local key. Only values named in the policy's `non_secret` allowlist may
produce a keyed hash.

Live documentation: <https://release-env-fingerprint.sociobot.in>

## Install

Build the single Rust binary from source:

```sh
cargo install --path cli
refp --help
```

The first tagged release will also publish prebuilt binaries. No registry
package is published by this repository worker.

## Usage

Create a project key and starter policy. Keep `.refp-key` in your CI secret
store and out of version control.

```sh
refp init --key .refp-key --policy refp.toml
```

Capture a fingerprint from an approved command. The command must emit
`NAME=VALUE` records separated by newlines or NUL bytes. `env -0` is preferred
because it safely handles embedded newlines.

```sh
refp capture \
  --environment staging \
  --key .refp-key \
  --policy refp.toml \
  --output staging.refp.json \
  -- env -0
```

Run the same capture in another execution context, then compare both signed
artifacts:

```sh
refp compare \
  --key .refp-key \
  --baseline production.refp.json \
  staging.refp.json
```

Use `--json` on `init`, `capture`, or `compare` for stable machine-readable
output. Exit codes are `0` for success/no drift, `2` for valid fingerprints
with drift or policy violations, and `1` for command, input, or signature
errors.

### Policy

`refp init` writes a documented starter file:

```toml
version = 1
required_names = ["DATABASE_URL", "NODE_ENV"]
required_prefixes = ["PUBLIC_"]

[non_secret]
names = ["NODE_ENV", "PUBLIC_API_ORIGIN"]
prefixes = []

[hosts]
PUBLIC_API_ORIGIN = ["api.example.com", ".example.internal"]
```

- `required_names` requires exact variable names.
- `required_prefixes` requires at least one variable for each prefix.
- `non_secret` is an explicit allowlist. Only matching variables receive a
  keyed value hash, so a compare can detect safely resolved-value changes.
- `hosts` maps a variable name to exact hosts or dot-prefixed subdomain
  suffixes. Host checks run in memory; the URL itself is never stored.

Each fingerprint contains the environment label, capture time, policy digest,
variable names/types/presence, optional allowlisted hashes, policy violations,
and an HMAC-SHA-256 signature. It never contains the project key or raw values.

### GitHub Actions

```yaml
- name: Build refp
  run: cargo install --path cli
- name: Capture release environment
  env:
    REFP_KEY_B64: ${{ secrets.REFP_KEY_B64 }}
  run: |
    printf '%s' "$REFP_KEY_B64" > .refp-key
    chmod 600 .refp-key
    refp capture --environment github-hosted --key .refp-key \
      --policy refp.toml --output ci.refp.json -- env -0
- name: Compare with expected release shape
  run: refp compare --key .refp-key --baseline expected.refp.json ci.refp.json
```

Do not pass a shell pipeline as the capture command. Arguments after `--` are
executed directly, without a shell, which keeps the approval boundary visible.

## Develop

Requirements: Rust 1.79+ and Node.js 20+.

```sh
npm install
npm test
npm run build
```

`npm test` runs the Rust unit/integration tests and the site checks.
`npm run build` builds the release CLI and the static site. The deployable site
is written to `dist/site/` with `index.html` at that root. For local site work:

```sh
npm run dev
npm run build:site
```

Create a registry-ready Rust package without publishing it:

```sh
cargo package --manifest-path cli/Cargo.toml
```

## Privacy and security

`refp` has no telemetry, network calls, account, or cloud dependency. Treat the
project key like a CI secret. Fingerprints intentionally disclose environment
variable names and coarse inferred types; review them before publishing. See
[SECURITY.md](SECURITY.md) for the threat model and reporting guidance.

## License

MIT © 2026 Sociobot (Param Factory)
