import { inject } from 'vue';
import { APEX_UI_OPTIONS } from './symbols';
import type { ApexUiOptions } from '../types';

/**
 * Resolves whether a chooser may show its "Add new" row.
 *
 * Precedence, in one line: an explicit `canAddNew` prop wins; otherwise the
 * app-level `canCreate` resolver is asked about this control's `resource`;
 * otherwise the row shows. So the feature works with nothing registered, and
 * an app that wires a resolver once gets every chooser gated without touching
 * any call site.
 *
 * The row is hidden rather than disabled when the answer is no — a greyed-out
 * "Add new" still tells someone the feature exists and that they are not
 * allowed to use it, which is rarely what you want.
 */
export function useCanCreate() {
  const opts = inject<ApexUiOptions>(APEX_UI_OPTIONS, {});

  return function canCreate(explicit?: boolean, resource?: string): boolean {
    if (explicit !== undefined) return explicit;
    if (opts.canCreate && resource) return !!opts.canCreate(resource);
    return true;
  };
}
