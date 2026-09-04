import { describe, it, expect, beforeAll, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexUI from '../src/index';
import App from '../../apex-ui-docs/src/App.vue';
import { ENTRIES } from '../../apex-ui-docs/src/registry';

/**
 * Every docs page must actually render.
 *
 * Until now this was a scratch harness rebuilt by hand each round, which is
 * why an unrendered page could sit there unnoticed: `vite build` compiles the
 * template without ever mounting it, so a section that throws at runtime — a
 * missing ref, a component that is not registered, a v-for over undefined —
 * builds perfectly and is blank in the browser.
 *
 * Mounting is also what proves a ported example is live rather than quoted.
 */

/* ScrollArea and Splitter measure themselves; happy-dom has no observer. */
beforeAll(() => {
  if (!('ResizeObserver' in globalThis)) {
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      observe() {} unobserve() {} disconnect() {}
    };
  }
});

/** Mount once and hand back a page-opener, so 45 pages cost one mount. */
async function harness() {
  const warnings: string[] = [];
  vi.spyOn(console, 'warn').mockImplementation((...a) => { warnings.push(a.join(' ')); });
  vi.spyOn(console, 'error').mockImplementation((...a) => { warnings.push(a.join(' ')); });

  const wrapper = mount(App, { global: { plugins: [ApexUI] }, attachTo: document.body });

  const open = async (name: string) => {
    const link = wrapper.findAll('.navitem').find((b) => b.text() === name);
    if (!link) throw new Error(`no sidebar link named ${name}`);
    warnings.length = 0;
    await link.trigger('click');
    return warnings;
  };
  return { wrapper, open };
}

describe('every control page renders', () => {
  it.each(ENTRIES.map((e) => [e.name] as const))('%s', async (name) => {
    const { wrapper, open } = await harness();
    const warnings = await open(name);
    expect(warnings, `${name} warned while rendering`).toEqual([]);
    expect(wrapper.find('main').text().length).toBeGreaterThan(0);
    wrapper.unmount();
  });
});

describe('the ported gallery examples are on the page', () => {
  /* Headings taken from APEX UI Gallery.html. A build cannot tell you a
     section is missing — only reading the rendered page can. */
  const EXPECTED: Record<string, string[]> = {
    ApexToolbar: ['Basic', 'Sizes and chrome', 'Centred content',
      'Custom — navigation bar', 'Sticky and wrapping'],
  };

  it.each(Object.entries(EXPECTED))('%s', async (name, headings) => {
    const { wrapper, open } = await harness();
    await open(name);
    const found = wrapper.findAll('main h2').map((h) => h.text());
    const missing = headings.filter((h) => !found.includes(h));
    expect(missing, `${name} is missing gallery sections`).toEqual([]);
    wrapper.unmount();
  });
});
