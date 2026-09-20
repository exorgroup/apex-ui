import { type MenuItem } from './ApexMenuItem';
import { type AnchorAlign, type AnchorSide } from '../core/anchor';
type __VLS_Props = {
    items?: MenuItem[];
    /** Overlay anchored to whatever called toggle(event). */
    popup?: boolean;
    side?: AnchorSide;
    align?: AnchorAlign;
    gap?: number;
    width?: string;
    background?: string;
    borderColor?: string;
    radius?: string;
    textColor?: string;
    hoverBackground?: string;
    hoverTextColor?: string;
    iconColor?: string;
    headerColor?: string;
    hintColor?: string;
    separatorColor?: string;
    /** Panel inner padding, and the radius of a row. */
    padding?: string;
    rowRadius?: string;
    zIndex?: number;
};
declare function show(event?: unknown, target?: unknown): void;
declare function hide(): void;
declare function toggle(event?: unknown, target?: unknown): void;
type __VLS_Slots = {
    item?: (props: {
        item: MenuItem;
        depth: number;
        branch: boolean;
    }) => unknown;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    show: typeof show;
    hide: typeof hide;
    toggle: typeof toggle;
    visible: import("vue").Ref<boolean, boolean>;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
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
}>, {
    side: AnchorSide;
    zIndex: number;
    align: AnchorAlign;
    gap: number;
    width: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
