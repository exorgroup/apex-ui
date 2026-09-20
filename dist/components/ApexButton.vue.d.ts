import type { ApexSize, ApexButtonAppearance } from '../types';
export type ApexSeverity = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'help' | 'danger' | 'contrast';
export type ApexButtonVariant = 'solid' | 'outlined' | 'text' | 'link';
type __VLS_Props = ApexButtonAppearance & {
    /** Colour role. */
    severity?: ApexSeverity;
    /** solid | outlined | text | link — or a legacy value. */
    variant?: ApexButtonVariant | 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline-danger';
    size?: ApexSize;
    /** Leading icon (position set by `iconPos`). */
    icon?: string;
    /** Explicit trailing icon; shorthand for iconPos="right" with a separate glyph. */
    trailingIcon?: string;
    /** Where `icon` sits relative to the label. */
    iconPos?: 'left' | 'right' | 'top' | 'bottom';
    /** Drop shadow to indicate elevation. Works with text and outlined too. */
    raised?: boolean;
    /** Circular border radius. */
    rounded?: boolean;
    /** Square (or circular, with `rounded`) icon-only button. Needs `label` for a11y. */
    iconOnly?: boolean;
    /** Accessible name — required for icon-only buttons. */
    label?: string;
    /** Count or short text in a corner badge. */
    badge?: string | number;
    /** Badge colour role. Defaults to `contrast`. */
    badgeSeverity?: ApexSeverity;
    loading?: boolean;
    disabled?: boolean;
    block?: boolean;
    type?: 'button' | 'submit' | 'reset';
    href?: string;
    target?: string;
};
declare var __VLS_9: {};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_9) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    size: ApexSize;
    type: "button" | "submit" | "reset";
    iconPos: "left" | "right" | "top" | "bottom";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
