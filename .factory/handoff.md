# Release Env Fingerprint — adversarial review 2 handoff

## Outcome

Review 2 is complete at source commit `c407bee` and is recorded in
`.factory/review-2.md`. The verdict is **FAIL**: three blocking and eight minor
findings remain. No product code was changed.

The blocking issues are the working demo being below the first viewport plus
the missing real CLI recording, incomplete social metadata on the 404, and the
unresolved vague “Try sample” action.

## Verification

Clean clone `/tmp/refp-review2-clean-2QbXqu/repo` passed:

    npm ci
    npm test
    npm run lint
    npm run build

All 17 commands in `.factory/claims.json` were also run separately and passed.
The build produced `target/release/refp` and `dist/site`; JavaScript measured
17,157 bytes, or 6.14 KB gzip.

Live checks covered fresh 390 × 844 and 1440 × 900 contexts, demo compute/edit/
reset/discard, storage and network interception, offline reload, route status,
metadata, links, focus and Back behavior, console output, and axe. The worker
URL verifier passed. A standalone CLI demo in an empty temp directory exited 2
with five differences, created six files only in its printed OS temp directory,
and left the invocation directory empty.

## Known gaps and next steps

See F-2-1 through F-2-11 in `.factory/review-2.md`. Address every finding and
repeat the full review from a new clean clone. First put a computed sample
result above the fold on `/demo` and add a self-hosted recording of `refp demo`.
