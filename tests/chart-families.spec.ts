import { describe, it, expect, beforeAll } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexChart from '../src/components/ApexChart.vue';

/*
 * The chart families, checked where they draw.
 *
 * AF2-236 moves each family out of ApexChart into its own renderer. Nothing
 * covered them before — the docs page does not exist yet and the suite had no
 * chart test at all — so the refactor could have silently stopped drawing a
 * treemap and every gate would still have been green.
 *
 * These two spent one commit skipped: writing them is what found that
 * ApexChart could not mount at all. That is the argument for a test that
 * mounts the thing, however shallow — the build, the typecheck and every
 * other gate had been green over a component that threw on first render.
 *
 * These are deliberately shallow: one assertion that the family's own elements
 * are on the page, and one that the interaction it owns still works. Geometry
 * is core/chart's business and is not re-tested here.
 */

/* The chart measures itself; happy-dom has no observer and no layout. */
beforeAll(() => {
  if (!('ResizeObserver' in globalThis)) {
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      observe() {} unobserve() {} disconnect() {}
    };
  }
});

const TREE = [
  { name: 'Platform', value: 40, children: [{ name: 'API', value: 25 }, { name: 'Jobs', value: 15 }] },
  { name: 'Web', value: 30 },
  { name: 'Mobile', value: 20 },
];

/** A size, because a treemap laid out in a zero-width frame has no tiles. */
const SIZED = { width: 600, height: 400 };

describe('the treemap family renders', () => {
  it('draws a tile per node', async () => {
    const w = mount(ApexChart, {
      props: { ...SIZED, series: [{ id: 't', type: 'treemap', nodes: TREE }] },
      attachTo: document.body,
    });
    await w.vm.$nextTick();
    expect(w.find('.apex-cht__tree').exists(), 'no treemap group — is ApexChartTreemap wired in?').toBe(true);
    expect(w.findAll('.apex-cht__tile').length).toBeGreaterThan(0);
    w.unmount();
  });

  it('the breadcrumb appears once a drillable tile is opened', async () => {
    const w = mount(ApexChart, {
      props: { ...SIZED, series: [{ id: 't', type: 'treemap', nodes: TREE, depth: 1 }] },
      attachTo: document.body,
    });
    await w.vm.$nextTick();
    expect(w.find('.apex-cht__crumbs').exists(), 'a fresh chart is at the top level').toBe(false);

    /* The drill state stayed in ApexChart while the tiles moved out, so this
       is the one assertion that the emit still crosses that seam. */
    const drillable = w.findAll('.apex-cht__tile').find((t) => t.attributes('data-drillable') === 'true');
    expect(drillable, 'no drillable tile — the parent node should be one').toBeTruthy();
    await drillable!.trigger('click');
    expect(w.find('.apex-cht__crumbs').exists(), 'drilling in should raise a breadcrumb').toBe(true);
    w.unmount();
  });
});

const HEAT = [
  { x: 'Mon', group: 'Morning', value: 3 },
  { x: 'Mon', group: 'Evening', value: 8 },
  { x: 'Tue', group: 'Morning', value: 5 },
  { x: 'Tue', group: 'Evening', value: 1 },
];

describe('the heatmap family renders', () => {
  it('draws a cell per pair, and labels its own rows and columns', async () => {
    const w = mount(ApexChart, {
      props: { ...SIZED, series: [{ id: 'h', type: 'heatmap', data: HEAT }] },
      attachTo: document.body,
    });
    await w.vm.$nextTick();
    expect(w.find('.apex-cht__heat').exists(), 'no heat group — is ApexChartHeat wired in?').toBe(true);
    expect(w.findAll('.apex-cht__cell').length).toBe(4);
    /* Two columns and two rows, labelled by the grid rather than by the value
       axis — which is why ApexChart suppresses its own ticks for a heatmap. */
    expect(w.findAll('.apex-cht__tick').length).toBe(4);
    w.unmount();
  });

  it('a cell hover reaches the chart tooltip', async () => {
    const w = mount(ApexChart, {
      props: { ...SIZED, series: [{ id: 'h', type: 'heatmap', data: HEAT }] },
      attachTo: document.body,
    });
    await w.vm.$nextTick();
    expect(w.find('.apex-cht__tip').exists()).toBe(false);

    /* The grid moved out, the hit state did not: this is the emit crossing
       that seam. A cell that only highlighted itself would pass every other
       check here. */
    await w.findAll('.apex-cht__cell')[1].trigger('pointerenter');
    expect(w.find('.apex-cht__tip').exists(), 'hovering a cell should raise the tooltip').toBe(true);
    w.unmount();
  });
});
