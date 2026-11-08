import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexChart from '../src/components/ApexChart.vue';

/**
 * A stacked weekly bar chart, in the shape a report hands it.
 *
 * `ApexChart` had never been used by a consuming app when this was written, and the first use
 * of a component is where its assumptions surface — the first `rowExpansion` in TBX cost a
 * phase's worth of small discoveries. This pins the arrangement a VAT report needs before that
 * report depends on it: two bar series over the same weekly rows, keyed by field name, stacked,
 * with one series usually near zero.
 *
 * ## What this can and cannot check
 *
 * The chart measures its container before drawing anything that depends on layout, and in
 * jsdom a container has no width. So the axes, the tick labels and the legend are all
 * `v-if`'d out here — `w.text()` comes back empty even though the same props render a full
 * chart in a browser. That is a limit of the harness, and worth stating plainly so the next
 * person does not read the absence as a broken legend.
 *
 * What it does check is the part a host can get wrong on its own: that this series shape is
 * accepted, that marks are drawn from it, and that the two states a VAT report hits most —
 * a refund series of all zeroes, and a period with no weeks at all — do not throw.
 */

const WEEKS = [
  { week: '2026-08-31', label: 'w/c 31 Aug', collected: 2972.03, reversed: 120.5 },
  { week: '2026-09-07', label: 'w/c 7 Sep', collected: 3418.44, reversed: 0 },
  { week: '2026-09-14', label: 'w/c 14 Sep', collected: 3607.95, reversed: 554.24 },
];

const series = (rows: Record<string, unknown>[] = WEEKS) => [
  { id: 'collected', name: 'Collected', type: 'bar' as const, data: rows, xKey: 'label', yKey: 'collected' },
  { id: 'reversed', name: 'Reversed on refund', type: 'bar' as const, data: rows, xKey: 'label', yKey: 'reversed' },
];

const chart = (props: Record<string, unknown> = {}) => mount(ApexChart, {
  props: {
    series: series(),
    stackMode: 'normal',
    height: 180,
    legend: { show: true, position: 'bottom', align: 'start' },
    ...props,
  } as any,
});

describe('a weekly VAT chart', () => {
  it('accepts two bar series over the same rows and draws them', () => {
    const w = chart();

    expect(w.find('figure.apex-cht').exists()).toBe(true);
    expect(w.attributes('data-family')).toBe('cartesian');
    /* Marks, not an empty frame that happened to accept the props. */
    expect(w.findAll('rect').length).toBeGreaterThan(0);
  });

  it('is a vertical bar chart, not a line that took the props', () => {
    expect(chart().attributes('data-orientation')).toBe('vertical');
  });

  it('survives a series that is entirely zero', () => {
    /* The ordinary case for a VAT report: most weeks have no refunds at all, and a chart that
       threw in a quiet month would be worse than one drawing a flat series. */
    const quiet = WEEKS.map((r) => ({ ...r, reversed: 0 }));

    expect(chart({ series: series(quiet) }).find('figure.apex-cht').exists()).toBe(true);
  });

  it('survives having no weeks at all', () => {
    /* An empty period is an ordinary state on a report — pick a week nothing sold in. */
    expect(chart({ series: series([]) }).find('figure.apex-cht').exists()).toBe(true);
  });

  it('survives a single week, where there is no range to scale across', () => {
    expect(chart({ series: series([WEEKS[0]]) }).find('figure.apex-cht').exists()).toBe(true);
  });
});
