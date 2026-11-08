import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexInput from '../src/components/ApexInput.vue';

/**
 * A floating input drops its placeholder so the label and the hint do not print over each
 * other (AF2-374). But a search box has NO label — it is named by `aria-label` — and dropping the
 * hint there left an empty box with a magnifier and nothing saying what to type. Found on TBX's
 * Subscribers and Blog screens, Phase AI.
 */
describe('ApexInput — the placeholder under a float label', () => {
  it('keeps the placeholder when there is no label to collide with', () => {
    const w = mount(ApexInput, { props: { labelPlacement: 'float-in', placeholder: 'Search email', ariaLabel: 'Search' } });

    expect(w.find('input').attributes('placeholder')).toBe('Search email');
  });

  it('still drops it when a label floats in the same space', () => {
    const w = mount(ApexInput, { props: { labelPlacement: 'float-in', label: 'Email', placeholder: 'you@example.com' } });

    expect(w.find('input').attributes('placeholder')).toBeUndefined();
  });

  it('keeps it for a label that does not float', () => {
    const w = mount(ApexInput, { props: { labelPlacement: 'top', label: 'Email', placeholder: 'you@example.com' } });

    expect(w.find('input').attributes('placeholder')).toBe('you@example.com');
  });
});
