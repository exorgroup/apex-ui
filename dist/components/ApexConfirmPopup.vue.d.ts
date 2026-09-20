import type { ApexOverlayClasses } from '../types';
import { type AnchorSide } from '../core/anchor';
import { type AlertButton } from '../core/alert';
type __VLS_Props = ApexOverlayClasses & {
    group?: string;
    message?: string;
    icon?: string;
    iconColor?: string;
    acceptLabel?: string;
    rejectLabel?: string;
    side?: AnchorSide;
    align?: 'start' | 'center' | 'end';
    /** Distance from the target, in pixels. */
    gap?: number;
    showArrow?: boolean;
    width?: string;
    zIndex?: number;
};
declare var __VLS_9: {
    options: import("../core/alert").AlertState;
    press: (b: AlertButton, index?: number) => Promise<void>;
    close: () => void;
    buttons: AlertButton[];
}, __VLS_11: {
    options: import("../core/alert").AlertState;
};
type __VLS_Slots = {} & {
    container?: (props: typeof __VLS_9) => any;
} & {
    message?: (props: typeof __VLS_11) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    side: AnchorSide;
    zIndex: number;
    align: "start" | "center" | "end";
    gap: number;
    acceptLabel: string;
    rejectLabel: string;
    showArrow: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
