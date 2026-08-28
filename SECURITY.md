# Security

Release Env Fingerprint never intentionally writes raw environment values. It
does read command output into process memory while classifying entries. Secret
entries store only their names, inferred types, and presence; explicitly
allowlisted non-secret entries additionally store a project-keyed hash.

Fingerprints reveal variable names and coarse types. Do not publish them unless
those names are safe to disclose. Keep `.refp-key` secret and rotate it by
recapturing all trusted baselines with `refp init --force`.

To report a vulnerability, open a private security advisory in the GitHub
repository. Do not include secrets or production fingerprint keys.
