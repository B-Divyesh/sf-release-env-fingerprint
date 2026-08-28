# Adversarial first-read review 1

- Product: Release Env Fingerprint (`refp`)
- Live URL: <https://release-env-fingerprint.sociobot.in>
- Reviewed: 2026-08-28 UTC
- Source commit: `6ac5933fe60d3bb0862a15f477bf73a57c51045a`
- Viewports: 390 × 844 and 1440 × 900, each in a fresh Chromium context
- Verdict: **FAIL**

The release has four blocking findings. A pass requires zero blocking findings and at most three minor findings.

## Findings, ordered by severity

### B1 — BLOCKING: the first screen does not identify the user or one first action

**Quote:** “Prove config shape. Not secret values.” / “Catch missing, extra, and differently resolved environment variables before deploy. Every artifact is signed. No raw value is written.” / “Install” / “Copy” / “Test the comparison model”.

**Why this loses a first-time visitor:** I can infer that this compares environment configuration, but the screen never says it is for engineers shipping one service through several environments. “Config shape,” “differently resolved,” and “artifact” require prior domain context. The page gives three competing starts: install, copy, or test. Neither viewport contains the required action “Try it with sample data.” On mobile, the install control is visually primary even though installation is not a try-before-setup path.

**Concrete fix:** Use a first screen such as:

> **Compare release configuration without exposing secrets**
>
> For engineers shipping one service across environments, it shows missing, extra, and changed settings before deployment.
>
> **Try it with sample data** — See five sample differences immediately.
>
> Works offline after the first visit · No environment values are stored · Free and open source

Register and test every fact before publishing that replacement.

### B2 — BLOCKING: there is no compliant one-click CLI demo

**Quote:** “Test the comparison model” opens `/#demo`, whose first result says “No comparison yet. Run the seeded example or enter your own variable list.”

**Why this loses or misleads a visitor:** The link reveals two prefilled text areas but does not show a completed result. The visitor must click again to see value. There is no persistent “Demo — sample data, nothing is saved” banner, no “Reset demo,” no “Start for real,” no `/demo` state, and no separate demo namespace. “Clear both” destroys the sample until reload. For this CLI product, `refp demo` and `refp --demo` both exit 2 as unknown arguments, `examples/` is absent, `.factory/demo.md` is absent, and the landing page has static terminal text rather than a recording of the real binary.

The browser model itself did behave safely: comparison made only same-origin requests, placed no user data in cookies, localStorage, sessionStorage, or IndexedDB, and a reload restored the bundled sample. That does not provide the required CLI sandbox.

**Concrete fix:** Ship realistic files under `examples/` and implement `refp demo` so it copies them to a fresh temporary directory, runs the actual capture/compare flow, prints the output location, and never reads or writes project state. Add a real `/demo` entry point that opens with the five differences already rendered and shows the required banner, **Reset demo**, and **Start for real**. Document the command, sample, reset behavior, and namespace in `.factory/demo.md`.

### B3 — BLOCKING: the claims registry is missing and every public claim is unlisted

**Quote:** `.factory/claims.json` does not exist.

**Why this misleads a visitor:** Statements such as “Every artifact is signed,” “No raw value is written,” “No network,” and “The cached demo still works locally” have no required `@claim:<id>` test. A passing general suite cannot tell a verifier which public promise is covered, and several compound promises need separate observable checks.

**Concrete fix:** Add `.factory/claims.json`; give each claim below exactly one tagged sandbox test; split compound sentences so one claim maps to one test. Remove future or subjective statements that cannot be tested. The unlisted-claim inventory appears under “Claims audit.”

### B4 — BLOCKING: routing is a fallback masquerading as product pages and a 404

**Quote:** `/demo`, `/privacy`, `/terms`, and `/does-not-exist-review-1` each return HTTP 200 with the home title “Release Env Fingerprint — prove config shape, not values” and the home page at the top.

**Why this loses or misleads a visitor:** Direct links do not open the named place. Privacy and terms are footer fragments, not pages. An unknown address silently becomes the landing page, so visitors cannot distinguish a bad URL from valid content. Clicking `#demo` and using Back restores scroll, but focus remains on `<body>`; the demo heading is not focused or announced. The sitemap lists only `/`.

**Concrete fix:** Add real `/demo`, `/privacy`, `/terms`, and designed `/404` routes. Give each its own title, one h1, canonical URL, consistent header/footer, and sitemap entry. Return the 404 experience for unknown paths with the platform's correct not-found status where supported. On route changes, focus the new h1 and announce it; verify deep-link reload and Back/Forward restoration.

### M1 — MAJOR: required discovery metadata is incomplete

