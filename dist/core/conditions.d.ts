import type { ApexCondition } from '../types';
export declare function getPath(scope: Record<string, unknown>, path?: string): unknown;
/**
 * Evaluate a condition against a scope. `field` defaults to `'value'` so a
 * standalone control can express `{ eq: 3 }`.
 */
export declare function evalCondition(cond: ApexCondition | undefined | null, scope: Record<string, unknown>): boolean;
