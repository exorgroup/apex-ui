import { describe, it, expect, beforeAll } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import ApexChart from '../src/components/ApexChart.vue';
import { ApexChartSeries, ApexChartXAxis, ApexChartYAxis, ApexChartY2Axis,
  ApexChartTitle, ApexChartCaption, ApexChartLegend, ApexChartTooltip,
  ApexChartHover, ApexChartReferenceLine } from '../src/index';

beforeAll(() => {
  if (!('ResizeObserver' in globalThis)) {
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      observe() {} unobserve() {} disconnect() {}
    };
  }
});

const D = [{ month: 'Jan', value: 3 }, { month: 'Feb', value: 8 }];

/*
 * The compound authoring surface, with more than one part.
 *
 * AF2-238d: the registry replaced `parts[kind]` with a new Map on every write,
 * and each part registers inside a watchEffect that READS `parts[kind]`. So one
 * part was fine — Vue does not re-run an effect on its own write — and two
 * ping-ponged forever: "Maximum recursive updates exceeded".
 *
 * Which is why the first case here is deliberately the boring one and the
 * others declare several parts: a single-part test passes over the bug.
 */
describe('compound components register without recursing', () => {
  it('one series — the case that never caught it', async () => {
    const w = mount(ApexChart, {
      props: { width: 600, height: 400 },
      slots: { default: () => [h(ApexChartSeries, { id: 'a', name: 'A', data: D, xKey: 'month', yKey: 'value' })] },
      attachTo: document.body,
    });
    await w.vm.$nextTick();
    expect(w.find('.apex-cht').exists()).toBe(true);
    w.unmount();
  });

  it('two series and a second axis', async () => {
    const w = mount(ApexChart, {
      props: { width: 600, height: 400 },
      slots: { default: () => [
        h(ApexChartXAxis, { type: 'category' }),
        h(ApexChartYAxis, { label: 'Revenue' }),
        h(ApexChartY2Axis, { label: 'Conversion %' }),
        h(ApexChartSeries, { id: 'a', name: 'A', type: 'bar', data: D, xKey: 'month', yKey: 'value' }),
        h(ApexChartSeries, { id: 'b', name: 'B', type: 'line', axis: 'right', data: D, xKey: 'month', yKey: 'value' }),
      ] },
      attachTo: document.body,
    });
    await w.vm.$nextTick();
    expect(w.find('.apex-cht').exists()).toBe(true);
    w.unmount();
  });

  it('the full compound set', async () => {
    const w = mount(ApexChart, {
      props: { width: 600, height: 400, stackMode: 'normal' },
      slots: { default: () => [
        h(ApexChartTitle, { text: 'Revenue' }),
        h(ApexChartCaption, { text: 'Stacked' }),
        h(ApexChartXAxis, { type: 'category' }),
        h(ApexChartYAxis, { label: 'Revenue' }),
        h(ApexChartY2Axis, { label: 'Conversion %' }),
        h(ApexChartSeries, { id: 'a', name: 'A', type: 'bar', stack: 'rev', data: D, xKey: 'month', yKey: 'value' }),
        h(ApexChartSeries, { id: 'b', name: 'B', type: 'line', axis: 'right', data: D, xKey: 'month', yKey: 'value' }),
        h(ApexChartReferenceLine, { value: 5, label: 'Plan' }),
        h(ApexChartLegend, { position: 'bottom' }),
        h(ApexChartTooltip, { mode: 'shared-x' }),
        h(ApexChartHover, { dimOpacity: 0.3 }),
      ] },
      attachTo: document.body,
    });
    await w.vm.$nextTick();
    expect(w.find('.apex-cht').exists()).toBe(true);
    w.unmount();
  });
});
