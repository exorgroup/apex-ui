import type { MenuItem } from './ApexMenuItem';
type __VLS_Props = {
    item: MenuItem;
    depth: number;
    expanded: Record<string, boolean>;
    /** Renders a leaf's contents, from the owner's `item` slot. */
    itemRender?: (ctx: {
        item: MenuItem;
        depth: number;
    }) => unknown;
    /** Renders a group's label, from the owner's `submenulabel` slot. */
    labelRender?: (ctx: {
        item: MenuItem;
        depth: number;
    }) => unknown;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    toggle: (item: MenuItem) => any;
    pick: (item: MenuItem, ev: MouseEvent) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onToggle?: ((item: MenuItem) => any) | undefined;
    onPick?: ((item: MenuItem, ev: MouseEvent) => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
