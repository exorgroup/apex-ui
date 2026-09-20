import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * A labelled switch keeps its own width — L/017.
 *
 * Found in a browser, on the payment settings screen: two switches one
 * above the other, both `span: 2` in the same section, rendering at 84px
 * and 506px. The only difference between them in the schema was that the
 * wide one carried `help` text.
 *
 *   .apex-field__body              { display:flex; flex-direction:column }
 *   .apex-switch                   { flex:0 0 auto; inline-size:44px }
 *   .apex-switch[data-labelled]    { inline-size:auto }
 *
 * `flex:0 0 auto` says "do not grow" about the MAIN axis, and in a column
 * that is the vertical one. Horizontally the switch is a stretched flex
 * item, so `inline-size:auto` filled whatever width the help text gave the
 * body. `align-self:start` is the missing half of the intent already
 * written on the line above.
 *
 * Layout cannot be measured in jsdom, so the proof is the browser harness
 * (`scratchpad/gridcheck/switchsize.html`: 84 / 506 before, 84 / 65 after,
 * and 88 / 88 once the screen pins a shared minimum). This file is the
 * regression guard — a declaration this cheap to delete deserves one.
 */

const css = fs.readFileSync(path.join(__dirname, '..', 'src', 'styles', 'apex-ui.css'), 'utf8');

/** The body of one rule, by its exact selector. */
function ruleFor(selector: string): string {
  const at = css.indexOf(selector + '{');

  expect(at, `${selector} is not in the stylesheet any more`).toBeGreaterThan(-1);

  return css.slice(at + selector.length + 1, css.indexOf('}', at));
}

describe('a labelled switch does not stretch', () => {
  it('declares align-self', () => {
    expect(ruleFor('.apex-switch[data-labelled="true"]')).toContain('align-self:start');
  });

  it('and still sizes to its own words', () => {
    /* `inline-size:auto` with a minimum is what lets "Inactive" be wider
       than "Live". Replacing it with a fixed width would line the two up
       and clip the longer one. */
    const rule = ruleFor('.apex-switch[data-labelled="true"]');

    expect(rule).toContain('inline-size:auto');
    expect(rule).toContain('min-inline-size:44px');
  });

  it('the unlabelled switch is unchanged', () => {
    /* It has an explicit `inline-size:44px`, so it never stretched and
       needs nothing — worth asserting so a future tidy-up does not
       "simplify" the two rules into one. */
    const rule = ruleFor('.apex-switch');

    expect(rule).toContain('inline-size:44px');
    expect(rule).toContain('flex:0 0 auto');
  });
});
