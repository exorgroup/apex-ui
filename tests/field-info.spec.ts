import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexUI from '../src/index';
import ApexField from '../src/components/ApexField.vue';
import ApexNumber from '../src/components/ApexNumber.vue';
import { APEX_FIELD_KEYS } from '../src/core/utils';

/**
 * `info` — the ⓘ after a field's label (TBX CB/025, Moodle's help icon).
 *
 * Pinned: it reaches every control (the forwarding list is the trap — "anything left out here
 * silently never reaches ApexField"), the button is a real button inside the label with a name,
 * and it opens and closes the popover. Escape and click-outside are ApexPopover's, already pinned.
 */
const opts = { global: { plugins: [ApexUI] }, attachTo: document.body };

describe('ApexField info', () => {
  it('is forwarded by every control', () => {
    expect(APEX_FIELD_KEYS).toContain('info');
  });

  it('draws no button without it', () => {
    const w = mount(ApexField, { props: { label: 'Max' }, ...opts });
    expect(w.find('.apex-field__info').exists()).toBe(false);
    w.unmount();
  });

  it('puts a named button inside the label', () => {
    const w = mount(ApexField, { props: { label: 'Max applications', info: 'First N.' }, ...opts });
    const btn = w.find('.apex-field__label .apex-field__info');
    expect(btn.exists()).toBe(true);
    expect(btn.attributes('type')).toBe('button');
    expect(btn.attributes('aria-label')).toBe('About Max applications');
    expect(btn.attributes('aria-expanded')).toBe('false');
    w.unmount();
  });

  it('opens and closes on click', async () => {
    const w = mount(ApexField, { props: { label: 'Max', info: 'First N.' }, ...opts });
    const btn = w.find('.apex-field__info');
    await btn.trigger('click');
    expect(btn.attributes('aria-expanded')).toBe('true');
    await btn.trigger('click');
    expect(btn.attributes('aria-expanded')).toBe('false');
    w.unmount();
  });

  it('reaches ApexField through a control', () => {
    const w = mount(ApexNumber, { props: { label: 'Max', info: 'First N.', modelValue: 0 }, ...opts });
    expect(w.find('.apex-field__info').exists()).toBe(true);
    w.unmount();
  });
});