**Quote:** The root has a 56-character title, an 85-character description, SVG favicon, and theme color, but no canonical link, Open Graph tags, Twitter card, 1200 × 630 social image, or 180 px Apple touch icon.

**Why this matters:** Shared and indexed links do not have an authoritative URL or product-specific preview. Missing route metadata compounds B4.

**Concrete fix:** Add the required canonical, OG, Twitter, and Apple icon metadata. Derive the social image from the existing proof-sheet art and test metadata independently on every route.

### M2 — MAJOR: footer and site skeleton are incomplete

**Quote:** The footer says “© 2026 Sociobot · Param Factory” and links Privacy/Terms to fragments. It does not say “Built by Param Factory” or show a version/build ID.

**Why this matters:** The required handoff identity and build provenance are not available at the bottom of the page, and policy links do not lead to durable pages.

**Concrete fix:** Use real policy links and add “Built by Param Factory” plus version/build ID on every route.

### M3 — MAJOR: several copy elements are vague, jargon-heavy, or not result-naming

**Quote:** “A proof, not another vault.” / “Seed a drift. See the release fail.” / “Helpful in a shell. Stable in a script.” / buttons “Copy” and “Clear both”.

**Why this slows a first read:** These require product context, use metaphors or subjective adjectives, and do not always name the result. The error “Fix the marked list and compare again” is inaccurate because neither input is marked invalid.

**Concrete fix:** Apply the rewrites in “Flagged copy findings,” including **Copy install command**, **Reset demo**, and an error that names and marks the faulty input.

## Cold first read, before scrolling

| Question | 390 px | 1440 px |
|---|---|---|
| What does it do? | I infer that it checks environment-variable differences without saving raw values. “Config shape” and “differently resolved” remain undefined. | Same. The proof-sheet art reinforces comparison but does not clarify the terms. |
| Who is it for? | Cannot answer from the first screen. **Blocking.** | Cannot answer from the first screen. **Blocking.** |
| What should I click first? | Unclear: the primary controls are **Install**, **Copy**, and **Test the comparison model**. **Blocking.** | Unclear for the same reason; **Install** has the strongest treatment. **Blocking.** |

At 390 px, the viewport contains the headline, supporting copy, install command, “Test the comparison model,” and three proof points. At 1440 px it also contains the hero art. Neither first screen names the user or offers “Try it with sample data.” There was no horizontal overflow or console error.

## Copy audit

Counts use whitespace-delimited words; code tokens such as `NAME=value` count as one word. Code blocks are commands/data rather than sentences and are excluded. Hidden and interaction-result prose is included.

### Landing-page sentences

| ID | Words | Exact sentence | Flag |
|---|---:|---|---|
| L01 | 3 | “Prove config shape.” | Jargon; first-screen job is unclear. |
| L02 | 3 | “Not secret values.” | Fragment depends on L01. |
| L03 | 10 | “Catch missing, extra, and differently resolved environment variables before deploy.” | “Differently resolved” is jargon. |
| L04 | 4 | “Every artifact is signed.” | Unlisted claim. |
| L05 | 5 | “No raw value is written.” | Unlisted claim. |
| L06 | 7 | “Keep the secrets where they already live.” | Unlisted privacy claim. |
| L07 | 8 | “Verify only what a release needs to know.” | Vague: it does not name what is verified. |
| L08 | 5 | “A proof, not another vault.” | Metaphor and contextless heading. |
| L09 | 4 | “Run an explicit command.” | “Explicit” does not explain the approval boundary. |
| L10 | 11 | “Values stay in memory while names, types, and presence are classified.” | Jargon and unlisted claim. |
| L11 | 13 | “Bind the artifact and safe non-secret hashes to a project-local key with HMAC-SHA-256.” | Dense jargon; “safe” is undefined. |
| L12 | 13 | “Fail before deploy on shape drift, type changes, safe-value changes, or policy violations.” | Jargon; “safe-value” is inconsistent with “non-secret.” |
| L13 | 3 | “Seed a drift.” | Jargon and contextless heading. |
| L14 | 4 | “See the release fail.” | Does not name the observable result. |
| L15 | 5 | “Paste names or `NAME=value` rows.” | Pass. |
| L16 | 14 | “This teaching demo compares in your browser; it never sends or stores the text.” | Unlisted privacy claim. |
| L17 | 8 | “Use the signed CLI for real release gates.” | “Release gates” is jargon. |
| L18 | 3 | “You are offline.” | Pass. |
| L19 | 6 | “The cached demo still works locally.” | Unlisted offline claim. |
| L20 | 3 | “No comparison yet.” | Pass. |
| L21 | 10 | “Run the seeded example or enter your own variable list.” | Says “run” although another click is still required. |
| L22 | 3 | “Nothing to compare.” | Pass. |
| L23 | 11 | “Add at least one `NAME` or `NAME=value` row to each environment.” | Pass. |
| L24 | 5 | “Rules are reviewed as TOML.” | Passive and unlisted behavior claim. |
| L25 | 6 | “Sensitive values never become policy material.” | “Policy material” is vague; unlisted privacy claim. |
| L26 | 4 | “Say what must match.” | Contextless heading. |
| L27 | 10 | “Exact names and at least one key for required prefixes.” | “Key” conflicts with signing key terminology. |
| L28 | 9 | “Host allowlists run in memory; full URLs are discarded.” | Dense jargon and unlisted privacy claim. |
| L29 | 7 | “Only explicit non-secrets receive project-keyed value hashes.” | Dense jargon and unlisted claim. |
| L30 | 8 | “Every comparison verifies both signatures before reading drift.” | Jargon and unlisted claim. |
| L31 | 4 | “Helpful in a shell.” | Subjective marketing adjective. |
| L32 | 4 | “Stable in a script.” | Unlisted compatibility claim. |
| L33 | 4 | “Make drift fail early.” | Jargon and contextless heading. |
| L34 | 2 | “One binary.” | Unlisted distribution claim. |
| L35 | 3 | “One reviewed policy.” | “Reviewed” is not guaranteed by the product. |
| L36 | 6 | “No account, network, or secret migration.” | Unlisted privacy/dependency claim. |
| L37 | 4 | “Proof for configuration shape.” | Jargon and fragment. |
| L38 | 9 | “Privacy: no analytics, telemetry, uploads, cookies, or local storage.” | Unlisted privacy claim. |
| L39 | 8 | “Terms: provided under the MIT License, without warranty.” | Pass as footer summary; it still needs a real route. |
| L40 | 4 | “Comparison could not run.” | Pass. |
| L41 | 7 | “Fix the marked list and compare again.” | Inaccurate: no list is marked. |
| L42 | 9 | “The names, inferred types, and entered demo values align.” | Unlisted result claim. |
| L43 | 9 | “Run the signed CLI to enforce this in CI.” | Unlisted capability claim. |

