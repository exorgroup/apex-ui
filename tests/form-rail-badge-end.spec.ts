import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import ApexForm from '../src/components/ApexForm.vue';

/**
 * The rail says a little more — AD/002 and AD/003.
 *
 * Settings › Payment's rail carries STATE, not just names: Stripe `off`, PayPal
 * `test`. And under the buttons, when no provider can take a card, a note says so —
 * "Online checkout is off" — because the rail is the one thing on the page that is
 * always in view.
 *
 *   section.railBadge   short text on that section's rail button, with an optional tone
 *   #rail-end           a slot under the rail buttons, inside the sticky rail
 *
 * An error count still wins over a badge: "this section has a problem" is worth more
 * than "this section is in test mode", and the rail button has room for one.
 */
const base = (sections: unknown[], layout = 'rail') => ({ layout, sections });
const SECTIONS = [
  { id: 'fees', title: 'Fees & tax', fields: [{ key: 'a', label: 'A', type: 'text' }] },
  { id: 'stripe', title: 'Stripe', railBadge: 'off', fields: [{ key: 'b', label: 'B', type: 'text' }] },
  { id: 'paypal', title: 'PayPal', railBadge: { text: 'test', tone: 'warn' }, fields: [{ key: 'c', label: 'C', type: 'text', rules: 'required' }] },
];

function form(schema: unknown, slots: Record<string, () => unknown> = {}) {
  return mount(ApexForm, {
    props: { schema, modelValue: { a: '', b: '', c: '' } },
    slots,
    attachTo: document.body,
  });
}

beforeEach(() => {
  (globalThis as never as { IntersectionObserver: unknown }).IntersectionObserver =
    class { observe() {} unobserve() {} disconnect() {} } as never;
  Element.prototype.scrollIntoView = vi.fn();
});

const buttons = (w: ReturnType<typeof mount>) => w.findAll('.apex-form__rail button');

describe('ApexForm rail — badges', () => {
  it('shows a string badge on its section', () => {
    const w = form(base(SECTIONS));
    expect(buttons(w)[1].find('.apex-form__railbadge').text()).toBe('off');
  });

  it('shows an object badge with its tone', () => {
    const b = form(base(SECTIONS)).findAll('.apex-form__rail button')[2].find('.apex-form__railbadge');
    expect(b.text()).toBe('test');
    expect(b.attributes('data-tone')).toBe('warn');
  });

  it('draws nothing on a section without one', () => {
    expect(buttons(form(base(SECTIONS)))[0].find('.apex-form__railbadge').exists()).toBe(false);
  });

  it('gives way to an error count', async () => {
    const w = form(base(SECTIONS));
    (w.vm as never as { submit: () => void }).submit();   // `c` is required and empty
    await w.vm.$nextTick();

    const paypal = buttons(w)[2];
    expect(paypal.find('em').exists()).toBe(true);
    expect(paypal.find('.apex-form__railbadge').exists()).toBe(false);
  });
});

describe('ApexForm rail — #rail-end', () => {
  it('renders under the rail buttons, inside the rail', () => {
    const w = form(base(SECTIONS), { 'rail-end': () => h('p', { class: 'note' }, 'Online checkout is off') });
    expect(w.find('.apex-form__rail .apex-form__railend .note').text()).toBe('Online checkout is off');
  });

  it('adds nothing when not filled', () => {
    expect(form(base(SECTIONS)).find('.apex-form__railend').exists()).toBe(false);
  });

  it('has nowhere to render on a layout without a rail', () => {
    const w = form(base(SECTIONS, 'long'), { 'rail-end': () => h('p', { class: 'note' }, 'x') });
    expect(w.find('.note').exists()).toBe(false);
  });
});
