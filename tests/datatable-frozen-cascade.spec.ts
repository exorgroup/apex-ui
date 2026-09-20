import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * A frozen column stays frozen in the BODY, not only in the head — N/030.
 *
 * Reported from the blog list: "the title is frozen but not the other
 * rows". The column header stuck to the trailing edge and the cells
 * under it scrolled away, taking the row's action buttons with them.
 *
 * Nothing was wrong with the markup or the measurement. It was the
 * cascade:
 *
 *   .apex-dt[data-row-ripple="true"] ... tbody td  position:relative  (0,3,2)
 *   .apex-dt__table tbody td[data-editable="true"] position:relative  (0,2,2)
 *   .apex-dt__table td[data-frozen]                position:sticky    (0,2,1)
 *
 * Both of the first two outrank the third, so with the row ripple on —
 * which is most tables in this application — every body cell was
 * `relative`. The header is a `th`, unmatched by the ripple rule, so it
 * went on sticking: the column LOOKED frozen and was not.
 *
 * A string assertion would guard the fix and not the property. This
 * works the cascade instead: every rule in the stylesheet that sets
 * `position` and matches a frozen body cell is collected, ordered by
 * specificity and then by source order, and the winner has to be
 * `sticky`. Any future rule that outranks it fails here, whatever it is
 * called.
 */

const SHEET = readFileSync(join('src', 'styles', 'apex-ui.css'), 'utf8');

/** Rule blocks, ignoring at-rules, as `[selector, declarations]`. */
function rules(): [string, string][] {
  const out: [string, string][] = [];
  /* Anything inside an @media/@supports block is skipped: its braces
     break this parse, and no frozen rule lives in one today. The
     assertion below fails loudly if that stops being true, because the
     expected winner would go missing. */
  const flat = SHEET.replace(/@[a-z-]+[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/gi, '');

  for (const m of flat.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    out.push([m[1].trim(), m[2]]);
  }

  return out;
}

/** (classes+attributes+pseudo-classes, elements) — no IDs are used here. */
function specificity(selector: string): [number, number] {
  const b = (selector.match(/\.[a-zA-Z0-9_-]+|\[[^\]]+\]|:(?!:)[a-zA-Z-]+/g) || []).length;
  const c = (selector.match(/(^|[\s>+~])[a-zA-Z][a-zA-Z0-9]*/g) || []).length;

  return [b, c];
}

/** The structure a frozen action cell actually sits in. */
function frozenCell(rowRipple: boolean, editable: boolean): Element {
  document.body.innerHTML = `
    <div class="apex-dt" data-row-ripple="${rowRipple}" data-size="normal">
      <div class="apex-dt__main"><div class="apex-dt__viewport">
        <table class="apex-dt__table" data-frozen-head="true">
          <thead><tr><th data-frozen="end">Actions</th></tr></thead>
          <tbody><tr class="apex-dt__row">
            <td data-frozen="end"${editable ? ' data-editable="true"' : ''}>x</td>
          </tr></tbody>
        </table>
      </div></div>
    </div>`;

  return document.querySelector('tbody td[data-frozen="end"]')!;
}

/** What `position` the cascade actually settles on for that cell. */
function winningPosition(cell: Element): { value: string; selector: string } {
  let best: { value: string; selector: string; spec: [number, number]; order: number } | null = null;

  rules().forEach(([selectorList, decls], order) => {
    const position = /(?:^|;)\s*position\s*:\s*([a-z-]+)/i.exec(decls)?.[1];
    if (!position) return;

    for (const selector of selectorList.split(',').map((s) => s.trim())) {
      let matches = false;
      try { matches = cell.matches(selector); } catch { matches = false; }
      if (!matches) continue;

      const spec = specificity(selector);
      const wins = !best
        || spec[0] > best.spec[0]
        || (spec[0] === best.spec[0] && spec[1] > best.spec[1])
        || (spec[0] === best.spec[0] && spec[1] === best.spec[1] && order >= best.order);

      if (wins) best = { value: position, selector, spec, order };
    }
  });

  expect(best, 'no rule in the stylesheet positions a frozen cell at all').not.toBeNull();

  return { value: best!.value, selector: best!.selector };
}

describe('a frozen body cell', () => {
  it('is sticky in an ordinary table', () => {
    const won = winningPosition(frozenCell(false, false));

    expect(won.value, `lost to ${won.selector}`).toBe('sticky');
  });

  it('is still sticky when the row ripple is on', () => {
    /* The reported case. */
    const won = winningPosition(frozenCell(true, false));

    expect(won.value, `lost to ${won.selector}`).toBe('sticky');
  });

  it('is still sticky when the cell is editable', () => {
    /* The same trap, one rule along, and not yet reported by anyone. */
    const won = winningPosition(frozenCell(false, true));

    expect(won.value, `lost to ${won.selector}`).toBe('sticky');
  });

  it('is still sticky when it is both', () => {
    const won = winningPosition(frozenCell(true, true));

    expect(won.value, `lost to ${won.selector}`).toBe('sticky');
  });

  it('reads enough rules for any of that to mean something', () => {
    /* Vacuity: a parse that found nothing would make all four pass. */
    expect(rules().length).toBeGreaterThan(500);
    expect(rules().some(([sel]) => sel.includes('[data-frozen]'))).toBe(true);
  });
});