No landing sentence exceeds 22 words. The average is below 14 words, but brevity does not resolve the jargon and missing context.

### Landing headings and actions

| Type | Words | Exact label | Result |
|---|---:|---|---|
| Nav | 1 | “Workflow” | Pass. |
| Nav/action | 2 | “Try it” | Flag: use **Try it with sample data**. |
| Nav | 1 | “Reference” | Pass. |
| Nav/action | 1 | “Install” | Flag: use **Install the CLI** and do not make it the demo CTA. |
| Eyebrow | 5 | “Release check / 01 Local-first CLI” | “Local-first” is undefined. |
| h1 | 6 | “Prove config shape. Not secret values.” | Flagged in B1. |
| Action | 4 | “Test the comparison model” | Flag: use **Try it with sample data**. |
| Fact | 2 | “No network” | Ambiguous beside a network-loaded page; unlisted claim. |
| Fact | 2 | “Keyed hashes” | Jargon, not a privacy/offline/price fact. |
| Fact | 2 | “Signed JSON” | Jargon, not a privacy/offline/price fact. |
| Caption | 6 | “Plate A / environment shape — 0 values exposed” | Unlisted quantitative/privacy claim. |
| Context | 4 | “One portable proof across” | “Portable proof” is vague and unlisted. |
| Eyebrow | 5 | “Method / 02 Three controlled steps” | “Controlled” is unexplained. |
| h2 | 5 | “A proof, not another vault.” | Flagged; fails out-of-context test. |
| h3 | 1 | “Capture” | Pass. |
| h3 | 1 | “Sign” | Pass. |
| h3 | 1 | “Compare” | Pass. |
| Eyebrow | 4 | “Bench / 03 Browser-only model” | Pass for a technical audience. |
| h2 | 7 | “Seed a drift. See the release fail.” | Flagged; fails out-of-context test. |
| Label | 2 | “Baseline environment” | Pass. |
| Label | 2 | “Candidate environment” | Pass. |
| Button | 2 | “Compare fingerprints” | Pass: verb names the result. |
| Button | 2 | “Clear both” | Flag: object is unclear and it cannot restore the sample; use **Reset demo**. |
| Eyebrow | 4 | “Rules / 04 Safe invariants” | “Safe invariants” is jargon. |
| h2 | 4 | “Say what must match.” | Flagged; fails out-of-context test. |
| Term | 2 | “Required shape” | “Shape” is jargon. |
| Term | 2 | “Endpoint boundaries” | Vague. |
| Term | 2 | “Safe resolution” | Vague adjective and inconsistent term. |
| Term | 2 | “Artifact trust” | Vague. |
| Eyebrow | 4 | “Runbook / 05 CI ready” | “CI ready” is an unlisted claim. |
| h2 | 8 | “Helpful in a shell. Stable in a script.” | Flagged; subjective and unlisted. |
| Eyebrow | 6 | “Gate / 06 Before the next deploy” | “Gate” is jargon. |
| h2 | 4 | “Make drift fail early.” | Flagged; fails out-of-context test. |
| Button (twice) | 1 | “Copy” | Flag: use **Copy install command**. |
| Button state | 1 | “Copied” | Pass. |
| Button fallback | 2 | “Select text” | Pass. |
| Button state | 1 | “Comparing…” | Pass. |

