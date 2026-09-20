import type { Directive, Plugin } from 'vue';
/**
 * ApexRipple — a ripple spreading from the point of contact:
 * `v-apex-ripple` or `v-apex-ripple="{ color: '…' }"`.
 *
 * The ink element is created per press and removed when its animation ends,
 * rather than kept and restarted. A single reused node cannot show two
 * overlapping presses, and restarting its animation mid-flight makes a rapid
 * double click look like one interrupted ripple.
 *
 * The radius is computed from the press position to the furthest corner, so the
 * wave always reaches the whole element however off-centre the click was.
 */
export interface RippleOptions {
    disabled?: boolean;
    /** Any CSS colour. Defaults to a tint of the host's own text colour. */
    color?: string;
    opacity?: number;
    duration?: string;
    /** Start from the element's centre rather than the pointer. */
    centered?: boolean;
    /** Also ripple on keyboard activation, from the centre. */
    keyboard?: boolean;
}
/**
 * Ink one element, optionally sized to a LARGER box than itself.
 *
 * `bounds` is what makes a ripple span several elements: give every cell in
 * a table row the same bounds — the row — and each one draws its slice of a
 * single circle, which reads as one wave crossing the row rather than a
 * cell-sized blob. Without it each cell would size its own wave and the
 * result is a row of little circles. AF2-326.
 *
 * Exported because a `<span>` is not a legal child of `<tr>`: hosting the
 * layer on the cells is the only structurally sound way to ripple a row.
 */
export declare function rippleAt(el: HTMLElement, options?: RippleOptions, x?: number, y?: number, bounds?: HTMLElement): void;
export declare const apexRipple: Directive<HTMLElement>;
/** Registers v-apex-ripple; ApexUI's install does this for you. */
export declare const ApexRipplePlugin: Plugin;
