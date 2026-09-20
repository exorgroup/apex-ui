import type { ApexMediaProps } from '../types';
type __VLS_Props = ApexMediaProps & {
    /** v-model:slide — the active item index. */
    slide?: number;
    /** Where the active item lands in the viewport. */
    align?: 'start' | 'center' | 'end';
    /** Fractions are allowed: 2.5 shows a partial slide as an affordance. */
    slidesPerPage?: number;
    orientation?: 'horizontal' | 'vertical';
    /** Wrap past the ends instead of stopping. */
    loop?: boolean;
    /** Let items size themselves instead of dividing the track. */
    autoSize?: boolean;
    gap?: string;
    /** Off removes the indicators wherever they are composed. */
    indicators?: boolean;
    indicatorPosition?: 'left' | 'center' | 'right';
    /**
     * Where ApexCarouselControls puts the arrows: in the control row (bottom or
     * top), overlaid on the track's edges (middle), both together at either end of
     * the row, or one at each end (split).
     */
    navPosition?: 'bottom' | 'top' | 'middle' | 'both-start' | 'both-end' | 'split';
};
declare var __VLS_1: {};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_1) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    "update:slide": (v: number) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onUpdate:slide"?: ((v: number) => any) | undefined;
}>, {
    slide: number;
    align: "start" | "center" | "end";
    orientation: "horizontal" | "vertical";
    gap: string;
    slidesPerPage: number;
    indicators: boolean;
    indicatorPosition: "left" | "center" | "right";
    navPosition: "bottom" | "top" | "middle" | "both-start" | "both-end" | "split";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
