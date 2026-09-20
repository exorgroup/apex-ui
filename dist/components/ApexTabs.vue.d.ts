import type { ApexContainerProps } from '../types';
export interface TabItem {
    /** Stable identifier. Falls back to the 1-based index. */
    value?: string | number;
    label?: string;
    icon?: string;
    /** Count or short text badge beside the label. */
    badge?: string | number;
    badgeSeverity?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
    disabled?: boolean;
    /** Render this panel only once its tab is first activated. */
    lazy?: boolean;
}
type __VLS_Props = ApexContainerProps & {
    tabs?: TabItem[];
    /** The active tab's `value`. Bindable. */
    modelValue?: string | number;
    /** Which edge the strip sits on. */
    placement?: 'top' | 'bottom' | 'left' | 'right';
    /** Arrow keys activate as they move, rather than only moving focus. */
    selectOnFocus?: boolean;
    /** Defer every panel until its tab is first shown. Per-tab `lazy` overrides. */
    lazy?: boolean;
    /** Discard a lazy panel when it deactivates, so it re-initialises next time. */
    unmountInactive?: boolean;
    /** Tabs without panels — a nav strip. */
    tabsOnly?: boolean;
    size?: 'sm' | 'md' | 'lg';
    /** underline = a moving bar, pill = a filled tab, enclosed = folder tabs. */
    variant?: 'underline' | 'pill' | 'enclosed';
    /** Stretch the tabs to fill the strip. */
    fill?: boolean;
    align?: 'start' | 'center' | 'end';
    activeColor?: string;
    indicatorColor?: string;
    tabColor?: string;
    stripBackground?: string;
    borderColor?: string;
    radius?: string;
    /** Panel padding. */
    padding?: string;
    bordered?: boolean;
    /** Fixed strip width for the left and right placements. */
    stripWidth?: string;
    disabled?: boolean;
};
declare function select(i: number): void;
/**
 * The indicator is positioned from the active tab's MEASURED box rather than a
 * per-tab pseudo-element, so one element serves every tab and slides between
 * them. Re-measured on tab change, resize and font load.
 */
declare function measure(): void;
declare var __VLS_5: `tab-${number}`, __VLS_6: {
    tab: TabItem;
    index: number;
    active: boolean;
}, __VLS_15: `panel-${number}`, __VLS_16: {
    tab: TabItem;
    index: number;
    active: boolean;
};
type __VLS_Slots = {} & {
    [K in NonNullable<typeof __VLS_5>]?: (props: typeof __VLS_6) => any;
} & {
    [K in NonNullable<typeof __VLS_15>]?: (props: typeof __VLS_16) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    select: typeof select;
    measure: typeof measure;
    activeIndex: import("vue").ComputedRef<number>;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    "update:modelValue": (v: string | number) => any;
    "tab-change": (payload: {
        value: string | number;
        index: number;
        previous: string | number;
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onUpdate:modelValue"?: ((v: string | number) => any) | undefined;
    "onTab-change"?: ((payload: {
        value: string | number;
        index: number;
        previous: string | number;
    }) => any) | undefined;
}>, {
    size: "sm" | "md" | "lg";
    align: "start" | "center" | "end";
    variant: "underline" | "pill" | "enclosed";
    bordered: boolean;
    placement: "top" | "bottom" | "left" | "right";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
