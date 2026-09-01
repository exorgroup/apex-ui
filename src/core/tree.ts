/** Tree helpers for ApexTree: flattening, filtering, checkbox cascade and moves. */

export interface TreeNode {
  key: string;
  label?: string;
  icon?: string;
  data?: unknown;
  /** In lazy mode, marks a node as having no children so no toggle is offered. */
  leaf?: boolean;
  loading?: boolean;
  selectable?: boolean;
  styleClass?: string;
  children?: TreeNode[];
}

export interface FlatNode {
  node: TreeNode;
  depth: number;
  /** Key path from the root, so a move knows where a node came from. */
  path: number[];
  parent?: TreeNode;
  hasChildren: boolean;
}

export type CheckState = { checked?: boolean; partialChecked?: boolean };

/** Visible rows, in render order. Collapsed branches contribute nothing. */
export function flattenTree(
  nodes: TreeNode[] | undefined,
  expanded: Record<string, boolean>,
  /** Only a lazy tree offers a toggle for a node whose children are not loaded yet. */
  lazy = false,
  depth = 0,
  parent?: TreeNode,
  base: number[] = [],
): FlatNode[] {
  const out: FlatNode[] = [];
  (nodes || []).forEach((node, i) => {
    const path = [...base, i];
    const hasChildren = !!(node.children && node.children.length)
      || (lazy && !node.leaf && node.children === undefined);
    out.push({ node, depth, path, parent, hasChildren });
    if (expanded[node.key] && node.children && node.children.length) {
      out.push(...flattenTree(node.children, expanded, lazy, depth + 1, node, path));
    }
  });
  return out;
}

export function eachNode(nodes: TreeNode[] | undefined, fn: (n: TreeNode, parent?: TreeNode) => void, parent?: TreeNode) {
  (nodes || []).forEach((n) => { fn(n, parent); eachNode(n.children, fn, n); });
}

export function descendantsOf(node: TreeNode): TreeNode[] {
  const out: TreeNode[] = [];
  eachNode(node.children, (n) => out.push(n));
  return out;
}

const text = (n: TreeNode, fields: string[]) => fields
  .map((f) => String((f === 'label' ? n.label : (n.data as Record<string, unknown> | undefined)?.[f]) ?? ''))
  .join(' ')
  .toLowerCase();

/**
 * `lenient` keeps a matching branch's whole subtree; `strict` keeps only the
 * matching nodes and the ancestors needed to reach them.
 */
export function filterTree(
  nodes: TreeNode[] | undefined,
  query: string,
  fields: string[],
  mode: 'lenient' | 'strict',
): TreeNode[] {
  const q = query.toLowerCase().trim();
  if (!q) return nodes || [];
  return (nodes || []).reduce<TreeNode[]>((acc, n) => {
    const self = text(n, fields).includes(q);
    const kids = filterTree(n.children, query, fields, mode);
    // lenient keeps a matching branch's subtree intact; strict keeps only what matched,
    // so a self-matching branch with no matching descendants renders as a leaf
    if (self && mode === 'lenient') acc.push(n);
    else if (self || kids.length) acc.push({ ...n, children: kids });
    return acc;
  }, []);
}

/** Keys of every branch that survives a filter, so results open automatically. */
export function branchKeys(nodes: TreeNode[] | undefined): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  eachNode(nodes, (n) => { if (n.children && n.children.length) out[n.key] = true; });
  return out;
}

/**
 * Recomputes checkbox state for the whole tree from a set of leaf decisions:
 * a parent is checked when all its children are, partial when only some are.
 */
