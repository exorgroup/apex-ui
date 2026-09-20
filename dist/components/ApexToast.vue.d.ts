import type { ApexOverlayClasses } from '../types';
import { type ToastMessage } from '../core/toast';
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center';
type __VLS_Props = ApexOverlayClasses & {
    position?: ToastPosition;
    /** 'stacked' collapses the pile and fans it on hover; 'expanded' always shows the column. */
    mode?: 'stacked' | 'expanded';
    /** Only render messages carrying this group. */
    group?: string;
    /** Cap the visible column; the rest wait their turn. */
    max?: number;
    /** Fallback life for messages that set none. */
    life?: number;
    variant?: 'filled' | 'outlined' | 'simple';
    size?: 'sm' | 'md' | 'lg';
    blur?: boolean | number | string;
    width?: string;
    /** Distance from the viewport edge. */
    offset?: string;
    zIndex?: number;
    /** Newest first (the default) or appended below. */
    newestOnTop?: boolean;
};
type __VLS_Slots = {
    message?: (props: {
        message: ToastMessage;
        close: () => void;
        index: number;
    }) => unknown;
    actions?: (props: {
        message: ToastMessage;
        close: () => void;
    }) => unknown;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    close: (message: ToastMessage) => void;
    "life-end": (message: ToastMessage) => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onClose?: ((message: ToastMessage) => any) | undefined;
    "onLife-end"?: ((message: ToastMessage) => any) | undefined;
}>, {
    size: "sm" | "md" | "lg";
    position: ToastPosition;
    zIndex: number;
    max: number;
    variant: "filled" | "outlined" | "simple";
    width: string;
    mode: "stacked" | "expanded";
    offset: string;
    newestOnTop: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
