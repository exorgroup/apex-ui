import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexRadio from '../src/components/ApexRadio.vue';
import ApexRadioGroup from '../src/components/ApexRadioGroup.vue';
import ApexCheckbox from '../src/components/ApexCheckbox.vue';
import ApexCheckboxGroup from '../src/components/ApexCheckboxGroup.vue';
import ApexSwitch from '../src/components/ApexSwitch.vue';

const PLANS = [
  { value: 'free', label: 'Free', help: 'One event' },
  { value: 'pro', label: 'Pro', help: 'Ten events' },
  { value: 'max', label: 'Max', disabled: true },
];

describe('ApexRadio — the single control', () => {
  it('emits its own value, and reports checked against the shared model', async () => {
    const w = mount(ApexRadio, { props: { modelValue: 'a', value: 'b', label: 'B', name: 'g' } });
    expect(w.find('.apex-radio').attributes('data-checked')).toBe('false');
    await w.find('input').trigger('change');
    expect(w.emitted('update:modelValue')![0]).toEqual(['b']);
  });

  it('re-picking the chosen one is a no-op — a radio does not untick', async () => {
    const w = mount(ApexRadio, { props: { modelValue: 'b', value: 'b', label: 'B' } });
    expect(w.find('.apex-radio').attributes('data-checked')).toBe('true');
    await w.find('input').trigger('change');
    expect(w.emitted('update:modelValue')).toBeUndefined();
  });

  it('falls back to a generated name, so a lone radio still groups', () => {
    const w = mount(ApexRadio, { props: { value: 'x', label: 'X' } });
    expect(w.find('input').attributes('name')).toMatch(/^apex-radio/);
  });

  it('draws a field shell on its own, and none when bare', () => {
    expect(mount(ApexRadio, { props: { value: 'x', label: 'X' } })
      .find('.apex-field').exists()).toBe(true);
    expect(mount(ApexRadio, { props: { value: 'x', label: 'X', bare: true } })
      .find('.apex-field').exists()).toBe(false);
  });

  it('the label row is a class now, not an inline style', () => {
    const w = mount(ApexRadio, { props: { value: 'x', label: 'X', bare: true } });
    const lead = w.find('.apex-radio__lead');
    expect(lead.exists()).toBe(true);
    // The old markup carried display/gap/font-weight inline, beyond reach.
    expect(lead.attributes('style')).toBeUndefined();
  });
});

describe('ApexRadioGroup — composes ApexRadio, behaviour unchanged', () => {
  const group = (p: Record<string, unknown> = {}) =>
    mount(ApexRadioGroup, { props: { options: PLANS, label: 'Plan', ...p } });

  it('renders one row per option, all sharing a name', () => {
    const w = group();
    expect(w.findAllComponents(ApexRadio).length).toBe(3);
    const names = w.findAll('input').map((i) => i.attributes('name'));
    expect(new Set(names).size).toBe(1);
  });

  it('emits the chosen value', async () => {
    const w = group();
    await w.findAll('input')[1].trigger('change');
    expect(w.emitted('update:modelValue')![0]).toEqual(['pro']);
    expect(w.emitted('change')![0]).toEqual(['pro']);
  });

  it('marks the selected row and carries help text through', () => {
    const w = group({ modelValue: 'pro' });
    const rows = w.findAll('.apex-radio');
    expect(rows[1].attributes('data-checked')).toBe('true');
    expect(rows[0].find('.apex-radio__help').text()).toBe('One event');
  });

  it('a disabled option, and a disabled group, both block the input', () => {
    expect(group().findAll('input')[2].attributes('disabled')).toBeDefined();
    const off = group({ disabled: true });
    expect(off.findAll('input').every((i) => i.attributes('disabled') !== undefined)).toBe(true);
  });

  it('inline and columns reach the wrapper', () => {
    expect(group({ inline: true }).find('.apex-radios').attributes('data-inline')).toBe('true');
    const cols = group({ columns: 3 }).find('.apex-radios');
    expect(cols.attributes('data-cols')).toBe('3');
    expect(cols.attributes('style')).toContain('--apex-radio-cols: 3');
  });
});

