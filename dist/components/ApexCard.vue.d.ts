import type { ApexContainerProps } from '../types';
type __VLS_Props = ApexContainerProps & {
    title?: string;
    subtitle?: string;
    /** Media across the top of the card. */
    image?: string;
    imageAlt?: string;
    imageHeight?: string;
    bordered?: boolean;
    shadow?: 'none' | 'sm' | 'md' | 'lg';
    radius?: string;
    padding?: string;
    background?: string;
    borderColor?: string;
    /** Lift on hover — for cards that are links or open something. */
    hoverable?: boolean;
    /** Renders as a button and emits click. */
    clickable?: boolean;
    href?: string;
    /** Body content flows in a row rather than a column. */
    horizontal?: boolean;
};
declare var __VLS_10: {}, __VLS_12: {}, __VLS_14: {}, __VLS_16: {};
type __VLS_Slots = {} & {
    media?: (props: typeof __VLS_10) => any;
} & {
    header?: (props: typeof __VLS_12) => any;
} & {
    default?: (props: typeof __VLS_14) => any;
} & {
    footer?: (props: typeof __VLS_16) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    click: (ev: MouseEvent) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onClick?: ((ev: MouseEvent) => any) | undefined;
}>, {
    bordered: boolean;
    shadow: "none" | "sm" | "md" | "lg";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
