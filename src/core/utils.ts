import type { ApexOption, ApexOptionsInput } from '../types';

/** Accepts ['a','b'] or [{value,label,help,icon,disabled}] and returns the object form. */
export function normaliseOptions<V = unknown>(input?: ApexOptionsInput<V>): ApexOption<V>[] {
  if (!input) return [];
  return input.map((o) =>
    typeof o === 'object' && o !== null && 'value' in o
      ? (o as ApexOption<V>)
      : ({ value: o as unknown as V, label: String(o) } as ApexOption<V>),
  );
}

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export function applyTransform(v: string, t?: 'lower' | 'upper' | 'slug' | 'trim'): string {
  switch (t) {
    case 'lower': return v.toLowerCase();
    case 'upper': return v.toUpperCase();
    case 'slug': return slugify(v);
    case 'trim': return v.trim();
    default: return v;
  }
}

export const TONE_ICON: Record<string, string> = {
  danger: 'error',
  warning: 'warning',
  success: 'check_circle',
  default: '',
};

export const APEX_FIELD_KEYS = [
  'label', 'labelIcon', 'labelPlacement', 'labelWidth', 'help', 'error', 'warning', 'success',
  'tone', 'rules', 'context', 'required', 'disabled', 'readonly', 'size', 'statusIcon', 'id', 'name',
] as const;

/** Picks only the ApexField props out of a control's props, so nothing leaks onto the DOM. */
export function pickFieldProps<T extends Record<string, unknown>>(props: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  APEX_FIELD_KEYS.forEach((k) => { if (props[k] !== undefined) out[k] = props[k]; });
  return out;
}
