import { ref } from 'vue';
import { useApexAlert, useApexDialog } from '@exorgroup/apex-ui';
import CityPicker from './CityPicker.vue';
import { CITIES } from '../registry';

/**
 * State shared by the ApexDynamicDialog and ApexConfirmPopup demos.
 *
 * Both appear twice on their page: once in the playground stage, once in a
 * section further down — which is how the gallery has them too. Each pair must
 * report through the SAME "Last outcome" line, so the state cannot live in
 * either component. Holding it here means the stage and the section are two
 * views of one demo rather than two demos that happen to look alike.
 *
 * Module-level refs rather than a composable: there is exactly one docs app,
 * and a factory returning fresh state per caller would reintroduce the split
 * this exists to avoid.
 */

/* ── ApexDynamicDialog ───────────────────────────────────────────────── */

/** What the last dialog returned, or that it was dismissed. */
export const dynLog = ref('');

/**
 * Open CityPicker through the service.
 *
 * Ported from the gallery, which is better than the version this replaced in
 * two ways. `contentProps` carries a note — a prop of the loaded component,
 * distinct from the ApexDialog props around it, and nothing else here
 * demonstrated it. And `nested` opens ONE draggable dialog inviting you to
 * open another over it, rather than forcing two: the reader drives the stack,
 * and can drag the first aside to see both. The picker's own button does the
 * opening, which is what a picker-over-a-form actually is.
 */
export function openDynamic(kind?: 'nested') {
  const dialog = useApexDialog();
  dialog.open(CityPicker, {
    props: kind === 'nested'
      ? { header: 'Pick a city', subtitle: 'Then open another over it', width: '380px', draggable: true }
      : { header: 'Pick a city', width: '380px', dismissableMask: true },
    contentProps: { note: kind === 'nested' ? 'Dialogs stack — the second opens above this one.' : '' },
    data: { cities: CITIES },
    onClose({ data }: { data?: unknown }) {
      const city = data as { label?: string } | undefined;
      dynLog.value = city ? `closed with ${city.label}` : 'dismissed';
    },
  });
}

/* ── ApexConfirmPopup ────────────────────────────────────────────────── */

/** What the last confirmation resolved to. */
export const cfmLog = ref('');

/**
 * Ask through the alert service.
 *
 * Every option is an AlertOptions field; `target` is the one that decides
 * where the request lands — with it the popup answers, without it ApexAlert
 * does. accept and reject are supplied here rather than per call site so the
 * stage and every section report through the same line.
 */
export function askConfirm(options: Record<string, unknown>) {
  const alert = useApexAlert();
  alert.confirm({
    ...options,
    accept: () => { cfmLog.value = 'accepted'; },
    reject: () => { cfmLog.value = 'rejected'; },
  });
}
