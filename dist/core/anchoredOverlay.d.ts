import { type Ref } from 'vue';
import { type AnchorAlign, type AnchorSide } from './anchor';
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
export declare function useAnchoredOverlay(opts: AnchoredOverlayOptions): {
    style: import("vue").ComputedRef<Record<string, string>>;
    place: () => void;
    side: import("vue").ComputedRef<AnchorSide>;
};
