/**
 * Anchored overlay positioning, shared by ConfirmPopup, Popover and Tooltip.
 *
 * Placement is resolved against the viewport: the preferred side is used when it
 * fits, otherwise the overlay flips to the opposite side, and it is then shifted
 * along the cross axis to stay on screen. Coordinates are viewport-relative, for
 * a `position: fixed` overlay — so the anchor cannot drift inside a scrolled or
 * transformed ancestor.
 */
export type AnchorSide = 'top' | 'bottom' | 'left' | 'right';
export type AnchorAlign = 'start' | 'center' | 'end';
export interface AnchorResult {
    x: number;
    y: number;
    /** The side actually used, after any flip. */
    side: AnchorSide;
    /** Arrow offset along the overlay's cross axis, in pixels. */
    arrow: number;
}
export declare function resolveTarget(target: unknown): HTMLElement | null;
export declare function anchorPosition(targetRect: DOMRect, overlay: {
    width: number;
    height: number;
}, opts?: {
    side?: AnchorSide;
    align?: AnchorAlign;
    gap?: number;
    padding?: number;
    flip?: boolean;
}): AnchorResult;
/**
 * Distance from an element's INLINE-START edge to a pointer.
 *
 * Every timeline that maps x to time needs this, and `clientX - rect.left` is
 * only correct in LTR: in RTL the inline axis runs the other way, so the time
 * origin sits at `rect.right` and a left-based measurement returns a MIRRORED
 * time. The stylesheet is logical-property throughout and flips correctly, which
 * makes the bug worse rather than better — the layout looks right and the
 * arithmetic is wrong.
 *
 * The direction is read from the RENDERED element rather than from a locale prop,
 * because `dir` is inherited: a host can flip a component by setting `dir="rtl"`
 * on any ancestor, without the component ever being told.
 */
export declare function inlineOffset(el: Element, clientX: number): number;
/** Distance from the pointer to an element's inline-END edge. */
export declare function inlineEndDistance(el: Element, clientX: number): number;
/**
 * An overlay anchored AT the pointer, pulled in only to stay on screen.
 *
 * Three call sites had three sets of hardcoded constants, and one of them
 * (`Math.min(x, 320)`) was a pin rather than a clamp: it fired for any drop past
 * x=320 and put the dialog 440px left of the booking it was asking about. The
 * rule is one expression — the pointer, bounded by the viewport.
 *
 * Returns an `inset-inline-start` offset, so it is measured from the RIGHT edge
 * in RTL. The previous per-site clamps returned a physical x and mirrored every
 * overlay in an RTL page.
 */
export declare function pointerAnchor(x: number, y: number, width: number, height: number, gap?: number): {
    insetInlineStart: string;
    insetBlockStart: string;
};
export declare function isRtlElement(el: Element): boolean;
