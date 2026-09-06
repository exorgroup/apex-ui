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

describe('a bar series with data labels renders', () => {
  /*
   * AF2-238c: the bar-label branch mapped over `barRects`, which was declared
   * sixty lines further down the same function — a const, so a TDZ throw for
   * every bar chart with labels turned on. It survived because nothing had
   * ever drawn a bar: no test, and the docs page did not exist yet.
   *
   * Labels ON is the whole point. Without `dataLabels` the branch is skipped
   * and this passes over the bug it exists for.
   */
  it('does not throw reaching bar geometry from the label pass', async () => {
    const w = mount(ApexChart, {
      props: {
        width: 600,
        height: 400,
        dataLabels: true,
        series: [{
          id: 'b',
          name: 'Revenue',
          type: 'bar',
          xKey: 'month',
          yKey: 'value',
          data: [{ month: 'Jan', value: 3 }, { month: 'Feb', value: 8 }],
        }],
      },
      attachTo: document.body,
    });
    await w.vm.$nextTick();
    expect(w.findAll('.apex-cht__bar').length, 'no bars drawn').toBeGreaterThan(0);
    w.unmount();
  });
});

describe('hovering the families that take the early branch', () => {
  /*
   * AF2-244. onMove returns early for radial, heatmap and treemap, and that
   * branch assigns to the module-scope `pointer` ref — which a `const pointer`
   * further down the same function shadowed for the entire scope. Reading it
   * was a TDZ throw, so hovering any of these crashed.
   *
   * The original had no collision: under the Options API the ref is
   * `this.pointer`. Dropping `this.` in the conversion to <script setup>
   * merged the two names, which is a hazard for every method this port
   * converted, not a one-off typo.
   *
   * Driven through the root's own pointermove, because the bug is in the
   * handler rather than in any geometry it computes.
   */
  const HOVERED: [string, unknown][] = [
    ['pie', [{ id: 'p', type: 'pie', data: [{ x: 'A', y: 3 }, { x: 'B', y: 5 }] }]],
    ['gauge', [{ id: 'g', type: 'gauge', data: [{ x: 'v', y: 62 }] }]],
    ['radar', [{ id: 'r', type: 'radar', data: [{ x: 'A', y: 3 }, { x: 'B', y: 5 }] }]],
    ['heatmap', [{ id: 'h', type: 'heatmap', data: [{ x: 'Mon', group: 'AM', value: 3 }] }]],
    ['treemap', [{ id: 't', type: 'treemap', nodes: [{ name: 'A', value: 3 }] }]],
  ];

  it.each(HOVERED)('%s does not throw on pointermove', async (_name, series) => {
    const w = mount(ApexChart, {
      props: { width: 600, height: 400, series },
      attachTo: document.body,
    });
    await w.vm.$nextTick();
    /* The handler lives on .apex-cht__plot, not the root. Triggering the root
       is why the first version of this test passed against the unfixed code —
       it dispatched into an element with no listener and proved nothing.
       Throws propagate out of trigger, so an unhandled TDZ fails the test. */
    const plot = w.find('.apex-cht__plot');
    expect(plot.exists(), 'no plot element to hover').toBe(true);
    await plot.trigger('pointermove', { clientX: 300, clientY: 200 });
    expect(w.find('.apex-cht').exists()).toBe(true);
    w.unmount();
  });
});
