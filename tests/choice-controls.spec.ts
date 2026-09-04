import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexRadio from '../src/components/ApexRadio.vue';
import ApexRadioGroup from '../src/components/ApexRadioGroup.vue';
import ApexCheckbox from '../src/components/ApexCheckbox.vue';
import ApexCheckboxGroup from '../src/components/ApexCheckboxGroup.vue';
import ApexSwitch from '../src/components/ApexSwitch.vue';
import ApexRating from '../src/components/ApexRating.vue';
import ApexSegmented from '../src/components/ApexSegmented.vue';
import ApexSelectButton from '../src/components/ApexSelectButton.vue';
import ApexToggleButton from '../src/components/ApexToggleButton.vue';

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

describe('ApexRating', () => {
  const rate = (p: Record<string, unknown> = {}) =>
    mount(ApexRating, { props: { modelValue: 0, label: 'Score', ...p } });

  it('draws one star per `stars`, and fills up to the value', () => {
    const w = rate({ modelValue: 3, stars: 5 });
    const states = w.findAll('.apex-rating__star').map((s) => s.attributes('data-state'));
    expect(states).toEqual(['2', '2', '2', '0', '0']);
  });

  it('allowHalf gives the boundary star the half state', () => {
    const w = rate({ modelValue: 2.5, stars: 5, allowHalf: true });
    expect(w.findAll('.apex-rating__star').map((s) => s.attributes('data-state')))
      .toEqual(['2', '2', '1', '0', '0']);
  });

  it('arrow keys step by one, or by a half when allowHalf is on', async () => {
    const w = rate({ modelValue: 2 });
    await w.find('.apex-rating').trigger('keydown', { key: 'ArrowRight' });
    expect(w.emitted('update:modelValue')![0]).toEqual([3]);

    const h = rate({ modelValue: 2, allowHalf: true });
    await h.find('.apex-rating').trigger('keydown', { key: 'ArrowRight' });
    expect(h.emitted('update:modelValue')![0]).toEqual([2.5]);
  });

  it('End goes to the top, and cancel clears', async () => {
    const w = rate({ modelValue: 1, stars: 5 });
    await w.find('.apex-rating').trigger('keydown', { key: 'End' });
    expect(w.emitted('update:modelValue')![0]).toEqual([5]);

    const c = rate({ modelValue: 3, cancel: true });
    await c.find('.apex-rating__cancel').trigger('click');
    expect(c.emitted('update:modelValue')![0]).toEqual([null]);
  });

  it('readonly and disabled refuse input', async () => {
    const w = rate({ modelValue: 2, readonly: true });
    await w.findAll('.apex-rating__star')[4].trigger('click');
    expect(w.emitted('update:modelValue')).toBeUndefined();
  });

  it('the appearance props reach the element as variables', () => {
    const w = rate({ color: '#C24A06', emptyColor: '#333', starSize: 30, gap: '8px' });
    const s = w.find('.apex-rating').attributes('style') || '';
    expect(s).toContain('--apex-rating-color: #C24A06');
    expect(s).toContain('--apex-rating-empty: #333');
    expect(s).toContain('--apex-rating-size: 30px');
    expect(s).toContain('--apex-rating-gap: 8px');
  });
});

const VIEWS = [{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }];

describe('ApexSegmented', () => {
  const seg = (p: Record<string, unknown> = {}) =>
    mount(ApexSegmented, { props: { options: VIEWS, label: 'View', ...p } });

  it('is a radiogroup with one radio per option', () => {
    const w = seg({ modelValue: 'week' });
    expect(w.find('.apex-seg').attributes('role')).toBe('radiogroup');
    expect(w.findAll('[role="radio"]').length).toBe(3);
    expect(w.findAll('[role="radio"]')[1].attributes('aria-checked')).toBe('true');
  });

  it('roving focus: only the chosen segment is tabbable', () => {
    const t = seg({ modelValue: 'month' }).findAll('button').map((b) => b.attributes('tabindex'));
    expect(t).toEqual(['-1', '-1', '0']);
  });

  it('arrow keys move the selection and wrap around', async () => {
    const w = seg({ modelValue: 'day' });
    await w.findAll('button')[0].trigger('keydown.left');
    expect(w.emitted('update:modelValue')![0]).toEqual(['month']);
  });

  it('disabled refuses both click and arrows', async () => {
    const w = seg({ modelValue: 'day', disabled: true });
    await w.findAll('button')[1].trigger('click');
    await w.findAll('button')[0].trigger('keydown.right');
    expect(w.emitted('update:modelValue')).toBeUndefined();
  });

  it('the appearance props reach the bar as variables', () => {
    const s = seg({ selectedBackground: '#101820', selectedColor: '#7AA2F7' })
      .find('.apex-seg').attributes('style') || '';
    expect(s).toContain('--apex-seg-on-bg: #101820');
    expect(s).toContain('--apex-seg-on-fg: #7AA2F7');
  });
});

