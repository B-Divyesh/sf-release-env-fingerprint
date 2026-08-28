# Release Env Fingerprint

Compare release configuration without exposing secrets. It is for engineers
shipping one service through several environments.

Open the one-click browser sample:

https://release-env-fingerprint.sociobot.in/?demo=1

## Install the CLI

    cargo install --git https://github.com/B-Divyesh/sf-release-env-fingerprint --bin refp
    refp --help

From a local clone:

    cargo install --path cli

## Try the bundled sample

    refp demo

The command creates a fresh temporary directory, copies the shipped sample
files, captures both fingerprints, and compares them. It never reads your
current project directory. The sample exits 2 because it contains five
differences. The command prints the temporary directory path.

## Compare your release configuration

    refp init --key .refp-key --policy refp.toml
    refp capture --environment staging --key .refp-key --policy refp.toml --output staging.refp.json -- env -0
    refp compare --key .refp-key --baseline production.refp.json staging.refp.json

Use a policy to name required variables and approved non-secret values. The
CLI signs every fingerprint. Fingerprints do not record raw environment values.

## Product promises and tests

- The bundled sample reports five differences. @claim:sample-differences
- Fingerprints are signed. @claim:signed-fingerprints
- Fingerprints do not record raw environment values. @claim:no-raw-values
- Browser demo sample data is not saved. @claim:browser-demo-private
- The browser sample works offline after the first visit. @claim:offline-reload
- The project is free under the MIT License. @claim:mit-license

The claim registry is .factory/claims.json. Run one claim with:

    npm run test:claims -- @claim:sample-differences

## Develop and verify

    npm ci
    npm test
    npm run lint
    npm run build

The build writes the static site to dist/site. Preview the site with:

    npm run dev

Create the package without publishing it:

    cargo package --manifest-path cli/Cargo.toml

## Privacy and security

Review a fingerprint before sharing it because it includes variable names and
inferred types. See SECURITY.md for the threat model.

## License

MIT © 2026 Sociobot (Param Factory)
