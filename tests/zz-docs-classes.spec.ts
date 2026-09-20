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

/**
 * App.vue AND every demo file.
 *
 * This read App.vue alone, which was right while every page lived in it. The
 * stages have always been separate files, so their classes were never checked;
 * AF2-250 made that a real hole rather than a small one, because the nine data
 * controls put their stages and their example sections under demos/ by design.
 * A guard that stops covering what moved out of the file it watches is worse
 * than no guard, because the count still looks healthy.
 */
function vueFilesIn(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) vueFilesIn(p, out);
    else if (e.name.endsWith('.vue')) out.push(p);
  }
  return out;
}

const demoSources = vueFilesIn(path.join(DOCS, 'demos')).map((f) => fs.readFileSync(f, 'utf8'));

const app = [
  fs.readFileSync(path.join(DOCS, 'App.vue'), 'utf8'),
  ...demoSources,
].join('\n');

/**
 * A demo file may style itself.
 *
 * ContainerStage carries its own <style> block and defines cstage__pane there.
 * Counting only the two stylesheets reported those as defined nowhere, which
 * is a false finding — and a guard that cries wolf gets the file added to an
 * ignore list, which is how a real one gets missed later.
 */
const styleBlocks = demoSources
  .flatMap((s) => [...s.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]));

const styles = [
  fs.readFileSync(path.join(DOCS, 'docs.css'), 'utf8'),
  fs.readFileSync(path.join(__dirname, '..', 'src', 'styles', 'apex-ui.css'), 'utf8'),
  ...styleBlocks,
].join('\n');

/**
 * Static class attributes only.
 *
 * A :class binding is an expression — `:class="ok ? 'a' : 'b'"` — and picking
 * names out of one means guessing which strings are class names. Those are
 * left alone rather than reported as false findings; the static attributes are
 * where the demos actually live.
 */
/**
 * A code sample is text, not markup.
 *
 * The DataView "Building an item template" section shows the reader the HTML
 * they would write, escaped inside <pre v-pre>. Those `class="product__body"`
 * strings are never applied to an element, so requiring a rule for them is a
 * false finding — and a guard that reports things that are not wrong is a
 * guard someone adds an ignore list to. The <pre>'s OWN class is kept: that
 * one really is on a rendered element.
 */
function stripCodeSamples(src: string): string {
  return src.replace(/(<pre[^>]*>)[\s\S]*?<\/pre>/g, '$1</pre>');
}

function classesIn(src: string): Set<string> {
  const out = new Set<string>();
  for (const m of src.matchAll(/(?<![:@\w-])class="([^"{}]+)"/g)) {
    for (const c of m[1].split(/\s+/)) if (c) out.add(c);
  }
  return out;
}

describe('every class the docs use is defined', () => {
  const used = [...classesIn(stripCodeSamples(app))].sort();

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
