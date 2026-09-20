import type { Directive, Plugin } from 'vue';
/**
 * ApexFocusTrap — keeps Tab inside a container: `v-apex-focus-trap`.
 *
 * Implemented with a keydown handler on the container rather than sentinel
 * elements at its edges, because the tabbable set is read at the moment Tab is
 * pressed. A trap that captured its boundaries on mount would leak as soon as a
 * field was disabled, revealed or added.
 */
export interface FocusTrapOptions {
    /** Turn the trap off without removing the directive. */
    disabled?: boolean;
    /** Focus the first tabbable element on mount. An [autofocus] element wins. */
    autoFocus?: boolean;
    /** A selector inside the container to focus instead of the first tabbable. */
    initialFocus?: string;
    /** Return focus to whatever was focused before, on unmount. */
    restoreFocus?: boolean;
}
export declare const apexFocusTrap: Directive<HTMLElement>;
/** Registers v-apex-focus-trap; ApexUI's install does this for you. */
export declare const ApexFocusTrapPlugin: Plugin;
