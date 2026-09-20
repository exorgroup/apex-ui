import { type PropType, type VNode } from 'vue';
import type { ApexButtonClasses, ApexPermission } from '../types';
export interface MenuItem {
    label?: string;
    icon?: string;
    /** Right-aligned hint — a shortcut, a count. */
    hint?: string;
    disabled?: boolean;
    /** Horizontal rule instead of a row. */
    separator?: boolean;
    /** Section heading instead of a row. */
    header?: string;
    href?: string;
    target?: string;
    /** Nested submenu. */
    items?: MenuItem[];
    /**
     * Hide this row unless the permission resolver allows it. A branch whose
     * children all go is dropped with them, and the separators and headers left
     * framing nothing go too — see core/menuPermissions.
     */
    can?: ApexPermission;
    /** Any payload you want back on the click event. */
    [key: string]: unknown;
}
/** One overlay row: separator, header, leaf, or a branch with a submenu. */
declare const ApexMenuItem: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    item: {
        type: PropType<MenuItem>;
        required: true;
    };
    depth: {
        type: NumberConstructor;
        default: number;
    };
    /**
     * Optional replacement for a row's contents, passed down from an owner's
     * `item` slot. The row itself — click, hover, submenu — stays ours, so a
     * custom template never has to reimplement the menu behaviour.
     */
    itemRender: {
        type: PropType<(ctx: {
            item: MenuItem;
            depth: number;
            branch: boolean;
        }) => unknown>;
        default: undefined;
    };
    /**
     * Renders a CONTROL in place of a row — a table size grid, a colour
     * palette. Supplied by ApexMenubar's `panel` slot and handed down through
     * every level, so a grid three submenus deep still renders.
     */
    panelRender: {
        type: PropType<(ctx: {
            item: MenuItem;
            depth: number;
        }) => unknown>;
        default: undefined;
    };
    /** Your own classes on the row, header, hint and separator. */
    ui: {
        type: PropType<ApexButtonClasses>;
        default: undefined;
    };
}>, () => VNode, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, "pick"[], "pick", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    item: {
        type: PropType<MenuItem>;
        required: true;
    };
    depth: {
        type: NumberConstructor;
        default: number;
    };
    /**
     * Optional replacement for a row's contents, passed down from an owner's
     * `item` slot. The row itself — click, hover, submenu — stays ours, so a
     * custom template never has to reimplement the menu behaviour.
     */
    itemRender: {
        type: PropType<(ctx: {
            item: MenuItem;
            depth: number;
            branch: boolean;
        }) => unknown>;
        default: undefined;
    };
    /**
     * Renders a CONTROL in place of a row — a table size grid, a colour
     * palette. Supplied by ApexMenubar's `panel` slot and handed down through
     * every level, so a grid three submenus deep still renders.
     */
    panelRender: {
        type: PropType<(ctx: {
            item: MenuItem;
            depth: number;
        }) => unknown>;
        default: undefined;
    };
    /** Your own classes on the row, header, hint and separator. */
    ui: {
        type: PropType<ApexButtonClasses>;
        default: undefined;
    };
}>> & Readonly<{
    onPick?: ((...args: any[]) => any) | undefined;
}>, {
    ui: ApexButtonClasses;
    depth: number;
    itemRender: (ctx: {
        item: MenuItem;
        depth: number;
        branch: boolean;
    }) => unknown;
    panelRender: (ctx: {
        item: MenuItem;
        depth: number;
    }) => unknown;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default ApexMenuItem;
