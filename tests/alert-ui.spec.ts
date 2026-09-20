import { describe, it, expect, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import ApexUI from '../src/index';
import ApexAlert from '../src/components/ApexAlert.vue';
import { useApexAlert } from '../src/core/alert';

/**
 * The customisation layer ApexConfirmDialog never had.
 *
 * Two claims worth holding to. The ui map has to reach every part, because a
 * key that is declared and not applied is indistinguishable from one that
 * works until someone tries it. And the variable layer has to be appearance-
 * neutral: it exists to let an app override, not to change how the control
 * looks out of the box.
 */

/*
 * Read with fs, not import.meta.glob('…css', '?raw'). Vite stubs a CSS module
 * to an empty string under vitest, so the glob version compares against a blank
 * file — the first version of this spec did exactly that, and its "no
 * un-prefixed variables" check passed vacuously against nothing. The same trap
 * is already recorded on zz-hidden-reset, which is why both are in the tsconfig
 * exclude list.
 */
const CSS = readFileSync(resolve(__dirname, '../src/styles/apex-ui.css'), 'utf8');

/** Just the alert's own block. */
const marker = '/* ─── alert';
const at = CSS.indexOf(marker);
if (at < 0) throw new Error('alert block not found — the marker moved');
/* Bounded, not to the end of the file. This read `CSS.slice(at)`, which was
   the same thing only while the alert block happened to be last — AF2-268
   appended the scheduler and calendar after it and this spec began reporting
   their variables as alert defects. A guard that silently widens when the file
   grows is measuring something other than what it names.
   The bound is the next CONTROL, not the next marker: the alert block carries
   a "the figure" sub-heading in the same marker style, so stopping at the next
   marker cuts the block in half and loses the per-tone rings. */
const endMarker = '/* ─── scheduler';
const end = CSS.indexOf(endMarker, at);
const ALERT_CSS = end < 0 ? CSS.slice(at) : CSS.slice(at, end);

const alert = useApexAlert();
let wrapper: ReturnType<typeof mount>;
afterEach(() => { alert.close(); wrapper?.unmount(); document.body.innerHTML = ''; });

describe('the --apex-alert-* layer', () => {
  it('names every variable with the library prefix', () => {
    /* Pando's stylesheet used a bare `--ring`, and the port brought it across.
       Every variable here is --apex-*; AF2-131/141/170 normalised the rest
       away, and this one arrived after that sweep had run. */
    const bare = [...ALERT_CSS.matchAll(/var\(\s*(--(?!apex-|bg-|fg-|border-|accent-|r-|t-|dur-|ease-|len)[a-z-]+)/g)]
      .map((m) => m[1]);
    expect([...new Set(bare)], 'no un-prefixed variables').toEqual([]);
  });

  it('gives every override a fallback, so the layer changes nothing by itself', () => {
    /* This is what makes the layer safe to add to a shipped control: with no
       --apex-alert-* set anywhere, every reference resolves to the value that
       was hard-coded before. An override without a fallback would render the
       part unstyled the moment the layer landed. */
    const refs = [...ALERT_CSS.matchAll(/var\(\s*(--apex-alert-[a-z-]+)([^)]*)\)/g)];
    expect(refs.length, 'the layer exists at all').toBeGreaterThan(10);

    const noFallback = refs
      .filter(([, name, rest]) => !rest.trim().startsWith(',')
        /* Set by the component at runtime rather than by a stylesheet: the
           per-tone ring, and the countdown's duration. */
        && !['--apex-alert-ring', '--apex-alert-life'].includes(name))
      .map(([, name]) => name);

    expect([...new Set(noFallback)], 'every variable falls back to its old value').toEqual([]);
  });

  it('sets the ring per tone, which is what the figure is coloured by', () => {
    for (const tone of ['success', 'danger', 'warn', 'info']) {
      expect(ALERT_CSS, `${tone} ring`).toContain(`[data-tone="${tone}"]{--apex-alert-ring:`);
    }
  });
});

describe('the ui map', () => {
  const mountWith = (ui: Record<string, string>) => mount(ApexAlert, {
    props: { ui },
    global: { plugins: [ApexUI] },
    attachTo: document.body,
  });

  it('reaches every part it names', async () => {
    wrapper = mountWith({
      overlay: 'x-overlay', panel: 'x-panel', close: 'x-close', figure: 'x-figure',
      content: 'x-content', title: 'x-title', text: 'x-text', changes: 'x-changes',
      actions: 'x-actions', footnote: 'x-footnote', timer: 'x-timer',
    });

    alert.confirm({
      title: 'Save?',
      message: 'Two fields change.',
      changes: [{ label: 'Capacity', from: 1, to: 2 }],
      footnote: 'Reversible for 30 days.',
      closable: true,
      autoClose: 5000,
      showTimer: true,
    });
    await wrapper.vm.$nextTick();

    /* Each key checked against its own element, not merely present somewhere
       in the tree — a map that put every class on the panel would pass a
       document-wide search. */
    const pairs: Array<[string, string]> = [
      ['.apex-alert-overlay', 'x-overlay'],
      ['.apex-alert', 'x-panel'],
      ['.apex-alert-close', 'x-close'],
      ['.apex-alert-figure', 'x-figure'],
      ['.apex-alert-content', 'x-content'],
      ['.apex-alert-title', 'x-title'],
      ['.apex-alert-text', 'x-text'],
      ['.apex-alert-changes', 'x-changes'],
      ['.apex-alert-actions', 'x-actions'],
      ['.apex-alert-footnote', 'x-footnote'],
      ['.apex-alert-timer', 'x-timer'],
    ];
    for (const [sel, cls] of pairs) {
      const el = document.querySelector(sel);
      expect(el, `${sel} rendered`).toBeTruthy();
      expect(el?.classList.contains(cls), `${sel} carries ${cls}`).toBe(true);
    }
  });

  it('is optional — nothing breaks without it', async () => {
    wrapper = mount(ApexAlert, { global: { plugins: [ApexUI] }, attachTo: document.body });
    alert.notify({ title: 'Plain' });
    await wrapper.vm.$nextTick();
    expect(document.querySelector('.apex-alert-title')?.textContent).toBe('Plain');
  });
});
