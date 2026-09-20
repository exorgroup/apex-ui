type __VLS_Props = {
    /** Registry key a trigger targets. */
    id?: string;
    /** Bindable open state; also driven by the registry. */
    open?: boolean;
    /** sidebar is flush, floating is a detached card, inset pairs with an inset layout. */
    variant?: 'sidebar' | 'floating' | 'inset';
    /** icon keeps a rail of icons, offcanvas removes the panel, none is always open. */
    collapsible?: 'icon' | 'offcanvas' | 'none';
    side?: 'left' | 'right';
    /** Float over the content instead of pushing it. */
    overlay?: boolean;
    /** Expand an icon rail while the pointer is over it. */
    openOnHover?: boolean;
    /** Dim the page behind an overlay panel; clicking it closes. */
    backdrop?: boolean;
    width?: string;
    iconWidth?: string;
    background?: string;
    borderColor?: string;
    textColor?: string;
    zIndex?: number;
};
declare var __VLS_1: {
    collapsed: boolean;
}, __VLS_3: {
    collapsed: boolean;
}, __VLS_5: {
    collapsed: boolean;
};
type __VLS_Slots = {} & {
    header?: (props: typeof __VLS_1) => any;
} & {
    default?: (props: typeof __VLS_3) => any;
} & {
    footer?: (props: typeof __VLS_5) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    "update:open": (v: boolean) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onUpdate:open"?: ((v: boolean) => any) | undefined;
}>, {
    id: string;
    side: "left" | "right";
    zIndex: number;
    open: boolean;
    variant: "sidebar" | "floating" | "inset";
    width: string;
    collapsible: "icon" | "offcanvas" | "none";
    iconWidth: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
