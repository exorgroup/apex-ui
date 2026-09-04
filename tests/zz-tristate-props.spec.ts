import { describe, it, expect } from 'vitest';

/**
 * A boolean prop used as tri-state must be declared `undefined`.
 *
 * Vue casts an ABSENT boolean prop to `false`, never `undefined`. Any component
 * that asks `props.x !== undefined` to decide whether it is controlled will
 * therefore always answer yes, and its uncontrolled behaviour is dead code.
 * That shipped in three components at once — ApexPanel and ApexFieldset could
 * not be toggled at all, and ApexSidebar opened closed — because nothing was
 * looking for the pattern.
 *
 * This finds the pattern rather than the symptom, so a new control that
 * repeats it fails here instead of in someone's hands.
 */

const SOURCES = import.meta.glob('../src/components/*.vue', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>;

/** Props the file compares against undefined — the tri-state tell. */
function comparedToUndefined(src: string): string[] {
  return [...new Set(
    [...src.matchAll(/props\.([a-zA-Z][a-zA-Z0-9]*)\s*(?:!==|===)\s*undefined/g)].map((m) => m[1]),
  )];
}

/** The `withDefaults(defineProps<…>(), { … })` object, if there is one. */
const defaultsOf = (src: string) => (src.match(/>\(\),\s*\{([\s\S]*?)\}\);/) || [])[1] ?? '';
const typeBlockOf = (src: string) => (src.match(/defineProps<([\s\S]*?)>\(\)/) || [])[1] ?? '';

describe('tri-state boolean props declare undefined', () => {
  const files = Object.entries(SOURCES).map(([path, src]) =>
    [path.split('/').pop() as string, src] as const);

  it.each(files)('%s', (_file, src) => {
    const type = typeBlockOf(src);
    const defaults = defaultsOf(src);

    const offenders = comparedToUndefined(src)
      // only booleans are cast; a string or number prop really is undefined
      .filter((name) => new RegExp(`\\b${name}\\?:\\s*boolean`).test(type))
      .filter((name) => !new RegExp(`\\b${name}\\s*:\\s*undefined`).test(defaults));

    expect(offenders, 'boolean props compared to undefined but not defaulted to it').toEqual([]);
  });
});
