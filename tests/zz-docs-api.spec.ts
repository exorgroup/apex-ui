import { describe, it, expect } from 'vitest';
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

/* Sources are read through Vite rather than `fs`, so the guard needs no Node
   types in a library that has none. `?raw` hands back the file as a string. */
const SOURCES = import.meta.glob('../src/components/*.vue', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>;
const TYPES = Object.values(
  import.meta.glob('../src/types.ts', { query: '?raw', import: 'default', eager: true }),
)[0] as string;

/* A service keeps its API in an options interface under core/, not as props on
   a component. ApexToast's page documents what you hand to add() — that is
   ToastMessage. The host's own props (position, mode, max…) are a different
   table for a different question. Without this the guard compares a page
   against the wrong declaration and reports every documented option as
   invented. */
const CORE = import.meta.glob('../src/core/*.ts', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>;

/** Field names on an interface declared anywhere under core/. */
function interfaceFields(iface: string): Set<string> {
  for (const src of Object.values(CORE)) {
    const body = (src.match(new RegExp(`interface ${iface} \\{([\\s\\S]*?)\\n\\}`)) || [])[1];
    if (body) return new Set([...body.matchAll(/^\s{2}([a-zA-Z][a-zA-Z0-9]*)\??:/gm)].map((m) => m[1]));
  }
  throw new Error(`no interface ${iface} under core/ — check optionsType`);
}

/** The component's source, or undefined when there is no such file. */
const sourceOf = (name: string) => SOURCES[`../src/components/${name}.vue`];

/** Prop names a component declares, including those it inherits by spread. */
function declaredProps(name: string): Set<string> {
  const file = sourceOf(name);
  if (file === undefined) throw new Error(`no source for ${name}`);
  const block = (file.match(/defineProps<([\s\S]*?)>\(\)/) || [])[1] ?? '';
  const own = [...block.matchAll(/^\s{2}([a-zA-Z][a-zA-Z0-9]*)\??:/gm)].map((m) => m[1]);

  /* Inherited sets, so a page may document `disabled` on a control that gets
     it from ApexFieldProps rather than declaring it itself. */
  const inherited: string[] = [];
  const grab = (iface: string) => {
    const body = (TYPES.match(new RegExp(`interface ${iface} \\{([\\s\\S]*?)\\n\\}`)) || [])[1] ?? '';
    return [...body.matchAll(/^\s{2}([a-zA-Z][a-zA-Z0-9]*)\??:/gm)].map((m) => m[1]);
  };
  if (/ApexFieldProps/.test(block)) inherited.push(...grab('ApexFieldProps'));
  if (/ApexContainerProps/.test(block)) inherited.push(...grab('ApexContainerProps'));
  if (/ApexButtonProps|ApexButtonAppearance/.test(block)) inherited.push(...grab('ApexButtonAppearance'));

  return new Set([...own, ...inherited]);
}

/** Slot names a component actually renders, static and templated alike. */
function declaredSlots(name: string): { fixed: Set<string>; templated: boolean } {
  const file = sourceOf(name);
  if (file === undefined) throw new Error(`no source for ${name}`);
  const fixed = new Set([...file.matchAll(/<slot[^>]*\sname="([a-zA-Z][\w-]*)"/g)].map((m) => m[1]));
  if (/<slot(?![^>]*\sname=)/.test(file)) fixed.add('default');

  /*
   * A slot need not be rendered by a <slot> tag. ApexTieredMenu declares `item`
   * with defineSlots and hands it to ApexMenuItem as the `itemRender` prop, so
   * the row keeps its click, hover and submenu behaviour while the consumer
   * replaces only the contents — there is no <slot> anywhere in the file.
   *
   * Reading only for tags called that an undocumented slot; the slot works, and
   * menu-gating.spec proves it by mounting one. So the declaration counts too.
   */
  const declared = file.match(/defineSlots<\{([\s\S]*?)\}>\(\)/);
  if (declared) {
    for (const m of declared[1].matchAll(/^\s*([a-zA-Z][\w-]*)\??\s*:/gm)) fixed.add(m[1]);
  }
  // `name="\`panel-${i + 1}\`"` — positional, so names cannot be checked literally.
  const templated = /<slot[^>]*:name=/.test(file);
  return { fixed, templated };
}

/**
 * A docs row may name several things at once: "height / maxHeight / width".
 *
 * A row indented with an em space is not a prop at all. The gallery uses that
 * indent to describe a field of the type named on the row above — MegaItem's
 * `columns` and `panel`, ApexMenu's `item.toggleable` — and a component
 * obviously does not declare those. Trimming erased the marker, so `columns`
 * read as an undeclared prop of ApexMegaMenu; the ones carrying a dot escaped
 * only because the name pattern happened to reject them.
 */
const namesIn = (cell: string) =>
  (cell.startsWith(' ') ? [] : cell.split('/'))
    .map((s) => s.trim().replace(/\(.*\)$/, '').trim())
    .filter((s) => /^[a-zA-Z][a-zA-Z0-9]*$/.test(s));

const CONTROLS = ENTRIES.filter((e) => !('demo' in e && e.demo === 'field'));

describe('every prop the docs name is declared by the component', () => {
  it.each(CONTROLS.map((e) => [e.name, e] as const))('%s', (name, entry) => {
    let declared: Set<string>;
    try {
      declared = entry.optionsType
        ? interfaceFields(entry.optionsType)
        : declaredProps(name);
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
      /* A service's rail edits the options object, not the host's props, so it
         is checked against the same interface the props table documents. */
      declared = entry.optionsType
        ? interfaceFields(entry.optionsType)
        : declaredProps(name);
    } catch {
      return;
    }
    const missing = entry.controls.map((c) => c.key).filter((k) => !declared.has(k));
    expect(missing, `${name} has playground controls for props it does not declare`).toEqual([]);
  });
});

/** Event names a component actually emits, read from its defineEmits block. */
function declaredEmits(name: string): Set<string> {
  const file = sourceOf(name);
  if (file === undefined) throw new Error(`no source for ${name}`);
  const block = (file.match(/defineEmits<([\s\S]*?)>\(\)/) || [])[1] ?? '';
  return new Set([...block.matchAll(/'([^']+)'/g)].map((m) => m[1]));
}

describe('every event the docs name is emitted by the component', () => {
  /* Two pages had already named an event that does not exist: ApexSteps
     documented `change` where the component emits `step-change`, and
     ApexSplitter listed three of five with payloads that did not match.
     A wrong event name is invisible to every other check — the page renders,
     the build passes, and the handler simply never fires. */
  it.each(CONTROLS.filter((e) => e.events?.length).map((e) => [e.name, e] as const))('%s', (name, entry) => {
    let emitted: Set<string>;
    try {
      emitted = declaredEmits(name);
    } catch {
      return;
    }
    /* No defineEmits block means the component forwards native events by
       attribute fallthrough — ApexButton documents `click`, which the
       underlying <button> fires without the component declaring anything.
       That is unverifiable here rather than wrong, so it is skipped. */
    if (!emitted.size) return;

    /* Event names carry ':' and '-' — update:modelValue, step-change — which
       the prop splitter rejects, so they need their own. */
    const eventNamesIn = (cell: string) =>
      cell.split('/').map((s) => s.trim())
        .filter((s) => /^[a-zA-Z][\w:-]*$/.test(s));

    const claimed = (entry.events ?? []).flatMap((row) => eventNamesIn(row[0]));
    expect(claimed.length, `${name} has event rows but no parsable names`).toBeGreaterThan(0);
    const missing = claimed.filter((ev) => !emitted.has(ev));
    expect(missing, `${name} documents events it does not emit`).toEqual([]);
  });
});
