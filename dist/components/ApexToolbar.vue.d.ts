import type { ApexContainerProps } from '../types';
type __VLS_Props = ApexContainerProps & {
    size?: 'sm' | 'md' | 'lg';
    /** Gap between items within a region. */
    gap?: string;
    /** Wrap the regions onto more lines instead of scrolling. */
    wrap?: boolean;
    background?: string;
    borderColor?: string;
    color?: string;
    radius?: string;
    padding?: string;
    bordered?: boolean;
    /** Elevation instead of a border. */
    raised?: boolean;
    /** Stick to the top of the scroll container. */
    sticky?: boolean;
};
declare var __VLS_1: {}, __VLS_3: {}, __VLS_5: {}, __VLS_7: {};
type __VLS_Slots = {} & {
    start?: (props: typeof __VLS_1) => any;
} & {
    center?: (props: typeof __VLS_3) => any;
} & {
    end?: (props: typeof __VLS_5) => any;
} & {
    default?: (props: typeof __VLS_7) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    size: "sm" | "md" | "lg";
    bordered: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
