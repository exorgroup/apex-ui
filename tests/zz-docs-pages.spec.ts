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

describe('a directive page documents a directive', () => {
  /*
   * A directive has no tag, so its usage snippet has to be a host element
   * carrying `v-<name>`. Nothing else here would notice if the snippet fell
   * back to the component form and told the reader to write
   * `<ApexRipple v-model="value" />`, which does not exist.
   */
  const DIRECTIVES = ENTRIES.filter((e) => e.directiveName);

  it('there are directive entries to check', () => {
    expect(DIRECTIVES.length).toBeGreaterThan(0);
  });

  it.each(DIRECTIVES.map((e) => [e.name, e.directiveName!] as const))(
    '%s uses v-%s',
    async (name, directive) => {
      const { wrapper, open } = await harness();
      await open(name);
      const snippet = wrapper.find('.usage').text();
      expect(snippet, `${name}'s usage snippet`).toContain(`v-${directive}`);
      expect(snippet, `${name} must not be shown as a component`).not.toContain(`<${name}`);
      wrapper.unmount();
    },
  );
});

describe('a slotText entry puts that text in the stage', () => {
  /*
   * Some controls are a box around their content — ApexMessage is nothing but
   * a tinted strip without children. `slotText` supplies that content, and if
   * the stage failed to pass it through, the page would still render, still
   * warn about nothing, and still pass every other test here: the reader would
   * just see an empty strip whose rail controls all looked inert.
   */
  const WITH_TEXT = ENTRIES.filter((e) => e.slotText);

  it('there are slotText entries to check', () => {
    expect(WITH_TEXT.length).toBeGreaterThan(0);
  });

  it.each(WITH_TEXT.map((e) => [e.name, e.slotText!] as const))(
    '%s',
    async (name, text) => {
      const { wrapper, open } = await harness();
      await open(name);
      expect(wrapper.find('.stage__demo').text(), `${name}'s stage`).toContain(text);
      wrapper.unmount();
    },
  );
});

describe('every overlay entry has a stage that does something', () => {
  /*
   * OverlayStage is one branch per id. An entry with demo: 'overlay' and no
   * matching branch renders an empty div — and nothing else notices. The page
   * renders, warns about nothing, has all its sections, and its props table is
   * perfect; the playground is just silently blank, with every rail control
   * apparently inert.
   *
   * That is exactly what shipped for ApexDynamicDialog and ApexConfirmPopup,
   * and the user found it, not the suite. A stage that opens something needs a
   * trigger, so requiring one button is the cheap version of the check.
   */
  const OVERLAYS = ENTRIES.filter((e) => e.demo === 'overlay');

  it('there are overlay entries to check', () => {
    expect(OVERLAYS.length).toBeGreaterThan(0);
  });

  it.each(OVERLAYS.map((e) => [e.name] as const))('%s', async (name) => {
    const { wrapper, open } = await harness();
    await open(name);
    const buttons = wrapper.findAll('.stage__demo button');
    expect(buttons.length, `${name}'s stage offers no trigger — is its OverlayStage branch missing?`)
      .toBeGreaterThan(0);
    wrapper.unmount();
  });
});

