import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * A normalised control declares only --apex-* variables.
 *
 * §4.2 of the conventions: every control owns a variable family, and the
 * family prefix is `--apex-`. AF2-251 moved the last six data-control families
 * across — `--dt-`, `--oc-`, `--pl-`, `--tl-`, `--pb-`, `--dv-`, 60 names and
 * 262 references — and nothing would stop the next one being added under a
 * bare prefix again. Renaming is cheap now and expensive once a consumer
 * overrides the name; TBX has none of these yet, which is exactly why the
 * window is open.
 *
 * The list below is the controls that have BEEN normalised, not all of them.
 * The library still carries roughly twenty legacy families elsewhere
 * (`--msg-`, `--mnu-`, `--bc-`, `--drw-`, …), and failing on those would make
 * this gate unpassable and therefore ignored — the reason the fatal-typecheck
 * gate is scoped the way it is. Add a control here when its family moves.
 *
 * Two corpora, because these variables live in two places: the component sets
 * some from JS (`{ '--apex-tt-indent': … }`) and the stylesheet declares the
 * rest on the control's own rule. Guarding only the .vue files would miss the
 * bulk of them.
 */

const SRC = path.join(__dirname, '..', 'src');

/** Control file → the class prefix its stylesheet rules use. */
const NORMALISED: Array<[string, string]> = [
  ['ApexDataTable.vue', 'apex-dt'],
  ['ApexDataView.vue', 'apex-dv'],
  ['ApexOrgChart.vue', 'apex-oc'],
  ['ApexOrgNode.vue', 'apex-oc'],
  ['ApexPickList.vue', 'apex-pl'],
  ['ApexProgressBar.vue', 'apex-pb'],
  ['ApexTimeline.vue', 'apex-tl'],
  /* AF2-257. ApexTree's root is `.apex-tr`; `.apex-tree` is ApexTreeSelect's,
     which is why its family had to be vacated in AF2-249 before this could
     happen. TreeTable's own rules are `.apex-tt`; the DataTable chrome it
     renders is checked with DataTable at AF2-261. */
  ['ApexTree.vue', 'apex-tr'],
  ['ApexTreeTable.vue', 'apex-tt'],
  /* AF2-269, Phase B. ApexCalendar takes `--apex-cal-*`, which ApexDatePicker
     vacated in AF2-249a for exactly this. The scheduler's `--thumb` and
     `--tone-ink` came across bare and are now in its own family. */
  ['ApexScheduler.vue', 'apex-sched'],
  ['ApexCalendar.vue', 'apex-calendar'],
  /* AF2-283, Phase C. Eleven CLASS prefixes and exactly TWO variable
     families: `--apex-ed-*` for the rich-text editor and everything it
     draws, `--apex-hed-*` for the page editor. §4.2 forbids one family
     prefix being a prefix of another, so there is no `--apex-edbar-*`
     beside `--apex-ed-*` — the bar's variable is `--apex-ed-bar-btn`. The
     class prefixes stay as they are; they are not variable families. */
  ['ApexEditor.vue', 'apex-ed'],
  ['ApexEditorToolbar.vue', 'apex-edbar'],
  ['ApexEditorMenubar.vue', 'apex-ed'],
  ['ApexEditorBubble.vue', 'apex-edbub'],
  ['ApexEditorImage.vue', 'apex-edimg'],
  ['ApexEditorLink.vue', 'apex-edlink'],
  ['ApexEditorTableGrid.vue', 'apex-edgrid'],
  ['ApexEditorTableTools.vue', 'apex-tbl-tools'],
  ['ApexEditorObjectBar.vue', 'apex-objbar'],
  ['ApexEditorImageTools.vue', 'apex-objtools'],
  ['ApexEditorSlash.vue', 'apex-edslash'],
  ['ApexEditorWordCount.vue', 'apex-edwc'],
  ['ApexHTMLEditor.vue', 'apex-hed'],
];

/**
 * The token layer is legitimately not --apex-.
 *
 * Read from tokens.css rather than listed here, so adding a token family does
 * not fail every control that uses it.
 */
const TOKEN_PREFIXES = new Set(
  [...fs.readFileSync(path.join(SRC, 'styles', 'tokens.css'), 'utf8')
    .matchAll(/--([a-z][a-z0-9]*)-[a-z0-9-]*\s*:/g)].map((m) => m[1]),
);

/**
 * Custom properties, and NOT BEM modifiers.
 *
 * `apex-dv__item--skel` contains `--skel`, and a naive `--[a-z-]+` match
 * reports it as an undeclared variable — a false finding, and a guard that
 * cries wolf gets switched off. Excluding it needs a lookbehind, not care in
 * the surrounding pattern: this guard was clean until AF2-253 bound a class to
 * that element, at which point `class="…item--skel" :class="ui?.item"` put a
 * quote and a colon after the modifier and it read as a declaration. A custom
 * property is never preceded by an identifier character; a BEM modifier always
 * is.
 *
 * Three shapes, and the third was found the hard way. This guard passed with
 * `--pb-fill` deliberately reinstated, because ApexProgressBar writes most of
 * its variables as `s['--apex-pb-fill'] = props.color` — a bracket assignment,
 * which has no colon after the name. Only the one object-literal line was
 * covered, and the guard read as green over exactly the regression it exists
 * to catch.
 */
function customProps(src: string): Set<string> {
  const out = new Set<string>();
  /* A CSS declaration, or an object-literal key: `--x:` / `'--x':`. */
  for (const m of src.matchAll(/(?<![\w-])(--[a-z][a-z0-9-]*)["']?\s*:/g)) out.add(m[1]);
  /* A read. */
  for (const m of src.matchAll(/var\(\s*(?<![\w-])(--[a-z][a-z0-9-]*)/g)) out.add(m[1]);
  /* Any quoted name: bracket assignment, and lists of names. */
  for (const m of src.matchAll(/["'](--[a-z][a-z0-9-]*)["']/g)) out.add(m[1]);
  return out;
}

const allowed = (v: string) =>
  v.startsWith('--apex-') || TOKEN_PREFIXES.has(v.slice(2).split('-')[0]);

/** The stylesheet rules belonging to one control, by class prefix. */
const css = fs.readFileSync(path.join(SRC, 'styles', 'apex-ui.css'), 'utf8');
function rulesFor(prefix: string): string {
  return css
    .split('}')
    .filter((block) => {
      const sel = block.slice(block.lastIndexOf('{') === -1 ? 0 : 0, block.indexOf('{'));
      return new RegExp(`\\.${prefix}(?![\\w-])`).test(sel);
    })
    .join('\n');
}

describe('a normalised control declares only --apex-* variables', () => {
  it('found token prefixes and rules to check', () => {
    /* Empty corpora would pass by finding nothing — the inert-guard failure
       zz-hidden-reset and zz-docs-classes were both caught by. */
    expect(TOKEN_PREFIXES.size).toBeGreaterThan(5);
    expect(rulesFor('apex-dt').length).toBeGreaterThan(500);
  });

  NORMALISED.forEach(([file, prefix]) => {
    it(`${file} and .${prefix} rules`, () => {
      const src = fs.readFileSync(path.join(SRC, 'components', file), 'utf8');
      const found = [...customProps(src), ...customProps(rulesFor(prefix))];
      const stray = [...new Set(found.filter((v) => !allowed(v)))].sort();
      expect(stray, `${file}: not --apex-* and not a token`).toEqual([]);
    });
  });
});
