# Release Env Fingerprint

Compare release settings across environments without recording raw values.
It is for engineers shipping one service through local, CI, staging, and
production.

Open the isolated browser sample:

https://release-env-fingerprint.sociobot.in/?demo=1

It immediately shows five differences and saves no edits.
`@claim:sample-differences` `@claim:browser-demo-private`

## Install the CLI

    cargo install --git https://github.com/B-Divyesh/sf-release-env-fingerprint --bin refp
    refp --help

From a local clone:

    cargo install --path cli

The repository installs one `refp` executable with working help.
`@claim:repository-install`

## Try the bundled sample

    refp demo

The command creates a fresh temporary workspace without changing project
files. It exits 2 because the sample fingerprints have five differences.
`@claim:cli-demo-isolated` `@claim:exit-2-difference`

For a single JSON document, run:

    refp --json demo

`@claim:json-output`

## Compare release settings

    refp init --key .refp-key --policy refp.toml
    refp capture --environment staging --key .refp-key --policy refp.toml --output staging.refp.json -- env -0
    refp compare --key .refp-key --baseline production.refp.json staging.refp.json

`refp` runs the command after `--` directly without shell expansion.
`@claim:direct-command`

The CLI finds missing, extra, type, and approved non-secret value differences.
It exits 2 when the sample fingerprints differ.
`@claim:detect-config-differences` `@claim:exit-2-difference`

## Configuration policy

The policy enforces exact required variable names and required prefixes.
It accepts exact hosts and approved subdomains without recording full URLs.
Only approved non-secret values receive a project-keyed hash.
`@claim:required-rules` `@claim:host-rules` `@claim:approved-value-hashes`

Each fingerprint has variable names, inferred types, a schema identifier, and
a signature. Tampering is rejected. Raw environment values are not recorded.
`@claim:fingerprint-schema` `@claim:signed-fingerprints`
`@claim:no-raw-values`

## Product promises and tests

Every public promise is registered in [.factory/claims.json](.factory/claims.json).
Run one claim from a clean checkout with:

    npm ci
    npm run test:claims -- @claim:sample-differences

The browser sample works offline after its first visit. The project is free
under the MIT License. `@claim:offline-reload` `@claim:mit-license`

## Develop and test refp

    npm ci
    npm test
    npm run lint
    npm run build

The build produces `target/release/refp` and the static site in `dist/site`.
`@claim:build-artifacts`

Preview the built site with `npm run preview`. Deploy the contents of
`dist/site` as a static site. Create a package without publishing it with:

    cargo package --manifest-path cli/Cargo.toml

## Privacy and security

The site has no analytics or third-party requests. Browser demo edits use no
cookies or browser storage. `@claim:browser-demo-private`

Review fingerprints before sharing them because they include variable names
and types. `@claim:fingerprint-schema`

See [SECURITY.md](SECURITY.md) for the threat model and reporting guidance.

## License

Free under the [MIT License](LICENSE). `@claim:mit-license`
