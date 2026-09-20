import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import fs from 'node:fs';
import path from 'node:path';
import ApexButton from '../src/components/ApexButton.vue';

/**
 * ApexButton's SIZE actually changes its size.
 *
 * AF2-314, found in a browser by the first person to put three icon-only
 * buttons in a table cell: they rendered 34 wide and 42 tall. A square button
 * that is not square is the visible corner of the real defect —
 *
 *   .apex-btn                 { font-size:14px; padding-inline:16px; block-size:42px }
 *   .apex-btn[data-size="sm"] { --apex-btn-h:34px; --apex-btn-fs:13px; --apex-btn-pad:12px }
 *
 * — the base wrote LITERALS and the size rule wrote VARIABLES, and on a
 * standalone button nothing read them. The only rule in the stylesheet that
 * read `var(--apex-btn-h)` was `.apex-btngroup[data-size="md"] > .apex-btn`.
 * So `size="sm"` changed the icon glyph and nothing else, at every call site,
 * since the component was written.
 *
 * The same four variables are where `btnStyle` puts the `height`, `fontSize`,
 * `paddingInline` and `radius` appearance props, so all four were dead too.
 *
 * Why these tests and not a rendered measurement: happy-dom does no layout,
 * so `getBoundingClientRect` is zeros and an `expect(h).toBe(34)` would pass
 * against any stylesheet at all (§11.7). What CAN be checked is the two links
 * in the chain — the stylesheet reads the variable, and the component writes
 * it — and a break in either is the whole bug.
 *
 * Read from disk rather than through an import, for the reason
 * zz-docs-classes gives: a stylesheet imported under vitest is stubbed to an
 * empty string, and a guard that finds nothing passes.
 */

const CSS = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'styles', 'apex-ui.css'), 'utf8',
);

/** The declaration body of one rule, by its exact selector. */
function rule(selector: string): string {
  const i = CSS.indexOf('\n' + selector + '{');
  expect(i, `no rule for ${selector} — the selector was renamed`).toBeGreaterThan(-1);
  return CSS.slice(i + selector.length + 2, CSS.indexOf('}', i));
}

describe('the base button reads its sizing family rather than hard-coding it', () => {
  const base = rule('.apex-btn');

  it.each([
    ['block-size', '--apex-btn-h'],
    ['font-size', '--apex-btn-fs'],
    ['padding-inline', '--apex-btn-pad'],
    ['border-radius', '--apex-btn-radius'],
  ])('%s comes from %s', (prop, variable) => {
    const decl = base.split(';').find((d) => d.trim().startsWith(prop + ':'));
    expect(decl, `${prop} is not declared on .apex-btn at all`).toBeTruthy();
    expect(decl, `${prop} is a literal — ${variable} can never take effect`)
      .toContain(`var(${variable}`);
  });

  it('and still carries a default for each, so an untouched button is unchanged', () => {
    expect(base).toContain('--apex-btn-h:42px');
    expect(base).toContain('--apex-btn-fs:14px');
    expect(base).toContain('--apex-btn-pad:16px');
  });
});

describe('every variable a size rule SETS is one the base READS', () => {
  /* The generalised form of the defect: a variable that is set and never
     read is silent at every layer. Nothing errors, the button renders, it is
     simply the wrong size forever. */
  const base = rule('.apex-btn');

  it.each(['sm', 'lg'])('size="%s"', (size) => {
    const sized = rule(`.apex-btn[data-size="${size}"]`);
    const setHere = [...sized.matchAll(/(--apex-btn-[a-z-]+):/g)].map((m) => m[1]);
    expect(setHere.length, 'the size rule sets nothing').toBeGreaterThan(0);

    for (const v of setHere) {
      expect(base, `${v} is set by [data-size="${size}"] and read by nothing that applies to a plain button`)
        .toContain(`var(${v}`);
    }
  });
});

describe('an icon-only button is square by construction', () => {
  it('its width is the same variable as its height', () => {
    /* Three literals (42/34/50) used to hold the width while the height came
       from somewhere else entirely. They also outranked `height`, so setting
       it gave you a 34x28 "square". */
    expect(rule('.apex-btn[data-icon-only="true"]')).toContain('inline-size:var(--apex-btn-h)');
  });

  it('and no per-size literal is left to pin it', () => {
    for (const size of ['sm', 'lg']) {
      expect(
        CSS.includes(`.apex-btn[data-icon-only="true"][data-size="${size}"]`),
        `the ${size} width literal is back; it outranks --apex-btn-h`,
      ).toBe(false);
    }
  });
});

describe('the component writes the variables the stylesheet now reads', () => {
  const styleOf = (props: Record<string, unknown>) =>
    mount(ApexButton, { props }).attributes('style') ?? '';

  it.each([
    ['height', '--apex-btn-h', '28px'],
    ['fontSize', '--apex-btn-fs', '11px'],
    ['paddingInline', '--apex-btn-pad', '4px'],
    ['radius', '--apex-btn-radius', '3px'],
  ])('%s -> %s', (prop, variable, value) => {
    expect(styleOf({ label: 'Go', [prop]: value })).toContain(`${variable}: ${value}`);
  });

  it('an untouched button carries no style attribute at all', () => {
    /* The component's own claim: "only what is set, so an untouched button
       carries no style attribute". */
    expect(styleOf({ label: 'Go' })).toBe('');
  });

  it('the size lands as data-size, which is what selects the rule', () => {
    expect(mount(ApexButton, { props: { label: 'Go', size: 'sm' } }).attributes('data-size')).toBe('sm');
  });
});
