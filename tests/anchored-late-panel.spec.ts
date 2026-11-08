import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import ApexInput from '../src/components/ApexInput.vue';

/**
 * A panel that MOUNTS after its overlay opened is still placed.
 *
 * Reported from Apex Till's supplier drawer (TL3/012): a server-backed
 * autocomplete showed nothing on the first search, and the right results on
 * the second. The input passed `:loading`, and ApexInput mounts its list only
 * when it has items or is not loading. So at the moment `open` turned true the
 * list did not exist; `place()` found no panel and returned; `ready` stayed
 * false; and when the answer arrived the list mounted with
 * `visibility: hidden` and nothing ever placed it. The second search worked
 * because by then the list was already mounted when it opened.
 *
 * The overlay now also places when the panel element appears while open.
 */

const ORIGINAL = Element.prototype.getBoundingClientRect;

beforeEach(() => {
  Element.prototype.getBoundingClientRect = function () {
    const panel = /apex-pop/.test(String((this as HTMLElement).className || ''));
    const width = panel ? 270 : 270;
    const height = panel ? 200 : 40;
    return {
      width, height, top: 100, left: 50, right: 50 + width, bottom: 100 + height,
      x: 50, y: 100, toJSON: () => ({}),
    } as DOMRect;
  };
});

afterEach(() => { Element.prototype.getBoundingClientRect = ORIGINAL; });

async function settle() {
  for (let i = 0; i < 4; i++) { await flushPromises(); await nextTick(); }
}

describe('a list that appears after the overlay opened', () => {
  it('is visible on the FIRST search of a loading autocomplete', async () => {
    const w = mount(ApexInput, {
      attachTo: document.body,
      props: { modelValue: '', suggestions: [], loading: true, delay: 0, label: 'Item' },
    });

    await w.find('input').setValue('pop');
    await settle();
    expect(w.find('.apex-pop').exists()).toBe(false); // loading, nothing yet: no list

    await w.setProps({ loading: false, suggestions: [{ value: 1, label: 'Popcorn' }] });
    await settle();

    const pop = w.find('.apex-pop');
    expect(pop.exists()).toBe(true);
    expect((pop.element as HTMLElement).style.visibility).toBe('visible');

    w.unmount();
  });
});
