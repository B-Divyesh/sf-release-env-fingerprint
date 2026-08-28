# Demo sandbox

Browser demo: https://release-env-fingerprint.sociobot.in/?demo=1 or /demo. It
loads the bundled baseline and candidate sample and immediately renders five
differences. The persistent banner says “Demo — sample data, nothing is
saved.” Reset demo restores the bundled strings. Start for real leaves demo
mode and discards the in-page strings.

The browser demo keeps state only in the current DOM. It uses no cookies,
localStorage, sessionStorage, IndexedDB, account, or network request after the
site shell. Demo mode is selected by ?demo=1; it has no shared storage
namespace because no browser storage is used.

CLI demo: run refp demo. It creates a new refp-demo-* directory in the
operating system temporary directory, copies the CLI examples baseline,
candidate, and policy files, then invokes the normal capture and compare functions. It
does not inspect the current directory or write project files. The command
prints the directory path; remove that temporary directory when done.
