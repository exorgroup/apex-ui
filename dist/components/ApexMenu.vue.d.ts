import { type AnchorAlign, type AnchorSide } from '../core/anchor';
import type { MenuItem } from './ApexMenuItem';
type __VLS_Props = {
    items?: MenuItem[];
    /** Bindable map of open group keys, keyed by an item's `key`. */
    expandedKeys?: Record<string, boolean>;
    /** Overlay anchored to its trigger, opened with toggle(event). */
    popup?: boolean;
    /** Popup placement. */
    side?: AnchorSide;
    align?: AnchorAlign;
    gap?: number;
    width?: string;
    maxHeight?: string;
    padding?: string;
    background?: string;
    borderColor?: string;
    radius?: string;
    /** Section labels in caps, the way a sidebar reads. */
    labelCaps?: boolean;
    textColor?: string;
    hoverBackground?: string;
    hoverTextColor?: string;
    labelColor?: string;
    iconColor?: string;
    activeColor?: string;
    activeBackground?: string;
    zIndex?: number;
};
declare function show(event?: unknown, target?: unknown): void;
declare function hide(): void;
declare function togglePopup(event?: unknown, target?: unknown): void;
type __VLS_Slots = {
    start?: () => unknown;
    end?: () => unknown;
    item?: (props: {
        item: MenuItem;
        depth: number;
    }) => unknown;
    submenulabel?: (props: {
        item: MenuItem;
        depth: number;
    }) => unknown;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    show: typeof show;
    hide: typeof hide;
    toggle: typeof togglePopup;
    expandAll: () => void;
    collapseAll: () => void;
    visible: import("vue").Ref<boolean, boolean>;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:expandedKeys": (v: Record<string, boolean>) => void;
    "item-click": (payload: {
        item: MenuItem;
        originalEvent: MouseEvent;
    }) => void;
    show: () => void;
    hide: () => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onItem-click"?: ((payload: {
        item: MenuItem;
        originalEvent: MouseEvent;
    }) => any) | undefined;
    onShow?: (() => any) | undefined;
    onHide?: (() => any) | undefined;
    "onUpdate:expandedKeys"?: ((v: Record<string, boolean>) => any) | undefined;
}>, {
    side: AnchorSide;
    zIndex: number;
    align: AnchorAlign;
    gap: number;
    labelCaps: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
