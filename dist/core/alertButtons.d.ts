import { type ComputedRef } from 'vue';
import { type AlertButton } from './alert';
/**
 * The button row for the current request, shared by both hosts.
 *
 * ApexAlert and ApexConfirmPopup answer the same request — one carries a
 * `target` and one does not — so they must offer the same buttons, gated the
 * same way. Building it twice would drift the first time either gained a case,
 * and the drift would be silent: both would still render buttons.
 *
 * A composable rather than a plain function because the permission resolver is
 * injected, which only works during setup.
 */
export declare function useAlertButtons(fallbacks?: {
    acceptLabel?: string;
    rejectLabel?: string;
}): ComputedRef<AlertButton[]>;
