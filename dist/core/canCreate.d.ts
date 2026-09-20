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
 *
 * Now a thin call onto `useCan`, which asks the same question about any
 * action. Kept under its own name because six controls and any app wiring
 * already use it, and because "may this chooser offer Add new" reads better at
 * a call site than the general form. Delegating rather than duplicating is
 * what lets an app that registered only the general `can` resolver gate these
 * six as well.
 */
export declare function useCanCreate(): (explicit?: boolean, resource?: string) => boolean;