### README sentences

| ID | Words | Exact sentence | Flag |
|---|---:|---|---|
| R01 | 20 | “Release Env Fingerprint (`refp`) catches configuration drift between local, CI, staging, and production without writing environment values into an artifact.” | Jargon and compound unlisted claims. |
| R02 | 18 | “It is for engineers who need to prove that configuration shape and explicitly safe invariants match before deployment.” | “Configuration shape” and “safe invariants” are jargon. |
| R03 | 8 | “The project is deliberately not a secret manager.” | Pass. |
| R04 | 28 | “It runs an environment export command you explicitly provide, keeps values in memory only, records names and inferred types, and signs the resulting fingerprint with a project-local key.” | **Over 22 words**; four unlisted claims. |
| R05 | 13 | “Only values named in the policy's `non_secret` allowlist may produce a keyed hash.” | Jargon and unlisted claim. |
| R06 | 3 | “Live documentation: https://release-env-fingerprint.sociobot.in” | Pass. |
| R07 | 9 | “Install the single Rust binary directly from the repository:” | Unlisted distribution claim. |
| R08 | 10 | “From a local clone, use `cargo install --path cli` instead.” | Pass. |
| R09 | 9 | “The first tagged release will also publish prebuilt binaries.” | Untestable future promise; remove until true. |
| R10 | 9 | “No registry package is published by this repository worker.” | “Repository worker” is internal language. |
| R11 | 7 | “Create a project key and starter policy.” | Pass. |
| R12 | 12 | “Keep `.refp-key` in your CI secret store and out of version control.” | Pass. |
| R13 | 7 | “Capture a fingerprint from an approved command.” | “Approved” is undefined. |
| R14 | 12 | “The command must emit `NAME=VALUE` records separated by newlines or NUL bytes.” | Pass. |
| R15 | 10 | “`env -0` is preferred because it safely handles embedded newlines.” | Unlisted parsing claim. |
| R16 | 13 | “Run the same capture in another execution context, then compare both signed artifacts:” | “Execution context” and “artifact” are avoidable jargon. |
| R17 | 11 | “Use `--json` on `init`, `capture`, or `compare` for stable machine-readable output.” | Unlisted compatibility claim. |
| R18 | 24 | “Exit codes are `0` for success/no drift, `2` for valid fingerprints with drift or policy violations, and `1` for command, input, or signature errors.” | **Over 22 words**; unlisted behavior claim. |
| R19 | 7 | “`refp init` writes a documented starter file:” | Unlisted behavior claim. |
| R20 | 5 | “`required_names` requires exact variable names.” | Unlisted policy claim. |
| R21 | 9 | “`required_prefixes` requires at least one variable for each prefix.” | Unlisted policy claim. |
| R22 | 5 | “`non_secret` is an explicit allowlist.” | Pass as definition. |
| R23 | 16 | “Only matching variables receive a keyed value hash, so a compare can detect safely resolved-value changes.” | Jargon and unlisted claim. |
| R24 | 12 | “`hosts` maps a variable name to exact hosts or dot-prefixed subdomain suffixes.” | Unlisted policy claim. |
| R25 | 11 | “Host checks run in memory; the URL itself is never stored.” | Unlisted privacy claim. |
| R26 | 21 | “Each fingerprint contains the environment label, capture time, policy digest, variable names/types/presence, optional allowlisted hashes, policy violations, and an HMAC-SHA-256 signature.” | Dense but within cap; unlisted format claim. |
| R27 | 9 | “It never contains the project key or raw values.” | Unlisted privacy claim. |
| R28 | 10 | “Do not pass a shell pipeline as the capture command.” | Pass. |
| R29 | 15 | “Arguments after `--` are executed directly, without a shell, which keeps the approval boundary visible.” | “Approval boundary” is jargon; unlisted execution claim. |
| R30 | 6 | “Requirements: Rust 1.79+ and Node.js 20+.” | Unlisted compatibility claim. |
| R31 | 31 | “`npm test` runs TypeScript checking, Rust unit/integration tests, static site budgets, and the browser regression suite (including mobile bounds and a cold offline reload after the browser HTTP cache is cleared).” | **Over 22 words**; unlisted test-scope claim. |
| R32 | 11 | “`npm run build` builds the release CLI and the static site.” | Unlisted build claim. |
| R33 | 12 | “The deployable site is written to `dist/site/` with `index.html` at that root.” | Unlisted build-output claim. |
| R34 | 4 | “For local site work:” | Pass. |
| R35 | 8 | “Create a registry-ready Rust package without publishing it:” | “Registry-ready” is vague. |
| R36 | 10 | “`refp` has no telemetry, network calls, account, or cloud dependency.” | Unlisted privacy/dependency claim. |
| R37 | 8 | “Treat the project key like a CI secret.” | Pass as guidance. |
| R38 | 14 | “Fingerprints intentionally disclose environment variable names and coarse inferred types; review them before publishing.” | Unlisted disclosure/format claim. |
| R39 | 9 | “See `SECURITY.md` for the threat model and reporting guidance.” | Pass. |
| R40 | 6 | “MIT © 2026 Sociobot (Param Factory)” | Pass. |

