import type { Directive, Plugin } from 'vue';
import { type AnchorSide } from './anchor';
/**
 * ApexTooltip directive — `v-apex-tooltip="'Save changes'"`.
 *
 * Written against the DOM rather than as a component, because a tooltip attaches
 * to elements the kit does not own (a table cell, a bare button) and mounting a
 * component per hover would cost far more than one shared node. Positioning is
 * the shared core/anchor, so a tooltip flips and shifts exactly like a popover.
 */
export interface TooltipOptions {
    /** The text, or HTML when `escape` is false. */
    value?: string;
    position?: AnchorSide;
    /** Milliseconds before it appears and before it goes. */
    showDelay?: number;
    hideDelay?: number;
    /** hover (default) shows on pointer enter; focus shows on focus. */
    event?: 'hover' | 'focus' | 'both';
    /** false keeps the tooltip while the pointer is over it, so links inside are reachable. */
    autoHide?: boolean;
    /** false renders `value` as HTML. */
    escape?: boolean;
    disabled?: boolean;
    /** Distance from the target, in pixels. */
    gap?: number;
    showArrow?: boolean;
    maxWidth?: string;
    background?: string;
    color?: string;
    /** Your own class on the tooltip node. */
    class?: string;
    /** Stack order; above a dialog by default. */
    zIndex?: number;
}
export declare const apexTooltip: Directive<HTMLElement, string | TooltipOptions>;
/** Registers v-apex-tooltip; ApexUI's install does this for you. */
export declare const ApexTooltipPlugin: Plugin;
