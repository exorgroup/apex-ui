import type { MenuItem } from './ApexMenuItem';
type __VLS_Props = {
    items?: MenuItem[];
    position?: 'bottom' | 'top' | 'left' | 'right';
    /** Grow the hovered icon and its neighbours. */
    magnify?: boolean;
    /** Icon box size in pixels. */
    size?: number;
    /** Show an item's label on hover. */
    showLabels?: boolean;
    /** Distance between a group's fanned children, in pixels. */
    fanGap?: number;
    disabled?: boolean;
    gap?: string;
    padding?: string;
    radius?: string;
    background?: string;
    borderColor?: string;
    /** Blur whatever sits behind the strip. */
    blur?: boolean;
};
declare var __VLS_1: {
    item: MenuItem;
    index: number;
    inGroup: boolean;
}, __VLS_14: {
    item: MenuItem;
    index: number;
    inGroup: boolean;
};
type __VLS_Slots = {} & {
    item?: (props: typeof __VLS_1) => any;
} & {
    item?: (props: typeof __VLS_14) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    "item-click": (payload: {
        item: MenuItem;
        index: number;
        originalEvent: MouseEvent;
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onItem-click"?: ((payload: {
        item: MenuItem;
        index: number;
        originalEvent: MouseEvent;
    }) => any) | undefined;
}>, {
    size: number;
    position: "bottom" | "top" | "left" | "right";
    showLabels: boolean;
    magnify: boolean;
    fanGap: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
