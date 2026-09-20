/**
 * Data pipeline for ApexDataTable: field access, formula columns, comparison,
 * sorting, filtering, grouping and aggregation.
 *
 * Everything here is a pure function over plain arrays, so the component can
 * run the whole pipeline inside computeds. The order is always
 * filter → sort → group → window, which keeps large sets to one pass each.
 */

export type SortOrder = 1 | -1 | 0;
export type ColumnAlign = 'start' | 'center' | 'end';

export type FilterMatchMode =
  | 'startsWith' | 'contains' | 'notContains' | 'endsWith' | 'equals' | 'notEquals'
  | 'in' | 'lt' | 'lte' | 'gt' | 'gte' | 'between'
  | 'dateIs' | 'dateIsNot' | 'dateBefore' | 'dateAfter';

export interface FilterConstraint {
  value: unknown;
  matchMode: FilterMatchMode;
}
export interface FilterMeta {
  /** A single constraint, or several joined by `operator`. */
  value?: unknown;
  matchMode?: FilterMatchMode;
  operator?: 'and' | 'or';
  constraints?: FilterConstraint[];
}
export type FilterModel = Record<string, FilterMeta>;

export type AggregateFn = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'distinct';

export interface ColumnDef {
  field?: string;
  header?: string;
  /** Fixed width, e.g. '180px' or '14rem'. */
  width?: string;
  minWidth?: string;
  align?: ColumnAlign;
  sortable?: boolean;
  /** Column is filterable, and how its editor should behave. */
  filter?: boolean;
  filterType?: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'boolean';
  filterOptions?: Array<{ value: unknown; label: string }>;
  filterMatchMode?: FilterMatchMode;
  /** Pin during horizontal scroll. */
  frozen?: boolean;
  alignFrozen?: 'left' | 'right';
  /** Hide without removing from the model — drives the column toggle. */
  hidden?: boolean;
  /** Never offered in the column toggle. */
  fixed?: boolean;
  resizable?: boolean;
  reorderable?: boolean;
  editable?: boolean;
  editorType?: 'text' | 'number' | 'select' | 'date' | 'switch' | 'textarea';
  editorOptions?: Array<{ value: unknown; label: string }>;
  /** For format: 'image' — the rendered thumbnail. */
  imageSize?: number;
  imageRadius?: string;
  /** Field holding the alt text, or a literal. */
  imageAlt?: string;
  /** Second line under an image or text cell, e.g. a SKU. */
  subField?: string;
  /** Cell display format. */
  format?: 'text' | 'number' | 'currency' | 'percent' | 'date' | 'datetime' | 'badge' | 'rating' | 'boolean' | 'image';
  currency?: string;
  precision?: number;
  dateFormat?: string;
  /** Spreadsheet-style formula over sibling fields, e.g. '=qty*price/1.5'. */
  formula?: string;
  /** Footer aggregate for this column. */
  aggregate?: AggregateFn;
  /** Per-group aggregate when grouping is on. Defaults to `aggregate`. */
  groupAggregate?: AggregateFn;
  /** Column-level colours. */
  color?: string;
  background?: string;
  headerBackground?: string;
  /** Extra class on every body cell. */
  cellClass?: string | ((row: Record<string, unknown>) => string | undefined);
  /** Column type flags used by the shell. */
  type?: 'data' | 'selection' | 'expander' | 'rowEditor' | 'reorder';
  /** Badge tone map, for format: 'badge'. */
  badgeTones?: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'>;
}

export interface SortMeta { field: string; order: SortOrder }

const EMPTY = (v: unknown) => v == null || v === '';

/** Dotted-path read. */
export function getField(row: Record<string, unknown> | undefined, path?: string): unknown {
  if (!row || !path) return undefined;
  if (path.indexOf('.') < 0) return row[path];
  return path.split('.').reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), row);
}

/** Dotted-path write, creating intermediate objects. */
export function setField(row: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.');
  const last = parts.pop() as string;
  let target: Record<string, unknown> = row;
  parts.forEach((k) => {
    if (typeof target[k] !== 'object' || target[k] == null) target[k] = {};
    target = target[k] as Record<string, unknown>;
  });
  target[last] = value;
}

/**
 * Evaluates a formula column. Identifiers resolve to sibling fields; only
 * arithmetic, parentheses and a small function set are allowed, so nothing
 * from the row can execute.
 */
const FORMULA_FNS = ['min', 'max', 'abs', 'round', 'floor', 'ceil'];

