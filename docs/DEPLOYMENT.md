# Build, review and hosting

## Standalone app

`dist/room-anatomy.zip` contains the standalone HTML, licence and opening instructions.
`dist/room-anatomy.html` is the complete application, including JavaScript, CSS and geometry toolkit.
Download it and open it in a browser that allows local HTML files. `dist/index.html` is identical
and serves as the hosting entry point. Keep `dist/ANATOMY-LICENSE.txt` with redistributed files.
There are no runtime API keys, fonts, images, packages or CDN dependencies.

The managed cloud browser blocks `file://` navigation. Local HTTP browser acceptance establishes
that the application runs without required external requests; direct file-opening acceptance in
another browser remains outstanding. This is recorded separately from successful app tests.

## Source and commands

```sh
npm run build       # deterministic, dependency-free single-file build
npm test            # pure model, scene contracts and deterministic geometry
npm run test:browser # launches its own temporary HTTP server and Chromium
npm run serve       # internal development server, port 4173
python3 tests/visual.py # dense motion review against that running server
```

Use Node 24 (minimum 22). Browser tests use Python Playwright and `/usr/bin/chromium`;
`docs/SETUP.md` records their verified versions. See `docs/QA.md` for actual results and limitations.
`src/spec.mjs`, `model.mjs`, `scene.mjs` and `controller.mjs` keep physical data, calculation,
geometry and interaction separate. The bundler inlines them and the pinned Anatomy core.

## Vercel preparation

No existing hosting provider was configured. `vercel.json` sets:

- Build command: `npm run build`
- Output directory: `dist`
- Framework: Other/static
- Security response headers; no secret requirements

No deployment has been created. Codex Cloud is a development environment, not permanent app hosting.
To deploy after review, connect this repository in your Vercel account, choose the feature branch
for a preview, and select Node 24. Enable Deployment Protection before starting any preview that
must stay private. Confirm the account/plan supports that protection before deploying. Public
production deployment and merging into `main` require the user's authorization in this conversation.

## GitHub review

Work is on `feat/room-anatomy`. The default branch remains unchanged. The exact PR text is in
`docs/PR_DESCRIPTION.md`. The cloud proxy rejects requests to `api.github.com` with HTTP 403,
so authenticated GitHub API operations cannot currently create a PR here. Use the repository's
compare page to open a PR from this branch once pushed; no additional code work is required for that.

## Reusable cloud configuration

The environment draft stores an install script that builds and runs Node tests, plus startup
instructions for this checkout and its internal browser checks. Saving a draft does not publish
an environment snapshot. Review/save those settings and publish the environment when you want
future cloud tasks to restore the prepared tools and filesystem. This publication is separate
from publishing the web application.
