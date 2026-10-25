# Build, review and hosting

## Standalone app

`dist/library.zip` contains the seven-preset library, preserved cabinet and bedroom pages, licence and opening instructions.
`dist/library.html` is the current lead study, including JavaScript, CSS and geometry toolkit.
Extract the ZIP and open `index.html` in a browser that allows local HTML files.
`dist/index.html` is identical and serves as the hosting entry point. The earlier bedroom remains
at `dist/bedroom.html` and `dist/room-anatomy.html`. Keep `dist/ANATOMY-LICENSE.txt` with redistributed files.
There are no runtime API keys, fonts, images, packages or CDN dependencies.

The managed cloud browser blocks `file://` navigation. Local HTTP browser acceptance establishes
that the application runs without required external requests; direct file-opening acceptance in
another browser remains outstanding. This is recorded separately from successful app tests.

## Source and commands

```sh
npm ci              # pinned build-only bundler
npm run build       # deterministic single-file build
npm test            # pure model, scene contracts and deterministic geometry
npm run test:library # launches its own temporary HTTP server and Chromium
python3 tests/library-export.py # video and standalone SVG validation
npm run serve       # internal development server, port 4173
npm run test:study  # revision controls; requires the running development server
python3 tests/visual.py # dense motion review against that running server
```

Use Node 24 (minimum 22). Browser tests use Python Playwright and `/usr/bin/chromium`;
`docs/SETUP.md` records their verified versions. See `docs/ANIMATION_FIX_QA.md` for current animation results and `docs/LIBRARY_QA.md` for the original library validation.
`src/spec.mjs`, `model.mjs`, `scene.mjs`, `study-model.mjs`, `study-scene.mjs` and `controller.mjs` keep physical data, calculation,
geometry and interaction separate. The bundler inlines them and the pinned Anatomy core.

## GitHub Pages

The user selected GitHub-only hosting. `.github/workflows/pages.yml` builds and deploys the site
with GitHub Actions. No external hosting account, custom domain or application secret is required.
The previous Vercel configuration has been removed.

One-time activation:

1. Open repository **Settings → Pages**.
2. Under **Build and deployment**, set **Source → GitHub Actions**.
3. PRs #1–#3 are already merged. Review the `fix/library-animation-order` revision, wait for its build
   check to pass, and merge the new pull request into `main` when satisfied.
4. Open **Actions → GitHub Pages** and wait for the build and deploy jobs to succeed.
   If the initial deploy ran before Pages was enabled, rerun the failed job or use **Run workflow**
   on `main` after enabling it.
5. Open the deployment URL shown by GitHub. The expected default project address is
   **https://argaurshar.github.io/singlebedroomdetails/**. It is not claimed live until deployment succeeds.

The workflow runs model/scene tests and builds on pull requests. Only `main` can upload the Pages
artifact and deploy; pull requests do not publish. The deploy job alone receives `pages: write`
and `id-token: write`. Only `dist/` is uploaded, so project source and vendored skills are not included
in the deployed site. Future pushes to `main` automatically rebuild and redeploy.

The standalone document uses inline scripts/styles and no root-relative asset URLs, so it works
under the `/singlebedroomdetails/` project prefix without a base-path rewrite. The built files are served directly; no Jekyll processing is involved.

The cloud proxy rejects the GitHub API and the live project URL with HTTP 403, so this agent cannot enable repository
Pages settings or inspect deployment runs here. The workflow is locally validated; this library branch’s GitHub Actions execution and live deployment remain unverified here.
The user confirmed the prior cabinet deployment works. If GitHub shows
Pages is unavailable for the repository's visibility/plan, follow its indicated eligibility requirement.

## Reusable cloud configuration

The environment draft stores an install script that builds and runs Node tests, plus startup
instructions for this checkout and its internal browser checks. Saving a draft does not publish
an environment snapshot. Review/save those settings and publish the environment when you want
future cloud tasks to restore the prepared tools and filesystem. This publication is separate
from publishing the web application.


The library's dimension editor uses an inline Blob Web Worker. If a local-file browser blocks
workers, use `python3 -m http.server --directory dist` and open the served page. The existing
presets do not require the worker to open. Video records a local canvas with no microphone,
screen-sharing permission or upload. Local browser storage is optional; JSON is the portable
backup for saved designs. The ZIP includes links to the original studies and licence.
