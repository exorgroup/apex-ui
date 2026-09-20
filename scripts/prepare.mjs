/**
 * The safety net for a git install — and, in the normal case, deliberately nothing.
 *
 * ## Why this is conditional
 *
 * `dist/` is COMMITTED to this repository. That is the whole distribution model: consumers
 * install from a GitHub tag, npm checks the tree out, and the built files are simply there.
 * No build on their machine, no devDependencies, nothing to authenticate against a registry.
 *
 * npm runs `prepare` after installing a git dependency, and it installs this package's
 * devDependencies in order to do so. A `prepare` that always built would therefore drag vite,
 * vitest, the whole ProseMirror chain and everything else into every consuming project — on
 * every install, of every project — which is exactly the cost committing `dist` exists to
 * avoid. So the normal path here does nothing at all.
 *
 * ## Then why have it
 *
 * Because "the files are simply there" is an assumption, and this is the one place that can
 * check it. If `dist` is missing or half-written — a bad merge, someone who added `dist` to
 * their global gitignore, a shallow archive — the alternative is an install that SUCCEEDS and
 * hands the consumer a package whose every entry point is a missing file. That failure surfaces
 * later, somewhere else, as an unresolvable import.
 *
 * Rebuilding is the better answer, and if it cannot rebuild it fails here, in the install, with
 * the reason attached.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

/* Every path `package.json` promises: the two bundles, the stylesheet, and the types. */
const REQUIRED = [
  'dist/apex-ui.js',
  'dist/apex-ui.umd.cjs',
  'dist/apex-ui.css',
  'dist/index.d.ts',
];

const missing = REQUIRED.filter((f) => {
  const p = resolve(f);
  return !existsSync(p) || statSync(p).size === 0;
});

if (!missing.length) {
  /* The expected case. Silent by design — this runs on every `npm install` in the repo too. */
  process.exit(0);
}

console.warn(
  `apex-ui: dist is incomplete (${missing.join(', ')}) — building it.\n`
  + '  This should not happen from a tagged install: dist is committed. If you are seeing it\n'
  + '  in CI or a deploy, something stripped the built files before npm got to them.',
);

const build = spawnSync('npm run build', { shell: true, stdio: 'inherit' });

if (build.status !== 0) {
  console.error(
    '\napex-ui: dist was missing and could not be rebuilt.\n'
    + '  The package would install with every entry point pointing at a file that is not there,\n'
    + '  so this fails here instead — an install that succeeds into a broken package is worse.',
  );
  process.exit(1);
}
