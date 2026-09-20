import type { ApexOverlayClasses } from '../types';
export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom' | 'full';
type __VLS_Props = ApexOverlayClasses & {
    /** Bindable open state. */
    visible?: boolean;
    header?: string;
    /** Text under the header. */
    subtitle?: string;
    icon?: string;
    /** Which edge it slides from; `full` covers the viewport. */
    position?: DrawerPosition;
    /** Panel thickness on its axis — width for left/right, height for top/bottom. */
    size?: string;
    /** Thickness below `breakpoint`, for narrow screens. */
    responsiveSize?: string;
    /** Media width under which `responsiveSize` applies. */
    breakpoint?: string;
    /** Blocks the page behind, and traps focus. */
    modal?: boolean;
    closable?: boolean;
    closeOnEscape?: boolean;
    /** Click the mask to dismiss. */
    dismissableMask?: boolean;
    /** Keep the header row even with no header text. */
    showHeader?: boolean;
    padding?: string;
    background?: string;
    borderColor?: string;
    maskColor?: string;
    /** Blur the page behind the mask. */
    maskBlur?: boolean;
    /** Round the inner corners, for a drawer inset from the edge. */
    radius?: string;
    /** Gap between the panel and the viewport edges. */
    inset?: string;
    /** Stack order, for a drawer opened over a dialog. */
    zIndex?: number;
    contentClass?: string;
};
declare function close(): void;
declare var __VLS_13: {
    close: typeof close;
}, __VLS_15: {}, __VLS_23: {}, __VLS_25: {};
type __VLS_Slots = {} & {
    container?: (props: typeof __VLS_13) => any;
} & {
    header?: (props: typeof __VLS_15) => any;
} & {
    default?: (props: typeof __VLS_23) => any;
} & {
    footer?: (props: typeof __VLS_25) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    close: typeof close;
    panel: import("vue").Ref<HTMLElement | null, HTMLElement | null>;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:visible": (v: boolean) => void;
    show: () => void;
    hide: () => void;
    "after-hide": () => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onShow?: (() => any) | undefined;
    onHide?: (() => any) | undefined;
    "onUpdate:visible"?: ((v: boolean) => any) | undefined;
    "onAfter-hide"?: (() => any) | undefined;
}>, {
    position: DrawerPosition;
    zIndex: number;
    modal: boolean;
    closable: boolean;
    closeOnEscape: boolean;
    breakpoint: string;
    showHeader: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
