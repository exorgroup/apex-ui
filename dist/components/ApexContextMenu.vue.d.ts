import { type MenuItem } from './ApexMenuItem';
type __VLS_Props = {
    items?: MenuItem[];
    /** Element, selector or component ref the right click is listened for on. */
    target?: unknown;
    /** Attach to the document instead of one element. */
    global?: boolean;
    disabled?: boolean;
    /** Distance kept from the viewport edges, in pixels. */
    padding?: number;
    width?: string;
    background?: string;
    radius?: string;
    borderColor?: string;
    textColor?: string;
    hoverBackground?: string;
    hoverTextColor?: string;
    iconColor?: string;
    headerColor?: string;
    hintColor?: string;
    separatorColor?: string;
    rowRadius?: string;
    zIndex?: number;
};
declare function show(e: MouseEvent): void;
declare function hide(): void;
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
    toggle: (e: MouseEvent) => void;
    visible: import("vue").Ref<boolean, boolean>;
    target: import("vue").Ref<HTMLElement | null, HTMLElement | null>;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    show: () => void;
    hide: () => void;
    "item-click": (payload: {
        item: MenuItem;
        originalEvent: MouseEvent;
    }) => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onItem-click"?: ((payload: {
        item: MenuItem;
        originalEvent: MouseEvent;
    }) => any) | undefined;
    onShow?: (() => any) | undefined;
    onHide?: (() => any) | undefined;
}>, {
    zIndex: number;
    padding: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
