import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Every --apex-* the docs name must be a variable that actually exists.
 *
 * This is the guard for the defect that AF2-249 walked into. Renaming a
 * variable family is two edits in two repos — the stylesheet that reads it and
 * the docs that document it — and nothing tied them together. With
 * `--apex-tree-row-fg` reinstated in registry.ts after the CSS had moved to
 * `--apex-treesel-`, the whole suite passed: 40 files, 1066 tests, green. A
 * documented variable that resolves to nothing is not an error at any layer.
 * The page mounts, the table renders, the name is simply a lie.
 *
 * The same gap had already bitten once: var-defaults.ts was 50 variables
 * behind the stylesheet, because the generator is run by hand and forgetting
 * it costs nothing at the time.
 *
 * Two directions, both cheap:
 *   - a variable the docs NAME must exist in the library
 *   - a key var-defaults.ts CARRIES must exist in the library
 *
 * Deliberately NOT checked: whether a variable is ever declared. The library's
 * pattern is `var(--apex-x, fallback)` where the fallback IS the default and
 * the consumer declares the variable to override it (§4.2). 315 variables are
 * read and never declared by design, so a "declared somewhere" check would
 * fail on almost the whole library and be turned off within a day.
 *
 * Read from disk rather than through an import, for the reason
 * zz-docs-classes gives: a stylesheet imported under vitest is stubbed to an
 * empty string, and a guard that finds nothing passes.
 */

const UI = path.join(__dirname, '..', 'src');
const DOCS = path.join(__dirname, '..', '..', 'apex-ui-docs', 'src');

function walk(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const NAME = /--apex-[a-z0-9]+(?:-[a-z0-9]+)*/g;

/**
 * A family mention names no variable.
 *
 * The docs write `--apex-dp-*` when they mean the family, and the bare
 * `--apex-dp` left behind by the name regex exists nowhere. Strip the wildcard
 * forms before matching, or the guard reports a dozen findings that are all
 * prose.
 */
function namesIn(src: string): Set<string> {
  return new Set(src.replace(/--apex-[a-z0-9-]*\*/g, '').match(NAME) ?? []);
}

/**
 * Components count, not just stylesheets.
 *
 * ApexTreeNode.ts sets --apex-treesel-indent from a template literal, and
 * several controls write their variables through :style. Scanning only
 * apex-ui.css and tokens.css reports those as undefined.
 */
const real = new Set<string>();
for (const dir of ['styles', 'components', 'core']) {
  for (const f of walk(path.join(UI, dir))) {
    for (const n of namesIn(fs.readFileSync(f, 'utf8'))) real.add(n);
  }
}

const registry = namesIn(fs.readFileSync(path.join(DOCS, 'registry.ts'), 'utf8'));
const defaults = namesIn(fs.readFileSync(path.join(DOCS, 'var-defaults.ts'), 'utf8'));

describe('every --apex-* the docs name exists in the library', () => {
  it('found variables to check', () => {
    /* A regex that stopped matching would report zero findings, which is the
       false all-clear this guard exists to prevent. */
    expect(real.size).toBeGreaterThan(400);
    expect(registry.size).toBeGreaterThan(250);
    expect(defaults.size).toBeGreaterThan(400);
  });

  it('registry.ts names none that does not exist', () => {
    const missing = [...registry].filter((v) => !real.has(v)).sort();
    expect(missing, 'documented in registry.ts, defined nowhere in apex-ui').toEqual([]);
  });

  it('var-defaults.ts carries none that does not exist', () => {
    /* Catches the stale generated file: rename a variable, forget to re-run
       scripts/var-defaults.mjs, and the old key sits here for ever. */
    const missing = [...defaults].filter((v) => !real.has(v)).sort();
    expect(missing, 'in var-defaults.ts, defined nowhere in apex-ui — re-run scripts/var-defaults.mjs').toEqual([]);
  });
});
