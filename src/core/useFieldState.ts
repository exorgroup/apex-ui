import { computed, inject, ref, type ComputedRef, type Ref } from 'vue';
import { evalCondition } from './conditions';
import { APEX_UI_OPTIONS } from './symbols';
import type { ApexFieldProps, ApexRule, ApexTone, ApexUiOptions } from '../types';

let uid = 0;
export const nextId = (p = 'apex') => `${p}-${++uid}`;

const first = (e: ApexFieldProps['error']): string | undefined =>
  Array.isArray(e) ? e[0] : e || undefined;

/**
 * Is this control's label the floating kind? — AF2-374.
 *
 * Every control that draws its own placeholder needs to know, because a
 * float label sits INSIDE the box until it rises: the two occupy the same
 * space, so a control either suppresses its placeholder or lifts its label
 * while the label is down.
 *
 * It resolves the placement the SAME WAY `useFieldState` does — the prop,
 * then the app-wide option — and that is the whole reason it exists. Ten
 * controls each computed this from `props.labelPlacement` alone, so the
 * behaviour was right when a field named the placement itself and WRONG
 * when the app set it for every field at once: ApexField drew the label
 * inside (it reads the option) while the control still drew its
 * placeholder (it did not). Both printed in the same place.
 *
 * Reported from a real screen, where "Entity Name" and "Company or person
 * name" were drawn over each other. Invisible to every test here, because
 * a test that mounts one control passes the prop.
 */
export function useFloatLabel(props: Pick<ApexFieldProps, 'labelPlacement'>): ComputedRef<boolean> {
  const opts = inject<ApexUiOptions>(APEX_UI_OPTIONS, {});

  return computed(() => String(props.labelPlacement || opts.labelPlacement || '').startsWith('float'));
}

/**
 * Resolves tone + message for a field.
 * Precedence: explicit `error` > `warning` > `success` > matching `rules` (last wins) > `tone` prop.
 * Rules are conditional FORMATTING, not validation — they never block submit.
 */
export function useFieldState(
  props: ApexFieldProps,
  value: Ref<unknown> | ComputedRef<unknown>,
) {
  const opts = inject<ApexUiOptions>(APEX_UI_OPTIONS, {});
  const id = computed(() => props.id || nextId('apex-f'));
  const focused = ref(false);

  const matched = computed<ApexRule | undefined>(() => {
    const scope = { value: value.value, ...(props.context || {}) };
    let hit: ApexRule | undefined;
    (props.rules || []).forEach((r) => { if (evalCondition(r.when, scope)) hit = r; });
    return hit;
  });

  const tone = computed<ApexTone>(() => {
    if (first(props.error)) return 'danger';
    if (props.warning) return 'warning';
    if (props.success) return 'success';
    if (matched.value?.tone) return matched.value.tone;
    return props.tone || 'default';
  });

  const message = computed<string | undefined>(
    () => first(props.error) || props.warning || props.success || matched.value?.message || props.help || undefined,
  );

  const size = computed(() => props.size || opts.size || 'md');
  const labelPlacement = computed(() => props.labelPlacement || opts.labelPlacement || 'top');
  const invalid = computed(() => tone.value === 'danger');
  const describedBy = computed(() => (message.value ? `${id.value}-msg` : undefined));
  const ruleClass = computed(() => matched.value?.class);

  return { id, tone, message, size, labelPlacement, invalid, describedBy, focused, ruleClass, matched };
}
