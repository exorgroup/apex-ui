import type { ApexContainerProps } from '../types';
export interface SplitterPanel {
    /** Percentage of the splitter this panel starts at. */
    size?: number;
    minSize?: number;
    maxSize?: number;
    /** Snap to `collapsedSize` when dragged past halfway to `minSize`. */
    collapsible?: boolean;
    collapsedSize?: number;
    key?: string | number;
}
type __VLS_Props = ApexContainerProps & {
    panels?: SplitterPanel[];
    /** Percentages, one per panel. Bindable. */
    sizes?: number[];
    layout?: 'horizontal' | 'vertical';
    /** How far the gutter travels per arrow-key press, in percent. */
    step?: number;
    gutterSize?: number;
    disabled?: boolean;
    /** Persist sizes under this key. */
    stateKey?: string;
    stateStorage?: 'local' | 'session';
    height?: string;
    bordered?: boolean;
    radius?: string;
    borderColor?: string;
    gutterColor?: string;
    gutterHoverColor?: string;
    /** Show a grip in the middle of each gutter. */
    showHandle?: boolean;
};
declare var __VLS_2: `panel-${number}`, __VLS_3: {
    size: number;
    index: number;
}, __VLS_5: {
    size: number;
    index: number;
}, __VLS_7: {
    index: number;
};
type __VLS_Slots = {} & {
    [K in NonNullable<typeof __VLS_2>]?: (props: typeof __VLS_3) => any;
} & {
    default?: (props: typeof __VLS_5) => any;
} & {
    gutter?: (props: typeof __VLS_7) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    sizes: import("vue").ComputedRef<number[]>;
    reset: () => void;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:sizes": (v: number[]) => void;
    resize: (payload: {
        sizes: number[];
        index: number;
    }) => void;
    resizestart: (payload: {
        sizes: number[];
        index: number;
    }) => void;
    resizeend: (payload: {
        sizes: number[];
        index: number;
    }) => void;
    collapse: (payload: {
        index: number;
        collapsed: boolean;
        sizes: number[];
    }) => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onResize?: ((payload: {
        sizes: number[];
        index: number;
    }) => any) | undefined;
    onCollapse?: ((payload: {
        index: number;
        collapsed: boolean;
        sizes: number[];
    }) => any) | undefined;
    "onUpdate:sizes"?: ((v: number[]) => any) | undefined;
    onResizestart?: ((payload: {
        sizes: number[];
        index: number;
    }) => any) | undefined;
    onResizeend?: ((payload: {
        sizes: number[];
        index: number;
    }) => any) | undefined;
}>, {
    step: number;
    bordered: boolean;
    stateStorage: "local" | "session";
    layout: "horizontal" | "vertical";
    gutterSize: number;
    showHandle: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