export function cascadeChecks(
  nodes: TreeNode[] | undefined,
  keys: Record<string, CheckState>,
): Record<string, CheckState> {
  const next: Record<string, CheckState> = {};
  const visit = (n: TreeNode): { checked: boolean; partial: boolean } => {
    const kids = (n.children || []).map(visit);
    if (kids.length) {
      const all = kids.every((k) => k.checked);
      const some = kids.some((k) => k.checked || k.partial);
      if (all) next[n.key] = { checked: true, partialChecked: false };
      else if (some) next[n.key] = { checked: false, partialChecked: true };
      return { checked: all, partial: !all && some };
    }
    const on = !!keys[n.key]?.checked;
    if (on) next[n.key] = { checked: true, partialChecked: false };
    return { checked: on, partial: false };
  };
  (nodes || []).forEach(visit);
  return next;
}

/** Applies a checkbox click: the node and everything under it move together. */
export function setBranchChecked(
  nodes: TreeNode[] | undefined,
  node: TreeNode,
  on: boolean,
  keys: Record<string, CheckState>,
): Record<string, CheckState> {
  const draft: Record<string, CheckState> = { ...keys };
  const family = [node, ...descendantsOf(node)];
  family.forEach((n) => {
    if (n.selectable === false) return;
    if (on) draft[n.key] = { checked: true, partialChecked: false };
    else delete draft[n.key];
  });
  return cascadeChecks(nodes, draft);
}

export function allLeafKeys(nodes: TreeNode[] | undefined): string[] {
  const out: string[] = [];
  eachNode(nodes, (n) => { if (!n.children || !n.children.length) out.push(n.key); });
  return out;
}

/** Removes a node by path and inserts it at another; returns a new tree. */
export function moveNode(
  nodes: TreeNode[],
  from: number[],
  to: { path: number[]; position: 'before' | 'after' | 'inside' },
): TreeNode[] {
  const clone = JSON.parse(JSON.stringify(nodes)) as TreeNode[];
  const listAt = (path: number[]): TreeNode[] => {
    let list = clone;
    for (let i = 0; i < path.length - 1; i++) {
      const n = list[path[i]];
      if (!n.children) n.children = [];
      list = n.children;
    }
    return list;
  };
  const fromList = listAt(from);
  const [moved] = fromList.splice(from[from.length - 1], 1);
  if (!moved) return nodes;

  // the source index shifts anything after it in the same list
  const target = to.path.slice();
  if (from.length === target.length && from.slice(0, -1).join() === target.slice(0, -1).join()
    && from[from.length - 1] < target[target.length - 1]) {
    target[target.length - 1] -= 1;
  }

  if (to.position === 'inside') {
    let list = clone;
    for (let i = 0; i < target.length - 1; i++) list = list[target[i]].children || [];
    const parent = list[target[target.length - 1]];
    if (!parent) return nodes;
    if (!parent.children) parent.children = [];
    parent.children.push(moved);
  } else {
    const toList = listAt(target);
    const at = target[target.length - 1] + (to.position === 'after' ? 1 : 0);
    toList.splice(Math.max(0, at), 0, moved);
  }
  return clone;
}

/** Removes the node at a path; returns a new tree. */
export function removeNode(nodes: TreeNode[], path: number[]): TreeNode[] {
  const clone = JSON.parse(JSON.stringify(nodes)) as TreeNode[];
  let list = clone;
  for (let i = 0; i < path.length - 1; i++) {
    const n = list[path[i]];
    if (!n || !n.children) return nodes;
    list = n.children;
  }
  list.splice(path[path.length - 1], 1);
  return clone;
}

/* ── tabular helpers, for ApexTreeTable ─────────────────── */

import { cellValue, formatCell, type ColumnDef, type SortMeta } from './table';

/** A node's row fields live on `data`; columns read from there. */
export const rowOf = (node: TreeNode): Record<string, unknown> =>
  (node.data as Record<string, unknown>) || {};

const compareValues = (a: unknown, b: unknown): number => {
  const empty = (v: unknown) => v == null || v === '';
  if (a === b) return 0;
  if (empty(a)) return 1;
  if (empty(b)) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  const na = Number(a), nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
};

