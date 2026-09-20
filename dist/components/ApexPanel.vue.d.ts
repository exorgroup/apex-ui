import type { ApexContainerProps } from '../types';
type __VLS_Props = ApexContainerProps & {
    header?: string;
    subheader?: string;
    icon?: string;
    /** Allow the content to collapse. */
    toggleable?: boolean;
    /** Collapsed state. Bindable. */
    collapsed?: boolean;
    expandIcon?: string;
    collapseIcon?: string;
    /** Put the toggle before the title rather than at the end of the bar. */
    togglePosition?: 'start' | 'end';
    size?: 'sm' | 'md' | 'lg';
    bordered?: boolean;
    shadow?: 'none' | 'sm' | 'md';
    radius?: string;
    padding?: string;
    background?: string;
    borderColor?: string;
    headerBackground?: string;
    headerColor?: string;
    /** Drop the divider under the header. */
    flush?: boolean;
};
declare var __VLS_1: {
    collapsed: boolean;
}, __VLS_6: {}, __VLS_11: {}, __VLS_13: {}, __VLS_15: {};
type __VLS_Slots = {} & {
    toggleicon?: (props: typeof __VLS_1) => any;
} & {
    header?: (props: typeof __VLS_6) => any;
} & {
    icons?: (props: typeof __VLS_11) => any;
} & {
    default?: (props: typeof __VLS_13) => any;
} & {
    footer?: (props: typeof __VLS_15) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    toggle: (payload: {
        collapsed: boolean;
    }) => any;
    "update:collapsed": (v: boolean) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onToggle?: ((payload: {
        collapsed: boolean;
    }) => any) | undefined;
    "onUpdate:collapsed"?: ((v: boolean) => any) | undefined;
}>, {
    size: "sm" | "md" | "lg";
    bordered: boolean;
    expandIcon: string;
    collapseIcon: string;
    toggleable: boolean;
    collapsed: boolean;
    togglePosition: "start" | "end";
    shadow: "none" | "sm" | "md";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
