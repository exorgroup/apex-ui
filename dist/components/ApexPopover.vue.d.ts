import type { ApexOverlayClasses } from '../types';
import { type AnchorAlign, type AnchorSide } from '../core/anchor';
type __VLS_Props = ApexOverlayClasses & {
    /** Bindable open state, for a controlled popover. */
    visible?: boolean;
    /** A default anchor, when no event is passed to show(). */
    target?: unknown;
    side?: AnchorSide;
    align?: AnchorAlign;
    /** Distance from the target, in pixels. */
    gap?: number;
    showArrow?: boolean;
    /** Click outside to dismiss. */
    dismissable?: boolean;
    closeOnEscape?: boolean;
    /** Focus the first focusable element, or [data-autofocus], on open. */
    autoFocus?: boolean;
    /** Keep Tab inside the panel while it is open. */
    trapFocus?: boolean;
    width?: string;
    maxHeight?: string;
    padding?: string;
    background?: string;
    radius?: string;
    borderColor?: string;
    /** Stack order, for a popover opened over a dialog. */
    zIndex?: number;
    contentClass?: string;
};
/** `target` wins when given; otherwise the event's own element is the anchor. */
declare function show(event?: unknown, target?: unknown): void;
declare function hide(): void;
declare function toggle(event?: unknown, target?: unknown): void;
declare var __VLS_9: {
    hide: typeof hide;
};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_9) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    show: typeof show;
    hide: typeof hide;
    toggle: typeof toggle;
    reposition: () => void;
    visible: import("vue").Ref<boolean, boolean>;
    panel: import("vue").Ref<HTMLElement | null, HTMLElement | null>;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:visible": (v: boolean) => void;
    show: () => void;
    hide: () => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onShow?: (() => any) | undefined;
    onHide?: (() => any) | undefined;
    "onUpdate:visible"?: ((v: boolean) => any) | undefined;
}>, {
    side: AnchorSide;
    zIndex: number;
    align: AnchorAlign;
    gap: number;
    closeOnEscape: boolean;
    dismissable: boolean;
    autoFocus: boolean;
    showArrow: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
