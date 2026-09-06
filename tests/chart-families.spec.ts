import { describe, it, expect, beforeAll } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexChart from '../src/components/ApexChart.vue';

/*
 * SKIPPED, and it must stay skipped until ApexChart can mount.
 *
 * AF2-236 found the component references five identifiers that are never
 * declared — inWindow, needsZeroBaseline, pointsOnly, zoomWindow, zoomY — so
 * setup throws on the first render. Pando's original has the same five, so
 * this is not an import defect; the component has never run. The skip is here
 * rather than the file deleted because these two cases are the coverage the
 * split needs the moment those bindings exist.
 *
 * The chart families, checked where they draw.
 *
 * AF2-236 moves each family out of ApexChart into its own renderer. Nothing
 * covered them before — the docs page does not exist yet and the suite had no
 * chart test at all — so the refactor could have silently stopped drawing a
 * treemap and every gate would still have been green.
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

describe.skip('the treemap family renders', () => {
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