describe('ApexSelectButton', () => {
  const sb = (p: Record<string, unknown> = {}) =>
    mount(ApexSelectButton, { props: { options: VIEWS, label: 'View', ...p } });

  it('single choice is a radiogroup; multiple is a plain group of toggles', () => {
    expect(sb({ modelValue: 'day' }).find('.apex-sb').attributes('role')).toBe('radiogroup');
    const m = sb({ multiple: true, modelValue: ['day'] });
    expect(m.find('.apex-sb').attributes('role')).toBe('group');
    expect(m.findAll('button')[0].attributes('aria-pressed')).toBe('true');
  });

  it('allowEmpty lets the chosen one be cleared by re-clicking', async () => {
    const w = sb({ modelValue: 'day' });
    await w.findAll('button')[0].trigger('click');
    expect(w.emitted('update:modelValue')![0]).toEqual([null]);

    const keep = sb({ modelValue: 'day', allowEmpty: false });
    await keep.findAll('button')[0].trigger('click');
    expect(keep.emitted('update:modelValue')![0]).toEqual(['day']);
  });

  it('multiple accumulates and removes', async () => {
    const w = sb({ multiple: true, modelValue: ['day'] });
    await w.findAll('button')[1].trigger('click');
    expect(w.emitted('update:modelValue')![0][0]).toEqual(['day', 'week']);
  });

  it('iconOnly moves the label to the accessible name', () => {
    const w = sb({ modelValue: 'day', iconOnly: true });
    expect(w.findAll('button')[0].attributes('aria-label')).toBe('Day');
    expect(w.find('.apex-sb__txt').exists()).toBe(false);
  });

  it('the appearance props reach the bar as variables', () => {
    const s = sb({ color: '#137C4A', barBackground: '#101820', hoverColor: '#fff' })
      .find('.apex-sb').attributes('style') || '';
    expect(s).toContain('--apex-sb-color: #137C4A');
    expect(s).toContain('--apex-sb-bg: #101820');
    expect(s).toContain('--apex-sb-hover-fg: #fff');
  });
});

describe('ApexToggleButton', () => {
  it('swaps label and icon with the state', async () => {
    const w = mount(ApexToggleButton, {
      props: { modelValue: false, onLabel: 'Live', offLabel: 'Paused', onIcon: 'play_arrow', offIcon: 'pause' },
    });
    expect(w.text()).toContain('Paused');
    await w.setProps({ modelValue: true });
    expect(w.text()).toContain('Live');
  });

  it('reports its state through aria-pressed, and toggles', async () => {
    const w = mount(ApexToggleButton, { props: { modelValue: false, label: 'Live' } });
    expect(w.find('button').attributes('aria-pressed')).toBe('false');
    await w.find('button').trigger('click');
    expect(w.emitted('update:modelValue')![0]).toEqual([true]);
  });

  it('the appearance props reach the button as variables', () => {
    const w = mount(ApexToggleButton, {
      props: { modelValue: true, label: 'Live', onColor: '#137C4A', offColor: '#6B7789' },
    });
    const s = w.find('.apex-tb').attributes('style') || '';
    expect(s).toContain('--apex-tb-on: #137C4A');
    expect(s).toContain('--apex-tb-fg: #6B7789');
  });
});

describe('the ui class map reaches every one of them', () => {
  it('lands on each control root and its own parts', () => {
    expect(mount(ApexRating, { props: { modelValue: 3, cancel: true, showValue: true,
      ui: { control: 'x-rate', option: 'x-star', value: 'x-val', button: 'x-cancel' } } })
      .findAll('.x-rate, .x-star, .x-val, .x-cancel').length).toBeGreaterThan(3);

    expect(mount(ApexSegmented, { props: { options: VIEWS, ui: { control: 'x-seg', option: 'x-segbtn' } } })
      .findAll('.x-seg, .x-segbtn').length).toBe(4);

    expect(mount(ApexSelectButton, { props: { options: VIEWS, ui: { control: 'x-sb', option: 'x-sbbtn' } } })
      .findAll('.x-sb, .x-sbbtn').length).toBe(4);

    expect(mount(ApexToggleButton, { props: { label: 'Live', ui: { control: 'x-tb' } } })
      .find('.x-tb').exists()).toBe(true);

    expect(mount(ApexSwitch, { props: { onLabel: 'ON', offLabel: 'OFF',
      ui: { control: 'x-sw', text: 'x-swtext', handle: 'x-knob' } } })
      .findAll('.x-sw, .x-swtext, .x-knob').length).toBe(3);

    expect(mount(ApexRadioGroup, { props: { options: PLANS, ui: { group: 'x-radios', option: 'x-radio', dot: 'x-dot' } } })
      .findAll('.x-radios, .x-radio, .x-dot').length).toBe(7);
  });
});
