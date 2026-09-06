import { describe, it, expect, beforeAll } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexChart from '../src/components/ApexChart.vue';
import { seriesColor } from '../src/core/chart/layout';

/*
 * ApexChart's ui map, checked where each class has to land.
 *
 * The chart names sixty elements and the map covers twenty-six of them, so the
 * gap between "declared" and "consumed" is wider here than anywhere else in
 * the library — a key can be documented, typecheck, and reach nothing.
 *
 * The two keys worth the most are `tile` and `cell`: those elements are not in
 * ApexChart at all any more. They live in the renderers AF2-236 extracted, and
 * the only reason a map on the chart reaches them is that the chart hands it
 * down. Forget that and every other assertion here still passes.
 */

beforeAll(() => {
  if (!('ResizeObserver' in globalThis)) {
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      observe() {} unobserve() {} disconnect() {}
    };
  }
});

const SIZED = { width: 600, height: 400 };
const LINES = [
  { id: 'a', name: 'Sales', type: 'line', data: [{ x: 0, y: 3 }, { x: 1, y: 8 }, { x: 2, y: 5 }] },
  { id: 'b', name: 'Refunds', type: 'line', data: [{ x: 0, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 1 }] },
];

describe('ApexChart accepts the ui class map', () => {
  const w = mount(ApexChart, {
    props: {
      ...SIZED,
      series: LINES,
      title: 'Weekly',
      caption: 'Since Monday',
      ui: {
        root: 'x-root', svg: 'x-svg', plot: 'x-plot',
        head: 'x-head', title: 'x-title', caption: 'x-caption',
        legend: 'x-legend', key: 'x-key', swatch: 'x-swatch',
        axis: 'x-axis', tick: 'x-tick', grid: 'x-grid',
        series: 'x-series', line: 'x-line',
      },
    },
    attachTo: document.body,
  });

  it.each([
    ['.apex-cht', 'x-root'],
    ['.apex-cht__svg', 'x-svg'],
    ['.apex-cht__head', 'x-head'],
    ['.apex-cht__title', 'x-title'],
    ['.apex-cht__caption', 'x-caption'],
    ['.apex-cht__legend', 'x-legend'],
    ['.apex-cht__key', 'x-key'],
    ['.apex-cht__swatch', 'x-swatch'],
    ['.apex-cht__axis', 'x-axis'],
    ['.apex-cht__tick', 'x-tick'],
    ['.apex-cht__series', 'x-series'],
  ])('%s carries %s', (selector, cls) => {
    const found = w.findAll(selector);
    expect(found.length, `nothing matched ${selector}`).toBeGreaterThan(0);
    expect(found.every((e) => e.classes().includes(cls)), `${selector} is missing ${cls}`).toBe(true);
  });
});

describe('the map reaches the families that render themselves', () => {
  it('a treemap tile takes ui.tile', async () => {
    const w = mount(ApexChart, {
      props: {
        ...SIZED,
        series: [{ id: 't', type: 'treemap', nodes: [{ name: 'A', value: 3 }, { name: 'B', value: 2 }] }],
        ui: { tile: 'x-tile' },
      },
      attachTo: document.body,
    });
    await w.vm.$nextTick();
    const tiles = w.findAll('.apex-cht__tile');
    expect(tiles.length, 'no tiles — is ApexChartTreemap wired in?').toBeGreaterThan(0);
    expect(tiles.every((t) => t.classes().includes('x-tile')),
      'the chart must hand its ui map to ApexChartTreemap').toBe(true);
    w.unmount();
  });

  it('a heat cell takes ui.cell', async () => {
    const w = mount(ApexChart, {
      props: {
        ...SIZED,
        series: [{ id: 'h', type: 'heatmap', data: [{ x: 'Mon', group: 'AM', value: 3 }] }],
        ui: { cell: 'x-cell' },
      },
      attachTo: document.body,
    });
    await w.vm.$nextTick();
    const cells = w.findAll('.apex-cht__cell');
    expect(cells.length, 'no cells — is ApexChartHeat wired in?').toBeGreaterThan(0);
    expect(cells.every((c) => c.classes().includes('x-cell')),
      'the chart must hand its ui map to ApexChartHeat').toBe(true);
    w.unmount();
  });
});

describe('the chart writes its metrics as --apex-cht-* variables', () => {
  /*
   * Two inline variables and the eight-colour palette. The palette is the one
   * that would fail quietly: seriesColor returns `var(--apex-cht-series-N)`,
   * and if the stylesheet still declared the old name every series would draw
   * in the fallback colour with nothing reported anywhere.
   */
  it('the root carries the prefixed height, and no old name survives', () => {
    const w = mount(ApexChart, { props: { ...SIZED, series: LINES, height: '300px' } });
    const style = w.find('.apex-cht').attributes('style') || '';
    expect(style).toContain('--apex-cht-h');
    /* `--cht-h` is a substring of `--apex-cht-h`, so match it to its start. */
    expect(/(^|[^-])--cht-/.test(style)).toBe(false);
  });

  it('a series colour resolves through the prefixed palette', () => {
    /* Asserted on the function rather than the rendered markup: whether a
       stroke reaches the DOM depends on the renderer, the reveal clock and
       whether the series is canvas-drawn, and none of that is what this
       claim is about. seriesColor IS the palette lookup. */
    expect(seriesColor(0)).toBe('var(--apex-cht-series-1)');
    expect(seriesColor(8)).toBe('var(--apex-cht-series-1)');
    expect(seriesColor(1, undefined)).toBe('var(--apex-cht-series-2)');
  });
});