README headings: “Release Env Fingerprint” (3), “Install” (1), “Usage” (1), “Policy” (1), “GitHub Actions” (2), “Develop” (1), “Privacy and security” (3), and “License” (1). “Policy” should be **Configuration policy** and “Develop” should be **Develop and test refp** so each remains meaningful out of context.

### Flagged copy findings and proposed rewrites

| Finding | Quote | Proposed rewrite |
|---|---|---|
| C01 | “Prove config shape. Not secret values.” | “Compare release configuration without exposing secrets.” |
| C02 | “Catch missing, extra, and differently resolved environment variables before deploy.” | “Find missing, extra, and changed settings before deployment.” |
| C03 | “A proof, not another vault.” | “Compare configuration without storing secret values.” |
| C04 | “Verify only what a release needs to know.” | “Compare variable names, types, and approved non-secret values.” |
| C05 | “Bind the artifact and safe non-secret hashes to a project-local key with HMAC-SHA-256.” | “Sign each fingerprint with this project's key. Hash only values marked non-secret.” |
| C06 | “Fail before deploy on shape drift, type changes, safe-value changes, or policy violations.” | “Stop deployment when names, types, approved values, or rules differ.” |
| C07 | “Seed a drift. See the release fail.” | “Compare sample environments and see five differences.” |
| C08 | “Use the signed CLI for real release gates.” | “Use the CLI in CI to stop releases when configuration differs.” |
| C09 | “Say what must match.” | “Choose the configuration rules to enforce.” |
| C10 | “Helpful in a shell. Stable in a script.” | “Use documented exit codes in a shell or CI.” |
| C11 | “Make drift fail early.” | “Stop a release when configuration differs.” |
| C12 | “Fix the marked list and compare again.” | “Fix the named line, then compare again.” Also set `aria-invalid` and focus the faulty input. |
| C13 | README R04 (28 words) | “It runs the export command you provide. Values stay in memory while `refp` records names and types. It signs the fingerprint with a project key.” |
| C14 | README R18 (24 words) | “Exit 0 means no drift. Exit 2 means drift or a rule failure. Exit 1 means a command, input, or signature error.” |
| C15 | README R31 (31 words) | “`npm test` checks TypeScript, Rust, site budgets, and browser behavior. Browser checks cover mobile layout and a cold offline reload.” |
| C16 | “The first tagged release will also publish prebuilt binaries.” | Remove until a tagged release and testable download exist. |
| C17 | “No registry package is published by this repository worker.” | “This release is not published to a package registry.” |
| C18 | “Only matching variables receive a keyed value hash, so a compare can detect safely resolved-value changes.” | “Only variables marked non-secret receive a hash. The hash lets comparisons detect changed values.” |
| C19 | “Arguments after `--` are executed directly, without a shell, which keeps the approval boundary visible.” | “`refp` runs arguments after `--` directly, without a shell.” |

### Terminology consistency

| Concept | Terms currently used | Use consistently |
|---|---|---|
| Saved comparison file | artifact, fingerprint, proof, signed JSON | **fingerprint** |
| Compared configuration | config shape, configuration shape, environment shape, required shape | **variable names and types** |
| Difference | drift, shape drift, type change, safe-value change, difference | **difference** in introductory copy; define **drift** once for CLI output |
| Allowed value | safe invariant, safe value, non-secret, explicitly safe invariant | **approved non-secret value** |
| Hashed value | keyed hash, non-secret hash, project-keyed value hash | **keyed hash** after one plain definition |
| Enforcement configuration | rules, policy, policy material, invariants | **policy** for the file; **rule** for one entry |
| Environment name | key, variable, variable name | **variable name**; reserve **key** for the signing key |

