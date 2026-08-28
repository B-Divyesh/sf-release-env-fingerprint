# Copy audit — polish round 1

Whitespace-delimited counts are shown below. Code and short interface labels
are excluded. No sentence exceeds 22 words. None uses a banned marketing word.

## Landing page

| Words | Sentence | Claim coverage |
| ---: | --- | --- |
| 6 | Compare release configuration without exposing secrets. | `detect-config-differences`, `no-raw-values` |
| 16 | For engineers shipping one service across environments, it shows missing, extra, and changed settings before deployment. | `detect-config-differences` |
| 5 | See five sample differences immediately. | `sample-differences` |
| 6 | Works offline after the first visit. | `offline-reload` |
| 5 | Demo data is not saved. | `browser-demo-private` |
| 5 | Free under the MIT License. | `mit-license` |
| 6 | Compare configuration without storing secret values. | `no-raw-values` |
| 14 | Capture a fingerprint, sign it with your project key, then compare it before deployment. | `signed-fingerprints`, `detect-config-differences` |
| 6 | Run the environment command you choose. | `direct-command` |
| 9 | Save a signed fingerprint with variable names and types. | `signed-fingerprints`, `fingerprint-schema` |
| 7 | Stop a release when the fingerprints differ. | `exit-2-difference` |
| 5 | See the comparison before installing. | action, not a claim |
| 9 | The isolated sample opens with five differences already marked. | `sample-differences` |
| 6 | Choose the configuration rules to enforce. | instruction, not a claim |
| 9 | The policy lists required variables and approved non-secret values. | `required-rules`, `approved-value-hashes` |
| 7 | Require a variable by its exact name. | `required-rules` |
| 8 | Require at least one variable with a prefix. | `required-rules` |
| 6 | Hash only values you mark non-secret. | `approved-value-hashes` |
| 7 | Run the sample without touching project files. | `cli-demo-isolated` |
| 11 | `refp demo` creates an isolated temporary folder with the bundled sample. | `cli-demo-isolated` |
| 6 | Compare release settings without exposing secrets. | `detect-config-differences`, `no-raw-values` |

## Demo and legal routes

| Words | Sentence | Claim coverage |
| ---: | --- | --- |
| 6 | The completed sample is ready below. | `sample-differences` |
| 6 | Nothing you change here is saved. | `browser-demo-private` |
| 12 | Change either list, then compare the names, types, and approved non-secret values. | `detect-config-differences` |
| 8 | This site has no analytics or third-party requests. | `browser-demo-private` |
| 9 | The browser sample uses no cookies or browser storage. | `browser-demo-private` |
| 6 | Leaving demo mode discards your edits. | `browser-demo-private` |
| 6 | Fingerprints contain variable names and types. | `fingerprint-schema` |
| 7 | They do not contain raw environment values. | `no-raw-values` |
| 9 | Release Env Fingerprint is free under the MIT License. | `mit-license` |
| 6 | The software is provided without warranty. | MIT license text |
| 7 | Review your policy and fingerprints before deployment. | guidance, not a claim |
| 9 | The address does not match a Release Env Fingerprint page. | 404 explanation |

## README check

All prose sentences were checked after the rewrite. The longest sentence is
20 words. Claim-like statements carry one or more `@claim:<id>` markers and
match `.factory/claims.json`. Future release promises and internal worker
language from review 1 were removed.

## Terminology

| Concept | One term used |
| --- | --- |
| Saved comparison file | fingerprint |
| Compared input | release configuration or release settings |
| Mismatch | difference |
| Allowed value | approved non-secret value |
| Hashed value | project-keyed hash |
| Signing material | project key |
| Enforcement file | policy |
| Environment entry | variable name |
