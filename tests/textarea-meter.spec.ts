import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexTextarea from '../src/components/ApexTextarea.vue';

/**
 * A counter that says whether the length is GOOD, not just what it is — AC/003.
 *
 * `counter` rendered `56 / 160` as a line of text. That answers "how long is it"
 * and leaves the reader to work out "is that right", which for a share description
 * is the only question that matters: platforms cut off around 160 characters and
 * anything under about 70 looks thin.
 *
 * The Claude Design draws a bar beside the count, in three states:
 *
 *   short  under half the target   accent
 *   good   over half               success
 *   over   past the target         danger
 *
 * `target` is separate from `maxlength` on purpose. The target is advice; maxlength
 * is a wall. TBX's share description aims at 160 and is VALID up to 300, so a post
 * written at 200 must show red and still save. Collapsing the two would either block
 * text that is allowed, or stop warning at the point the warning is useful.
 */
const bar = (w: ReturnType<typeof mount>) => w.find('.apex-ctl__meter');
const fill = (w: ReturnType<typeof mount>) => w.find('.apex-ctl__meter > span');
const text = (w: ReturnType<typeof mount>) => w.find('.apex-ctl__counter').text();

describe('ApexTextarea — the counter meter', () => {
  it('renders no bar unless asked, so every existing counter is unchanged', () => {
    const w = mount(ApexTextarea, { props: { modelValue: 'hello', counter: true, maxlength: 160 } });
    expect(bar(w).exists()).toBe(false);
    expect(text(w).replace(/\s+/g, ' ')).toBe('5 / 160');
  });

  it('draws the bar when meter is set', () => {
    const w = mount(ApexTextarea, { props: { modelValue: 'hello', counter: true, meter: true, target: 160 } });
    expect(bar(w).exists()).toBe(true);
  });

  it('shows the TARGET as the denominator, not maxlength', () => {
    const w = mount(ApexTextarea, {
      props: { modelValue: 'x'.repeat(56), counter: true, meter: true, target: 160, maxlength: 300 },
    });
    expect(text(w).replace(/\s+/g, ' ')).toContain('56 / 160');
  });

  it('is short under half the target', () => {
    const w = mount(ApexTextarea, { props: { modelValue: 'x'.repeat(50), counter: true, meter: true, target: 160 } });
    expect(bar(w).attributes('data-state')).toBe('short');
  });

  it('is good over half the target', () => {
    const w = mount(ApexTextarea, { props: { modelValue: 'x'.repeat(120), counter: true, meter: true, target: 160 } });
    expect(bar(w).attributes('data-state')).toBe('good');
  });

  it('is over past the target — and still accepts the text below maxlength', () => {
    const w = mount(ApexTextarea, {
      props: { modelValue: 'x'.repeat(200), counter: true, meter: true, target: 160, maxlength: 300 },
    });
    expect(bar(w).attributes('data-state')).toBe('over');
    // The warning is advice. The wall is still 300.
    expect(w.find('textarea').attributes('maxlength')).toBe('300');
  });

  it('fills in proportion to the target, capped at full', () => {
    const half = mount(ApexTextarea, { props: { modelValue: 'x'.repeat(80), counter: true, meter: true, target: 160 } });
    expect(fill(half).attributes('style')).toContain('50%');

    const over = mount(ApexTextarea, { props: { modelValue: 'x'.repeat(400), counter: true, meter: true, target: 160 } });
    expect(fill(over).attributes('style')).toContain('100%');
  });

  it('falls back to maxlength when there is no target', () => {
    const w = mount(ApexTextarea, { props: { modelValue: 'x'.repeat(90), counter: true, meter: true, maxlength: 100 } });
    expect(bar(w).attributes('data-state')).toBe('good');
    expect(text(w).replace(/\s+/g, ' ')).toContain('90 / 100');
  });

  it('draws no bar with nothing to measure against', () => {
    // A meter needs a scale. Without target or maxlength, the text count is all there is.
    const w = mount(ApexTextarea, { props: { modelValue: 'hello', counter: true, meter: true } });
    expect(bar(w).exists()).toBe(false);
  });

  it('is announced as a meter', () => {
    const w = mount(ApexTextarea, { props: { modelValue: 'x'.repeat(40), counter: true, meter: true, target: 160 } });
    expect(bar(w).attributes('role')).toBe('meter');
    expect(bar(w).attributes('aria-valuenow')).toBe('40');
    expect(bar(w).attributes('aria-valuemax')).toBe('160');
  });
});
