# Copy audit — polish round 2

Whitespace-delimited counts are shown below. Code, data rows, eyebrow labels,
and navigation labels are excluded from sentence counts. No sentence exceeds
22 words. No sentence uses a banned marketing word.

## Landing page

| Words | Sentence | Claim coverage |
| ---: | --- | --- |
| 6 | Compare release settings without exposing secrets. | `detect-config-differences`, `no-raw-values` |
| 16 | For engineers shipping one service across environments, it shows missing, extra, and changed settings before deployment. | `detect-config-differences` |
| 5 | See five sample differences immediately. | `sample-differences` |
| 6 | Works offline after the first visit. | `offline-reload` |
| 5 | Demo data is not saved. | `browser-demo-private` |
| 5 | Free under the MIT License. | `mit-license` |
| 7 | Compare release settings without storing secret values. | `no-raw-values` |
| 14 | Capture a fingerprint, sign it with your project key, then compare it before deployment. | `signed-fingerprints`, `detect-config-differences` |
| 6 | Run the environment command you choose. | `direct-command` |
| 9 | Save a signed fingerprint with variable names and types. | `signed-fingerprints`, `fingerprint-schema` |
| 7 | Stop a release when the fingerprints differ. | `exit-2-difference` |
| 5 | See the comparison before installing. | Explanatory copy |
| 9 | The isolated sample opens with five differences already marked. | `sample-differences` |
| 7 | Choose the release setting rules to enforce. | Instruction |
| 9 | The policy lists required variables and values marked non-secret. | `required-rules`, `approved-value-hashes` |
| 7 | Require a variable by its exact name. | `required-rules` |
| 8 | Require at least one variable with a prefix. | `required-rules` |
| 6 | Hash only values you mark non-secret. | `approved-value-hashes` |
| 7 | Run the sample without touching project files. | `cli-demo-isolated` |
| 11 | `refp demo` creates an isolated temporary folder with the bundled sample. | `cli-demo-isolated` |
| 7 | Recorded from the real `refp demo` command. | `exit-2-difference`, recording freshness test |
| 5 | The temporary path is shortened. | Explanatory copy |
| 6 | Compare release settings without exposing secrets. | `detect-config-differences`, `no-raw-values` |

## Demo, error, and legal routes

| Words | Sentence | Claim coverage |
| ---: | --- | --- |
| 8 | Edit the sample or restore it at any time. | `browser-demo-private` |
| 7 | Compare production with a candidate release. | `sample-differences` |
| 6 | The five differences are computed below. | `sample-differences` |
| 7 | Edit either environment to test another release. | Instruction |
| 6 | You are offline after the first visit. | `offline-reload` |
| 4 | Edit the sample environments. | Instruction |
| 8 | Compare variable names, types, and values marked non-secret. | `detect-config-differences` |
| 7 | Sample data stays in this page. | `browser-demo-private` |
| 4 | Comparison could not run. | Error heading |
| 8 | Fix the named line, then compare again. | Error recovery |
| 8 | This site has no analytics or third-party requests. | `browser-demo-private` |
| 9 | The browser sample uses no cookies or browser storage. | `browser-demo-private` |
| 6 | Leaving demo mode discards your edits. | `browser-demo-private` |
| 6 | Fingerprints contain variable names and types. | `fingerprint-schema` |
| 7 | They do not contain raw environment values. | `no-raw-values` |
| 9 | Release Env Fingerprint is free under the MIT License. | `mit-license` |
| 6 | The software is provided without warranty. | MIT license text |
| 7 | Review your policy and fingerprints before deployment. | Guidance |
| 9 | The address does not match a Release Env Fingerprint page. | 404 explanation |

## Headings and actions

- The six-word `h1` starts with the job: “Compare release settings without
  exposing secrets.”
- Workflow headings name their objects: “Capture release settings,” “Sign the
  fingerprint,” and “Compare environments.”
- The first action is “Try it with sample data.” Its adjacent sentence names
  the result.
- The persistent navigation action is “Open sample comparison.”
- Demo controls are “Reset demo” and “Start for real.”

## README check

Every README prose sentence was checked after the round-two rewrite. The
longest sentence has 18 words. Claim-like statements carry one or more
`@claim:<id>` markers and match `.factory/claims.json`. The GitHub Actions
instructions use one idea per sentence.

## Terminology

| Concept | One term used |
| --- | --- |
| Compared inputs | release settings |
| Saved comparison file | fingerprint |
| Mismatch | difference |
| Allowed value | value marked non-secret |
| Signing material | project key |
| Enforcement file | policy |
| Environment entry | variable name |
