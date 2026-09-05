import { inject } from 'vue';
import { APEX_UI_OPTIONS } from './symbols';
import type { ApexUiOptions } from '../types';

/**
 * Resolves whether the user may take an action on a resource.
 *
 * The general form of `useCanCreate`, which asks the same question about one
 * fixed action. Precedence is the same, and deliberately so: an explicit prop
 * wins; otherwise the app-level resolver is asked; otherwise the answer is
 * yes. Defaulting to yes is what lets the feature exist without every app
 * having to wire a resolver first — a library that denied by default would
 * blank out controls in every app that had not opted in yet, including this
 * one's own tests.
 *
 * Hidden rather than disabled, again matching the "Add new" row: a greyed-out
 * Delete still tells someone the action exists and that they may not have it.
 *
 * This is presentation, not authorisation. Nothing here stops the action being
 * invoked — it is not in the request path at all. The endpoint behind the
 * button is what has to authorise the request.
 */
export function useCan() {
  const opts = inject<ApexUiOptions>(APEX_UI_OPTIONS, {});

  return function can(action: string, resource?: string, explicit?: boolean): boolean {
    if (explicit !== undefined) return explicit;
    if (!resource) return true;
    /* canCreate is the older, narrower resolver. An app may have registered it
       alone, so it answers for 'create' before the general one is consulted. */
    if (action === 'create' && opts.canCreate) return !!opts.canCreate(resource);
    if (opts.can) return !!opts.can(action, resource);
    return true;
  };
}