export function evalFormula(formula: string, row: Record<string, unknown>): number | null {
  const body = formula.trim().replace(/^=/, '');
  const names: string[] = [];
  const safe = body.replace(/[A-Za-z_][A-Za-z0-9_.]*/g, (id) => {
    if (FORMULA_FNS.includes(id)) return 'Math.' + id;
    if (!names.includes(id)) names.push(id);
    return '__v' + names.indexOf(id);
  });
  // whitelist: numbers, operators, parens, commas, our placeholders and Math.*
  if (!/^[\s\d.,+\-*/%()]*$/.test(safe.replace(/__v\d+/g, '').replace(/Math\.\w+/g, ''))) return null;
  const args = names.map((id) => {
    const n = Number(getField(row, id));
    return Number.isFinite(n) ? n : 0;
  });
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(...names.map((_, i) => '__v' + i), `"use strict";return (${safe});`);
    const out = fn(...args);
    return typeof out === 'number' && Number.isFinite(out) ? out : null;
  } catch { return null; }
}

/** The displayed value for a cell, formula columns included. */
export function cellValue(row: Record<string, unknown>, col: ColumnDef): unknown {
  if (col.formula) return evalFormula(col.formula, row);
  return getField(row, col.field);
}

/* ── sorting ────────────────────────────────────────────── */

function compare(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (EMPTY(a)) return 1;   // empties sink, in both directions
  if (EMPTY(b)) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'boolean' || typeof b === 'boolean') return (a ? 1 : 0) - (b ? 1 : 0);
  const na = Number(a), nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

export function sortRows(
  rows: Record<string, unknown>[],
  meta: SortMeta[],
  columns: ColumnDef[],
): Record<string, unknown>[] {
  const active = meta.filter((m) => m.field && m.order);
  if (!active.length) return rows;
  const colOf = (field: string) => columns.find((c) => c.field === field);
  // decorate-sort-undecorate: one value read per row per key, not one per comparison
  const keyed = rows.map((row) => ({
    row,
    keys: active.map((m) => {
      const col = colOf(m.field);
      return col ? cellValue(row, col) : getField(row, m.field);
    }),
  }));
  keyed.sort((x, y) => {
    for (let i = 0; i < active.length; i++) {
      const c = compare(x.keys[i], y.keys[i]);
      if (c) return c * (active[i].order as number);
    }
    return 0;
  });
  return keyed.map((k) => k.row);
}

/** Cycles a header through ascending → descending → unsorted (or back to ascending). */
export function nextOrder(current: SortOrder, removable: boolean): SortOrder {
  if (current === 1) return -1;
  if (current === -1) return removable ? 0 : 1;
  return 1;
}

/* ── filtering ──────────────────────────────────────────── */

