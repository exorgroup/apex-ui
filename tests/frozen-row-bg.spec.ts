import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * A frozen column wears the row's colour — AF2-329.
 *
 * A frozen cell must carry an opaque background of its own, or the content
 * scrolling underneath shows through it. That background paints over the
 * row's, so every row STATE has to reach the frozen cells too.
 *
 * Striped and selected each had a hand-written duplicate rule for
 * `td[data-frozen]`. Hover, selected+hover and expanded did not — so the
 * highlight stopped dead at the pinned column, which is what the user saw.
 * Five states, two remembered: a duplicate-per-state was never going to
 * hold, and the next state added would have broken it again.
 *
 * So the row publishes `--apex-dt-row-bg` and the cell reads it. This guard
 * is about the DRIFT rather than the pixels: it fails if a row state sets a
 * background without publishing the variable, which is the mistake, not its
 * symptom. The colours themselves were checked in a real browser, because
 * happy-dom applies no stylesheet and any colour assertion here would pass
 * against anything.
 */

const CSS = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'styles', 'apex-ui.css'), 'utf8',
);

/** Every rule in the sheet, as [selector, body]. */
function rules(): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  for (const m of CSS.matchAll(/(^|\n)([^{}@\n][^{}]*)\{([^}]*)\}/g)) {
    out.push([m[2].trim(), m[3]]);
  }
  return out;
}

const ROW_STATES = rules().filter(([sel, body]) =>
  /tbody tr(?![\w-])/.test(sel)
  && !/\s(td|th)\b/.test(sel)
  && /(^|;)\s*background:/.test(body));

describe('every row state publishes its colour', () => {
  it('finds the row states at all', () => {
    /* If a rename ever empties this list the whole guard goes quiet, which
       is the failure mode these tests exist to avoid. */
    expect(ROW_STATES.length, 'no row background rules matched — the selector shape changed')
      .toBeGreaterThanOrEqual(5);
  });

  it.each(ROW_STATES.map(([sel]) => sel))('%s', (selector) => {
    const body = ROW_STATES.find(([s]) => s === selector)![1];
    expect(body, `${selector} paints a row the frozen column will never match`)
      .toContain('--apex-dt-row-bg:');
  });
});

describe('and the frozen cell wears it', () => {
  it('reads the variable rather than a colour of its own', () => {
    const frozen = rules().find(([sel]) => sel.includes('td[data-frozen]') && !sel.includes('thead'));
    expect(frozen, 'no frozen cell rule found').toBeTruthy();
    expect(frozen![1], 'the frozen cell paints its own colour over the row again')
      .toContain('var(--apex-dt-row-bg');
  });

  it('with a fallback, so a table with no row state still looks right', () => {
    const frozen = rules().find(([sel]) => sel.includes('td[data-frozen]') && !sel.includes('thead'));
    expect(frozen![1]).toMatch(/var\(--apex-dt-row-bg\s*,/);
  });

  it('and no per-state duplicate has crept back', () => {
    /* The two that existed are what made the gap look intentional. One
       returning means someone patched a symptom instead of the variable,
       and the next state will break again. */
    const duplicates = rules().filter(([sel]) =>
      /tbody tr/.test(sel) && /td\[data-frozen\]/.test(sel));
    expect(duplicates.map(([s]) => s), 'a state-specific frozen-cell rule is back').toEqual([]);
  });
});
