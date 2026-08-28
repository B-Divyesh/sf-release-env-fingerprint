# Demo sandbox

Browser demo: https://release-env-fingerprint.sociobot.in/?demo=1 or `/demo`.
Both URLs open a dedicated sample screen and immediately render five computed
differences above the editors. The result and named production/candidate
environments fit in the first 390 × 844 and 1440 × 900 viewports. The sticky
banner says “Demo — sample data, nothing is saved.”
Reset demo restores both bundled lists and recomputes the result. Start for
real leaves demo mode, discards edits, and opens the CLI install section.

The browser demo keeps its namespace in the current DOM only. It uses no
cookies, localStorage, sessionStorage, IndexedDB, or account. Comparing and
resetting make no requests. The service worker requests same-origin static
files only. Demo mode is selected by `?demo=1`; real data is never read.

CLI demo: run `refp demo`. It creates a new `refp-demo-*` directory in the
operating system temporary directory. It copies the baseline, candidate, and
policy examples, then invokes the normal capture and comparison code. It does
not inspect the current directory or write project files. The command prints
the directory path; remove that temporary directory when done. Run
`refp --json demo` for one JSON document with the same result and path.

The landing page includes `site/public/refp-demo.svg`, a captioned terminal
recording generated from the real command output. Run `npm run record:demo` to
regenerate it. `npm run recording:check` fails when the recording and CLI
output differ. The temporary path is shortened in the recording.
