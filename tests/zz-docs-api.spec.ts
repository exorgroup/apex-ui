import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { ENTRIES } from '../../apex-ui-docs/src/registry';

/**
 * The docs must not describe an API the component does not have.
 *
 * This has gone wrong twice: the tab and step slot names (documented as one
 * slot per value; they are positional) and ApexScrollArea's props (documented
 * `fade` and `size`; they are `mask` and `scrollbarSize`). The page-render
 * check passes in both cases — a page can draw perfectly while telling you to
 * use something that does not exist. Only reading the component catches it.
 */

const SRC = resolve(__dirname, '../src/components');

/** Prop names a component declares, including those it inherits by spread. */
function declaredProps(name: string): Set<string> {
  const file = readFileSync(`${SRC}/${name}.vue`, 'utf8');
  const block = (file.match(/defineProps<([\s\S]*?)>\(\)/) || [])[1] ?? '';
  const own = [...block.matchAll(/^\s{2}([a-zA-Z][a-zA-Z0-9]*)\??:/gm)].map((m) => m[1]);

  /* Inherited sets, so a page may document `disabled` on a control that gets
     it from ApexFieldProps rather than declaring it itself. */
  const inherited: string[] = [];
  const types = readFileSync(resolve(SRC, '../types.ts'), 'utf8');
  const grab = (iface: string) => {
    const body = (types.match(new RegExp(`interface ${iface} \\{([\\s\\S]*?)\\n\\}`)) || [])[1] ?? '';
    return [...body.matchAll(/^\s{2}([a-zA-Z][a-zA-Z0-9]*)\??:/gm)].map((m) => m[1]);
  };
  if (/ApexFieldProps/.test(block)) inherited.push(...grab('ApexFieldProps'));
  if (/ApexContainerProps/.test(block)) inherited.push(...grab('ApexContainerProps'));
  if (/ApexButtonProps|ApexButtonAppearance/.test(block)) inherited.push(...grab('ApexButtonAppearance'));

  return new Set([...own, ...inherited]);
}

/** Slot names a component actually renders, static and templated alike. */
function declaredSlots(name: string): { fixed: Set<string>; templated: boolean } {
  const file = readFileSync(`${SRC}/${name}.vue`, 'utf8');
  const fixed = new Set([...file.matchAll(/<slot[^>]*\sname="([a-zA-Z][\w-]*)"/g)].map((m) => m[1]));
  if (/<slot(?![^>]*\sname=)/.test(file)) fixed.add('default');
  // `name="\`panel-${i + 1}\`"` — positional, so names cannot be checked literally.
  const templated = /<slot[^>]*:name=/.test(file);
  return { fixed, templated };
}

/** A docs row may name several things at once: "height / maxHeight / width". */
const namesIn = (cell: string) =>
  cell.split('/').map((s) => s.trim().replace(/\(.*\)$/, '').trim())
    .filter((s) => /^[a-zA-Z][a-zA-Z0-9]*$/.test(s));

const CONTROLS = ENTRIES.filter((e) => !('demo' in e && e.demo === 'field'));

describe('every prop the docs name is declared by the component', () => {
  it.each(CONTROLS.map((e) => [e.name, e] as const))('%s', (name, entry) => {
    let declared: Set<string>;
    try {
      declared = declaredProps(name);
    } catch {
      return; // ApexField and friends live elsewhere; covered by their own pages
    }
    const claimed = entry.props.flatMap((row) => namesIn(row[0]));
    const missing = claimed.filter((p) => !declared.has(p));
    expect(missing, `${name} documents props it does not declare`).toEqual([]);
  });
});

describe('every slot the docs name is rendered by the component', () => {
  it.each(CONTROLS.filter((e) => e.slots?.length).map((e) => [e.name, e] as const))('%s', (name, entry) => {
    let slots: ReturnType<typeof declaredSlots>;
    try {
      slots = declaredSlots(name);
    } catch {
      return;
    }
    // Positional slots are built from an index, so only the fixed ones can be
    // checked by name; a row like "panel-1, panel-2, …" is exempt.
    const claimed = (entry.slots ?? [])
      .map((row) => row[0].trim())
      .filter((s) => /^[a-zA-Z][\w-]*$/.test(s));
    const missing = claimed.filter((s) => !slots.fixed.has(s));
    expect(missing, `${name} documents slots it does not render`).toEqual([]);
  });
});

describe('every playground control edits a real prop', () => {
  it.each(CONTROLS.map((e) => [e.name, e] as const))('%s', (name, entry) => {
    let declared: Set<string>;
    try {
      declared = declaredProps(name);
    } catch {
      return;
    }
    const missing = entry.controls.map((c) => c.key).filter((k) => !declared.has(k));
    expect(missing, `${name} has playground controls for props it does not declare`).toEqual([]);
  });
});
