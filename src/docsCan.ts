import { ref } from 'vue';

/**
 * A stand-in for the app's permission resolver, so the docs can show gating
 * working rather than describe it.
 *
 * Registered once in main.ts as ApexUI's `can` option — the same seam a real
 * app uses, where the body would call apex-autentica instead of reading this
 * table. Doing it any other way (a `visible` flag computed in the demo) would
 * show the effect while demonstrating the wrong mechanism.
 *
 * The resolver reads `docsRole` on every call, so a computed that asks it
 * tracks the ref and the whole page re-gates the moment the role changes.
 */
export const ROLES = ['Admin', 'Coordinator', 'Viewer'] as const;
export type DocsRole = typeof ROLES[number];

export const docsRole = ref<DocsRole>('Admin');

/**
 * Who may do what, per resource. Deliberately small and readable, not a real
 * policy.
 *
 * Resource-aware because the menu family's shorthand — a bare `can: 'reports'`
 * — resolves to read on that resource, and every role can read *something*. A
 * table keyed on the action alone would answer yes to all of them and the
 * gating demos would show nothing happening.
 *
 * `'*'` is the fallback for a resource not named here, so the pages that gate
 * on action alone keep working.
 */
const GRANTS: Record<DocsRole, Record<string, string[]>> = {
  Admin: {
    '*': ['read', 'update', 'delete', 'export'],
    settings: ['read', 'update', 'delete'],
    reports: ['read', 'export'],
  },
  Coordinator: {
    '*': ['read', 'update', 'export'],
    settings: [],
    reports: ['read'],
  },
  Viewer: {
    '*': ['read'],
    settings: [],
    reports: [],
  },
};

export function docsCan(action: string, resource: string): boolean {
  /* An empty action means the caller asked without naming one — nothing to
     check, so nothing is hidden. Matches useCan's own default. */
  if (!action) return true;
  const table = GRANTS[docsRole.value];
  const allowed = resource && resource in table ? table[resource] : table['*'];
  return allowed.includes(action);
}