/** Sorts siblings at every level, so the hierarchy is preserved. */
export function sortTree(nodes: TreeNode[], meta: SortMeta[], columns: ColumnDef[]): TreeNode[] {
  const active = meta.filter((m) => m.field && m.order);
  if (!active.length) return nodes;
  const colOf = (field: string) => columns.find((c) => c.field === field);
  const sortLevel = (list: TreeNode[]): TreeNode[] => {
    const keyed = list.map((node) => ({
      node,
      keys: active.map((m) => {
        const col = colOf(m.field);
        return col ? cellValue(rowOf(node), col) : rowOf(node)[m.field];
      }),
    }));
    keyed.sort((x, y) => {
      for (let i = 0; i < active.length; i++) {
        const r = compareValues(x.keys[i], y.keys[i]);
        if (r) return r * (active[i].order as number);
      }
      return 0;
    });
    return keyed.map((k) => (k.node.children && k.node.children.length
      ? { ...k.node, children: sortLevel(k.node.children) }
      : k.node));
  };
  return sortLevel(nodes);
}

/**
 * Column and global filtering over a tree. In `lenient` mode a matching node keeps
 * its whole subtree; in `strict` only matching nodes survive, plus the ancestors
 * needed to reach them.
 */
export function filterTreeRows(
  nodes: TreeNode[],
  filters: Record<string, { value?: unknown; matchMode?: string }>,
  columns: ColumnDef[],
  mode: 'lenient' | 'strict' = 'lenient',
): TreeNode[] {
  const perField = Object.entries(filters).filter(([k, m]) => k !== 'global' && m && m.value != null && m.value !== ''
    && !(Array.isArray(m.value) && !m.value.length));
  const global = filters.global;
  const globalOn = !!(global && global.value != null && global.value !== '');
  if (!perField.length && !globalOn) return nodes;

  const norm = (v: unknown) => String(v ?? '').toLowerCase();
  const colOf = (field: string) => columns.find((c) => c.field === field);
  const hit = (node: TreeNode) => {
    const row = rowOf(node);
    for (const [field, meta] of perField) {
      const col = colOf(field);
      const v = col ? cellValue(row, col) : row[field];
      const f = meta.value;
      const ok = meta.matchMode === 'equals' ? String(v ?? '') === String(f)
        : meta.matchMode === 'startsWith' ? norm(v).startsWith(norm(f))
          : Array.isArray(f) ? f.some((x) => String(x) === String(v))
            : norm(v).includes(norm(f));
      if (!ok) return false;
    }
    if (globalOn) {
      const q = norm(global!.value);
      const anywhere = columns.some((col) => norm(col.field ? cellValue(row, col) : '').includes(q));
      if (!anywhere) return false;
    }
    return true;
  };

  const walk = (list: TreeNode[]): TreeNode[] => list.reduce<TreeNode[]>((acc, n) => {
    const self = hit(n);
    const kids = walk(n.children || []);
    if (self && mode === 'lenient') acc.push(n);
    else if (self || kids.length) acc.push({ ...n, children: kids });
    return acc;
  }, []);
  return walk(nodes);
}

/** Footer aggregate over every node in the tree, or only the leaves. */
export function aggregateTree(
  nodes: TreeNode[],
  col: ColumnDef,
  fn: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'distinct',
  leavesOnly = true,
): number | null {
  const rows: Record<string, unknown>[] = [];
  eachNode(nodes, (n) => {
    if (!leavesOnly || !n.children || !n.children.length) rows.push(rowOf(n));
  });
  if (!rows.length) return null;
  if (fn === 'count') return rows.length;
  if (fn === 'distinct') return new Set(rows.map((r) => String(cellValue(r, col)))).size;
  const nums = rows.map((r) => Number(cellValue(r, col))).filter((n) => Number.isFinite(n));
  if (!nums.length) return null;
  if (fn === 'sum') return nums.reduce((a, b) => a + b, 0);
  if (fn === 'avg') return nums.reduce((a, b) => a + b, 0) / nums.length;
  if (fn === 'min') return Math.min(...nums);
  return Math.max(...nums);
}

export { formatCell };
