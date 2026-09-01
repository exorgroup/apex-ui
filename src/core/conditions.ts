import type { ApexCondition } from '../types';

const isEmpty = (v: unknown) => v == null || v === '' || (Array.isArray(v) && v.length === 0);

export function getPath(scope: Record<string, unknown>, path?: string): unknown {
  if (!path) return undefined;
  return path.split('.').reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), scope);
}

/**
 * Evaluate a condition against a scope. `field` defaults to `'value'` so a
 * standalone control can express `{ eq: 3 }`.
 */
export function evalCondition(cond: ApexCondition | undefined | null, scope: Record<string, unknown>): boolean {
  if (!cond) return true;
  if (cond.all) return cond.all.every((c) => evalCondition(c, scope));
  if (cond.any) return cond.any.some((c) => evalCondition(c, scope));
  if (cond.not) return !evalCondition(cond.not, scope);

  const v = getPath(scope, cond.field ?? 'value');
  const num = (x: unknown) => Number(x);

  if ('eq' in cond) return v === cond.eq;
  if ('ne' in cond) return v !== cond.ne;
  if ('gt' in cond) return num(v) > num(cond.gt);
  if ('gte' in cond) return num(v) >= num(cond.gte);
  if ('lt' in cond) return num(v) < num(cond.lt);
  if ('lte' in cond) return num(v) <= num(cond.lte);
  if ('in' in cond) return Array.isArray(cond.in) && cond.in.includes(v);
  if ('nin' in cond) return Array.isArray(cond.nin) && !cond.nin.includes(v);
  if ('includes' in cond) return Array.isArray(v) && v.includes(cond.includes);
  if ('truthy' in cond) return cond.truthy ? !!v : !v;
  if ('falsy' in cond) return cond.falsy ? !v : !!v;
  if ('empty' in cond) return cond.empty ? isEmpty(v) : !isEmpty(v);
  if ('matches' in cond) return new RegExp(String(cond.matches)).test(String(v ?? ''));

  const t = cond.value;
  switch (cond.op ?? 'eq') {
    case 'eq': return v === t;
    case 'ne': return v !== t;
    case 'gt': return num(v) > num(t);
    case 'gte': return num(v) >= num(t);
    case 'lt': return num(v) < num(t);
    case 'lte': return num(v) <= num(t);
    case 'in': return Array.isArray(t) && t.includes(v);
    case 'nin': return Array.isArray(t) && !t.includes(v);
    case 'includes': return Array.isArray(v) && v.includes(t);
    case 'truthy': return !!v;
    case 'falsy': return !v;
    case 'empty': return isEmpty(v);
    case 'notEmpty': return !isEmpty(v);
    case 'matches': return new RegExp(String(t)).test(String(v ?? ''));
    default: return true;
  }
}