## Claims audit

There were no listed claims or claim commands because `.factory/claims.json` is missing. The clean-clone `npm test` result is useful regression evidence but is not a substitute for the required one-test-per-claim mapping.

Every row below is an unlisted-claim finding. “Add test” means add a `claims.json` entry and exactly one test tagged with that proposed ID; otherwise remove the sentence.

| ID | Where | Exact public claim | Concrete fix / observable test |
|---|---|---|---|
| U01 | Landing hero | “Catch missing, extra, and differently resolved environment variables before deploy.” | `@claim:detect-config-differences`: bundled baseline/candidate must report missing, extra, type, and approved-value differences and exit 2. |
| U02 | Landing hero | “Every artifact is signed.” | `@claim:signed-fingerprints`: capture, verify a valid signature, tamper one byte, and confirm rejection. |
| U03 | Landing hero | “No raw value is written.” | `@claim:no-raw-values`: capture sentinel secrets, recursively scan every created file and output stream, and find none. |
| U04 | Landing fact | “No network” | Clarify this as “CLI makes no network requests,” then test the demo command in a network-blocked container. The website itself needs same-origin network on first visit. |
| U05 | Landing fact | “Keyed hashes” | `@claim:keyed-hashes`: verify only approved non-secret values produce HMAC fields and identical values under different project keys differ. |
| U06 | Landing fact | “Signed JSON” | `@claim:signed-json`: parse capture output as JSON and verify its signature. |
| U07 | Hero caption | “0 values exposed” | Reuse `@claim:no-raw-values` only after making this wording exactly match that registered claim. |
| U08 | Landing context strip | “One portable proof across POSIX shell, GitHub Actions, staging, production.” | Split and test supported shell/CI contexts, or replace with the narrower tested platforms. |
| U09 | Workflow | “Keep the secrets where they already live.” | `@claim:no-secret-migration`: demo must accept command output without copying secret values to another store. |
| U10 | Workflow | “Values stay in memory while names, types, and presence are classified.” | `@claim:memory-only-values`: intercept filesystem writes while capturing sentinel values and scan outputs. |
| U11 | Workflow | “Bind the artifact and safe non-secret hashes to a project-local key with HMAC-SHA-256.” | `@claim:hmac-sha256`: inspect the produced algorithm/version and verify with the project key. |
| U12 | Workflow | “Fail before deploy on shape drift, type changes, safe-value changes, or policy violations.” | `@claim:exit-on-difference`: assert exit 2 for each listed difference class. |
| U13 | Demo copy | “This teaching demo compares in your browser; it never sends or stores the text.” | `@claim:browser-local`: intercept requests during edits/compare and inspect all browser storage for sentinel text. |
| U14 | Offline notice | “The cached demo still works locally.” | `@claim:offline-reload`: fresh context, first visit, clear HTTP cache, set offline, reload, compare sample. |
| U15 | Demo | “Local processing only” | Make wording match U13 and test it there, or add a separately scoped network-interception test. |
| U16 | Policy intro | “Rules are reviewed as TOML.” | `@claim:toml-policy`: initialize and parse the generated TOML policy. |
| U17 | Policy intro | “Sensitive values never become policy material.” | `@claim:no-values-in-policy`: initialize/capture sentinel values and scan the policy. |
| U18 | Policy reference | “Exact names and at least one key for required prefixes.” | `@claim:required-name-prefix`: fail separately for a missing exact name and missing required prefix. |
| U19 | Policy reference | “Host allowlists run in memory; full URLs are discarded.” | `@claim:host-policy-private`: enforce allowed/disallowed hosts and scan artifacts for the full URL. |
| U20 | Policy reference | “Only explicit non-secrets receive project-keyed value hashes.” | `@claim:non-secret-only-hashes`: confirm hash presence/absence for approved and secret fields. |
| U21 | Policy reference | “Every comparison verifies both signatures before reading drift.” | `@claim:verify-before-compare`: tamper each side and confirm signature error rather than a drift report. |
| U22 | CLI heading | “Stable in a script.” | Replace with the specific JSON/exit-code guarantees and test those. |
| U23 | Exit reference | “0 — Valid, no drift.” | `@claim:exit-0-match`: matching signed fingerprints exit 0. |
| U24 | Exit reference | “2 — Drift or policy violation.” | `@claim:exit-2-difference`: drift and policy fixtures exit 2. |
| U25 | Exit reference | “1 — Input, command, or signature error.” | `@claim:exit-1-errors`: cover all three error classes. |
| U26 | Exit reference | “`--json` — Machine-readable on every command.” | `@claim:json-every-command`: parse stdout for init, capture, compare success, drift, and errors. |
| U27 | Terminal example | “exit 2 · signatures valid · 0 values persisted” | Test exit, both signatures, and sentinel absence; split the displayed claim if separate tests are required. |
| U28 | Final CTA | “One binary.” | `@claim:single-binary`: build/package and assert the documented install produces one `refp` executable. |
| U29 | Final CTA | “No account, network, or secret migration.” | Split into testable CLI no-account, no-network, and no-secret-write claims. |
| U30 | Footer | “Privacy: no analytics, telemetry, uploads, cookies, or local storage.” | `@claim:site-privacy`: intercept the full flow and inspect cookies/storage; include analytics and upload endpoints in the assertion. |
| U31 | README | “Release Env Fingerprint (`refp`) catches configuration drift between local, CI, staging, and production without writing environment values into an artifact.” | Align with U01/U03 or split the sentence into registered claims. |
| U32 | README | “It is for engineers who need to prove that configuration shape and explicitly safe invariants match before deployment.” | Replace subjective “prove/safe” wording with the specific tested comparison result. |
| U33 | README | “It runs an environment export command you explicitly provide, keeps values in memory only, records names and inferred types, and signs the resulting fingerprint with a project-local key.” | Split into command execution, memory-only, classification, and signature entries/tests. |
| U34 | README | “Only values named in the policy's `non_secret` allowlist may produce a keyed hash.” | Align exactly with U20 and its test. |
| U35 | README install | “Install the single Rust binary directly from the repository.” | `@claim:repository-install`: install in a fresh container and run `refp --help`. |
| U36 | README install | “The first tagged release will also publish prebuilt binaries.” | Remove the future promise until a release artifact exists and a download test can pass. |
| U37 | README install | “No registry package is published by this repository worker.” | Remove internal worker language or verify/document current distribution channels without a product claim. |
| U38 | README usage | “The command must emit `NAME=VALUE` records separated by newlines or NUL bytes.” | `@claim:record-delimiters`: capture newline and NUL fixtures. |
| U39 | README usage | “`env -0` is preferred because it safely handles embedded newlines.” | `@claim:embedded-newlines`: include a value with a newline and confirm one record without disclosure. |
| U40 | README usage | “Use `--json` on `init`, `capture`, or `compare` for stable machine-readable output.” | Align exactly with U26 and test every named command. |
| U41 | README usage | “Exit codes are `0` for success/no drift, `2` for valid fingerprints with drift or policy violations, and `1` for command, input, or signature errors.” | Align wording with U23–U25 or provide a parameterized tagged test. |
| U42 | README policy | “`refp init` writes a documented starter file.” | `@claim:init-files`: run init in an empty temp directory and assert key/policy contents and permissions. |
| U43 | README policy | “`required_names` requires exact variable names.” | Align with U18. |
| U44 | README policy | “`required_prefixes` requires at least one variable for each prefix.” | Align with U18 or give it its own tagged test. |
| U45 | README policy | “Only matching variables receive a keyed value hash, so a compare can detect safely resolved-value changes.” | Align with U20 and add an observable changed-value comparison. |
| U46 | README policy | “`hosts` maps a variable name to exact hosts or dot-prefixed subdomain suffixes.” | `@claim:host-matching`: cover exact, permitted subdomain, sibling, and lookalike hosts. |
| U47 | README policy | “Host checks run in memory; the URL itself is never stored.” | Align exactly with U19. |
| U48 | README format | “Each fingerprint contains the environment label, capture time, policy digest, variable names/types/presence, optional allowlisted hashes, policy violations, and an HMAC-SHA-256 signature.” | `@claim:fingerprint-schema`: validate all fields against a versioned schema. |
| U49 | README format | “It never contains the project key or raw values.” | Align exactly with U03 and also scan for key material. |
| U50 | README security | “Arguments after `--` are executed directly, without a shell, which keeps the approval boundary visible.” | `@claim:no-shell`: pass shell metacharacters and confirm they are literal arguments. |
| U51 | README development | “Requirements: Rust 1.79+ and Node.js 20+.” | Add a compatibility matrix test or state only versions actually exercised in CI. |
| U52 | README development | “`npm test` runs TypeScript checking, Rust unit/integration tests, static site budgets, and the browser regression suite…” | Add a script-composition test only if this public implementation claim is worth keeping; otherwise shorten it to the command. |
| U53 | README development | “`npm run build` builds the release CLI and the static site.” | `@claim:build`: run from a clean clone and assert both artifacts. |
| U54 | README development | “The deployable site is written to `dist/site/` with `index.html` at that root.” | Include this path assertion in U53. |
| U55 | README development | “Create a registry-ready Rust package without publishing it.” | `@claim:cargo-package`: run `cargo package` and inspect the archive. |
| U56 | README privacy | “`refp` has no telemetry, network calls, account, or cloud dependency.” | Split into a network-blocked CLI flow, dependency/source scan for telemetry, and no-auth demo flow. |
| U57 | README privacy | “Fingerprints intentionally disclose environment variable names and coarse inferred types; review them before publishing.” | `@claim:fingerprint-disclosure`: assert names/types are present and values absent in the sample artifact. |

