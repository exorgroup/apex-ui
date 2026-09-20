import type { ApexOverlayTransition } from '../types';
export type DialogPosition = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
type __VLS_Props = ApexOverlayTransition & {
    /** Bindable open state. */
    visible?: boolean;
    header?: string;
    /** Text under the header. */
    subtitle?: string;
    icon?: string;
    position?: DialogPosition;
    /** Blocks the page behind, and traps focus. */
    modal?: boolean;
    /** Drag by the header. */
    draggable?: boolean;
    closable?: boolean;
    closeOnEscape?: boolean;
    /** Click the mask to dismiss. */
    dismissableMask?: boolean;
    /** Close automatically after this many milliseconds. */
    autoClose?: number;
    /** Show a bar counting the auto-close down. */
    showTimer?: boolean;
    width?: string;
    maxWidth?: string;
    padding?: string;
    background?: string;
    radius?: string;
    borderColor?: string;
    maskColor?: string;
    /** Blur the page behind the mask. */
    maskBlur?: boolean;
    /** Stack order, for a dialog opened over another. */
    zIndex?: number;
    contentClass?: string;
};
declare function close(): void;
declare var __VLS_13: {}, __VLS_21: {}, __VLS_23: {};
type __VLS_Slots = {} & {
    header?: (props: typeof __VLS_13) => any;
} & {
    default?: (props: typeof __VLS_21) => any;
} & {
    footer?: (props: typeof __VLS_23) => any;
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
    transition: import("..").OverlayTransitionName;
    position: DialogPosition;
    zIndex: number;
    modal: boolean;
    closable: boolean;
    closeOnEscape: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
