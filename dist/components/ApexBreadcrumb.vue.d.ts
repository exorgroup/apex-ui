import type { ApexPermission } from '../types';
/**
 * One crumb.
 *
 * A trail is not a menu — it has no submenus, no separators of its own, no
 * headers — so it gets its own shape rather than borrowing MenuItem and
 * leaving half of it inapplicable.
 *
 * `href` is a URL and `to` is a route: a crumb that names a route hands it to
 * the app's link component rather than reloading the page.
 */
export interface CrumbItem {
    label?: string;
    icon?: string;
    /** A plain URL. */
    href?: string;
    /** A route, for whatever router the app passes as `linkComponent`. */
    to?: string | Record<string, unknown>;
    target?: string;
    disabled?: boolean;
    /** Force — or forbid — the "you are here" treatment on this crumb. */
    current?: boolean;
    command?: (payload: unknown) => void;
    /**
     * Hide this crumb unless the permission resolver allows it. A trail is a
     * path, so a denied crumb truncates it: everything after it goes too, since
     * you cannot walk past a step you are not allowed to take.
     */
    can?: ApexPermission;
    /** Any payload you want back on the click event. */
    [key: string]: unknown;
}
type __VLS_Props = {
    items?: CrumbItem[];
    /** A leading crumb, usually the site root — typically icon-only. */
    home?: CrumbItem;
    /** An icon name, or any text: '/', '›', '—'. */
    separator?: string;
    /** Collapse the middle behind an ellipsis past this many crumbs. */
    maxItems?: number;
    /** Mark the last crumb as the current page: bold, and not a link. */
    markCurrent?: boolean;
    size?: 'sm' | 'md' | 'lg';
    /** Let a long trail wrap instead of scrolling. */
    wrap?: boolean;
    /**
     * What to render a crumb's `to` through — RouterLink, Inertia's Link, or any
     * component taking a `to` prop. Without it a string `to` falls back to an
     * href, so plain URLs still work with no router in the app.
     */
    linkComponent?: unknown;
    color?: string;
    activeColor?: string;
    hoverColor?: string;
    separatorColor?: string;
    gap?: string;
    background?: string;
    padding?: string;
    radius?: string;
};
declare var __VLS_1: {
    expand: () => boolean;
}, __VLS_6: {
    item: CrumbItem;
    index: number;
    isCurrent: boolean;
}, __VLS_19: {};
type __VLS_Slots = {} & {
    ellipsis?: (props: typeof __VLS_1) => any;
} & {
    item?: (props: typeof __VLS_6) => any;
} & {
    separator?: (props: typeof __VLS_19) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    "item-click": (payload: {
        item: CrumbItem;
        index: number;
        originalEvent: MouseEvent;
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onItem-click"?: ((payload: {
        item: CrumbItem;
        index: number;
        originalEvent: MouseEvent;
    }) => any) | undefined;
}>, {
    size: "sm" | "md" | "lg";
    separator: string;
    markCurrent: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