describe('the ported gallery examples are on the page', () => {
  /* Headings taken from APEX UI Gallery.html. A build cannot tell you a
     section is missing — only reading the rendered page can. */
  const EXPECTED: Record<string, string[]> = {
    ApexToolbar: ['Basic', 'Sizes and chrome', 'Centred content',
      'Custom — navigation bar', 'Sticky and wrapping'],
    ApexTabs: ['Basic and dynamic', 'Controlled', 'Scrollable', 'Select on focus',
      'Lazy', 'Disabled', 'Variants and placement', 'Badges and custom indicator',
      'Template', 'Tab menu'],
    ApexSteps: ['Horizontal', 'Vertical', 'Linear', 'Steps only', 'Template',
      'Events', 'Sizes and colours'],
    ApexSplitter: ['Basic and vertical', 'Sizes, minimum and maximum', 'Collapsible',
      'Nested', 'Resize events', 'Stateful', 'Disabled and custom', 'Advanced'],
    ApexPanel: ['Basic', 'Toggleable', 'Controlled', 'Indicator',
      'Header and footer templates', 'Sizes, colours and flush'],
    ApexFieldset: ['Basic', 'Toggleable', 'Controlled', 'Indicator',
      'Alignment, sizes and colours', 'Disabled'],
    ApexCard: ['Basic', 'With media', 'Advanced header — media plus an overlaid avatar',
      'As a form container', 'Horizontal and clickable'],
    ApexAccordion: ['Basic and multiple', 'Controlled', 'Indicator and trigger',
      'Rich headers and content', 'Disabled, sizes and separated cards',
      'Dynamic panels and lazy content', 'Keyboard'],
    ApexScrollArea: ['Vertical', 'Horizontal', 'Both axes', 'Scroll fade',
      'Variants', 'Custom bars', 'Inside a panel'],
    ApexOrderList: ['Selected', 'Control placement', 'Control alignment',
      'Without checkboxes', 'Buttons only'],
    ApexBadge: ['Basic', 'Severity', 'Size', 'Overlay', 'Button'],
    ApexSkeleton: ['Basic', 'Shapes', 'Text blocks', 'Animation and colour', 'Card',
      'List, grid and table'],
    ApexInplace: ['Basic', 'Controlled', 'Image', 'Lazy', 'Styling and states'],
    ApexStyleClass: ['Basic', 'Animation', 'Toggle class', 'Selector keywords',
      'Hide on resize'],
    ApexRipple: ['Default', 'Custom', 'On real controls', 'Disabled'],
    ApexFocusTrap: ['Basic', 'Initial focus', 'Disabled'],
    ApexAnimateOnScroll: ['Enter and leave', 'Once'],
    ApexTooltip: ['Basic', 'Position', 'Delay', 'Event', 'Auto hide', 'Custom',
      'Disabled and reactive'],
    ApexPopover: ['Basic', 'Controlled', 'One popover, several triggers', 'Placement',
      'Rich content'],
    ApexDrawer: ['Position', 'Responsive', 'Template', 'Floating and headless'],
    ApexDialog: ['Positions', 'Draggable, non-modal and timed'],
    ApexDynamicDialog: ['The service', 'Passing data, and returning a value', 'Stacking'],
    ApexConfirmPopup: ['Basic', 'Placement', 'Template', 'Headless'],
    ApexFileUpload: ['Basic', 'Auto', 'Advanced', 'Validation', 'Button styling',
      'Custom upload', 'Dropzone', 'Image preview', 'In a form'],
    ApexToast: ['Service', 'Severity', 'Timed close', 'Sticky', 'Promise', 'Position',
      'Expanded and stacked', 'Custom content and actions'],
    ApexMessage: ['Severity', 'Variant', 'Icon', 'Sizes', 'Blur', 'Closable and life',
      'Dynamic', 'In a form'],
    ApexBlockUI: ['Basic', 'Timed release', 'Styling', 'Document'],
    ApexScrollTop: ['Basic', 'Target element', 'Styling and placement'],
    ApexProgressSpinner: ['Indeterminate', 'Determinate', 'Size, stroke and colour',
      'In context'],
    ApexMeterGroup: ['Basic', 'Colour', 'Icons and labels', 'Vertical', 'Min and max',
      'Styling and interaction', 'Template'],
    ApexChip: ['Basic', 'Severity and variant', 'Sizes, icons and images', 'Selectable',
      'Styling and states'],
    ApexAvatar: ['Content', 'Sizes and shapes', 'Auto colour', 'Status', 'Badge', 'Groups',
      'Template'],
    ApexInput: ['Autocomplete', 'Icon slots', 'Affixes and transforms'],
    /* "Severity × variant" carries a real multiplication sign. It was once
       written as the six characters of its escape, which Vue renders
       literally in template text, so the page showed the backslash to the
       reader. Keeping it here means that cannot come back unnoticed. */
    ApexButton: ['Severity × variant', 'Raised', 'Rounded and icon-only', 'Icon position',
      'Badge', 'Link', 'Sizes and states'],
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
