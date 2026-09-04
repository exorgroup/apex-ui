import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexToolbar from '../src/components/ApexToolbar.vue';
import ApexTabs from '../src/components/ApexTabs.vue';
import ApexSteps from '../src/components/ApexSteps.vue';
import ApexSplitter from '../src/components/ApexSplitter.vue';
import ApexScrollArea from '../src/components/ApexScrollArea.vue';
import ApexPanel from '../src/components/ApexPanel.vue';
import ApexFieldset from '../src/components/ApexFieldset.vue';
import ApexCard from '../src/components/ApexCard.vue';
import ApexAccordion from '../src/components/ApexAccordion.vue';

/* Every container must take the ui map and put the class where the key says.
   Each case is [component, props, { uiKey: selector-it-must-land-on }]. */
const TABS = [
  { value: 'a', label: 'Sales', badge: 3 },
  { value: 'b', label: 'Refunds' },
];
const STEPS = [
  { value: 'one', label: 'Details', sub: 'Who is coming' },
  { value: 'two', label: 'Payment' },
];
const PANELS = [
  { value: 'p1', header: 'Opening hours', badge: 2, content: 'Nine to five.' },
  { value: 'p2', header: 'Access', content: 'Step-free.' },
];

describe('every container accepts the ui class map', () => {
  it('ApexToolbar', () => {
    const w = mount(ApexToolbar, {
      props: { ui: { root: 'x-root', region: 'x-region' } },
      slots: { start: '<span>left</span>', end: '<span>right</span>' },
    });
    expect(w.find('.apex-tbar').classes()).toContain('x-root');
    expect(w.findAll('.apex-tbar__region').every((r) => r.classes().includes('x-region'))).toBe(true);
  });

  it('ApexCard', () => {
    const w = mount(ApexCard, {
      props: {
        title: 'Sliema', subtitle: 'Northern Harbour', image: '/x.jpg',
        ui: { root: 'x-root', media: 'x-media', head: 'x-head', title: 'x-title', sub: 'x-sub', body: 'x-body', foot: 'x-foot' },
      },
      slots: { default: 'body', footer: 'foot' },
    });
    ['x-root', 'x-media', 'x-head', 'x-title', 'x-sub', 'x-body', 'x-foot']
      .forEach((c) => expect(w.find('.' + c).exists(), c).toBe(true));
  });

  it('ApexPanel', () => {
    const w = mount(ApexPanel, {
      props: {
        header: 'Fees', subheader: 'Per order', icon: 'payments', toggleable: true,
        ui: { root: 'x-root', head: 'x-head', toggle: 'x-toggle', icon: 'x-icon', title: 'x-title', sub: 'x-sub', body: 'x-body', foot: 'x-foot' },
      },
      slots: { default: 'body', footer: 'foot' },
    });
    ['x-root', 'x-head', 'x-toggle', 'x-icon', 'x-title', 'x-sub', 'x-body', 'x-foot']
      .forEach((c) => expect(w.find('.' + c).exists(), c).toBe(true));
  });

  it('ApexFieldset', () => {
    const w = mount(ApexFieldset, {
      props: {
        legend: 'Contact', icon: 'person', toggleable: true,
        ui: { root: 'x-root', legend: 'x-legend', label: 'x-label', toggle: 'x-toggle', icon: 'x-icon', body: 'x-body' },
      },
      slots: { default: 'body' },
    });
    ['x-root', 'x-legend', 'x-label', 'x-toggle', 'x-icon', 'x-body']
      .forEach((c) => expect(w.find('.' + c).exists(), c).toBe(true));
  });

  it('ApexAccordion', () => {
    const w = mount(ApexAccordion, {
      props: {
        items: PANELS, value: 'p1',
        ui: { root: 'x-root', panel: 'x-panel', heading: 'x-heading', head: 'x-head', toggle: 'x-toggle', title: 'x-title', badge: 'x-badge', body: 'x-body', inner: 'x-inner' },
      },
    });
    ['x-root', 'x-panel', 'x-heading', 'x-head', 'x-title', 'x-badge', 'x-body']
      .forEach((c) => expect(w.find('.' + c).exists(), c).toBe(true));
  });

  it('ApexTabs', () => {
    const w = mount(ApexTabs, {
      props: {
        tabs: TABS, modelValue: 'a',
        ui: { root: 'x-root', strip: 'x-strip', label: 'x-label', badge: 'x-badge', bar: 'x-bar', panels: 'x-panels' },
      },
    });
    ['x-root', 'x-strip', 'x-label', 'x-badge']
      .forEach((c) => expect(w.find('.' + c).exists(), c).toBe(true));
  });

  it('ApexSteps', () => {
    const w = mount(ApexSteps, {
      props: {
        steps: STEPS, modelValue: 'one',
        ui: { root: 'x-root', item: 'x-item', marker: 'x-marker', text: 'x-text', label: 'x-label', sub: 'x-sub' },
      },
    });
    ['x-root', 'x-item', 'x-marker', 'x-text', 'x-label']
      .forEach((c) => expect(w.find('.' + c).exists(), c).toBe(true));
  });

  it('ApexSplitter', () => {
    const w = mount(ApexSplitter, {
      props: { panels: [{ key: 'a' }, { key: 'b' }], ui: { root: 'x-root', panel: 'x-panel', gutter: 'x-gutter', grip: 'x-grip' } },
    });
    ['x-root', 'x-panel', 'x-gutter'].forEach((c) => expect(w.find('.' + c).exists(), c).toBe(true));
  });

  it('ApexScrollArea', () => {
    const w = mount(ApexScrollArea, {
      props: { ui: { root: 'x-root', viewport: 'x-viewport', content: 'x-content' } },
      slots: { default: '<p>long</p>' },
    });
    ['x-root', 'x-viewport', 'x-content'].forEach((c) => expect(w.find('.' + c).exists(), c).toBe(true));
  });
});

