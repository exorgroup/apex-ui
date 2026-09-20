type __VLS_Props = {
    /** v-model:blocked — bindable, so the auto-release reports back. */
    blocked?: boolean;
    /** Block the whole document instead of the content. */
    fullScreen?: boolean;
    /** Release automatically after this many milliseconds. */
    duration?: number;
    /** Show a countdown bar along the cover's edge while a duration runs. */
    showTimer?: boolean;
    /** Let clicks through while still dimming — a purely visual block. */
    passthrough?: boolean;
    /** Release when the cover is clicked. */
    dismissable?: boolean;
    background?: string;
    opacity?: number;
    blur?: boolean | number | string;
    radius?: string;
    /** A spinner, an icon, or nothing. */
    spinner?: boolean;
    icon?: string;
    message?: string;
    contentColor?: string;
    zIndex?: number;
    /** Stop the page scrolling while the document is blocked. */
    lockScroll?: boolean;
};
declare var __VLS_6: {}, __VLS_12: {};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_6) => any;
} & {
    content?: (props: typeof __VLS_12) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:blocked": (v: boolean) => void;
    block: () => void;
    unblock: () => void;
    timeout: () => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onBlock?: (() => any) | undefined;
    onTimeout?: (() => any) | undefined;
    "onUpdate:blocked"?: ((v: boolean) => any) | undefined;
    onUnblock?: (() => any) | undefined;
}>, {
    zIndex: number;
    blocked: boolean;
    spinner: boolean;
    lockScroll: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
