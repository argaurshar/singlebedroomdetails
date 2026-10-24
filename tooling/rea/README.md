# REA browser analysis tooling

This is isolated analysis tooling, not an application runtime dependency. Install the locked
published CLI with `npm ci --prefix tooling/rea --ignore-scripts --no-audit --no-fund` from the
repository root. Keep package-integrity/TLS checks enabled. Node 24.19.0 was verified for this release.

Run `tooling/rea/node_modules/.bin/rea capture-browser-scenario scenario.json --format json`.
Read the local REA skill and the installed command's help/schema first. Explicitly select
`environment.reduced_motion: "no-preference"` when observing normal animation; REA defaults to
reduced motion. Capture the reduced-motion route separately.

MCP registration and native engines are not installed by these manifests. Browser analysis uses
the existing `/usr/bin/chromium`. External reference access still requires its hostname to be
allowed by the cloud environment. The CLI cannot bypass that restriction.

Current baseline Evidence and the pending reference analysis are documented in
`docs/ARCHITECTURAL_STUDY_REVISION.md`.
