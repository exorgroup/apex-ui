import type { ApexContainerProps } from '../types';
type __VLS_Props = ApexContainerProps & {
    /** Fixed height, or use maxHeight to grow until a limit. */
    height?: string;
    maxHeight?: string;
    width?: string;
    /**
     * auto    — bars appear only while the axis can scroll
     * hover   — as auto, but faded until the area is hovered
     * scroll  — visible only while scrolling
     * always  — always visible
     * hidden  — no bars, scrolling still works
     */
    variant?: 'auto' | 'hover' | 'scroll' | 'always' | 'hidden';
    /** Gradient fade at the scrollable edges. */
    mask?: boolean;
    scrollbarSize?: number;
    thumbColor?: string;
    thumbHoverColor?: string;
    trackColor?: string;
    thumbRadius?: string;
    padding?: string;
};
declare function measure(): void;
declare var __VLS_1: {};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_1) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    viewport: import("vue").Ref<HTMLElement | null, HTMLElement | null>;
    measure: typeof measure;
    scrollTo: (o: ScrollToOptions) => void | undefined;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    scroll: (payload: {
        top: number;
        left: number;
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onScroll?: ((payload: {
        top: number;
        left: number;
    }) => any) | undefined;
}>, {
    variant: "auto" | "hover" | "scroll" | "always" | "hidden";
    scrollbarSize: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
