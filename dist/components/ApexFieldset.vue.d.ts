import type { ApexContainerProps } from '../types';
type __VLS_Props = ApexContainerProps & {
    legend?: string;
    icon?: string;
    /** Allow the content to collapse. */
    toggleable?: boolean;
    /** Collapsed state. Bindable. */
    collapsed?: boolean;
    expandIcon?: string;
    collapseIcon?: string;
    legendAlign?: 'start' | 'center' | 'end';
    size?: 'sm' | 'md' | 'lg';
    bordered?: boolean;
    radius?: string;
    padding?: string;
    background?: string;
    borderColor?: string;
    legendBackground?: string;
    legendColor?: string;
    disabled?: boolean;
};
declare var __VLS_9: {
    collapsed: boolean;
}, __VLS_17: {}, __VLS_19: {};
type __VLS_Slots = {} & {
    toggleicon?: (props: typeof __VLS_9) => any;
} & {
    legend?: (props: typeof __VLS_17) => any;
} & {
    default?: (props: typeof __VLS_19) => any;
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
    legendAlign: "start" | "center" | "end";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
