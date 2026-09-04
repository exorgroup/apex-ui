import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * An element hidden with the `hidden` attribute must not also declare `display`
 * without putting it back.
 *
 * `[hidden] { display: none }` comes from the user-agent stylesheet, so ANY
 * author rule that sets `display` on the same element beats it and the attribute
 * silently stops hiding anything. ApexPanel shipped exactly that: wrapping the
 * body and footer in a region with `display:flex` left a collapsed panel sitting
 * open, showing `collapsed: true` while every word of its content was on screen.
 *
 * The pairing is invisible on its own — the template looks right, the stylesheet
 * looks right, and only the two together are wrong — so it is worth finding
 * mechanically.
 *
 * The stylesheet is read with `fs`, not `import.meta.glob('…css', '?raw')`:
 * Vite stubs a CSS module to an empty string under vitest, so the glob version
 * of this guard compared against a blank file and could never fail. That is why
 * this spec is in the tsconfig exclude list — see the note there.
 */

const ROOT = resolve(__dirname, '..');
const CSS = readFileSync(resolve(ROOT, 'src/styles/apex-ui.css'), 'utf8');

const COMPONENTS = import.meta.glob('../src/components/*.vue', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>;

/** Static classes on elements that bind the `hidden` attribute. */
function hiddenClasses(src: string): string[] {
  const out: string[] = [];
  // an opening tag that carries :hidden="…" somewhere in its attributes
  for (const tag of src.match(/<[a-zA-Z][^>]*:hidden=[^>]*>/g) ?? []) {
    const cls = tag.match(/\sclass="([^"{]*)"/); // static class only
    if (cls) out.push(...cls[1].split(/\s+/).filter((c) => c.startsWith('apex-')));
  }
  return [...new Set(out)];
}

/** Does the stylesheet give this class its own `display`? */
function declaresDisplay(cls: string): boolean {
  const rule = CSS.match(new RegExp(`\\.${cls}\\{([^}]*)\\}`));
  return !!rule && /(^|;)\s*display\s*:/.test(rule[1]);
}

/** Is there a rule putting `display:none` back when the attribute is present? */
const restoresHidden = (cls: string) =>
  new RegExp(`\\.${cls}\\[hidden\\]\\{[^}]*display\\s*:\\s*none`).test(CSS);

describe('elements hidden by attribute still hide', () => {
  /* The guard is only as good as its inputs, and both have now been empty at
     some point in this file's short life. Fail loudly rather than pass on
     nothing. */
  it('has both a stylesheet and components to read', () => {
    expect(CSS.length, 'stylesheet came back empty').toBeGreaterThan(1000);
    expect(Object.keys(COMPONENTS).length).toBeGreaterThan(10);
  });

  const files = Object.entries(COMPONENTS).map(([p, src]) =>
    [p.split('/').pop() as string, src] as const);

  it.each(files)('%s', (_file, src) => {
    const broken = hiddenClasses(src)
      .filter(declaresDisplay)
      .filter((cls) => !restoresHidden(cls));

    expect(broken, 'these set display, so [hidden] no longer hides them').toEqual([]);
  });
});
