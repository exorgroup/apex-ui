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
export function allows(can: ApexPermission | undefined, canFn: CanFn): boolean {
  if (can === undefined) return true;
  if (typeof can === 'boolean') return can;
  if (typeof can === 'string') return canFn('read', can);
  return canFn(can.action, can.resource);
}

/** A separator, mirroring how ApexMenuItem decides — separator wins over header. */
const isSeparator = (it: PermissionedRow) => !!it.separator;
/** A heading. Falsy text is not a heading, again matching the renderer. */
const isHeader = (it: PermissionedRow) => !it.separator && !!it.header;

/**
 * Does anything follow this heading before the next one?
 *
 * Separators do not count: a heading followed by a rule and then the next
 * heading is labelling a gap.
 */
function headerHasContent(items: PermissionedRow[], from: number): boolean {
  for (let i = from + 1; i < items.length; i += 1) {
    const next = items[i];
    if (isSeparator(next)) continue;
    if (isHeader(next)) return false;
    return true;
  }
  return false;
}

/** Drop headings that ended up labelling nothing, then tidy the rules. */
function tidy<T extends PermissionedRow>(items: T[]): T[] {
  const kept = items.filter((it, i) => !isHeader(it) || headerHasContent(items, i));

  const out: T[] = [];
  for (const it of kept) {
    /* A leading rule draws a line against the top of the menu, and a second
       rule in a row draws one against the first. */
    if (isSeparator(it) && (out.length === 0 || isSeparator(out[out.length - 1]))) continue;
    out.push(it);
  }
  while (out.length && isSeparator(out[out.length - 1])) out.pop();
  return out;
}

/**
 * Filter a flat list — dock items, dial actions, anything without submenus.
 *
 * Returns the same array when nothing is denied, so a menu that gates nothing
 * costs no re-render.
 */
export function filterItems<T extends { can?: ApexPermission }>(
  items: T[] | undefined,
  canFn: CanFn,
): T[] {
  if (!items || !items.length) return items || [];
  const kept = items.filter((it) => allows(it.can, canFn));
  return kept.length === items.length ? items : kept;
}

/**
 * Filter a menu tree, depth first, then tidy what the removals left behind.
 *
 * A branch is filtered before it is judged: a submenu that had children and has
 * none left goes with them, since opening it would show an empty panel.
 */
export function filterMenu<T extends PermissionedRow>(
  items: T[] | undefined,
  canFn: CanFn,
): T[] {
  if (!items || !items.length) return items || [];

  const kept: T[] = [];
  for (const it of items) {
    if (!allows(it.can, canFn)) continue;

    const hadChildren = !!(it.items && it.items.length);
    if (!hadChildren) { kept.push(it); continue; }

    const children = filterMenu(it.items as T[], canFn);
    if (!children.length) continue;
    /* Rebuild only when the branch actually changed, so an untouched menu keeps
       its object identity and the renderer's keys stay stable. */
    kept.push(children === it.items ? it : ({ ...it, items: children } as T));
  }

  const tidied = tidy(kept);
  return tidied.length === items.length && tidied.every((it, i) => it === items[i])
    ? items
    : tidied;
}