## Demo and sandbox evidence

- Visible mobile action tested: “Test the comparison model.” It navigated to `/#demo`.
- First post-click state: realistic baseline and candidate text were present, but output was “No comparison yet.”
- Second click, **Compare fingerprints**: reported five differences (`NODE_ENV`, `PUBLIC_API_ORIGIN`, `LOG_LEVEL`, `PUBLIC_API_URL`, `DEBUG`).
- **Clear both** emptied both text areas. There was no reset control; reload restored the original sample.
- Banner, Reset, Start for real: all absent.
- Browser storage after compare/clear: no cookies, localStorage, sessionStorage, or IndexedDB. The service worker had one app-shell cache.
- Network interception: all requests were same-origin; compare caused no external request.
- Offline: after first load/service-worker control and HTTP-cache clearing, an offline reload showed “You are offline. The cached demo still works locally.” The comparison still produced five differences.
- CLI temp directory: `refp demo` exited 2 with “unrecognized subcommand 'demo'”; `refp --demo` exited 2 with “unexpected argument '--demo'”; no files were created.

## Structure, links, accessibility, and identity

| Check | Result | Evidence |
|---|---|---|
| Root title pattern | Pass | “Release Env Fingerprint — prove config shape, not values”, 56 characters. |
| Per-route titles | Fail | All tested paths use the home title because there are no routes. |
| One h1 / headline | Pass structurally | One h1; its copy fails B1. |
| Description / lang / main / alt | Pass | Description 85 chars; `lang=en`; one main; no missing image alt. |
| Canonical / OG / Twitter / Apple icon | Fail | All absent. |
| Favicon / theme color | Pass | SVG favicon and `#f3ebd8`. |
| `robots.txt` / sitemap | Partial | Both return 200; sitemap lists only `/`. |
| Designed 404 | Fail, blocking | Random path returns home with 200. |
| Deep links / Back / focus | Fail | Hash Back restored scroll; direct `/demo` did not open the demo; focus stayed on body; no route announcement. |
| Dead links | Pass for current links | Every hash target exists; external Source returned 200. Privacy/Terms are structurally wrong, not dead. |
| Header/footer consistency | Fail by absence | There are no real secondary routes; footer lacks required build identity. |
| Security headers | Pass | CSP, HSTS, `nosniff`, no-referrer, and permissions policy present. |
| Keyboard/touch/mobile | Pass in tested flow | Skip link first, comparison keyboard-operable, 44 px targets, no 390/640 px overflow. |
| Automated accessibility | Pass | `npx @axe-core/cli` found 0 violations; worker verify reported title/lang/h1/main/alt and no console errors. |
| Reduced motion | Pass | Existing browser test confirmed stationary hero and automatic scroll under reduced motion. |
| First-load budget | Pass | Built JS 4,646 B, CSS 14,427 B, hero 178,612 B. |
| Visual identity | Pass | Warm paper, risograph proof sheet, registration marks, mono type, and red/teal print offsets are product-specific and not a generic SaaS layout. Provenance is documented in `.factory/design.md`. |

## Verification commands and outcomes

- Clean local clone: `/tmp/refp-review-clone-4DmMH0/repo` at the reviewed commit.
- `npm ci && npm test`: **pass**. Rust: 6 tests passed. Static budgets passed. Browser checks reported desktop/390/640 px, keyboard/focus, offline/update, privacy, reduced motion, console, and axe passed.
- `/opt/fleet/lib/verify-url.sh https://release-env-fingerprint.sociobot.in <temp-dir>`: **pass**; HTTP 200, no console errors, title/lang/h1/main/alt checks passed.
- `npx @axe-core/cli https://release-env-fingerprint.sociobot.in ... --exit`: **pass**, 0 violations.
- Live route probe: `/`, `/demo`, `/privacy`, `/terms`, and a random missing path all returned 200 with the home title; **fail** for routing/404.
- Claim commands from `.factory/claims.json`: **not runnable because the required file is absent**; this is B3, not a pass.

## Verdict

**FAIL.** Resolve B1–B4 and register/test or remove every unlisted claim before another acceptance review. The passing implementation checks show a sound core comparison and unusually good baseline accessibility, but the product is not yet clear, tryable, or claim-auditable under the required first-visit contract.