const norm = (v: unknown) => String(v ?? '').toLowerCase();
const day = (v: unknown) => {
  const d = v instanceof Date ? v : new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

export function matches(value: unknown, filter: unknown, mode: FilterMatchMode): boolean {
  if (filter == null || filter === '' || (Array.isArray(filter) && !filter.length)) return true;
  switch (mode) {
    case 'startsWith': return norm(value).startsWith(norm(filter));
    case 'endsWith': return norm(value).endsWith(norm(filter));
    case 'contains': return norm(value).includes(norm(filter));
    case 'notContains': return !norm(value).includes(norm(filter));
    case 'equals': return Array.isArray(filter) ? filter.includes(value) : String(value ?? '') === String(filter);
    case 'notEquals': return String(value ?? '') !== String(filter);
    case 'in': return Array.isArray(filter) ? filter.some((f) => String(f) === String(value)) : false;
    case 'lt': return Number(value) < Number(filter);
    case 'lte': return Number(value) <= Number(filter);
    case 'gt': return Number(value) > Number(filter);
    case 'gte': return Number(value) >= Number(filter);
    case 'between': {
      const [lo, hi] = Array.isArray(filter) ? filter : [null, null];

      /* Numbers OR dates. It was `Number(value)` alone, which turns "2026-09-20" into NaN and
         makes every comparison false — so a date range silently matched everything instead of
         filtering. A range is the commonest thing to want from a date column, so it has to be
         one of the two shapes this understands.

         The bounds decide which: if either one parses as a date and does NOT parse as a
         number, both sides are compared as whole DAYS. That keeps `2026-09-20` inclusive at
         both ends, which is what somebody typing two dates means. */
      const dateish = (v: unknown) => v != null && v !== '' && Number.isNaN(Number(v)) && day(v) != null;

      if (dateish(lo) || dateish(hi)) {
        const v = day(value);
        if (v == null) return false;
        if (lo != null && lo !== '' && day(lo) != null && v < (day(lo) as number)) return false;
        if (hi != null && hi !== '' && day(hi) != null && v > (day(hi) as number)) return false;
        return true;
      }

      const n = Number(value);
      if (lo != null && lo !== '' && n < Number(lo)) return false;
      if (hi != null && hi !== '' && n > Number(hi)) return false;
      return true;
    }
    case 'dateIs': return day(value) === day(filter);
    case 'dateIsNot': return day(value) !== day(filter);
    case 'dateBefore': { const a = day(value), b = day(filter); return a != null && b != null && a < b; }
    case 'dateAfter': { const a = day(value), b = day(filter); return a != null && b != null && a > b; }
    default: return true;
  }
}

function passesMeta(value: unknown, meta: FilterMeta): boolean {
  if (meta.constraints && meta.constraints.length) {
    const live = meta.constraints.filter((c) => c.value != null && c.value !== '');
    if (!live.length) return true;
    return meta.operator === 'or'
      ? live.some((c) => matches(value, c.value, c.matchMode))
      : live.every((c) => matches(value, c.value, c.matchMode));
  }
  return matches(value, meta.value, meta.matchMode || 'contains');
}

export function filterRows(
  rows: Record<string, unknown>[],
  filters: FilterModel,
  columns: ColumnDef[],
  globalFields?: string[],
): Record<string, unknown>[] {
  const perField = Object.entries(filters).filter(([k]) => k !== 'global');
  const global = filters.global;
  const globalActive = !!(global && global.value != null && global.value !== '');
  const live = perField.filter(([, meta]) => {
    if (meta.constraints) return meta.constraints.some((c) => c.value != null && c.value !== '');
    return meta.value != null && meta.value !== '' && !(Array.isArray(meta.value) && !meta.value.length);
  });
  if (!live.length && !globalActive) return rows;

  const colOf = (field: string) => columns.find((c) => c.field === field);
  const gFields = globalFields && globalFields.length
    ? globalFields
    : columns.filter((c) => c.field && !c.formula).map((c) => c.field as string);
  const gQuery = globalActive ? norm(global!.value) : '';

  return rows.filter((row) => {
    for (const [field, meta] of live) {
      const col = colOf(field);
      const v = col ? cellValue(row, col) : getField(row, field);
      if (!passesMeta(v, meta)) return false;
    }
    if (globalActive) {
      let hit = false;
      for (const f of gFields) {
        if (norm(getField(row, f)).includes(gQuery)) { hit = true; break; }
      }
      if (!hit) return false;
    }
    return true;
  });
}

/* ── aggregation ────────────────────────────────────────── */

export function aggregate(rows: Record<string, unknown>[], col: ColumnDef, fn?: AggregateFn): number | null {
  const mode = fn || col.aggregate;
  if (!mode || !rows.length) return null;
  if (mode === 'count') return rows.length;
  if (mode === 'distinct') return new Set(rows.map((r) => String(cellValue(r, col)))).size;
  const nums = rows.map((r) => Number(cellValue(r, col))).filter((n) => Number.isFinite(n));
  if (!nums.length) return null;
  switch (mode) {
    case 'sum': return nums.reduce((a, b) => a + b, 0);
    case 'avg': return nums.reduce((a, b) => a + b, 0) / nums.length;
    case 'min': return Math.min(...nums);
    case 'max': return Math.max(...nums);
    default: return null;
  }
}

/* ── grouping ───────────────────────────────────────────── */

export interface RowGroup {
  key: string;
  value: unknown;
  rows: Record<string, unknown>[];
  /** Index of this group's first row in the flat, sorted list. */
  start: number;
}

export function groupRows(rows: Record<string, unknown>[], field?: string): RowGroup[] {
  if (!field) return [];
  const out: RowGroup[] = [];
  let current: RowGroup | null = null;
  rows.forEach((row, i) => {
    const v = getField(row, field);
    const key = String(v ?? '');
    if (!current || current.key !== key) {
      current = { key, value: v, rows: [row], start: i };
      out.push(current);
    } else {
      current.rows.push(row);
    }
  });
  return out;
}

/* ── formatting ─────────────────────────────────────────── */

export function formatCell(value: unknown, col: ColumnDef, locale?: string): string {
  if (value == null || value === '') return '';
  switch (col.format) {
    case 'number':
      return Number(value).toLocaleString(locale, {
        minimumFractionDigits: col.precision ?? 0, maximumFractionDigits: col.precision ?? 2,
      });
    case 'currency':
      return Number(value).toLocaleString(locale, {
        style: 'currency', currency: col.currency || 'EUR',
        minimumFractionDigits: col.precision ?? 2, maximumFractionDigits: col.precision ?? 2,
      });
    case 'percent':
      return Number(value).toLocaleString(locale, {
        style: 'percent', minimumFractionDigits: col.precision ?? 0, maximumFractionDigits: col.precision ?? 1,
      });
    case 'date': {
      const d = value instanceof Date ? value : new Date(String(value));
      return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString(locale);
    }
    case 'datetime': {
      const d = value instanceof Date ? value : new Date(String(value));
      return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString(locale);
    }
    case 'boolean': return value ? 'Yes' : 'No';
    default: return String(value);
  }
}
