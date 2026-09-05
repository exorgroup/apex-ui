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

/** Who may do what. Deliberately small and readable, not a real policy. */
const GRANTS: Record<DocsRole, string[]> = {
  Admin: ['read', 'update', 'delete', 'export'],
  Coordinator: ['read', 'update', 'export'],
  Viewer: ['read'],
};

export function docsCan(action: string, _resource: string): boolean {
  /* An empty action means the caller asked without naming one — nothing to
     check, so nothing is hidden. Matches useCan's own default. */
  if (!action) return true;
  return GRANTS[docsRole.value].includes(action);
}