describe('ApexCheckboxGroup — composes ApexCheckbox, behaviour unchanged', () => {
  const group = (p: Record<string, unknown> = {}) =>
    mount(ApexCheckboxGroup, { props: { options: PLANS, label: 'Plans', modelValue: [], ...p } });

  it('renders one box per option', () => {
    expect(group().findAllComponents(ApexCheckbox).length).toBe(3);
  });

  it('adds and removes from the array', async () => {
    const w = group();
    await w.findAll('input')[0].trigger('change');
    expect(w.emitted('update:modelValue')![0][0]).toEqual(['free']);

    const w2 = group({ modelValue: ['free', 'pro'] });
    await w2.findAll('input')[0].trigger('change');
    expect(w2.emitted('update:modelValue')![0][0]).toEqual(['pro']);
  });

  it('max disables the unchosen rows rather than silently refusing', () => {
    const w = group({ max: 1, modelValue: ['free'] });
    const inputs = w.findAll('input');
    expect(inputs[0].attributes('disabled')).toBeUndefined();  // still removable
    expect(inputs[1].attributes('disabled')).toBeDefined();
  });

  it('toggle-all selects everything enabled, then clears', async () => {
    const w = group({ toggleAll: true });
    await w.find('.apex-checks__all').trigger('click');
    expect(w.emitted('update:modelValue')![0][0]).toEqual(['free', 'pro']);

    const all = group({ toggleAll: true, modelValue: ['free', 'pro', 'max'] });
    await all.find('.apex-checks__all').trigger('click');
    expect(all.emitted('update:modelValue')![0][0]).toEqual([]);
  });

  it('columns and inline reach the wrapper', () => {
    const w = group({ columns: 2 });
    expect(w.find('.apex-checks').attributes('style')).toContain('--apex-check-cols: 2');
    expect(group({ inline: true }).find('.apex-checks').attributes('data-inline')).toBe('true');
  });
});

describe('ApexCheckbox — the single control', () => {
  it('binary mode flips a boolean', async () => {
    const w = mount(ApexCheckbox, { props: { modelValue: false, label: 'Agree' } });
    await w.find('input').trigger('change');
    expect(w.emitted('update:modelValue')![0]).toEqual([true]);
  });

  it('indeterminate reports mixed, and shows the dash rather than the tick', () => {
    const w = mount(ApexCheckbox, { props: { modelValue: false, indeterminate: true, label: 'All' } });
    expect(w.find('input').attributes('aria-checked')).toBe('mixed');
    expect(w.find('.apex-cb').attributes('data-indeterminate')).toBe('true');
  });

  it('a checked box is never also indeterminate', () => {
    const w = mount(ApexCheckbox, { props: { modelValue: true, indeterminate: true, label: 'All' } });
    expect(w.find('input').attributes('aria-checked')).toBe('true');
    expect(w.find('.apex-cb').attributes('data-indeterminate')).toBe('false');
  });
});

describe('ApexSwitch — the labels that used to do nothing', () => {
  it('renders neither word unless one is given', () => {
    const w = mount(ApexSwitch, { props: { modelValue: false, label: 'Live' } });
    expect(w.find('.apex-switch__text').exists()).toBe(false);
    expect(w.find('.apex-switch').attributes('data-labelled')).toBe('false');
  });

  it('renders both words, so the track can size to the longer', () => {
    const w = mount(ApexSwitch, {
      props: { modelValue: false, onLabel: 'ON', offLabel: 'DISABLED', label: 'Live' },
    });
    expect(w.find('.apex-switch').attributes('data-labelled')).toBe('true');
    // Both in the DOM at once: the hidden one still occupies the cell.
    expect(w.find('.apex-switch__on').text()).toBe('ON');
    expect(w.find('.apex-switch__off').text()).toBe('DISABLED');
  });

  it('data-on drives which word shows, and follows the model', async () => {
    const w = mount(ApexSwitch, { props: { modelValue: false, onLabel: 'ON', offLabel: 'OFF' } });
    expect(w.find('.apex-switch').attributes('data-on')).toBe('false');
    await w.setProps({ modelValue: true });
    expect(w.find('.apex-switch').attributes('data-on')).toBe('true');
  });

  it('still toggles by click and by keyboard', async () => {
    const w = mount(ApexSwitch, { props: { modelValue: false } });
    await w.find('button').trigger('click');
    expect(w.emitted('update:modelValue')![0]).toEqual([true]);
    await w.find('button').trigger('keydown.space');
    expect(w.emitted('update:modelValue')!.length).toBe(2);
  });

  it('the words are hidden from screen readers — role and aria-checked say it', () => {
    const w = mount(ApexSwitch, { props: { modelValue: true, onLabel: 'ON', offLabel: 'OFF' } });
    expect(w.find('.apex-switch__text').attributes('aria-hidden')).toBe('true');
    expect(w.find('button').attributes('role')).toBe('switch');
    expect(w.find('button').attributes('aria-checked')).toBe('true');
  });
});
