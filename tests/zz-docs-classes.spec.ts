import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Every class the docs pages use must be defined somewhere.
 *
 * This is the guard for the defect the user found by looking at the page.
 * The sidebar demos referenced .sb-brand, .sb-topbar, .sb-content and a dozen
 * more; the ContextMenu demos referenced .ctx-zone. None of them existed in
 * any stylesheet. Every demo rendered as unstyled markup.
 *
 * Nothing caught it, and nothing could have: a missing CSS class is not an
 * error at any layer. The page mounts, Vue warns about nothing, the build
 * succeeds, the section headings are all present and the props tables are
 * right. It is wrong only to a person looking at it — 34 class names across
 * the menu pack, and the way it surfaced was a screenshot.
 *
 * Read from disk rather than through an import, because a stylesheet imported
 * under vitest is stubbed to an empty string — which would make this pass by
 * finding nothing, the same inert-guard failure zz-hidden-reset was caught by.
 */

const DOCS = path.join(__dirname, '..', '..', 'apex-ui-docs', 'src');
const app = fs.readFileSync(path.join(DOCS, 'App.vue'), 'utf8');
const styles = [
  fs.readFileSync(path.join(DOCS, 'docs.css'), 'utf8'),
  fs.readFileSync(path.join(__dirname, '..', 'src', 'styles', 'apex-ui.css'), 'utf8'),
].join('\n');

/**
 * Static class attributes only.
 *
 * A :class binding is an expression — `:class="ok ? 'a' : 'b'"` — and picking
 * names out of one means guessing which strings are class names. Those are
 * left alone rather than reported as false findings; the static attributes are
 * where the demos actually live.
 */
function classesIn(src: string): Set<string> {
  const out = new Set<string>();
  for (const m of src.matchAll(/(?<![:@\w-])class="([^"{}]+)"/g)) {
    for (const c of m[1].split(/\s+/)) if (c) out.add(c);
  }
  return out;
}

describe('every class the docs use is defined', () => {
  const used = [...classesIn(app)].sort();

  it('found classes to check', () => {
    /* A regex that stopped matching would report zero undefined classes,
       which is the false all-clear this guard exists to prevent. */
    expect(used.length).toBeGreaterThan(150);
  });

  it('none is defined nowhere', () => {
    /* A class named as a selector in the page itself is a hook, not styling:
       the StyleClass demos mark their targets with .sc-win and .sc-el purely
       so the directive can find them. Those are accounted for by the line
       that points at them. */
    const asHook = (c: string) => app.includes(`'.${c}'`) || app.includes(`".${c}"`);
    /* Matched to a boundary, not as a substring. `styles.includes('.ctx-zone')`
       is satisfied by `.ctx-zone-REMOVED`, so deleting the rule this guard
       exists to catch left it passing — which is how the check was first
       proved worthless. */
    const defined = (c: string) =>
      new RegExp(`\\.${c.replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&')}(?![\\w-])`).test(styles);
    const missing = used.filter((c) => !defined(c) && !asHook(c));
    expect(missing, 'used in App.vue, defined in no stylesheet').toEqual([]);
  });
});
