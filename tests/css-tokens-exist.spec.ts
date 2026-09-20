import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Every custom property the stylesheet READS is one it can get — N/025c.
 *
 * A CSS variable that does not exist fails in the worst possible way:
 * `var(--nope)` makes the WHOLE declaration invalid at computed-value
 * time, so `border: 2px solid var(--nope)` is not a black border, it is
 * NO border. The element is still there, still the right size, still
 * `opacity: 1` — and invisible.
 *
 * Not hypothetical. The image resize grips shipped with
 * `background: var(--surface-1)` and `border: 2px solid var(--accent)`,
 * neither of which is a token here (they are `--bg-surface` and
 * `--accent-primary`). Every unit test passed. A real browser driven
 * through the real application reported four handles at opacity 1. The
 * screen showed nothing, three times, and the fourth round looked at the
 * screenshot of the passing probe instead of its numbers.
 *
 * This first run found three more of the same, all pre-existing: the
 * crop tool's zoom buttons, the editor's image inputs and table grid,
 * and — the telling one — the "missing alt text" warning, which was
 * painted in the ordinary text colour and so was not a warning at all.
 *
 * happy-dom computes no styles, so no test here can assert appearance.
 * This is the next best thing, and it is strong: a name that cannot
 * resolve is a bug whatever it is used for.
 */

const ROOT = 'src';
const SHEET = readFileSync(join(ROOT, 'styles/apex-ui.css'), 'utf8');
const TOKENS = readFileSync(join(ROOT, 'styles/tokens.css'), 'utf8');

/** Every `.vue`/`.ts` source, flat. */
function sources(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) sources(path, out);
    else if (/\.(vue|ts)$/.test(entry.name)) out.push(readFileSync(path, 'utf8'));
  }
  return out;
}

/**
 * Where a token can legitimately come from.
 *
 * Declared in the tokens file, declared anywhere in the stylesheet
 * itself (most component-level properties are), or written onto an
 * element at runtime — a `:style` binding or `setProperty`, which is how
 * a value only the component knows (a percentage, a pixel offset, a
 * column count) reaches CSS.
 */
function defined(): Set<string> {
  const out = new Set<string>();

  for (const css of [TOKENS, SHEET]) {
    for (const m of css.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)) out.add(m[1]);
  }
  for (const source of sources(ROOT)) {
    for (const m of source.matchAll(/['"](--[a-zA-Z0-9-]+)['"]\s*:/g)) out.add(m[1]);
    for (const m of source.matchAll(/setProperty\(\s*['"](--[a-zA-Z0-9-]+)['"]/g)) out.add(m[1]);
  }

  return out;
}

/** Every `var(--name)` read WITHOUT a fallback, with its line. */
function readsWithoutFallback(): { name: string; line: number }[] {
  const out: { name: string; line: number }[] = [];

  SHEET.split('\n').forEach((text, i) => {
    for (const m of text.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)\s*([,)])/g)) {
      /* A fallback keeps the declaration valid whatever happens to the
         token, so those are nobody's emergency. */
      if (m[2] === ')') out.push({ name: m[1], line: i + 1 });
    }
  });

  return out;
}

describe('the stylesheet reads no token that does not exist', () => {
  it('finds tokens and readers at all', () => {
    /* Vacuity: a regex that matched nothing would make the assertion
       below pass for ever, which is the failure mode of every test that
       greps a file. */
    expect(defined().size).toBeGreaterThan(300);
    expect(readsWithoutFallback().length).toBeGreaterThan(300);
  });

  it('resolves every one of them', () => {
    const known = defined();
    const missing = readsWithoutFallback()
      .filter((use) => !known.has(use.name))
      /* One line per name: a token used thirty times should not print
         thirty failures. */
      .filter((use, i, all) => all.findIndex((o) => o.name === use.name) === i)
      .map((use) => `${use.name} (apex-ui.css:${use.line})`);

    expect(missing, `undefined custom properties: ${missing.join(', ')}`).toEqual([]);
  });
});
