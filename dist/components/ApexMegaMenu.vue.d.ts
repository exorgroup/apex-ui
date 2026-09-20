import type { ApexPermission } from '../types';
export interface MegaLink {
    label?: string;
    /** Second line under the label. */
    help?: string;
    icon?: string;
    /** Thumbnail — a URL, shown instead of the icon. */
    image?: string;
    imageAlt?: string;
    badge?: string | number;
    href?: string;
    target?: string;
    command?: (payload: unknown) => void;
    disabled?: boolean;
    /** Hide this link unless the permission resolver allows it. */
    can?: ApexPermission;
}
export interface MegaColumn {
    header?: string;
    headerIcon?: string;
    /** Image above the column, the way a category thumbnail sits over its links. */
    image?: string;
    imageAlt?: string;
    /** list is stacked links; cards is a grid of image tiles. */
    layout?: 'list' | 'cards';
    /** Columns this one spans in the panel grid. */
    span?: number;
    items?: MegaLink[];
    /** A link under the column, e.g. "Shop all". */
    footer?: MegaLink;
    /**
     * Hide the whole column unless the resolver allows it. A column left with no
     * links after its own items are filtered goes too — see core/menuPermissions.
     */
    can?: ApexPermission;
}
export interface MegaPanel {
    /** A featured image beside the columns. */
    image?: string;
    imageAlt?: string;
    title?: string;
    text?: string;
    href?: string;
    linkLabel?: string;
    /** Image tiles under the columns — the "featured brands" row. */
    cards?: MegaLink[];
}
export interface MegaItem {
    label?: string;
    icon?: string;
    href?: string;
    target?: string;
    command?: (payload: unknown) => void;
    disabled?: boolean;
    columns?: MegaColumn[];
    panel?: MegaPanel;
    /**
     * Hide this root item unless the resolver allows it. An item whose columns
     * all go is dropped with them — see core/menuPermissions.
     */
    can?: ApexPermission;
}
type __VLS_Props = {
    items?: MegaItem[];
    orientation?: 'horizontal' | 'vertical';
    /** Open a panel on hover, or only on click. */
    trigger?: 'hover' | 'click';
    /** Panel columns, when a column does not set its own span. */
    columnMinWidth?: string;
    /** Card tile width in the cards layout. */
    cardMinWidth?: string;
    /** Where a panel's featured image sits relative to the columns. */
    panelImagePosition?: 'end' | 'start';
    background?: string;
    panelBackground?: string;
    borderColor?: string;
    radius?: string;
    padding?: string;
    activeColor?: string;
    zIndex?: number;
};
declare var __VLS_1: {}, __VLS_17: {
    item: MegaItem;
    close: () => number;
}, __VLS_22: {
    item: MegaLink;
    layout: "list" | "cards";
}, __VLS_41: {};
type __VLS_Slots = {} & {
    start?: (props: typeof __VLS_1) => any;
} & {
    panel?: (props: typeof __VLS_17) => any;
} & {
    item?: (props: typeof __VLS_22) => any;
} & {
    end?: (props: typeof __VLS_41) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    "item-click": (payload: {
        item: MegaItem | MegaLink;
        originalEvent: MouseEvent;
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onItem-click"?: ((payload: {
        item: MegaItem | MegaLink;
        originalEvent: MouseEvent;
    }) => any) | undefined;
}>, {
    zIndex: number;
    trigger: "hover" | "click";
    orientation: "horizontal" | "vertical";
    columnMinWidth: string;
    cardMinWidth: string;
    panelImagePosition: "end" | "start";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
