import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import ApexOrderList from '../src/components/ApexOrderList.vue';

/**
 * Rows you can TYPE in, in a list you can reorder — AC/002c.
 *
 * ApexOrderList was built to reorder items: each row a label, the whole row
 * draggable, a click anywhere selecting it, Space and Enter toggling selection.
 * Every one of those is right for a list of names and wrong for a list of inputs.
 * The Claude Design's "Social profiles" is a list of inputs: a grip, a network name
 * and a URL box per row, in an order the operator drags.
 *
 * Put an input in the `item` slot and, before this:
 *
 *   - clicking into it SELECTED THE ROW
 *   - Space in it was preventDefault()ed and toggled selection — the keystroke was
 *     swallowed, so a value could not contain a space at all
 *   - pressing the mouse in it and moving started a DRAG of the row instead of
 *     selecting text
 *
 * Two changes. Events that start in an interactive control inside a row are left to
 * that control. And `handle` makes the grip the only place a drag can begin.
 */
const OPTIONS = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
];

function list(props: Record<string, unknown> = {}) {
  return mount(ApexOrderList, {
    props: { modelValue: OPTIONS, ...props },
    slots: { item: ({ item }: { item: { label: string } }) => [item.label, h('input', { class: 'url' })] },
    attachTo: document.body,
  });
}

const rows = (w: ReturnType<typeof mount>) => w.findAll('li[draggable]');

describe('ApexOrderList — editable rows', () => {
  it('a click inside an input in a row does not select the row', async () => {
    const w = list();
    await w.find('.url').trigger('click');
    expect(w.emitted('update:selection')).toBeUndefined();
  });

  it('a click on the row itself still selects it', async () => {
    const w = list();
    await rows(w)[0].trigger('click');
    expect(w.emitted('update:selection')).toBeTruthy();
  });

  it('Space typed in an input is not swallowed', async () => {
    const w = list();
    const input = w.find('.url');
    const ev = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    input.element.dispatchEvent(ev);

    expect(ev.defaultPrevented).toBe(false);
    expect(w.emitted('update:selection')).toBeUndefined();
  });

  it('Enter typed in an input is not swallowed either', async () => {
    const w = list();
    const ev = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    w.find('.url').element.dispatchEvent(ev);

    expect(ev.defaultPrevented).toBe(false);
  });

  it('Alt+Arrow in an input moves the caret, not the row', async () => {
    const w = list();
    const ev = new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true, cancelable: true });
    w.find('.url').element.dispatchEvent(ev);

    expect(w.emitted('update:modelValue')).toBeUndefined();
  });

  it('Space on the row itself still toggles it, so keyboard selection survives', async () => {
    const w = list();
    await rows(w)[0].trigger('keydown', { key: ' ' });
    expect(w.emitted('update:selection')).toBeTruthy();
  });

  it('without handle, a row is draggable as before', () => {
    const w = list();
    expect(rows(w)[0].attributes('draggable')).toBe('true');
  });

  it('with handle, no row is draggable until its grip is pressed', () => {
    const w = list({ handle: true });
    expect(rows(w).map((r) => r.attributes('draggable'))).toEqual(['false', 'false']);
  });

  it('with handle, pressing a grip arms that row and only that row', async () => {
    const w = list({ handle: true });
    await w.findAll('.apex-order__grip')[1].trigger('pointerdown');

    expect(rows(w).map((r) => r.attributes('draggable'))).toEqual(['false', 'true']);
  });

  it('with handle, the row disarms when the drag ends', async () => {
    const w = list({ handle: true });
    await w.findAll('.apex-order__grip')[0].trigger('pointerdown');
    await rows(w)[0].trigger('dragend');

    expect(rows(w)[0].attributes('draggable')).toBe('false');
  });

  it('numbers can be turned off', () => {
    expect(list().findAll('.apex-order__num')).toHaveLength(2);
    expect(list({ numbers: false }).findAll('.apex-order__num')).toHaveLength(0);
  });
});
