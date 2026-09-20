import { type MenuItem } from './ApexMenuItem';
type __VLS_Props = {
    items?: MenuItem[];
    /** What opens the first menu; hover always switches once one is open. */
    trigger?: 'hover' | 'click';
    size?: 'sm' | 'md' | 'lg';
    background?: string;
    borderColor?: string;
    radius?: string;
    padding?: string;
    /** Root item text. */
    textColor?: string;
    /** Root item background and text on hover. */
    hoverBackground?: string;
    hoverTextColor?: string;
    /** Root item background and text while its menu is open. */
    openBackground?: string;
    openTextColor?: string;
    iconColor?: string;
    zIndex?: number;
};
type __VLS_Slots = {
    start?: () => unknown;
    end?: () => unknown;
    item?: (props: {
        item: MenuItem;
        depth: number;
        branch: boolean;
    }) => unknown;
    /**
     * A submenu whose content is a CONTROL rather than rows — a table size
     * grid, a colour palette. The item carries `custom: '<name>'` and this slot
     * decides what to draw for it.
     */
    panel?: (props: {
        item: MenuItem;
        depth: number;
        close: () => void;
    }) => unknown;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    close: () => void;
    openIndex: import("vue").Ref<number, number>;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    "item-click": (payload: {
        item: MenuItem;
        originalEvent: MouseEvent;
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onItem-click"?: ((payload: {
        item: MenuItem;
        originalEvent: MouseEvent;
    }) => any) | undefined;
}>, {
    size: "sm" | "md" | "lg";
    zIndex: number;
    trigger: "hover" | "click";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
