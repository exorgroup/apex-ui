import { computed, type ComputedRef } from 'vue';
import { useCan } from './can';
import { useApexI18n } from './i18n';
import { __alertState, type AlertButton } from './alert';

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
export function useAlertButtons(fallbacks: {
  acceptLabel?: string;
  rejectLabel?: string;
} = {}): ComputedRef<AlertButton[]> {
  const can = useCan();
  const t = useApexI18n();
  const state = __alertState;

  return computed<AlertButton[]>(() => {
    /* A caller-supplied set replaces the default pair outright. */
    const list: AlertButton[] = state.buttons ? [...state.buttons] : [];

    if (!state.buttons) {
      /* A reject only when there is something to decline: a report has
         nothing to say no to. */
      const reject = state.cancelText ?? fallbacks.rejectLabel;
      if (reject) {
        list.push({
          label: reject,
          icon: state.rejectIcon,
          severity: state.rejectSeverity ?? 'secondary',
          role: 'reject',
        });
      }
      list.push({
        label: state.confirmText
          ?? state.acceptLabel
          ?? fallbacks.acceptLabel
          ?? t(state.stage === 'result' ? 'apexui.alert.ok' : 'apexui.alert.yes'),
        icon: state.acceptIcon,
        severity: state.acceptSeverity ?? (state.tone === 'danger' ? 'danger' : 'primary'),
        role: 'accept',
      });
    }

    /* Hidden rather than disabled, like every other gated control: a greyed-out
       Delete still tells someone the action exists and that they may not have
       it. Presentation only — the endpoint behind it must still check. */
    return list.filter((b) => (b.visible !== undefined ? b.visible : can(b.can ?? '', b.resource)));
  });
}
