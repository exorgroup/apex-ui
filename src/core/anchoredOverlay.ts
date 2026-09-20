import { computed, nextTick, onBeforeUnmount, ref, watch, type Ref } from 'vue';
import { anchorPosition, type AnchorAlign, type AnchorSide } from './anchor';

/**
 * A panel that floats free of whatever is trying to clip it.
 *
 * AF2-320. Every anchored panel in this kit was `position: absolute` inside
 * its own trigger, which works until the trigger sits in a scroll container:
 * **an `overflow: auto` ancestor clips absolutely positioned descendants, and
 * no z-index escapes it.** Found on a DataTable with one row, where the
 * column filter's popover was cut off at the bottom of the table body — and
 * that `overflow: auto` is not negotiable, because horizontal scrolling and
 * the sticky frozen column both need it.
 *
 * `position: fixed` is what escapes: its containing block is the viewport, so
 * ancestor overflow does not apply. The panel STAYS WHERE IT IS in the DOM,
 * which is the whole reason this is not a Teleport — teleporting moves the
 * node out from under its component, and every test, every `:deep()` rule and
 * every focus-order assumption that reaches into a panel through its parent
 * would have to move with it. Same fix, a fraction of the blast radius.
 *
 * Two things fixed positioning costs, both handled here: the coordinates have
 * to come from JS (the stylesheet cannot say "under the trigger" any more),
 * and they have to be recomputed when anything moves.
 *
 * Known limit, recorded rather than worked around: a `transform`, `filter` or
 * `will-change` on an ancestor makes THAT the containing block, and the panel
 * is clipped by it again. The kit only transforms a dialog panel during its
 * enter/leave transition, so this does not bite today. A steady-state
 * transform on a container would, and Teleport is the answer if that ever
 * happens.
 */
export interface AnchoredOverlayOptions {
  /** Whether the panel is showing. */
  open: Ref<boolean>;
  /** The element to hang it off — the field box, or the trigger button. */
  anchor: Ref<HTMLElement | null>;
  /** The panel itself. Measured before placing, so a flip knows its size. */
  panel: Ref<HTMLElement | null>;
  side?: AnchorSide;
  align?: AnchorAlign;
  gap?: number;
  /**
   * Take the anchor's width.
   *
   * Not cosmetic: `.apex-pop` used `inset-inline: 0` to match its field, and
   * under `fixed` that resolves against the VIEWPORT — a dropdown as wide as
   * the window. A field dropdown must be told its width explicitly.
   */
  matchWidth?: boolean;
  /**
   * Take the anchor's width as a MINIMUM, keeping the panel's own intrinsic
   * width when that is larger — a calendar is wider than a narrow date
   * field. Same trap as `matchWidth`: the CSS said `min-inline-size: 100%`,
   * which under `fixed` is 100% of the viewport.
   */
  minWidth?: boolean;
  zIndex?: number;
}

export function useAnchoredOverlay(opts: AnchoredOverlayOptions) {
  const pos = ref({ x: 0, y: 0, side: (opts.side ?? 'bottom') as AnchorSide, arrow: 0 });
  const width = ref<number | null>(null);
  /* Hidden until measured, or it paints once at 0,0 and jumps. */
  const ready = ref(false);

  function place() {
    const panel = opts.panel.value;
    const anchor = opts.anchor.value;
    if (!panel || !anchor || typeof window === 'undefined') return;

    const box = anchor.getBoundingClientRect();

    /* Set the width, and if that CHANGED it, measure on the next tick
       instead of now.
     *
     * The panel's own CSS carries `min-inline-size: 100%`, which under
       `position: fixed` resolves against the VIEWPORT — the hazard
       AF2-322 records. The inline width below overrides it, but on the
       FIRST open there is no inline width yet, so measuring in this same
       tick reads a panel as wide as the window. `anchorPosition` then
       clamps it into view and the panel lands hard against the left edge
       — reported from the blog screen as "the first time you click the
       date, the calendar appears in the wrong place; close it and it is
       right ever after", which is exactly the shape of a one-pass
       measurement that is only wrong before the style exists.
     *
     * Guarded by the comparison, so the steady state is still one pass:
       only a width that actually moved costs a second. */
    if (opts.matchWidth || opts.minWidth) {
      if (width.value !== box.width) {
        width.value = box.width;
        nextTick(place);

        return;
      }
    }

    const r = panel.getBoundingClientRect();
    pos.value = anchorPosition(box, { width: r.width, height: r.height }, {
      side: opts.side ?? 'bottom',
      align: opts.align ?? 'start',
      gap: opts.gap ?? 4,
    });
    ready.value = true;
  }

  /* Capture phase: a scroll inside the table, the page, or any container
     between the two moves the anchor, and only a capturing listener hears
     scrolls on elements that are not the window. */
  function listen(on: boolean) {
    if (typeof window === 'undefined') return;
    const fn = on ? window.addEventListener : window.removeEventListener;
    fn('resize', place);
    fn('scroll', place, true);
  }

  watch(opts.open, (v) => {
    if (v) {
      ready.value = false;
      nextTick(place);
      listen(true);
    } else {
      listen(false);
    }
  });

  onBeforeUnmount(() => listen(false));

  const style = computed<Record<string, string>>(() => {
    const s: Record<string, string> = {
      position: 'fixed',
      insetInlineStart: `${pos.value.x}px`,
      insetBlockStart: `${pos.value.y}px`,
      insetInlineEnd: 'auto',
      insetBlockEnd: 'auto',
      visibility: ready.value ? 'visible' : 'hidden',
    };
    if (opts.zIndex != null) s.zIndex = String(opts.zIndex);
    if (width.value != null) {
      if (opts.matchWidth) s.inlineSize = `${width.value}px`;
      if (opts.minWidth) s.minInlineSize = `${width.value}px`;
    }
    return s;
  });

  return { style, place, side: computed(() => pos.value.side) };
}
