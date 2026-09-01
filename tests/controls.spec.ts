import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexInput from '../src/components/ApexInput.vue';
import ApexSwitch from '../src/components/ApexSwitch.vue';
import { evalCondition } from '../src/core/conditions';

describe('evalCondition', () => {
  it('defaults `field` to value', () => {
    expect(evalCondition({ eq: 3 }, { value: 3 })).toBe(true);
    expect(evalCondition({ gt: 10 }, { value: 4 })).toBe(false);
  });
  it('combines with all/any/not', () => {
    const scope = { value: 5, plan: 'pro' };
    expect(evalCondition({ all: [{ gte: 5 }, { field: 'plan', eq: 'pro' }] }, scope)).toBe(true);
    expect(evalCondition({ not: { gte: 5 } }, scope)).toBe(false);
  });
});

describe('ApexInput', () => {
  it('emits the transformed value for slug type', async () => {
    const w = mount(ApexInput, { props: { modelValue: '', type: 'slug', label: 'Slug' } });
    await w.find('input').setValue('Hello World!');
    expect(w.emitted('update:modelValue')?.at(-1)?.[0]).toBe('hello-world');
  });

  it('applies a matching rule tone and message', () => {
    const w = mount(ApexInput, {
      props: { modelValue: '3', label: 'Qty', rules: [{ when: { eq: '3' }, tone: 'danger', message: 'Three is not allowed' }] },
    });
    expect(w.find('.apex-field').attributes('data-tone')).toBe('danger');
    expect(w.text()).toContain('Three is not allowed');
  });

  it('wires aria-describedby to the message', () => {
    const w = mount(ApexInput, { props: { modelValue: '', label: 'Name', help: 'Legal name' } });
    const id = w.find('input').attributes('aria-describedby');
    expect(id).toBeTruthy();
    expect(w.find(`#${id}`).text()).toContain('Legal name');
  });
});

describe('ApexSwitch', () => {
  it('toggles and reports role=switch state', async () => {
    const w = mount(ApexSwitch, { props: { modelValue: false, label: 'Proof of play' } });
    const btn = w.find('button[role="switch"]');
    expect(btn.attributes('aria-checked')).toBe('false');
    await btn.trigger('click');
    expect(w.emitted('update:modelValue')?.[0]?.[0]).toBe(true);
  });
});
