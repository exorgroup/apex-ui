import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Two contracts that live in the stylesheet rather than the markup —
 * AF2-374 for the modal panel's width, AF2-393 for the narrow collapse.
 *
 * Read from DISK with `fs`, and this file is excluded from tsconfig for it,
 * exactly as button-size, frozen-row-bg and overlay-transition are: Vite
 * stubs a CSS import to an empty string under vitest, so the glob form of
 * either guard would compare against nothing and pass. The width assertion
 * was written first inside form-mount.spec.ts, where it did both wrong
 * things at once — it read an empty string AND tripped the typecheck gate
 * on `__dirname`.
 *
 * Asserted against the rules rather than computed styles because happy-dom
 * has no layout engine and evaluates neither container nor media queries
 * (§11.7). What is checked is what the stylesheet says.
 */
const css = fs.readFileSync(path.join(__dirname, '..', 'src', 'styles', 'apex-ui.css'), 'utf8');

/**
 * The text of an at-rule block, from its opener to the line that closes it.
 *
 * Matched at the START OF A LINE, because the same words appear in the
 * comment above the rule explaining why the container query is the one that
 * matters — and a plain `indexOf` returned that prose, which is how the
 * first run of this guard failed against a stylesheet that was correct.
 */
function block(opener: RegExp): string {
  const at = css.search(opener);
  expect(at, `${opener} is gone`).toBeGreaterThan(-1);
  const end = css.indexOf(['', '}'].join(String.fromCharCode(10)), at);

  return css.slice(at, end === -1 ? undefined : end);
}

describe('the modal panel width', () => {
  const rule = css.match(/\.apex-form\[data-shell="modal"\] \.apex-form__panel \{[^}]*\}/)?.[0] ?? '';

  it('is driven by a variable', () => {
    expect(rule, 'the panel width rule is gone or renamed').toContain('inline-size');
    expect(rule, 'the width is hard-coded again — a host cannot set it')
      .toContain('var(--apex-form-w, min(980px, 100%))');
  });

  it('keeps its old value as the default', () => {
    /* The fallback IS the default (§4.2), so a form that says nothing
       renders exactly as it did before the variable existed. */
    expect(rule).toContain('min(980px, 100%)');
  });

  it('and the variable is never DECLARED on the panel', () => {
    /* A declaration on the element would beat anything inherited, which is
       the trap §4.2 exists to record: the host would set it and nothing
       would happen. */
    expect(css).not.toMatch(/\.apex-form__panel[^{]*\{[^}]*--apex-form-w\s*:/);
  });
});

/**
 * A one-track grid holding a cell that still asks for two tracks does not
 * stack: CSS grid invents an implicit column and the form goes lopsided,
 * which is worse than the layout it was collapsing from. Both collapses
 * have to free the cells as well as narrow the tracks.
 */
describe('the narrow collapse', () => {
  it('collapses the container query to one column AND frees every cell', () => {
    const q = block(/^@container apexform \(max-width: 560px\) \{/m);

    expect(q).toContain('grid-template-columns: minmax(0, 1fr)');
    expect(q, 'the cells still span what the wide layout gave them')
      .toContain('.apex-form__cell { grid-column: 1 / -1; }');
  });

  it('and so does the viewport fallback', () => {
    const q = block(/^@media \(max-width: 720px\) \{/m);

    expect(q).toContain('grid-template-columns: minmax(0, 1fr)');
    expect(q).toContain('.apex-form__cell { grid-column: 1 / -1; }');
  });

  it('which is only possible because placement is a variable', () => {
    /* An inline `grid-column` would beat both queries. The component
       writes --cell-span / --cell-start and the stylesheet applies them. */
    expect(css).toContain('grid-column: var(--cell-start, auto) / span var(--cell-span, 1)');
  });
});

describe('the grid gap', () => {
  it('reads a variable, with the value it has always had as the fallback', () => {
    /* AF2-394. The fallback IS the default (§4.2): a form that sets
       nothing renders exactly as it did before the variable existed, and
       the component writes no inline value that would beat a host rule. */
    const rule = css.match(/\.apex-form__grid \{[^}]*\}/)?.[0] ?? '';

    expect(rule, 'the grid rule is gone or renamed').toContain('display: grid');
    expect(rule, 'the gap is hard-coded again').toContain('gap: var(--apex-form-gap, 18px 20px)');
  });

  it('and the variable is never DECLARED on the grid', () => {
    expect(css).not.toMatch(/\.apex-form__grid[^{]*\{[^}]*--apex-form-gap\s*:/);
  });
});