describe('the appearance props still reach the element after the rename', () => {
  it('each control writes its --apex-* variable', () => {
    const cases: Array<[unknown, Record<string, unknown>, string, string]> = [
      [ApexToolbar, { background: '#101820' }, '.apex-tbar', '--apex-toolbar-bg: #101820'],
      [ApexCard, { radius: '14px' }, '.apex-cd', '--apex-card-radius: 14px'],
      [ApexPanel, { headerBackground: '#16202C' }, '.apex-pn', '--apex-panel-head-bg: #16202C'],
      [ApexFieldset, { legendColor: '#7AA2F7' }, '.apex-fs', '--apex-fieldset-legend-fg: #7AA2F7'],
      [ApexScrollArea, { height: '200px' }, '.apex-sa', '--apex-scroll-h: 200px'],
    ];
    cases.forEach(([C, props, sel, expected]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = mount(C as any, { props });
      expect(w.find(sel).attributes('style') || '', expected).toContain(expected);
    });
  });
});


/* The connector was rendered only in the vertical branch, where the stylesheet
   hides it — so horizontal steps had no line between markers at all, and the
   markup in vertical was inert. It is drawn where the CSS styles it. */
describe('ApexSteps connector', () => {
  const THREE = [{ label: 'One' }, { label: 'Two' }, { label: 'Three' }];

  it('renders a rail between horizontal steps, but not after the last', () => {
    const w = mount(ApexSteps, { props: { steps: THREE, orientation: 'horizontal' } });
    expect(w.findAll('.apex-st__rail')).toHaveLength(THREE.length - 1);
  });

  it('hideConnector removes it', () => {
    const w = mount(ApexSteps, { props: { steps: THREE, orientation: 'horizontal', hideConnector: true } });
    expect(w.findAll('.apex-st__rail')).toHaveLength(0);
  });

  it('vertical draws its own rail from the item, so it renders no rail span', () => {
    const w = mount(ApexSteps, { props: { steps: THREE, orientation: 'vertical' } });
    expect(w.findAll('.apex-st__rail')).toHaveLength(0);
    expect(w.find('.apex-st').attributes('data-connector')).toBe('true');
  });
});
