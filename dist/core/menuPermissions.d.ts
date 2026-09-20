/**
 * The permission filter every menu control runs its items through.
 *
 * The rule is hide, not disable. A greyed-out "Delete" still tells someone the
 * action exists and that they do not have it, which is worse than never having
 * offered it — so a denied row leaves no trace.
 *
 * Leaving no trace is most of the work here. Dropping the row is one line; what
 * takes care is everything the row was holding up. A submenu whose children all
 * go is a doorway to nothing. A section heading whose rows all go labels empty
 * space. Two separators that were divided by one row become one doubled rule,
 * and a separator at either end draws a line against nothing. None of that is
 * the caller's problem to anticipate — they wrote a full menu and asked for the
 * parts this user may see.
 *
 * This is presentation, not authorisation. Nothing here is in the request path;
 * the endpoint behind the row is what must authorise the request. The filter's
 * job is to stop offering doors that will not open.
 */
import type { ApexPermission } from '../types';
/** The resolver `useCan()` hands back. */
export type CanFn = (action: string, resource?: string, explicit?: boolean) => boolean;
/** The shape the tree filter needs. Every menu item type is a superset of it. */
export interface PermissionedRow {
    can?: ApexPermission;
    separator?: boolean;
    header?: string;
    items?: PermissionedRow[];
}
/**
 * Resolve one `can` field.
 *
 * No field means ungated — a menu written before anyone wired a resolver keeps
 * working, and so do the majority of rows in menus that do gate a few.
 *
 * A bare string is the resource, asked about with `read`: hiding a nav row
 * nearly always means "may this user see this thing at all". The long form
 * names the action for the rows where it is something else.
 */
export declare function allows(can: ApexPermission | undefined, canFn: CanFn): boolean;
/**
 * Filter a flat list — dock items, dial actions, anything without submenus.
 *
 * Returns the same array when nothing is denied, so a menu that gates nothing
 * costs no re-render.
 */
export declare function filterItems<T extends {
    can?: ApexPermission;
}>(items: T[] | undefined, canFn: CanFn): T[];
/**
 * Filter a menu tree, depth first, then tidy what the removals left behind.
 *
 * A branch is filtered before it is judged: a submenu that had children and has
 * none left goes with them, since opening it would show an empty panel.
 */
export declare function filterMenu<T extends PermissionedRow>(items: T[] | undefined, canFn: CanFn): T[];
/**
 * The shapes filterMega needs. A mega panel nests through different keys than a
 * menu does — columns holding links, not items holding items — so it gets its
 * own walk rather than bending the tree filter to fit.
 */
export interface PermissionedLink {
    can?: ApexPermission;
}
export interface PermissionedColumn {
    can?: ApexPermission;
    items?: PermissionedLink[];
    footer?: PermissionedLink;
}
export interface PermissionedMegaItem {
    can?: ApexPermission;
    columns?: PermissionedColumn[];
    panel?: {
        cards?: PermissionedLink[];
        image?: string;
        title?: string;
        text?: string;
        linkLabel?: string;
    };
}
/**
 * Filter a mega menu at all three levels: root item, column, and link.
 *
 * A panel hides at each of them, and the levels cascade upward. A column
 * emptied of its links is a heading over blank space, so it goes; a root item
 * emptied of its columns opens onto nothing, so it goes with them — unless its
 * promo panel still has something to show, in which case the dropdown is still
 * worth opening.
 *
 * A column that never had links — a heading and an image, say — is not empty,
 * so it is kept on its own `can` alone.
 */
export declare function filterMega<T extends PermissionedMegaItem>(items: T[] | undefined, canFn: CanFn): T[];
