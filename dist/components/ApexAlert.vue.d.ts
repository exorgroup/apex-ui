import type { ApexAlertClasses, ApexOverlayTransition } from '../types';
/**
 * Props are the app-wide fallbacks. A per-call option always wins — the caller
 * knows what this particular alert is about; the host only knows the house
 * style.
 */
type __VLS_Props = ApexOverlayTransition & {
    /** Only render requests carrying this group, for a per-kind host. */
    group?: string;
    /** Default title, when a call gives none. */
    header?: string;
    message?: string;
    icon?: string;
    iconPosition?: 'top' | 'left' | 'right' | 'bottom';
    /** Pulse, shake or bounce an icon on open. Not spin: this is not loading. */
    iconAnimation?: 'none' | 'pulse' | 'shake' | 'bounce';
    iconColor?: string;
    acceptLabel?: string;
    rejectLabel?: string;
    width?: string;
    /** Ripple the answer buttons. Defaults to the plugin's `ripple` option. */
    ripple?: boolean;
    /** Your own class on any part. See ApexAlertClasses. */
    ui?: ApexAlertClasses;
};
declare var __VLS_5: {
    state: import("../core/alert").AlertState;
    buttons: import("..").AlertButton[];
    press: (b: import("..").AlertButton, index?: number) => Promise<void>;
    close: () => void;
}, __VLS_18: {
    state: import("../core/alert").AlertState;
}, __VLS_29: {
    state: import("../core/alert").AlertState;
}, __VLS_31: {
    buttons: import("..").AlertButton[];
    press: (b: import("..").AlertButton, index?: number) => Promise<void>;
};
type __VLS_Slots = {} & {
    container?: (props: typeof __VLS_5) => any;
} & {
    icon?: (props: typeof __VLS_18) => any;
} & {
    message?: (props: typeof __VLS_29) => any;
} & {
    footer?: (props: typeof __VLS_31) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    ripple: boolean;
    iconPosition: "top" | "left" | "right" | "bottom";
    iconAnimation: "none" | "pulse" | "shake" | "bounce";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
