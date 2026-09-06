import { describe, it, expect, beforeAll, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexTaskBoard from '../src/components/ApexTaskBoard.vue';

/*
 * Dragging a card — the board's headline interaction, and until AF2-242 the
 * only significant one with no test at all.
 *
 * board-ui.spec declined to cover it because a drag "needs a pointer sequence
 * over measured geometry that happy-dom does not provide". True of the DROP,
 * which resolves through elementsFromPoint and live rects. Not true of the
 * PICKUP: beginDrag runs on the first pointermove past a 5px threshold, long
 * before geometry is consulted, so the part that was crashing needed no
 * geometry to reach. That reasoning is what kept a ReferenceError in shipped
 * code — `index` was read in beginDrag and never put into `pending`, so every
 * drag on every board died on the first move.
 *
 * So the file is split deliberately. The first test needs nothing but events
 * and would have caught the bug on day one. The second stubs the two DOM APIs
 * happy-dom is missing, to carry the sequence through to card-move.
 */

beforeAll(() => {
  if (!('ResizeObserver' in globalThis)) {
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      observe() {} unobserve() {} disconnect() {}
    };
  }
  /* measureTarget runs on every move, so the pickup tests need this too — not
     to find anything, just to exist. Returning nothing is the honest default:
     no cell under the pointer means no drop target, which is exactly the
     state a pickup-only test should be in. */
  if (!('elementsFromPoint' in document)) {
    (document as unknown as { elementsFromPoint: unknown }).elementsFromPoint = () => [];
  }
});

const COLUMNS = [
  { id: 'todo', title: 'To do' },
  { id: 'doing', title: 'Doing' },
];
const ITEMS = [
  { id: '1', columnId: 'todo', title: 'Wire the printer' },
  { id: '2', columnId: 'todo', title: 'Order the cable' },
];

/** pointerdown, then a move past the 5px threshold, on the first card. */
async function pickUp(w: ReturnType<typeof mount>) {
  const card = w.find('[data-kb-card="1"]');
  expect(card.exists(), 'no card to drag').toBe(true);
  await card.trigger('pointerdown', { button: 0, clientX: 100, clientY: 100 });
  window.dispatchEvent(new (window as unknown as { PointerEvent: typeof MouseEvent })
    .PointerEvent('pointermove', { clientX: 160, clientY: 220 } as PointerEventInit));
  await w.vm.$nextTick();
  return card;
}

describe('picking a card up', () => {
  it('does not throw on the first move past the threshold', async () => {
    /* The failure was a ReferenceError inside a window listener, which Vue
       does not surface as a mount error — it lands on the console and the
       drag simply never starts. Watching the console is what makes it
       visible; asserting on the ghost alone would report the same "no drag"
       for a dozen unrelated reasons. */
    const errors: unknown[] = [];
    const spy = vi.spyOn(console, 'error').mockImplementation((...a) => { errors.push(a); });
    const onError = (e: ErrorEvent) => { errors.push(e.error ?? e.message); };
    window.addEventListener('error', onError);

    const w = mount(ApexTaskBoard, {
      props: { items: ITEMS, columns: COLUMNS },
      attachTo: document.body,
    });
    await pickUp(w);

    window.removeEventListener('error', onError);
    spy.mockRestore();
    expect(errors, `dragging threw: ${String(errors[0])}`).toEqual([]);
    w.unmount();
  });

  it('marks the dragged card as a ghost, which is what makes the drag visible', async () => {
    const w = mount(ApexTaskBoard, {
      props: { items: ITEMS, columns: COLUMNS },
      attachTo: document.body,
    });
    const card = await pickUp(w);
    expect(card.attributes('data-ghost'),
      'the card never entered the drag state').toBe('true');
    w.unmount();
  });
});

describe('dropping it in another column', () => {
  it('emits card-move from the source index to the target', async () => {
    const w = mount(ApexTaskBoard, {
      props: { items: ITEMS, columns: COLUMNS },
      attachTo: document.body,
    });

    /* The two APIs happy-dom does not implement. Both are stubbed to describe
       one specific arrangement — the pointer over the `doing` cell — rather
       than to make any drop succeed. */
    const doing = document.querySelector('[data-kb-cell][data-kb-column="doing"]');
    expect(doing, 'no doing cell to drop onto').toBeTruthy();
    (document as unknown as { elementsFromPoint: unknown }).elementsFromPoint =
      () => [doing as Element];

    await pickUp(w);
    window.dispatchEvent(new (window as unknown as { PointerEvent: typeof MouseEvent })
      .PointerEvent('pointerup', { clientX: 400, clientY: 220 } as PointerEventInit));
    await w.vm.$nextTick();

    const moves = w.emitted('card-move');
    expect(moves, 'no card-move emitted').toBeTruthy();
    const payload = (moves as unknown[][])[0][0] as {
      items: { id: string }[];
      from: { columnId: string; index: number };
      to: { columnId: string };
    };
    expect(payload.items.map((i) => i.id)).toEqual(['1']);
    expect(payload.to.columnId).toBe('doing');
    /* The field the bug destroyed: `from.index` came from a variable that did
       not exist. A payload naming the wrong origin index reorders the wrong
       card, so this asserts the value and not merely its presence. */
    expect(payload.from.columnId).toBe('todo');
    expect(payload.from.index).toBe(0);
    w.unmount();
  });
});
