import type { Directive, Plugin } from 'vue';
/**
 * ApexStyleClass — toggles classes on another element declaratively:
 * `v-apex-style-class="{ selector: '@next', toggleClass: 'open' }"`.
 *
 * Two modes over one directive. `toggleClass` adds and removes a single class;
 * the enter/leave triple runs an animation and reads its real duration from the
 * element, so a class whose animation length changes needs no matching timeout
 * here — a fixed delay is the usual reason these break.
 *
 * The target is resolved at click time, not at mount: `@next` on an element
 * whose sibling is rendered conditionally would otherwise bind to nothing.
 */
export interface StyleClassOptions {
    /** '@next', '@prev', '@parent', '@grandparent', or any CSS selector. */
    selector?: string;
    /** Simple add/remove mode. */
    toggleClass?: string;
    enterFromClass?: string;
    enterActiveClass?: string;
    enterToClass?: string;
    leaveFromClass?: string;
    leaveActiveClass?: string;
    leaveToClass?: string;
    /** Run the leave sequence when a click lands outside the target. */
    hideOnOutsideClick?: boolean;
    /** Run the leave sequence on Escape. */
    hideOnEscape?: boolean;
    /** Run the leave sequence when something resizes. */
    hideOnResize?: boolean;
    /** 'window' | 'document' | a CSS selector observed for size changes. */
    resizeSelector?: string;
}
export declare const apexStyleClass: Directive<HTMLElement>;
/** Registers v-apex-style-class; ApexUI's install does this for you. */
export declare const ApexStyleClassPlugin: Plugin;
