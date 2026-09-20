# .harness — the library in a real browser

A one-page Vite app that mounts `ApexEditor` from **`../dist`** — the exact
artifact an application loads — so a feature can be checked in Chromium
rather than in happy-dom, which does no layout and no pointer handling.

    npx vite .harness --config vite.config.ts --port 8933 --strictPort

Then drive it with Playwright (see the probes under the session scratchpad,
e.g. `imgresize.mjs`). Point `main.js` at `../src/index.ts` instead to test
the source before a build.

Written for N/025, where the image resize handles worked in every test and
were invisible in the application: the harness proved the library correct
in three minutes, which moved the search to the app and found a stale
browser cache. Not part of the package build.
